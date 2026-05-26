/**
 * products-admin.js — Admin Products Management for ثقف
 */

requireAdmin();

/* ══════════════════════════════════════════════
   COVER PALETTES
══════════════════════════════════════════════ */
const coverPalettes = {
  programming: ['linear-gradient(145deg,#0f0e2a,#312e7a)', 'linear-gradient(145deg,#0a1e3a,#1d4e89)'],
  productivity:['linear-gradient(145deg,#2d0f28,#7a2a68)'],
  selfdev:     ['linear-gradient(145deg,#2a0f05,#7a3010)'],
  design:      ['linear-gradient(145deg,#0f1a2a,#2a4a6a)'],
  business:    ['linear-gradient(145deg,#0f0f1a,#3a3a5a)'],
  data:        ['linear-gradient(145deg,#050f1a,#0f3a5a)'],
};
function getCover(cat, id = '') {
  const arr = coverPalettes[cat] || coverPalettes.programming;
  const safeId = String(id || '');
  return arr[(safeId.charCodeAt(safeId.length - 1) || 0) % arr.length];
}

/* ══════════════════════════════════════════════
   CATEGORY MAP
══════════════════════════════════════════════ */
const CAT_MAP = {
  programming:'برمجة', productivity:'إدارة الوقت',
  selfdev:'تطوير الذات', design:'تصميم',
  business:'أعمال', data:'بيانات وذكاء اصطناعي',
};
const CAT_CLASS = {
  programming:'cat-programming', productivity:'cat-productivity',
  selfdev:'cat-selfdev', design:'cat-design',
  business:'cat-business', data:'cat-data',
};

