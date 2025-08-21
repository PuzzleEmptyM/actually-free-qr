import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await sql/*sql*/`
    SELECT c.id, c.label, c.destination_url, c.created_at, c.fg, c.bg, c.size,
           COALESCE(s.scan_count, 0) AS scan_count
    FROM qr_codes c
    LEFT JOIN (
      SELECT qr_id, COUNT(*)::int AS scan_count
      FROM qr_scans
      GROUP BY qr_id
    ) s ON s.qr_id = c.id
    WHERE c.user_id = ${userId}
    ORDER BY c.created_at DESC
  `;
  return NextResponse.json(rows);
}
