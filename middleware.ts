import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    console.log('No token found, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  console.log('Token found, proceeding:', token.slice(0, 10) + '...');
  return NextResponse.next();
}

export const config = {
  matcher: ['/meeting/:path*'],
};