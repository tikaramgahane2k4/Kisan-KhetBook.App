import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';

const Settings = () => {
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'हिंदी', native: 'Hindi' },
    { code: 'mr', label: 'मराठी', native: 'Marathi' }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      {/* Back Button */}
      <div className="mb-5">
        <Link to="/account" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToAccount')}
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-outfit">{t('settings')}</h1>
              <p className="text-purple-100 text-sm">{t('settingsDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">{t('languageLabel')}</p>
              <p className="text-xs text-slate-500">{t('chooseLanguage')}</p>
            </div>
          </div>
        </div>

        <div className="p-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl mb-1.5 last:mb-0 transition-all ${language === lang.code
                  ? 'bg-emerald-50 border-2 border-emerald-500'
                  : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.code === 'en' ? '🇬🇧' : lang.code === 'hi' ? '🇮🇳' : '🇮🇳'}</span>
                <div className="text-left">
                  <p className={`text-base font-semibold ${language === lang.code ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {lang.label}
                  </p>
                  <p className="text-xs text-slate-500">{lang.native}</p>
                </div>
              </div>
              {language === lang.code && (
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
