import { useEffect, useState } from 'react'
import { FaceLandmarker } from '@mediapipe/tasks-vision'
import { getModelBlob, initializeFaceLandmarker } from '../lib/mediapipe/loader'

export type LoadingStatus = 'loading' | 'ready' | 'error'

export function useMediaPipe() {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [status, setStatus] = useState<LoadingStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadModel() {
      try {
        console.log('[useMediaPipe] Starting FaceLandmarker initialization...')
        setStatus('loading')
        
        // 1. Fetch cached model blob with progress updates
        const blob = await getModelBlob((pct) => {
          if (active) setProgress(pct)
        })

        if (!active) return

        // 2. Initialize MediaPipe FaceLandmarker
        const landmarkerInstance = await initializeFaceLandmarker(blob)
        
        if (active) {
          setLandmarker(landmarkerInstance)
          setStatus('ready')
          console.log('[useuseMediaPipe] FaceLandmarker loaded and ready')
        }
      } catch (err) {
        console.error('[useMediaPipe] Failed to initialize FaceLandmarker:', err)
        if (active) {
          setError((err as Error).message || 'Failed loading face detection modules')
          setStatus('error')
        }
      }
    }

    loadModel()

    return () => {
      active = false
      if (landmarker) {
        landmarker.close()
      }
    }
  }, [])

  return { landmarker, progress, status, error }
}
