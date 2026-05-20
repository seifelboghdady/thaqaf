/**
 * checkout.js — Checkout page logic for ثقف
 */

requireAuth();
initNavbar('');

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
  // return arr[(id?.charCodeAt(id.length - 1) || 0) % arr.length];
  const safeId = String(id);
  return arr[(safeId.charCodeAt(safeId.length - 1) || 0) % arr.length];
}

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let cartData       = null;
let shippingCost   = 0;
let selectedMethod = 'cod';
let selectedWallet = '';

/* ══════════════════════════════════════════════
   MOCK FALLBACK
══════════════════════════════════════════════ */
const mockCartData = {
  items: [
    { product:{ _id:'1', title:'Clean Code',    author:'Robert C. Martin', price:280, oldPrice:350, category:'programming' }, quantity:1 },
    { product:{ _id:'3', title:'Deep Work',     author:'Cal Newport',      price:220, oldPrice:260, category:'productivity'}, quantity:2 },
    { product:{ _id:'4', title:'Atomic Habits', author:'James Clear',      price:240, oldPrice:null, category:'selfdev'    }, quantity:1 },
  ],
  coupon:          'THAQAF20',
  couponDiscount:  148,
  subtotal:        960,
  shipping:        0,
  total:           812,
};

/* ══════════════════════════════════════════════
   INIT — load cart data from localStorage
══════════════════════════════════════════════ */
function init() {
  // Pre-fill from logged-in user
  const user = authUser();
  if (user) {
    const nameParts = (user.name || '').split(' ');
    document.getElementById('firstName').value = nameParts[0] || '';
    document.getElementById('lastName').value  = nameParts.slice(1).join(' ') || '';
    document.getElementById('email').value     = user.email || '';
    document.getElementById('phone').value     = user.phone || '';
    // Fill saved address name
    document.querySelectorAll('#savedAddressName, #savedAddressName2').forEach(el => {
      el.textContent = user.name || 'المستخدم';
    });
  }

  // Load cart snapshot
  try {
    const saved = localStorage.getItem('thaqaf_checkout_cart');
    cartData = saved ? JSON.parse(saved) : mockCartData;
  } catch {
    cartData = mockCartData;
  }

  shippingCost = cartData.shipping || 0;
  cartData.items = (cartData.Products || []).map(p => ({

  product: {
    id: p.id,
    title: p.title,
    author: p.author,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice
  },

  quantity: p.OrderProduct?.quantity || 1

}));
  renderSummaryItems();
  updateSummaryTotals();
}

