import React from 'react'

interface ApplicationTrackerProps {
  currentTab: 'matching' | 'tracker'
  onTabChange: (tab: 'matching' | 'tracker') => void
  savedCount: number
}

export default function ApplicationTracker({
  currentTab,
  onTabChange,
  savedCount,
}: ApplicationTrackerProps) {
  return (
    <div className="flex border-b border-gray-200 w-full mb-6">
      <button
        onClick={() => onTabChange('matching')}
        className={`pb-3 px-4 text-sm font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
          currentTab === 'matching'
            ? 'border-grant text-grant font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-900'
        }`}
      >
        Scholarships Matching
      </button>
      <button
        onClick={() => onTabChange('tracker')}
        className={`pb-3 px-4 text-sm font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
          currentTab === 'tracker'
            ? 'border-grant text-grant font-bold'
            : 'border-transparent text-gray-500 hover:text-gray-900'
        }`}
      >
        <span>Application Tracker</span>
        {savedCount > 0 && (
          <span className="text-[10px] bg-grant text-white font-bold px-2 py-0.5 rounded-full">
            {savedCount}
          </span>
        )}
      </button>
    </div>
  )
}
