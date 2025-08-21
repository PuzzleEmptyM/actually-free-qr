import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    await sql/*sql*/`ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS fg TEXT;`;
    await sql/*sql*/`ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS bg TEXT;`;
    await sql/*sql*/`ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS size INT;`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
