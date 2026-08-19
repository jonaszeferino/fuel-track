import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'FuelTrack',
  description: 'Gerencie veículos e acompanhe o consumo de combustível',
  appleWebApp: {
    capable: true,
    title: 'FuelTrack',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f3d34',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
