/**
 * shop.js — Products page logic for ثقف
 */

initNavbar('shop');

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
const state = {
  all:        [],      // كل الـ products من الـ API
  filtered:   [],      // بعد تطبيق الفلاتر
  totalPages: 1,      
  page:       1,
  perPage:    12,
  view:       'grid',  // 'grid' | 'list'
  sort:       'default',
  search:     '',
  categories: [],
  minPrice:   0,
  maxPrice:   1000,
  minRating:  0,
  discountOnly: false,
  newOnly:    false,
};

/* ══════════════════════════════════════════════
   COVER COLORS (per category)
══════════════════════════════════════════════ */
const coverColors = {
  programming: ['linear-gradient(135deg,#1a1845,#312e7a)', 'linear-gradient(135deg,#0f2548,#1d4e89)', 'linear-gradient(135deg,#1a3a1a,#2d6a2d)'],
  productivity:['linear-gradient(135deg,#4a1c40,#8b3a7a)', 'linear-gradient(135deg,#1a3a4a,#2d6a8a)'],
  selfdev:     ['linear-gradient(135deg,#3a1a0a,#8a4a1a)', 'linear-gradient(135deg,#2a1a3a,#6a3a8a)'],
  design:      ['linear-gradient(135deg,#1a2a3a,#3a5a7a)', 'linear-gradient(135deg,#3a2a1a,#7a5a3a)'],
  business:    ['linear-gradient(135deg,#1a1a2a,#4a4a6a)', 'linear-gradient(135deg,#2a1a0a,#6a4a2a)'],
  data:        ['linear-gradient(135deg,#0a1a2a,#1a4a6a)', 'linear-gradient(135deg,#1a0a2a,#4a1a5a)'],
};
function getCoverColor(category, id = '') {
  const arr = coverColors[category] || ['linear-gradient(135deg,#1a1845,#4540a0)'];
  const safeId = String(id);
  const idx = (safeId.charCodeAt(safeId.length - 1) || 0) % arr.length;
  return arr[idx];
}

/* ══════════════════════════════════════════════
   MOCK DATA (fallback)
══════════════════════════════════════════════ */
function getMockProducts() {
  return [
    { _id:'1',  title:'Clean Code',                   author:'Robert C. Martin', price:280, oldPrice:350,  category:'programming', rating:4.8, reviews:124, isNew:false },
    { _id:'2',  title:'The Pragmatic Programmer',     author:'Hunt & Thomas',    price:320, oldPrice:null, category:'programming', rating:4.9, reviews:98,  isNew:true  },
    { _id:'3',  title:'Deep Work',                    author:'Cal Newport',      price:220, oldPrice:260,  category:'productivity',rating:4.7, reviews:203, isNew:false },
    { _id:'4',  title:'Atomic Habits',                author:'James Clear',      price:240, oldPrice:300,  category:'selfdev',     rating:4.9, reviews:512, isNew:false },
    { _id:'5',  title:'The Phoenix Project',          author:'Gene Kim',         price:265, oldPrice:null, category:'business',    rating:4.6, reviews:87,  isNew:false },
    { _id:'6',  title:'Design Patterns',              author:'Gang of Four',     price:340, oldPrice:420,  category:'programming', rating:4.5, reviews:64,  isNew:false },
    { _id:'7',  title:'Getting Things Done',          author:'David Allen',      price:190, oldPrice:null, category:'productivity',rating:4.4, reviews:156, isNew:false },
    { _id:'8',  title:'Python Crash Course',          author:'Eric Matthes',     price:295, oldPrice:360,  category:'programming', rating:4.8, reviews:320, isNew:true  },
    { _id:'9',  title:'Refactoring',                  author:'Martin Fowler',    price:310, oldPrice:null, category:'programming', rating:4.7, reviews:78,  isNew:false },
    { _id:'10', title:'The 4-Hour Work Week',         author:'Tim Ferriss',      price:200, oldPrice:240,  category:'productivity',rating:4.3, reviews:289, isNew:false },
    { _id:'11', title:'Zero to One',                  author:'Peter Thiel',      price:230, oldPrice:null, category:'business',    rating:4.5, reviews:341, isNew:false },
    { _id:'12', title:'Designing Data-Intensive Apps',author:'Martin Kleppmann', price:390, oldPrice:480,  category:'data',        rating:4.9, reviews:156, isNew:true  },
    { _id:'13', title:'The Psychology of Money',      author:'Morgan Housel',    price:210, oldPrice:250,  category:'selfdev',     rating:4.8, reviews:420, isNew:false },
    { _id:'14', title:'The Design of Everyday Things',author:'Don Norman',       price:255, oldPrice:null, category:'design',      rating:4.6, reviews:95,  isNew:false },
    { _id:'15', title:'Don\'t Make Me Think',         author:'Steve Krug',       price:245, oldPrice:290,  category:'design',      rating:4.7, reviews:113, isNew:false },
    { _id:'16', title:'Cracking the Coding Interview',author:'Gayle McDowell',   price:360, oldPrice:430,  category:'programming', rating:4.8, reviews:540, isNew:false },
  ];
}

