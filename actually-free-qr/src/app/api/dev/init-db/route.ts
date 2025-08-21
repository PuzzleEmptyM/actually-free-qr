import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// We use TEXT ids we generate in app to avoid pg extensions for uuid.
// Clerk user ids are strings, so user_id is TEXT and nullable for anonymous.

export async function POST() {
  try {
    // qr_codes: one row per tracked QR
    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id TEXT PRIMARY KEY,
        user_id TEXT NULL,
        label TEXT NULL,
        destination_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // qr_scans: one row per scan
    await sql/*sql*/`
      CREATE TABLE IF NOT EXISTS qr_scans (
        id BIGSERIAL PRIMARY KEY,
        qr_id TEXT NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
        scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        country TEXT NULL,
        ip TEXT NULL,
        user_agent TEXT NULL,
        referer TEXT NULL
      );
    `;

    // helpful indexes
    await sql/*sql*/`CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_id ON qr_scans(qr_id);`;
    await sql/*sql*/`CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON qr_scans(scanned_at DESC);`;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
