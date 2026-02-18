
import React, { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropDetails from './pages/CropDetails';
import Account from './pages/Account';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import History from './pages/History';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';

import { LanguageProvider } from './i18n.jsx';
import { NotificationProvider } from './components/NotificationProvider.jsx';

const App = () => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('agri_auth');
    return saved ? JSON.parse(saved) : { user: null, token: null, isAuthenticated: false };
  });

  // Fetch latest profile from backend if authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.isAuthenticated && auth.token) {
        try {
          const res = await authAPI.getMe();
          if (res.success) {
            setAuth(prev => ({ ...prev, user: res.data }));
          }
        } catch (e) {
          // ignore
        }
      }
    };
    fetchProfile();
    // Only run on mount and when authenticated
    // eslint-disable-next-line
  }, [auth.isAuthenticated]);
  const [showAddCropModal, setShowAddCropModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('agri_auth', JSON.stringify(auth));
  }, [auth]);

  const login = async (user, token) => {
    // Set token first, then fetch latest profile
    setAuth({ user, token, isAuthenticated: true });
    try {
      const res = await authAPI.getMe();
      if (res.success) {
        setAuth({ user: res.data, token, isAuthenticated: true });
      }
    } catch (e) {
      // ignore
    }
  };

  const logout = () => {
    // Revoke Google Sign-In so it doesn't auto-show account on login page
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
          <div className="min-h-screen flex flex-col">
            {auth.isAuthenticated && <Navbar user={auth.user} onLogout={logout} />}
            <main className="flex-grow pb-20 md:pb-0">
              <Routes>
              <Route 
                path="/login" 
                element={!auth.isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/register" 
                element={!auth.isAuthenticated ? <Register onLogin={login} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                    <Dashboard user={auth.user} showAddCropModal={showAddCropModal} setShowAddCropModal={setShowAddCropModal} />
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
            {auth.isAuthenticated && <MobileNav onAddCrop={() => {
              setShowAddCropModal(true);
              window.location.hash = '#/';
            }} />}
          </div>
        </HashRouter>
      </LanguageProvider>
    </NotificationProvider>
  );
};

export default App;
