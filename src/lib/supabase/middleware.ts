import { type NextRequest, NextResponse } from 'next/server'

// Minimal middleware — pages handle their own auth
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
