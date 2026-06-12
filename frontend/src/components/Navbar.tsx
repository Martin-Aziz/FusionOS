import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/registry', label: 'Registry' },
  { to: '/runtime-router', label: 'Runtime Router' },
  { to: '/workspaces', label: 'Workspaces' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-blue-700 font-bold text-lg tracking-tight">FusionOS</span>
            <span className="hidden sm:inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Alpha</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              GitHub
            </a>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-800"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block text-sm py-1.5 text-gray-700 hover:text-blue-700"
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
