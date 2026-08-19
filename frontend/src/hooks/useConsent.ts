'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface ConsentData {
  conversationStorage: boolean
  videoProcessing: boolean
  emailNotifications: boolean
  photoStorage: boolean
  anonymousAnalytics: boolean
}

export function useConsent() {
  const [loading, setLoading] = useState(false)

  const grantConsent = async (data: ConsentData) => {
    setLoading(true)
    try {
      const response = await apiClient<{ message: string; consent: any }>('/consent/grant', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      toast.success('Consent settings saved successfully.')
      return response.consent
    } catch (err: any) {
      console.error('Failed to grant consent:', err)
      toast.error(err.message || 'Failed to save consent settings.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const withdrawConsent = async () => {
    setLoading(true)
    try {
      await apiClient('/consent/withdraw', {
        method: 'POST',
      })
      toast.warning('All consent has been withdrawn. Sensitive data will be queued for removal.')
      return true
    } catch (err: any) {
      console.error('Failed to withdraw consent:', err)
      toast.error(err.message || 'Failed to withdraw consent.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    grantConsent,
    withdrawConsent,
    loading,
  }
}
