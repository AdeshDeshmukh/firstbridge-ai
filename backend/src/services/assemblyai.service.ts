import fs from 'fs'
import logger from '../utils/logger'

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

export interface AssemblyWord {
  word: string
  start: number
  end: number
  confidence: number
}

export interface AssemblyTranscriptResponse {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text?: string
  words?: AssemblyWord[]
  error?: string
}

export const assemblyAiService = {
  /**
   * Upload local audio file to AssemblyAI and get a temporary URL
   */
  async uploadLocalFile(filePath: string): Promise<string> {
    logger.info(`Uploading local audio file to AssemblyAI: ${filePath}`)
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined in env variables')
    }

    try {
      const fileBuffer = fs.readFileSync(filePath)
      const response = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
        body: fileBuffer,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AssemblyAI file upload failed: ${response.statusText} - ${errorText}`)
      }

      const data = (await response.json()) as { upload_url: string }
      logger.info(`Successfully uploaded audio file to AssemblyAI: ${data.upload_url}`)
      return data.upload_url
    } catch (error) {
      logger.error('Failed uploading file to AssemblyAI:', error)
      throw error
    }
  },

  /**
   * Submit audio url to AssemblyAI for transcription
   */
  async submitTranscription(audioUrl: string): Promise<string> {
    logger.info('Submitting audio file to AssemblyAI for transcription...')
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined in env variables')
    }

    try {
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          disfluencies: true, // Includes filler words like 'um', 'uh', 'like'
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AssemblyAI submission failed: ${response.statusText} - ${errorText}`)
      }

      const data = (await response.json()) as { id: string }
      logger.info(`AssemblyAI transcription job queued with ID: ${data.id}`)
      return data.id
    } catch (error) {
      logger.error('Failed submitting transcription to AssemblyAI:', error)
      throw error
    }
  },

  /**
   * Poll AssemblyAI for transcription results
   */
  async pollTranscription(jobId: string): Promise<AssemblyTranscriptResponse> {
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined in env variables')
    }

    const url = `https://api.assemblyai.com/v2/transcript/${jobId}`
    const headers = { authorization: ASSEMBLYAI_API_KEY }

    logger.info(`Polling AssemblyAI for job status: ${jobId}`)

    // Poll every 3 seconds, up to 40 times (2 minutes max)
    for (let i = 0; i < 40; i++) {
      try {
        const response = await fetch(url, { headers })
        if (!response.ok) {
          throw new Error(`AssemblyAI poll failed with status: ${response.status}`)
        }

        const data = (await response.json()) as AssemblyTranscriptResponse
        logger.info(`AssemblyAI job ${jobId} status: ${data.status}`)

        if (data.status === 'completed') {
          return data
        }

        if (data.status === 'error') {
          throw new Error(`AssemblyAI transcription job failed: ${data.error}`)
        }
      } catch (error) {
        logger.error(`Error polling AssemblyAI for job ${jobId}:`, error)
        throw error
      }

      // Wait 3 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    throw new Error(`AssemblyAI transcription job timed out after 2 minutes (job: ${jobId})`)
  },
}
