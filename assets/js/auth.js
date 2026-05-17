/**
 * auth.js — Token & session management for ثقف
 */

const TOKEN_KEY = 'thaqaf_token';
const USER_KEY  = 'thaqaf_user';

/* ── Save after login ───────────────────────── */
function authSave(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/* ── Get current user ───────────────────────── */
function authUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

/* ── Get token ──────────────────────────────── */
function authToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/* ── Logout ─────────────────────────────────── */
function authLogout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ── Is logged in? ──────────────────────────── */
function authIsLoggedIn() {
  return !!authToken();
}

/* ── Is admin? ───────────────────────────────── */
function authIsAdmin() {
  const user = authUser();
  return user && user.role === 'admin';
}

/**
 * Guard: redirect to login if not authenticated
 * استخدمه في أول كل صفحة محمية
 */
function requireAuth() {
  if (!authIsLoggedIn()) {
    window.location.href = '../../pages/homepage/home.html';
    return false;
  }
  return true;
}

/**
 * Guard: redirect if not admin
 * استخدمه في أول كل صفحة /admin
 */
function requireAdmin() {
  if (!authIsLoggedIn()) {
    window.location.href = '/pages/auth/login.html';
    return false;
  }
  if (!authIsAdmin()) {
    window.location.href = '/pages/homepage/index.html';
    return false;
  }
  return true;
}

/**
 * Guard: redirect logged-in users away from auth pages
 * استخدمه في login.html و register.html
 */
function redirectIfLoggedIn() {
  if (!authIsLoggedIn()) return;
  if (authIsAdmin()) {
    window.location.href = '/thaqaf/admin/index.html';
  } else {
    window.location.href = '/pages/homepage/index.html';
  }
}
