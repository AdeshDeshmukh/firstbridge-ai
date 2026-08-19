'use client'

import React from 'react'
import { Eye, HelpCircle, User, Compass } from 'lucide-react'

interface LiveFeedbackProps {
  isGazeAligned: boolean
  pitch: number
  yaw: number
}

export default function LiveFeedback({ isGazeAligned, pitch, yaw }: LiveFeedbackProps) {
  // Determine alignment states
  const absYaw = Math.abs(yaw)
  const absPitch = Math.abs(pitch)

  let poseStatus = 'Centered'
  let poseColorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'
  let poseNote = 'Stable head posture'

  if (absYaw > 15 || absPitch > 15) {
    poseStatus = 'Off Center'
    poseColorClass = 'text-amber-600 bg-amber-50 border-amber-100'
    poseNote = absYaw > absPitch 
      ? 'Look directly at camera'
      : 'Level your head height'
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase text-center block">Real-time Gaze</span>

      {/* Eye Contact Indicator */}
      <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
        isGazeAligned 
          ? 'bg-emerald-50/55 border-emerald-200/60 text-emerald-800' 
          : 'bg-rose-50/55 border-rose-200/60 text-rose-800'
      }`}>
        <Eye className={`w-8 h-8 mb-2 ${isGazeAligned ? 'text-emerald-600' : 'text-rose-600 animate-bounce'}`} />
        <span className="text-xs font-bold uppercase tracking-wider">Eye Contact</span>
        <span className="text-base font-extrabold mt-0.5">
          {isGazeAligned ? 'Aligned' : 'Looking Away'}
        </span>
        <p className="text-[10px] text-gray-500 mt-1 leading-normal max-w-[150px]">
          {isGazeAligned ? 'Great focus on camera' : 'Try looking at camera center'}
        </p>
      </div>

      {/* Head Pose Indicator */}
      <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${poseColorClass}`}>
        <User className="w-8 h-8 mb-2" />
        <span className="text-xs font-bold uppercase tracking-wider">Head posture</span>
        <span className="text-base font-extrabold mt-0.5">{poseStatus}</span>
        <p className="text-[10px] text-gray-500 mt-1 leading-normal max-w-[150px]">
          {poseNote}
        </p>
      </div>
    </div>
  )
}
