'use client'

import { useState } from 'react'
import { Button, Input } from '@bloomwell/ui'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Failed to send reset email')
      } else {
        setMessage('Password reset link sent to your email')
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold">Reset Your Password</h1>
        <p className="mb-6 text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="/login" className="text-brand hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}

