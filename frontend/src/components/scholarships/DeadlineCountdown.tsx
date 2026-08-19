import React from 'react'
import { Calendar, AlertTriangle } from 'lucide-react'

interface DeadlineCountdownProps {
  deadline: string | Date
}

export default function DeadlineCountdown({ deadline }: DeadlineCountdownProps) {
  const deadlineDate = new Date(deadline)
  const today = new Date()
  
  // Calculate remaining days
  const timeDiff = deadlineDate.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  const getUrgencyStyles = (days: number) => {
    if (days < 0) {
      return {
        text: 'Expired',
        color: 'bg-red-50 text-red-500 border-red-150',
        icon: AlertTriangle,
      }
    }
    if (days <= 7) {
      return {
        text: `${days}d left`,
        color: 'bg-red-50 text-red-500 border-red-150 font-semibold animate-pulse',
        icon: AlertTriangle,
      }
    }
    if (days <= 30) {
      return {
        text: `${days}d left`,
        color: 'bg-amber-50 text-amber-600 border-amber-150 font-medium',
        icon: Calendar,
      }
    }
    return {
      text: `${days}d left`,
      color: 'bg-gray-50 text-gray-500 border-gray-150',
      icon: Calendar,
    }
  }

  const urgency = getUrgencyStyles(daysDiff)
  const Icon = urgency.icon

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] sm:text-xs px-2.5 py-1 rounded-full border ${urgency.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{urgency.text}</span>
    </span>
  )
}
