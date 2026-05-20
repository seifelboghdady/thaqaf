/**
 * navbar.js — Shared navbar logic for ثقف
 * Include this script in every page after auth.js
 */

function initNavbar(activePage = '') {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  /* ── Scroll shadow ── */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  /* ── Mobile toggle ── */
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  mobileToggle?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    mobileToggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  /* ── User dropdown ── */
  const avatarBtn  = document.getElementById('navAvatar');
  const dropdown   = document.getElementById('navDropdown');
  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown?.classList.remove('open'));

  /* ── Logout ── */
  document.querySelectorAll('[data-action=\"logout\"]').forEach(btn => {
    btn.addEventListener('click', () => {
      authLogout();
      window.location.href = '/pages/auth/login.html';
    });
  });

  /* ── Active link ── */
  document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
    if (link.dataset.page === activePage) link.classList.add('active');
  });

  /* ── Render user state ── */
  const user = authUser();
  const guestZone  = document.getElementById('navGuest');
  const userZone   = document.getElementById('navUser');
  const cartBadge  = document.getElementById('cartBadge');
  const avatarText = document.getElementById('avatarText');
  const dropName   = document.getElementById('dropUserName');
  const dropEmail  = document.getElementById('dropUserEmail');
  const adminLink  = document.getElementById('adminLink');

  if (user) {
    guestZone?.classList.add('hidden');
    userZone?.classList.remove('hidden');
    
    // ════════ الإصلاح الفعلي لعرض الصورة ════════
    if (avatarBtn) {
      if (user.image) {
        // إذا كان هناك صورة، يتم حقنها داخل زر الـ avatar واستبدال النص التلقائي
        avatarBtn.innerHTML = `<img src="${user.image}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
      } else if (avatarText) {
        // العودة للحرف الأول إذا لم تكن الصورة مرفوعة
        avatarText.textContent = user.name?.charAt(0) || 'U';
      }
    }
    // ═════════════════════════════════════════

    if (dropName)   dropName.textContent   = user.name  || '';
    if (dropEmail)  dropEmail.textContent  = user.email || '';
    if (adminLink && authIsAdmin()) adminLink.classList.remove('hidden');
  } else {
    guestZone?.classList.remove('hidden');
    userZone?.classList.add('hidden');
  }

  /* ── Cart count (from localStorage cache) ── */
  const cartCount = parseInt(localStorage.getItem('thaqaf_cart_count') || '0');
  if (cartBadge) {
    if (cartCount > 0) { cartBadge.textContent = cartCount; cartBadge.style.display = 'flex'; }
    else cartBadge.style.display = 'none';
  }
}