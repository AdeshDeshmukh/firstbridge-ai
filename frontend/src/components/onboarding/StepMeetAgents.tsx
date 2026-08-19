'use client'

import { Sparkles, Compass, BookOpen, Brain, Loader2 } from 'lucide-react'

interface StepMeetAgentsProps {
  onComplete: () => void
  onBack: () => void
  loading: boolean
}

export default function StepMeetAgents({ onComplete, onBack, loading }: StepMeetAgentsProps) {
  const agents = [
    {
      name: 'Vera',
      title: 'Personal Narrative Coach',
      description: 'Learns your story, background, and concerns to help draft personal statement essays.',
      icon: Sparkles,
      color: 'bg-violet-50 text-vera border-vera',
    },
    {
      name: 'Grant',
      title: 'Financial & Scholarship Matcher',
      description: 'Uses context Vera extracts to match you with awards. Tracks matching deadlines and filters.',
      icon: Compass,
      color: 'bg-emerald-50 text-grant border-grant',
    },
    {
      name: 'Atlas',
      title: 'Career & Mock Interview Coach',
      description: 'Coaches you through mock interviews, matching questions to your targets. Gives gaze/WPM feedback.',
      icon: BookOpen,
      color: 'bg-blue-50 text-atlas border-atlas',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 text-brand-primary">
        <Brain className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Cross-Agent Persistent Memory Activated</h4>
          <p className="text-xs leading-relaxed text-indigo-900 mt-1">
            Any facts you share with Vera (e.g. studying Mechanical Engineering) are extracted and shared with Grant and Atlas. You only have to tell your story once.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <div
              key={agent.name}
              className="p-4 border border-gray-200 bg-white rounded-2xl flex gap-4 shadow-sm"
            >
              <div className={`p-3 rounded-xl shrink-0 h-fit ${agent.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  {agent.name} <span className="font-normal text-xs text-gray-500">({agent.title})</span>
                </h4>
                <p className="text-xs sm:text-sm text-gray-650 leading-relaxed mt-1">
                  {agent.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={loading}
          className="flex-grow flex-1 py-3 px-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Finish & Go to Dashboard'
          )}
        </button>
      </div>
    </div>
  )
}
