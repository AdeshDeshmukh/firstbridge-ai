'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, Circle, Sparkles, BrainCircuit } from 'lucide-react'

interface ProcessingStatusProps {
  status: 'processing' | 'completed' | 'failed' | 'idle'
}

export default function ProcessingStatus({ status }: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Simulation steps for progressive background display
  const steps = [
    { title: 'Uploading recording', desc: 'Saving mock video to Cloudflare R2' },
    { title: 'Extracting audio channels', desc: 'Isolating audio track via ffmpeg' },
    { title: 'Transcribing speech', desc: 'Polling transcripts from AssemblyAI' },
    { title: 'Calculating scoring metrics', desc: 'Merging eye-gaze and speech pace arrays' },
    { title: 'Generating Atlas feedback', desc: 'Fetching coaching review suggestions' },
  ]

  useEffect(() => {
    if (status !== 'processing') return

    // Progress step animation every 3 seconds to keep user updated
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 4500)

    return () => clearInterval(interval)
  }, [status])

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
          <BrainCircuit className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analysis In Progress</h2>
          <p className="text-xs text-gray-500">Atlas is scoring your performance. This takes about 30 seconds.</p>
        </div>
      </div>

      <div className="space-y-5">
        {steps.map((step, idx) => {
          const isDone = status === 'completed' || idx < currentStep
          const isActive = status === 'processing' && idx === currentStep
          const isFailed = status === 'failed' && idx === currentStep

          return (
            <div key={idx} className={`flex items-start gap-4 transition-all duration-300 ${
              isDone ? 'opacity-100' : isActive ? 'opacity-100 scale-[1.01]' : 'opacity-40'
            }`}>
              <div className="pt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                ) : isFailed ? (
                  <Circle className="w-5 h-5 text-rose-500 fill-rose-50" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${
                  isActive ? 'text-brand-primary font-bold' : 'text-gray-800'
                }`}>{step.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
