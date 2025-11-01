import './globals.css'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  )
}
