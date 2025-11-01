'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@bloomwell/ui'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isOAuthVisible, setIsOAuthVisible] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Registration failed')
        return
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful but login failed. Please try logging in.')
      } else {
        router.push('/app')
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold">Create Your Account</h1>
        <p className="mb-6 text-gray-600">
          Join thousands of nonprofits already using Bloomwell AI
        </p>

        {isOAuthVisible && (
          <div className="mb-4 space-y-2">
            <Button className="w-full" onClick={() => signIn('google', { callbackUrl: '/app' })}>
              Continue with Google
            </Button>
            <Button className="w-full" onClick={() => signIn('azure-ad', { callbackUrl: '/app' })}>
              Continue with Microsoft 365
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value })
                  setIsOAuthVisible(!e.target.value)
                }}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value })
                  setIsOAuthVisible(!e.target.value)
                }}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                setIsOAuthVisible(!e.target.value)
              }}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                setIsOAuthVisible(!e.target.value)
              }}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Start Your 14-Day Free Trial • No Credit Card Required
        </p>
        <div className="mt-2 text-center text-sm">
          <span className="text-gray-600">Already have account? </span>
          <a href="/login" className="text-brand hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
