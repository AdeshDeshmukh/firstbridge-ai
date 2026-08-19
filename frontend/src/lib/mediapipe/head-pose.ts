export interface EulerAngles {
  pitch: number // Looking up/down (degrees)
  yaw: number   // Looking left/right (degrees)
  roll: number  // Tilting head side-to-side (degrees)
}

/**
 * Extract Euler Angles (pitch, yaw, roll in degrees) from a 4x4 transformation matrix
 * supplied directly by MediaPipe FaceLandmarker.
 */
export function estimateHeadPose(matrixObj: any): EulerAngles {
  if (!matrixObj) {
    return { pitch: 0, yaw: 0, roll: 0 }
  }

  // Extract raw numbers array from Matrix object if present
  const matrix = Array.isArray(matrixObj)
    ? matrixObj
    : matrixObj.data
    ? Array.from(matrixObj.data)
    : null

  if (!matrix || matrix.length < 16) {
    return { pitch: 0, yaw: 0, roll: 0 }
  }

  // Next.js MediaPipe Transformation matrix elements
  // Row 0
  const r00 = matrix[0]
  const r02 = matrix[2]
  // Row 1
  const r10 = matrix[4]
  const r11 = matrix[5]
  const r12 = matrix[6]
  // Row 2
  const r20 = matrix[8]
  const r22 = matrix[10]

  // Calculate Euler angles using standard rotation matrix decomposition (XYZ rotation order)
  let pitch = 0
  let yaw = 0
  let roll = 0

  // Pitch (around X axis)
  pitch = Math.asin(-Math.max(-1, Math.min(1, r12)))

  if (Math.abs(r12) < 0.99999) {
    // Yaw (around Y axis)
    yaw = Math.atan2(r02, r22)
    // Roll (around Z axis)
    roll = Math.atan2(r10, r11)
  } else {
    // Gimbal lock case
    yaw = Math.atan2(-r20, r00)
    roll = 0
  }

  // Convert radians to degrees
  const radToDeg = 180 / Math.PI

  return {
    pitch: pitch * radToDeg,
    yaw: yaw * radToDeg,
    roll: roll * radToDeg,
  }
}

/**
 * Fallback head pose calculator based on key landmarks (nose 4, chin 152, left edge 234, right edge 454)
 * if transformation matrix is missing.
 */
export function calculateHeadPoseFromLandmarks(landmarks: { x: number; y: number; z: number }[]): EulerAngles {
  if (!landmarks || landmarks.length < 468) {
    return { pitch: 0, yaw: 0, roll: 0 }
  }

  const nose = landmarks[4]
  const chin = landmarks[152]
  const leftEdge = landmarks[234]
  const rightEdge = landmarks[454]

  if (!nose || !chin || !leftEdge || !rightEdge) {
    return { pitch: 0, yaw: 0, roll: 0 }
  }

  // Estimate yaw based on nose horizontal position between cheeks
  const faceWidth = Math.abs(rightEdge.x - leftEdge.x)
  const noseOffsetLeft = Math.abs(nose.x - leftEdge.x)
  const noseRatio = faceWidth > 0 ? noseOffsetLeft / faceWidth : 0.5
  const yaw = (noseRatio - 0.5) * 90 // scale ratio to degrees

  // Estimate pitch based on nose vertical position relative to face length
  const faceHeight = Math.abs(chin.y - landmarks[10].y) // 10 is forehead top
  const noseOffsetTop = Math.abs(nose.y - landmarks[10].y)
  const pitchRatio = faceHeight > 0 ? noseOffsetTop / faceHeight : 0.45
  const pitch = (pitchRatio - 0.45) * 90

  // Estimate roll based on slope of eyes (landmarks 33 and 263)
  const eyeLeft = landmarks[33]
  const eyeRight = landmarks[263]
  const dx = eyeRight.x - eyeLeft.x
  const dy = eyeRight.y - eyeLeft.y
  const roll = dx !== 0 ? Math.atan(dy / dx) * (180 / Math.PI) : 0

  return { pitch, yaw, roll }
}
