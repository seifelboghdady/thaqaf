/**
 * orders-admin.js — Admin Orders Management for ثقف
 */

requireAdmin();

/* ══════════════════════════════════════════════
   COVER COLORS
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
   STATUS CONFIG
══════════════════════════════════════════════ */
const ST = {
  pending:   { label:'قيد الانتظار',  cls:'st-pending',   icon:'fa-clock',         color:'#b7791f' },
  confirmed: { label:'مؤكد',          cls:'st-confirmed',  icon:'fa-circle-check',  color:'#2b6cb0' },
  preparing: { label:'جارٍ التجهيز',  cls:'st-preparing',  icon:'fa-box',           color:'#c05621' },
  shipped:   { label:'في الشحن',      cls:'st-shipped',    icon:'fa-truck',         color:'#1a6bb5' },
  delivered: { label:'تم التسليم',    cls:'st-delivered',  icon:'fa-circle-check',  color:'#276749' },
  cancelled: { label:'ملغى',          cls:'st-cancelled',  icon:'fa-xmark',         color:'#9b2c2c' },
};
const PAY = {
  cod:    { label:'كاش عند الاستلام', cls:'pay-cod',    icon:'fa-money-bill-wave' },
  card:   { label:'بطاقة بنكية',      cls:'pay-card',   icon:'fa-credit-card' },
  wallet: { label:'محفظة إلكترونية', cls:'pay-wallet', icon:'fa-wallet' },
};
const STAT_COLORS = {
  all:'var(--brand-500)', pending:'#d69e2e', confirmed:'#3182ce',
  preparing:'#ed8936', shipped:'#0bc5ea', delivered:'var(--success)', cancelled:'var(--danger)',
};

