/**
 * product-detail.js — Book detail page logic for ثقف
 */

initNavbar('shop');

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let product  = null;
let qty      = 1;
let selectedRating = 0;
let descExpanded   = false;
let inWishlist     = false;

/* ══════════════════════════════════════════════
   COVER COLORS
══════════════════════════════════════════════ */
const coverPalettes = {
  programming: ['linear-gradient(145deg,#0f0e2a,#312e7a)', 'linear-gradient(145deg,#0a1e3a,#1d4e89)', 'linear-gradient(145deg,#0f2218,#1a5c2a)'],
  productivity:['linear-gradient(145deg,#2d0f28,#7a2a68)', 'linear-gradient(145deg,#0f1e2d,#2a5a7a)'],
  selfdev:     ['linear-gradient(145deg,#2a0f05,#7a3010)', 'linear-gradient(145deg,#1f0f2a,#5a2a7a)'],
  design:      ['linear-gradient(145deg,#0f1a2a,#2a4a6a)', 'linear-gradient(145deg,#2a1a0f,#6a4a2a)'],
  business:    ['linear-gradient(145deg,#0f0f1a,#3a3a5a)', 'linear-gradient(145deg,#1a0f05,#5a3a15)'],
  data:        ['linear-gradient(145deg,#050f1a,#0f3a5a)', 'linear-gradient(145deg,#0f052a,#3a0f4a)'],
};

function getCover(cat, id = '') {

  const arr = coverPalettes[cat] || coverPalettes.programming;

  const safeId = String(id);

  return arr[
    (safeId.charCodeAt(safeId.length - 1) || 0) % arr.length
  ];

}
/* ══════════════════════════════════════════════
   MOCK DATA (fallback)
══════════════════════════════════════════════ */
const mockProducts = [
  { _id:'1',  title:'Clean Code',                    author:'Robert C. Martin', price:280, oldPrice:350,  category:'programming', rating:4.8, reviews:124, isNew:false,
    description:'كتاب Clean Code هو مرجع أساسي لكل مطوّر يسعى إلى كتابة كود نظيف وقابل للصيانة. يأخذك روبرت مارتن في رحلة عميقة لفهم مبادئ الكود الجيد، من التسمية الصحيحة للمتغيرات والدوال، إلى كيفية تنظيم الكلاسات وإدارة الأخطاء. مليء بالأمثلة العملية وحالات حقيقية من مشاريع برمجية ضخمة.\n\nسيساعدك هذا الكتاب على تحسين مهاراتك البرمجية بشكل جوهري، وفهم لماذا الكود النظيف ليس رفاهية بل ضرورة في بيئات العمل الاحترافية. من أكثر الكتب التقنية مبيعاً على مستوى العالم.',
    publisher:'Prentice Hall', year:2008, pages:431, language:'إنجليزي', isbn:'978-0132350884', stock:50, sold:1240 },
  { _id:'2',  title:'The Pragmatic Programmer',      author:'Hunt & Thomas',    price:320, oldPrice:null, category:'programming', rating:4.9, reviews:98,  isNew:true,
    description:'الكتاب الذي غيّر طريقة تفكير الملايين من المبرمجين. يقدّم "البرمجي العملي" مجموعة من الدروس والمبادئ العملية المستخلصة من سنوات طويلة من الخبرة في تطوير البرمجيات. من إدارة المخاطر إلى التواصل الفعّال مع الفريق.\n\nمثالي للمطورين الذين يريدون الانتقال من مجرد كتابة الكود إلى التفكير كمحترف حقيقي.',
    publisher:'Addison-Wesley', year:2019, pages:352, language:'إنجليزي', isbn:'978-0135957059', stock:30, sold:890 },
  { _id:'3',  title:'Deep Work',                     author:'Cal Newport',      price:220, oldPrice:260,  category:'productivity', rating:4.7, reviews:203, isNew:false,
    description:'في عصر التشتت والإشعارات المستمرة، يقدّم كال نيوبورت حجة قوية لقيمة العمل العميق المركّز. يشرح كيف أن القدرة على التركيز بلا تشتيت لساعات متواصلة هي مهارة نادرة وذات قيمة هائلة في اقتصاد المعرفة.\n\nمليء بالاستراتيجيات العملية لبناء عادات عمل عميق وحذف الضوضاء من حياتك المهنية.',
    publisher:'Grand Central Publishing', year:2016, pages:296, language:'إنجليزي', isbn:'978-1455586691', stock:45, sold:2100 },
  { _id:'4',  title:'Atomic Habits',                 author:'James Clear',      price:240, oldPrice:300,  category:'selfdev',      rating:4.9, reviews:512, isNew:false,
    description:'الكتاب الأكثر مبيعاً عالمياً في تطوير العادات. يشرح جيمس كلير بأسلوب علمي وعملي كيف أن التغييرات الصغيرة تتراكم لتحدث نتائج ضخمة. نظام واضح لبناء العادات الجيدة والتخلص من السيئة.\n\nإذا كنت تريد كتاباً واحداً يغيّر طريقة تفكيرك في السلوك البشري والتحسين المستمر، فهذا هو.',
    publisher:'Avery', year:2018, pages:320, language:'إنجليزي', isbn:'978-0735211292', stock:60, sold:5400 },
  { _id:'8',  title:'Python Crash Course',           author:'Eric Matthes',     price:295, oldPrice:360,  category:'programming', rating:4.8, reviews:320, isNew:true,
    description:'أسرع وأوضح مسار تعليمي لتعلم Python من الصفر. يأخذك الكتاب من المفاهيم الأساسية إلى بناء مشاريع حقيقية: لعبة، تطبيق ويب، وتصوير بيانات. أسلوب تعليمي سهل ومباشر مع تمارين عملية في نهاية كل فصل.',
    publisher:'No Starch Press', year:2023, pages:552, language:'إنجليزي', isbn:'978-1718502703', stock:25, sold:3200 },
  { _id:'12', title:'Designing Data-Intensive Apps', author:'Martin Kleppmann', price:390, oldPrice:480,  category:'data',         rating:4.9, reviews:156, isNew:true,
    description:'المرجع الأشمل لبناء أنظمة بيانات موثوقة وقابلة للتوسع. يغطّي الكتاب كل شيء من قواعد البيانات إلى المعالجة الموزعة والتدفقات الحية. مثالي لمهندسي الباك-اند والذين يريدون فهم عميق لأسس أنظمة البيانات الحديثة.',
    publisher:'O\'Reilly', year:2017, pages:616, language:'إنجليزي', isbn:'978-1449373320', stock:20, sold:780 },
];

