import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    const isAuthPage = pathname.startsWith('/login') || 
                       pathname.startsWith('/register') ||
                       pathname.startsWith('/forgot-password')
    
    const isOnboardingPage = pathname.startsWith('/onboarding')
    
    if (!token && !isAuthPage && !isOnboardingPage && pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/app', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isAuthPage = pathname.startsWith('/login') || 
                           pathname.startsWith('/register') ||
                           pathname.startsWith('/forgot-password')
        const isOnboardingPage = pathname.startsWith('/onboarding')
        
        if (isAuthPage || isOnboardingPage) {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/app/:path*', '/login', '/register', '/forgot-password', '/onboarding/:path*'],
}

