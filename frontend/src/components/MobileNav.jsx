import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';

const MobileNav = ({ onAddCrop }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const isAccountActive = () =>
    ['/account', '/profile', '/settings', '/help', '/history',
      '/mandi-prices', '/season-compare', '/gov-schemes'].includes(location.pathname);

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50 no-print"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-3 h-16">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors active:scale-95 ${isActive('/')
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span className="text-xs font-semibold">{t('home')}</span>
        </Link>

        {/* Add Crop — prominent centre button */}
        <button
          onClick={onAddCrop}
          className="flex flex-col items-center justify-center relative active:scale-95 transition-transform"
          aria-label={t('addCrop')}
        >
          <div className="absolute -top-5 bg-emerald-600 rounded-full p-3.5 shadow-lg shadow-emerald-600/40 border-4 border-white">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
          <span className="text-xs font-semibold text-emerald-600 mt-6">{t('addCrop')}</span>
        </button>

        {/* Profile/Account */}
        <Link
          to="/account"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors active:scale-95 ${isAccountActive()
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span className="text-xs font-semibold">{t('account')}</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
