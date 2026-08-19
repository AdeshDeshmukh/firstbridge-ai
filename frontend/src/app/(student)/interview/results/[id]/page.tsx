'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageWrapper from '../../../../../components/layout/PageWrapper'
import ProcessingStatus from '../../../../../components/interview/ProcessingStatus'
import ScoreDisplay, { ScoreData } from '../../../../../components/interview/ScoreDisplay'
import ImprovementChart from '../../../../../components/interview/ImprovementChart'
import { useInterviewPoll } from '../../../../../hooks/useInterviewPoll'
import { apiClient } from '../../../../../lib/api-client'
import { ArrowLeft, Loader2, RefreshCw, XCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function InterviewResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const { status, error: pollError } = useInterviewPoll(sessionId)
  const [results, setResults] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'completed') return

    async function fetchResults() {
      setLoading(true)
      try {
        console.log(`[InterviewResults] Fetching session results for: ${sessionId}`)
        const response = await apiClient<{ success: boolean; session: any }>(
          `/interview/${sessionId}/results`
        )

        if (response.success) {
          setResults(response.session)
        } else {
          throw new Error('Failed to fetch results data')
        }
      } catch (err) {
        console.error('[InterviewResults] Failed fetching results:', err)
        setError((err as Error).message || 'Failed connecting to server')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [status, sessionId])

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="flex justify-between items-center">
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
                Session Analysis
              </h1>
              <p className="text-xs text-gray-500">Atlas feedback and body alignment scoreboard.</p>
            </div>
          </div>

          {status === 'completed' && (
            <Link
              href="/interview/record?q=Introduce Yourself"
              className="py-2.5 px-4 border border-gray-200/80 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Practice Again
            </Link>
          )}
        </div>

        {/* Dynamic State rendering (processing loader -> results details) */}
        <div className="py-6">
          {(status === 'processing' || status === 'idle') && (
            <ProcessingStatus status={status} />
          )}

          {status === 'failed' && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm text-center max-w-lg mx-auto animate-fade-in space-y-4">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">Analysis Pipeline Failed</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                An error occurred during audio transcription or scoring calculations. Please re-record a mock answer.
              </p>
              <button
                onClick={() => router.push('/interview/record')}
                className="py-2.5 px-5 bg-brand-primary text-white font-semibold rounded-xl"
              >
                Re-record Session
              </button>
            </div>
          )}

          {status === 'completed' && loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-600">Retrieving scoring records...</p>
            </div>
          )}

          {status === 'completed' && !loading && results && (
            <div className="space-y-8">
              <ScoreDisplay
                scores={{
                  overallScore: results.scores?.engagementScore || 0,
                  eyeContactScore: results.scores?.eyeContactScore || 0,
                  engagementScore: results.scores?.engagementScore || 0,
                  confidenceLevel: results.scores?.confidenceLevel || 'Medium',
                  fillerWordCount: results.scores?.fillerWordCount || 0,
                  wordsPerMinute: results.scores?.wordsPerMinute || 0,
                  transcriptText: results.scores?.transcriptText || '',
                  atlasFeedback: results.scores?.atlasFeedback || '',
                  durationSeconds: results.durationSeconds || 60,
                }}
              />

              {results.perFrameScores && (
                <ImprovementChart
                  frames={
                    typeof results.perFrameScores === 'string'
                      ? JSON.parse(results.perFrameScores)
                      : results.perFrameScores
                  }
                />
              )}
            </div>
          )}

          {(error || pollError) && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 leading-normal max-w-md mx-auto text-center mt-4">
              <strong>Connection Error:</strong> {error || pollError}. Polling will continue in background.
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
