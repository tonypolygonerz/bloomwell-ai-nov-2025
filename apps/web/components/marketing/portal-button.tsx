'use client'

import { useState } from 'react'
import { Button } from '@bloomwell/ui'

export function PortalButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscribe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to open billing portal. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Billing & Payment Methods'}
    </Button>
  )
}



