'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, LogOut, GraduationCap, Compass, BookOpen } from 'lucide-react'

export default function Navbar() {
  const { session, user, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/consent') || pathname.startsWith('/onboarding')

  if (isAuthPage) return null // Hide navbar completely on login/signup/consent flow

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2 text-brand-primary font-bold text-xl">
            <GraduationCap className="w-8 h-8" />
            <span>FirstBridge <span className="text-gray-900 font-medium">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-brand-primary' : 'text-gray-600 hover:text-gray-950'}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/story"
                  className={`text-sm font-medium transition-colors ${pathname === '/story' ? 'text-vera' : 'text-gray-600 hover:text-gray-950'}`}
                >
                  Vera (Story)
                </Link>
                <Link
                  href="/scholarships"
                  className={`text-sm font-medium transition-colors ${pathname === '/scholarships' ? 'text-grant' : 'text-gray-600 hover:text-gray-950'}`}
                >
                  Grant (Scholarships)
                </Link>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-xs text-gray-500 max-w-[120px] truncate">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors ${pathname === '/pricing' ? 'text-brand-primary' : 'text-gray-600 hover:text-gray-950'}`}
                >
                  Pricing
                </Link>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-950 transition-colors">
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary-hover transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="md:hidden glass border-t border-gray-100 flex flex-col px-4 py-4 gap-4 animate-fade-in">
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={toggleMenu}
                className={`text-base font-medium ${pathname === '/dashboard' ? 'text-brand-primary' : 'text-gray-600'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/story"
                onClick={toggleMenu}
                className={`text-base font-medium ${pathname === '/story' ? 'text-vera' : 'text-gray-600'}`}
              >
                Vera (Story)
              </Link>
              <Link
                href="/scholarships"
                onClick={toggleMenu}
                className={`text-base font-medium ${pathname === '/scholarships' ? 'text-grant' : 'text-gray-600'}`}
              >
                Grant (Scholarships)
              </Link>
              <div className="h-px bg-gray-150 w-full" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 truncate max-w-[180px]">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 font-medium text-red-500 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                onClick={toggleMenu}
                className={`text-base font-medium ${pathname === '/pricing' ? 'text-brand-primary' : 'text-gray-600'}`}
              >
                Pricing
              </Link>
              <Link
                href="/login"
                onClick={toggleMenu}
                className="text-base font-medium text-gray-600"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={toggleMenu}
                className="w-full text-center py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-hover"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
