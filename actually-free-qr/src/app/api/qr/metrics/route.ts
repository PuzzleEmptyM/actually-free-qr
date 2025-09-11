// src/app/api/qr/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const own = await sql/*sql*/`SELECT 1 FROM qr_codes WHERE id=${id} AND user_id=${userId} LIMIT 1`;
  if (own.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [impr, views, dailyViews, countriesImpr, countriesViews, devicesViews] = await Promise.all([
    sql/*sql*/`SELECT COUNT(*)::int AS n FROM qr_impressions WHERE qr_id=${id}`,
    sql/*sql*/`SELECT COUNT(*)::int AS n FROM qr_views WHERE qr_id=${id}`,
    sql/*sql*/`
      SELECT to_char(date_trunc('day', viewed_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
      FROM qr_views WHERE qr_id=${id} AND viewed_at >= NOW() - INTERVAL '14 days'
      GROUP BY 1 ORDER BY 1`,
    sql/*sql*/`
      SELECT COALESCE(country,'UNK') AS country, COUNT(*)::int AS impressions
      FROM qr_impressions WHERE qr_id=${id}
      GROUP BY 1 ORDER BY impressions DESC`,
    sql/*sql*/`
      SELECT COALESCE(country,'UNK') AS country, COUNT(*)::int AS views
      FROM qr_views WHERE qr_id=${id}
      GROUP BY 1 ORDER BY views DESC`,
    sql/*sql*/`
      SELECT CASE
               WHEN user_agent ILIKE '%Mobile%' OR user_agent ILIKE '%Android%' OR user_agent ILIKE '%iPhone%'
               THEN 'mobile' ELSE 'desktop'
             END AS device,
             COUNT(*)::int AS count
      FROM qr_views WHERE qr_id=${id}
      GROUP BY 1 ORDER BY count DESC`,
  ]);

  return NextResponse.json({
    impressions: impr.rows[0]?.n ?? 0,
    views: views.rows[0]?.n ?? 0,
    dailyViews: dailyViews.rows,            // [{ day, count }]
    countriesImpr: countriesImpr.rows,      // [{ country, impressions }]
    countriesViews: countriesViews.rows,    // [{ country, views }]
    devicesViews: devicesViews.rows,        // [{ device, count }]
  });
}
