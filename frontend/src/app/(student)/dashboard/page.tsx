'use client'

import { useState, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import QuickStats from '@/components/dashboard/QuickStats'
import ModuleCard from '@/components/dashboard/ModuleCard'
import AlertBanner from '@/components/dashboard/AlertBanner'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
import { Sparkles, Compass, BookOpen, Brain, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    scholarshipsCount: 0,
    factsCount: 0,
    completeness: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      // 1. Fetch facts count
      let factsCount = 0
      try {
        const memRes = await apiClient<{ facts: any }>('/agents/memory')
        const facts = memRes.facts?.structuredFacts || {}
        const goals = facts.goals || []
        const concerns = facts.concerns || []
        const strengths = facts.strengths || []
        const keyExperiences = facts.keyExperiences || []
        factsCount = goals.length + concerns.length + strengths.length + keyExperiences.length
      } catch (err) {
        console.error('Failed to load memory facts stats:', err)
      }

      // 2. Fetch matched scholarships count
      let scholarshipsCount = 0
      try {
        const scholarRes = await apiClient<{ data: any[] }>('/scholarships/recommendations')
        scholarshipsCount = scholarRes.data?.length || 0
      } catch (err) {
        console.error('Failed to load scholarships recommendations stats:', err)
      }

      setStats({
        scholarshipsCount,
        factsCount,
        completeness: profile?.profileComplete || 60, // default placeholder profile completeness
      })
    } catch (err) {
      console.error('Dashboard stats fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [profile])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs">Loading student dashboard...</span>
      </div>
    )
  }

  const studentName = profile?.firstName || 'Student'

  return (
    <PageWrapper className="space-y-8 flex-grow">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {studentName} 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-normal">
          Manage your narratives, search for financial awards, and prepare for interviews in one single interface.
        </p>
      </div>

      {/* Dismissible Alert Banner */}
      <AlertBanner />

      {/* Quick Stats Grid */}
      <QuickStats
        scholarshipCount={stats.scholarshipsCount}
        factsCount={stats.factsCount}
        completeness={stats.completeness}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Module 1: Vera (Story) */}
        <div>
          <ModuleCard
            title="Narrative Builder"
            description="Converse with Vera to extract details of your personal experiences and achievements. Build your essay narrative structure."
            advisorName="Vera"
            icon={Sparkles}
            link="/story"
            colorClass="text-vera hover:text-violet-700"
            accentClass="bg-violet-50 text-vera border border-violet-100"
          />
        </div>

        {/* Module 2: Grant (Scholarships) */}
        <div>
          <ModuleCard
            title="Scholarship Matching"
            description="Grant references your narrative history to suggest matching financial awards. Manage deadlines and requirements."
            advisorName="Grant"
            icon={Compass}
            link="/scholarships"
            colorClass="text-grant hover:text-emerald-700"
            accentClass="bg-emerald-50 text-grant border border-emerald-100"
          />
        </div>

        {/* Module 3: Atlas (Careers) */}
        <div>
          <ModuleCard
            title="Interview Preparation"
            description="Atlas analyzes your posture, gaze, and speech flow in-browser to coach you through mock interview sessions."
            advisorName="Atlas"
            icon={BookOpen}
            link="/interview"
            colorClass="text-atlas hover:text-blue-700"
            accentClass="bg-blue-50 text-atlas border border-blue-100"
          />
        </div>
      </div>

      {/* Recent Activities feed */}
      <RecentActivity />
    </PageWrapper>
  )
}
