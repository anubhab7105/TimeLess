/* =============================================
   TIMELESS — cart.js
   Cart state management using localStorage
   ============================================= */

import { Toast, formatPrice } from './utils.js';

const CART_KEY = 'timeless-cart';
const WISHLIST_KEY = 'timeless-wishlist';

// ---- Cart Store ----
export const Cart = {
  // Get all items
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  // Save items
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateUI();
  },

  // Add product (or increase qty)
  add(product, qty = 1) {
    const items = this.getItems();
    const existing = items.find(i => i.id === product.id);

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 10);
      Toast.show(`Updated quantity in cart`, 'cart');
    } else {
      items.push({ ...product, qty });
      Toast.show(`${product.name} added to cart!`, 'cart');
    }

    this.save(items);
    this.animateBadge();
  },

  // Remove item
  remove(productId) {
    const items = this.getItems().filter(i => i.id !== productId);
    this.save(items);
    Toast.show('Item removed from cart', 'info');
  },

  // Update quantity
  updateQty(productId, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (!item) return;

    if (qty <= 0) {
      this.remove(productId);
      return;
    }

    item.qty = Math.min(qty, 10);
    this.save(items);
  },

  // Clear entire cart
  clear() {
    localStorage.removeItem(CART_KEY);
    this.updateUI();
  },

  // Get total item count
  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.qty, 0);
  },

  // Get subtotal
  getSubtotal() {
    return this.getItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  // Get shipping (free over $300)
  getShipping() {
    const sub = this.getSubtotal();
    return sub === 0 ? 0 : sub >= 300 ? 0 : 15;
  },

  // Get total
  getTotal() {
    return this.getSubtotal() + this.getShipping();
  },

  // Update badge in navbar
  updateUI() {
    const count = this.getCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('visible', count > 0);
    });
  },

  // Animate badge on add
  animateBadge() {
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.classList.remove('bump');
      void badge.offsetWidth; // reflow
      badge.classList.add('bump');
    });
  },

  // Check if in cart
  has(productId) {
    return this.getItems().some(i => i.id === productId);
  }
};

// ---- Wishlist Store ----
export const Wishlist = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    this.updateUI();
  },

  toggle(product) {
    const items = this.get();
    const idx = items.findIndex(i => i.id === product.id);

    if (idx === -1) {
      items.push(product);
      Toast.show(`${product.name} added to wishlist!`, 'heart');
    } else {
      items.splice(idx, 1);
      Toast.show('Removed from wishlist', 'info');
    }

    this.save(items);
    return idx === -1; // returns true if added
  },

  has(productId) {
    return this.get().some(i => i.id === productId);
  },

  updateUI() {
    const count = this.get().length;
    document.querySelectorAll('.wishlist-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('visible', count > 0);
    });
  }
};

// ---- Render Cart Items (for cart.html) ----
export function renderCartPage() {
  const container = document.getElementById('cartItems');
  const emptyState = document.getElementById('emptyCart');
  if (!container) return;

  const items = Cart.getItems();

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    updateSummary();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}" id="cart-item-${item.id}">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-brand">${item.brand}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-type">${item.type}</div>
        <div style="margin-top:12px">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)" aria-label="Decrease">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="Increase">+</button>
          </div>
        </div>
        <button class="remove-btn mt-16" onclick="removeItem(${item.id})">✕ Remove</button>
      </div>
      <div class="cart-item-right">
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        <div style="font-size:0.75rem;color:var(--text3)">${formatPrice(item.price)} each</div>
      </div>
    </div>
  `).join('');

  updateSummary();
}

function updateSummary() {
  const subtotal = Cart.getSubtotal();
  const shipping = Cart.getShipping();
  const total = Cart.getTotal();

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('summarySubtotal', formatPrice(subtotal));
  set('summaryShipping', shipping === 0 ? (subtotal > 0 ? 'FREE' : '$0') : formatPrice(shipping));
  set('summaryTotal', formatPrice(total));
  set('summaryItemCount', `${Cart.getCount()} item${Cart.getCount() !== 1 ? 's' : ''}`);
}

// ---- Expose globals for inline handlers ----
window.changeQty = (id, delta) => {
  const items = Cart.getItems();
  const item = items.find(i => i.id === id);
  if (item) Cart.updateQty(id, item.qty + delta);
  renderCartPage();
};

window.removeItem = (id) => {
  Cart.remove(id);
  renderCartPage();
};
