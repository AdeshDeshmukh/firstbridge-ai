import React from 'react'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'

interface ModuleCardProps {
  title: string
  description: string
  advisorName: string
  icon: React.ComponentType<any>
  link: string
  colorClass: string
  accentClass: string
  locked?: boolean
}

export default function ModuleCard({
  title,
  description,
  advisorName,
  icon: Icon,
  link,
  colorClass,
  accentClass,
  locked = false,
}: ModuleCardProps) {
  const content = (
    <div className={`border border-gray-200 bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full ${locked ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${accentClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </span>
        ) : (
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            With {advisorName}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 flex-grow">{description}</p>

      {!locked ? (
        <div className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors mt-auto w-fit ${colorClass}`}>
          <span>Begin Session</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      ) : (
        <span className="text-xs text-gray-450 italic mt-auto">Locked until Phase 2</span>
      )}
    </div>
  )

  if (locked) {
    return <div className="h-full select-none">{content}</div>
  }

  return (
    <Link href={link} className="group block h-full">
      {content}
    </Link>
  )
}
