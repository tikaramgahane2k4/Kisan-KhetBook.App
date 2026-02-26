
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTranslation } from '../i18n.jsx';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleInitialized = useRef(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '605869796970-pdh168d21jva33qdcsbsnvqjq76380p5.apps.googleusercontent.com';
    if (!clientId) {
      return;
    }

    const tryInitGoogle = () => {
      if (googleInitialized.current) {
        return true;
      }
      if (window.google?.accounts?.id) {
        // Cancel any existing One Tap prompt first
        window.google.accounts.id.cancel();
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (response) => {
            try {
              setLoading(true);
              setError('');
              const result = await authAPI.googleLogin({ credential: response.credential });
              if (result.success) {
                onLogin(result.data, result.data.token);
                navigate('/');
              } else {
                setError(result.message || 'Google login failed');
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Google login failed');
            } finally {
              setLoading(false);
            }
          }
        });

        // Render Google button into hidden container — click is passed through from custom overlay
        const buttonEl = document.getElementById('googleBtnHiddenReg');
        if (buttonEl) {
          window.google.accounts.id.renderButton(buttonEl, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            width: 400
          });
        }

        googleInitialized.current = true;
        return true;
      }
      return false;
    };

    if (!tryInitGoogle()) {
      const interval = setInterval(() => {
        if (tryInitGoogle()) {
          clearInterval(interval);
        }
      }, 500);
      return () => {
        clearInterval(interval);
        if (window.google?.accounts?.id) {
          window.google.accounts.id.cancel();
        }
        googleInitialized.current = false;
      };
    }

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      googleInitialized.current = false;
    };
  }, [navigate, onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      if (response.success) {
        onLogin(response.data, response.data.token);
        navigate('/');
      } else {
        setError(response.message || 'Registration failed');
        if (response.message && response.message.toLowerCase().includes('already exists')) {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      if (msg.toLowerCase().includes('already exists')) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/15 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/15 rounded-full -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-4 right-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 shadow-sm"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="KhetBook" className="w-28 h-28 object-contain drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 font-outfit">{t('createAccount')}</h2>
          <p className="text-slate-500 font-medium">{t('joinFarmers')}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('fullName')}</label>
              <input
                type="text"
                required
                autoComplete="name"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('emailAddress')}</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('password')}</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('confirm')}</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start pt-2">
              <input type="checkbox" required className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
              <label className="ml-2 text-xs text-slate-500 leading-normal">
                {t('agreeToTerms')} <span className="text-emerald-600 font-bold">{t('termsOfService')}</span> {t('and')} <span className="text-emerald-600 font-bold">{t('privacyPolicy')}</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>{t('registerAccount')}</span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="relative w-full">
            {/* Hidden real Google button — receives the actual click */}
            <div id="googleBtnHiddenReg" className="absolute inset-0 w-full opacity-0 z-10 [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full [&_iframe]:!h-full" style={{ height: '100%' }}></div>
            {/* Visible custom styled button */}
            <div className="w-full flex items-center justify-center gap-2 py-3.5 px-6 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Continue with Google</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {t('alreadyMember')}
              <span
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
                onClick={() => navigate('/login')}
              >
                {t('logIn')}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
