import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages that require authentication
const protectedRoutes = [
  '/earn',
  '/cashout',
  '/profile',
  '/daily-bonus',
  '/leaderboard',
  '/referrals',
  '/history',
  '/my-offers',
  '/offers',
]

// Pages that should redirect to /earn if user is already logged in  
const authRoutes = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Get session from cookies - Supabase uses multiple cookie keys
  // Look for any cookie that contains auth token data
  const authCookies = request.cookies.getAll().filter(cookie => 
    cookie.name.includes('auth') && cookie.name.includes('token')
  )
  const hasSession = authCookies.length > 0 && authCookies.some(c => c.value && c.value.length > 50)

  // If user is not logged in and trying to access protected route
  if (isProtectedRoute && !hasSession) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth routes
  if (isAuthRoute && hasSession) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/earn'
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
