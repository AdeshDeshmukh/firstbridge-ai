'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface OnboardingData {
  firstName: string
  lastName: string
  university: string
  major: string
  year: number
  isFirstGen: boolean
  priority: string
}

export function useProfile() {
  const [loading, setLoading] = useState(false)

  const getProfile = async () => {
    setLoading(true)
    try {
      const data = await apiClient<{ user: any; profile: any; hasConsent: boolean }>('/auth/me')
      return data
    } catch (err: any) {
      console.error('Failed to get profile details:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async (data: OnboardingData) => {
    setLoading(true)
    try {
      const response = await apiClient<{ message: string; profile: any }>('/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      toast.success('Onboarding completed! Welcome to FirstBridge AI.')
      return response.profile
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err)
      toast.error(err.message || 'Failed to submit onboarding profile.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    getProfile,
    completeOnboarding,
    loading,
  }
}
