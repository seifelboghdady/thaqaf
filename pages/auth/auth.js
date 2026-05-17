/**
 * auth.js (pages/auth) — Login & Register logic for ثقف
 */

/* ── Redirect if already logged in ─────────── */
redirectIfLoggedIn();

const isLoginPage = window.location.pathname.includes('login');

/* ══════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════ */
if (isLoginPage) {

  const form       = document.getElementById('loginForm');
  const submitBtn  = document.getElementById('submitBtn');
  const togglePass = document.getElementById('togglePassword');
  const eyeIcon    = document.getElementById('eyeIcon');
  const passInput  = document.getElementById('password');

  /* Toggle password visibility */
  togglePass?.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeIcon.className = isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });

  /* Clear errors on input */
  document.getElementById('email')?.addEventListener('input', () => clearFieldError('email'));
  passInput?.addEventListener('input', () => clearFieldError('password'));

  /* Form submit */
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = passInput.value;
    let   valid    = true;

    if (!email) {
      showFieldError('email', 'الرجاء إدخال البريد الإلكتروني');
      valid = false;
    } else if (!isValidEmail(email)) {
      showFieldError('email', 'البريد الإلكتروني غير صحيح');
      valid = false;
    }
    if (!password) {
      showFieldError('password', 'الرجاء إدخال كلمة المرور');
      valid = false;
    }
    if (!valid) return;

    setButtonLoading(submitBtn, true);

    try {
      const res = await authAPI.login({ email, password });

      /* توقّع الـ response يكون { token, user } */
      authSave(res.token, res.user);
      showToast('مرحبًا بعودتك! 👋', 'success');

      setTimeout(() => {
        window.location.href = '/pages/homepage/index.html';
      }, 800);

    } catch (err) {
      showToast(err.message || 'بيانات الدخول غير صحيحة', 'error');
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ══════════════════════════════════════════════
   REGISTER PAGE
══════════════════════════════════════════════ */
if (!isLoginPage) {

  let currentStep = 1;

  const form         = document.getElementById('registerForm');
  const nextBtn      = document.getElementById('nextBtn');
  const backBtn      = document.getElementById('backBtn');
  const submitRegBtn = document.getElementById('submitRegBtn');

  /* ── Password toggle ── */
  document.getElementById('toggleReg')?.addEventListener('click', () => {
    const p = document.getElementById('regPassword');
    const isHidden = p.type === 'password';
    p.type = isHidden ? 'text' : 'password';
    document.getElementById('eyeReg').className =
      isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });

  /* ── Password strength ── */
  document.getElementById('regPassword')?.addEventListener('input', (e) => {
    const val  = e.target.value;
    const fill = document.getElementById('strengthFill');
    const lbl  = document.getElementById('strengthLabel');

    let score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { pct: '0%',   color: '',                     label: '' },
      { pct: '25%',  color: 'var(--danger)',         label: 'ضعيفة' },
      { pct: '50%',  color: 'var(--warning)',        label: 'متوسطة' },
      { pct: '75%',  color: 'var(--brand-400)',      label: 'جيدة' },
      { pct: '100%', color: 'var(--success)',        label: 'ممتازة' },
    ];
    const level = levels[score];
    fill.style.width      = level.pct;
    fill.style.background = level.color;
    lbl.textContent       = level.label;
    lbl.style.color       = level.color;
  });

  /* ── Go to step 2 ── */
  nextBtn?.addEventListener('click', () => {
    const name  = document.getElementById('fullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    let valid = true;

    if (!name) {
      showFieldError('fullName', 'الرجاء إدخال اسمك الكامل');
      valid = false;
    } else {
      clearFieldError('fullName');
    }
    if (!email) {
      showFieldError('regEmail', 'الرجاء إدخال البريد الإلكتروني');
      valid = false;
    } else if (!isValidEmail(email)) {
      showFieldError('regEmail', 'البريد الإلكتروني غير صحيح');
      valid = false;
    } else {
      clearFieldError('regEmail');
    }
    if (!valid) return;

    goToStep(2);
  });

  /* ── Go back ── */
  backBtn?.addEventListener('click', () => goToStep(1));

  /* ── Step switcher ── */
  function goToStep(step) {
    currentStep = step;

    document.getElementById('step1').classList.toggle('active', step === 1);
    document.getElementById('step2').classList.toggle('active', step === 2);

    document.getElementById('stepNum1').className = 'step-num ' + (step === 1 ? 'active' : 'done');
    document.getElementById('stepNum2').className = 'step-num ' + (step === 2 ? 'active' : '');
    if (step === 2) document.getElementById('stepNum1').innerHTML = '<i class="fa-solid fa-check" style="font-size:.7rem"></i>';
    else document.getElementById('stepNum1').textContent = '1';

    document.getElementById('stepLine1').classList.toggle('done', step === 2);

    document.getElementById('stepLabel1').classList.toggle('active', step === 1);
    document.getElementById('stepLabel2').classList.toggle('active', step === 2);
  }

  /* ── Submit ── */
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password  = document.getElementById('regPassword').value;
    const confirm   = document.getElementById('confirmPassword').value;
    const agreed    = document.getElementById('agreeTerms').checked;
    let   valid     = true;

    if (!password || password.length < 8) {
      showFieldError('regPassword', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      valid = false;
    } else {
      clearFieldError('regPassword');
    }
    if (password !== confirm) {
      showFieldError('confirmPassword', 'كلمتا المرور غير متطابقتين');
      valid = false;
    } else {
      clearFieldError('confirmPassword');
    }
    if (!agreed) {
      showToast('يجب الموافقة على الشروط والأحكام', 'error');
      valid = false;
    }
    if (!valid) return;

    setButtonLoading(submitRegBtn, true);

    const payload = {
      name:     document.getElementById('fullName').value.trim(),
      email:    document.getElementById('regEmail').value.trim(),
      phone:    document.getElementById('phone').value.trim() || undefined,
      password,
    };

    try {
      const res = await authAPI.register(payload);

      authSave(res.token, res.user);
      showToast('تم إنشاء حسابك بنجاح! 🎉', 'success');

      setTimeout(() => {
        window.location.href = '/pages/homepage/index.html';
      }, 900);

    } catch (err) {
      showToast(err.message || 'حدث خطأ، حاول مرة أخرى', 'error');
      setButtonLoading(submitRegBtn, false);
    }
  });

  /* Clear errors on input */
  ['fullName','regEmail','regPassword','confirmPassword'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });
}
