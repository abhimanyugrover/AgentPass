import { NextResponse } from 'next/server';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // The issuer doesn't have a list-agents endpoint yet,
    // so we'll return data from the activity stream to show registered agents
    const resp = await fetch(`${ISSUER_URL}/activity-stream`, { cache: 'no-store' });
    if (!resp.ok) return NextResponse.json({ agents: [] });
    const activities = await resp.json();

    // Extract unique agents from activity
    const agentMap = new Map();
    for (const entry of activities) {
      if (!agentMap.has(entry.agent_id)) {
        agentMap.set(entry.agent_id, {
          agent_id: entry.agent_id,
          agent_name: entry.agent_name,
          trust_score: entry.trust_score,
          last_action: entry.action,
          last_result: entry.result,
          last_seen: entry.timestamp,
        });
      } else {
        // Update with latest info
        const existing = agentMap.get(entry.agent_id);
        existing.trust_score = entry.trust_score;
        existing.last_action = entry.action;
        existing.last_result = entry.result;
        existing.last_seen = entry.timestamp;
      }
    }

    return NextResponse.json({ agents: Array.from(agentMap.values()) });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}
