interface Props {
  category: string;
  onCategory: (v: string) => void;
  level: string;
  onLevel: (v: string) => void;
  route: string;
  onRoute: (v: string) => void;
}

const CATEGORIES = ['', 'games', 'development', 'creative', 'productivity'];
const LEVELS: Array<[string, string]> = [
  ['', 'All levels'],
  ['platinum', 'Platinum'],
  ['gold', 'Gold'],
  ['silver', 'Silver'],
  ['bronze', 'Bronze'],
  ['experimental', 'Experimental'],
  ['unsupported', 'Unsupported']
];
const ROUTES: Array<[string, string]> = [
  ['', 'All routes'],
  ['native-linux', 'Native Linux'],
  ['flatpak', 'Flatpak'],
  ['appimage', 'AppImage'],
  ['apt', 'apt'],
  ['wine', 'Wine'],
  ['proton', 'Proton'],
  ['container', 'Container'],
  ['vm', 'VM']
];

export default function FilterBar({ category, onCategory, level, onLevel, route, onRoute }: Props) {
  const selectClass = "text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  return (
    <div className="flex flex-wrap gap-3">
      <select value={category} onChange={e => onCategory(e.target.value)} className={selectClass}>
        <option value="">All categories</option>
        {CATEGORIES.filter(Boolean).map(c => (
          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
        ))}
      </select>

      <select value={level} onChange={e => onLevel(e.target.value)} className={selectClass}>
        {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>

      <select value={route} onChange={e => onRoute(e.target.value)} className={selectClass}>
        {ROUTES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
