/**
 * home.js — Home Page logic for ثقف
 */

/* ── Init navbar ── */
initNavbar('home');

/* ══════════════════════════════════════════════
   LOAD PRODUCTS FROM API
══════════════════════════════════════════════ */
let allProducts = [];

async function loadProducts() {
  try {
    const data = await productsAPI.getAll(state.page, state.perPage);
    allProducts = data.products || data || [];
    renderFeatured(allProducts.slice(0, 8));
    renderNew(allProducts.slice(-3));
  } catch (err) {
    console.warn('Could not load products:', err.message);
    // لو الـ API مش شغالة، اعرض placeholder cards بدل الـ skeleton
    renderFeatured(getMockProducts(8));
    renderNew(getMockProducts(3));
  }
}

/* ── Mock data (fallback) ── */
function getMockProducts(count) {
  const books = [
    { _id:'1', title:'Clean Code', author:'Robert C. Martin', price:280, oldPrice:350, category:'programming', rating:4.8, reviews:124 },
    { _id:'2', title:'The Pragmatic Programmer', author:'Hunt & Thomas', price:320, oldPrice:null, category:'programming', rating:4.9, reviews:98 },
    { _id:'3', title:'Deep Work', author:'Cal Newport', price:220, oldPrice:260, category:'productivity', rating:4.7, reviews:203 },
    { _id:'4', title:'Atomic Habits', author:'James Clear', price:240, oldPrice:300, category:'selfdev', rating:4.9, reviews:512 },
    { _id:'5', title:'The Phoenix Project', author:'Gene Kim', price:265, oldPrice:null, category:'business', rating:4.6, reviews:87 },
    { _id:'6', title:'Design Patterns', author:'Gang of Four', price:340, oldPrice:420, category:'programming', rating:4.5, reviews:64 },
    { _id:'7', title:'Getting Things Done', author:'David Allen', price:190, oldPrice:null, category:'productivity', rating:4.4, reviews:156 },
    { _id:'8', title:'Python Crash Course', author:'Eric Matthes', price:295, oldPrice:360, category:'programming', rating:4.8, reviews:320 },
  ];
  return books.slice(0, count);
}

/* ── Render book card ── */
function renderBookCard(book, delay = 0) {
  const stars = '★'.repeat(Math.round(book.rating || 4)) + '☆'.repeat(5 - Math.round(book.rating || 4));
  const oldPriceHtml = book.oldPrice
    ? `<span class="book-price-old">${formatPrice(book.oldPrice)}</span>`
    : '';
  const discountBadge = book.oldPrice
    ? `<span class="badge badge-danger book-card-badge">-${Math.round((1 - book.price/book.oldPrice)*100)}%</span>`
    : '';

  const catMap = { programming:'برمجة', productivity:'إدارة الوقت', selfdev:'تطوير الذات', design:'تصميم', business:'أعمال', data:'بيانات' };

  return `
    <div class="book-card" style="animation-delay:${delay}s" onclick="goToProduct('${book.id}')">
      <div class="book-card-img-placeholder">
        <i class="fa-solid fa-book-open"></i>
        ${book.title}
      </div>
      ${discountBadge}
      <button class="book-card-wishlist" onclick="event.stopPropagation();toggleWishlist('${book.id}',this)" title="أضف للمفضلة">
        <i class="fa-regular fa-heart"></i>
      </button>
      <div class="book-card-body">
        <div class="book-card-cat">${catMap[book.category] || book.category || 'عام'}</div>
        <div class="book-card-title">${book.title}</div>
        <div class="book-card-author">${book.author || ''}</div>
        <div class="book-card-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${book.reviews || 0})</span>
        </div>
        <div class="book-card-footer">
          <div>
            <div class="book-price">${formatPrice(book.price, 'EGP')}</div>
            ${oldPriceHtml}
          </div>
          <button class="book-add-btn" onclick="event.stopPropagation();addToCart('${book.id}',this)" title="أضف للعربة">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>`;
}

function renderFeatured(books) {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = books.map((b, i) => renderBookCard(b, i * 0.05)).join('');
}

function renderNew(books) {
  const grid = document.getElementById('newGrid');
  if (!grid) return;
  grid.innerHTML = books.map((b, i) => renderBookCard(b, i * 0.05)).join('');
}

/* ── Navigate to product ── */
function goToProduct(id) {
  window.location.href = `/pages/shop/product-detail.html?id=${id}`;
}

/* ── Add to cart ── */
async function addToCart(productId, btn) {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً لإضافة منتجات للعربة', 'info');
    setTimeout(() => window.location.href = '/pages/auth/login.html', 1200);
    return;
  }
  const icon = btn.querySelector('i');
  btn.classList.add('adding');
  icon.className = 'fa-solid fa-check';
  try {
    await cartAPI.add({ productId, quantity: 1 });
    // Update badge
    const count = parseInt(localStorage.getItem('thaqaf_cart_count') || '0') + 1;
    localStorage.setItem('thaqaf_cart_count', count);
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = count; badge.style.display = 'flex'; }
    showToast('تمت الإضافة للعربة ✓', 'success');
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error');
  }
  setTimeout(() => {
    btn.classList.remove('adding');
    icon.className = 'fa-solid fa-plus';
  }, 1500);
}

/* ── Wishlist toggle ── */
function toggleWishlist(productId, btn) {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً', 'info');
    return;
  }
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  icon.className = btn.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  showToast(btn.classList.contains('active') ? 'أُضيف للمفضلة' : 'حُذف من المفضلة', 'info');
}

/* ══════════════════════════════════════════════
   CATEGORIES FILTER
══════════════════════════════════════════════ */
document.getElementById('catStrip')?.addEventListener('click', (e) => {
  const chip = e.target.closest('.cat-chip');
  if (!chip) return;

  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');

  const cat = chip.dataset.cat;
  const filtered = cat === 'all'
    ? allProducts.slice(0, 8)
    : allProducts.filter(p => p.category === cat).slice(0, 8);

  renderFeatured(filtered.length ? filtered : getMockProducts(4));
});

/* ══════════════════════════════════════════════
   PROMO CODE COPY
══════════════════════════════════════════════ */
document.getElementById('promoCopyBtn')?.addEventListener('click', () => {
  navigator.clipboard?.writeText('THAQAF20').then(() => {
    const icon = document.getElementById('promoCopyIcon');
    icon.className = 'fa-solid fa-check';
    showToast('تم نسخ الكود! الصقه عند الدفع', 'success');
    setTimeout(() => { icon.className = 'fa-regular fa-copy'; }, 2000);
  });
});

/* ══════════════════════════════════════════════
   NAVBAR SEARCH
══════════════════════════════════════════════ */
const navSearchInput = document.getElementById('navSearchInput');
navSearchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && navSearchInput.value.trim()) {
    window.location.href = `/pages/shop/products.html?q=${encodeURIComponent(navSearchInput.value.trim())}`;
  }
});

/* ══════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════ */
document.getElementById('newsletterBtn')?.addEventListener('click', () => {
  const email = document.getElementById('newsletterEmail').value.trim();
  if (!email || !isValidEmail(email)) {
    showToast('أدخل بريد إلكتروني صحيح', 'error');
    return;
  }
  showToast('تم الاشتراك بنجاح! 🎉', 'success');
  document.getElementById('newsletterEmail').value = '';
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
loadProducts();
