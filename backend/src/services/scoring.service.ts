import logger from '../utils/logger'
import { sendMessage } from './backboard.service'
import {
  calculateEyeContactScore,
  calculateHeadStabilityScore,
  calculatePacingScore,
  calculateFillerWordsScore,
  roundToNearest,
  LandmarkFrame
} from '../utils/scoring.util'

const FILLER_WORDS = ['um', 'uh', 'like', 'er', 'ah', 'you know']

export interface ScoringResult {
  overallScore: number
  eyeContactScore: number
  headStabilityScore: number
  pacingScore: number
  fillerWordsScore: number
  wordCount: number
  fillerWordCount: number
  wpm: number
  durationSeconds: number
  coachingReview: string
}

export const scoringService = {
  /**
   * Merge video facial metrics and transcription metadata to calculate scores and get Atlas feedback
   */
  async scoreSession(
    userId: string,
    gazeFrames: LandmarkFrame[],
    transcriptText: string,
    words: Array<{ word: string; start: number; end: number }>
  ): Promise<ScoringResult> {
    logger.info(`Calculating interview session scores for user ${userId}`)

    // 1. Calculate duration
    let durationSeconds = 0
    if (gazeFrames.length > 0) {
      const firstTimestamp = gazeFrames[0].timestamp
      const lastTimestamp = gazeFrames[gazeFrames.length - 1].timestamp
      durationSeconds = Math.max(1, (lastTimestamp - firstTimestamp) / 1000)
    } else if (words.length > 0) {
      const lastWord = words[words.length - 1]
      durationSeconds = Math.max(1, lastWord.end / 1000)
    } else {
      durationSeconds = 60 // Default to 1 minute fallback
    }

    // 2. Count words and filler words
    const wordCount = words.length
    let fillerWordCount = 0

    // Normalize words for matching
    const normalizedWords = words.map((w) => w.word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').trim())
    normalizedWords.forEach((word) => {
      if (FILLER_WORDS.includes(word)) {
        fillerWordCount++
      }
    })

    // Also scan transcripts for joint phrases like "you know"
    const lowerTranscript = transcriptText.toLowerCase()
    const youKnowMatches = (lowerTranscript.match(/\byou know\b/g) || []).length
    // If we matched you know, count them (avoid double counting by only adding the difference if any,
    // but a simple addition is fine since we treat it as single filler event)
    fillerWordCount += youKnowMatches

    // 3. Compute raw values
    const durationMinutes = durationSeconds / 60
    const wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0

    // 4. Calculate individual metrics using scoring utilities
    const eyeContactScore = calculateEyeContactScore(gazeFrames)
    const headStabilityScore = calculateHeadStabilityScore(gazeFrames)
    const pacingScore = calculatePacingScore(wpm)
    const fillerWordsScore = calculateFillerWordsScore(fillerWordCount, durationSeconds)

    // 5. Calculate overall score (weighted average)
    // Eye Contact: 30%, Head Stability: 20%, Pacing: 25%, Filler Words: 25%
    const rawOverall = (
      (eyeContactScore * 0.3) +
      (headStabilityScore * 0.2) +
      (pacingScore * 0.25) +
      (fillerWordsScore * 0.25)
    )
    const overallScore = Math.max(0, Math.min(100, roundToNearest(rawOverall)))

    logger.info(`Computed Scores: Overall=${overallScore}, EyeContact=${eyeContactScore}, HeadStability=${headStabilityScore}, Pacing=${pacingScore}, FillerWords=${fillerWordsScore}`)

    // 6. Get Atlas coaching review feedback via Backboard
    let coachingReview = ''
    try {
      const atlasPrompt = `You are Atlas, the career coach. The student has just completed a mock interview. Here is the transcript of their responses:
---
${transcriptText}
---
Below are their performance metrics:
- Overall Score: ${overallScore}%
- Eye Contact: ${eyeContactScore}%
- Head Stability: ${headStabilityScore}%
- Speech Pace: ${wpm} WPM (ideal is 120-160 WPM)
- Filler Word Count: ${fillerWordCount} (${fillerWordsScore}% score)

Please provide a highly professional, encouraging, and constructive critique of their responses. Give concrete, actionable tips on structure (e.g. STAR method), tone, and physical presence.`

      const reply = await sendMessage({
        agent: 'atlas',
        userId,
        message: atlasPrompt,
        context: {
          sessionMetrics: {
            overallScore,
            eyeContactScore,
            headStabilityScore,
            pacingScore,
            fillerWordsScore,
            wpm,
            fillerWordCount
          }
        }
      })

      coachingReview = reply.reply
      logger.info('Successfully retrieved coaching review from Atlas agent')
    } catch (error) {
      logger.error('Failed to retrieve coaching review from Atlas agent, using fallback:', error)
      coachingReview = `Great job completing your mock interview! You spoke at ${wpm} WPM and maintained ${eyeContactScore}% eye contact. Focus on reducing filler words and structure your answers using the STAR method (Situation, Task, Action, Result) to sound more professional.`
    }

    return {
      overallScore,
      eyeContactScore,
      headStabilityScore,
      pacingScore,
      fillerWordsScore,
      wordCount,
      fillerWordCount,
      wpm,
      durationSeconds,
      coachingReview
    }
  }
}
