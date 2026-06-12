import RuntimeRouteBadge from '../components/RuntimeRouteBadge';
import type { RuntimeRoute } from '../types';

const ROUTES: Array<{
  route: RuntimeRoute;
  description: string;
  typicalUse: string;
  performance: string;
  status: string;
}> = [
  {
    route: 'native-linux',
    description: 'Direct Linux binary — no compatibility layer.',
    typicalUse: 'Linux-native apps (VSCode, Blender, Docker)',
    performance: 'Best',
    status: 'Supported'
  },
  {
    route: 'flatpak',
    description: 'Sandboxed package with bundled runtime.',
    typicalUse: 'Cross-distro apps, GUI tools',
    performance: 'Excellent',
    status: 'Supported'
  },
  {
    route: 'appimage',
    description: 'Portable binary, no installation required.',
    typicalUse: 'Portable dev tools (Cursor, AppImage apps)',
    performance: 'Excellent',
    status: 'Supported'
  },
  {
    route: 'apt',
    description: 'System package manager installation.',
    typicalUse: 'System software, developer runtimes (Python, Git)',
    performance: 'Best',
    status: 'Supported'
  },
  {
    route: 'wine',
    description: 'Windows binary compatibility via Wine.',
    typicalUse: 'Windows office apps (Photoshop, Excel)',
    performance: 'Good — GPU accel limited',
    status: 'Supported'
  },
  {
    route: 'proton',
    description: 'Steam\'s Wine fork with DX translation (DXVK/VKD3D).',
    typicalUse: 'Windows games via Steam',
    performance: 'Good — game-dependent',
    status: 'Supported'
  },
  {
    route: 'container',
    description: 'Docker/Podman container with isolated environment.',
    typicalUse: 'Dev tools, services, isolated workloads',
    performance: 'Near-native',
    status: 'Supported'
  },
  {
    route: 'vm',
    description: 'Full virtual machine for maximum compatibility.',
    typicalUse: 'Windows-only software, complex compatibility requirements',
    performance: 'Reduced — hardware overhead',
    status: 'Supported'
  },
  {
    route: 'agent-workspace',
    description: 'Isolated FusionOS workspace for AI agents and automation.',
    typicalUse: 'Local AI agents, automation scripts',
    performance: 'Depends on workload',
    status: 'Alpha 3 (contracts available)'
  },
  {
    route: 'macos-experimental',
    description: 'Experimental macOS compatibility research path.',
    typicalUse: 'macOS-exclusive apps',
    performance: 'Experimental — not reliable',
    status: 'Future research — not Alpha'
  }
];

export default function RuntimeRouterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Runtime Router</h1>
      <p className="text-gray-500 mb-8">
        FusionOS maps each app to the best execution path based on its category, ecosystem, and known compatibility.
        Here is how the routing logic works.
      </p>

      {/* Decision tree */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 font-mono text-sm">
        <p className="text-gray-400 mb-4 font-sans text-xs font-medium uppercase tracking-wide">Routing decision tree</p>
        <div className="space-y-2">
          {[
            { indent: 0, text: 'Is there a native Linux binary?', color: 'text-blue-700' },
            { indent: 1, text: '→ yes: native-linux / flatpak / appimage / apt', color: 'text-green-700' },
            { indent: 0, text: 'Is it a Windows game?', color: 'text-blue-700' },
            { indent: 1, text: '→ yes: proton (via Steam) or wine prefix', color: 'text-amber-700' },
            { indent: 2, text: '→ anti-cheat? flag as bronze or blocked', color: 'text-red-600' },
            { indent: 0, text: 'Is it a Windows app (non-game)?', color: 'text-blue-700' },
            { indent: 1, text: '→ yes: wine prefix (office, creative tools)', color: 'text-orange-700' },
            { indent: 0, text: 'Needs isolation or service boundary?', color: 'text-blue-700' },
            { indent: 1, text: '→ container or vm', color: 'text-slate-700' },
            { indent: 0, text: 'AI agent or automation script?', color: 'text-blue-700' },
            { indent: 1, text: '→ agent-workspace (Alpha 3)', color: 'text-violet-700' },
            { indent: 0, text: 'macOS-only app?', color: 'text-blue-700' },
            { indent: 1, text: '→ macos-experimental (research only — not reliable)', color: 'text-pink-600' }
          ].map((line, i) => (
            <p key={i} className={`${line.color} ${line.indent === 0 ? '' : line.indent === 1 ? 'pl-6' : 'pl-12'}`}>
              {line.text}
            </p>
          ))}
        </div>
      </div>

      {/* Route table */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">All runtime routes</h2>
      <div className="space-y-3">
        {ROUTES.map(r => (
          <div key={r.route} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <RuntimeRouteBadge route={r.route} />
              <span className={`text-xs ${r.status.includes('Future') ? 'text-pink-600' : r.status.includes('Alpha') ? 'text-violet-600' : 'text-green-700'}`}>
                {r.status}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-1">{r.description}</p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span><span className="font-medium">Use:</span> {r.typicalUse}</span>
              <span><span className="font-medium">Performance:</span> {r.performance}</span>
            </div>
          </div>
        ))}
      </div>

      {/* macOS callout */}
      <div className="mt-8 bg-pink-50 border border-pink-200 rounded-xl p-5 text-sm">
        <p className="font-semibold text-pink-900 mb-1">A note on macOS compatibility</p>
        <p className="text-pink-800">
          FusionOS does not claim to run macOS applications in the Alpha.
          The <code className="bg-pink-100 px-1 rounded">macos-experimental</code> route is a research path —
          it is listed for transparency, not as a supported feature.
          macOS compatibility is a long-term research item and will not be part of Alpha releases.
        </p>
      </div>
    </div>
  );
}
