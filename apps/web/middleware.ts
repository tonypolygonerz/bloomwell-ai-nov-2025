import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    const isAuthPage =
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/forgot-password')

    const isOnboardingPage = pathname.startsWith('/onboarding')
    const isAdminPage = pathname.startsWith('/admin')

    // Protect admin routes - require authentication and admin privileges
    if (isAdminPage) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (!token.isAdmin) {
        return NextResponse.redirect(new URL('/app', req.url))
      }
    }

    if (!token && !isAuthPage && !isOnboardingPage && pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect admins from /app routes to /admin
    if (token && token.isAdmin && pathname.startsWith('/app')) {
      console.log('🔒 Redirecting admin from /app to /admin')
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Redirect authenticated users from auth pages
    if (token && isAuthPage) {
      // Redirect admins to /admin, others to /app
      if (token.isAdmin) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      return NextResponse.redirect(new URL('/app', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const isAuthPage =
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/forgot-password')
        const isOnboardingPage = pathname.startsWith('/onboarding')
        const isAdminPage = pathname.startsWith('/admin')

        if (isAuthPage || isOnboardingPage) {
          return true
        }

        // Admin pages require authentication (admin check happens in middleware function)
        if (isAdminPage) {
          return !!token
        }

        return !!token
      },
    },
  },
)

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/login', '/register', '/forgot-password', '/onboarding/:path*'],
}
