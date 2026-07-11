'use client';
import { useEffect, useState } from 'react';

interface ActivityEntry {
  timestamp: string;
  agent_id: string;
  agent_name: string;
  action: string;
  result: string;
  reason: string;
  trust_score: number;
}

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        setEntries(data);
      } catch {
        /* silent */
      }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 1500);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="glass-card glow-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Live Agent Activity</h2>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            isLive ? 'bg-green-400/20 text-green-400 border border-green-400/30' : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}
        >
          {isLive ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">📡</p>
            <p>Waiting for agent activity...</p>
            <p className="text-xs mt-1">Run the demo agent to see live events</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={`${entry.timestamp}-${i}`}
              className={`animate-slide-in-up p-3 rounded-xl border transition-all hover:scale-[1.01] ${
                entry.result === 'ALLOW' || entry.result === 'approved'
                  ? 'bg-green-400/5 border-green-400/20'
                  : entry.result === 'DENY' || entry.result === 'denied'
                  ? 'bg-red-400/5 border-red-400/20'
                  : 'bg-white/5 border-white/10'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {entry.result === 'ALLOW' || entry.result === 'approved' ? '✅' : entry.result === 'DENY' || entry.result === 'denied' ? '❌' : '📝'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{entry.agent_name}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-sm text-gray-300">{entry.action}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        entry.result === 'ALLOW' || entry.result === 'approved' ? 'status-allow' : entry.result === 'DENY' || entry.result === 'denied' ? 'status-deny' : 'bg-white/10 text-gray-400'
                      }`}>
                        {entry.result}
                      </span>
                      {entry.reason && (
                        <span className="text-xs text-gray-500">{entry.reason}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono font-bold ${
                    entry.trust_score >= 70 ? 'text-green-400' : entry.trust_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {entry.trust_score.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
