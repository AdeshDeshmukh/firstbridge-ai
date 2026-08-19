import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

interface PricingCardProps {
  tier: string
  price: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
}

export default function PricingCard({
  tier,
  price,
  description,
  features,
  buttonText,
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={`border rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative transition-all ${
        popular
          ? 'border-brand-primary bg-white shadow-xl scale-100 md:scale-105 ring-1 ring-brand-primary'
          : 'border-gray-200 bg-white/70 shadow-sm hover:shadow-md'
      }`}
    >
      {popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
          Most Popular
        </span>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{tier}</h3>
          <p className="text-xs text-gray-400 mt-1 leading-normal">{description}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">{price}</span>
          {price !== 'Custom' && <span className="text-sm text-gray-400">/month</span>}
        </div>

        <div className="h-px bg-gray-100 w-full" />

        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex gap-2.5 text-sm text-gray-600 leading-normal">
              <Check className="w-5 h-5 shrink-0 text-brand-primary stroke-[3px]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8">
        <Link
          href="/signup"
          className={`block w-full text-center py-3 px-4 font-semibold text-sm rounded-xl transition-all shadow-sm ${
            popular
              ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
              : 'bg-gray-55 hover:bg-gray-100 text-gray-800'
          }`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  )
}