const mockReviews = [
  { _id:'r1', user:{ name:'أحمد محمد'  }, rating:5, text:'كتاب استثنائي غيّر طريقة تفكيري في البرمجة تماماً. أنصح به كل مطوّر.',   date:'2025-02-10', helpful:24 },
  { _id:'r2', user:{ name:'سارة عبدالله'}, rating:4, text:'محتوى رائع ومليء بالمعلومات المفيدة. الأمثلة عملية ومنطقية. أنصح به.',    date:'2025-01-28', helpful:12 },
  { _id:'r3', user:{ name:'محمد خالد'  }, rating:5, text:'قرأته مرتين وفي كل مرة أكتشف حاجة جديدة. من أفضل ما قرأت في تطوير الذات.', date:'2025-03-05', helpful:8  },
];

/* ══════════════════════════════════════════════
   LOAD PRODUCT
══════════════════════════════════════════════ */
async function loadProduct() {
  const id = getParam('id');
  if (!id) { window.location.href = 'products.html'; return; }

  try {
    const data = await productsAPI.getById(id);
    product = data.data || data;
  } catch {
    product = mockProducts.find(p => p._id === id) || mockProducts[0];
  }

  document.getElementById('pageLoading').classList.add('hidden');
  document.getElementById('mainContent').classList.remove('hidden');

  renderProduct();
  renderReviews(mockReviews);
  renderRelated();
}

