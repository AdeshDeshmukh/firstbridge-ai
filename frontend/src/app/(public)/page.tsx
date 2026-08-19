import Link from 'next/link'
import { GraduationCap, ShieldCheck, Trophy, Sparkles, Compass, ArrowRight, Brain } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex-grow flex flex-col bg-brand-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-primary bg-indigo-50 border border-indigo-150">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SaaS Platform for First-Gen College Success</span>
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
              The Advisor You Never Had
            </h1>
            
            <p className="text-sm sm:text-base text-gray-550 leading-relaxed max-w-xl mx-auto">
              FirstBridge AI provides first-generation college students with three specialized AI advisors linked by cross-agent persistent memory.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Learn Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Emotional Hook */}
      <section className="py-12 bg-white border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Why FirstBridge Matters
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                33 million college students in the United States are first-generation. They navigate application letters, financial aid formulas, and career planning without family members who have done it before.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed font-semibold text-brand-primary italic">
                "Maria Hernandez wanted to study engineering. Without industry connections or mentors, she felt lost. FirstBridge became the advisor she never had."
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl space-y-4">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">The Enrollment Friction</h3>
              <ul className="space-y-3">
                <li className="flex gap-2 text-xs sm:text-sm text-gray-650">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-brand-primary stroke-[2.5px]" />
                  <span><strong>$46 Billion</strong> in scholarships go unclaimed annually.</span>
                </li>
                <li className="flex gap-2 text-xs sm:text-sm text-gray-650">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-brand-primary stroke-[2.5px]" />
                  <span><strong>72%</strong> of first-gen students lack professional mentorship.</span>
                </li>
                <li className="flex gap-2 text-xs sm:text-sm text-gray-650">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-brand-primary stroke-[2.5px]" />
                  <span><strong>$45,000</strong> is recovered in tuition for every student retained.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Advisors */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Meet Your AI Advisors</h2>
            <p className="text-sm text-gray-500 leading-normal">
              Three specialized agents sharing one persistent, cross-context memory bridge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vera */}
            <div className="border border-gray-200 bg-white rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-violet-50 text-vera rounded-2xl border border-violet-100 w-fit">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Vera — Story Narrative</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Vera guides you through structured conversations to extract key goals, strengths, and narrative topics for university essays.
                </p>
              </div>
            </div>

            {/* Grant */}
            <div className="border border-gray-200 bg-white rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 text-grant rounded-2xl border border-emerald-100 w-fit">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Grant — Scholarship Matcher</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Grant accesses the background details Vera learns to automatically recommend matching scholarships. Track deadlines on your calendar.
                </p>
              </div>
            </div>

            {/* Atlas */}
            <div className="border border-gray-200 bg-white rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 text-atlas rounded-2xl border border-blue-100 w-fit">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Atlas — Interview Coach</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Atlas provides mock interview practice, evaluating pacing, filler word triggers, and eye contact using in-browser analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Bridge Banner */}
      <section className="py-12 bg-indigo-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4 flex flex-col items-center">
          <Brain className="w-10 h-10 text-brand-primary bg-white p-2 rounded-2xl" />
          <h2 className="text-2xl font-bold">One Brain. Three Advisors.</h2>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-lg">
            Unlike fragmented tools, FirstBridge links all three domains. If you share an engineering project with Vera, Grant immediately maps it to scholarship guidelines, and Atlas targets engineering mock questions.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <span>Build Your Narrative</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
