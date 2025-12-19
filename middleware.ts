import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/callback']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Signup route (requires auth session but not User record)
  const isSignupRoute = pathname.startsWith('/signup')

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check if they have completed signup
  if (user && !isPublicRoute && !isSignupRoute) {
    // Check if user exists in database
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', user.id)
      .maybeSingle()

    // If user doesn't exist in DB and not on signup page, redirect to signup
    if (!dbUser && !error) {
      const url = request.nextUrl.clone()
      url.pathname = '/signup'
      return NextResponse.redirect(url)
    }
  }

  // If user is authenticated and has completed signup, prevent access to login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', user.id)
      .maybeSingle()

    // If user exists in DB, redirect to home
    if (dbUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // If user doesn't exist but on login page, redirect to signup
    if (!dbUser && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/signup'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes (API endpoints)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
