import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { userId, sessionId } = getAuth(req);
  return NextResponse.json({ userId: userId ?? null, sessionId: sessionId ?? null });
}
