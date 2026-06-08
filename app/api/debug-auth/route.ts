import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      supabaseConfigured: hasSupabaseUrl && hasSupabaseKey,
      supabaseUrl: hasSupabaseUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' : 'MISSING',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 })
  }
}
