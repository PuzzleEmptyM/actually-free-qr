import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  // debug header to confirm middleware ran
  const res = NextResponse.next();
  res.headers.set('x-mw', 'on');
  return res;
});

export const config = {
  matcher: [
    // all app routes except static files and _next
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    // explicitly include API
    '/(api|trpc)(.*)',
  ],
};
