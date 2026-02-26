import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n.jsx';
import { getPendingQueue } from '../services/offlineDB';
import { onSyncStateChange } from '../services/syncEngine';

const OfflineIndicator = () => {
    const { t } = useTranslation();
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [syncState, setSyncState] = useState(null); // { syncing, total, done, remaining }
    const [showSyncedToast, setShowSyncedToast] = useState(false);

    // Track network status
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

    // Poll pending queue count when offline
    useEffect(() => {
        if (!isOffline) return;
        const refresh = () => getPendingQueue().then(q => setPendingCount(q.length)).catch(() => { });
        refresh();
        const interval = setInterval(refresh, 3000);
        return () => clearInterval(interval);
    }, [isOffline]);

    // Subscribe to sync engine state
    useEffect(() => {
        const unsub = onSyncStateChange((state) => {
            setSyncState(state);
            if (!state.syncing && state.done > 0 && state.remaining === 0) {
                // Sync completed successfully
                setPendingCount(0);
                setShowSyncedToast(true);
                setTimeout(() => {
                    setShowSyncedToast(false);
                    setSyncState(null);
                }, 3500);
            }
        });
        return unsub;
    }, []);

    const isSyncing = syncState?.syncing;
    const syncProgress = isSyncing && syncState.total > 0
        ? Math.round((syncState.done / syncState.total) * 100)
        : 0;

    return (
        <>
            {/* ── Offline Banner ─────────────────────────────── */}
            {isOffline && (
                <div
                    className="fixed top-0 left-0 right-0 z-[200]"
                    style={{ animation: 'slideDown 0.3s ease-out' }}
                >
                    <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
                        <div className="flex items-center space-x-2">
                            {/* No-wifi icon */}
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a5 5 0 01-7.072 0m0 0l2.829-2.829m-4.243-4.243a9 9 0 0112.728 0m0 0l-2.829 2.829" />
                            </svg>
                            <span className="text-sm font-semibold">
                                {t('youAreOffline')}
                            </span>
                        </div>

                        {/* Pending queue badge */}
                        {pendingCount > 0 && (
                            <div className="flex items-center space-x-1.5 bg-amber-700/60 rounded-full px-3 py-0.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold">{pendingCount} pending — will sync when online</span>
                            </div>
                        )}

                        {pendingCount === 0 && (
                            <span className="text-xs text-amber-100">Viewing cached data</span>
                        )}
                    </div>
                </div>
            )}

            {/* ── Syncing Progress Banner ─────────────────────── */}
            {!isOffline && isSyncing && (
                <div
                    className="fixed top-0 left-0 right-0 z-[200]"
                    style={{ animation: 'slideDown 0.3s ease-out' }}
                >
                    <div className="bg-blue-600 text-white px-4 py-2.5 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                                <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="text-sm font-semibold">
                                    Syncing offline changes… ({syncState.done}/{syncState.total})
                                </span>
                            </div>
                            <span className="text-xs font-bold text-blue-100">{syncProgress}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 bg-blue-400/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-300"
                                style={{ width: `${syncProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sync Complete Toast ─────────────────────────── */}
            {showSyncedToast && (
                <div
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[200]"
                    style={{ animation: 'slideDown 0.3s ease-out' }}
                >
                    <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center space-x-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold">All changes synced successfully!</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default OfflineIndicator;
