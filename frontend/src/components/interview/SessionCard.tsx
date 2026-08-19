'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, Clock, BarChart3, ChevronRight, Award } from 'lucide-react'

export interface HistoricalSession {
  id: string
  createdAt: string
  questionPrompt: string
  status: string
  durationSeconds: number | null
  scores?: {
    eyeContactScore: number | null
    engagementScore: number | null
    confidenceLevel: string | null
    fillerWordCount: number | null
    wordsPerMinute: number | null
  } | null
}

interface SessionCardProps {
  session: HistoricalSession
}

export default function SessionCard({ session }: SessionCardProps) {
  const { id, createdAt, questionPrompt, status, durationSeconds, scores } = session

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDuration = (sec: number | null) => {
    if (!sec) return '0s'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  const overallScore = scores ? scores.engagementScore : null

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-brand-primary/20 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          {/* Status / Date Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(createdAt)}
            </span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(durationSeconds)}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
            "{questionPrompt}"
          </h4>
        </div>

        {/* Aggregate score circle */}
        {status === 'completed' && overallScore !== null ? (
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/15 flex flex-col items-center justify-center font-extrabold text-brand-primary text-xs">
            <span>{overallScore}</span>
            <span className="text-[7px] uppercase tracking-wider text-gray-400 mt-0.5">Score</span>
          </div>
        ) : (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            status === 'processing' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
          }`}>{status}</span>
        )}
      </div>

      {status === 'completed' && scores && (
        <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 mt-4 text-[10px] text-gray-500 font-medium">
          <div>
            <span className="block text-gray-400">Eye Contact</span>
            <span className="text-gray-800 font-bold">{scores.eyeContactScore}%</span>
          </div>
          <div>
            <span className="block text-gray-400">Speech Rate</span>
            <span className="text-gray-800 font-bold">{scores.wordsPerMinute} WPM</span>
          </div>
          <div>
            <span className="block text-gray-400">Confidence</span>
            <span className="text-gray-800 font-bold">{scores.confidenceLevel || 'N/A'}</span>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
          <Link
            href={`/interview/results/${id}`}
            className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 transition-all"
          >
            Review Performance
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
