import { useState } from 'react';
import { submitReport } from '../lib/api';
import type { RuntimeRoute } from '../types';

const ROUTES: RuntimeRoute[] = [
  'native-linux', 'flatpak', 'appimage', 'apt', 'wine', 'proton', 'container', 'vm', 'agent-workspace'
];

interface Props {
  appSlug: string;
  defaultRoute?: RuntimeRoute;
  onSubmitted?: () => void;
}

export default function ReportForm({ appSlug, defaultRoute = 'native-linux', onSubmitted }: Props) {
  const [route, setRoute] = useState<RuntimeRoute>(defaultRoute);
  const [worked, setWorked] = useState(true);
  const [notes, setNotes] = useState('');
  const [arch, setArch] = useState<'x86_64' | 'arm64'>('x86_64');
  const [ramGb, setRamGb] = useState(8);
  const [gpu, setGpu] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await submitReport(appSlug, {
        runtimeRoute: route,
        worked,
        systemProfile: { arch, ...(gpu ? { gpu } : {}), ramGb, fusionOsVersion: '0.1.0' },
        notes
      });
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
        Report submitted. Thank you for contributing to the compatibility registry.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Runtime route</label>
          <select
            value={route}
            onChange={e => setRoute(e.target.value as RuntimeRoute)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Did it work?</label>
          <div className="flex gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={worked} onChange={() => setWorked(true)} className="accent-green-600" />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={!worked} onChange={() => setWorked(false)} className="accent-red-600" />
              No
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Architecture</label>
          <select
            value={arch}
            onChange={e => setArch(e.target.value as 'x86_64' | 'arm64')}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="x86_64">x86_64</option>
            <option value="arm64">arm64</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RAM (GB)</label>
          <input
            type="number" min={1} max={256} value={ramGb}
            onChange={e => setRamGb(Number(e.target.value))}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GPU (optional)</label>
          <input
            type="text" placeholder="e.g. AMD RX 6600" value={gpu}
            onChange={e => setGpu(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          required minLength={1} maxLength={2000}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Describe what happened, any errors, or workarounds you used..."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
