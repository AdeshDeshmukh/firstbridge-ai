'use client'

import { useState } from 'react'
import { AlertCircle, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AlertBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-brand-primary-light border border-indigo-150 rounded-2xl p-4 flex gap-3 text-brand-primary items-center justify-between animate-fade-in">
      <div className="flex gap-3 items-center">
        <AlertCircle className="w-5 h-5 shrink-0 text-brand-primary" />
        <p className="text-xs sm:text-sm font-medium leading-normal text-indigo-900">
          Your profile memory snapshot is active. Talk with Vera to match scholarships.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/story"
          className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 shrink-0"
        >
          <span>Open Chat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="text-indigo-400 hover:text-indigo-600 focus:outline-none shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
