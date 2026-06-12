import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-300 font-mono text-6xl font-bold mb-4">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 text-sm">The page you're looking for doesn't exist in FusionOS.</p>
      <div className="flex justify-center gap-3">
        <Link to="/" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Go Home
        </Link>
        <Link to="/registry" className="bg-white text-gray-700 text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          Browse Registry
        </Link>
      </div>
    </div>
  );
}
