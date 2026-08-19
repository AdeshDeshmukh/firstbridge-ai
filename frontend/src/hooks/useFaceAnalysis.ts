import { useEffect, useState, useRef } from 'react'
import { FaceLandmarker } from '@mediapipe/tasks-vision'
import { checkGazeAlignment } from '../lib/mediapipe/gaze'
import { estimateHeadPose, calculateHeadPoseFromLandmarks, EulerAngles } from '../lib/mediapipe/head-pose'

export interface LandmarkFrame {
  timestamp: number
  gazeActive: boolean
  headPose: EulerAngles
}

interface UseFaceAnalysisProps {
  landmarker: FaceLandmarker | null
  videoRef: React.RefObject<HTMLVideoElement>
  isActive: boolean
}

export function useFaceAnalysis({ landmarker, videoRef, isActive }: UseFaceAnalysisProps) {
  const [isGazeAligned, setIsGazeAligned] = useState<boolean>(true)
  const [headPose, setHeadPose] = useState<EulerAngles>({ pitch: 0, yaw: 0, roll: 0 })
  const framesRef = useRef<LandmarkFrame[]>([])

  useEffect(() => {
    if (!isActive || !landmarker || !videoRef.current) {
      setIsGazeAligned(true)
      setHeadPose({ pitch: 0, yaw: 0, roll: 0 })
      return
    }

    const video = videoRef.current
    framesRef.current = [] // Reset frames

    // Interval loop for inference (500ms interval balances density and device resources)
    const intervalId = setInterval(() => {
      if (video.paused || video.ended) return

      try {
        const timestamp = performance.now()
        const result = landmarker.detectForVideo(video, timestamp)

        if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
          const landmarks = result.faceLandmarks[0]
          
          // 1. Calculate horizontal/vertical gaze alignment
          const gazeAligned = checkGazeAlignment(landmarks)
          setIsGazeAligned(gazeAligned)

          // 2. Estimate head pitch, yaw, and roll
          let pose: EulerAngles = { pitch: 0, yaw: 0, roll: 0 }
          if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
            pose = estimateHeadPose(result.facialTransformationMatrixes[0])
          } else {
            pose = calculateHeadPoseFromLandmarks(landmarks)
          }
          setHeadPose(pose)

          // 3. Accumulate tracking frame data
          framesRef.current.push({
            timestamp: Date.now(),
            gazeActive: gazeAligned,
            headPose: pose,
          })
        } else {
          // Face not detected
          setIsGazeAligned(false)
          setHeadPose({ pitch: 0, yaw: 0, roll: 0 })
          framesRef.current.push({
            timestamp: Date.now(),
            gazeActive: false,
            headPose: { pitch: 0, yaw: 0, roll: 0 },
          })
        }
      } catch (err) {
        console.error('[useFaceAnalysis] Error running video landmark detection:', err)
      }
    }, 500)

    return () => {
      clearInterval(intervalId)
    }
  }, [landmarker, videoRef, isActive])

  const getCollectedFrames = () => framesRef.current

  return { isGazeAligned, headPose, getCollectedFrames }
}
