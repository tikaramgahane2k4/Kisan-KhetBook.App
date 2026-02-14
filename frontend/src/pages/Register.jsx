
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
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    const tryInitGoogle = () => {
      if (googleInitialized.current) {
        return true;
      }
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
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

        const buttonEl = document.getElementById('googleSignInBtnRegister');
        if (buttonEl) {
          window.google.accounts.id.renderButton(buttonEl, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: 320
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
      return () => clearInterval(interval);
    }
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
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
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
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('emailAddress')}</label>
              <input 
                type="email" 
                required 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('password')}</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('confirm')}</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
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

          <div className="flex justify-center">
            <div id="googleSignInBtnRegister"></div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">{t('alreadyMember')} <Link to="/login" className="text-emerald-600 font-bold hover:underline">{t('logIn')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
