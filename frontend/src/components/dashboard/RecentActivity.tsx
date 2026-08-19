import React from 'react'
import { CheckCircle, Info, Star, Compass } from 'lucide-react'

interface Activity {
  id: string
  type: 'onboarding' | 'consent' | 'chat' | 'match'
  text: string
  time: string
}

export default function RecentActivity() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'onboarding',
      text: 'Academic profile onboarding wizard completed.',
      time: 'Just now',
    },
    {
      id: '2',
      type: 'consent',
      text: 'FERPA privacy policy and data storage consent granted.',
      time: '5 minutes ago',
    },
    {
      id: '3',
      type: 'chat',
      text: 'AI Memory Bridge initialized with seed profile snapshot.',
      time: '5 minutes ago',
    },
  ]

  const getActivityIconAndColor = (type: Activity['type']) => {
    switch (type) {
      case 'onboarding':
        return { icon: CheckCircle, color: 'text-brand-primary bg-indigo-50 border-indigo-100' }
      case 'consent':
        return { icon: Info, color: 'text-blue-500 bg-blue-50 border-blue-105' }
      default:
        return { icon: Star, color: 'text-vera bg-violet-50 border-violet-105' }
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base border-b border-gray-100 pb-3">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((act) => {
          const { icon: Icon, color } = getActivityIconAndColor(act.type)
          return (
            <div key={act.id} className="flex gap-3 items-start">
              <div className={`p-2 rounded-xl border ${color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm text-gray-700 leading-normal">{act.text}</p>
                <span className="text-[10px] text-gray-400 block">{act.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
