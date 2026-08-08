import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import BrowsePage from '@/pages/BrowsePage';
import DetailPage from '@/pages/DetailPage';
import DashboardPage from '@/pages/DashboardPage';
import OwnerPortalPage from '@/pages/OwnerPortalPage';
import AuthPage from '@/pages/AuthPage';

function AppContent() {
  const [page, setPage] = useState('home');
  const [params, setParams] = useState<Record<string, string>>({});
  const { loading } = useAuth();

  const navigate = useCallback((newPage: string, newParams: Record<string, string> = {}) => {
    setPage(newPage);
    setParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main className="flex-1">
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'browse' && <BrowsePage onNavigate={navigate} />}
        {page === 'detail' && <DetailPage hostelId={params.id} onNavigate={navigate} />}
        {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {page === 'owner' && <OwnerPortalPage onNavigate={navigate} />}
        {page === 'auth' && <AuthPage onNavigate={navigate} />}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
