import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegistryPage from './pages/RegistryPage';
import AppDetailPage from './pages/AppDetailPage';
import RuntimeRouterPage from './pages/RuntimeRouterPage';
import WorkspacesPage from './pages/WorkspacesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registry" element={<RegistryPage />} />
          <Route path="/apps/:slug" element={<AppDetailPage />} />
          <Route path="/runtime-router" element={<RuntimeRouterPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