/* ══════════════════════════════════════════════
   LOAD PRODUCTS
══════════════════════════════════════════════ */
async function loadProducts() {
  renderSkeletons();
  try {
    const data = await productsAPI.getAll(state.page, state.perPage);
    state.totalPages = data.totalPages || 1;
    state.all = data.data || data.products || data || [];
    console.log(data);
  } catch {
    state.all = getMockProducts();
  }
  applyFiltersAndRender();
}

/* ══════════════════════════════════════════════
   FILTER + SORT
══════════════════════════════════════════════ */
function applyFiltersAndRender() {
  let items = [...state.all];

  // Search
  if (state.search) {
    const q = state.search.toLowerCase();
    items = items.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q)
    );
  }

  // Categories
  if (state.categories.length) {
    items = items.filter(b => state.categories.includes(b.category));
  }

  // Price
  items = items.filter(b => b.price >= state.minPrice && b.price <= state.maxPrice);

  // Rating
  if (state.minRating > 0) {
    items = items.filter(b => (b.rating || 0) >= state.minRating);
  }

  // Discount only
  if (state.discountOnly) items = items.filter(b => b.oldPrice);

  // New only
  if (state.newOnly) items = items.filter(b => b.isNew);

  // Sort
  switch (state.sort) {
    case 'price-asc':  items.sort((a,b) => a.price - b.price); break;
    case 'price-desc': items.sort((a,b) => b.price - a.price); break;
    case 'rating':     items.sort((a,b) => (b.rating||0) - (a.rating||0)); break;
    case 'newest':     items.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
  }

  state.filtered = items;
  // state.page = 1;
  updateCount();
  updateActiveFilterTags();
  renderPage();
  renderPagination();
}

function updateCount() {
  const el = document.getElementById('countDisplay');
  if (el) el.textContent = state.filtered.length;
}

/* ══════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════ */
const catMap = { programming:'برمجة', productivity:'إدارة الوقت', selfdev:'تطوير الذات', design:'تصميم', business:'أعمال', data:'بيانات وذكاء اصطناعي' };

