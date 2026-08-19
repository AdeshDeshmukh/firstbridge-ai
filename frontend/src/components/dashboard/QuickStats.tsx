import React from 'react'
import { Sparkles, Trophy, BookOpen } from 'lucide-react'

interface QuickStatsProps {
  scholarshipCount: number
  factsCount: number
  completeness: number
}

export default function QuickStats({ scholarshipCount, factsCount, completeness }: QuickStatsProps) {
  const stats = [
    {
      label: 'Matched Scholarships',
      value: scholarshipCount,
      icon: Trophy,
      color: 'bg-emerald-50 text-grant border-emerald-100',
    },
    {
      label: 'AI Memory Facts',
      value: factsCount,
      icon: Sparkles,
      color: 'bg-violet-50 text-vera border-violet-100',
    },
    {
      label: 'Profile Completeness',
      value: `${completeness}%`,
      icon: BookOpen,
      color: 'bg-indigo-50 text-brand-primary border-indigo-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl border ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 block uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {stat.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
