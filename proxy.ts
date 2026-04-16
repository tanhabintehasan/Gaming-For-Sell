import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUserFromRequest } from './lib/auth'

export function proxy(request: NextRequest) {
  const user = getAuthUserFromRequest(request)
  const { pathname } = request.nextUrl

  // Redirect logged-in users away from public login pages
  if ((pathname === '/login' || pathname.startsWith('/backstage/')) && user) {
    if (user.level === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (user.level === 'SELLER') {
      return NextResponse.redirect(new URL('/seller/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!user || user.level !== 'ADMIN') {
      return NextResponse.redirect(new URL('/backstage/admin/login', request.url))
    }
  }

  // Seller routes protection
  if (pathname.startsWith('/seller')) {
    if (!user || (user.level !== 'SELLER' && user.level !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/backstage/seller/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/login', '/backstage/:path*'],
}
