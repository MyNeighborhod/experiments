import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname

  // 1. Skip static assets, Next.js internal files, favicon, API, and admin routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/next') ||
    pathname.includes('.') // matches files with extensions like favicon.ico, webp, png, etc.
  ) {
    return NextResponse.next()
  }

  // 2. Extract hostname
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0] // remove port if present

  // 3. Resolve tenant slug (fallback to 'default')
  let tenantSlug = 'default'

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parts = hostname.split('.')
    // If it's a subdomain (e.g. tenant-a.localhost or tenant-a.myplatform.com)
    if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
      tenantSlug = parts[0]
    } else {
      // For custom domains or other subdomains, use the first subdomain or full hostname
      tenantSlug = parts[0]
    }
  }

  // 4. Rewrite the URL internally to include the tenant slug
  return NextResponse.rewrite(new URL(`/${tenantSlug}${pathname}`, request.url))
}

export const config = {
  matcher: [
    // Match all routes except API and static assets
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