function renderPage() {
  const container = document.getElementById('productsContainer');
  const items = state.filtered;

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <i class="fa-solid fa-book-open-reader"></i>
        <h3>لا توجد كتب تطابق بحثك</h3>
        <p>جرّب تغيير الفلاتر أو ابحث بكلمة مختلفة</p>
      </div>`;
    return;
  }

  if (state.view === 'grid') {
    container.className = 'books-grid';
    container.innerHTML = items.map((b, i) => renderGridCard(b, i)).join('');
  } else {
    container.className = 'books-list';
    container.innerHTML = items.map((b, i) => renderListCard(b, i)).join('');
  }
}

function renderGridCard(b, i) {
  const stars    = '★'.repeat(Math.round(b.rating||4)) + '☆'.repeat(5-Math.round(b.rating||4));
  const discount = b.oldPrice ? Math.round((1 - b.price/b.oldPrice)*100) : 0;
  const badgeHtml = discount
    ? `<span class="book-discount-badge">-${discount}%</span>`
    : (b.isNew ? `<span class="book-new-badge">جديد</span>` : '');

  return `
  <div class="book-card" style="animation-delay:${i*0.04}s" onclick="goToDetail('${b.id}')">
    <div class="book-cover" style="background:${getCoverColor(b.category, b.id)}">
      <i class="fa-solid fa-book-open"></i>
      ${b.title}
      ${badgeHtml}
      <div class="book-cover-overlay">
        <button class="book-cover-action" onclick="event.stopPropagation();goToDetail('${b.id}')" title="عرض التفاصيل">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="book-cover-action" onclick="event.stopPropagation();addToCart('${b.id}',this)" title="أضف للعربة">
          <i class="fa-solid fa-bag-shopping"></i>
        </button>
      </div>
    </div>
    <div class="book-card-body">
      <div class="book-cat">${catMap[b.category]||b.category||'عام'}</div>
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author||''}</div>
      <div class="book-rating">
        <span class="stars">${stars}</span>
        <span class="rating-num">(${b.reviews||0})</span>
      </div>
      <div class="book-footer">
        <div class="book-price-wrap">
          <div class="book-price">${formatPrice(b.price,'EGP')}</div>
          ${b.oldPrice ? `<div class="book-price-old">${formatPrice(b.oldPrice,'EGP')}</div>` : ''}
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation();addToCart('${b.id}',this)" title="أضف للعربة">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  </div>`;
}

function renderListCard(b, i) {
  const stars    = '★'.repeat(Math.round(b.rating||4)) + '☆'.repeat(5-Math.round(b.rating||4));
  const discount = b.oldPrice ? Math.round((1 - b.price/b.oldPrice)*100) : 0;
  return `
  <div class="book-list-card" style="animation-delay:${i*0.04}s" onclick="goToDetail('${b.id}')">
    <div class="book-list-cover" style="background:${getCoverColor(b.category,b.id)}">
      <i class="fa-solid fa-book-open" style="font-size:1.3rem;opacity:.7;margin-bottom:4px;display:block"></i>
      ${b.title}
    </div>
    <div class="book-list-info">
      <div class="book-cat">${catMap[b.category]||b.category||'عام'}</div>
      <div class="book-list-title">${b.title}</div>
      <div class="book-list-author">${b.author||''}</div>
      <div class="book-list-meta">
        <span class="stars">${stars}</span>
        <span class="rating-num" style="font-size:.75rem;color:var(--text-hint)">(${b.reviews||0})</span>
        ${b.isNew ? `<span class="badge badge-success" style="font-size:.7rem">جديد</span>` : ''}
        ${discount ? `<span class="badge badge-danger" style="font-size:.7rem">-${discount}%</span>` : ''}
      </div>
    </div>
    <div class="book-list-actions">
      <div>
        <div class="list-price">${formatPrice(b.price,'EGP')}</div>
        ${b.oldPrice ? `<div class="list-price-old">${formatPrice(b.oldPrice,'EGP')}</div>` : ''}
      </div>
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addToCart('${b.id}',this)">
        <i class="fa-solid fa-plus"></i> أضف للعربة
      </button>
    </div>
  </div>`;
}

function renderSkeletons() {
  const container = document.getElementById('productsContainer');
  container.className = 'books-grid';
  container.innerHTML = Array(8).fill(0).map(() => `
    <div class="book-card">
      <div class="book-cover skel" style="aspect-ratio:3/4"></div>
      <div class="book-card-body">
        <div class="skel" style="height:10px;width:45%;margin-bottom:8px"></div>
        <div class="skel" style="height:14px;width:80%;margin-bottom:5px"></div>
        <div class="skel" style="height:10px;width:55%;margin-bottom:12px"></div>
        <div class="skel" style="height:12px;width:35%"></div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════ */
function renderPagination() {
  const total = state.totalPages;
  const el    = document.getElementById('pagination');
  if (!el || total <= 1) { el && (el.innerHTML = ''); return; }

  let html = `<button class="page-btn" onclick="goPage(${state.page-1})" ${state.page===1?'disabled':''}>
    <i class="fa-solid fa-chevron-right"></i></button>`;

  for (let p = 1; p <= total; p++) {
    if (total > 7 && p > 2 && p < total - 1 && Math.abs(p - state.page) > 1) {
      if (p === 3 || p === total - 2) html += `<span style="padding:0 4px;color:var(--text-hint)">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p===state.page?'active':''}" onclick="goPage(${p})">${p}</button>`;
  }

  html += `<button class="page-btn" onclick="goPage(${state.page+1})" ${state.page===total?'disabled':''}>
    <i class="fa-solid fa-chevron-left"></i></button>`;

  el.innerHTML = html;
}

