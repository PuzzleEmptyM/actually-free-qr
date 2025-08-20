import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Actually Free QR — No watermark, no paywalls',
  description: '100% client-side QR generator. Free forever. PNG export. No login.',
  manifest: '/manifest.json',
  themeColor: '#111827',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [
    { rel: 'icon', url: '/favicon.ico' }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
