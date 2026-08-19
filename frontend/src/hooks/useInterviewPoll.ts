import { useEffect, useState } from 'react'
import { apiClient } from '../lib/api-client'

export type SessionStatus = 'processing' | 'completed' | 'failed' | 'idle'

export function useInterviewPoll(sessionId: string | null) {
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('idle')
      return
    }

    let active = true
    let delay = 3000 // Start polling at 3 seconds
    let timeoutId: NodeJS.Timeout

    async function poll() {
      try {
        console.log(`[useInterviewPoll] Polling session status for: ${sessionId}`)
        const response = await apiClient<{ success: boolean; status: SessionStatus }>(
          `/interview/${sessionId}/status`
        )

        if (!active) return

        const currentStatus = response.status
        setStatus(currentStatus)

        if (currentStatus === 'completed' || currentStatus === 'failed') {
          console.log(`[useInterviewPoll] Polling ended with final status: ${currentStatus}`)
          return
        }

        // Exponential backoff up to 10 seconds max
        delay = Math.min(delay * 1.5, 10000)
        timeoutId = setTimeout(poll, delay)
      } catch (err) {
        console.error('[useInterviewPoll] Polling failed:', err)
        if (active) {
          setError((err as Error).message || 'Failed connecting to server')
          // Retry anyway after a longer delay
          timeoutId = setTimeout(poll, 10000)
        }
      }
    }

    setStatus('processing')
    poll()

    return () => {
      active = false
      clearTimeout(timeoutId)
    }
  }, [sessionId])

  return { status, error }
}
