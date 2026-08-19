import React from 'react'
import { HeartHandshake, Phone, ArrowRight, ExternalLink } from 'lucide-react'

interface DistressAlertProps {
  category: string // e.g. 'financial', 'academic', 'mental_health', etc.
}

interface ResourceItem {
  title: string
  desc: string
  actionText: string
  link: string
  isExternal?: boolean
}

export default function DistressAlert({ category }: DistressAlertProps) {
  const resourceDetails: Record<string, ResourceItem> = {
    financial: {
      title: 'Emergency Financial Support',
      desc: 'FirstBridge detected concerns regarding tuition or basic needs. Many universities offer emergency cash grants and food pantries.',
      actionText: 'Browse Emergency Grants',
      link: '/scholarships',
    },
    academic: {
      title: 'Academic Support Resources',
      desc: 'Navigating academic pressure is difficult. Your college provides free tutoring, writing centers, and dean of students emergency relief.',
      actionText: 'View Dashboard Resources',
      link: '/dashboard',
    },
    mental_health: {
      title: 'Student Wellness & Crisis Support',
      desc: 'If you are feeling overwhelmed, you are not alone. Free, confidential support is available 24/7.',
      actionText: 'Connect with 988 Suicide & Crisis Lifeline',
      link: 'https://988lifeline.org',
      isExternal: true,
    },
    general: {
      title: 'Support Resources Available',
      desc: 'We are here to bridge the gap. Browse our student success guides or connect with college mentors.',
      actionText: 'Explore Dashboard',
      link: '/dashboard',
    },
  }

  const resource =
    category === 'financial'
      ? resourceDetails.financial
      : category === 'academic'
      ? resourceDetails.academic
      : category === 'crisis' || category === 'self_harm'
      ? resourceDetails.mental_health
      : resourceDetails.general

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 animate-fade-in">
      <div className="flex items-start gap-3 text-amber-800">
        <HeartHandshake className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <h4 className="font-bold text-sm sm:text-base">{resource.title}</h4>
          <p className="text-xs sm:text-sm leading-relaxed mt-1 text-amber-700">
            {resource.desc}
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap gap-3 items-center justify-between border-t border-amber-150">
        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
          <Phone className="w-4 h-4" />
          <span>Need immediate help? Call/Text 988 (Lifeline)</span>
        </div>

        {resource.isExternal ? (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <span>{resource.actionText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <a
            href={resource.link}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <span>{resource.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
