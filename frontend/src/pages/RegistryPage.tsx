import { useEffect, useState } from 'react';
import { searchApps } from '../lib/api';
import type { AppCompatibilityRecord, CompatibilityLevel, RuntimeRoute } from '../types';
import AppCard from '../components/AppCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

export default function RegistryPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [route, setRoute] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<AppCompatibilityRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 12;

  useEffect(() => {
    setPage(1);
  }, [q, category, level, route]);

  useEffect(() => {
    setLoading(true);
    searchApps({
      ...(q ? { q } : {}),
      ...(category ? { category } : {}),
      ...(level ? { compatibilityLevel: level as CompatibilityLevel } : {}),
      ...(route ? { runtimeRoute: route as RuntimeRoute } : {}),
      page,
      pageSize: PAGE_SIZE
    })
      .then(r => {
        setResults(r.results);
        setTotal(r.total);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q, category, level, route, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compatibility Registry</h1>
        <p className="text-gray-500">
          Search apps, check runtime compatibility, and see what works on FusionOS before you install.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar value={q} onChange={setQ} placeholder="Search apps by name or description..." />
        </div>
        <FilterBar
          category={category} onCategory={setCategory}
          level={level} onLevel={setLevel}
          route={route} onRoute={setRoute}
        />
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {loading ? 'Loading...' : `${total} app${total !== 1 ? 's' : ''} found`}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-36">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(app => <AppCard key={app.id} app={app} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No apps found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
