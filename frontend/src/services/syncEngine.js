/**
 * syncEngine.js — Replays queued offline mutations when back online.
 *
 * Usage: call startSyncEngine() once in App.jsx.
 * It listens for the browser `online` event and processes the pending queue.
 */

import api from './api';
import { getPendingQueue, dequeueItem, saveCropsLocally } from './offlineDB';

// Callbacks registered by UI components
const listeners = new Set();

export function onSyncStateChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn); // returns unsubscribe function
}

function emit(state) {
    listeners.forEach(fn => fn(state));
}

let syncing = false;

/**
 * Process all pending mutations in queue order.
 * On success each item is dequeued.
 * On failure (4xx) the item is dropped (server rejected it).
 * On network error we stop processing and retry next time.
 */
export async function syncNow() {
    if (syncing || !navigator.onLine) return;
    syncing = true;

    const queue = await getPendingQueue().catch(() => []);
    if (queue.length === 0) {
        syncing = false;
        return;
    }

    emit({ syncing: true, total: queue.length, done: 0 });

    let done = 0;
    for (const item of queue) {
        if (!navigator.onLine) break; // went offline mid-sync

        try {
            const { method, url, body } = item;
            const config = { method: method.toLowerCase(), url };
            if (body) config.data = body;

            await api.request(config);
            await dequeueItem(item.qid);
            done++;
            emit({ syncing: true, total: queue.length, done });
        } catch (err) {
            if (err.response) {
                // Server returned a 4xx/5xx — drop this item (can't retry)
                await dequeueItem(item.qid).catch(() => { });
                done++;
            } else {
                // Network error — stop processing, retry next online event
                break;
            }
        }
    }

    // Refresh local DB cache after sync so data is consistent
    try {
        const auth = localStorage.getItem('agri_auth');
        if (auth) {
            const { token } = JSON.parse(auth);
            if (token && navigator.onLine) {
                const res = await api.get('/crops');
                if (res.data?.success) {
                    await saveCropsLocally(res.data.data).catch(() => { });
                }
            }
        }
    } catch { /* ignore */ }

    syncing = false;
    const remaining = (await getPendingQueue().catch(() => [])).length;
    emit({ syncing: false, total: queue.length, done, remaining });
}

/**
 * Start listening for online events and trigger sync.
 * Call once at app startup.
 */
export function startSyncEngine() {
    const handleOnline = () => {
        // Small delay to let the network actually stabilise
        setTimeout(syncNow, 1500);
    };

    window.addEventListener('online', handleOnline);

    // Also try to sync immediately if we're already online on startup
    // (handles case where user was offline and reloaded the page)
    if (navigator.onLine) {
        setTimeout(syncNow, 3000);
    }

    return () => window.removeEventListener('online', handleOnline);
}
