/**
 * orders.js — My Orders page logic for ثقف
 */

requireAuth();
initNavbar('orders');

/* ══════════════════════════════════════════════
   COVER COLORS
══════════════════════════════════════════════ */
const coverPalettes = {
  programming: ['linear-gradient(145deg,#0f0e2a,#312e7a)', 'linear-gradient(145deg,#0a1e3a,#1d4e89)'],
  productivity:['linear-gradient(145deg,#2d0f28,#7a2a68)', 'linear-gradient(145deg,#0f1e2d,#2a5a7a)'],
  selfdev:     ['linear-gradient(145deg,#2a0f05,#7a3010)'],
  design:      ['linear-gradient(145deg,#0f1a2a,#2a4a6a)'],
  business:    ['linear-gradient(145deg,#0f0f1a,#3a3a5a)'],
  data:        ['linear-gradient(145deg,#050f1a,#0f3a5a)'],
};
function getCover(cat, id = '') {
  const arr = coverPalettes[cat] || coverPalettes.programming;
  return arr[(id?.charCodeAt(id.length - 1) || 0) % arr.length];
}

/* ══════════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════════ */
const STATUS = {
  pending:   { label: 'قيد الانتظار',  cls: 'status-pending',   icon: 'fa-clock' },
  confirmed: { label: 'مؤكد',          cls: 'status-confirmed',  icon: 'fa-circle-check' },
  preparing: { label: 'جارٍ التجهيز', cls: 'status-preparing',  icon: 'fa-box' },
  shipped:   { label: 'في الشحن',      cls: 'status-shipped',    icon: 'fa-truck' },
  delivered: { label: 'تم التسليم',    cls: 'status-delivered',  icon: 'fa-circle-check' },
  cancelled: { label: 'ملغى',          cls: 'status-cancelled',  icon: 'fa-xmark' },
};

const PAY_LABELS = { cod:'كاش عند الاستلام', card:'بطاقة بنكية', wallet:'محفظة إلكترونية' };

/* ══════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════ */
const mockOrders = [
  {
    _id: 'ORD-2025-00124',
    status: 'delivered',
    createdAt: '2025-04-10T10:30:00Z',
    paymentMethod: 'card',
    total: 740,
    items: [
      { product:{ _id:'1', title:'Clean Code',    author:'Robert C. Martin', price:280, category:'programming' }, quantity:1 },
      { product:{ _id:'3', title:'Deep Work',     author:'Cal Newport',      price:220, category:'productivity'}, quantity:2 },
    ],
  },
  {
    _id: 'ORD-2025-00118',
    status: 'shipped',
    createdAt: '2025-04-28T14:15:00Z',
    paymentMethod: 'cod',
    total: 240,
    items: [
      { product:{ _id:'4', title:'Atomic Habits', author:'James Clear',      price:240, category:'selfdev'     }, quantity:1 },
    ],
  },
  {
    _id: 'ORD-2025-00111',
    status: 'preparing',
    createdAt: '2025-05-01T09:00:00Z',
    paymentMethod: 'wallet',
    total: 615,
    items: [
      { product:{ _id:'8',  title:'Python Crash Course',           author:'Eric Matthes',    price:295, category:'programming'}, quantity:1 },
      { product:{ _id:'12', title:'Designing Data-Intensive Apps', author:'Martin Kleppmann',price:390, category:'data'       }, quantity:1 },
    ],
  },
  {
    _id: 'ORD-2025-00098',
    status: 'confirmed',
    createdAt: '2025-05-10T16:45:00Z',
    paymentMethod: 'card',
    total: 320,
    items: [
      { product:{ _id:'2', title:'The Pragmatic Programmer', author:'Hunt & Thomas', price:320, category:'programming'}, quantity:1 },
    ],
  },
  {
    _id: 'ORD-2025-00087',
    status: 'pending',
    createdAt: '2025-05-16T08:20:00Z',
    paymentMethod: 'cod',
    total: 430,
    items: [
      { product:{ _id:'11', title:'Zero to One',          author:'Peter Thiel',  price:230, category:'business'    }, quantity:1 },
      { product:{ _id:'7',  title:'Getting Things Done',  author:'David Allen',  price:190, category:'productivity'}, quantity:1 },
    ],
  },
  {
    _id: 'ORD-2025-00062',
    status: 'cancelled',
    createdAt: '2025-03-20T11:00:00Z',
    paymentMethod: 'card',
    total: 255,
    items: [
      { product:{ _id:'14', title:"The Design of Everyday Things", author:'Don Norman', price:255, category:'design'}, quantity:1 },
    ],
  },
];

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let allOrders      = [];
let activeStatus   = 'all';
let searchQuery    = '';
let expandedOrders = new Set();

