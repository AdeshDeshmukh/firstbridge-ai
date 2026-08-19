import React from 'react'
import { Brain, Star, AlertTriangle, ShieldCheck, Trophy, Sparkles } from 'lucide-react'

interface FactsData {
  goals?: string[]
  concerns?: string[]
  strengths?: string[]
  keyExperiences?: string[]
}

interface ProfileFactsProps {
  facts: FactsData | null
  loading?: boolean
}

export default function ProfileFacts({ facts, loading = false }: ProfileFactsProps) {
  const hasFacts =
    facts &&
    ((facts.goals && facts.goals.length > 0) ||
      (facts.concerns && facts.concerns.length > 0) ||
      (facts.strengths && facts.strengths.length > 0) ||
      (facts.keyExperiences && facts.keyExperiences.length > 0))

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-brand-primary border-b border-gray-100 pb-4">
        <Brain className="w-6 h-6 text-brand-primary" />
        <div>
          <h3 className="font-bold text-gray-950 text-sm sm:text-base">AI Memory Bridge</h3>
          <p className="text-[10px] text-gray-400">Structured facts extracted in real-time</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-2/3" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded-full w-full" />
            <div className="h-3 bg-gray-200 rounded-full w-5/6" />
          </div>
        </div>
      ) : !hasFacts ? (
        <div className="text-center py-6 text-gray-400 space-y-2">
          <Sparkles className="w-8 h-8 mx-auto stroke-1" />
          <p className="text-xs leading-relaxed max-w-[180px] mx-auto">
            Vera hasn't extracted any details yet. Share your story in the chat to populate her memory!
          </p>
        </div>
      ) : (
        <div className="space-y-5 custom-scrollbar max-h-[60vh] overflow-y-auto pr-1">
          {/* Strengths */}
          {facts.strengths && facts.strengths.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-brand-primary" />
                <span>Strengths</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {facts.strengths.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-indigo-50 border border-indigo-100 text-brand-primary px-2.5 py-1 rounded-full font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {facts.goals && facts.goals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-grant uppercase tracking-wider">
                <Star className="w-4 h-4 text-grant" />
                <span>Goals</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {facts.goals.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-emerald-50 border border-emerald-100 text-grant px-2.5 py-1 rounded-full font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {facts.concerns && facts.concerns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-650 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Concerns</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {facts.concerns.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-red-50 border border-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Experiences */}
          {facts.keyExperiences && facts.keyExperiences.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-atlas uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-atlas" />
                <span>Experiences</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {facts.keyExperiences.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-50 border border-blue-100 text-atlas px-2.5 py-1 rounded-full font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
