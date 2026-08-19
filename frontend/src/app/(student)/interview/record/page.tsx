'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageWrapper from '../../../../components/layout/PageWrapper'
import BrowserCheck from '../../../../components/interview/BrowserCheck'
import ModelLoader from '../../../../components/interview/ModelLoader'
import VideoRecorder from '../../../../components/interview/VideoRecorder'
import { useMediaPipe } from '../../../../hooks/useMediaPipe'
import { LandmarkFrame } from '../../../../hooks/useFaceAnalysis'
import { apiClient } from '../../../../lib/api-client'
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type RecordStage = 'check' | 'load' | 'record' | 'uploading'

function InterviewRecordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const question = searchParams.get('q') || 'Tell me about yourself, your background, and why you decided to pursue your field of study.'

  const [stage, setStage] = useState<RecordStage>('check')
  const { landmarker, progress, status: modelStatus } = useMediaPipe()

  const handleBrowserCheckPassed = () => {
    // If MediaPipe is already loaded, jump straight to record!
    if (modelStatus === 'ready') {
      setStage('record')
    } else {
      setStage('load')
    }
  }

  // React to MediaPipe ready state if currently in load stage
  React.useEffect(() => {
    if (stage === 'load' && modelStatus === 'ready') {
      setStage('record')
    }
  }, [modelStatus, stage])

  const handleSaveSession = async (videoBlob: Blob, gazeFrames: LandmarkFrame[]) => {
    setStage('uploading')

    try {
      // Package payload in FormData
      const formData = new FormData()
      formData.append('video', videoBlob, 'recording.webm')
      formData.append('questionPrompt', question)
      formData.append('gazeFrames', JSON.stringify(gazeFrames))

      console.log('[InterviewRecord] Uploading recording session payload...')
      
      // Submit multipart upload
      const response = await apiClient<{ success: boolean; sessionId: string }>('/interview/upload', {
        method: 'POST',
        // Fetch client automatically appends authorization header,
        // we omit Content-Type header so browser inserts boundary automatically
        body: formData,
      })

      if (response.success) {
        console.log(`[InterviewRecord] Upload succeeded! Redirecting to results: ${response.sessionId}`)
        router.push(`/interview/results/${response.sessionId}`)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('[InterviewRecord] Failed uploading session:', error)
      alert('Failed saving session. Please try again.')
      setStage('record')
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/interview"
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
              Practice Session Setup
            </h1>
            <p className="text-xs text-gray-500">Record a mock answer. Video is destroyed after analysis.</p>
          </div>
        </div>

        {/* Wizard stages switcher */}
        <div className="py-6">
          {stage === 'check' && (
            <BrowserCheck onPassed={handleBrowserCheckPassed} />
          )}

          {stage === 'load' && (
            <ModelLoader progress={progress} />
          )}

          {stage === 'record' && landmarker && (
            <VideoRecorder
              landmarker={landmarker}
              questionPrompt={question}
              onSave={handleSaveSession}
            />
          )}

          {stage === 'uploading' && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto animate-fade-in space-y-4">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Uploading Interview Payload</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                Saving audio tracks and eye-gaze coordinate arrays securely for scoring...
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

export default function InterviewRecordPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-primary" />
          <span className="text-sm font-semibold">Loading setup wizard...</span>
        </div>
      </PageWrapper>
    }>
      <InterviewRecordContent />
    </Suspense>
  )
}
