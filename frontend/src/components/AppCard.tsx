import { Link } from 'react-router-dom';
import type { AppCompatibilityRecord } from '../types';
import CompatibilityBadge from './CompatibilityBadge';
import RuntimeRouteBadge from './RuntimeRouteBadge';

export default function AppCard({ app }: { app: AppCompatibilityRecord }) {
  return (
    <Link
      to={`/apps/${app.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {app.name}
          </h3>
          <span className="text-xs text-gray-500 capitalize">{app.category}</span>
        </div>
        <CompatibilityBadge level={app.compatibilityLevel} />
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <RuntimeRouteBadge route={app.recommendedRoute} />
        {app.knownIssues.length > 0 && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {app.knownIssues.length} known issue{app.knownIssues.length > 1 ? 's' : ''}
          </span>
        )}
        {app.gameSupport?.anticheatRisk && (
          <span className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
            Anti-cheat risk
          </span>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
        <span>{app.reportCount.toLocaleString()} reports</span>
        <span>Verified {new Date(app.lastVerifiedAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