/* ══════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════ */
let mockProducts = [
  { _id:'1',  title:'Clean Code',                    author:'Robert C. Martin', category:'programming', price:280, oldPrice:350,  stock:42, sold:298, available:true,  publisher:'Prentice Hall',     year:2008, pages:431, language:'إنجليزي', isbn:'978-0132350884', description:'مرجع أساسي لكل مطوّر.' },
  { _id:'2',  title:'The Pragmatic Programmer',       author:'Hunt & Thomas',    category:'programming', price:320, oldPrice:null, stock:28, sold:187, available:true,  publisher:'Addison-Wesley',    year:2019, pages:352, language:'إنجليزي', isbn:'978-0135957059', description:'مبادئ عملية للمبرمجين.' },
  { _id:'3',  title:'Deep Work',                      author:'Cal Newport',      category:'productivity',price:220, oldPrice:260,  stock:55, sold:241, available:true,  publisher:'Grand Central',     year:2016, pages:296, language:'إنجليزي', isbn:'978-1455586691', description:'قيمة التركيز العميق.' },
  { _id:'4',  title:'Atomic Habits',                  author:'James Clear',      category:'selfdev',     price:240, oldPrice:300,  stock:60, sold:542, available:true,  publisher:'Avery',             year:2018, pages:320, language:'إنجليزي', isbn:'978-0735211292', description:'نظام بناء العادات.' },
  { _id:'5',  title:'The Phoenix Project',            author:'Gene Kim',         category:'business',    price:265, oldPrice:null, stock:19, sold:98,  available:true,  publisher:'IT Revolution',     year:2018, pages:382, language:'إنجليزي', isbn:'978-1942788294', description:'رواية DevOps.' },
  { _id:'6',  title:'Design Patterns',                author:'Gang of Four',     category:'programming', price:340, oldPrice:420,  stock:4,  sold:64,  available:true,  publisher:'Addison-Wesley',    year:1994, pages:395, language:'إنجليزي', isbn:'978-0201633610', description:'أنماط تصميم البرمجيات.' },
  { _id:'7',  title:'Getting Things Done',            author:'David Allen',      category:'productivity',price:190, oldPrice:null, stock:0,  sold:156, available:false, publisher:'Penguin Books',     year:2015, pages:352, language:'إنجليزي', isbn:'978-0143126560', description:'منهج GTD للإنتاجية.' },
  { _id:'8',  title:'Python Crash Course',            author:'Eric Matthes',     category:'programming', price:295, oldPrice:360,  stock:25, sold:386, available:true,  publisher:'No Starch Press',   year:2023, pages:552, language:'إنجليزي', isbn:'978-1718502703', description:'تعلم Python بسرعة.' },
  { _id:'9',  title:'Refactoring',                    author:'Martin Fowler',    category:'programming', price:310, oldPrice:null, stock:3,  sold:78,  available:true,  publisher:'Addison-Wesley',    year:2018, pages:448, language:'إنجليزي', isbn:'978-0134757599', description:'تحسين الكود الموجود.' },
  { _id:'10', title:'The 4-Hour Work Week',           author:'Tim Ferriss',      category:'productivity',price:200, oldPrice:240,  stock:33, sold:289, available:true,  publisher:'Harmony Books',     year:2009, pages:418, language:'إنجليزي', isbn:'978-0307465351', description:'الحياة المثلى بعمل أقل.' },
  { _id:'11', title:'Zero to One',                    author:'Peter Thiel',      category:'business',    price:230, oldPrice:null, stock:47, sold:341, available:true,  publisher:'Crown Business',    year:2014, pages:224, language:'إنجليزي', isbn:'978-0804139021', description:'الابتكار والشركات الناشئة.' },
  { _id:'12', title:'Designing Data-Intensive Apps',  author:'Martin Kleppmann', category:'data',        price:390, oldPrice:480,  stock:18, sold:178, available:true,  publisher:"O'Reilly",          year:2017, pages:616, language:'إنجليزي', isbn:'978-1449373320', description:'أنظمة البيانات الحديثة.' },
  { _id:'13', title:'The Psychology of Money',        author:'Morgan Housel',    category:'selfdev',     price:210, oldPrice:250,  stock:52, sold:420, available:true,  publisher:'Harriman House',    year:2020, pages:256, language:'إنجليزي', isbn:'978-0857197689', description:'علم نفس المال والثروة.' },
  { _id:'14', title:'The Design of Everyday Things',  author:'Don Norman',       category:'design',      price:255, oldPrice:null, stock:22, sold:95,  available:true,  publisher:'Basic Books',       year:2013, pages:368, language:'إنجليزي', isbn:'978-0465050659', description:'مبادئ التصميم الجيد.' },
  { _id:'15', title:"Don't Make Me Think",            author:'Steve Krug',       category:'design',      price:245, oldPrice:290,  stock:2,  sold:113, available:true,  publisher:'New Riders',        year:2014, pages:216, language:'إنجليزي', isbn:'978-0321965516', description:'UX وسهولة الاستخدام.' },
  { _id:'16', title:'Cracking the Coding Interview',  author:'Gayle McDowell',   category:'programming', price:360, oldPrice:430,  stock:31, sold:540, available:true,  publisher:'CareerCup',         year:2015, pages:687, language:'إنجليزي', isbn:'978-0984782857', description:'التحضير لمقابلات البرمجة.' },
];

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let allProducts  = [...mockProducts];
let filtered     = [];
let currentPage  = 1;
let perPage      = 10;
let selectedIds  = new Set();
let deleteTargetId = null;
let sortField    = '';
let sortDir      = 'asc';

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
function init() {
  const user = authUser();
  if (user) {
    document.getElementById('sidebarName').textContent   = user.name || 'Admin';
    document.getElementById('sidebarAvatar').textContent = (user.name || 'A').charAt(0);
  }
  loadProducts();
}

