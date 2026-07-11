import { NextRequest, NextResponse } from 'next/server';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const resp = await fetch(`${ISSUER_URL}/owners`, { cache: 'no-store' });
    if (!resp.ok) return NextResponse.json([], { status: resp.status });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch owners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resp = await fetch(`${ISSUER_URL}/owners/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to register owner' }, { status: 500 });
  }
}
