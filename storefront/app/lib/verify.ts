import { importJWK, jwtVerify, JWTPayload } from 'jose';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

interface AgentClaims extends JWTPayload {
  sub: string;
  owner_id: string;
  agent_name: string;
  scopes: string[];
}

export type VerifyError = 'invalid_token' | 'expired' | 'scope_exceeded' | 'low_trust';

let cachedKey: CryptoKey | null = null;

async function getPublicKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const resp = await fetch(`${ISSUER_URL}/.well-known/jwks.json`);
  if (!resp.ok) throw new Error('Failed to fetch JWKS');
  const jwks = await resp.json();
  const jwk = jwks.keys[0];
  cachedKey = await importJWK(jwk, 'RS256') as CryptoKey;
  return cachedKey;
}

export async function verifyToken(bearerToken: string): Promise<{ claims?: AgentClaims; error?: VerifyError }> {
  const token = bearerToken.replace(/^Bearer\s+/i, '').trim();
  try {
    const key = await getPublicKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ['RS256'] });
    return { claims: payload as AgentClaims };
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === 'ERR_JWT_EXPIRED') return { error: 'expired' };
    return { error: 'invalid_token' };
  }
}

export function checkScope(claims: AgentClaims, requiredScope: string, amount?: number): boolean {
  for (const scope of claims.scopes || []) {
    if (scope === requiredScope) return true;
    if (scope.startsWith(`${requiredScope}:max_`)) {
      const limit = parseFloat(scope.split(':max_')[1]);
      if (isNaN(limit)) continue;
      if (amount !== undefined) return amount <= limit;
      return true;
    }
  }
  return false;
}

export async function getTrustScore(agentId: string): Promise<{ score: number; event_count: number }> {
  const resp = await fetch(`${ISSUER_URL}/trust-score/${agentId}`);
  if (!resp.ok) return { score: 0, event_count: 0 };
  return resp.json();
}

export function resetKeyCache() {
  cachedKey = null;
}