/* ══════════════════════════════════════════════
   LOAD
══════════════════════════════════════════════ */
async function loadOrders() {
  renderSkeletons();
  try {
    const data = await ordersAPI.getUserOrders();
    allOrders = data.orders || data || [];
    if (!allOrders.length) allOrders = mockOrders;
  } catch {
    allOrders = mockOrders;
  }
  updateStats();
  updateTabCounts();
  renderOrders();
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function updateStats() {
  const delivered = allOrders.filter(o => o.status === 'delivered').length;
  const active    = allOrders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  const spent     = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  document.getElementById('statTotal').textContent     = allOrders.length;
  document.getElementById('statDelivered').textContent = delivered;
  document.getElementById('statActive').textContent    = active;
  document.getElementById('statSpent').textContent     = formatPrice(spent, 'EGP');

  const user = authUser();
  const name = user?.name ? ` يا ${user.name.split(' ')[0]}` : '';
  document.getElementById('ordersHeaderSub').textContent =
    `لديك ${allOrders.length} طلب${name} — ${active} قيد التنفيذ`;
}

/* ══════════════════════════════════════════════
   TAB COUNTS
══════════════════════════════════════════════ */
function updateTabCounts() {
  const counts = { all: allOrders.length };
  Object.keys(STATUS).forEach(s => {
    counts[s] = allOrders.filter(o => o.status === s).length;
  });
  document.getElementById('tabAll').textContent       = counts.all;
  document.getElementById('tabPending').textContent   = counts.pending   || 0;
  document.getElementById('tabConfirmed').textContent = counts.confirmed || 0;
  document.getElementById('tabPreparing').textContent = counts.preparing || 0;
  document.getElementById('tabShipped').textContent   = counts.shipped   || 0;
  document.getElementById('tabDelivered').textContent = counts.delivered || 0;
  document.getElementById('tabCancelled').textContent = counts.cancelled || 0;
}

/* ══════════════════════════════════════════════
   FILTER + RENDER
══════════════════════════════════════════════ */
function getFiltered() {
  let list = allOrders;
  if (activeStatus !== 'all') list = list.filter(o => o.status === activeStatus);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(o =>
      o._id.toLowerCase().includes(q) ||
      o.items.some(i => i.product.title.toLowerCase().includes(q))
    );
  }
  return list;
}

function renderOrders() {
  const filtered = getFiltered();
  const list     = document.getElementById('ordersList');
  const empty    = document.getElementById('emptyOrders');
  const msg      = document.getElementById('emptyOrdersMsg');

  if (!filtered.length) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    msg.textContent = searchQuery
      ? `لا توجد طلبات تطابق "${searchQuery}"`
      : activeStatus === 'all'
        ? 'لم تقم بأي طلبات حتى الآن. ابدأ التسوق واكتشف مكتبة ثقف.'
        : `لا توجد طلبات بحالة "${STATUS[activeStatus]?.label || activeStatus}"`;
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = filtered.map((order, idx) => renderOrderCard(order, idx)).join('');
}

