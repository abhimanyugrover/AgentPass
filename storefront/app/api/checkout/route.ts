import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, checkScope, getTrustScore } from '@/app/lib/verify';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { status: 'denied', reason: 'invalid_token', message: 'Missing Authorization header' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { product_name, price } = body;

  // 1. Verify token
  const { claims, error: verifyError } = await verifyToken(authHeader);
  if (verifyError || !claims) {
    await logActivity(claims?.sub || 'unknown', claims?.agent_name || 'unknown', `purchase:${product_name}`, 'DENY', verifyError || 'invalid_token', 0);
    return NextResponse.json(
      { status: 'denied', reason: verifyError || 'invalid_token', message: `Token verification failed: ${verifyError}` },
      { status: 403 }
    );
  }

  // 2. Check scope
  if (!checkScope(claims, 'purchase', price)) {
    await logActivity(claims.sub, claims.agent_name, `purchase:${product_name}:$${price}`, 'DENY', 'scope_exceeded', 0);
    return NextResponse.json(
      { status: 'denied', reason: 'scope_exceeded', message: `Purchase amount $${price} exceeds scope cap` },
      { status: 403 }
    );
  }

  // 3. Check trust score
  const trustData = await getTrustScore(claims.sub);
  if (trustData.score < 40) {
    await logActivity(claims.sub, claims.agent_name, `purchase:${product_name}:$${price}`, 'DENY', 'low_trust', trustData.score);
    return NextResponse.json(
      { status: 'denied', reason: 'low_trust', message: `Agent trust score ${trustData.score.toFixed(1)} is below minimum threshold of 40` },
      { status: 403 }
    );
  }

  // 4. Approve!
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  await logActivity(claims.sub, claims.agent_name, `purchase:${product_name}:$${price}`, 'ALLOW', 'all_checks_passed', trustData.score);

  return NextResponse.json({
    status: 'approved',
    order_id: orderId,
    product_name,
    price,
    agent_name: claims.agent_name,
    message: `Purchase approved for ${claims.agent_name}`,
  });
}

async function logActivity(agentId: string, agentName: string, action: string, result: string, reason: string, trustScore: number) {
  try {
    await fetch(`${ISSUER_URL}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        agent_id: agentId,
        agent_name: agentName,
        action,
        result,
        reason,
        trust_score: trustScore,
      }),
    });
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}