/* ══════════════════════════════════════════════
   RENDER PRODUCT
══════════════════════════════════════════════ */
function renderProduct() {
  const p = product;
  const catMap = { programming:'برمجة', productivity:'إدارة الوقت', selfdev:'تطوير الذات', design:'تصميم', business:'أعمال', data:'بيانات وذكاء اصطناعي' };

  // Page title
  document.title = `${p.title} — ثقف`;

  // Breadcrumb
  document.getElementById('breadcrumbTitle').textContent = p.title;

  // Cover
  const cover = document.getElementById('productCover');
  cover.style.background = getCover(p.category, p.id);
  document.getElementById('coverTitle').textContent = p.title;

  // Badges on cover
  const badges = [];
  if (p.oldPrice) {
    const disc = Math.round((1 - p.price / p.oldPrice) * 100);
    badges.push(`<span class="badge badge-danger">خصم ${disc}%</span>`);
  }
  if (p.isNew) badges.push(`<span class="badge badge-success">وصل حديثاً</span>`);
  document.getElementById('coverBadges').innerHTML = badges.join('');

  // Category
  document.getElementById('productCat').textContent = catMap[p.category] || p.category || 'عام';

  // Title & author
  document.getElementById('productTitle').textContent = p.title;
  document.getElementById('productAuthor').innerHTML = `<span>${p.author || 'غير محدد'}</span>`;

  // Stars
  const stars = '★'.repeat(Math.round(p.rating || 4)) + '☆'.repeat(5 - Math.round(p.rating || 4));
  document.getElementById('productStars').textContent = stars;
  document.getElementById('productRatingScore').textContent = (p.rating || 4).toFixed(1);
  document.getElementById('productReviewCount').textContent = `(${p.reviews || 0} تقييم)`;
  document.getElementById('productSoldCount').textContent   = `${(p.sold || 0).toLocaleString('ar-EG')} نسخة مباعة`;
  document.getElementById('tabReviewCount').textContent     = p.reviews || 0;

  // Price
  document.getElementById('productPrice').textContent = formatPrice(p.price, 'EGP');
  if (p.oldPrice) {
    document.getElementById('productOldPrice').textContent = formatPrice(p.oldPrice, 'EGP');
    const disc = Math.round((1 - p.price / p.oldPrice) * 100);
    document.getElementById('productDiscount').textContent = `وفّر ${disc}%`;
    document.getElementById('productDiscount').classList.remove('hidden');
  }

  // Stock
  const stockEl   = document.getElementById('stockBadge');
  const stockText = document.getElementById('stockText');
  const stock = p.stock ?? 50;
  if (stock === 0) {
    stockEl.className = 'stock-badge stock-out';
    stockText.textContent = 'غير متوفر حالياً';
    document.getElementById('addCartBtn').disabled = true;
  } else if (stock <= 5) {
    stockEl.className = 'stock-badge stock-low';
    stockText.textContent = `تبقّى ${stock} نسخ فقط!`;
  } else {
    stockEl.className = 'stock-badge stock-in';
    stockText.textContent = 'متوفر في المخزون';
  }

  // Description
  const desc = p.description || 'لا يوجد وصف متاح لهذا الكتاب حالياً.';
  document.getElementById('productDesc').textContent = desc;
  document.getElementById('fullDesc').textContent    = desc;

  // Specs (cover + detail tab)
  const specData = [
    ['الناشر',      p.publisher || '—'],
    ['سنة النشر',   p.year      || '—'],
    ['عدد الصفحات', p.pages ? `${p.pages} صفحة` : '—'],
    ['اللغة',       p.language  || 'إنجليزي'],
    ['ISBN',        p.isbn      || '—'],
    ['الفئة',       catMap[p.category] || p.category || '—'],
    ['الحالة',      stock > 0 ? 'متوفر' : 'غير متوفر'],
  ];

  document.getElementById('specPublisher').textContent = p.publisher || '—';
  document.getElementById('specYear').textContent      = p.year      || '—';
  document.getElementById('specPages').textContent     = p.pages ? `${p.pages} صفحة` : '—';
  document.getElementById('specLang').textContent      = p.language  || 'إنجليزي';
  document.getElementById('specISBN').textContent      = p.isbn      || '—';

  document.getElementById('detailsSpecs').innerHTML = specData.map(([label, val]) => `
    <div class="spec-row">
      <span class="spec-label">${label}</span>
      <span class="spec-value">${val}</span>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   REVIEWS
══════════════════════════════════════════════ */
function renderReviews(reviews) {
  const p = product;
  const score = p.rating || 4.8;

  // Big score
  document.getElementById('revScoreBig').textContent  = score.toFixed(1);
  document.getElementById('revStarsBig').textContent  = '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score));

  // Rating bars (simulated distribution)
  const dist = [
    { stars: 5, pct: 68 },
    { stars: 4, pct: 20 },
    { stars: 3, pct: 7  },
    { stars: 2, pct: 3  },
    { stars: 1, pct: 2  },
  ];
  document.getElementById('ratingBars').innerHTML = dist.map(d => `
    <div class="rating-bar-row">
      <span>${d.stars}★</span>
      <div class="rating-bar-track">
        <div class="rating-bar-fill" style="width:${d.pct}%"></div>
      </div>
      <span>${d.pct}%</span>
    </div>`).join('');

  // Review list
  if (!reviews || !reviews.length) {
    document.getElementById('noReviews').classList.remove('hidden');
    return;
  }

  document.getElementById('reviewsList').innerHTML = reviews.map((r, i) => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const initials = r.user?.name?.charAt(0) || 'م';
    return `
    <div class="review-card" style="animation-delay:${i*.07}s">
      <div class="review-header">
        <div class="review-avatar">${initials}</div>
        <div>
          <div class="review-name">${r.user?.name || 'مجهول'}</div>
          <div class="review-stars">${stars}</div>
        </div>
        <div class="review-date">${formatDate(r.date || new Date())}</div>
      </div>
      <p class="review-text">${r.text}</p>
      <div class="review-helpful">
        مفيد؟
        <button class="helpful-btn" onclick="markHelpful(this, '${r.id}')">
          <i class="fa-regular fa-thumbs-up"></i> نعم (${r.helpful || 0})
        </button>
      </div>
    </div>`;
  }).join('');

  // Hide write-review if not logged in
  if (!authIsLoggedIn()) {
    document.getElementById('writeReviewBox').innerHTML = `
      <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:.88rem">
        <a href="/pages/auth/login.html" style="color:var(--brand-500);font-weight:600">سجّل دخولك</a>
        لإضافة تقييم
      </div>`;
  }
}

/* ══════════════════════════════════════════════
   RELATED BOOKS
══════════════════════════════════════════════ */
function renderRelated() {
  const catMap = { programming:'برمجة', productivity:'إدارة الوقت', selfdev:'تطوير الذات', design:'تصميم', business:'أعمال', data:'بيانات' };
  const related = mockProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const fallback = related.length >= 2 ? related : mockProducts.filter(p => p.id !== product.id).slice(0, 4);

  document.getElementById('relatedGrid').innerHTML = fallback.map((b, i) => `
    <div class="related-card" style="animation-delay:${i*.06}s" onclick="window.location.href='product-detail.html?id=${b.id}'">
      <div class="related-cover" style="background:${getCover(b.category, b.id)}">
        <i class="fa-solid fa-book-open"></i>
        ${b.title}
      </div>
      <div class="related-body">
        <div class="book-cat" style="font-size:.68rem;margin-bottom:4px">${catMap[b.category]||b.category}</div>
        <div class="related-title">${b.title}</div>
        <div class="related-author">${b.author || ''}</div>
        <div class="related-price">${formatPrice(b.price,'EGP')}</div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   INTERACTIONS
══════════════════════════════════════════════ */

/* Qty */
function changeQty(delta) {
  qty = Math.max(1, Math.min(qty + delta, 10));
  document.getElementById('qtyDisplay').textContent = qty;
  document.getElementById('qtyMinus').disabled = qty === 1;
  document.getElementById('qtyPlus').disabled  = qty === 10;
}

/* Add to cart */
async function addToCart() {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً لإضافة منتجات للعربة', 'info');
    setTimeout(() => window.location.href = '/pages/auth/login.html', 1200);
    return;
  }
  const btn = document.getElementById('addCartBtn');
  setButtonLoading(btn, true);
  try {
    await cartAPI.add({ productId: product.id, quantity: qty });
    const count = parseInt(localStorage.getItem('thaqaf_cart_count') || '0') + qty;
    localStorage.setItem('thaqaf_cart_count', count);
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = count; badge.style.display = 'flex'; }
    showToast(`تمت إضافة ${qty > 1 ? qty + ' نسخ' : 'الكتاب'} للعربة ✓`, 'success');
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error');
  }
  setButtonLoading(btn, false);
}

