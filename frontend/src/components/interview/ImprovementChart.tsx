'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { LandmarkFrame } from '../../hooks/useFaceAnalysis'
import { TrendingUp } from 'lucide-react'

interface ImprovementChartProps {
  frames: LandmarkFrame[]
}

export default function ImprovementChart({ frames }: ImprovementChartProps) {
  if (!frames || frames.length === 0) return null

  // Downsample frames if there are too many (aim for ~25-30 chart points max for clean render)
  const step = Math.max(1, Math.round(frames.length / 25))
  const chartData = []

  for (let i = 0; i < frames.length; i += step) {
    const f = frames[i]
    const timeSec = Math.round((f.timestamp - frames[0].timestamp) / 1000)
    
    // Dev calculate cumulative absolute head deviation
    const deviation = Math.abs(f.headPose.pitch) + Math.abs(f.headPose.yaw) + Math.abs(f.headPose.roll)
    const headStability = Math.max(0, Math.min(100, Math.round(100 - deviation * 2)))

    chartData.push({
      time: `${timeSec}s`,
      'Gaze Contact': f.gazeActive ? 100 : 0,
      'Head Stability': headStability,
    })
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Performance Timelines</h3>
          <p className="text-xs text-gray-500">Stability metrics mapped across the session duration</p>
        </div>
      </div>

      <div className="w-full h-64 text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis domain={[0, 100]} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '11px',
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="Head Stability"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Gaze Contact"
              stroke="#10b981"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
