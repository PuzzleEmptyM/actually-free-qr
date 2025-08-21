import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = params.id;
  const { rowCount } = await sql/*sql*/`
    DELETE FROM qr_codes
    WHERE id = ${id} AND user_id = ${userId}
  `;
  if (rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
