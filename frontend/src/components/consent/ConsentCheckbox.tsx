'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

interface ConsentCheckboxProps {
  id: string
  title: string
  description: string
  required?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function ConsentCheckbox({
  title,
  description,
  required = false,
  checked,
  onChange,
}: ConsentCheckboxProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
              checked
                ? 'bg-brand-primary border-brand-primary text-white'
                : 'border-gray-300 hover:border-brand-primary bg-white'
            }`}
          >
            {checked && <Check className="w-4 h-4 stroke-[3px]" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{title}</span>
              {required ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-150">
                  Required
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-150">
                  Optional
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <div className="mt-2 pl-9">
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
          {description}
        </p>
        
        {expanded && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
            <strong>FERPA Notice:</strong> Under the Family Educational Rights and Privacy Act (FERPA), you maintain the right to inspect, review, and withdraw access to these records at any time. FirstBridge secures these transfers with industry-standard TLS encryption.
          </div>
        )}
      </div>
    </div>
  )
}
