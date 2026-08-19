'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaceLandmarker } from '@mediapipe/tasks-vision'
import { useFaceAnalysis, LandmarkFrame } from '../../hooks/useFaceAnalysis'
import LiveFeedback from './LiveFeedback'
import { Camera, StopCircle, Loader2, PlayCircle, Eye, AlertCircle, AlertTriangle } from 'lucide-react'

interface VideoRecorderProps {
  landmarker: FaceLandmarker
  questionPrompt: string
  onSave: (videoBlob: Blob, gazeFrames: LandmarkFrame[]) => void
}

export default function VideoRecorder({ landmarker, questionPrompt, onSave }: VideoRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes max
  const [cameraActive, setCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationFrameRef = useRef<number | null>(null)

  const { isGazeAligned, headPose, getCollectedFrames } = useFaceAnalysis({
    landmarker,
    videoRef,
    isActive: recording,
  })

  // Initialize camera stream
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: true,
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          setCameraActive(true)
        }
      } catch (err) {
        console.error('[VideoRecorder] Failed to open camera stream:', err)
      }
    }

    startCamera()

    return () => {
      stopCamera()
    }
  }, [])

  // Drawing facial landmarks overlay mesh in real-time
  useEffect(() => {
    if (!recording || !canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    function drawMesh() {
      if (!recording || !ctx) return

      // Adjust canvas resolution to match container
      if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
        canvas.width = video.clientWidth
        canvas.height = video.clientHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Run detect on demand for canvas drawings
      const timestamp = performance.now()
      const result = landmarker.detectForVideo(video, timestamp)

      if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0]

        // Draw landmarks as soft neon dots
        ctx.fillStyle = isGazeAligned ? 'rgba(79, 70, 229, 0.45)' : 'rgba(239, 68, 68, 0.5)'
        
        // Draw selection of landmarks to represent face mesh shape clearly without overload
        for (let i = 0; i < landmarks.length; i += 3) {
          const pt = landmarks[i]
          ctx.beginPath()
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1.2, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Draw Iris highlights
        ctx.fillStyle = isGazeAligned ? '#10b981' : '#ef4444'
        const irisIndices = [468, 473] // left and right centers
        irisIndices.forEach((idx) => {
          const pt = landmarks[idx]
          if (pt) {
            ctx.beginPath()
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, 2 * Math.PI)
            ctx.fill()
          }
        })
      }

      animationFrameRef.current = requestAnimationFrame(drawMesh)
    }

    drawMesh()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [recording, landmarker, isGazeAligned])

  // Timer Countdown loop
  useEffect(() => {
    if (!recording) return

    const timerId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          stopRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [recording])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const startRecording = () => {
    if (!streamRef.current) return
    chunksRef.current = []

    // 1. Initialize MediaRecorder
    const options = { mimeType: 'video/webm;codecs=vp9,opus' }
    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(streamRef.current, options)
    } catch (e) {
      recorder = new MediaRecorder(streamRef.current) // fallback
    }

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    recorder.onstop = async () => {
      setSaving(true)
      const videoBlob = new Blob(chunksRef.current, { type: 'video/mp4' })
      const collectedFrames = getCollectedFrames()

      await onSave(videoBlob, collectedFrames)
      setSaving(false)
    }

    mediaRecorderRef.current = recorder
    recorder.start(1000) // collect data chunks every 1 second
    setRecording(true)
    setTimeRemaining(120)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      stopCamera()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Dynamic Question Prompt Card */}
      <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 text-center shadow-sm">
        <span className="text-[10px] font-bold tracking-wider uppercase text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">Active Question</span>
        <h3 className="text-lg font-bold text-gray-900 mt-2 max-w-2xl mx-auto leading-snug">
          "{questionPrompt}"
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stream Canvas + Camera Area */}
        <div className="md:col-span-3 relative bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden aspect-video shadow-lg group">
          {!cameraActive && !saving && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <Camera className="w-12 h-12 mb-3 text-gray-600 animate-pulse" />
              <p className="text-sm font-medium">Starting camera stream...</p>
            </div>
          )}

          {saving && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm text-white">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
              <p className="text-base font-semibold">Packaging Interview Video...</p>
              <p className="text-xs text-gray-400 mt-1">Transcribing speech and compiling eye-gaze data</p>
            </div>
          )}

          {/* Video Stream Tag */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // mirror view
          />

          {/* Landmarks mesh Overlay canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
          />

          {/* Recording Timer Badge */}
          {recording && (
            <div className="absolute top-4 left-4 bg-rose-600 text-white font-mono font-bold text-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow animate-pulse">
              <span className="w-2.5 h-2.5 bg-white rounded-full" />
              REC {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Live Metrics / Alignment Panel */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <LiveFeedback isGazeAligned={isGazeAligned} pitch={headPose.pitch} yaw={headPose.yaw} />

          {/* Control Button Area */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3 justify-center">
            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase text-center block">Controls</span>
            
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={!cameraActive}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow active:scale-[0.98] disabled:opacity-50"
              >
                <PlayCircle className="w-5 h-5" />
                Start Record
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow active:scale-[0.98]"
              >
                <StopCircle className="w-5 h-5" />
                Stop & Process
              </button>
            )}

            <div className="text-[10px] text-gray-400 text-center leading-normal px-2">
              Maximum record time is 2 minutes. Press stop to process scores.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
