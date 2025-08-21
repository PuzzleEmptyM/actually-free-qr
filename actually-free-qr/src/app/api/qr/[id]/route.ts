import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Promise
) {
  const { id } = await params; // 👈 await it

  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rowCount } = await sql/*sql*/`
    DELETE FROM qr_codes
    WHERE id = ${id} AND user_id = ${userId}
  `;
  if (rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
