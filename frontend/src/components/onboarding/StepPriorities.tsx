'use client'

import { BookOpen, HelpCircle, Compass, Sparkles } from 'lucide-react'

interface StepPrioritiesProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepPriorities({ value, onChange, onNext, onBack }: StepPrioritiesProps) {
  const priorities = [
    {
      id: 'scholarships',
      title: 'Find & Apply for Scholarships',
      description: 'Find matching financial awards, manage applications, and write scholarship drafts.',
      icon: Compass,
      color: 'border-grant-600 hover:bg-grant-light text-grant',
    },
    {
      id: 'interviews',
      title: 'Mock Interview Coaching',
      description: 'Practice real questions with Atlas, get gaze/pacing analysis, and speak confidently.',
      icon: BookOpen,
      color: 'border-atlas-600 hover:bg-atlas-light text-atlas',
    },
    {
      id: 'story',
      title: 'Personal Statement & Essay Help',
      description: 'Work with Vera to extract key narratives and refine your college essay drafts.',
      icon: Sparkles,
      color: 'border-vera-600 hover:bg-vera-light text-vera',
    },
    {
      id: 'all',
      title: 'All of the Above',
      description: 'Set up cross-agent persistence across story, scholarship matches, and career prep.',
      icon: HelpCircle,
      color: 'border-brand-primary hover:bg-brand-primary-light text-brand-primary',
    },
  ]

  const handleSelect = (id: string) => {
    onChange(id)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {priorities.map((item) => {
          const Icon = item.icon
          const isSelected = value === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`text-left p-4 border rounded-2xl flex gap-4 transition-all ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary-light shadow-sm ring-1 ring-brand-primary'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${isSelected ? 'bg-white' : 'bg-gray-50'} ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-1">{item.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!value}
          className="flex-grow flex-1 py-3 px-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