/* ══════════════════════════════════════════════
   MOCK DATA — 20 طلب
══════════════════════════════════════════════ */
let allOrders = [
  { _id:'ORD-2025-00186', customer:{name:'أحمد محمد',   email:'ahmed@example.com',  phone:'0100000001'}, status:'delivered', payment:'card',   total:740,  createdAt:'2025-04-10T10:30:00Z', address:'المهندسين، الجيزة', notes:'', items:[{product:{_id:'1', title:'Clean Code',      author:'Robert C. Martin', price:280, category:'programming'}, quantity:1},{product:{_id:'3', title:'Deep Work',         author:'Cal Newport',      price:220, category:'productivity'}, quantity:2}] },
  { _id:'ORD-2025-00185', customer:{name:'سارة علي',    email:'sara@example.com',   phone:'0100000002'}, status:'shipped',   payment:'cod',    total:320,  createdAt:'2025-04-28T14:15:00Z', address:'المعادي، القاهرة',  notes:'', items:[{product:{_id:'2', title:'The Pragmatic Programmer', author:'Hunt & Thomas',    price:320, category:'programming'}, quantity:1}] },
  { _id:'ORD-2025-00184', customer:{name:'محمد خالد',   email:'mkhaled@example.com',phone:'0100000003'}, status:'preparing', payment:'wallet', total:685,  createdAt:'2025-05-01T09:00:00Z', address:'مدينة نصر، القاهرة',notes:'اتصل قبل التوصيل', items:[{product:{_id:'8', title:'Python Crash Course', author:'Eric Matthes',     price:295, category:'programming'}, quantity:1},{product:{_id:'12',title:'Designing Data-Intensive', author:'M. Kleppmann',    price:390, category:'data'},        quantity:1}] },
  { _id:'ORD-2025-00183', customer:{name:'نور حسن',     email:'nour@example.com',   phone:'0100000004'}, status:'confirmed', payment:'card',   total:240,  createdAt:'2025-05-10T16:45:00Z', address:'الزمالك، القاهرة', notes:'', items:[{product:{_id:'4', title:'Atomic Habits',    author:'James Clear',      price:240, category:'selfdev'},      quantity:1}] },
  { _id:'ORD-2025-00182', customer:{name:'كريم عبدالله',email:'kareem@example.com', phone:'0100000005'}, status:'pending',   payment:'cod',    total:430,  createdAt:'2025-05-16T08:20:00Z', address:'الإسكندرية',       notes:'شقة تانية يمين', items:[{product:{_id:'11',title:'Zero to One',      author:'Peter Thiel',      price:230, category:'business'},      quantity:1},{product:{_id:'7', title:'Getting Things Done', author:'David Allen',      price:190, category:'productivity'}, quantity:1}] },
  { _id:'ORD-2025-00181', customer:{name:'ريم صالح',    email:'reem@example.com',   phone:'0100000006'}, status:'delivered', payment:'card',   total:280,  createdAt:'2025-03-15T12:00:00Z', address:'الدقي، الجيزة',    notes:'', items:[{product:{_id:'1', title:'Clean Code',      author:'Robert C. Martin', price:280, category:'programming'}, quantity:1}] },
  { _id:'ORD-2025-00180', customer:{name:'عمر يوسف',    email:'omar@example.com',   phone:'0100000007'}, status:'cancelled', payment:'card',   total:255,  createdAt:'2025-03-20T11:00:00Z', address:'المنصورة',         notes:'', items:[{product:{_id:'14',title:'Design of Everyday Things', author:'Don Norman',   price:255, category:'design'},        quantity:1}] },
  { _id:'ORD-2025-00179', customer:{name:'منى إبراهيم', email:'mona@example.com',   phone:'0100000008'}, status:'delivered', payment:'wallet', total:550,  createdAt:'2025-02-28T09:30:00Z', address:'شبرا، القاهرة',    notes:'', items:[{product:{_id:'13',title:'Psychology of Money',author:'Morgan Housel',    price:210, category:'selfdev'},      quantity:1},{product:{_id:'10',title:'4-Hour Work Week',   author:'Tim Ferriss',      price:200, category:'productivity'}, quantity:1}] },
  { _id:'ORD-2025-00178', customer:{name:'يوسف فاروق',  email:'yousef@example.com', phone:'0100000009'}, status:'delivered', payment:'cod',    total:360,  createdAt:'2025-02-14T14:00:00Z', address:'الجيزة',           notes:'', items:[{product:{_id:'16',title:'Cracking the Coding', author:'Gayle McDowell',   price:360, category:'programming'}, quantity:1}] },
  { _id:'ORD-2025-00177', customer:{name:'هبة محمود',   email:'heba@example.com',   phone:'0100000010'}, status:'shipped',   payment:'card',   total:465,  createdAt:'2025-05-18T10:00:00Z', address:'العبور، القاهرة', notes:'', items:[{product:{_id:'6', title:'Design Patterns',   author:'Gang of Four',     price:340, category:'programming'}, quantity:1},{product:{_id:'15',title:"Don't Make Me Think", author:'Steve Krug',       price:245, category:'design'},        quantity:1}] },
  { _id:'ORD-2025-00176', customer:{name:'خالد عمر',    email:'khaled@example.com', phone:'0100000011'}, status:'pending',   payment:'cod',    total:190,  createdAt:'2025-05-20T07:45:00Z', address:'طنطا',             notes:'', items:[{product:{_id:'7', title:'Getting Things Done', author:'David Allen',      price:190, category:'productivity'}, quantity:1}] },
  { _id:'ORD-2025-00175', customer:{name:'دينا حسين',   email:'dina@example.com',   phone:'0100000012'}, status:'confirmed', payment:'wallet', total:500,  createdAt:'2025-05-12T15:20:00Z', address:'المقطم، القاهرة', notes:'اتصل قبل ساعة', items:[{product:{_id:'4', title:'Atomic Habits',    author:'James Clear',      price:240, category:'selfdev'},      quantity:1},{product:{_id:'3', title:'Deep Work',         author:'Cal Newport',      price:220, category:'productivity'}, quantity:1}] },
];

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let filtered      = [];
let currentPage   = 1;
let perPage       = 10;
let selectedIds   = new Set();
let activeDrawer  = null;
let sortField     = 'date';
let sortDir       = 'desc';

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
function init() {
  const user = authUser();
  if (user) {
    document.getElementById('sidebarName').textContent   = user.name || 'Admin';
    document.getElementById('sidebarAvatar').textContent = (user.name || 'A').charAt(0);
  }
  // Read URL status param
  const urlStatus = getParam('status');
  if (urlStatus && urlStatus !== 'all') {
    document.getElementById('statusFilter').value = urlStatus;
  }
  loadOrders();
}

async function loadOrders() {
  try {
    const data = await ordersAPI.getUserOrders();
    allOrders = data.orders || data || [];
    if (!allOrders.length) throw new Error('empty');
  } catch {
    /* use mock */
  }
  renderStats();
  applyFilters();
}

