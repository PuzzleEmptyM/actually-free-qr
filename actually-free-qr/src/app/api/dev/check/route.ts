import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const { rows } = await sql/*sql*/`SELECT
    (SELECT COUNT(*)::int FROM qr_codes) as codes,
    (SELECT COUNT(*)::int FROM qr_scans) as scans
  `;
  return NextResponse.json(rows[0]);
}
