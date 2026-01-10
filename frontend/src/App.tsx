import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store';
import { Header } from './components/Header';
import { NotificationContainer } from './components/Notification';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { NFTDetailPage } from './pages/NFTDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import DiscoveryPage from './pages/DiscoveryPage';
import RoyaltiesDashboard from './pages/RoyaltiesDashboard';
import { StudioPage } from './pages/StudioPage';
import AuthPage from './pages/Auth';
import AnalyticsPage from './pages/Analytics';
import AdminDashboard from './pages/Admin';

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Apply theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className={isDarkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/nft/:id" element={<NFTDetailPage />} />
              <Route path="/profile/:address" element={<ProfilePage />} />
              <Route path="/creator/:address" element={<CreatorProfilePage />} />
              <Route path="/royalties/:address" element={<RoyaltiesDashboard />} />
              <Route path="/discover" element={<DiscoveryPage />} />
              <Route path="/marketplace" element={<DiscoveryPage />} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <NotificationContainer />
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
