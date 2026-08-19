import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border border-gray-150 rounded-2xl w-fit shadow-sm">
      <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" />
      <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" />
      <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" />
    </div>
  )
}
