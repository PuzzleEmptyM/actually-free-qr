import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, label } = await req.json().catch(() => ({})) as { id?: string; label?: string | null };
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { rowCount } = await sql/*sql*/`
    UPDATE qr_codes SET label = ${label ?? null}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  if (rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
