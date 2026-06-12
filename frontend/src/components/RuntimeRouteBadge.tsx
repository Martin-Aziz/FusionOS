import type { RuntimeRoute } from '../types';

const LABELS: Record<RuntimeRoute, string> = {
  'native-linux':       'Native Linux',
  'flatpak':            'Flatpak',
  'appimage':           'AppImage',
  'apt':                'apt',
  'wine':               'Wine',
  'proton':             'Proton',
  'container':          'Container',
  'vm':                 'VM',
  'agent-workspace':    'Agent Workspace',
  'macos-experimental': 'macOS (Experimental)'
};

const COLORS: Record<RuntimeRoute, string> = {
  'native-linux':       'bg-blue-100 text-blue-800',
  'flatpak':            'bg-indigo-100 text-indigo-800',
  'appimage':           'bg-cyan-100 text-cyan-800',
  'apt':                'bg-teal-100 text-teal-800',
  'wine':               'bg-orange-100 text-orange-800',
  'proton':             'bg-amber-100 text-amber-800',
  'container':          'bg-slate-100 text-slate-700',
  'vm':                 'bg-gray-100 text-gray-600',
  'agent-workspace':    'bg-violet-100 text-violet-800',
  'macos-experimental': 'bg-pink-100 text-pink-700'
};

export default function RuntimeRouteBadge({ route }: { route: RuntimeRoute }) {
  const label = LABELS[route] ?? route;
  const color = COLORS[route] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}
