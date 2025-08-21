import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const owner = await sql/*sql*/`SELECT 1 FROM qr_codes WHERE id=${id} AND user_id=${userId} LIMIT 1`;
  if (owner.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const totals = await sql/*sql*/`SELECT COUNT(*)::int AS total FROM qr_scans WHERE qr_id=${id}`;
  const daily = await sql/*sql*/`
    SELECT to_char(date_trunc('day', scanned_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
    FROM qr_scans WHERE qr_id=${id} AND scanned_at >= NOW() - INTERVAL '14 days'
    GROUP BY 1 ORDER BY 1`;
  const countries = await sql/*sql*/`
    SELECT COALESCE(country,'UNK') AS country, COUNT(*)::int AS count
    FROM qr_scans WHERE qr_id=${id}
    GROUP BY 1 ORDER BY count DESC LIMIT 10`;
  const devices = await sql/*sql*/`
    SELECT CASE
             WHEN user_agent ILIKE '%Mobile%' OR user_agent ILIKE '%Android%' OR user_agent ILIKE '%iPhone%'
             THEN 'mobile' ELSE 'desktop'
           END AS device,
           COUNT(*)::int AS count
    FROM qr_scans WHERE qr_id=${id}
    GROUP BY 1 ORDER BY count DESC`;

  return NextResponse.json({
    total: totals.rows[0]?.total ?? 0,
    daily: daily.rows,
    countries: countries.rows,
    devices: devices.rows,
  });
}
