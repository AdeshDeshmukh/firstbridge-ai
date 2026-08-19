import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'FirstBridge AI — The Advisor You Never Had',
  description: 'FirstBridge AI gives first-generation college students specialized AI advisors with cross-agent persistent memory: Vera (Story), Grant (Scholarships), and Atlas (Careers).',
  openGraph: {
    title: 'FirstBridge AI — The Advisor You Never Had',
    description: 'FirstBridge AI gives first-generation college students specialized AI advisors with cross-agent persistent memory.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FirstBridge AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-brand-background text-gray-900 antialiased font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16 flex flex-col">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
