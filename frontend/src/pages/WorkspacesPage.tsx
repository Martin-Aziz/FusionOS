import { useEffect, useState } from 'react';
import { getWorkspaces, createWorkspace, runWorkspace, getWorkspaceLogs } from '../lib/api';
import type { AgentWorkspace } from '../types';

const STATUS_COLORS: Record<string, string> = {
  idle:    'bg-gray-100 text-gray-600',
  running: 'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-700',
  stopped: 'bg-yellow-100 text-yellow-700'
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<AgentWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<Record<string, string[]>>({});

  // Form state
  const [name, setName] = useState('');
  const [paths, setPaths] = useState('/home/user/projects');
  const [network, setNetwork] = useState<'none' | 'limited' | 'full'>('limited');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    getWorkspaces()
      .then(r => setWorkspaces(r.workspaces))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createWorkspace({
        name,
        allowedPaths: paths.split('\n').map(p => p.trim()).filter(Boolean),
        networkAccess: network,
        allowedApps: [],
        runtimeRoutes: ['native-linux', 'container']
      });
      setName('');
      setPaths('/home/user/projects');
      setNetwork('limited');
      setShowForm(false);
      load();
    } catch {
      // error feedback omitted for brevity
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRun(id: string) {
    await runWorkspace(id).catch(() => {});
    load();
  }

  async function handleLogs(id: string) {
    const result = await getWorkspaceLogs(id).catch(() => ({ logs: [] }));
    setLogs(prev => ({ ...prev, [id]: result.logs }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Agent Workspaces</h1>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Alpha 3</span>
          </div>
          <p className="text-gray-500 text-sm max-w-lg">
            Isolated environments for running local AI agents, dev tools, and automation scripts
            with controlled filesystem and network access.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Workspace'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-1">Create Workspace</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              required value={name} onChange={e => setName(e.target.value)}
              placeholder="my-agent-workspace"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allowed paths (one per line)</label>
            <textarea
              value={paths} onChange={e => setPaths(e.target.value)}
              rows={3}
              className="w-full text-sm font-mono border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Network access</label>
            <select
              value={network} onChange={e => setNetwork(e.target.value as typeof network)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            >
              <option value="none">None — fully isolated</option>
              <option value="limited">Limited — allowlisted only</option>
              <option value="full">Full — unrestricted</option>
            </select>
          </div>
          <button
            type="submit" disabled={submitting}
            className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      )}

      {/* Workspace list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading workspaces...</p>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-lg mb-2">No workspaces yet</p>
          <p className="text-sm">Create a workspace to get started with isolated agent environments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workspaces.map(ws => (
            <div key={ws.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ws.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ws.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ws.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {new Date(ws.createdAt).toLocaleDateString()} · Network: {ws.networkAccess}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRun(ws.id)}
                    disabled={ws.status === 'running'}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-40 transition-colors"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => handleLogs(ws.id)}
                    className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Logs
                  </button>
                </div>
              </div>

              {ws.allowedPaths.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Allowed paths</p>
                  <div className="flex flex-wrap gap-1">
                    {ws.allowedPaths.map(p => (
                      <code key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</code>
                    ))}
                  </div>
                </div>
              )}

              {logs[ws.id] !== undefined && (
                <div className="mt-3 bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Logs</p>
                  {(logs[ws.id] ?? []).length === 0 ? (
                    <p className="text-xs text-gray-500 font-mono">No logs yet. Log streaming planned for Alpha 3.</p>
                  ) : (
                    <ul className="text-xs text-green-400 font-mono space-y-0.5">
                      {(logs[ws.id] ?? []).map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alpha note */}
      <div className="mt-8 bg-violet-50 border border-violet-200 rounded-xl p-5 text-sm text-violet-800">
        <p className="font-semibold mb-1">Alpha status</p>
        <p>
          Workspace creation and status management is functional. Real execution engine (running actual agents
          and scripts inside isolated environments) is planned for Alpha 3. Log streaming is a stub.
        </p>
      </div>
    </div>
  );
}
