initNavbar('cart');

const cartItemsContainer = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const cartLayout = document.querySelector('.cart-layout');


async function loadCart() {

  try {

    const response = await cartAPI.view();

    const cart = response.data;

    if (!cart || !cart.Products || cart.Products.length === 0) {
      showEmptyCart();
      return;
    }

    renderCart(cart.Products);
    updateSummary(cart.Products);

  } catch (error) {

    console.error(error);
    showToast('فشل تحميل العربة', 'error');

  }

}


function renderCart(products) {

  cartItemsContainer.innerHTML = products.map(product => {

    const quantity = product.OrderProduct?.quantity || 1;
    const total = product.price * quantity;

    return `

      <div class="cart-item" data-id="${product.id}">

        <div class="cart-item-image">
          <i class="fa-solid fa-book"></i>
          ${product.name}
        </div>

        <div class="cart-item-content">

          <div class="cart-category">
            ${product.category || 'Programming'}
          </div>

          <h3 class="cart-title">${product.name}</h3>

          <div class="cart-author">
            ${product.author || 'Unknown Author'}
          </div>

          <div class="cart-bottom">

            <div class="cart-price">
              ${formatPrice(total, 'EGP')}
            </div>

            <div style="display:flex;align-items:center;gap:10px;">

              <div class="quantity-box">

                <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">
                  <i class="fa-solid fa-minus"></i>
                </button>

                <div class="quantity-value" id="qty-${product.id}">
                  ${quantity}
                </div>

                <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">
                  <i class="fa-solid fa-plus"></i>
                </button>

              </div>

              <button class="remove-btn" onclick="removeItem(${product.id})">
                <i class="fa-regular fa-trash-can"></i>
              </button>

            </div>

          </div>

        </div>

      </div>

    `;

  }).join('');

}


function updateSummary(products) {

  const items = products.reduce((acc, item) => {
    return acc + (item.OrderProduct?.quantity || 1);
  }, 0);

  const total = products.reduce((acc, item) => {

    const qty = item.OrderProduct?.quantity || 1;

    return acc + (item.price * qty);

  }, 0);

  document.getElementById('summaryItems').textContent = items;

  document.getElementById('summarySubtotal').textContent = formatPrice(total, 'EGP');

  document.getElementById('summaryTotal').textContent = formatPrice(total, 'EGP');


  const badge = document.getElementById('cartBadge');

  badge.textContent = items;

  localStorage.setItem('thaqaf_cart_count', items);

}


function showEmptyCart() {

  cartLayout.classList.add('hidden');
  emptyCart.classList.remove('hidden');

}


async function changeQuantity(productId, change) {

  try {

    // TODO: replace with backend endpoint

    const qtyElement = document.getElementById(`qty-${productId}`);

    let currentQty = Number(qtyElement.textContent);

    currentQty += change;

    if (currentQty <= 0) {
      return removeItem(productId);
    }

    qtyElement.textContent = currentQty;

    showToast('تم تحديث الكمية', 'success');

  } catch (error) {

    showToast('فشل تحديث الكمية', 'error');

  }

}


async function removeItem(productId) {

  try {

    // TODO: replace with backend endpoint

    const item = document.querySelector(`[data-id="${productId}"]`);

    item.style.opacity = '.4';
    item.style.transform = 'scale(.95)';

    setTimeout(() => {

      item.remove();

      if (!document.querySelector('.cart-item')) {
        showEmptyCart();
      }

    }, 250);


    showToast('تم حذف المنتج من العربة', 'success');

  } catch (error) {

    showToast('حدث خطأ أثناء الحذف', 'error');

  }

}


document.getElementById('checkoutBtn')?.addEventListener('click', () => {

  showToast('سيتم تحويلك لصفحة الدفع قريبًا', 'info');

});



document.getElementById('clearCartBtn')?.addEventListener('click', () => {

  cartItemsContainer.innerHTML = '';

  showEmptyCart();

  showToast('تم حذف جميع المنتجات', 'success');

});


loadCart();