/* ══════════════════════════════════════════════
   RENDER ORDER CARD
══════════════════════════════════════════════ */
function renderOrderCard(order, idx) {
  const st      = STATUS[order.status] || STATUS.pending;
  const preview = order.items.slice(0, 3);
  const extra   = order.items.length - preview.length;
  const isOpen  = expandedOrders.has(order._id);

  const thumbsHtml = preview.map(item => `
    <div class="order-book-thumb"
      style="background:${getCover(item.product.category, item.product._id)}">
      <i class="fa-solid fa-book-open"></i>
      ${item.product.title}
    </div>`).join('') +
    (extra > 0 ? `<div class="order-more-books">+${extra}</div>` : '');

  const namesHtml = order.items.map(i => i.product.title).join('، ');

  const payIcon = order.paymentMethod === 'card'   ? 'fa-credit-card'
                : order.paymentMethod === 'wallet' ? 'fa-wallet'
                : 'fa-money-bill-wave';

  const expandedHtml = `
    <div class="order-items-expanded ${isOpen ? 'open' : ''}" id="expand-${order._id}">
      <div class="expanded-inner">
        ${order.items.map(item => `
          <div class="expanded-item"
            onclick="window.location.href='/pages/shop/product-detail.html?id=${item.product._id}'">
            <div class="exp-cover"
              style="background:${getCover(item.product.category, item.product._id)}">
              <i class="fa-solid fa-book-open"></i>
              ${item.product.title}
            </div>
            <div class="exp-info">
              <div class="exp-title">${item.product.title}</div>
              <div class="exp-author">${item.product.author || ''}</div>
              <div class="exp-qty">الكمية: ${item.quantity}</div>
            </div>
            <div class="exp-price">${formatPrice(item.product.price * item.quantity, 'EGP')}</div>
          </div>`).join('')}
      </div>
    </div>`;

  /* Action buttons per status */
  const actions = [];
  if (['pending','confirmed','preparing','shipped'].includes(order.status)) {
    actions.push(`
      <button class="btn btn-outline btn-sm"
        onclick="trackOrder('${order._id}')">
        <i class="fa-solid fa-location-dot"></i> تتبّع الطلب
      </button>`);
  }
  if (order.status === 'delivered') {
    actions.push(`
      <button class="btn btn-outline btn-sm"
        onclick="reorder('${order._id}')">
        <i class="fa-solid fa-rotate-right"></i> أعد الطلب
      </button>`);
  }
  if (['pending','confirmed'].includes(order.status)) {
    actions.push(`
      <button class="btn btn-sm" style="color:var(--danger);border:1.5px solid var(--border)"
        onclick="cancelOrder('${order._id}')">
        <i class="fa-solid fa-xmark"></i> إلغاء
      </button>`);
  }
  actions.push(`
    <button class="btn btn-outline btn-sm"
      onclick="toggleExpand('${order._id}')">
      <i class="fa-solid fa-chevron-${isOpen ? 'up' : 'down'}"></i>
      ${isOpen ? 'إخفاء' : 'تفاصيل'}
    </button>`);

  return `
  <div class="order-card" id="order-${order._id}" style="animation-delay:${idx * 0.06}s">

    <!-- Head -->
    <div class="order-head">
      <div class="order-head-left">
        <span class="order-id">#${order._id}</span>
        <span class="order-date">
          <i class="fa-regular fa-calendar" style="margin-left:4px"></i>
          ${formatDate(order.createdAt)}
        </span>
      </div>
      <div class="order-head-right">
        <span class="status-badge ${st.cls}">
          <span class="status-dot"></span>
          ${st.label}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="order-body">
      <div class="order-items-preview">
        ${thumbsHtml}
        <div class="order-items-info">
          <div class="order-items-names">${namesHtml}</div>
          <div class="order-items-count">${order.items.length} كتاب</div>
        </div>
      </div>
    </div>

    <!-- Expandable items -->
    ${expandedHtml}

    <!-- Foot -->
    <div class="order-foot">
      <div class="order-foot-left">
        <div>
          <div class="order-total-label">الإجمالي</div>
          <div class="order-total-value">${formatPrice(order.total, 'EGP')}</div>
        </div>
        <div class="order-payment-method">
          <i class="fa-solid ${payIcon}"></i>
          ${PAY_LABELS[order.paymentMethod] || order.paymentMethod}
        </div>
      </div>
      <div class="order-foot-right">
        ${actions.join('')}
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════════ */
function renderSkeletons() {
  document.getElementById('ordersList').innerHTML = Array(3).fill(0).map(() => `
    <div class="order-card">
      <div class="order-head" style="background:var(--gray-50)">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="skel" style="width:130px;height:14px"></div>
          <div class="skel" style="width:80px;height:12px"></div>
        </div>
        <div class="skel" style="width:80px;height:22px;border-radius:20px"></div>
      </div>
      <div class="order-body">
        <div style="display:flex;gap:10px;align-items:center">
          <div class="skel" style="width:52px;height:70px;border-radius:8px"></div>
          <div class="skel" style="width:52px;height:70px;border-radius:8px"></div>
          <div style="flex:1">
            <div class="skel" style="height:14px;width:70%;margin-bottom:8px"></div>
            <div class="skel" style="height:11px;width:40%"></div>
          </div>
        </div>
      </div>
      <div class="order-foot" style="background:var(--gray-50)">
        <div class="skel" style="width:100px;height:18px"></div>
        <div style="display:flex;gap:8px">
          <div class="skel" style="width:90px;height:32px;border-radius:8px"></div>
          <div class="skel" style="width:80px;height:32px;border-radius:8px"></div>
        </div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   ACTIONS
══════════════════════════════════════════════ */
function toggleExpand(orderId) {
  if (expandedOrders.has(orderId)) {
    expandedOrders.delete(orderId);
  } else {
    expandedOrders.add(orderId);
  }
  // Re-render just that card efficiently
  const filtered = getFiltered();
  const order = filtered.find(o => o._id === orderId);
  if (!order) return;
  const idx = filtered.indexOf(order);
  const cardEl = document.getElementById(`order-${orderId}`);
  if (cardEl) {
    cardEl.outerHTML = renderOrderCard(order, idx);
  }
}

function trackOrder(orderId) {
  window.location.href = `order-tracking.html?id=${orderId}`;
}

function reorder(orderId) {
  const order = allOrders.find(o => o._id === orderId);
  if (!order) return;
  showToast('جارٍ إضافة الكتب للعربة...', 'info');
  setTimeout(() => {
    const count = order.items.reduce((s, i) => s + i.quantity, 0);
    const current = parseInt(localStorage.getItem('thaqaf_cart_count') || '0');
    localStorage.setItem('thaqaf_cart_count', current + count);
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = current + count; badge.style.display = 'flex'; }
    showToast('تمت إضافة الكتب للعربة ✓', 'success');
    setTimeout(() => window.location.href = '/pages/cart/cart.html', 800);
  }, 700);
}

function cancelOrder(orderId) {
  if (!confirm('هل تريد إلغاء هذا الطلب؟')) return;
  const order = allOrders.find(o => o._id === orderId);
  if (!order) return;
  order.status = 'cancelled';
  updateStats();
  updateTabCounts();
  renderOrders();
  showToast(`تم إلغاء الطلب #${orderId}`, 'info');
}

/* ══════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════ */

/* Status tabs */
document.getElementById('statusTabs')?.addEventListener('click', e => {
  const tab = e.target.closest('.status-tab');
  if (!tab) return;
  document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  activeStatus = tab.dataset.status;
  renderOrders();
});

/* Search */
document.getElementById('orderSearch')?.addEventListener('input', debounce(e => {
  searchQuery = e.target.value.trim();
  renderOrders();
}, 300));

/* Navbar search */
document.getElementById('navSearchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.value.trim())
    window.location.href = `/pages/shop/products.html?q=${encodeURIComponent(e.target.value.trim())}`;
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
loadOrders();