function goPage(p) {
  const total = state.totalPages;
  if (p < 1 || p > total) return;
  state.page = p;
  loadProducts();
  window.scrollTo({ top: 200, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════
   ACTIVE FILTER TAGS
══════════════════════════════════════════════ */
function updateActiveFilterTags() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  const tags = [];

  state.categories.forEach(c => {
    tags.push(`<span class="filter-tag">${catMap[c]||c}
      <button onclick="removeCategory('${c}')"><i class="fa-solid fa-xmark"></i></button></span>`);
  });

  if (state.maxPrice < 1000) {
    tags.push(`<span class="filter-tag">حتى ${state.maxPrice} ج
      <button onclick="resetPrice()"><i class="fa-solid fa-xmark"></i></button></span>`);
  }
  if (state.minRating > 0) {
    tags.push(`<span class="filter-tag">${state.minRating}+ نجوم
      <button onclick="resetRating()"><i class="fa-solid fa-xmark"></i></button></span>`);
  }
  if (state.discountOnly) {
    tags.push(`<span class="filter-tag">عروض فقط
      <button onclick="resetDiscount()"><i class="fa-solid fa-xmark"></i></button></span>`);
  }

  el.innerHTML = tags.join('');
}

function removeCategory(cat) {
  state.categories = state.categories.filter(c => c !== cat);
  document.querySelector(`.cat-filter[value="${cat}"]`).checked = false;
  applyFiltersAndRender();
}
function resetPrice() {
  state.maxPrice = 1000;
  document.getElementById('priceMax').value = 1000;
  document.getElementById('priceSlider').value = 1000;
  applyFiltersAndRender();
}
function resetRating() {
  state.minRating = 0;
  document.querySelectorAll('.rating-option').forEach(o => o.classList.remove('active'));
  applyFiltersAndRender();
}
function resetDiscount() {
  state.discountOnly = false;
  document.getElementById('filterDiscount').checked = false;
  applyFiltersAndRender();
}

/* ══════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════ */

// Search
document.getElementById('searchInput')?.addEventListener('input', debounce(e => {
  state.search = e.target.value.trim();
  applyFiltersAndRender();
}, 350));

// Navbar search
document.getElementById('navSearchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    state.search = e.target.value.trim();
    document.getElementById('searchInput').value = state.search;
    applyFiltersAndRender();
  }
});

// Category checkboxes
document.querySelectorAll('.cat-filter').forEach(cb => {
  cb.addEventListener('change', () => {
    state.categories = [...document.querySelectorAll('.cat-filter:checked')].map(c => c.value);
    applyFiltersAndRender();
  });
});

// Price
document.getElementById('priceSlider')?.addEventListener('input', debounce(e => {
  state.maxPrice = +e.target.value;
  document.getElementById('priceMax').value = e.target.value;
  applyFiltersAndRender();
}, 300));

document.getElementById('priceMax')?.addEventListener('change', e => {
  state.maxPrice = +e.target.value || 1000;
  document.getElementById('priceSlider').value = state.maxPrice;
  applyFiltersAndRender();
});

document.getElementById('priceMin')?.addEventListener('change', e => {
  state.minPrice = +e.target.value || 0;
  applyFiltersAndRender();
});

// Rating
document.querySelectorAll('.rating-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.rating-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    state.minRating = +opt.dataset.rating;
    applyFiltersAndRender();
  });
});

// Discount / New
document.getElementById('filterDiscount')?.addEventListener('change', e => {
  state.discountOnly = e.target.checked;
  applyFiltersAndRender();
});
document.getElementById('filterNew')?.addEventListener('change', e => {
  state.newOnly = e.target.checked;
  applyFiltersAndRender();
});

