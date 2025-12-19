import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code:', error.message)
      // 세션 교환 실패 시 로그인 페이지로 (에러 쿼리 포함)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log('[Auth Callback] Session created for:', data.user?.email)

    // Check if User exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', data.user.id)
      .maybeSingle()

    let redirectPath = next

    if (userError) {
      console.error('[Auth Callback] Error checking user:', userError)
    }

    // If user doesn't exist in database, redirect to signup
    if (!user) {
      console.log('[Auth Callback] User not found in database, redirecting to signup')
      redirectPath = '/signup'
    } else {
      console.log('[Auth Callback] User found, redirecting to:', next)
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${redirectPath}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
    } else {
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  console.error('[Auth Callback] No code provided')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}

