'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export default function PricingFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: 'Why do universities pay while students use FirstBridge for free?',
      answer:
        'University enrollment retention is critical. Retaining just one student recovers up to $45,000 in tuition. FirstBridge supports B2B2C licensing, enabling universities to provide advanced AI mentorship to first-gen students without placing financial burdens on the students.',
    },
    {
      question: 'How does cross-agent memory sync work?',
      answer:
        'Vera analyzes your conversations to extract structured facts (major, university, goals). These facts are securely stored and injected into Grant and Atlas prompts. You never have to repeat your narrative to different advisors.',
    },
    {
      question: 'Is my student data secure and private?',
      answer:
        'Yes. We operate with strict data governance. All data handling is FERPA-aligned. You maintain full rights to inspect, export, or permanently delete all your conversation history and video files instantly from settings.',
    },
    {
      question: 'Can I cancel or change my plan anytime?',
      answer:
        'Absolutely. University subscriptions can be upgraded, downgraded, or canceled at the end of each billing period via our Stripe customer portal.',
    },
  ]

  const handleToggle = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Have questions about pricing, university compliance, or data security? We have answers.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isExpanded = expandedIndex === idx
          return (
            <div
              key={idx}
              className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => handleToggle(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-gray-900 text-sm sm:text-base focus:outline-none cursor-pointer"
              >
                <span>{faq.question}</span>
                {isExpanded ? (
                  <Minus className="w-5 h-5 shrink-0 text-brand-primary" />
                ) : (
                  <Plus className="w-5 h-5 shrink-0 text-brand-primary" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
