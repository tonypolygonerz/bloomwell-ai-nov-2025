'use client'

import { signIn } from 'next-auth/react'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@bloomwell/ui'
import { PromotionalColumn } from '@/components/auth/promotional-column'
import { ProgressIndicator } from '@/components/auth/progress-indicator'

type PasswordStrength = 'weak' | 'medium' | 'strong'

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

interface FieldTouched {
  firstName: boolean
  lastName: boolean
  email: boolean
  password: boolean
  confirmPassword: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [fieldTouched, setFieldTouched] = useState<FieldTouched>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [formError, setFormError] = useState('')
  const [isOAuthVisible, setIsOAuthVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  const [focusedField, setFocusedField] = useState<keyof typeof formData | null>(null)

  // Update OAuth visibility based on form data
  // Show OAuth when all 4 main fields (firstName, lastName, email, password) are empty
  // Hide OAuth when any field has a value
  useEffect(() => {
    const hasFieldValues =
      formData.firstName || formData.lastName || formData.email || formData.password

    // Show OAuth immediately when all 4 fields are empty (regardless of focus state)
    setIsOAuthVisible(!hasFieldValues)
  }, [formData])

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password: string): PasswordStrength | null => {
    if (password.length === 0) return null

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return 'weak'
    if (strength <= 3) return 'medium'
    return 'strong'
  }, [])

  // Validate individual field
  const validateField = useCallback(
    (name: keyof typeof formData, value: string): string | undefined => {
      switch (name) {
        case 'firstName':
          if (!value.trim()) return 'First name is required'
          if (value.trim().length < 2) return 'First name must be at least 2 characters'
          return undefined
        case 'lastName':
          if (!value.trim()) return 'Last name is required'
          if (value.trim().length < 2) return 'Last name must be at least 2 characters'
          return undefined
        case 'email':
          if (!value.trim()) return 'Email is required'
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) return 'Please enter a valid email address'
          return undefined
        case 'password':
          if (!value) return 'Password is required'
          if (value.length < 8) return 'Password must be at least 8 characters'
          return undefined
        case 'confirmPassword':
          if (!value) return 'Please confirm your password'
          if (value !== formData.password) return 'Passwords do not match'
          return undefined
        default:
          return undefined
      }
    },
    [formData.password],
  )

  // Handle field focus - track which field is focused
  const handleFocus = useCallback((name: keyof typeof formData) => {
    setFocusedField(name)
    // OAuth visibility is handled by useEffect based on field values
    // It will hide if any field has a value, show if all are empty
  }, [])

  // Handle field blur for validation and OAuth visibility
  const handleBlur = useCallback(
    (name: keyof typeof formData) => {
      setFieldTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name, formData[name])
      setFieldErrors((prev) => ({ ...prev, [name]: error }))

      // Clear focused field - useEffect will handle OAuth visibility
      setFocusedField((prev) => (prev === name ? null : prev))
    },
    [formData, validateField],
  )

  // Handle field change
  const handleFieldChange = useCallback(
    (name: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setFormError('')

      // Real-time validation for touched fields
      if (fieldTouched[name]) {
        const error = validateField(name, value)
        setFieldErrors((prev) => ({ ...prev, [name]: error }))
      }

      // Special handling for password
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value))
        // Re-validate confirm password if it's been touched
        if (fieldTouched.confirmPassword) {
          setFormData((prev) => {
            const confirmError = validateField('confirmPassword', prev.confirmPassword)
            setFieldErrors((fieldErrors) => ({
              ...fieldErrors,
              confirmPassword: confirmError || '',
            }))
            return prev
          })
        }
      }

      // Special handling for confirm password
      if (name === 'confirmPassword' && fieldTouched.confirmPassword) {
        const error = validateField('confirmPassword', value)
        setFieldErrors((prev) => ({ ...prev, confirmPassword: error || '' }))
      }
    },
    [fieldTouched, validateField, calculatePasswordStrength, focusedField],
  )

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof typeof formData
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        errors[fieldName] = error
        isValid = false
      }
    })

    setFieldErrors(errors)
    // Mark all fields as touched
    setFieldTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    return isValid
  }, [formData, validateField])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim()
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || 'Registration failed. Please try again.')
        setIsLoading(false)
        return
      }

      // Sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setFormError('Account created but sign-in failed. Please try logging in.')
        setIsLoading(false)
        return
      }

      // Redirect to onboarding step 1
      router.push('/onboarding/step2')
    } catch (err) {
      setFormError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-200'
    if (passwordStrength === 'weak') return 'bg-red-500'
    if (passwordStrength === 'medium') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (!passwordStrength) return ''
    if (passwordStrength === 'weak') return 'Weak'
    if (passwordStrength === 'medium') return 'Medium'
    return 'Strong'
  }

  const isFieldValid = (name: keyof typeof formData) => {
    return fieldTouched[name] && !fieldErrors[name] && formData[name].length > 0
  }

  const isFieldInvalid = (name: keyof typeof formData) => {
    return fieldTouched[name] && !!fieldErrors[name]
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Promotional */}
      <div className="hidden lg:block lg:w-1/2">
        <PromotionalColumn />
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-[32px] font-bold leading-tight text-gray-900 lg:text-[36px]">
            Create your account
          </h1>
          <p className="mb-6 text-base text-gray-600">
            Start discovering grants in under 2 minutes
          </p>

          <ProgressIndicator currentStep={1} totalSteps={3} />

          {isOAuthVisible && (
            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/onboarding/step2' })}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
                aria-label="Sign up with Google"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-medium">Continue with Google</span>
              </button>
              <button
                type="button"
                onClick={() => signIn('azure-ad', { callbackUrl: '/onboarding/step2' })}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
                aria-label="Sign up with Microsoft 365"
              >
                <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" aria-hidden="true">
                  <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="0" width="10" height="10" fill="#7FBA00" />
                  <rect x="0" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                <span className="font-medium">Continue with Microsoft 365</span>
              </button>
            </div>
          )}

          {isOAuthVisible && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
            aria-label="Registration form"
          >
            {/* Form-level error */}
            {formError && (
              <div
                className="rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2"
                role="alert"
                aria-live="polite"
              >
                <svg
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  First name{' '}
                  <span className="text-red-600" aria-label="required">
                    *
                  </span>
                </label>
                <div className="relative">
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    onFocus={() => handleFocus('firstName')}
                    onBlur={() => handleBlur('firstName')}
                    error={isFieldInvalid('firstName')}
                    success={isFieldValid('firstName')}
                    required
                    aria-required="true"
                    aria-invalid={isFieldInvalid('firstName')}
                    aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                    autoComplete="given-name"
                  />
                  {isFieldValid('firstName') && (
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                {fieldErrors.firstName && (
                  <p
                    id="firstName-error"
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Last name{' '}
                  <span className="text-red-600" aria-label="required">
                    *
                  </span>
                </label>
                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={() => handleBlur('lastName')}
                    error={isFieldInvalid('lastName')}
                    success={isFieldValid('lastName')}
                    required
                    aria-required="true"
                    aria-invalid={isFieldInvalid('lastName')}
                    aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                    autoComplete="family-name"
                  />
                  {isFieldValid('lastName') && (
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                {fieldErrors.lastName && (
                  <p
                    id="lastName-error"
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                Email{' '}
                <span className="text-red-600" aria-label="required">
                  *
                </span>
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Work email address"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  error={isFieldInvalid('email')}
                  success={isFieldValid('email')}
                  required
                  aria-required="true"
                  aria-invalid={isFieldInvalid('email')}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  autoComplete="email"
                />
                {isFieldValid('email') && (
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              {fieldErrors.email && (
                <p
                  id="email-error"
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  role="alert"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                Password{' '}
                <span className="text-red-600" aria-label="required">
                  *
                </span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min. 8 characters)"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  error={isFieldInvalid('password')}
                  success={isFieldValid('password') && passwordStrength === 'strong'}
                  required
                  aria-required="true"
                  aria-invalid={isFieldInvalid('password')}
                  aria-describedby={
                    fieldErrors.password || passwordStrength
                      ? `password-error ${passwordStrength ? 'password-strength' : ''}`
                      : undefined
                  }
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-2" id="password-strength" aria-live="polite">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{
                          width:
                            passwordStrength === 'weak'
                              ? '33%'
                              : passwordStrength === 'medium'
                                ? '66%'
                                : '100%',
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    {passwordStrength && (
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength === 'weak'
                            ? 'text-red-600'
                            : passwordStrength === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="font-medium">Password requirements:</p>
                    <ul className="list-none space-y-0.5 ml-2">
                      <li
                        className={
                          formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                        }
                      >
                        <span className="mr-1">{formData.password.length >= 8 ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }
                      >
                        <span className="mr-1">
                          {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)
                            ? '✓'
                            : '○'}
                        </span>
                        Mix of uppercase and lowercase
                      </li>
                      <li
                        className={
                          /\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                        }
                      >
                        <span className="mr-1">{/\d/.test(formData.password) ? '✓' : '○'}</span>
                        At least one number
                      </li>
                      <li
                        className={
                          /[^a-zA-Z\d]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                        }
                      >
                        <span className="mr-1">
                          {/[^a-zA-Z\d]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  role="alert"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm Password{' '}
                <span className="text-red-600" aria-label="required">
                  *
                </span>
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onFocus={() => handleFocus('confirmPassword')}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={isFieldInvalid('confirmPassword')}
                  success={isFieldValid('confirmPassword')}
                  required
                  aria-required="true"
                  aria-invalid={isFieldInvalid('confirmPassword')}
                  aria-describedby={
                    fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined
                  }
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
                {isFieldValid('confirmPassword') && (
                  <svg
                    className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              {fieldErrors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  role="alert"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1E6F5C] text-white font-bold hover:bg-[#1a5d4d] py-3 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E6F5C] focus:ring-offset-2"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-700">
            By signing up, you agree to our{' '}
            <a
              href="/terms"
              className="text-gray-800 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-1 rounded"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="text-gray-800 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-1 rounded"
            >
              Privacy Policy
            </a>
            .
          </p>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-700">Already have an account? </span>
            <a
              href="/login"
              className="font-bold text-[#1E6F5C] underline hover:text-[#1a5d4d] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-1 rounded"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
