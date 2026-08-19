'use client'

import { useState } from 'react'
import { Trophy, Bookmark, BookmarkCheck, ExternalLink, Calendar, Loader2 } from 'lucide-react'
import DeadlineCountdown from './DeadlineCountdown'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export interface Scholarship {
  id: string
  name: string
  organization: string
  amount: number
  deadline: string
  description?: string
  eligibility?: string
  url: string
  savedStatus?: 'saved' | 'applied' | 'submitted' | null
}

interface ScholarshipCardProps {
  scholarship: Scholarship
  onSaveToggle?: () => void
}

export default function ScholarshipCard({ scholarship, onSaveToggle }: ScholarshipCardProps) {
  const [saved, setSaved] = useState(!!scholarship.savedStatus)
  const [status, setStatus] = useState<string>(scholarship.savedStatus || 'none')
  const [loading, setLoading] = useState(false)

  const handleToggleSave = async () => {
    setLoading(true)
    const nextSaved = !saved
    setSaved(nextSaved) // Optimistic

    try {
      await apiClient(`/scholarships/${scholarship.id}/save`, {
        method: 'POST',
      })
      toast.success(nextSaved ? 'Scholarship saved to your tracker!' : 'Scholarship removed.')
      if (onSaveToggle) onSaveToggle()
    } catch (err: any) {
      setSaved(!nextSaved) // Rollback
      toast.error(err.message || 'Failed to save scholarship.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    const prevStatus = status
    setStatus(newStatus) // Optimistic

    try {
      await apiClient(`/scholarships/${scholarship.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      toast.success(`Application status updated to: ${newStatus}`)
    } catch (err: any) {
      setStatus(prevStatus) // Rollback
      toast.error(err.message || 'Failed to update application status.')
    }
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(scholarship.amount)

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-emerald-50 text-grant rounded-xl border border-emerald-100 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-950 text-sm sm:text-base line-clamp-1">
              {scholarship.name}
            </h3>
            <span className="text-xs text-gray-500 line-clamp-1">{scholarship.organization}</span>
          </div>
        </div>

        <button
          onClick={handleToggleSave}
          disabled={loading}
          className={`p-2 border rounded-xl hover:bg-gray-50 transition-colors shrink-0 ${
            saved ? 'text-grant bg-emerald-50 border-emerald-150' : 'text-gray-400 border-gray-200'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : saved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Stats Block */}
      <div className="flex items-center justify-between border-y border-gray-100 py-3 my-3">
        <div>
          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Award Amount</span>
          <span className="text-lg font-bold text-grant">{formattedAmount}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Deadline</span>
          <DeadlineCountdown deadline={scholarship.deadline} />
        </div>
      </div>

      {/* Description */}
      {scholarship.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
          {scholarship.description}
        </p>
      )}

      {/* Tracker Status Selector */}
      {saved && (
        <div className="mb-4 pt-2 border-t border-gray-100">
          <label className="text-[10px] text-gray-450 block uppercase tracking-wider font-semibold mb-1.5">
            Application Status
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['saved', 'applied', 'submitted'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider border text-center transition-all ${
                  status === st
                    ? 'bg-brand-primary border-brand-primary text-white font-bold'
                    : 'bg-white border-gray-200 text-gray-450 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer link */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 leading-none">Verified Source</span>
        <a
          href={scholarship.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
        >
          <span>Apply Direct</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
