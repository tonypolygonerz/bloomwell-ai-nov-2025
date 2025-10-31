'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@bloomwell/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isOAuthVisible, setIsOAuthVisible] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/app')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold">Welcome Back</h1>
        <p className="mb-6 text-gray-600">Sign into your Bloomwell AI account</p>

        {isOAuthVisible && (
          <div className="mb-4 space-y-2">
            <Button
              className="w-full"
              onClick={() => signIn('google', { callbackUrl: '/app' })}
            >
              Continue with Google
            </Button>
            <Button
              className="w-full"
              onClick={() => signIn('azure-ad', { callbackUrl: '/app' })}
            >
              Continue with Microsoft 365
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setIsOAuthVisible(!e.target.value)
              }}
              placeholder="name@example.com"
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setIsOAuthVisible(!e.target.value)
              }}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="/forgot-password" className="text-brand hover:underline">
            Forgot Your Password?
          </a>
        </div>
        <div className="mt-2 text-center text-sm">
          <span className="text-gray-600">Don't have account? </span>
          <a href="/register" className="text-brand hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}

