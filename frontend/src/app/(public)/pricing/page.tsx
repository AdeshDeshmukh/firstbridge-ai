'use client'

import PageWrapper from '@/components/layout/PageWrapper'
import PricingCard from '@/components/pricing/PricingCard'
import PricingFAQ from '@/components/pricing/PricingFAQ'

export default function PricingPage() {
  const tiers = [
    {
      tier: 'Starter',
      price: '$999',
      description: 'Ideal for small colleges starting their first-gen student success pilot programs.',
      features: [
        'Up to 500 active students',
        'Vera (Story Narrative Advisor)',
        'Grant (Scholarship Matcher)',
        'Atlas (Careers & Interview Coach)',
        'Basic usage & outcomes dashboard',
        'Email customer support',
      ],
      buttonText: 'Start 14-Day Pilot',
      popular: false,
    },
    {
      tier: 'Growth',
      price: '$2,499',
      description: 'For growing universities looking to expand outcome retention across cohorts.',
      features: [
        'Up to 2,000 active students',
        'All AI advisors (Vera, Grant, Atlas)',
        'Full administrative analytics panel',
        'FERPA auditing logs & exports',
        'Stripe billing with student limits',
        'Priority email/chat support (SLA)',
      ],
      buttonText: 'Launch University Pilot',
      popular: true,
    },
    {
      tier: 'Enterprise',
      price: 'Custom',
      description: 'For large public state university systems requiring custom SLAs and limits.',
      features: [
        'Unlimited active student access',
        'Custom fine-tuned AI advisor templates',
        'Dedicated success account manager',
        'Custom integration into Canvas/Blackboard',
        '99.9% uptime service level agreement',
        'Dedicated instance deployments',
      ],
      buttonText: 'Contact University Relations',
      popular: false,
    },
  ]

  return (
    <PageWrapper className="space-y-12 py-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Flexible Pricing Tailored for Universities
        </h1>
        <p className="text-sm sm:text-base text-gray-550 leading-relaxed">
          Universities pay for student retention, students get expert guidance for free. Match awards, coach careers, and track retention ROI.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-6">
        {tiers.map((tier) => (
          <div key={tier.tier}>
            <PricingCard {...tier} />
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-200 my-8 w-full" />

      {/* FAQs */}
      <PricingFAQ />
    </PageWrapper>
  )
}
