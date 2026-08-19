'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConsent, ConsentData } from '@/hooks/useConsent'
import ConsentCheckbox from './ConsentCheckbox'
import { GraduationCap, ShieldCheck, Loader2 } from 'lucide-react'

export default function ConsentModal() {
  const router = useRouter()
  const { grantConsent, loading } = useConsent()

  // State mapping the 5 consent options
  const [consents, setConsents] = useState<ConsentData>({
    conversationStorage: true, // required to be true for submit, default checked
    videoProcessing: true, // required to be true for submit, default checked
    emailNotifications: false,
    photoStorage: false,
    anonymousAnalytics: false,
  })

  const [formError, setFormError] = useState<string | null>(null)

  const handleCheckboxChange = (field: keyof ConsentData, checked: boolean) => {
    setConsents((prev) => ({
      ...prev,
      [field]: checked,
    }))
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enforce required rules
    if (!consents.conversationStorage || !consents.videoProcessing) {
      setFormError('You must approve the required items to activate FirstBridge AI.')
      return
    }

    try {
      await grantConsent(consents)
      // Set the browser cookie so middleware lets us through
      document.cookie = 'fb_has_consent=true; path=/; SameSite=Lax'
      router.push('/onboarding')
    } catch (err) {
      console.error('Consent submission failed:', err)
    }
  }

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8 glass p-6 sm:p-8 rounded-3xl shadow-xl animate-fade-in">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-50 text-brand-primary mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">FERPA & Data Privacy Consent</h2>
        <p className="mt-2 text-sm text-gray-650 leading-relaxed max-w-lg mx-auto">
          Before matching with scholarships or practicing mock interviews, we need you to review and approve how we handle your academic data under FERPA.
        </p>
      </div>

      {formError && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-150 animate-shake">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ConsentCheckbox
          id="conversationStorage"
          title="AI Memory & Conversation History"
          description="Enables Vera and Grant to remember facts you share across chat sessions. This powers our cross-agent persistent memory. All data is encrypted and linked to your private profile."
          required={true}
          checked={consents.conversationStorage}
          onChange={(checked) => handleCheckboxChange('conversationStorage', checked)}
        />

        <ConsentCheckbox
          id="videoProcessing"
          title="Interview Video & Audio Processing"
          description="Allows Atlas to analyze your video feeds locally in-browser for eye contact/gaze metrics, and transcribes mock interview audio to generate coaching insights. Videos are deleted immediately after analysis."
          required={true}
          checked={consents.videoProcessing}
          onChange={(checked) => handleCheckboxChange('videoProcessing', checked)}
        />

        <ConsentCheckbox
          id="emailNotifications"
          title="Scholarship Alerts & Deadline Reminders"
          description="Sends you automated email updates when matching scholarships are close to their deadlines. You can opt out at any time."
          required={false}
          checked={consents.emailNotifications}
          onChange={(checked) => handleCheckboxChange('emailNotifications', checked)}
        />

        <ConsentCheckbox
          id="photoStorage"
          title="Portrait Enhancer Storage"
          description="Enables storage of your uploaded headshots to generate enhanced professional portraits via AI styling tools."
          required={false}
          checked={consents.photoStorage}
          onChange={(checked) => handleCheckboxChange('photoStorage', checked)}
        />

        <ConsentCheckbox
          id="anonymousAnalytics"
          title="Anonymous Usage Analytics"
          description="Allows us to collect anonymous performance telemetry (response speeds, errors) to keep our application running smoothly. Does not track individual profiles."
          required={false}
          checked={consents.anonymousAnalytics}
          onChange={(checked) => handleCheckboxChange('anonymousAnalytics', checked)}
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Accept & Activate Account'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
