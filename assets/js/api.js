/**
 * api.js — Fetch wrapper for ثقف API
 * Base URL: قابل للتغيير حسب البيئة
 */

const API_BASE = 'http://localhost:3000/api'; // غيّر حسب الـ backend URL

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
  getAll:   ()     => api.get('/allProduct'),
  getById:  (id)   => api.get(`/GetProductByid/${id}`),
  add:      (data) => api.post('/addProduct', data),
  update:   (id, data) => api.put(`/update product/${id}`, data),
  delete:   (id)   => api.delete(`/delete product/${id}`),
};

// Cart
const cartAPI = {
  add:  (data) => api.post('/add to cart', data),
  view: ()     => api.get('/veiwCart'),
};

// Orders
const ordersAPI = {
  create:   (data) => api.post('/CreateOrder', data),
  getUserOrders: () => api.get('/GetUserOrder'),
};
