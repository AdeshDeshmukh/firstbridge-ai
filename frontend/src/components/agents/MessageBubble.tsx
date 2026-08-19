import React from 'react'
import { Sparkles, Compass, BookOpen, User } from 'lucide-react'

interface MessageBubbleProps {
  role: 'student' | 'agent' | 'user' | 'assistant'
  content: string
  agentType: 'vera' | 'grant' | 'atlas'
}

export default function MessageBubble({ role, content, agentType }: MessageBubbleProps) {
  const isUser = role === 'student' || role === 'user'

  const agentDetails = {
    vera: {
      name: 'Vera',
      color: 'bg-violet-50 text-vera border-violet-100',
      icon: Sparkles,
      bubbleColor: 'bg-white text-gray-900 border border-gray-150',
    },
    grant: {
      name: 'Grant',
      color: 'bg-emerald-50 text-grant border-emerald-100',
      icon: Compass,
      bubbleColor: 'bg-white text-gray-900 border border-gray-150',
    },
    atlas: {
      name: 'Atlas',
      color: 'bg-blue-50 text-atlas border-blue-100',
      icon: BookOpen,
      bubbleColor: 'bg-white text-gray-900 border border-gray-150',
    },
  }

  const agentInfo = agentDetails[agentType]
  const AgentIcon = agentInfo.icon

  return (
    <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
          isUser
            ? 'bg-brand-primary-light border-brand-primary text-brand-primary'
            : agentInfo.color
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <AgentIcon className="w-5 h-5" />}
      </div>

      {/* Bubble Box */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-bold tracking-wide uppercase text-gray-400">
            {isUser ? 'You' : agentInfo.name}
          </span>
        </div>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
            isUser
              ? 'bg-brand-primary text-white font-medium'
              : agentInfo.bubbleColor
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
