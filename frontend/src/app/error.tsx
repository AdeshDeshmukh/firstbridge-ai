'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Frontend error occurred:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-4 bg-red-50 rounded-full text-red-500 mb-6">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong!</h1>
      <p className="text-gray-600 max-w-md mb-8">
        We encountered an unexpected error. Don't worry, your data is safe. Let's try reloading the application.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-hover transition-colors shadow-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  )
}