/* ══════════════════════════════════════════════
   RENDER SUMMARY ITEMS
══════════════════════════════════════════════ */
function renderSummaryItems() {
  const container = document.getElementById('summaryItems');
  if (!cartData?.items) return;

  container.innerHTML = cartData.items.map(item => {
    const p = item.product;
    return `
    <div class="summary-item">
      <div class="sum-cover" style="background:${getCover(p.category, p.id)}">
        <i class="fa-solid fa-book-open"></i>
        ${p.title}
      </div>
      <div class="sum-info">
        <div class="sum-title">${p.title}</div>
        <div class="sum-author">${p.author || ''}</div>
        <div class="sum-qty">× ${item.quantity}</div>
      </div>
      <div class="sum-price">${formatPrice(p.price * item.quantity, 'EGP')}</div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════
   UPDATE SUMMARY TOTALS
══════════════════════════════════════════════ */
function updateSummaryTotals() {
  if (!cartData) return;

  const subtotal      = cartData.subtotal    || 0;
  const prodDiscount  = cartData.items?.reduce((s, i) => {
    if (!i.product.oldPrice) return s;
    return s + (i.product.oldPrice - i.product.price) * i.quantity;
  }, 0) || 0;
  const couponDisc    = cartData.couponDiscount || 0;
  const shipping      = shippingCost;
  const total         = Math.max(0, subtotal - couponDisc + shipping);

  document.getElementById('sumSubtotal').textContent = formatPrice(subtotal, 'EGP');

  const discRow = document.getElementById('sumDiscountRow');
  if (prodDiscount > 0) {
    discRow.classList.remove('hidden');
    document.getElementById('sumDiscount').textContent = `- ${formatPrice(prodDiscount, 'EGP')}`;
  } else discRow.classList.add('hidden');

  const couponRow = document.getElementById('sumCouponRow');
  if (couponDisc > 0) {
    couponRow.classList.remove('hidden');
    document.getElementById('sumCouponDiscount').textContent = `- ${formatPrice(couponDisc, 'EGP')}`;
    document.getElementById('sumCouponCode').textContent = cartData.coupon || '';
  } else couponRow.classList.add('hidden');

  const shipEl = document.getElementById('sumShipping');
  if (shipping === 0) {
    shipEl.textContent = 'مجاني';
    shipEl.style.color = 'var(--success)';
  } else {
    shipEl.textContent = formatPrice(shipping, 'EGP');
    shipEl.style.color = 'var(--text-main)';
  }

  document.getElementById('sumTotal').textContent = formatPrice(total, 'EGP');
}

/* ══════════════════════════════════════════════
   ADDRESS SELECTION
══════════════════════════════════════════════ */
function selectAddress(card) {
  document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  card.querySelector('input[type=radio]').checked = true;
}

function toggleNewAddress() {
  const form = document.getElementById('newAddressForm');
  const isOpen = form.classList.toggle('open');
  const toggle = document.getElementById('newAddressToggle');
  toggle.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark"></i> إلغاء'
    : '<i class="fa-solid fa-plus"></i> إضافة عنوان جديد';
  if (isOpen) {
    // Deselect saved addresses
    document.querySelectorAll('.address-card').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('input').checked = false;
    });
  }
}

/* ══════════════════════════════════════════════
   SHIPPING SELECTION
══════════════════════════════════════════════ */
function selectShipping(option, cost) {
  document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');
  option.querySelector('input[type=radio]').checked = true;
  shippingCost = cost;
  updateSummaryTotals();
}

/* ══════════════════════════════════════════════
   PAYMENT SELECTION
══════════════════════════════════════════════ */
function selectPayment(option) {
  // Prevent bubbling from wallet sub-options
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');
  option.querySelector('input[type=radio]').checked = true;
  selectedMethod = option.dataset.method;

  // Show wallet options if needed
  if (selectedMethod !== 'wallet') selectedWallet = '';
}

function selectWallet(btn) {
  document.querySelectorAll('.wallet-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedWallet = btn.dataset.wallet;
}

/* ══════════════════════════════════════════════
   CARD FORMATTING
══════════════════════════════════════════════ */
function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');

  // Detect brand
  const icon = document.getElementById('cardBrandIcon');
  if (v.startsWith('4'))       { icon.className = 'fa-brands fa-cc-visa card-brand-icon'; icon.style.color = '#1a1f71'; }
  else if (/^5[1-5]/.test(v)) { icon.className = 'fa-brands fa-cc-mastercard card-brand-icon'; icon.style.color = '#eb001b'; }
  else                          { icon.className = 'fa-solid fa-credit-card card-brand-icon'; icon.style.color = 'var(--text-hint)'; }
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
  input.value = v;
}

/* ══════════════════════════════════════════════
   NOTES TOGGLE
══════════════════════════════════════════════ */
function toggleNotes() {
  const area   = document.getElementById('notesArea');
  const icon   = document.getElementById('notesIcon');
  const label  = document.getElementById('notesToggleText');
  const isOpen = area.classList.toggle('open');
  icon.className  = isOpen ? 'fa-solid fa-minus' : 'fa-solid fa-plus';
  label.textContent = isOpen ? 'إخفاء الملاحظة' : 'إضافة ملاحظة للمندوب أو المتجر';
}

/* ══════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════ */
function validate() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const phone     = document.getElementById('phone').value.trim();

  if (!firstName) { showToast('أدخل الاسم الأول', 'error'); return false; }
  if (!lastName)  { showToast('أدخل الاسم الأخير', 'error'); return false; }
  if (!email || !isValidEmail(email)) { showToast('أدخل بريد إلكتروني صحيح', 'error'); return false; }
  if (!phone || phone.length < 10)   { showToast('أدخل رقم هاتف صحيح', 'error'); return false; }

  // Address
  const newAddrOpen = document.getElementById('newAddressForm').classList.contains('open');
  if (newAddrOpen) {
    const city   = document.getElementById('city').value;
    const street = document.getElementById('street').value.trim();
    if (!city)   { showToast('اختر المحافظة', 'error'); return false; }
    if (!street) { showToast('أدخل الشارع والعمارة', 'error'); return false; }
  }

  // Payment
  if (selectedMethod === 'card') {
    const num    = document.getElementById('cardNumber').value.replace(/\s/g,'');
    const name   = document.getElementById('cardName').value.trim();
    const expiry = document.getElementById('cardExpiry').value;
    const cvv    = document.getElementById('cardCVV').value;
    if (num.length < 16)   { showToast('رقم البطاقة غير مكتمل', 'error'); return false; }
    if (!name)             { showToast('أدخل اسم حامل البطاقة', 'error'); return false; }
    if (expiry.length < 5) { showToast('أدخل تاريخ انتهاء البطاقة', 'error'); return false; }
    if (cvv.length < 3)    { showToast('أدخل رمز CVV', 'error'); return false; }
  }
  if (selectedMethod === 'wallet' && !selectedWallet) {
    showToast('اختر نوع المحفظة الإلكترونية', 'error');
    return false;
  }

  return true;
}

/* ══════════════════════════════════════════════
   PLACE ORDER
══════════════════════════════════════════════ */
async function placeOrder() {
  if (!validate()) return;

  const btn = document.getElementById('placeOrderBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  const orderPayload = {
    items: cartData?.items?.map(i => ({
      productId: i.product.id,
      quantity:  i.quantity,
      price:     i.product.price,
    })),
    address: {
      firstName: document.getElementById('firstName').value.trim(),
      lastName:  document.getElementById('lastName').value.trim(),
      phone:     document.getElementById('phone').value.trim(),
      city:      document.getElementById('city')?.value || 'المنزل',
      street:    document.getElementById('street')?.value?.trim() || 'العنوان المحفوظ',
    },
    paymentMethod: selectedMethod,
    shippingMethod: document.querySelector('input[name=shipping]:checked')?.value || 'free',
    coupon:        cartData?.coupon || '',
    notes:         document.getElementById('orderNotes')?.value?.trim() || '',
    total: +(document.getElementById('sumTotal').textContent.replace(/[^\d.]/g, '')),
  };

  try {
    const res = await ordersAPI.create(orderPayload);
    const orderId = res?.order?.id || res?.id || `ORD-2025-${String(Date.now()).slice(-5)}`;
    onOrderSuccess(orderId);
  } catch (err) {
    // Simulate success for demo if API not ready
    if (err.status === 0 || err.status >= 500) {
      const orderId = `ORD-2025-${String(Date.now()).slice(-5)}`;
      onOrderSuccess(orderId);
    } else {
      showToast(err.message || 'حدث خطأ، حاول مرة أخرى', 'error');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
}

function onOrderSuccess(orderId) {
  // Clear cart
  localStorage.removeItem('thaqaf_checkout_cart');
  localStorage.removeItem('thaqaf_cart_count');
  const badge = document.getElementById('cartBadge');
  if (badge) badge.style.display = 'none';

  // Show modal
  document.getElementById('successOrderNum').textContent = `#${orderId}`;
  document.getElementById('successOverlay').classList.add('open');
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
init();
