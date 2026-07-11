import { NextResponse } from 'next/server';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const resp = await fetch(`${ISSUER_URL}/activity-stream`, { cache: 'no-store' });
    if (!resp.ok) return NextResponse.json([]);
    const data = await resp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