/* Buy now */
function buyNow() {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً', 'info');
    setTimeout(() => window.location.href = '/pages/auth/login.html', 1200);
    return;
  }
  localStorage.setItem('thaqaf_buynow', JSON.stringify({ productId: product.id, quantity: qty }));
  window.location.href = '/pages/cart/checkout.html?buynow=1';
}

/* Wishlist */
function toggleWishlist() {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً', 'info');
    return;
  }
  inWishlist = !inWishlist;
  const btn  = document.getElementById('wishlistBtn');
  const icon = btn.querySelector('i');
  if (inWishlist) {
    icon.className = 'fa-solid fa-heart';
    btn.classList.add('active');
    showToast('أُضيف للمفضلة ♥', 'success');
  } else {
    icon.className = 'fa-regular fa-heart';
    btn.classList.remove('active');
    showToast('حُذف من المفضلة', 'info');
  }
}

/* Share */
function shareProduct() {
  if (navigator.share) {
    navigator.share({ title: product.name, url: window.location.href });
  } else {
    navigator.clipboard?.writeText(window.location.href);
    showToast('تم نسخ رابط الكتاب', 'info');
  }
}

/* Read more toggle */
function toggleDesc() {
  const desc = document.getElementById('productDesc');
  const btn  = document.getElementById('readMoreBtn');
  descExpanded = !descExpanded;
  if (descExpanded) {
    desc.classList.remove('collapsed');
    btn.innerHTML = 'إخفاء <i class="fa-solid fa-chevron-up"></i>';
  } else {
    desc.classList.add('collapsed');
    btn.innerHTML = 'قراءة المزيد <i class="fa-solid fa-chevron-down"></i>';
  }
}

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `tab-${tabId}`));
}

