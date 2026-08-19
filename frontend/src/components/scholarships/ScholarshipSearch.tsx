'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, RefreshCcw } from 'lucide-react'

interface ScholarshipSearchProps {
  onSearch: (filters: { query: string; major: string; minAmount: number }) => void
}

export default function ScholarshipSearch({ onSearch }: ScholarshipSearchProps) {
  const [query, setQuery] = useState('')
  const [major, setMajor] = useState('')
  const [minAmount, setMinAmount] = useState(0)

  const majorsList = [
    { label: 'All Majors', value: '' },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'STEM', value: 'STEM' },
    { label: 'General / Any', value: 'General' },
  ]

  const amountsList = [
    { label: 'Any Amount', value: 0 },
    { label: '≥ $1,000', value: 1000 },
    { label: '≥ $5,000', value: 5000 },
    { label: '≥ $10,000', value: 10000 },
  ]

  // Debounced Search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch({ query, major, minAmount })
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query, major, minAmount])

  const handleReset = () => {
    setQuery('')
    setMajor('')
    setMinAmount(0)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Search Input bar */}
      <div className="relative border border-gray-250 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary rounded-2xl p-1 flex items-center bg-gray-50/50">
        <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent focus:outline-none"
          placeholder="Search by scholarship name or organization..."
        />
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-grow sm:flex-initial">
          {/* Major Select */}
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 bg-white shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none"
            >
              {majorsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Select */}
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 bg-white shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none"
            >
              {amountsList.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Trigger */}
        {(query || major || minAmount > 0) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-primary transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  )
}
