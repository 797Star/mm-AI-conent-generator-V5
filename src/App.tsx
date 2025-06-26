import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/layout/Header';
import { Navigation } from './components/navigation/Navigation';
import { ContentGenerator } from './components/content/ContentGenerator';
import { ContentLibrary } from './components/library/ContentLibrary';
import { TokenSystem } from './components/monetization/TokenSystem';
import { GoogleAds, InterstitialAd } from './components/ads/GoogleAds';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-myanmar-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<ContentGenerator />} />
          <Route path="/library" element={<ContentLibrary />} />
          <Route path="/tokens" element={<TokenSystem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Ad Placements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <GoogleAds 
          adSlot="1234567890" 
          adFormat="horizontal"
          className="text-center"
        />
      </div>
      
      <InterstitialAd />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;