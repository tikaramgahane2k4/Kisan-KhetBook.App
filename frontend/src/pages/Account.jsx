import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';

const Account = ({ user, onLogout, onUpdateUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      to: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: t('myProfile'),
      desc: t('managePersonalInfo'),
      color: 'bg-emerald-50 text-emerald-600',
      arrow: true
    },
    {
      to: '/history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: t('history'),
      desc: t('historyDesc'),
      color: 'bg-blue-50 text-blue-600',
      arrow: true
    },
    {
      to: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: t('settings'),
      desc: t('settingsDesc'),
      color: 'bg-purple-50 text-purple-600',
      arrow: true
    },
    {
      to: '/help',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: t('help'),
      desc: t('helpDesc'),
      color: 'bg-amber-50 text-amber-600',
      arrow: true
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-1.5 text-slate-500 hover:text-emerald-600 transition-colors mb-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">{t('backToDashboard')}</span>
      </button>

      {/* User Header Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 mb-5 shadow-lg shadow-emerald-900/10">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white font-outfit truncate">{user?.name || 'Farmer'}</h2>
            <p className="text-emerald-100 text-sm truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {menuItems.map((item, index) => {
          const className = `flex items-center px-5 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors w-full text-left ${
            index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
          }`;
          const content = (
            <>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                {item.icon}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              {item.arrow && (
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          );

          return (
            <Link key={item.to} to={item.to} className={className}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-5 flex items-center justify-center space-x-2 px-5 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-semibold transition-colors border border-red-100"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>{t('logout')}</span>
      </button>

      {/* App Version */}
      <p className="text-center text-xs text-slate-400 mt-4">{t('appName')} v1.0</p>
    </div>
  );
};

export default Account;
