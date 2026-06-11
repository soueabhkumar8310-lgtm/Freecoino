import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/earn'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // If there's already an error from OAuth provider, redirect to login with error
  if (error) {
    console.error('OAuth provider error:', error, error_description)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${error}&error_description=${error_description || 'Authentication failed'}`
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          `${origin}/auth/login?error=auth_callback_error&error_description=${encodeURIComponent(exchangeError.message)}`
        )
      }

      if (data.session) {
        console.log('✅ OAuth session created successfully')
        
        // Success! Redirect to destination
        return NextResponse.redirect(`${origin}${next}`, {
          status: 302, // Temporary redirect
        })
      }
    } catch (err: any) {
      console.error('OAuth callback exception:', err)
      return NextResponse.redirect(
        `${origin}/auth/login?error=auth_callback_error&error_description=${encodeURIComponent(err.message || 'Unknown error')}`
      )
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&error_description=No authorization code provided`)
}
