import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is disabled because we use client-side protection
// The auth check happens in the page components using useEffect
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/hand-analyzer/:path*'],
};
