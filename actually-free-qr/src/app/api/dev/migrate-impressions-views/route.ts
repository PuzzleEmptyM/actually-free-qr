import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS qr_impressions (
        id SERIAL PRIMARY KEY,
        qr_id TEXT REFERENCES qr_codes(id) ON DELETE CASCADE,
        country TEXT,
        ip TEXT,
        user_agent TEXT,
        referer TEXT,
        scanned_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS qr_views (
        id SERIAL PRIMARY KEY,
        qr_id TEXT REFERENCES qr_codes(id) ON DELETE CASCADE,
        country TEXT,
        ip TEXT,
        user_agent TEXT,
        referer TEXT,
        viewed_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
