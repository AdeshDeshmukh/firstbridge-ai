import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-4 bg-indigo-50 rounded-full text-brand-primary mb-6">
        <Compass className="w-12 h-12 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-600 max-w-md mb-8">
        The page you are looking for doesn't exist or has been relocated. Let's get you back on track.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-hover transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Safety
      </Link>
    </div>
  )
}
