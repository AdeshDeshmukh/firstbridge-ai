'use client'

import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api-client'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import DistressAlert from './DistressAlert'
import { Send, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { randomUUID } from 'crypto'

interface Message {
  id: string
  role: 'student' | 'agent' | 'user' | 'assistant'
  content: string
  createdAt: string
}

interface AgentChatProps {
  agentType: 'vera' | 'grant' | 'atlas'
  placeholder?: string
  onFactsUpdated?: () => void
}

export default function AgentChat({ agentType, placeholder, onFactsUpdated }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [distressCategory, setDistressCategory] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 1. Fetch History on Mount
  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await apiClient<{ data: Message[] }>(`/agents/${agentType}/history`)
      const sorted = response.data || []
      setMessages(sorted)
      if (sorted.length > 0) {
        // Use the session ID of the last message to group conversations
        const lastMsg = sorted[sorted.length - 1] as any
        setSessionId(lastMsg.sessionId || null)
      }
    } catch (err: any) {
      console.error('Failed to load history:', err)
      toast.error('Failed to restore conversation history.')
    } finally {
      setLoadingHistory(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [agentType])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // 2. Submit Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessageText = input.trim()
    setInput('')
    setLoading(true)

    // Optimistic Update: append local message
    const tempId = Math.random().toString()
    const newMsg: Message = {
      id: tempId,
      role: 'user',
      content: userMessageText,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMsg])

    try {
      // Setup idempotency keys
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)

      const response = await apiClient<{ reply: string; sessionId: string; crisisResource?: string }>(
        `/${agentType}/message`,
        {
          method: 'POST',
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            message: userMessageText,
            sessionId: sessionId || undefined,
          }),
        }
      )

      // Update state with server values
      setSessionId(response.sessionId)
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, content: userMessageText } : m))
      )

      // Add advisor reply
      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: response.reply,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Handle distress triggers
      if (response.crisisResource) {
        setDistressCategory(response.crisisResource)
      }

      // Sync AI persistent memory chips
      if (onFactsUpdated) {
        onFactsUpdated()
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      // Rollback optimism on connection errors
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error(err.message || 'Failed to send message. Please check connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[70vh] sm:h-[75vh] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Messages Window */}
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 bg-gray-50/50">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs">Restoring secure conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 space-y-3">
            <div className="p-4 bg-indigo-50/30 rounded-full text-brand-primary">
              <RefreshCw className="w-8 h-8 stroke-1" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">No messages yet</h4>
              <p className="text-xs leading-relaxed max-w-[200px] mx-auto mt-1">
                Start typing below to converse with your advisor.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              agentType={agentType}
            />
          ))
        )}

        {loading && <TypingIndicator />}

        {distressCategory && (
          <div className="pt-2">
            <DistressAlert category={distressCategory} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 bg-white">
        <div className="flex items-center gap-2 border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || loadingHistory}
            className="flex-grow px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            placeholder={placeholder || 'Send a message...'}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || loadingHistory}
            className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
