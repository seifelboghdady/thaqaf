/**
 * admin.js — Admin Dashboard logic for ثقف
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
   MOCK DATA
══════════════════════════════════════════════ */
const mockKPI = {
  revenue:      { value: 48320, trend: +18.4, sub: 'هذا الشهر' },
  orders:       { value: 186,   trend: +12.1, sub: '23 طلب اليوم' },
  users:        { value: 1240,  trend: +9.3,  sub: '48 مستخدم جديد هذا الأسبوع' },
  products:     { value: 312,   trend: 0,     sub: '18 منتج نفد مخزونه' },
};

const chartData = {
  '7d': {
    labels:  ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
    values:  [3200, 4100, 2800, 5300, 3900, 6200, 4700],
    orders:  [12, 18, 10, 22, 16, 28, 20],
  },
  '30d': {
    labels:  ['أسبوع 1','أسبوع 2','أسبوع 3','أسبوع 4'],
    values:  [14200, 18900, 12400, 20100],
    orders:  [58, 76, 49, 82],
  },
  '12m': {
    labels:  ['يناير','فبراير','مارس','إبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    values:  [28000,32000,25000,38000,42000,35000,48000,44000,50000,46000,52000,58000],
    orders:  [110,128,98,152,168,140,192,176,200,184,208,232],
  },
};

const donutData = [
  { label: 'برمجة',      value: 42, color: '#4540a0' },
  { label: 'إدارة الوقت', value: 24, color: '#f5a623' },
  { label: 'تطوير الذات', value: 18, color: '#1d9e75' },
  { label: 'أعمال',      value: 10, color: '#a855f7' },
  { label: 'أخرى',       value: 6,  color: '#94a3b8' },
];

const recentOrders = [
  { id:'ORD-2025-00186', customer:'أحمد محمد',   total:740,  payment:'card',   status:'delivered' },
  { id:'ORD-2025-00185', customer:'سارة علي',    total:320,  payment:'cod',    status:'shipped'   },
  { id:'ORD-2025-00184', customer:'محمد خالد',   total:615,  payment:'wallet', status:'preparing' },
  { id:'ORD-2025-00183', customer:'نور حسن',     total:240,  payment:'card',   status:'confirmed' },
  { id:'ORD-2025-00182', customer:'كريم عبدالله',total:430,  payment:'cod',    status:'pending'   },
  { id:'ORD-2025-00181', customer:'ريم صالح',    total:280,  payment:'card',   status:'delivered' },
];

const topBooks = [
  { _id:'4',  title:'Atomic Habits',          author:'James Clear',       category:'selfdev',     sales:542, maxSales:600 },
  { _id:'8',  title:'Python Crash Course',    author:'Eric Matthes',      category:'programming', sales:386, maxSales:600 },
  { _id:'1',  title:'Clean Code',             author:'Robert C. Martin',  category:'programming', sales:298, maxSales:600 },
  { _id:'3',  title:'Deep Work',              author:'Cal Newport',        category:'productivity',sales:241, maxSales:600 },
  { _id:'12', title:'Designing Data-Intensive Apps', author:'M. Kleppmann',category:'data',       sales:178, maxSales:600 },
];

const activities = [
  { type:'order',   color:'var(--brand-500)', text:'<strong>أحمد محمد</strong> أتم طلب جديد بقيمة <strong>740 ج.م</strong>',           time:'منذ 5 دقائق' },
  { type:'user',    color:'var(--success)',   text:'مستخدم جديد <strong>سارة علي</strong> سجّل في المنظومة',                              time:'منذ 12 دقيقة' },
  { type:'product', color:'var(--accent)',    text:'كتاب <strong>Python Crash Course</strong> تبقّى منه <strong>3 نسخ</strong> فقط',        time:'منذ 28 دقيقة' },
  { type:'order',   color:'var(--brand-500)', text:'<strong>محمد خالد</strong> طلب جديد — جارٍ التجهيز',                                  time:'منذ 45 دقيقة' },
  { type:'review',  color:'var(--accent)',    text:'تقييم جديد ★★★★★ على <strong>Atomic Habits</strong> من <strong>نور حسن</strong>',       time:'منذ ساعة' },
  { type:'cancel',  color:'var(--danger)',    text:'إلغاء طلب <strong>#ORD-2025-00179</strong> من قِبَل العميل',                           time:'منذ ساعتين' },
];

/* ══════════════════════════════════════════════
   STATUS LABELS
══════════════════════════════════════════════ */
const STATUS_LABELS = {
  pending:   { label:'قيد الانتظار', cls:'pill-pending'   },
  confirmed: { label:'مؤكد',         cls:'pill-confirmed' },
  preparing: { label:'جارٍ التجهيز', cls:'pill-preparing' },
  shipped:   { label:'في الشحن',     cls:'pill-shipped'   },
  delivered: { label:'تم التسليم',   cls:'pill-delivered' },
  cancelled: { label:'ملغى',         cls:'pill-cancelled' },
};
const PAY_LABELS = { card:'بطاقة', cod:'كاش', wallet:'محفظة' };

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
function init() {
  const user = authUser();
  if (user) {
    const name = user.name?.split(' ')[0] || 'Admin';
    document.getElementById('greetingTitle').textContent = `مرحباً ${name} 👋`;
    document.getElementById('sidebarName').textContent   = user.name || 'Admin';
    document.getElementById('sidebarAvatar').textContent = name.charAt(0);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';
  document.getElementById('greetingSub').textContent =
    `${greeting}! إليك ملخص أداء متجر ثقف — ${new Date().toLocaleDateString('ar-EG', { weekday:'long', day:'numeric', month:'long' })}`;
}

/* ══════════════════════════════════════════════
   KPI CARDS
══════════════════════════════════════════════ */
function renderKPI() {
  const kpiDefs = [
    { key:'revenue',  label:'إجمالي الإيرادات', icon:'fa-egyptian-pound-sign', cls:'revenue',
      format: v => formatPrice(v, 'EGP') },
    { key:'orders',   label:'إجمالي الطلبات',   icon:'fa-box',                 cls:'orders',
      format: v => v.toLocaleString('ar-EG') },
    { key:'users',    label:'المستخدمون',        icon:'fa-users',               cls:'users',
      format: v => v.toLocaleString('ar-EG') },
    { key:'products', label:'المنتجات',          icon:'fa-book',                cls:'products',
      format: v => v.toLocaleString('ar-EG') },
  ];

  document.getElementById('kpiGrid').innerHTML = kpiDefs.map((def, i) => {
    const data  = mockKPI[def.key];
    const trend = data.trend;
    const trendHtml = trend === 0
      ? `<span class="kpi-trend neutral"><i class="fa-solid fa-minus"></i> ثابت</span>`
      : trend > 0
        ? `<span class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +${trend}%</span>`
        : `<span class="kpi-trend down"><i class="fa-solid fa-arrow-trend-down"></i> ${trend}%</span>`;

    return `
    <div class="kpi-card ${def.cls}" style="animation-delay:${i*.07}s">
      <div class="kpi-header">
        <div class="kpi-icon"><i class="fa-solid ${def.icon}"></i></div>
        ${trendHtml}
      </div>
      <div class="kpi-value" id="kpi-${def.key}">0</div>
      <div class="kpi-label">${def.label}</div>
      <div class="kpi-sub">${data.sub}</div>
    </div>`;
  }).join('');

  // Animate count-up
  kpiDefs.forEach(def => {
    const target = mockKPI[def.key].value;
    const el     = document.getElementById(`kpi-${def.key}`);
    const fmt    = def.format;
    countUp(el, target, fmt);
  });
}

function countUp(el, target, fmt, duration = 1200) {
  const start    = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════
   BAR CHART
══════════════════════════════════════════════ */
let currentPeriod = '7d';

function renderBarChart(periodKey) {
  currentPeriod = periodKey;
  const data   = chartData[periodKey];
  const svg    = document.getElementById('revenueChart');
  const W      = 600; const H = 220;
  const padL   = 40;  const padR = 16;
  const padT   = 14;  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...data.values) * 1.15;
  const n      = data.labels.length;
  const gap    = 6;
  const bw     = (chartW - gap * (n - 1)) / n;

  // Grid lines
  let html = '';
  const gridCount = 4;
  for (let g = 0; g <= gridCount; g++) {
    const y = padT + chartH - (g / gridCount) * chartH;
    const val = Math.round((g / gridCount) * maxVal);
    html += `<line class="chart-grid" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/>`;
    html += `<text class="chart-y-label" x="${padL - 4}" y="${y + 3}" text-anchor="end">${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}</text>`;
  }

  // Bars
  data.values.forEach((val, i) => {
    const x   = padL + i * (bw + gap);
    const bh  = (val / maxVal) * chartH;
    const y   = padT + chartH - bh;
    const pct = Math.round((i / (n - 1)) * 100);
    const color = `hsl(${240 + pct * 0.4}, 60%, ${40 + pct * 0.12}%)`;

    html += `
      <rect class="bar-rect" x="${x}" y="${y}" width="${bw}" height="${bh}"
        rx="4" fill="${color}" opacity="0.85"
        onmouseenter="showTooltip(event,'${data.labels[i]}','${formatPrice(val,'EGP')}','${data.orders[i]} طلب')"
        onmouseleave="hideTooltip()"/>`;

    // X label
    const labelX = x + bw / 2;
    const shortLabel = data.labels[i].length > 4 ? data.labels[i].slice(0, 3) : data.labels[i];
    html += `<text class="chart-x-label" x="${labelX}" y="${H - 6}" text-anchor="middle">${shortLabel}</text>`;
  });

  svg.innerHTML = html;
}

function switchPeriod(btn, period) {
  document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBarChart(period);
}

function showTooltip(e, label, amount, orders) {
  const tip = document.getElementById('chartTooltip');
  tip.innerHTML = `<strong>${label}</strong><br>${amount}<br>${orders}`;
  tip.style.opacity = '1';
  tip.style.left    = (e.offsetX + 8) + 'px';
  tip.style.top     = (e.offsetY - 50) + 'px';
}
function hideTooltip() {
  document.getElementById('chartTooltip').style.opacity = '0';
}

/* ══════════════════════════════════════════════
   DONUT CHART
══════════════════════════════════════════════ */
function renderDonut() {
  const R   = 60; const cx = 80; const cy = 80;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  let svgHtml = '';
  const total = donutData.reduce((s, d) => s + d.value, 0);

  // Background circle
  svgHtml += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--gray-100)" stroke-width="18"/>`;

  donutData.forEach(d => {
    const dash   = (d.value / 100) * circ;
    const gap2   = circ - dash;
    svgHtml += `
      <circle class="donut-circle" cx="${cx}" cy="${cy}" r="${R}"
        fill="none" stroke="${d.color}" stroke-width="18"
        stroke-dasharray="${dash} ${gap2}"
        stroke-dashoffset="${-offset}"
        stroke-linecap="round"/>`;
    offset += dash;
  });

  document.getElementById('donutSvg').innerHTML = svgHtml;
  document.getElementById('donutCenter').textContent = total.toLocaleString('ar-EG') + '%';

  // Legend
  document.getElementById('donutLegend').innerHTML = donutData.map(d => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${d.color}"></div>
      <span>${d.label}</span>
      <span class="legend-pct">${d.value}%</span>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   RECENT ORDERS TABLE
══════════════════════════════════════════════ */
function renderRecentOrders() {
  document.getElementById('recentOrdersBody').innerHTML = recentOrders.map((o, i) => {
    const st   = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
    const pay  = PAY_LABELS[o.payment]   || o.payment;
    const payIcon = o.payment === 'card' ? 'fa-credit-card'
                  : o.payment === 'wallet' ? 'fa-wallet'
                  : 'fa-money-bill-wave';
    return `
    <tr style="animation-delay:${i*.04}s">
      <td><span class="table-order-id">#${o.id.slice(-5)}</span></td>
      <td><span class="table-customer">${o.customer}</span></td>
      <td><span class="table-amount">${formatPrice(o.total,'EGP')}</span></td>
      <td><span style="display:flex;align-items:center;gap:5px;font-size:.78rem;color:var(--text-muted)">
        <i class="fa-solid ${payIcon}"></i>${pay}</span></td>
      <td><span class="status-pill ${st.cls}">${st.label}</span></td>
    </tr>`;
  }).join('');
}

/* ══════════════════════════════════════════════
   TOP BOOKS
══════════════════════════════════════════════ */
function renderTopBooks() {
  const rankClasses = ['gold','silver','bronze'];
  document.getElementById('topBooksList').innerHTML = topBooks.map((b, i) => `
    <div class="top-book-item">
      <div class="rank-num ${rankClasses[i] || ''}">${i + 1}</div>
      <div class="top-book-cover" style="background:${getCover(b.category,b.id)}">
     
        <i class="fa-solid fa-book-open"></i>
        ${b.title}
      </div>
      <div class="top-book-info">
        <div class="top-book-title">${b.title}</div>
        <div class="top-book-author">${b.author}</div>
      </div>
      <div class="top-book-bar">
        <div class="top-book-bar-fill" style="width:${Math.round(b.sales/b.maxSales*100)}%"></div>
      </div>
      <div class="top-book-sales">${b.sales} نسخة</div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   ACTIVITY FEED
══════════════════════════════════════════════ */
function renderActivity() {
  document.getElementById('activityList').innerHTML = activities.map((a, i) => `
    <div class="activity-item" style="animation-delay:${i*.05}s">
      <div class="activity-dot-wrap">
        <div class="activity-dot" style="background:${a.color}"></div>
      </div>
      <div class="activity-body">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time"><i class="fa-regular fa-clock" style="margin-left:3px"></i>${a.time}</div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   SIDEBAR MOBILE
══════════════════════════════════════════════ */
function openSidebar() {
  document.getElementById('adminSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('adminSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

/* ══════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════ */
function logoutAdmin() {
  authLogout();
  window.location.href = '/pages/auth/login.html';
}

/* ══════════════════════════════════════════════
   BOOT — staggered renders
══════════════════════════════════════════════ */
init();
setTimeout(() => { renderKPI(); },         100);
setTimeout(() => { renderBarChart('7d'); }, 200);
setTimeout(() => { renderDonut(); },        300);
setTimeout(() => { renderRecentOrders(); }, 350);
setTimeout(() => { renderTopBooks(); },     400);
setTimeout(() => { renderActivity(); },     450);
