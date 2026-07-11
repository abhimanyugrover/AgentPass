'use client';

import { useEffect, useState } from 'react';
import TrustBadge from '@/app/components/TrustBadge';
import ActivityLog from '@/app/components/ActivityLog';

interface AgentInfo {
  agent_id: string;
  agent_name: string;
  owner_id: string;
  created_at: string;
  trust_score: number;
  event_count: number;
  last_action?: string;
  last_result?: string;
  last_seen?: string;
}

interface OwnerInfo {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface PassInfo {
  id: number;
  agent_id: string;
  agent_name: string;
  token: string;
  scopes: string;
  expiry: string;
  created_at: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'portal' | 'passes'>('agents');
  
  // Data States
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [owners, setOwners] = useState<OwnerInfo[]>([]);
  const [passes, setPasses] = useState<PassInfo[]>([]);
  
  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [scopesInput, setScopesInput] = useState('browse, purchase:max_500');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [issuedToken, setIssuedToken] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  // Fetch Lists
  const fetchData = async () => {
    try {
      // Fetch Agents
      const agentsRes = await fetch('/api/agents');
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }
      
      // Fetch Owners
      const ownersRes = await fetch('/api/owners');
      if (ownersRes.ok) {
        const data = await ownersRes.json();
        setOwners(data || []);
      }
      
      // Fetch Passes
      const passesRes = await fetch('/api/passes');
      if (passesRes.ok) {
        const data = await passesRes.json();
        setPasses(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      // Only refresh background lists
      fetchData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Form Submit: Register Owner
  const handleRegisterOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerEmail) return;
    setStatusMessage({ text: '', type: '' });
    
    try {
      const res = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ownerName, email: ownerEmail }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage({ text: `Owner registered successfully! ID: ${data.owner_id}`, type: 'success' });
        setSelectedOwnerId(data.owner_id);
        setOwnerName('');
        setOwnerEmail('');
        fetchData();
      } else {
        setStatusMessage({ text: data.detail || 'Owner registration failed', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error occurred', type: 'error' });
    }
  };

  // Form Submit: Register Agent
  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwnerId || !agentName) return;
    setStatusMessage({ text: '', type: '' });
    
    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: selectedOwnerId, agent_name: agentName }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage({ text: `Agent registered successfully! ID: ${data.agent_id}`, type: 'success' });
        setSelectedAgentId(data.agent_id);
        setAgentName('');
        fetchData();
      } else {
        setStatusMessage({ text: data.detail || 'Agent registration failed', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error occurred', type: 'error' });
    }
  };

  // Form Submit: Issue Pass (Token)
  const handleIssuePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    setStatusMessage({ text: '', type: '' });
    setIssuedToken('');
    
    const agent = agents.find(a => a.agent_id === selectedAgentId);
    if (!agent) {
      setStatusMessage({ text: 'Selected agent not found', type: 'error' });
      return;
    }
    
    const scopesList = scopesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    try {
      const res = await fetch('/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgentId,
          owner_id: agent.owner_id,
          scopes: scopesList,
          expiry_minutes: expiryMinutes,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage({ text: 'AIT (Agent Identity Token) generated successfully!', type: 'success' });
        setIssuedToken(data.token);
        fetchData();
      } else {
        setStatusMessage({ text: data.detail || 'Failed to issue token', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error occurred', type: 'error' });
    }
  };

  // Stats
  const totalAgents = agents.length;
  const avgTrust = totalAgents > 0 ? agents.reduce((sum, a) => sum + a.trust_score, 0) / totalAgents : 0;
  const activePassesCount = passes.filter(p => new Date(p.expiry) > new Date()).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            AgentPass <span className="gradient-text">Issuer Portal</span>
          </h1>
          <p className="text-gray-400">
            Provision, manage, and audit secure credentials for AI agents.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => { setActiveTab('agents'); setStatusMessage({ text: '', type: '' }); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'agents' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            🛡️ Live Monitors
          </button>
          <button
            onClick={() => { setActiveTab('portal'); setStatusMessage({ text: '', type: '' }); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'portal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔑 Issue Pass
          </button>
          <button
            onClick={() => { setActiveTab('passes'); setStatusMessage({ text: '', type: '' }); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'passes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            📜 Pass Registry
          </button>
        </div>
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
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Passes</p>
          <p className="text-3xl font-bold text-cyan-400">{activePassesCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Registrants</p>
          <p className="text-3xl font-bold text-violet-400">{owners.length} Owners</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in">
        
        {/* TAB 1: Live Monitors */}
        {activeTab === 'agents' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[55%]">
              <h2 className="text-lg font-semibold text-white mb-4">Active System Agents</h2>

              {loading ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading agents...</p>
                </div>
              ) : agents.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-4xl mb-3">🤖</p>
                  <p className="text-gray-400 font-medium mb-1">No agents registered yet</p>
                  <p className="text-xs text-gray-600 mb-4">Run the demo script to register an agent and see data here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.agent_id}
                      className="glass-card p-4 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <TrustBadge score={agent.trust_score} size="md" />
                          <div>
                            <h3 className="font-semibold text-white">{agent.agent_name}</h3>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              ID: {agent.agent_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              agent.trust_score >= 70 ? 'status-allow' : agent.trust_score >= 40 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' : 'status-deny'
                            }`}>
                              {agent.trust_score >= 40 ? 'Active' : 'Revoked'}
                            </span>
                          </div>
                          {agent.last_action && (
                            <>
                              <p className="text-[10px] text-gray-400 mt-1.5 font-mono">{agent.last_action}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {agent.last_seen ? new Date(agent.last_seen).toLocaleTimeString() : '—'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:w-[45%]">
              <div className="lg:sticky lg:top-20">
                <ActivityLog />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Issue Pass (Forms Wizard) */}
        {activeTab === 'portal' && (
          <div className="max-w-4xl mx-auto">
            {statusMessage.text && (
              <div className={`p-4 rounded-xl mb-6 border ${
                statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Form 1: Register Owner */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Step 1: Register Owner (Human/Org)</h3>
                <form onSubmit={handleRegisterOwner} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company / Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="e.g. admin@acme.corp"
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
                  >
                    Register Owner
                  </button>
                </form>
              </div>

              {/* Form 2: Register Agent */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Step 2: Register Agent</h3>
                <form onSubmit={handleRegisterAgent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Owner</label>
                    <select
                      value={selectedOwnerId}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">-- Choose Owner --</option>
                      {owners.map(o => (
                        <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g. ShoppingBot-v2"
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedOwnerId}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold text-sm transition-all"
                  >
                    Register Agent
                  </button>
                </form>
              </div>

            </div>

            {/* Form 3: Issue Pass */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Step 3: Issue Identity Pass (Token)</h3>
              <form onSubmit={handleIssuePass} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Agent</label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">-- Choose Agent --</option>
                      {agents.map(a => (
                        <option key={a.agent_id} value={a.agent_id}>{a.agent_name} (ID: {a.agent_id.slice(0, 10)}...)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expiry (Minutes)</label>
                    <input
                      type="number"
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 30)}
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Comma Separated Scopes</label>
                  <input
                    type="text"
                    value={scopesInput}
                    onChange={(e) => setScopesInput(e.target.value)}
                    placeholder="e.g. browse, purchase:max_200"
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Note: Numeric limits are supported using the action:max_NUMBER syntax.</p>
                </div>
                <button
                  type="submit"
                  disabled={!selectedAgentId}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white font-bold text-sm transition-all"
                >
                  Generate Agent Identity Token (AIT)
                </button>
              </form>

              {/* Display Generated Token */}
              {issuedToken && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-indigo-500/30 animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-indigo-400">Copy Agent Identity Token (AIT):</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(issuedToken)}
                      className="text-xs text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded border border-white/10"
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={issuedToken}
                    className="w-full h-32 bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-indigo-300 focus:outline-none resize-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-2">Pass this JWT token in the Authorization header: `Bearer &lt;token&gt;` when making API requests.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Pass Registry (Issued Passes History) */}
        {activeTab === 'passes' && (
          <div className="glass-card p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Pass Registry (AIT Issuance History)</h2>
            
            {passes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📜</p>
                <p>No passes generated yet.</p>
                <p className="text-xs mt-1">Use the "Issue Pass" tab to generate secure credentials for an agent.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Agent Name</th>
                    <th className="px-4 py-3">Agent ID</th>
                    <th className="px-4 py-3">Granted Scopes</th>
                    <th className="px-4 py-3">Issued Time</th>
                    <th className="px-4 py-3">Expiry Time</th>
                    <th className="px-4 py-3">Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {passes.map((pass) => {
                    const isExpired = new Date(pass.expiry) < new Date();
                    return (
                      <tr key={pass.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{pass.agent_name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{pass.agent_id.slice(0, 12)}...</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {pass.scopes.split(',').map((scope, idx) => (
                              <span key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                                {scope}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(pass.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`font-semibold ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                            {new Date(pass.expiry).toLocaleString()} {isExpired ? '(Expired)' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigator.clipboard.writeText(pass.token)}
                            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/10 transition-colors"
                          >
                            Copy JWT
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