/* ══════════════════════════════════════════════
   STAR PICKER
══════════════════════════════════════════════ */
document.querySelectorAll('.star-pick').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = +star.dataset.v;
    document.querySelectorAll('.star-pick').forEach(s => {
      s.classList.toggle('lit', +s.dataset.v <= selectedRating);
    });
  });
  star.addEventListener('mouseenter', () => {
    const hov = +star.dataset.v;
    document.querySelectorAll('.star-pick').forEach(s => {
      s.style.color = +s.dataset.v <= hov ? 'var(--accent)' : 'var(--gray-200)';
    });
  });
  star.addEventListener('mouseleave', () => {
    document.querySelectorAll('.star-pick').forEach(s => {
      s.style.color = '';
    });
  });
});

/* Submit review */
function submitReview() {
  if (!authIsLoggedIn()) {
    showToast('سجّل دخولك أولاً', 'info');
    return;
  }
  if (!selectedRating) {
    showToast('اختر عدد النجوم أولاً', 'error');
    return;
  }
  const text = document.getElementById('reviewText').value.trim();
  if (!text) {
    showToast('اكتب تقييمك أولاً', 'error');
    return;
  }
  const user = authUser();
  const newReview = {
    _id: 'new-' + Date.now(),
    user: { name: user?.name || 'أنت' },
    rating: selectedRating,
    text,
    date: new Date().toISOString(),
    helpful: 0,
  };
  // Prepend to list
  const stars = '★'.repeat(newReview.rating) + '☆'.repeat(5 - newReview.rating);
  const card  = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar">${newReview.user.name.charAt(0)}</div>
      <div>
        <div class="review-name">${newReview.user.name}</div>
        <div class="review-stars">${stars}</div>
      </div>
      <div class="review-date">الآن</div>
    </div>
    <p class="review-text">${newReview.text}</p>`;
  document.getElementById('reviewsList').prepend(card);
  document.getElementById('noReviews').classList.add('hidden');
  document.getElementById('reviewText').value = '';
  selectedRating = 0;
  document.querySelectorAll('.star-pick').forEach(s => s.classList.remove('lit'));
  showToast('تم نشر تقييمك! شكراً ✓', 'success');
}

/* Helpful */
function markHelpful(btn, reviewId) {
  btn.disabled = true;
  btn.style.borderColor = 'var(--brand-300)';
  btn.style.color = 'var(--brand-500)';
  showToast('شكراً على تفاعلك!', 'info');
}

/* ══════════════════════════════════════════════
   NAVBAR SEARCH
══════════════════════════════════════════════ */
document.getElementById('navSearchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    window.location.href = `products.html?q=${encodeURIComponent(e.target.value.trim())}`;
  }
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
loadProduct();
