import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LinkTree from './components/LinkTree';
import AdminDashboard from './components/admin/AdminDashboard';
import ThreeBackground from './components/three/ThreeBackground';
import AdminBackground from './components/three/AdminBackground';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { useRealtime } from './hooks/useRealtime';
import { dataApi } from './services/api';
import { useLinks } from './hooks/useLinks';

function App() {
  const { isAdmin } = useAuth();
  const { isConnected } = useRealtime();
  const { setLinks, setPdfs, setNews, setAlerts, setGroups } = useLinks();

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await dataApi.getAll();
        const data = response.data;
        
        setLinks(data.links || []);
        setPdfs(data.pdfs || []);
        setNews(data.news || []);
        setAlerts(data.alerts || []);
        setGroups(data.groups || []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    if (!isConnected) {
      loadInitialData();
    }
  }, [isConnected, setLinks, setPdfs, setNews, setAlerts, setGroups]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="relative min-h-screen">
          {/* Connection Status Indicator */}
          <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>

          <Routes>
            <Route path="/" element={
              <div className="relative min-h-screen w-full overflow-hidden">
                <ThreeBackground />
                <Layout>
                  <LinkTree />
                </Layout>
              </div>
            } />
            
            <Route path="/admin/*" element={
              isAdmin ? (
                <div className="relative min-h-screen w-full overflow-hidden">
                  <AdminBackground />
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            } />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;