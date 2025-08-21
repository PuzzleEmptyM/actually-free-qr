import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  // Find destination
  const { rows } = await sql/*sql*/`SELECT destination_url FROM qr_codes WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return NextResponse.redirect(new URL('/', req.url), 302);

  // Pull lightweight analytics
  const ua = req.headers.get('user-agent') ?? null;
  const ref = req.headers.get('referer') ?? null;
  const ip = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')[0]
    .trim() || (req as any).ip || null;
  const country =
    // Vercel Geo (may be undefined locally)
    // @ts-ignore
    (req as any).geo?.country?.toString() ??
    req.headers.get('x-vercel-ip-country') ??
    null;

  // Fire-and-forget insert (don’t block redirect)
  sql/*sql*/`
    INSERT INTO qr_scans (qr_id, country, ip, user_agent, referer)
    VALUES (${id}, ${country}, ${ip}, ${ua}, ${ref})
  `.catch(() => { /* ignore */ });

  // Redirect
  return NextResponse.redirect(rows[0].destination_url, 302);
}
