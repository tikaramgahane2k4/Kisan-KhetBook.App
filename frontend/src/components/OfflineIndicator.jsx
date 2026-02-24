import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n.jsx';

const OfflineIndicator = () => {
    const { t } = useTranslation();
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-[slideDown_0.3s_ease-out]">
            <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-center space-x-2 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a5 5 0 01-7.072 0m0 0l2.829-2.829m-4.243-4.243a9 9 0 0112.728 0m0 0l-2.829 2.829" />
                </svg>
                <span className="text-sm font-bold">{t('youAreOffline')} — {t('syncSoon')}</span>
            </div>
        </div>
    );
};

export default OfflineIndicator;
