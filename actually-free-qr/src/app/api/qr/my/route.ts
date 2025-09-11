// src/app/api/qr/my/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await sql/*sql*/`
    SELECT
      c.id, c.label, c.destination_url, c.created_at, c.fg, c.bg, c.size,
      COALESCE(i.impression_count, 0)::int AS impression_count,
      COALESCE(v.view_count, 0)::int AS view_count
    FROM qr_codes c
    LEFT JOIN (
      SELECT qr_id, COUNT(*) AS impression_count
      FROM qr_impressions
      GROUP BY qr_id
    ) i ON i.qr_id = c.id
    LEFT JOIN (
      SELECT qr_id, COUNT(*) AS view_count
      FROM qr_views
      GROUP BY qr_id
    ) v ON v.qr_id = c.id
    WHERE c.user_id = ${userId}
    ORDER BY c.created_at DESC
  `;
  return NextResponse.json(rows);
}
