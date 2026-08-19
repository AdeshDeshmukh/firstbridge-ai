'use client'

import React from 'react'
import { Eye, UserCheck, ShieldAlert, Zap, BookOpen, Volume2, Award, Clock } from 'lucide-react'

export interface ScoreData {
  overallScore: number
  eyeContactScore: number
  engagementScore: number
  confidenceLevel: string
  fillerWordCount: number
  wordsPerMinute: number
  transcriptText: string
  atlasFeedback: string
  durationSeconds?: number
}

interface ScoreDisplayProps {
  scores: ScoreData
}

export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const {
    overallScore,
    eyeContactScore,
    engagementScore,
    confidenceLevel,
    fillerWordCount,
    wordsPerMinute,
    transcriptText,
    atlasFeedback,
    durationSeconds = 60
  } = scores

  // Helper to color overall score text/border
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-200 bg-emerald-50'
    if (score >= 50) return 'text-amber-600 border-amber-200 bg-amber-50'
    return 'text-rose-600 border-rose-200 bg-rose-50'
  }

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Top Banner Overview Card */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Score ring */}
          <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-extrabold ${getScoreColorClass(overallScore)}`}>
            <span className="text-3xl tracking-tighter leading-none">{overallScore}</span>
            <span className="text-[10px] tracking-wider uppercase text-gray-500 mt-0.5">Score</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
              <h2 className="text-2xl font-black text-gray-900">Interview Scoreboard</h2>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                confidenceLevel === 'High' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : confidenceLevel === 'Low' 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>{confidenceLevel} Confidence</span>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 max-w-md">
              Congratulations on completing your mock interview session! Atlas compiled your body posture and vocal clarity metrics below.
            </p>
          </div>
        </div>

        <div className="flex gap-4 border-t border-gray-100 md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-center">
          <div className="text-center px-4">
            <span className="text-gray-400 text-xs font-semibold block uppercase tracking-wider">Duration</span>
            <span className="text-lg font-bold text-gray-800 mt-0.5 block flex items-center gap-1.5 justify-center">
              <Clock className="w-4 h-4 text-gray-400" />
              {formatDuration(durationSeconds)}
            </span>
          </div>
          <div className="w-px bg-gray-100 h-10 align-middle my-auto" />
          <div className="text-center px-4">
            <span className="text-gray-400 text-xs font-semibold block uppercase tracking-wider">Words spoken</span>
            <span className="text-lg font-bold text-gray-800 mt-0.5 block">
              {Math.round(wordsPerMinute * (durationSeconds / 60))}
            </span>
          </div>
        </div>
      </div>

      {/* Symmetrical Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Eye Contact Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary mx-auto mb-3">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Eye Contact</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{eyeContactScore}%</span>
          <span className="text-[10px] text-gray-500 mt-1 block leading-normal">
            Aligned gaze tracking
          </span>
        </div>

        {/* Head Stability Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
          <div className="w-10 h-10 bg-atlas-light rounded-xl flex items-center justify-center text-atlas mx-auto mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Head Stability</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{engagementScore}%</span>
          <span className="text-[10px] text-gray-500 mt-1 block leading-normal">
            Controlled posture score
          </span>
        </div>

        {/* Pacing Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
          <div className="w-10 h-10 bg-grant-light rounded-xl flex items-center justify-center text-grant mx-auto mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Speech Pace</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{wordsPerMinute} WPM</span>
          <span className="text-[10px] text-gray-500 mt-1 block leading-normal">
            Ideal range: 120-160 WPM
          </span>
        </div>

        {/* Filler Words Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mx-auto mb-3">
            <Volume2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Filler Words</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{fillerWordCount} total</span>
          <span className="text-[10px] text-gray-500 mt-1 block leading-normal">
            Um, uh, like triggers
          </span>
        </div>
      </div>

      {/* Atlas Coach Feedback Section */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Atlas Agent Coaching Review</h3>
            <p className="text-xs text-gray-500">Constructive career feedback generated by your advisor</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
          {atlasFeedback.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm">{para}</p>
          ))}
        </div>
      </div>

      {/* Transcript Text Section */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gray-400" />
          <h4 className="text-sm font-bold text-gray-900">Speech Transcription Log</h4>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl max-h-48 overflow-y-auto">
          <p className="text-xs text-gray-600 leading-relaxed font-mono">
            {transcriptText || 'No verbal audio detected during recording.'}
          </p>
        </div>
      </div>
    </div>
  )
}
