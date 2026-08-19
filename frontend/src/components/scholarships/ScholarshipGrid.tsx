'use client'

import React from 'react'
import ScholarshipCard, { Scholarship } from './ScholarshipCard'
import { Trophy, HelpCircle } from 'lucide-react'

interface ScholarshipGridProps {
  scholarships: Scholarship[]
  loading?: boolean
  onSaveToggle?: () => void
}

export default function ScholarshipGrid({
  scholarships,
  loading = false,
  onSaveToggle,
}: ScholarshipGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="border border-gray-200 bg-white rounded-3xl p-5 shadow-sm space-y-4 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                <div className="h-3 bg-gray-200 rounded-full w-1/3" />
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded-full w-1/4" />
              <div className="h-4 bg-gray-200 rounded-full w-1/4" />
            </div>
            <div className="h-10 bg-gray-150 rounded-xl w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (scholarships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-3 bg-white border border-gray-200 rounded-3xl w-full">
        <div className="p-4 bg-indigo-50/50 rounded-full text-brand-primary">
          <HelpCircle className="w-8 h-8 stroke-1" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">No scholarships match your filters</h4>
          <p className="text-xs leading-relaxed max-w-[240px] mx-auto mt-1">
            Try adjusting your search keywords, amounts, or talk to Grant to expand your profile narrative!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {scholarships.map((scholarship) => (
        <ScholarshipCard
          key={scholarship.id}
          scholarship={scholarship}
          onSaveToggle={onSaveToggle}
        />
      ))}
    </div>
  )
}