/* ══════════════════════════════════════════════
   STATS CARDS
══════════════════════════════════════════════ */
function renderStats() {
  const counts = { all: allOrders.length };
  Object.keys(ST).forEach(s => counts[s] = allOrders.filter(o => o.status === s).length);
  const revenue = allOrders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + o.total, 0);

  // Update sidebar pending badge
  document.getElementById('pendingBadge').textContent = counts.pending || 0;
  document.getElementById('totalLabel').textContent   = `(${counts.all})`;

  const defs = [
    { key:'all',       label:'كل الطلبات',     num:counts.all,       color:'var(--brand-500)',  icon:'fa-inbox' },
    { key:'pending',   label:'قيد الانتظار',   num:counts.pending,   color:'#d69e2e',           icon:'fa-clock' },
    { key:'confirmed', label:'مؤكد',           num:counts.confirmed, color:'#3182ce',           icon:'fa-circle-check' },
    { key:'preparing', label:'جارٍ التجهيز',   num:counts.preparing, color:'#ed8936',           icon:'fa-box' },
    { key:'shipped',   label:'في الشحن',       num:counts.shipped,   color:'#0bc5ea',           icon:'fa-truck' },
    { key:'delivered', label:'تم التسليم',     num:counts.delivered, color:'var(--success)',    icon:'fa-circle-check' },
  ];

  const activeSt = document.getElementById('statusFilter').value;
  document.getElementById('ordersStats').innerHTML = defs.map((d, i) => `
    <div class="ostat-card ${d.key === activeSt ? 'active' : ''}"
      style="--clr:${d.color};animation-delay:${i*.06}s"
      onclick="quickFilter('${d.key}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="width:30px;height:30px;border-radius:8px;background:${d.color}18;display:flex;align-items:center;justify-content:center;color:${d.color};font-size:.82rem">
          <i class="fa-solid ${d.icon}"></i>
        </div>
      </div>
      <div class="ostat-num" style="color:${d.color}">${d.num}</div>
      <div class="ostat-label">${d.label}</div>
    </div>`).join('');
}

function quickFilter(status) {
  document.getElementById('statusFilter').value = status;
  applyFilters();
  renderStats();
}

