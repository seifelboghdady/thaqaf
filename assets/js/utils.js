/**
 * utils.js — Shared helper functions for ثقف
 */

/* ── Toast Notifications ────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Loading State on Button ────────────────── */
function setButtonLoading(btn, loading, originalText) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.original || originalText || btn.innerHTML;
  }
}

/* ── Validate Email ─────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── Format Price ───────────────────────────── */
function formatPrice(amount, currency = 'EGP') {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/* ── Format Date ─────────────────────────────── */
function formatDate(dateStr) {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr));
}

/* ── Show field error ───────────────────────── */
function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.add('error');
  let errEl = input.parentElement.querySelector('.form-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'form-error';
    input.parentElement.appendChild(errEl);
  }
  errEl.textContent = message;
}

/* ── Clear field error ──────────────────────── */
function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.remove('error');
  const errEl = input.parentElement.querySelector('.form-error');
  if (errEl) errEl.textContent = '';
}

/* ── Debounce ───────────────────────────────── */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ── Get query param ────────────────────────── */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
