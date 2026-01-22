import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Override x-robots-tag for OG image routes to allow Discord/Twitter crawlers
  if (request.nextUrl.pathname.startsWith('/api/og/share')) {
    const response = NextResponse.next();
    response.headers.set('x-robots-tag', 'index, follow');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/og/:path*',
};

