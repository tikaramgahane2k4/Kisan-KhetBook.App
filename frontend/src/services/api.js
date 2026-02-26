
import axios from 'axios';
import {
  saveCropsLocally,
  saveCropLocally,
  getLocalCrops,
  getLocalCropById,
  removeLocalCrop,
  enqueueMutation,
  kvGet,
  kvSet,
} from './offlineDB';

const API_URL = import.meta.env.VITE_API_URL || 'https://kisan-sathi-app.vercel.app/api';

// ─── Axios instance ──────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,        // 12s timeout so slow mobile networks don't hang forever
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const auth = localStorage.getItem('agri_auth');
      if (auth) {
        const { token } = JSON.parse(auth);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch { /* ignore parse errors */ }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agri_auth');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// ─── Network status helper ────────────────────────────────────────
const isOnline = () => navigator.onLine;

// ────────────────────────────────────────────────────────────────
// Auth APIs — auth always requires network (no offline fallback)
// ────────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  googleLogin: async (payload) => {
    const res = await api.post('/auth/google', payload);
    return res.data;
  },

  getMe: async () => {
    if (!isOnline()) {
      // Return locally cached profile if offline
      const cached = await kvGet('user_profile');
      if (cached) return { success: true, data: cached };
      throw new Error('Offline');
    }
    const res = await api.get('/auth/me');
    if (res.data?.success) {
      // Cache profile locally
      await kvSet('user_profile', res.data.data).catch(() => { });
    }
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data?.success) {
      await kvSet('user_profile', res.data.data).catch(() => { });
    }
    return res.data;
  },
};

// ────────────────────────────────────────────────────────────────
// Crop APIs — offline-aware
// ────────────────────────────────────────────────────────────────
export const cropAPI = {

  /** GET all crops — network first, fall back to IndexedDB */
  getCrops: async () => {
    if (!isOnline()) {
      const local = await getLocalCrops();
      return { success: true, data: local, offline: true };
    }
    try {
      const res = await api.get('/crops');
      if (res.data?.success) {
        // Persist to local DB for offline use
        await saveCropsLocally(res.data.data).catch(() => { });
      }
      return res.data;
    } catch (err) {
      // Network call failed even though online flag was true (flaky connection)
      const local = await getLocalCrops();
      if (local.length > 0) {
        return { success: true, data: local, offline: true };
      }
      throw err;
    }
  },

  /** GET single crop — network first, fall back to IndexedDB */
  getCropById: async (id) => {
    if (!isOnline()) {
      const local = await getLocalCropById(id);
      if (local) return { success: true, data: local, offline: true };
      return { success: false, message: 'Not available offline' };
    }
    try {
      const res = await api.get(`/crops/${id}`);
      if (res.data?.success) {
        await saveCropLocally(res.data.data).catch(() => { });
      }
      return res.data;
    } catch (err) {
      const local = await getLocalCropById(id);
      if (local) return { success: true, data: local, offline: true };
      throw err;
    }
  },

  /** POST new crop — queue when offline */
  createCrop: async (cropData) => {
    if (!isOnline()) {
      // Create a temp local ID (will be replaced by server ID on sync)
      const tempId = `temp_${Date.now()}`;
      const tempCrop = { ...cropData, _id: tempId, __isTemp: true, status: 'Active', expenses: [], sales: [] };
      await saveCropLocally(tempCrop);
      await enqueueMutation('POST', '/crops', cropData, `Add crop: ${cropData.name}`, { type: 'CREATE_CROP', data: tempCrop });
      return { success: true, data: tempCrop, offline: true, queued: true };
    }
    const res = await api.post('/crops', cropData);
    if (res.data?.success) {
      await saveCropLocally(res.data.data).catch(() => { });
    }
    return res.data;
  },

  /** PUT update crop — queue when offline */
  updateCrop: async (id, cropData) => {
    if (!isOnline()) {
      // Optimistically update local DB
      const existing = await getLocalCropById(id) || {};
      const updated = { ...existing, ...cropData, _id: id };
      await saveCropLocally(updated);
      await enqueueMutation('PUT', `/crops/${id}`, cropData, `Update crop`, { type: 'UPDATE_CROP', id, data: updated });
      return { success: true, data: updated, offline: true, queued: true };
    }
    const res = await api.put(`/crops/${id}`, cropData);
    if (res.data?.success) {
      await saveCropLocally(res.data.data).catch(() => { });
    }
    return res.data;
  },

  /** DELETE crop — queue when offline */
  deleteCrop: async (id) => {
    if (!isOnline()) {
      await removeLocalCrop(id);
      await enqueueMutation('DELETE', `/crops/${id}`, null, `Delete crop`, { type: 'DELETE_CROP', id });
      return { success: true, offline: true, queued: true };
    }
    const res = await api.delete(`/crops/${id}`);
    if (res.data?.success) {
      await removeLocalCrop(id).catch(() => { });
    }
    return res.data;
  },

  /** POST sale — queue when offline */
  addSale: async (id, saleData) => {
    if (!isOnline()) {
      await enqueueMutation('POST', `/crops/${id}/sales`, saleData, `Record sale`, { type: 'ADD_SALE', cropId: id, data: saleData });
      return { success: true, offline: true, queued: true };
    }
    const res = await api.post(`/crops/${id}/sales`, saleData);
    if (res.data?.success) {
      await saveCropLocally(res.data.data).catch(() => { });
    }
    return res.data;
  },

  /** DELETE all crops — requires network (destructive) */
  deleteAllCrops: async () => {
    const res = await api.delete('/crops');
    return res.data;
  },
};

// ────────────────────────────────────────────────────────────────
// Expense APIs — queue when offline
// ────────────────────────────────────────────────────────────────
export const expenseAPI = {

  addExpense: async (cropId, expenseData) => {
    if (!isOnline()) {
      await enqueueMutation('POST', `/expenses/${cropId}`, expenseData, `Add expense`, { type: 'ADD_EXPENSE', cropId });
      return { success: true, offline: true, queued: true };
    }
    const res = await api.post(`/expenses/${cropId}`, expenseData);
    if (res.data?.success) {
      await saveCropLocally(res.data.data).catch(() => { });
    }
    return res.data;
  },

  updateExpense: async (cropId, expenseId, expenseData) => {
    if (!isOnline()) {
      await enqueueMutation('PUT', `/expenses/${cropId}/${expenseId}`, expenseData, `Update expense`, { type: 'UPDATE_EXPENSE', cropId });
      return { success: true, offline: true, queued: true };
    }
    const res = await api.put(`/expenses/${cropId}/${expenseId}`, expenseData);
    if (res.data?.success) {
      await saveCropLocally(res.data.data).catch(() => { });
    }
    return res.data;
  },

  deleteExpense: async (cropId, expenseId) => {
    if (!isOnline()) {
      await enqueueMutation('DELETE', `/expenses/${cropId}/${expenseId}`, null, `Delete expense`, { type: 'DELETE_EXPENSE', cropId });
      return { success: true, offline: true, queued: true };
    }
    const res = await api.delete(`/expenses/${cropId}/${expenseId}`);
    if (res.data?.success) {
      await saveCropLocally(res.data.data).catch(() => { });
    }
    return res.data;
  },
};

export default api;
