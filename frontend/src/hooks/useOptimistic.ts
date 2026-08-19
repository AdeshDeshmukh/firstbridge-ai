'use client'

import { useState, useTransition } from 'react'

export function useOptimisticState<T>(
  initialState: T,
  updateFn: (state: T, action: any) => T
) {
  const [state, setState] = useState<T>(initialState)
  const [isPending, startTransition] = useTransition()

  const setOptimistic = (action: any, apiCall: () => Promise<any>, onError?: (err: any) => void) => {
    // 1. Calculate optimistic state
    const nextState = updateFn(state, action)
    const previousState = state

    // 2. Set state immediately
    setState(nextState)

    // 3. Fire API Call inside transition
    startTransition(async () => {
      try {
        await apiCall()
      } catch (err) {
        // Rollback on failure
        setState(previousState)
        if (onError) {
          onError(err)
        }
      }
    })
  }

  return [state, setOptimistic, isPending] as const
}