/* ══════════════════════════════════════════════
   FILTER + SORT
══════════════════════════════════════════════ */
function applyFilters() {
  const q      = document.getElementById('searchInput').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const pay    = document.getElementById('payFilter').value;
  const from   = document.getElementById('dateFrom').value;
  const to     = document.getElementById('dateTo').value;
  const sort   = document.getElementById('sortSelect').value;

  filtered = allOrders.filter(o => {
    const matchQ = !q ||
      o._id.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q) ||
      o.items?.some(i => i.product?.title?.toLowerCase().includes(q));
    const matchS = status === 'all' || o.status === status;
    const matchP = pay === 'all' || o.payment === pay;
    const oDate  = new Date(o.createdAt);
    const matchD = (!from || oDate >= new Date(from)) && (!to || oDate <= new Date(to + 'T23:59:59'));
    return matchQ && matchS && matchP && matchD;
  });

  // Sort
  const sortMap = {
    newest:      (a,b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest:      (a,b) => new Date(a.createdAt) - new Date(b.createdAt),
    'amount-desc':(a,b) => b.total - a.total,
    'amount-asc': (a,b) => a.total - b.total,
  };
  if (sortField) {
    filtered.sort((a,b) => {
      let av = a[sortField === 'customer' ? 'customer' : sortField];
      let bv = b[sortField === 'customer' ? 'customer' : sortField];
      if (sortField === 'customer') { av = a.customer?.name || ''; bv = b.customer?.name || ''; }
      if (sortField === 'date')     { av = new Date(a.createdAt); bv = new Date(b.createdAt); }
      if (sortField === 'id')       { av = a._id; bv = b._id; }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  } else {
    filtered.sort(sortMap[sort] || sortMap.newest);
  }

  currentPage = 1;
  clearSelection();
  renderTable();
  renderPagination();
}

function sortCol(field) {
  if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortField = field; sortDir = 'desc'; }
  applyFilters();
}

function clearFilters() {
  document.getElementById('searchInput').value   = '';
  document.getElementById('statusFilter').value  = 'all';
  document.getElementById('payFilter').value     = 'all';
  document.getElementById('dateFrom').value      = '';
  document.getElementById('dateTo').value        = '';
  document.getElementById('sortSelect').value    = 'newest';
  sortField = 'date'; sortDir = 'desc';
  applyFilters();
  renderStats();
}

/* ══════════════════════════════════════════════
   RENDER TABLE
══════════════════════════════════════════════ */
function renderTable() {
  const start = (currentPage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  const tbody = document.getElementById('ordersBody');

  document.getElementById('showFrom').textContent  = filtered.length ? start + 1 : 0;
  document.getElementById('showTo').textContent    = Math.min(start + perPage, filtered.length);
  document.getElementById('showTotal').textContent = filtered.length;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-table">
      <i class="fa-solid fa-box-open"></i>
      <h3>لا توجد طلبات</h3>
      <p>جرّب تغيير الفلاتر أو خيار البحث</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((o, idx) => {
    const st      = ST[o.status] || ST.pending;
    const pay     = PAY[o.payment] || { label:o.payment, cls:'pay-cod', icon:'fa-money-bill-wave' };
    const isSelec = selectedIds.has(o._id);
    const preview = o.items?.slice(0,3) || [];
    const extra   = (o.items?.length || 0) - preview.length;

    const thumbs = preview.map(item => `
      <div class="book-mini-thumb" style="background:${getCover(item.product?.category, item.product?._id)}" title="${item.product?.title}">
        <i class="fa-solid fa-book-open"></i>
        ${item.product?.title || ''}
      </div>`).join('') + (extra > 0 ? `<span class="books-count">+${extra}</span>` : '');

    return `
    <tr class="${isSelec ? 'selected' : ''}" id="row-${o._id}" style="animation-delay:${idx*.03}s">
      <td><input type="checkbox" class="row-checkbox" data-id="${o._id}" ${isSelec ? 'checked' : ''}
        onchange="toggleRowSel('${o._id}', this.checked)"></td>
      <td>
        <div class="order-id-cell" onclick="openDrawer('${o._id}')">#${o._id.slice(-6)}</div>
        <div style="font-size:.68rem;color:var(--text-hint);margin-top:1px">${formatDate(o.createdAt)}</div>
      </td>
      <td>
        <div class="customer-cell">
          <div class="cust-avatar">${o.customer?.name?.charAt(0) || '?'}</div>
          <div>
            <div class="cust-name">${o.customer?.name || '—'}</div>
            <div class="cust-email">${o.customer?.email || ''}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="books-preview">${thumbs}</div>
        <div style="font-size:.68rem;color:var(--text-hint);margin-top:3px">${o.items?.length || 0} كتاب</div>
      </td>
      <td><span class="amount-cell">${formatPrice(o.total,'EGP')}</span></td>
      <td><span class="pay-badge ${pay.cls}"><i class="fa-solid ${pay.icon}"></i> ${pay.label}</span></td>
      <td style="font-size:.78rem;color:var(--text-muted);white-space:nowrap">${formatDate(o.createdAt)}</td>
      <td>
        <select class="status-select-inline" data-id="${o._id}" onchange="quickStatusChange('${o._id}', this.value)">
          ${Object.entries(ST).map(([k,v]) => `<option value="${k}" ${o.status===k?'selected':''}>${v.label}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="row-acts">
          <button class="act-btn" onclick="openDrawer('${o._id}')" title="تفاصيل"><i class="fa-solid fa-eye"></i></button>
          <button class="act-btn" onclick="printOrder('${o._id}')" title="طباعة"><i class="fa-solid fa-print"></i></button>
          <button class="act-btn danger" onclick="cancelOrder('${o._id}')" title="إلغاء"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  const cb = document.getElementById('selectAllCb');
  const allSel  = items.every(o => selectedIds.has(o._id));
  const someSel = items.some(o => selectedIds.has(o._id));
  cb.checked       = allSel;
  cb.indeterminate = !allSel && someSel;
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
    if (total > 7 && p > 2 && p < total-1 && Math.abs(p-currentPage) > 1) {
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
  currentPage = p; renderTable(); renderPagination();
}
function setPerPage(v) { perPage = +v; currentPage = 1; renderTable(); renderPagination(); }

/* ══════════════════════════════════════════════
   SELECTION
══════════════════════════════════════════════ */
function toggleSelectAll(checked) {
  const start = (currentPage-1)*perPage;
  filtered.slice(start, start+perPage).forEach(o => checked ? selectedIds.add(o._id) : selectedIds.delete(o._id));
  renderTable(); updateBulkBar();
}
function toggleRowSel(id, checked) {
  checked ? selectedIds.add(id) : selectedIds.delete(id);
  document.getElementById(`row-${id}`)?.classList.toggle('selected', checked);
  updateBulkBar();
  const start = (currentPage-1)*perPage;
  const items = filtered.slice(start, start+perPage);
  const cb = document.getElementById('selectAllCb');
  cb.checked = items.every(o => selectedIds.has(o._id));
  cb.indeterminate = !cb.checked && items.some(o => selectedIds.has(o._id));
}
function clearSelection() { selectedIds.clear(); updateBulkBar(); }
function updateBulkBar() {
  document.getElementById('bulkBar').classList.toggle('open', selectedIds.size > 0);
  document.getElementById('bulkCount').textContent = `${selectedIds.size} محدد`;
}

/* ══════════════════════════════════════════════
   STATUS UPDATES
══════════════════════════════════════════════ */
function quickStatusChange(id, newStatus) {
  const order = allOrders.find(o => o._id === id);
  if (!order) return;
  const oldStatus = order.status;
  order.status = newStatus;
  renderStats();
  showToast(`تم تغيير حالة الطلب #${id.slice(-6)} إلى "${ST[newStatus]?.label}"`, 'success');
}

function bulkStatus(newStatus) {
  if (!selectedIds.size) return;
  selectedIds.forEach(id => {
    const o = allOrders.find(o => o._id === id);
    if (o) o.status = newStatus;
  });
  renderStats();
  renderTable();
  showToast(`تم تحديث ${selectedIds.size} طلبات إلى "${ST[newStatus]?.label}"`, 'success');
  clearSelection();
}

function cancelOrder(id) {
  const o = allOrders.find(o => o._id === id);
  if (!o || !confirm(`هل تريد إلغاء الطلب #${id.slice(-6)}؟`)) return;
  o.status = 'cancelled';
  renderStats();
  renderTable();
  showToast(`تم إلغاء الطلب #${id.slice(-6)}`, 'info');
}

/* ══════════════════════════════════════════════
   ORDER DETAIL DRAWER
══════════════════════════════════════════════ */
let drawerOrderId = null;
let drawerNewStatus = null;

function openDrawer(id) {
  const o = allOrders.find(o => o._id === id);
  if (!o) return;
  drawerOrderId  = id;
  drawerNewStatus = o.status;

  document.getElementById('drawerOrderId').textContent = `#${o._id.slice(-6)}`;
  const st = ST[o.status] || ST.pending;
  document.getElementById('drawerStatusBadge').innerHTML =
    `<span class="status-badge ${st.cls}"><span class="status-dot"></span>${st.label}</span>`;

  const pay = PAY[o.payment] || { label:o.payment, cls:'pay-cod', icon:'fa-money-bill-wave' };
  const subtotal  = o.items?.reduce((s,i) => s + i.product.price * i.quantity, 0) || o.total;
  const shipping  = o.total - subtotal > 0 ? o.total - subtotal : 0;

  document.getElementById('drawerBody').innerHTML = `

    <!-- Items -->
    <div class="drawer-section">
      <div class="drawer-section-head"><i class="fa-solid fa-book"></i> الكتب المطلوبة (${o.items?.length||0})</div>
      <div class="drawer-section-body">
        ${(o.items||[]).map(item => `
          <div class="drawer-item">
            <div class="drawer-item-cover" style="background:${getCover(item.product?.category, item.product?._id)}">
              <i class="fa-solid fa-book-open"></i>${item.product?.title||''}
            </div>
            <div class="drawer-item-info">
              <div class="drawer-item-title">${item.product?.title||'—'}</div>
              <div class="drawer-item-author">${item.product?.author||''}</div>
              <div class="drawer-item-qty">الكمية: ${item.quantity}</div>
            </div>
            <div class="drawer-item-price">${formatPrice(item.product.price * item.quantity,'EGP')}</div>
          </div>`).join('')}
        <div style="margin-top:12px">
          <div class="drawer-total-row"><span class="lbl">المجموع الفرعي</span><span class="val">${formatPrice(subtotal,'EGP')}</span></div>
          ${shipping ? `<div class="drawer-total-row"><span class="lbl">الشحن</span><span class="val">${formatPrice(shipping,'EGP')}</span></div>` : ''}
          <div class="drawer-divider"></div>
          <div class="drawer-total-row grand"><span class="lbl">الإجمالي</span><span class="val">${formatPrice(o.total,'EGP')}</span></div>
        </div>
      </div>
    </div>

    <!-- Customer -->
    <div class="drawer-section">
      <div class="drawer-section-head"><i class="fa-regular fa-user"></i> بيانات العميل</div>
      <div class="drawer-section-body">
        <div class="info-row"><span class="info-label">الاسم</span><span class="info-value">${o.customer?.name||'—'}</span></div>
        <div class="info-row"><span class="info-label">البريد</span><span class="info-value" dir="ltr">${o.customer?.email||'—'}</span></div>
        <div class="info-row"><span class="info-label">الهاتف</span><span class="info-value" dir="ltr">${o.customer?.phone||'—'}</span></div>
        <div class="info-row"><span class="info-label">العنوان</span><span class="info-value">${o.address||'—'}</span></div>
      </div>
    </div>

    <!-- Payment & Shipping -->
    <div class="drawer-section">
      <div class="drawer-section-head"><i class="fa-solid fa-credit-card"></i> الدفع والشحن</div>
      <div class="drawer-section-body">
        <div class="info-row">
          <span class="info-label">طريقة الدفع</span>
          <span class="info-value"><span class="pay-badge ${pay.cls}"><i class="fa-solid ${pay.icon}"></i> ${pay.label}</span></span>
        </div>
        <div class="info-row"><span class="info-label">تاريخ الطلب</span><span class="info-value">${formatDate(o.createdAt)}</span></div>
        ${o.notes ? `<div class="info-row"><span class="info-label">ملاحظات</span><span class="info-value">${o.notes}</span></div>` : ''}
      </div>
    </div>

    <!-- Status Changer -->
    <div class="drawer-section">
      <div class="drawer-section-head"><i class="fa-solid fa-arrows-rotate"></i> تغيير الحالة</div>
      <div class="drawer-section-body">
        <div class="status-changer" id="statusChanger">
          ${Object.entries(ST).map(([k,v]) => `
            <button class="status-chip ${o.status===k?'active':''}"
              onclick="selectDrawerStatus('${k}', this)">${v.label}</button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Admin Notes -->
    <div class="drawer-section">
      <div class="drawer-section-head"><i class="fa-regular fa-note-sticky"></i> ملاحظات الإدارة</div>
      <div class="drawer-section-body">
        <textarea class="drawer-notes" id="adminNotes" placeholder="أضف ملاحظة داخلية عن هذا الطلب..."></textarea>
      </div>
    </div>`;

  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('orderDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectDrawerStatus(status, btn) {
  drawerNewStatus = status;
  document.querySelectorAll('.status-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const st = ST[status] || ST.pending;
  document.getElementById('drawerStatusBadge').innerHTML =
    `<span class="status-badge ${st.cls}"><span class="status-dot"></span>${st.label}</span>`;
}

function saveDrawerStatus() {
  const o = allOrders.find(o => o._id === drawerOrderId);
  if (!o || !drawerNewStatus) return;
  o.status = drawerNewStatus;
  renderStats();
  renderTable();
  closeDrawer();
  showToast(`تم تحديث الطلب #${drawerOrderId.slice(-6)} ✓`, 'success');
}

function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('orderDrawer').classList.remove('open');
  document.body.style.overflow = '';
  drawerOrderId = null;
}

function printOrder(id) {
  const oid = id || drawerOrderId;
  showToast(`جارٍ إعداد طباعة الطلب #${oid?.slice(-6)||''}...`, 'info');
  setTimeout(() => window.print(), 400);
}

/* ══════════════════════════════════════════════
   EXPORT CSV
══════════════════════════════════════════════ */
function exportCSV() {
  const headers = ['رقم الطلب','العميل','البريد','الإجمالي','الدفع','الحالة','التاريخ','عدد الكتب'];
  const rows = filtered.map(o => [
    o._id,
    `"${o.customer?.name||''}"`,
    o.customer?.email||'',
    o.total,
    PAY[o.payment]?.label || o.payment,
    ST[o.status]?.label   || o.status,
    new Date(o.createdAt).toLocaleDateString('ar-EG'),
    o.items?.length || 0,
  ]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'thaqaf-orders.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('تم تصدير الطلبات بنجاح', 'success');
}

/* ══════════════════════════════════════════════
   SIDEBAR (MOBILE)
══════════════════════════════════════════════ */
function openSidebar()  { document.getElementById('adminSidebar').classList.add('open');    document.getElementById('sidebarOverlay').classList.add('open'); }
function closeSidebar() { document.getElementById('adminSidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); }
function logoutAdmin()  { authLogout(); window.location.href = '/pages/auth/login.html'; }

/* ══════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════ */
document.getElementById('searchInput')?.addEventListener('input', debounce(applyFilters, 300));
['statusFilter','payFilter','sortSelect'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', applyFilters);
});
['dateFrom','dateTo'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', applyFilters);
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
init();
