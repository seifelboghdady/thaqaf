requireAuth();

initNavbar('profile'); // تفعيل تلوين تبويب البروفايل

const user = authUser();

/* ─────────────────────────────
   User Data
───────────────────────────── */

if (user) {
  document.getElementById('profileName').textContent = user.name || 'مستخدم';
  document.getElementById('profileEmail').textContent = user.email || '';
  document.getElementById('fullName').value = user.name || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phone').value = user.phone || '';
  document.getElementById('city').value = user.city || '';

  const avatar = document.getElementById('profileAvatar');

  if (user.image) {
    avatar.innerHTML = `
      <img src="${user.image}" alt="avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />
    `;
  } else {
    avatar.textContent = (user.name || 'U')[0];
  }
}

/* ─────────────────────────────
   Tabs
───────────────────────────── */

const tabs = document.querySelectorAll('.sidebar-link');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

/* ─────────────────────────────
   Open File Picker
───────────────────────────── */

document.querySelector('.avatar-edit-btn')?.addEventListener('click', () => {
  document.getElementById('avatarInput').click();
});

/* ─────────────────────────────
   Image Preview
───────────────────────────── */

document.getElementById('avatarInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const avatar = document.getElementById('profileAvatar');
    avatar.innerHTML = `
      <img src="${reader.result}" alt="avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />
    `;
  };
  reader.readAsDataURL(file);
});

/* ─────────────────────────────
   Update Profile
───────────────────────────── */

document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
  try {
    const formData = new FormData();
    formData.append('name', document.getElementById('fullName').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('city', document.getElementById('city').value);

    const imageInput = document.getElementById('avatarInput');
    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]); // يطابق الباك إند تماماً
    }

    const response = await profileAPI.update(formData);
    
    // التعامل المرن مع الـ response سواء أرجع الكائن مباشرة أو ملف data داخل الـ object
    const updatedUser = response.data || response;

    localStorage.setItem('thaqaf_user', JSON.stringify(updatedUser));

    showToast('تم تحديث البيانات بنجاح ✓', 'success');
    
    // تشغيل الـ navbar مجدداً لالتقاط الصورة والاسم الجديدين فوراً
    initNavbar('profile'); 

  } catch (error) {
    showToast(error.message || 'حدث خطأ', 'error');
  }
});

/* ─────────────────────────────
   Update Password
───────────────────────────── */

document.querySelector('.save-btn.danger')?.addEventListener('click', async () => {
  try {
    const passwordInputs = document.querySelectorAll('#security input[type="password"]');
    const oldPassword = passwordInputs[0].value;
    const newPassword = passwordInputs[1].value;
    const confirmPassword = passwordInputs[2].value;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return showToast('يرجى ملء جميع الحقول', 'error');
    }

    if (newPassword !== confirmPassword) {
      return showToast('كلمتا المرور غير متطابقتين', 'error');
    }

    // إرسال المسميات المطابقة للـ Validation في الباك إند
    await profileAPI.updatePassword({
      currentPassword: oldPassword, 
      newPassword
    });

    passwordInputs.forEach(input => { input.value = ''; });
    showToast('تم تحديث كلمة المرور بنجاح ✓', 'success');

  } catch (error) {
    showToast(error.message || 'حدث خطأ', 'error');
  }
});