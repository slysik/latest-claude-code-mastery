import type { Metadata } from 'next'
import { Poppins, Lora } from 'next/font/google'
import '@/styles/globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-lora',
  display: 'swap',
})

export function generateMetadata(): Metadata {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    title: 'Morning with Coffee & Claude',
    description: `Your daily Claude Code newspaper — ${today}`,
    openGraph: {
      title: 'Morning with Coffee & Claude',
      description: 'Your daily Claude Code ecosystem briefing',
      type: 'website',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable}`}>
      <body className="bg-anthropic-light text-anthropic-dark font-body antialiased">
        {children}
      </body>
    </html>
  )
}
