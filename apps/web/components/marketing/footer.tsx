'use client'

import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="bg-brand-navy text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.5 1.5L4 8H7V12.5L11 6H7.5V1.5Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-lg">Bloomwell AI</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering nonprofits with AI-driven grant discovery and management tools. Find
              funding faster, save time and grow your impact.
            </p>
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Stay Updated</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  // Newsletter subscription functionality can be added here
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded font-medium text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#00A63D' }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="hover:text-white transition-colors">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2025 Bloomwell AI. All rights reserved.</p>

            {/* Social Icons */}
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                  {/* Placeholder for social icons - replace with actual icons */}
                  <div className="w-4 h-4 bg-white/50 rounded-full" />
                </a>
              ))}
            </div>

            {/* Bottom Stats */}
            <div className="flex gap-6 text-xs text-gray-400">
              <span>AI-Powered</span>
              <span>73K+ Grants</span>
              <span>24/7 Support</span>
              <span>98% Success</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
