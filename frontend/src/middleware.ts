import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Define paths that require authentication
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/story') ||
    pathname.startsWith('/scholarships') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/photo') ||
    pathname.startsWith('/interview')

  // 2. Define auth paths (guest only)
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/signup')

  // 3. Extract tokens/cookies
  // Supabase stores session tokens in cookies starting with "sb-"
  const allCookies = request.cookies.getAll()
  const hasAuthSession = allCookies.some(cookie => cookie.name.startsWith('sb-') && cookie.value)

  const hasConsent = request.cookies.get('fb_has_consent')?.value === 'true'
  const isOnboardingDone = request.cookies.get('fb_onboarding_done')?.value === 'true'

  // 4. Redirect guest trying to access protected paths
  if (isProtectedPath && !hasAuthSession) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 5. Redirect authenticated user trying to access login/signup
  if (isAuthPath && hasAuthSession) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // 6. Redirect authenticated user who has NOT granted consent to /consent
  if (isProtectedPath && hasAuthSession && !hasConsent && !pathname.startsWith('/consent')) {
    const consentUrl = new URL('/consent', request.url)
    return NextResponse.redirect(consentUrl)
  }

  // 7. Redirect authenticated user who has granted consent but not done onboarding to /onboarding
  if (isProtectedPath && hasAuthSession && hasConsent && !isOnboardingDone && !pathname.startsWith('/onboarding')) {
    const onboardingUrl = new URL('/onboarding', request.url)
    return NextResponse.redirect(onboardingUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/story/:path*',
    '/scholarships/:path*',
    '/settings/:path*',
    '/photo/:path*',
    '/interview/:path*',
    '/login',
    '/signup',
    '/consent',
    '/onboarding',
  ],
}