async function loadProducts() {
  try {
    const data = await productsAPI.getAll();
    allProducts = data.data || [];
    if (!allProducts.length) allProducts = [...mockProducts];
  } catch {
    allProducts = [...mockProducts];
  }
  renderStats();
  applyFilters();
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function renderStats() {
  const total     = allProducts.length;
  const inStock   = allProducts.filter(p => p.stock > 5).length;
  const lowStock  = allProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outStock  = allProducts.filter(p => p.stock === 0).length;

  document.getElementById('totalProductsLabel').textContent = `(${total})`;

  document.getElementById('productStats').innerHTML = [
    { icon:'fa-book',       bg:'var(--brand-100)', color:'var(--brand-600)', num:total,    label:'إجمالي الكتب' },
    { icon:'fa-check',      bg:'#e6fffa',          color:'var(--success)',   num:inStock,  label:'متوفر في المخزون' },
    { icon:'fa-triangle-exclamation', bg:var_accent_light(), color:'var(--accent-dark)', num:lowStock, label:'مخزون منخفض' },
    { icon:'fa-xmark',      bg:'#fff5f5',          color:'var(--danger)',    num:outStock, label:'نفد من المخزون' },
  ].map((s, i) => `
    <div class="pstat-card" style="animation-delay:${i*.06}s">
      <div class="pstat-icon" style="background:${s.bg};color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
      <div>
        <div class="pstat-num" style="color:${s.color}">${s.num}</div>
        <div class="pstat-label">${s.label}</div>
      </div>
    </div>`).join('');
}
function var_accent_light() { return 'var(--accent-light)'; }

/* ══════════════════════════════════════════════
   FILTER + SORT
══════════════════════════════════════════════ */
function applyFilters() {
  const q     = document.getElementById('searchInput').value.trim().toLowerCase();
  const cat   = document.getElementById('catFilter').value;
  const stock = document.getElementById('stockFilter').value;
  const sort  = document.getElementById('sortSelect').value;

  filtered = allProducts.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    const matchC = cat === 'all' || p.category === cat;
    const matchS = stock === 'all'
      || (stock === 'ok'  && p.stock > 5)
      || (stock === 'low' && p.stock > 0 && p.stock <= 5)
      || (stock === 'out' && p.stock === 0);
    return matchQ && matchC && matchS;
  });

  // Sort
  if (sortField) {
    filtered.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  } else {
    switch (sort) {
      case 'price-asc':  filtered.sort((a,b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
      case 'stock-asc':  filtered.sort((a,b) => a.stock - b.stock); break;
      case 'name-asc':   filtered.sort((a,b) => a.title.localeCompare(b.title)); break;
    }
  }

  currentPage = 1;
  clearSelection();
  renderTable();
  renderPagination();
}

function sortBy(field) {
  if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortField = field; sortDir = 'asc'; }
  applyFilters();
}

