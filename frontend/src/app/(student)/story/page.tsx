'use client'

import { useState, useEffect } from 'react'
import AgentChat from '@/components/agents/AgentChat'
import ProfileFacts from '@/components/agents/ProfileFacts'
import PageWrapper from '@/components/layout/PageWrapper'
import { apiClient } from '@/lib/api-client'
import { Sparkles, MessageSquare } from 'lucide-react'

export default function StoryPage() {
  const [facts, setFacts] = useState<any>(null)
  const [loadingFacts, setLoadingFacts] = useState(true)

  const fetchFacts = async () => {
    try {
      const response = await apiClient<{ facts: any }>('/agents/memory')
      setFacts(response.facts || null)
    } catch (err) {
      console.error('Failed to fetch profile facts:', err)
    } finally {
      setLoadingFacts(false)
    }
  }

  useEffect(() => {
    fetchFacts()
  }, [])

  return (
    <PageWrapper className="flex-grow flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 items-stretch flex-grow">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col md:w-2/3 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 text-vera rounded-xl border border-violet-100 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Talk with Vera</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Vera helps construct your personal narrative and college essay topics.
              </p>
            </div>
          </div>

          <AgentChat
            agentType="vera"
            placeholder="Share details about your background, achievements, or concerns..."
            onFactsUpdated={fetchFacts}
          />
        </div>

        {/* AI Memory Sidebar */}
        <div className="w-full md:w-1/3 flex flex-col shrink-0">
          <div className="sticky top-20 space-y-4">
            <ProfileFacts facts={facts} loading={loadingFacts} />
            <div className="bg-violet-50/50 border border-violet-100 rounded-3xl p-4 text-xs text-violet-850 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-vera">
                <MessageSquare className="w-4 h-4" />
                <span>Story Advisor Tips</span>
              </div>
              <p>
                As you chat with Vera, she will automatically capture key facts about your experiences, goals, strengths, and concerns. 
              </p>
              <p>
                This persistent memory will automatically match scholarships in Grant's module and customize mock interviews with Atlas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
