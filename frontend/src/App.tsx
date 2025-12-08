import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store';
import { Header } from './components/Header';
import { NotificationContainer } from './components/Notification';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { NFTDetailPage } from './pages/NFTDetailPage';
import { ProfilePage } from './pages/ProfilePage';

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
    <BrowserRouter>
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/nft/:id" element={<NFTDetailPage />} />
            <Route path="/profile/:address" element={<ProfilePage />} />
            <Route path="/discover" element={<HomePage />} />
            <Route path="/studio" element={<ProfilePage />} />
          </Routes>
          <NotificationContainer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
