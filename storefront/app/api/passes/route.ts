import { NextRequest, NextResponse } from 'next/server';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const resp = await fetch(`${ISSUER_URL}/passes`, { cache: 'no-store' });
    if (!resp.ok) return NextResponse.json([], { status: resp.status });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch passes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, owner_id, scopes, expiry_minutes } = body;
    
    if (!agent_id || !owner_id || !scopes) {
      return NextResponse.json({ error: 'Missing required fields (agent_id, owner_id, scopes)' }, { status: 400 });
    }

    const resp = await fetch(`${ISSUER_URL}/agents/${agent_id}/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id, scopes, expiry_minutes: expiry_minutes || 30 }),
    });
    
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to issue token' }, { status: 500 });
  }
}
