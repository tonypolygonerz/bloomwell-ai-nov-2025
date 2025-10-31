import Link from 'next/link'
import { Button } from '@bloomwell/ui'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo + Brand Name */}
        <Link href="/" className="flex items-center gap-3">
          {/* Logo: Green square with lightning bolt */}
          <div className="relative h-8 w-8 rounded-md bg-gradient-to-br from-brand via-brand to-brand/90 flex items-center justify-center shadow-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 1.5L4 8H7V12.5L11 6H7.5V1.5Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-black">Bloomwell AI</span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden items-center space-x-6 md:flex">
          <Link href="#features" className="text-gray-700 hover:text-brand">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-700 hover:text-brand">
            Pricing
          </Link>
          <Link href="/webinars" className="text-gray-700 hover:text-brand">
            Webinars
          </Link>
          <Link href="#testimonials" className="text-gray-700 hover:text-brand">
            Testimonials
          </Link>
        </div>

        {/* Right Side: Sign In + CTA Button */}
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-brand">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="flex items-center gap-1.5 font-bold">
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

