'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, Camera, Mic, ShieldAlert, Sparkles } from 'lucide-react'

interface BrowserCheckProps {
  onPassed: () => void
}

export default function BrowserCheck({ onPassed }: BrowserCheckProps) {
  const [checking, setChecking] = useState(true)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [hasMic, setHasMic] = useState<boolean | null>(null)
  const [isSecure, setIsSecure] = useState<boolean | null>(null)
  const [browserSupported, setBrowserSupported] = useState<boolean | null>(null)

  useEffect(() => {
    async function runChecks() {
      // 1. Verify HTTPS / Secure Context
      const secure = window.isSecureContext || window.location.hostname === 'localhost'
      setIsSecure(secure)

      // 2. Verify browser support (needs MediaDevices and WebGL)
      const support = !!(navigator.mediaDevices && window.WebGLRenderingContext)
      setBrowserSupported(support)

      // 3. Request permissions to verify camera & mic availability
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setHasCamera(true)
        setHasMic(true)
        
        // Stop stream immediately after check
        stream.getTracks().forEach((track) => track.stop())
      } catch (err) {
        console.warn('[BrowserCheck] Permission denied or media devices missing:', err)
        setHasCamera(false)
        setHasMic(false)
      }

      setChecking(false)
    }

    runChecks()
  }, [])

  const checksPassed = hasCamera && hasMic && isSecure && browserSupported

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Setup Verification</h2>
          <p className="text-xs text-gray-500">Checking device permissions and browser capabilities</p>
        </div>
      </div>

      {checking ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-600">Running compatibility tests...</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {/* HTTPS Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-5 h-5 ${isSecure ? 'text-emerald-500' : 'text-rose-500'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">Secure Context (HTTPS)</p>
                <p className="text-xs text-gray-500">Required for media device access</p>
              </div>
            </div>
            {isSecure ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50/50" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 fill-rose-50/50" />
            )}
          </div>

          {/* Browser Support Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`w-5 h-5 ${browserSupported ? 'text-emerald-500' : 'text-rose-500'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">Browser Compatibility</p>
                <p className="text-xs text-gray-500">Supports WebGL and WebAssembly</p>
              </div>
            </div>
            {browserSupported ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50/50" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 fill-rose-50/50" />
            )}
          </div>

          {/* Camera Permission Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Camera className={`w-5 h-5 ${hasCamera ? 'text-emerald-500' : 'text-rose-500'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">Camera Permissions</p>
                <p className="text-xs text-gray-500">Needed for facial landmarker tracking</p>
              </div>
            </div>
            {hasCamera ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50/50" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 fill-rose-50/50" />
            )}
          </div>

          {/* Microphone Permission Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Mic className={`w-5 h-5 ${hasMic ? 'text-emerald-500' : 'text-rose-500'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800">Microphone Permissions</p>
                <p className="text-xs text-gray-500">Required for speech analysis</p>
              </div>
            </div>
            {hasMic ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50/50" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 fill-rose-50/50" />
            )}
          </div>
        </div>
      )}

      {!checking && (
        <div className="space-y-4">
          {checksPassed ? (
            <button
              onClick={onPassed}
              className="w-full py-3.5 bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              Continue to Model Load
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 leading-relaxed">
                <strong>Checks Failed:</strong> Please grant camera and microphone access when prompted, and ensure you are using a secure context (HTTPS or localhost). Re-enter the page to try again.
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-gray-100 text-gray-700 hover:bg-gray-200/80 font-semibold rounded-xl transition-all"
              >
                Reload and Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
