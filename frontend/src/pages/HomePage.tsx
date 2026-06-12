import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchApps } from '../lib/api';
import type { AppCompatibilityRecord } from '../types';
import AppCard from '../components/AppCard';

export default function HomePage() {
  const [featured, setFeatured] = useState<AppCompatibilityRecord[]>([]);

  useEffect(() => {
    searchApps({ pageSize: 6 })
      .then(r => setFeatured(r.results))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Alpha — Compatibility Registry
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            One open system for<br />every runtime world.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            FusionOS is a compatibility-first Linux-based OS. Search an app, see the best runtime path,
            and launch with confidence — Linux native, Windows via Wine/Proton, games, containers, and AI-agent workspaces.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/registry"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Compatibility Registry
            </Link>
            <Link
              to="/runtime-router"
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              How Runtime Routing Works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          The fragmented runtime problem
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-10">
          Modern workflows span Linux-native apps, Windows software, games, containers, and AI tools.
          FusionOS gives you one host, one registry, and one routing layer.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Linux-native',
              icon: '🐧',
              desc: 'Native packages, Flatpak, AppImage, and apt-installed tools — managed from one place.'
            },
            {
              title: 'Windows compatibility',
              icon: '🍷',
              desc: 'Run Windows apps through Wine and Proton. Know compatibility before you spend hours configuring.'
            },
            {
              title: 'Games + AI workspaces',
              icon: '🎮',
              desc: 'Managed Proton paths for Steam games. Isolated agent workspaces for AI and automation tools.'
            }
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            How FusionOS works
          </h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Search an app', desc: 'Look up any app in the compatibility registry.' },
              { step: '02', title: 'See compatibility', desc: 'View the level, known issues, and hardware notes.' },
              { step: '03', title: 'Choose your route', desc: 'Pick the recommended runtime path or an alternative.' },
              { step: '04', title: 'Launch & report', desc: 'Install and run. Submit a report to help others.' }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-blue-600 font-bold text-lg mb-2 font-mono">{item.step}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registry Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Compatibility Registry</h2>
          <Link to="/registry" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Browse all apps →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(app => <AppCard key={app.id} app={app} />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Game Support */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-3">Game compatibility</h2>
          <p className="text-gray-300 mb-6">
            FusionOS provides managed Proton and Wine paths for games — and is honest about what doesn't work.
            Anti-cheat kernel modules that require Windows are flagged clearly.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { name: 'Steam', status: 'Platinum', note: 'Native Linux client + Proton' },
              { name: 'Proton games', status: 'Gold–Platinum', note: 'Most DX11/DX12 games' },
              { name: 'Anti-cheat titles', status: 'Bronze/Blocked', note: 'Kernel anti-cheat incompatible' }
            ].map(item => (
              <div key={item.name} className="bg-gray-800 rounded-lg p-4">
                <div className="font-semibold mb-1">{item.name}</div>
                <div className="text-gray-300 text-xs">{item.status}</div>
                <div className="text-gray-400 text-xs mt-1">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Workspaces */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">Planned — Alpha 3</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Agent Workspaces</h2>
          <p className="text-gray-600 text-sm mb-4">
            Isolated environments for running local AI agents, dev tools, and automation scripts.
            Each workspace has controlled filesystem access, network permissions, and a rollback state.
            Contract-first API is available now. Full execution engine planned for Alpha 3.
          </p>
          <Link
            to="/workspaces"
            className="inline-block bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Explore Workspaces →
          </Link>
        </div>
      </section>

      {/* Alpha Scope + Honesty */}
      <section className="bg-amber-50 border-y border-amber-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">What FusionOS is — and is not — today</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-green-800 mb-2">✓ What Alpha includes</p>
              <ul className="space-y-1 text-gray-700">
                <li>Compatibility registry with 10+ seeded apps</li>
                <li>Runtime route labels and install guidance</li>
                <li>Community report submission</li>
                <li>Linux-native and Wine/Proton route foundations</li>
                <li>Agent workspace API contracts (Alpha UI)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-800 mb-2">✗ What Alpha does NOT include</p>
              <ul className="space-y-1 text-gray-700">
                <li>Full macOS app compatibility (experimental/future research)</li>
                <li>GUI OS installer (command-line/Docker only)</li>
                <li>Anti-cheat game support</li>
                <li>Automated app installation execution</li>
                <li>Real agent workspace execution engine</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
