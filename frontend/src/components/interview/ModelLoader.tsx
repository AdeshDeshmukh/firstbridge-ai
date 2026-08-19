'use client'

import React from 'react'
import { Sparkles, BrainCircuit } from 'lucide-react'

interface ModelLoaderProps {
  progress: number
}

export default function ModelLoader({ progress }: ModelLoaderProps) {
  // Map progress to informative UI states
  const getStatusText = (prog: number) => {
    if (prog < 30) return 'Retrieving tracking models from cloud storage...'
    if (prog < 75) return 'Downloading visual landmarker components...'
    if (prog < 100) return 'Caching model in local database for future visits...'
    return 'Initializing face tracking and gaze analyzers...'
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm max-w-lg mx-auto animate-fade-in text-center">
      <div className="mx-auto w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6 animate-pulse">
        <BrainCircuit className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Preparing Interview Intelligence</h2>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">
        We load the eye contact tracker in your browser so no facial video ever leaves your machine.
      </p>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-brand-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percent & Status */}
        <div className="flex justify-between items-center text-xs px-1">
          <span className="font-semibold text-brand-primary">{progress}% Loaded</span>
          <span className="text-gray-400">15.4 MB total</span>
        </div>

        <p className="text-xs font-medium text-gray-600 animate-pulse pt-2">
          {getStatusText(progress)}
        </p>
      </div>
    </div>
  )
}
