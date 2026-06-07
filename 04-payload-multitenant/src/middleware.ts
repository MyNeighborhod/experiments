import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname

  // 1. Skip static assets, Next.js internal files, favicon, API, and admin routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/next") ||
    pathname.includes(".") // matches files with extensions like favicon.ico, webp, png, etc.
  ) {
    return NextResponse.next()
  }

  // 2. Extract hostname
  const host = request.headers.get("host") || ""
  const hostname = host.split(":")[0] // remove port if present

  // 3. Resolve tenant slug (fallback to 'default')
  const platformDomain = "blockvibe.org"
  let tenantSlug = "default"

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    tenantSlug = "default"
  } else if (hostname.endsWith(".localhost")) {
    // Local subdomain: e.g. nog.localhost -> "nog"
    tenantSlug = hostname.split(".")[0]
  } else if (hostname === `info.${platformDomain}` || hostname === platformDomain) {
    // Platform home/default site: info.blockvibe.org -> "default"
    tenantSlug = "default"
  } else if (hostname.endsWith(`.${platformDomain}`)) {
    // Platform subdomain: e.g. nog.blockvibe.org -> "nog" (matches tenant slug)
    tenantSlug = hostname.replace(`.${platformDomain}`, "")
  } else {
    // Fully custom domain: e.g. www.northofgranddsm.org -> "www.northofgranddsm.org" (matches tenant domain field)
    tenantSlug = hostname
  }

  // 4. Rewrite the URL internally to include the tenant slug
  return NextResponse.rewrite(new URL(`/${tenantSlug}${pathname}`, request.url))
}

export const config = {
  matcher: [
    // Match all routes except API and static assets
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
