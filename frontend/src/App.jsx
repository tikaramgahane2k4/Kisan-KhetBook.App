
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { authAPI } from './services/api';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Eagerly-loaded core (always needed immediately)
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineIndicator from './components/OfflineIndicator';
import { LanguageProvider } from './i18n.jsx';
import { NotificationProvider } from './components/NotificationProvider.jsx';
import { startSyncEngine } from './services/syncEngine';

// Start the offline sync engine immediately (listens for online events)
startSyncEngine();

// Lazy-loaded pages — split into separate chunks, loaded only when visited
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CropDetails = lazy(() => import('./pages/CropDetails'));
const Account = lazy(() => import('./pages/Account'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));
const History = lazy(() => import('./pages/History'));
const MandiPrices = lazy(() => import('./pages/MandiPrices'));
const SeasonCompare = lazy(() => import('./pages/SeasonCompare'));
const GovSchemes = lazy(() => import('./pages/GovSchemes'));

// Full-screen spinner shown while a lazy page chunk is loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <svg
        className="animate-spin w-10 h-10 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-slate-400 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

const App = () => {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_auth');
      return saved ? JSON.parse(saved) : { user: null, token: null, isAuthenticated: false };
    } catch {
      return { user: null, token: null, isAuthenticated: false };
    }
  });
  const [showAddCropModal, setShowAddCropModal] = useState(false);

  // Fetch latest profile from backend on app start if already logged in
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) return;
    let cancelled = false;
    authAPI.getMe().then(res => {
      if (!cancelled && res.success) {
        setAuth(prev => ({ ...prev, user: res.data }));
      }
    }).catch(() => { });
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [auth.isAuthenticated]);

  // Persist auth state to localStorage
  useEffect(() => {
    localStorage.setItem('agri_auth', JSON.stringify(auth));
  }, [auth]);

  const login = async (user, token) => {
    setAuth({ user, token, isAuthenticated: true });
    try {
      const res = await authAPI.getMe();
      if (res.success) {
        setAuth({ user: res.data, token, isAuthenticated: true });
      }
    } catch { /* ignore */ }
  };

  const logout = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.cancel();
    }
    setAuth({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('agri_auth');
  };

  const updateUser = (updatedUser) => {
    setAuth(prev => ({
      ...prev,
      user: { ...prev.user, ...updatedUser }
    }));
  };

  return (
    <NotificationProvider>
      <LanguageProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col" style={{ minHeight: '100dvh' }}>
            {auth.isAuthenticated && <Navbar user={auth.user} />}

            {/* Padding ensures content is not hidden behind fixed MobileNav on mobile.
                On desktop (md+) no bottom padding needed.
                env(safe-area-inset-bottom) adds iPhone home indicator space on top. */}
            <main className="flex-grow main-content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route
                    path="/login"
                    element={!auth.isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/" replace />}
                  />
                  <Route
                    path="/register"
                    element={!auth.isAuthenticated ? <Register onLogin={login} /> : <Navigate to="/" replace />}
                  />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <Dashboard
                          user={auth.user}
                          showAddCropModal={showAddCropModal}
                          setShowAddCropModal={setShowAddCropModal}
                        />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crop/:id"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <CropDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <Account user={auth.user} onLogout={logout} onUpdateUser={updateUser} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <Profile user={auth.user} onUpdateUser={updateUser} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <Help />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <History />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mandi-prices"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <MandiPrices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/season-compare"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <SeasonCompare />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gov-schemes"
                    element={
                      <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                        <GovSchemes />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            {auth.isAuthenticated && (
              <MobileNav
                onAddCrop={() => {
                  setShowAddCropModal(true);
                  window.location.hash = '#/';
                }}
              />
            )}
            <OfflineIndicator />
          </div>
        </HashRouter>
      </LanguageProvider>
    </NotificationProvider>
  );
};

export default App;
