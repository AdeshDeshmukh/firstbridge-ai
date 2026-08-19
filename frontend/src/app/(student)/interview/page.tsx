'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '../../../components/layout/PageWrapper'
import SessionCard, { HistoricalSession } from '../../../components/interview/SessionCard'
import { apiClient } from '../../../lib/api-client'
import { Sparkles, Video, History, HelpCircle, Trophy, Clock, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react'

const PRACTICE_QUESTIONS = [
  { id: '1', title: 'Introduce Yourself', text: 'Tell me about yourself, your background, and why you decided to pursue your field of study.' },
  { id: '2', title: 'Overcoming a Challenge', text: 'Describe a significant academic or personal challenge you faced and how you overcame it.' },
  { id: '3', title: 'Academic Project', text: 'Describe a project or research topic you worked on that you are most proud of, and what you learned.' },
  { id: '4', title: 'Future Goals', text: 'Where do you see yourself professionally in five years, and how will this college experience help you get there?' },
]

export default function InterviewDashboard() {
  const [sessions, setSessions] = useState<HistoricalSession[]>([])
  const [loading, setLoading] = useState(true)
  const [averages, setAverages] = useState({
    avgScore: 0,
    avgEyeContact: 0,
    totalMocks: 0,
  })

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await apiClient<{ success: boolean; sessions: HistoricalSession[] }>('/interview/history')
        if (data.success) {
          setSessions(data.sessions)

          // Calculate averages
          const completed = data.sessions.filter((s) => s.status === 'completed' && s.scores)
          if (completed.length > 0) {
            const sumScore = completed.reduce((acc, s) => acc + (s.scores?.engagementScore || 0), 0)
            const sumGaze = completed.reduce((acc, s) => acc + (s.scores?.eyeContactScore || 0), 0)

            setAverages({
              avgScore: Math.round(sumScore / completed.length),
              avgEyeContact: Math.round(sumGaze / completed.length),
              totalMocks: completed.length,
            })
          }
        }
      } catch (err) {
        console.error('[InterviewDashboard] Failed fetching history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <PageWrapper>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Atlas Coach
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-2">Mock Interview Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Practice responses with real-time browser eye contact evaluation and AI speech analytics.
            </p>
          </div>

          <Link
            href="/interview/record?q=Introduce Yourself"
            className="py-3 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <Video className="w-4 h-4" />
            Quick Start Session
          </Link>
        </div>

        {/* Analytics Summary banner */}
        {averages.totalMocks > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-100 pb-4 sm:pb-0 px-4">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Average Score</span>
              <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                <span className="text-3xl font-black text-brand-primary">{averages.avgScore}</span>
                <span className="text-sm font-semibold text-gray-400">/100</span>
              </div>
            </div>

            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-100 py-4 sm:py-0 px-4">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Avg Eye Contact</span>
              <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                <span className="text-3xl font-black text-emerald-600">{averages.avgEyeContact}%</span>
                <span className="text-xs text-gray-400 font-semibold">camera focus</span>
              </div>
            </div>

            <div className="text-center sm:text-left pt-4 sm:pt-0 px-4">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Mocks Completed</span>
              <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                <span className="text-3xl font-black text-gray-800">{averages.totalMocks}</span>
                <span className="text-xs text-gray-400 font-semibold">sessions</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Practice Questions list */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">Choose a Practice Prompt</h3>
            </div>

            <div className="space-y-4">
              {PRACTICE_QUESTIONS.map((q) => (
                <div key={q.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-brand-primary/20 transition-all shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-base">{q.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                      {q.text}
                    </p>
                  </div>

                  <Link
                    href={`/interview/record?q=${encodeURIComponent(q.text)}`}
                    className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 shrink-0 mt-2 sm:mt-0"
                  >
                    Select Question
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* History Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">Recent Sessions</h3>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white border border-gray-200/85 rounded-2xl p-8 text-center shadow-sm">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-500">No mock sessions yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[180px] mx-auto leading-normal">
                  Complete your first recording to view feedback.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
