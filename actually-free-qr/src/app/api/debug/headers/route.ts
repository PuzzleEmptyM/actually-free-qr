import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    mw: req.headers.get('x-mw') ?? null,
  });
}
