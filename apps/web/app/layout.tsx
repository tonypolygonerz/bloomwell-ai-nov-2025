import './globals.css'
import React from 'react'
import { SessionProvider } from '@/components/providers/session-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
