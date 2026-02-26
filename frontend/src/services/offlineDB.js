/**
 * offlineDB.js — IndexedDB wrapper for offline-first data persistence.
 *
 * Stores:
 *  • crops          — latest known crops list (keyed by _id)
 *  • pending_queue  — mutations to replay when back online
 *  • kv             — key-value store for user profile, etc.
 */

const DB_NAME = 'khetbook_offline';
const DB_VERSION = 1;

const STORES = {
    CROPS: 'crops',
    QUEUE: 'pending_queue',
    KV: 'kv',
};

let _db = null;

/** Open (or return cached) database connection */
function openDB() {
    if (_db) return Promise.resolve(_db);

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onerror = () => reject(req.error);
        req.onsuccess = () => { _db = req.result; resolve(_db); };

        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORES.CROPS)) {
                db.createObjectStore(STORES.CROPS, { keyPath: '_id' });
            }
            if (!db.objectStoreNames.contains(STORES.QUEUE)) {
                const qs = db.createObjectStore(STORES.QUEUE, { keyPath: 'qid', autoIncrement: true });
                qs.createIndex('ts', 'ts');
            }
            if (!db.objectStoreNames.contains(STORES.KV)) {
                db.createObjectStore(STORES.KV, { keyPath: 'key' });
            }
        };
    });
}

/** Generic transaction helper */
async function tx(storeName, mode, fn) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const req = fn(store);
        transaction.oncomplete = () => resolve(req?.result ?? undefined);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

// ─────────────────────────────────────────────
// Crops
// ─────────────────────────────────────────────

/** Save entire crops array to local DB */
export async function saveCropsLocally(crops) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CROPS, 'readwrite');
        const store = transaction.objectStore(STORES.CROPS);
        // Clear old data and write fresh
        store.clear();
        crops.forEach(c => store.put(c));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

/** Save or update a single crop */
export async function saveCropLocally(crop) {
    return tx(STORES.CROPS, 'readwrite', store => store.put(crop));
}

/** Get all crops from local DB */
export async function getLocalCrops() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CROPS, 'readonly');
        const store = transaction.objectStore(STORES.CROPS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

/** Get a single crop by ID from local DB */
export async function getLocalCropById(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CROPS, 'readonly');
        const store = transaction.objectStore(STORES.CROPS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

/** Remove a crop from local DB */
export async function removeLocalCrop(id) {
    return tx(STORES.CROPS, 'readwrite', store => store.delete(id));
}

// ─────────────────────────────────────────────
// Pending Queue
// ─────────────────────────────────────────────

/**
 * Add a pending mutation to the queue.
 * @param {'POST'|'PUT'|'DELETE'} method
 * @param {string} url  — relative path, e.g. '/crops/123'
 * @param {object|null} body
 * @param {string} label — human-readable description for UI
 * @param {object} localEffect — { type, data } describing local optimistic state change
 */
export async function enqueueMutation(method, url, body, label, localEffect = null) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.QUEUE, 'readwrite');
        const store = transaction.objectStore(STORES.QUEUE);
        const req = store.add({ method, url, body, label, localEffect, ts: Date.now() });
        req.onsuccess = () => resolve(req.result); // returns new qid
        transaction.onerror = () => reject(transaction.error);
    });
}

/** Get all pending mutations in insertion order */
export async function getPendingQueue() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.QUEUE, 'readonly');
        const store = transaction.objectStore(STORES.QUEUE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

/** Remove a mutation from the queue after it has been successfully replayed */
export async function dequeueItem(qid) {
    return tx(STORES.QUEUE, 'readwrite', store => store.delete(qid));
}

/** Clear the entire queue (e.g. after server conflict) */
export async function clearQueue() {
    return tx(STORES.QUEUE, 'readwrite', store => store.clear());
}

// ─────────────────────────────────────────────
// KV Store (user profile, etc.)
// ─────────────────────────────────────────────

export async function kvSet(key, value) {
    return tx(STORES.KV, 'readwrite', store => store.put({ key, value }));
}

export async function kvGet(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.KV, 'readonly');
        const store = transaction.objectStore(STORES.KV);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror = () => reject(req.error);
    });
}
