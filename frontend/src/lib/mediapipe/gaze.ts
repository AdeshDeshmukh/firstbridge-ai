export interface Point3D {
  x: number
  y: number
  z: number
}

/**
 * Calculates Euclidean distance between two 3D points
 */
function getDistance(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2))
}

/**
 * Check if eye gaze is aligned (looking within ~15 degrees of the camera)
 * Landmarks used:
 * - Left eye: inner corner (133), outer corner (33), iris center (468)
 * - Right eye: inner corner (362), outer corner (263), iris center (473)
 */
export function checkGazeAlignment(landmarks: Point3D[]): boolean {
  if (!landmarks || landmarks.length < 478) {
    return false
  }

  // 1. Extract Left Eye key points
  const leftOuter = landmarks[33]
  const leftInner = landmarks[133]
  const leftIris = landmarks[468]

  // 2. Extract Right Eye key points
  const rightOuter = landmarks[263]
  const rightInner = landmarks[362]
  const rightIris = landmarks[473]

  if (!leftOuter || !leftInner || !leftIris || !rightOuter || !rightInner || !rightIris) {
    return false
  }

  // 3. Compute Left Iris horizontal ratio
  const leftTotalWidth = getDistance(leftOuter, leftInner)
  const leftIrisOffset = getDistance(leftOuter, leftIris)
  const leftRatio = leftTotalWidth > 0 ? leftIrisOffset / leftTotalWidth : 0.5

  // 4. Compute Right Iris horizontal ratio
  const rightTotalWidth = getDistance(rightOuter, rightInner)
  const rightIrisOffset = getDistance(rightOuter, rightIris)
  const rightRatio = rightTotalWidth > 0 ? rightIrisOffset / rightTotalWidth : 0.5

  // 5. Normal center ranges for direct focus (standard 0.38 to 0.62)
  const minThreshold = 0.38
  const maxThreshold = 0.62

  const leftAligned = leftRatio >= minThreshold && leftRatio <= maxThreshold
  const rightAligned = rightRatio >= minThreshold && rightRatio <= maxThreshold

  // Return true if both eyes are aligned focusing towards camera center
  return leftAligned && rightAligned
}
