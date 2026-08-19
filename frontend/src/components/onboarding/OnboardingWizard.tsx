'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile, OnboardingData } from '@/hooks/useProfile'
import StepProfile from './StepProfile'
import StepPriorities from './StepPriorities'
import StepMeetAgents from './StepMeetAgents'
import { GraduationCap } from 'lucide-react'

export default function OnboardingWizard() {
  const router = useRouter()
  const { completeOnboarding, loading } = useProfile()
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    university: '',
    major: '',
    year: 1,
    isFirstGen: true,
    priority: '',
  })

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3))
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleComplete = async () => {
    try {
      await completeOnboarding(formData)
      // Set onboarding done cookie so middleware lets us through to dashboard
      document.cookie = 'fb_onboarding_done=true; path=/; SameSite=Lax'
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding wizard failed:', err)
    }
  }

  return (
    <div className="max-w-xl w-full mx-auto glass p-6 sm:p-8 rounded-3xl shadow-xl space-y-8 animate-fade-in">
      {/* Wizard Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-primary font-bold">
            <GraduationCap className="w-6 h-6" />
            <span>Profile Setup</span>
          </div>
          <span className="text-xs font-semibold text-gray-500">Step {step} of 3</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-155 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-350"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tell Us About Yourself</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              We personalize your advisors based on your academic path and college details.
            </p>
          </div>
          <StepProfile
            data={formData}
            onChange={updateFormData}
            onNext={handleNext}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Priority</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Which area do you want to focus on first? You can access all modules later.
            </p>
          </div>
          <StepPriorities
            value={formData.priority}
            onChange={(val) => updateFormData({ priority: val })}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meet Your Advisors</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Your advisors utilize context sync. You only need to tell your background details once.
            </p>
          </div>
          <StepMeetAgents
            onComplete={handleComplete}
            onBack={handleBack}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
