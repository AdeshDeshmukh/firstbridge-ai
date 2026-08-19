'use client'

import { useState, useEffect } from 'react'
import AgentChat from '@/components/agents/AgentChat'
import PageWrapper from '@/components/layout/PageWrapper'
import ScholarshipSearch from '@/components/scholarships/ScholarshipSearch'
import ScholarshipGrid from '@/components/scholarships/ScholarshipGrid'
import ApplicationTracker from '@/components/scholarships/ApplicationTracker'
import { apiClient } from '@/lib/api-client'
import { Compass, BookOpen } from 'lucide-react'

export default function ScholarshipsPage() {
  const [activeTab, setActiveTab] = useState<'matching' | 'tracker'>('matching')
  const [scholarships, setScholarships] = useState<any[]>([])
  const [savedScholarships, setSavedScholarships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    query: '',
    major: '',
    minAmount: 0,
  })

  // 1. Fetch recommendations or matching list
  const fetchScholarships = async () => {
    setLoading(true)
    try {
      if (activeTab === 'matching') {
        const res = await apiClient<{ data: any[] }>('/scholarships/recommendations', {
          params: {
            major: searchParams.major || undefined,
            minAmount: searchParams.minAmount || undefined,
          },
        })
        
        let list = res.data || []
        // Simple search query text filtering on client side for MVP debouncing
        if (searchParams.query) {
          const term = searchParams.query.toLowerCase()
          list = list.filter(
            (s) =>
              s.name.toLowerCase().includes(term) ||
              s.organization.toLowerCase().includes(term) ||
              (s.description && s.description.toLowerCase().includes(term))
          )
        }
        setScholarships(list)
      } else {
        const res = await apiClient<{ data: any[] }>('/scholarships/saved')
        setSavedScholarships(res.data || [])
      }
    } catch (err) {
      console.error('Failed to load scholarships list:', err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch saved items to count them on tabs
  const fetchSavedCount = async () => {
    try {
      const res = await apiClient<{ data: any[] }>('/scholarships/saved')
      setSavedScholarships(res.data || [])
    } catch (err) {
      console.error('Failed to get saved count:', err)
    }
  }

  useEffect(() => {
    fetchScholarships()
    fetchSavedCount()
  }, [activeTab, searchParams])

  const handleSearch = (filters: typeof searchParams) => {
    setSearchParams(filters)
  }

  return (
    <PageWrapper className="flex-grow flex flex-col">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-grow">
        {/* Chat with Grant Column */}
        <div className="flex-grow flex flex-col lg:w-5/12 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-grant rounded-xl border border-emerald-100 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Talk with Grant</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Grant uses Vera's story memory to matching financial awards.
              </p>
            </div>
          </div>

          <AgentChat
            agentType="grant"
            placeholder="Ask Grant about engineering scholarships or financial statement help..."
            onFactsUpdated={fetchScholarships}
          />
        </div>

        {/* Scholarships List Column */}
        <div className="flex-grow flex flex-col lg:w-7/12 space-y-4">
          {/* Navigation Tabs */}
          <ApplicationTracker
            currentTab={activeTab}
            onTabChange={setActiveTab}
            savedCount={savedScholarships.length}
          />

          {activeTab === 'matching' ? (
            <>
              {/* Filters */}
              <ScholarshipSearch onSearch={handleSearch} />

              {/* Grid View */}
              <div className="flex-grow max-h-[52vh] sm:max-h-[58vh] overflow-y-auto custom-scrollbar pr-1">
                <ScholarshipGrid
                  scholarships={scholarships}
                  loading={loading}
                  onSaveToggle={fetchSavedCount}
                />
              </div>
            </>
          ) : (
            <div className="flex-grow max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              <ScholarshipGrid
                scholarships={savedScholarships}
                loading={loading}
                onSaveToggle={fetchScholarships}
              />
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
