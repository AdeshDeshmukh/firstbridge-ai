export interface HeadPose {
  pitch: number
  yaw: number
  roll: number
}

export interface LandmarkFrame {
  timestamp: number
  gazeActive: boolean
  headPose: HeadPose
}

/**
 * Round a value to the nearest step (e.g., 5%)
 */
export function roundToNearest(val: number, step: number = 5): number {
  return Math.round(val / step) * step
}

/**
 * Calculates eye contact score from landmarker frames
 */
export function calculateEyeContactScore(frames: LandmarkFrame[]): number {
  if (!frames || frames.length === 0) return 0

  const activeCount = frames.filter((f) => f.gazeActive).length
  const percentage = (activeCount / frames.length) * 100
  return Math.max(0, Math.min(100, roundToNearest(percentage)))
}

/**
 * Calculates head pose stability score based on average angular deviation (pitch, yaw, roll)
 */
export function calculateHeadStabilityScore(frames: LandmarkFrame[]): number {
  if (!frames || frames.length === 0) return 0

  let totalDeviation = 0
  frames.forEach((f) => {
    // Sum absolute deviation from neutral head position (0, 0, 0)
    const deviation = Math.abs(f.headPose.pitch) + Math.abs(f.headPose.yaw) + Math.abs(f.headPose.roll)
    totalDeviation += deviation
  })

  const averageDeviation = totalDeviation / frames.length
  // Assume average cumulative deviation of 15 degrees is standard movement (100% stability)
  // Scale down score for larger movements
  const score = 100 - Math.max(0, averageDeviation - 15) * 2.5
  return Math.max(0, Math.min(100, roundToNearest(score)))
}

/**
 * Calculates pacing score based on words per minute (WPM).
 * Ideal WPM is between 120 and 160.
 */
export function calculatePacingScore(wpm: number): number {
  if (wpm <= 0) return 0

  const minIdeal = 120
  const maxIdeal = 160

  if (wpm >= minIdeal && wpm <= maxIdeal) {
    return 100
  }

  // Deduct 2 points for each WPM away from the ideal boundary
  const deviation = wpm < minIdeal ? minIdeal - wpm : wpm - maxIdeal
  const score = 100 - deviation * 2
  return Math.max(0, Math.min(100, roundToNearest(score)))
}

/**
 * Calculates filler words score based on filler word density.
 * Ideal is less than 2 filler words per minute.
 */
export function calculateFillerWordsScore(fillerWordCount: number, durationSeconds: number): number {
  const durationMinutes = durationSeconds / 60
  if (durationMinutes <= 0) return 100

  const fillerWordsPerMinute = fillerWordCount / durationMinutes

  // Less than or equal to 2 filler words per minute is ideal (100)
  if (fillerWordsPerMinute <= 2) {
    return 100
  }

  // Deduct 10 points for each filler word per minute beyond 2
  const excess = fillerWordsPerMinute - 2
  const score = 100 - excess * 10
  return Math.max(0, Math.min(100, roundToNearest(score)))
}