/* ══════════════════════════════════════════════
   RENDER TABLE
══════════════════════════════════════════════ */
function renderTable() {
  const tbody = document.getElementById('productsTableBody');
  const start = (currentPage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  document.getElementById('showingFrom').textContent  = filtered.length ? start + 1 : 0;
  document.getElementById('showingTo').textContent    = Math.min(start + perPage, filtered.length);
  document.getElementById('showingTotal').textContent = filtered.length;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-table">
      <i class="fa-solid fa-book-open-reader"></i>
      <h3>لا توجد منتجات</h3>
      <p>جرّب تغيير الفلاتر أو أضف كتاباً جديداً</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((p, idx) => {
    const disc = p.oldPrice ? Math.round((1 - p.price/p.oldPrice)*100) : 0;
    const stockCls = p.stock === 0 ? 'stock-out' : p.stock <= 5 ? 'stock-low' : 'stock-ok';
    const stockTxt = p.stock === 0 ? 'نفد' : p.stock <= 5 ? `⚠ ${p.stock}` : p.stock;
    const isSelected = selectedIds.has(p.id);

    return `
    <tr class="${isSelected ? 'selected' : ''}" style="animation-delay:${idx*.03}s" id="row-${p.id}">
      <td class="col-check">
        <input type="checkbox" class="row-checkbox" data-id="${p.id}"
          ${isSelected ? 'checked' : ''} onchange="toggleRowSelect('${p.id}', this.checked)">
      </td>
      <td>
        <div class="book-cell">
          <div class="book-thumb" style="background:${getCover(p.category, p.id)}">
            <i class="fa-solid fa-book-open"></i>
            ${p.name}
          </div>
          <div>
            <div class="book-name">${p.name}</div>
            <div class="book-author">${p.author}</div>
            <div class="book-id">#${p.id}</div>
          </div>
        </div>
      </td>
      <td><span class="cat-badge ${CAT_CLASS[p.category] || ''}">${CAT_MAP[p.category] || p.category}</span></td>
      <td>
        <div class="price-main">${formatPrice(p.price, 'EGP')}</div>
        ${p.oldPrice ? `<div class="price-old">${formatPrice(p.oldPrice,'EGP')} <span class="discount-tag">-${disc}%</span></div>` : ''}
      </td>
      <td><span class="${stockCls}">${stockTxt}</span></td>
      <td style="color:var(--text-muted);font-size:.82rem">${(p.sold||0).toLocaleString('ar-EG')}</td>
      <td>
        <div class="avail-toggle" onclick="toggleAvail('${p.id}')">
          <div class="toggle-switch ${p.available ? 'on' : ''}" id="toggle-${p.id}">
            <div class="toggle-knob"></div>
          </div>
        </div>
      </td>
      <td>
        <div class="row-actions">
          <button class="row-action-btn" onclick="openEditModal('${p.id}')" title="تعديل">
            <i class="fa-solid fa-pen"></i>
          </button>
          <a href="/thaqaf/pages/shop/product-detail.html?id=${p.id}" target="_blank"
            class="row-action-btn" title="عرض في المتجر">
            <i class="fa-solid fa-eye"></i>
          </a>
          <button class="row-action-btn danger" onclick="openDeleteModal('${p.id}')" title="حذف">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Update header checkbox state
  const all = items.every(p => selectedIds.has(p.id));
  const some = items.some(p => selectedIds.has(p.id));
  const cb = document.getElementById('selectAllCb');
  cb.checked = all;
  cb.indeterminate = !all && some;
}

/* ══════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════ */
function renderPagination() {
  const total = Math.ceil(filtered.length / perPage);
  const el    = document.getElementById('pagination');
  if (total <= 1) { el.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}><i class="fa-solid fa-chevron-right"></i></button>`;
  for (let p = 1; p <= total; p++) {
    if (total > 7 && p > 2 && p < total-1 && Math.abs(p - currentPage) > 1) {
      if (p === 3 || p === total-2) html += `<span style="padding:0 2px;color:var(--text-hint)">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p===currentPage?'active':''}" onclick="goPage(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===total?'disabled':''}><i class="fa-solid fa-chevron-left"></i></button>`;
  el.innerHTML = html;
}

function goPage(p) {
  const total = Math.ceil(filtered.length / perPage);
  if (p < 1 || p > total) return;
  currentPage = p;
  renderTable();
  renderPagination();
}

function changePerPage(val) {
  perPage = +val;
  currentPage = 1;
  renderTable();
  renderPagination();
}

/* ══════════════════════════════════════════════
   SELECTION
══════════════════════════════════════════════ */
function toggleSelectAll(checked) {
  const start = (currentPage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  items.forEach(p => checked ? selectedIds.add(p.id) : selectedIds.delete(p.id));
  renderTable();
  updateBulkBar();
}

function toggleRowSelect(id, checked) {
  checked ? selectedIds.add(id) : selectedIds.delete(id);
  const row = document.getElementById(`row-${id}`);
  if (row) row.classList.toggle('selected', checked);
  updateBulkBar();
  const start = (currentPage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  const allSelected = items.every(p => selectedIds.has(p.id));
  const someSelected = items.some(p => selectedIds.has(p.id));
  const cb = document.getElementById('selectAllCb');
  cb.checked = allSelected;
  cb.indeterminate = !allSelected && someSelected;
}

function clearSelection() {
  selectedIds.clear();
  document.getElementById('selectAllCb').checked = false;
  document.getElementById('selectAllCb').indeterminate = false;
  updateBulkBar();
}

function updateBulkBar() {
  const bar = document.getElementById('bulkBar');
  bar.classList.toggle('open', selectedIds.size > 0);
  document.getElementById('bulkCount').textContent = `${selectedIds.size} محدد`;
}

/* ══════════════════════════════════════════════
   AVAILABILITY TOGGLE
══════════════════════════════════════════════ */
function toggleAvail(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  p.available = !p.available;
  const el = document.getElementById(`toggle-${id}`);
  if (el) el.classList.toggle('on', p.available);
  showToast(p.available ? `"${p.name}" أصبح متاحاً` : `"${p.name}" أصبح مخفياً`, 'info');
}

function bulkToggleAvail(state) {
  selectedIds.forEach(id => {
    const p = allProducts.find(p => p.id === id);
    if (p) p.available = state;
  });
  renderTable();
  showToast(`تم ${state ? 'تفعيل' : 'إخفاء'} ${selectedIds.size} منتجات`, 'success');
  clearSelection();
}

/* ══════════════════════════════════════════════
   ADD / EDIT MODAL
══════════════════════════════════════════════ */
function openAddModal() {
  document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-plus" style="color:var(--brand-400);margin-left:8px"></i> إضافة كتاب جديد';
  document.getElementById('editProductId').value = '';
  clearModalForm();
  openModal();
}

function openEditModal(id) {
  const p = allProducts.find(p => p.id === id);
  if (!p) return;
  document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-pen" style="color:var(--brand-400);margin-left:8px"></i> تعديل الكتاب';
  document.getElementById('editProductId').value = id;
  document.getElementById('mTitle').value     = p.name      || '';
  document.getElementById('mAuthor').value    = p.author     || '';
  document.getElementById('mCategory').value  = p.category   || '';
  document.getElementById('mPublisher').value = p.publisher  || '';
  document.getElementById('mYear').value      = p.year       || '';
  document.getElementById('mPrice').value     = p.price      || '';
  document.getElementById('mOldPrice').value  = p.oldPrice   || '';
  document.getElementById('mStock').value     = p.stock      || '';
  document.getElementById('mPages').value     = p.pages      || '';
  document.getElementById('mLanguage').value  = p.language   || 'إنجليزي';
  document.getElementById('mISBN').value      = p.isbn       || '';
  document.getElementById('mAvailable').value = String(p.available !== false);
  document.getElementById('mDesc').value      = p.description|| '';
  updateDiscount();
  openModal();
}

function clearModalForm() {
  ['mTitle','mAuthor','mPublisher','mYear','mPrice','mOldPrice','mStock','mPages','mISBN','mDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('mCategory').value  = '';
  document.getElementById('mLanguage').value  = 'إنجليزي';
  document.getElementById('mAvailable').value = 'true';
  document.getElementById('discountPreview').textContent = '—';
  document.getElementById('imagePreview').classList.remove('show');
  document.getElementById('uploadPlaceholder').style.display = '';
}

function openModal()  { document.getElementById('productModal').classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeModal() { document.getElementById('productModal').classList.remove('open'); document.body.style.overflow = ''; }

/* ══════════════════════════════════════════════
   DISCOUNT PREVIEW
══════════════════════════════════════════════ */
function updateDiscount() {
  const price    = parseFloat(document.getElementById('mPrice').value)    || 0;
  const oldPrice = parseFloat(document.getElementById('mOldPrice').value) || 0;
  const el       = document.getElementById('discountPreview');
  if (price > 0 && oldPrice > price) {
    const disc = Math.round((1 - price/oldPrice)*100);
    el.innerHTML = `<span style="background:var(--danger);color:#fff;padding:2px 8px;border-radius:4px;font-size:.8rem;font-weight:700">-${disc}%</span>`;
  } else {
    el.innerHTML = '<span style="color:var(--text-hint)">—</span>';
  }
}

/* ══════════════════════════════════════════════
   SAVE PRODUCT
══════════════════════════════════════════════ */
async function saveProduct() {
  const title    = document.getElementById('mTitle').value.trim();
  const author   = document.getElementById('mAuthor').value.trim();
  const category = document.getElementById('mCategory').value;
  const price    = parseFloat(document.getElementById('mPrice').value);
  const stock    = parseInt(document.getElementById('mStock').value);

  if (!title)    { showToast('أدخل اسم الكتاب', 'error');  return; }
  if (!author)   { showToast('أدخل اسم الكاتب', 'error');  return; }
  if (!category) { showToast('اختر فئة الكتاب', 'error');  return; }
  if (!price || price <= 0) { showToast('أدخل سعراً صحيحاً', 'error'); return; }
  if (isNaN(stock) || stock < 0) { showToast('أدخل كمية مخزون صحيحة', 'error'); return; }

const payload = new FormData();

payload.append('name', title);
payload.append('author', author);
payload.append('category', category);
payload.append('price', price);
payload.append('stock', stock);

payload.append(
  'available',
  document.getElementById('mAvailable').value === 'true'
);

payload.append(
  'oldPrice',
  parseFloat(document.getElementById('mOldPrice').value) || ''
);

payload.append(
  'publisher',
  document.getElementById('mPublisher').value.trim()
);

payload.append(
  'year',
  parseInt(document.getElementById('mYear').value) || ''
);

payload.append(
  'pages',
  parseInt(document.getElementById('mPages').value) || ''
);

payload.append(
  'language',
  document.getElementById('mLanguage').value
);

payload.append(
  'isbn',
  document.getElementById('mISBN').value.trim()
);

payload.append(
  'description',
  document.getElementById('mDesc').value.trim()
);

// الصورة
const imageFile =
  document.getElementById('imageInput').files[0];

if (imageFile) {
  payload.append('image', imageFile);
}
//=============================================================================//

  const btn      = document.getElementById('saveBtn');
  const editId   = document.getElementById('editProductId').value;
  setButtonLoading(btn, true);

  try {
    if (editId) {
      await productsAPI.update(editId, payload);
      const idx = allProducts.findIndex(p => p.id === editId);
      if (idx !== -1) allProducts[idx] = { ...allProducts[idx], ...payload };
      showToast('تم تعديل الكتاب بنجاح ✓', 'success');
    } else {
      const res = await productsAPI.add(payload);
      const newId = res?.product?.id || res?.id || String(Date.now());
      allProducts.unshift({ _id: newId, ...payload, sold: 0 });
      showToast('تم إضافة الكتاب بنجاح ✓', 'success');
    }
    closeModal();
    renderStats();
    applyFilters();
  } catch (err) {
    // Demo mode: apply locally even if API fails
    if (editId) {
      const idx = allProducts.findIndex(p => p.id === editId);
      if (idx !== -1) allProducts[idx] = { ...allProducts[idx], ...payload };
      showToast('تم التعديل (وضع تجريبي) ✓', 'success');
    } else {
      allProducts.unshift({ _id: 'demo-' + Date.now(), ...payload, sold: 0 });
      showToast('تمت الإضافة (وضع تجريبي) ✓', 'success');
    }
    closeModal();
    renderStats();
    applyFilters();
  }
  setButtonLoading(btn, false);
}

/* ══════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════ */
function openDeleteModal(id) {
  const p = allProducts.find(p => p.id === id);
  deleteTargetId = id;
  document.getElementById('deleteMsg').textContent =
    `هل تريد حذف كتاب "${p?.title || ''}"؟ لا يمكن التراجع.`;
  document.getElementById('deleteModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  document.body.style.overflow = '';
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('confirmDeleteBtn');
  setButtonLoading(btn, true);
  try {
    await productsAPI.delete(deleteTargetId);
  } catch { /* local delete anyway */ }
  allProducts = allProducts.filter(p => p.id !== deleteTargetId);
  closeDeleteModal();
  renderStats();
  applyFilters();
  showToast('تم حذف الكتاب', 'info');
}

function bulkDelete() {
  if (!selectedIds.size) return;
  if (!confirm(`هل تريد حذف ${selectedIds.size} منتجات؟ لا يمكن التراجع.`)) return;
  allProducts = allProducts.filter(p => !selectedIds.has(p.id));
  clearSelection();
  renderStats();
  applyFilters();
  showToast(`تم حذف ${selectedIds.size} منتجات`, 'info');
}

/* ══════════════════════════════════════════════
   IMAGE UPLOAD
══════════════════════════════════════════════ */
function handleImageSelect(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('imagePreview');
    img.src = e.target.result;
    img.classList.add('show');
    document.getElementById('uploadPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}
function handleDragOver(e)  { e.preventDefault(); document.getElementById('uploadZone').classList.add('drag-over'); }
function handleDragLeave()  { document.getElementById('uploadZone').classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dt = new DataTransfer(); dt.items.add(file);
    document.getElementById('imageInput').files = dt.files;
    handleImageSelect(document.getElementById('imageInput'));
  }
}

/* ══════════════════════════════════════════════
   EXPORT CSV
══════════════════════════════════════════════ */
function exportCSV() {
  const headers = ['ID','العنوان','الكاتب','الفئة','السعر','المخزون','المبيعات','متاح'];
  const rows    = filtered.map(p => [
    p.id, `"${p.name}"`, `"${p.author}"`,
    CAT_MAP[p.category]||p.category,
    p.price, p.stock, p.sold||0, p.available?'نعم':'لا',
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'thaqaf-products.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('تم تصدير المنتجات بنجاح', 'success');
}

/* ══════════════════════════════════════════════
   SIDEBAR (MOBILE)
══════════════════════════════════════════════ */
function openSidebar()  { document.getElementById('adminSidebar').classList.add('open');    document.getElementById('sidebarOverlay').classList.add('open'); }
function closeSidebar() { document.getElementById('adminSidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); }

function logoutAdmin() { authLogout(); window.location.href = '/pages/auth/login.html'; }

/* ══════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════ */
document.getElementById('searchInput')?.addEventListener('input', debounce(applyFilters, 300));
document.getElementById('catFilter')?.addEventListener('change',   applyFilters);
document.getElementById('stockFilter')?.addEventListener('change', applyFilters);
document.getElementById('sortSelect')?.addEventListener('change',  applyFilters);

// Close modal on backdrop click
document.getElementById('productModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('productModal')) closeModal();
});
document.getElementById('deleteModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
init();
