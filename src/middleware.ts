import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // Public routes — no login needed
    const publicPrefixes = ['/', '/explore', '/login', '/signup', '/api', '/_next', '/favicon']
    const isPublic = publicPrefixes.some(prefix =>
      pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')
    )

    if (!user && !isPublic) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  } catch {
    // If auth check fails, allow the request through
  }

  return supabaseResponse
}
