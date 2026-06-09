import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // If user is not logged in and trying to access protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth routes (only for GET requests)
  // Allow POST/PUT requests to pass through for logout/signup actions
  if (isAuthRoute && session && request.method === 'GET') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/earn'
    return NextResponse.redirect(redirectUrl)
  }

  return response
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
