'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

// Simple helper to write cookies
function setCookie(name: string, value: string, days = 7) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `; expires=${date.toUTCString()}`
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`
}

// Simple helper to erase cookies
function eraseCookie(name: string) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  // Fetch profile status from backend to update state and cookies
  const syncProfileState = async (token: string | undefined) => {
    if (!token) {
      eraseCookie('fb_has_consent')
      eraseCookie('fb_onboarding_done')
      setProfile(null)
      setHasConsent(null)
      return
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setHasConsent(data.hasConsent)

        setCookie('fb_has_consent', String(data.hasConsent))
        setCookie('fb_onboarding_done', String(data.profile?.onboardingDone ?? false))
      }
    } catch (err) {
      console.error('Failed to sync user status from backend:', err)
    }
  }

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        await syncProfileState(session.access_token)
      } else {
        await syncProfileState(undefined)
      }
      setLoading(false)
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        await syncProfileState(session.access_token)
      } else {
        await syncProfileState(undefined)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    await syncProfileState(undefined)
    setLoading(false)
  }

  return {
    session,
    user,
    profile,
    hasConsent,
    loading,
    signOut,
    isAuthenticated: !!session,
    refreshState: () => syncProfileState(session?.access_token),
  }
}
