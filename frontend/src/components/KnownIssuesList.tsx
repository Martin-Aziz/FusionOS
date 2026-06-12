import type { KnownIssue } from '../types';

const SEVERITY_STYLES = {
  blocking: 'bg-red-50 border-red-200 text-red-800',
  major: 'bg-orange-50 border-orange-200 text-orange-800',
  minor: 'bg-yellow-50 border-yellow-200 text-yellow-800'
};

const SEVERITY_LABEL = {
  blocking: 'Blocking',
  major: 'Major',
  minor: 'Minor'
};

export default function KnownIssuesList({ issues }: { issues: KnownIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="space-y-3">
      {issues.map(issue => (
        <li key={issue.id} className={`rounded-lg border p-4 ${SEVERITY_STYLES[issue.severity]}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide opacity-70">
              {SEVERITY_LABEL[issue.severity]}
            </span>
            <span className="font-medium text-sm">{issue.title}</span>
          </div>
          <p className="text-sm opacity-80">{issue.description}</p>
          {issue.workaround && (
            <p className="text-sm mt-2 opacity-70">
              <span className="font-medium">Workaround:</span> {issue.workaround}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
