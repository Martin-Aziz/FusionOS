import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApp, getCompatibilityReports } from '../lib/api';
import type { AppCompatibilityRecord, CompatibilityReport } from '../types';
import CompatibilityBadge from '../components/CompatibilityBadge';
import RuntimeRouteBadge from '../components/RuntimeRouteBadge';
import KnownIssuesList from '../components/KnownIssuesList';
import ReportForm from '../components/ReportForm';

export default function AppDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [app, setApp] = useState<AppCompatibilityRecord | null>(null);
  const [reports, setReports] = useState<CompatibilityReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  function loadReports() {
    if (!slug) return;
    getCompatibilityReports(slug)
      .then(r => setReports(r.reports))
      .catch(() => {});
  }

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([getApp(slug), getCompatibilityReports(slug)])
      .then(([appData, reportsData]) => {
        setApp(appData);
        setReports(reportsData.reports);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-full mb-2" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (notFound || !app) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-gray-400 text-lg mb-4">App not found in registry</p>
        <Link to="/registry" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Registry</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/registry" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Back to Registry
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
            <span className="text-sm text-gray-500 capitalize">{app.category}</span>
          </div>
          <CompatibilityBadge level={app.compatibilityLevel} />
        </div>
        <p className="text-gray-600 text-sm mb-4">{app.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-500 font-medium">Recommended:</span>
          <RuntimeRouteBadge route={app.recommendedRoute} />
          {app.alternativeRoutes.length > 0 && (
            <>
              <span className="text-xs text-gray-400">Alternatives:</span>
              {app.alternativeRoutes.map(r => <RuntimeRouteBadge key={r} route={r} />)}
            </>
          )}
        </div>

        {app.installAction && (
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2 font-medium">Install</p>
            <code className="text-green-400 text-sm font-mono">{app.installAction.command}</code>
            {app.installAction.notes && (
              <p className="text-gray-400 text-xs mt-2">{app.installAction.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Game Support */}
      {app.gameSupport && (
        <div className={`rounded-xl border p-5 mb-6 ${app.gameSupport.anticheatRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <h2 className="font-semibold text-gray-900 mb-3">Game Support</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {app.gameSupport.protonDbRating && (
              <div>
                <span className="text-gray-500 text-xs">ProtonDB Rating</span>
                <p className="font-medium">{app.gameSupport.protonDbRating}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-xs">Anti-cheat Risk</span>
              <p className={`font-medium ${app.gameSupport.anticheatRisk ? 'text-red-700' : 'text-green-700'}`}>
                {app.gameSupport.anticheatRisk ? 'Yes — may block play' : 'No'}
              </p>
            </div>
            {app.gameSupport.controllerSupport !== undefined && (
              <div>
                <span className="text-gray-500 text-xs">Controller Support</span>
                <p className="font-medium">{app.gameSupport.controllerSupport ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
          {app.gameSupport.anticheatNotes && (
            <p className="text-xs text-red-700 mt-3">{app.gameSupport.anticheatNotes}</p>
          )}
        </div>
      )}

      {/* Known Issues */}
      {app.knownIssues.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Known Issues</h2>
          <KnownIssuesList issues={app.knownIssues} />
        </div>
      )}

      {/* Hardware Notes */}
      {app.hardwareNotes.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Hardware Notes</h2>
          <ul className="space-y-2">
            {app.hardwareNotes.map((note, i) => (
              <li key={i} className="text-sm text-gray-600 bg-white rounded-lg border border-gray-200 p-3">
                <span className="font-medium capitalize text-gray-800">{note.component}: </span>
                {note.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Community Reports */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">
            Community Reports <span className="text-gray-400 font-normal text-sm">({reports.length})</span>
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showForm ? 'Cancel' : '+ Submit Report'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <ReportForm
              appSlug={app.slug}
              defaultRoute={app.recommendedRoute}
              onSubmitted={() => { setShowForm(false); loadReports(); }}
            />
          </div>
        )}

        {reports.length > 0 ? (
          <ul className="space-y-3">
            {reports.map(r => (
              <li key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.worked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                    {r.worked ? 'Worked' : 'Failed'}
                  </span>
                  <RuntimeRouteBadge route={r.runtimeRoute} />
                  <span className="text-gray-400 text-xs ml-auto">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{r.notes}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.systemProfile.arch} · {r.systemProfile.ramGb}GB RAM
                  {r.systemProfile.gpu && ` · ${r.systemProfile.gpu}`}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 py-4">
            No reports yet. Be the first to submit one.
          </p>
        )}
      </div>

      <div className="text-xs text-gray-400 flex justify-between">
        <span>Last verified: {new Date(app.lastVerifiedAt).toLocaleDateString()}</span>
        <span>{app.reportCount.toLocaleString()} total reports in registry</span>
      </div>
    </div>
  );
}
