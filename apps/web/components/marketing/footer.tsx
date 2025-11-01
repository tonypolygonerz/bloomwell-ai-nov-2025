import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Bloomwell AI</h3>
          <p className="text-gray-300">
            Empowering nonprofits with AI-driven grant discovery and management tools. Find funding
            faster, save time and grow your impact.
          </p>
        </div>

        <div className="mb-8">
          <h4 className="mb-2 text-sm font-semibold">Stay Updated</h4>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border border-gray-600 bg-brand-navy px-3 py-2 text-white placeholder-gray-400 focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="#features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-white">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/help" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="hover:text-white">
                  Webinars
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">© 2025 Bloomwell AI. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">SOC 2 Compliant</span>
              <span className="text-xs text-gray-500">256-bit SSL</span>
              <span className="text-xs text-gray-500">GDPR Ready</span>
              <span className="text-xs text-gray-500">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
