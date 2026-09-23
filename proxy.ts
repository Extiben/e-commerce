import { NextResponse, type NextRequest } from 'next/server'

// Verificación optimista: si no hay cookie de sesión, manda al login.
// La verificación real (firma HMAC) se hace en cada página y acción del panel.
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin/login')) return NextResponse.next()
  if (!req.cookies.get('v01d_admin')) return NextResponse.redirect(new URL('/admin/login', req.url))
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
