'use client';

import { useEffect, useState } from 'react';
import TrustBadge from '@/app/components/TrustBadge';
import ActivityLog from '@/app/components/ActivityLog';

interface AgentInfo {
  agent_id: string;
  agent_name: string;
  trust_score: number;
  last_action: string;
  last_result: string;
  last_seen: string;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        setAgents(data.agents || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalAgents = agents.length;
  const avgTrust = totalAgents > 0 ? agents.reduce((sum, a) => sum + a.trust_score, 0) / totalAgents : 0;
  const allowCount = agents.filter(a => a.last_result === 'ALLOW' || a.last_result === 'approved').length;
  const denyCount = agents.filter(a => a.last_result === 'DENY' || a.last_result === 'denied').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Issuer <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-gray-400">
          Monitor registered agents, trust scores, and activity across your AgentPass infrastructure.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Agents</p>
          <p className="text-3xl font-bold text-white">{totalAgents}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Trust Score</p>
          <p className={`text-3xl font-bold ${avgTrust >= 70 ? 'text-green-400' : avgTrust >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {avgTrust.toFixed(0)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Allowed</p>
          <p className="text-3xl font-bold text-green-400">{allowCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Denied</p>
          <p className="text-3xl font-bold text-red-400">{denyCount}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Agent Cards */}
        <div className="lg:w-[55%]">
          <h2 className="text-lg font-semibold text-white mb-4">Registered Agents</h2>

          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-3">🤖</p>
              <p className="text-gray-400 font-medium mb-1">No agents registered yet</p>
              <p className="text-xs text-gray-600">Run the demo script to register an agent and see data here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="glass-card p-4 hover:border-indigo-500/30 transition-all animate-slide-in-up"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <TrustBadge score={agent.trust_score} size="md" />
                      <div>
                        <h3 className="font-semibold text-white">{agent.agent_name}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          {agent.agent_id.length > 12 ? `${agent.agent_id.slice(0, 12)}...` : agent.agent_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          agent.last_result === 'ALLOW' || agent.last_result === 'approved'
                            ? 'status-allow'
                            : agent.last_result === 'DENY' || agent.last_result === 'denied'
                            ? 'status-deny'
                            : 'bg-white/10 text-gray-400'
                        }`}>
                          {agent.last_result}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-1">{agent.last_action}</p>
                      <p className="text-[10px] text-gray-700 mt-0.5">
                        {agent.last_seen ? new Date(agent.last_seen).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="lg:w-[45%]">
          <div className="lg:sticky lg:top-20">
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
}
