import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { newId } from '@/lib/id';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { destination_url, label, fg, bg, size } = body as {
    destination_url?: string; label?: string | null; fg?: string; bg?: string; size?: number;
  };

  if (!destination_url || !/^https?:\/\//i.test(destination_url)) {
    return NextResponse.json({ error: 'destination_url must start with http(s)://' }, { status: 400 });
  }

  const id = newId(10);
  await sql/*sql*/`
    INSERT INTO qr_codes (id, user_id, label, destination_url, fg, bg, size)
    VALUES (${id}, ${userId}, ${label ?? null}, ${destination_url}, ${fg ?? null}, ${bg ?? null}, ${size ?? null})
  `;

  return NextResponse.json({ id });
}
