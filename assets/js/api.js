/**
 * api.js — Fetch wrapper for ثقف API
 * Base URL: قابل للتغيير حسب البيئة
 */

// const API_BASE = 'http://localhost:3000/api'; // غيّر حسب الـ backend URL
const API_BASE = 'http://192.168.1.5:3000/api';

/**
 * الـ request الأساسي
 * @param {string} endpoint
 * @param {object} options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('thaqaf_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Token expired أو غير صالح
    if (res.status === 401) {
      authLogout();
      window.location.href = '/pages/auth/login.html';
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw { status: res.status, message: data.message || 'حدث خطأ ما' };
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    throw { status: 0, message: 'تعذّر الاتصال بالخادم' };
  }
}

/* ── HTTP Methods ───────────────────────────── */

const api = {
  get:    (endpoint)       => request(endpoint, { method: 'GET' }),
  post:   (endpoint, body) => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body) => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),
};

/* ── Endpoints ──────────────────────────────── */

// Auth
const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};
// Products
const productsAPI = {
  getAll: (page = 1, limit = 10) =>
  api.get(`/products?page=${page}&limit=${limit}`),
  getById:  (id)   => api.get(`/products/${id}`),
  add:      (data) => api.post('/products', data),
  update:   (id, data) => api.put(`/products/${id}`, data),
  delete:   (id)   => api.delete(`/products/${id}`),
};

// Cart
const cartAPI = {
  add:  (data) => api.post('/cart', data),
  view: ()     => api.get('/cart'),
};

// Orders
const ordersAPI = {
  create:   (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders'),
};

// Profile & Password (تمت الإضافة والإغلاق الصحيح هنا)
const profileAPI = {
  update: (formData) => {
    const token = localStorage.getItem('thaqaf_token');
    return fetch(`${API_BASE}/profile`, { 
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData
    }).then(async (res) => {
      if (res.status === 401) {
        authLogout();
        window.location.href = '/pages/auth/login.html';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw { status: res.status, message: data.message || 'حدث خطأ ما' };
      return data;
    });
  },

  updatePassword: (data) => api.put('pages/profile/password', data)
};