// Sort
document.getElementById('sortSelect')?.addEventListener('change', e => {
  state.sort = e.target.value;
  applyFiltersAndRender();
});

// View toggle
document.getElementById('gridViewBtn')?.addEventListener('click', () => {
  state.view = 'grid';
  document.getElementById('gridViewBtn').classList.add('active');
  document.getElementById('listViewBtn').classList.remove('active');
  renderPage();
});
document.getElementById('listViewBtn')?.addEventListener('click', () => {
  state.view = 'list';
  document.getElementById('listViewBtn').classList.add('active');
  document.getElementById('gridViewBtn').classList.remove('active');
  renderPage();
});

// Clear all filters
document.getElementById('clearAllFilters')?.addEventListener('click', () => {
  state.search      = '';
  state.categories  = [];
  state.minPrice    = 0;
  state.maxPrice    = 1000;
  state.minRating   = 0;
  state.discountOnly= false;
  state.newOnly     = false;
  state.sort        = 'default';

  document.getElementById('searchInput').value  = '';
  document.getElementById('priceMin').value     = 0;
  document.getElementById('priceMax').value     = 1000;
  document.getElementById('priceSlider').value  = 1000;
  document.getElementById('sortSelect').value   = 'default';
  document.querySelectorAll('.cat-filter').forEach(c => c.checked = false);
  document.querySelectorAll('.rating-option').forEach(o => o.classList.remove('active'));
  document.getElementById('filterDiscount').checked = false;
  document.getElementById('filterNew').checked      = false;

  applyFiltersAndRender();
});

// Filter sections collapse
document.querySelectorAll('.filter-section-title[data-toggle]').forEach(title => {
  title.addEventListener('click', () => {
    const id   = title.dataset.toggle;
    const body = document.getElementById(`filter-${id}`);
    if (!body) return;
    const collapsed = body.classList.toggle('hidden');
    title.classList.toggle('collapsed', collapsed);
  });
});

// Mobile filter sidebar
document.getElementById('mobileFilterBtn')?.addEventListener('click', () => {
  document.getElementById('filtersSidebar').classList.add('mobile-open');
  document.getElementById('filterOverlay').classList.add('open');
});
document.getElementById('filterOverlay')?.addEventListener('click', () => {
  document.getElementById('filtersSidebar').classList.remove('mobile-open');
  document.getElementById('filterOverlay').classList.remove('open');
});

/* ══════════════════════════════════════════════
   ACTIONS
══════════════════════════════════════════════ */
function goToDetail(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

async function addToCart(productId, btn) {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً لإضافة منتجات للعربة', 'info');
    setTimeout(() => window.location.href = '/pages/auth/login.html', 1200);
    return;
  }

  const icon = btn.querySelector('i');
  const origClass = icon.className;
  btn.classList.add('added');
  icon.className = 'fa-solid fa-check';
  btn.disabled = true;

  try {
    await cartAPI.add({ productId, quantity: 1 });
    const count = parseInt(localStorage.getItem('thaqaf_cart_count') || '0') + 1;
    localStorage.setItem('thaqaf_cart_count', count);
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = count; badge.style.display = 'flex'; }
    showToast('تمت الإضافة للعربة ✓', 'success');
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error');
  }

  setTimeout(() => {
    btn.classList.remove('added');
    icon.className = origClass;
    btn.disabled = false;
  }, 1500);
}

/* ══════════════════════════════════════════════
   URL PARAMS (e.g. ?cat=programming&q=clean)
══════════════════════════════════════════════ */
function readURLParams() {
  const cat  = getParam('cat');
  const q    = getParam('q');
  const sort = getParam('sort');

  if (cat) {
    state.categories = [cat];
    const cb = document.querySelector(`.cat-filter[value="${cat}"]`);
    if (cb) cb.checked = true;
  }
  if (q) {
    state.search = q;
    document.getElementById('searchInput').value = q;
    document.getElementById('navSearchInput').value = q;
  }
  if (sort) {
    state.sort = sort;
    document.getElementById('sortSelect').value = sort;
  }
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
readURLParams();
loadProducts();
