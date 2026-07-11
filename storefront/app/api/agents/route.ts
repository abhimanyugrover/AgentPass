import { NextResponse } from 'next/server';

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // 1. Fetch all registered agents from database
    const agentsResp = await fetch(`${ISSUER_URL}/agents`, { cache: 'no-store' });
    if (!agentsResp.ok) return NextResponse.json({ agents: [] });
    const dbAgents = await agentsResp.ok ? await agentsResp.json() : [];

    // 2. Fetch trust scores for each agent
    const agentsWithScores = await Promise.all(
      dbAgents.map(async (agent: any) => {
        try {
          const scoreResp = await fetch(`${ISSUER_URL}/trust-score/${agent.id}`, { cache: 'no-store' });
          if (scoreResp.ok) {
            const scoreData = await scoreResp.json();
            return {
              agent_id: agent.id,
              agent_name: agent.agent_name,
              owner_id: agent.owner_id,
              created_at: agent.created_at,
              trust_score: scoreData.score,
              event_count: scoreData.event_count,
              last_updated: scoreData.last_updated,
            };
          }
        } catch (e) {
          console.error(`Failed to fetch score for agent ${agent.id}`, e);
        }
        return {
          agent_id: agent.id,
          agent_name: agent.agent_name,
          owner_id: agent.owner_id,
          created_at: agent.created_at,
          trust_score: 70.0,
          event_count: 0,
        };
      })
    );

    return NextResponse.json({ agents: agentsWithScores });
  } catch (e) {
    console.error('Error fetching agents:', e);
    return NextResponse.json({ agents: [] });
  }
}
