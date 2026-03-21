/* =============================================
   TIMELESS — products.js
   Product loading, filtering, rendering, modal
   ============================================= */

import { Cart, Wishlist } from './cart.js';
import { formatPrice, renderStars, debounce, Toast } from './utils.js';

let allProducts = [];
let filteredProducts = [];

// ---- Fetch Products ----
export async function loadProducts() {
  if (allProducts.length > 0) return allProducts;

  // Try multiple paths to handle different deployment scenarios
  const paths = [
    'data/products.json',
    '../data/products.json'
  ];

  let res = null;
  for (const path of paths) {
    try {
      res = await fetch(path);
      if (res.ok) break;
    } catch (e) {
      console.warn(`Failed to fetch from ${path}:`, e);
    }
  }

  if (!res || !res.ok) {
    throw new Error('Failed to load products from any path');
  }
  
  allProducts = await res.json();
  filteredProducts = [...allProducts];
  return allProducts;
}

// ---- Render a single product card ----
export function renderProductCard(product, opts = {}) {
  const { featured = false } = opts;
  const wishlisted = Wishlist.has(product.id);
  const badge = product.badge
    ? `<div class="product-badge ${product.badge}">${product.badge}</div>`
    : '';

  return `
    <div class="product-card reveal" data-id="${product.id}">
      <div class="product-img-wrap">
        ${badge}
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-actions">
          <button class="product-action-btn wishlist-btn ${wishlisted ? 'wishlisted' : ''}"
            onclick="toggleWishlist(event, ${product.id})" aria-label="Wishlist" title="Add to Wishlist">
            ${wishlisted ? '❤️' : '🤍'}
          </button>
          <button class="product-action-btn" onclick="openModal(${product.id})" aria-label="Quick view" title="Quick View">
            👁
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-type">${product.type}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-brand">${product.brand}</div>
        <div class="product-rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price"><span>$</span>${product.price}</div>
          <button class="add-cart-btn" onclick="addToCart(event, ${product.id})" aria-label="Add to cart" title="Add to Cart">
            🛒
          </button>
        </div>
      </div>
    </div>
  `;
}

// ---- Render skeleton loaders ----
export function renderSkeletons(container, count = 8) {
  container.innerHTML = Array(count).fill('').map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-content">
        <div class="skeleton skeleton-line shorter"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line shorter" style="margin-top:16px"></div>
      </div>
    </div>
  `).join('');
}

// ---- Render products grid ----
export function renderProducts(products, container, append = false) {
  if (!container) return;

  if (products.length === 0 && !append) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px">
        <div style="font-size:3rem;margin-bottom:16px">🔍</div>
        <div style="font-family:var(--font-display);font-size:2rem;margin-bottom:12px">NO RESULTS</div>
        <div style="color:var(--text2)">Try adjusting your filters or search term</div>
      </div>
    `;
    return;
  }

  const html = products.map(p => renderProductCard(p)).join('');
  
  if (append) {
    container.innerHTML += html;
  } else {
    container.innerHTML = html;
  }

  // Trigger reveal animation
  requestAnimationFrame(() => {
    container.querySelectorAll('.reveal:not(.visible)').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 50);
    });
  });
}

// ---- Product Modal ----
export function openProductModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const overlay = document.getElementById('productModal');
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${product.name}">
      <button class="modal-close" id="modalClose" aria-label="Close modal">✕</button>
      <div class="modal-inner">
        <div class="modal-img-wrap">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="modal-body">
          ${product.badge ? `<div class="modal-badge">${product.badge}</div>` : ''}
          <div class="modal-type">${product.type}</div>
          <div class="modal-name">${product.name}</div>
          <div class="modal-brand">by ${product.brand}</div>
          <div class="modal-rating">
            <span class="stars" style="font-size:1rem">${renderStars(product.rating)}</span>
            <span>${product.rating} · ${product.reviews} reviews</span>
          </div>
          <div class="modal-desc">${product.description}</div>
          <div class="modal-specs">
            <div class="spec-item">
              <div class="spec-label">Type</div>
              <div class="spec-value">${product.type.charAt(0).toUpperCase() + product.type.slice(1)}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Brand</div>
              <div class="spec-value">${product.brand}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Water Resistant</div>
              <div class="spec-value">50m</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Warranty</div>
              <div class="spec-value">2 Years</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Case Size</div>
              <div class="spec-value">42mm</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">Crystal</div>
              <div class="spec-value">Sapphire</div>
            </div>
          </div>
          <div class="modal-price-row">
            <div class="modal-price">${formatPrice(product.price)}</div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--success)">✓ IN STOCK</div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary btn-lg" onclick="addToCart(null,${product.id})" id="modalAddCart">
              🛒 Add to Cart
            </button>
            <button class="btn btn-secondary wishlist-btn ${Wishlist.has(product.id) ? 'active' : ''}"
              onclick="toggleWishlist(null,${product.id})" id="modalWishlist" title="Wishlist">
              ${Wishlist.has(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Close handlers
  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // Keyboard close
  const onKey = e => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
}

function closeModal() {
  const overlay = document.getElementById('productModal');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ---- Filter & Sort Engine ----
export class FilterEngine {
  constructor() {
    this.filters = {
      search: '',
      brands: [],
      types: [],
      minPrice: 0,
      maxPrice: 2000,
      sort: 'default'
    };
  }

  setSearch(q) { this.filters.search = q.toLowerCase(); }
  setBrands(brands) { this.filters.brands = brands; }
  setTypes(types) { this.filters.types = types; }
  setPrice(min, max) { this.filters.minPrice = min; this.filters.maxPrice = max; }
  setSort(sort) { this.filters.sort = sort; }

  apply(products) {
    let result = [...products];

    // Search
    if (this.filters.search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(this.filters.search) ||
        p.brand.toLowerCase().includes(this.filters.search) ||
        p.description.toLowerCase().includes(this.filters.search)
      );
    }

    // Brands
    if (this.filters.brands.length > 0) {
      result = result.filter(p => this.filters.brands.includes(p.brand));
    }

    // Types
    if (this.filters.types.length > 0) {
      result = result.filter(p => this.filters.types.includes(p.type));
    }

    // Price
    result = result.filter(p =>
      p.price >= this.filters.minPrice && p.price <= this.filters.maxPrice
    );

    // Sort
    switch (this.filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return result;
  }
}

// ---- Expose globals for inline event handlers ----
window.openModal = (id) => openProductModal(id);

window.addToCart = (e, id) => {
  if (e) e.stopPropagation();
  const product = allProducts.find(p => p.id === id);
  if (product) {
    Cart.add(product);
    // Button animation
    if (e && e.currentTarget) {
      const btn = e.currentTarget;
      btn.style.transform = 'scale(1.3) rotate(15deg)';
      setTimeout(() => { btn.style.transform = ''; }, 300);
    }
  }
};

window.toggleWishlist = (e, id) => {
  if (e) e.stopPropagation();
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const added = Wishlist.toggle(product);

  // Update all wishlist buttons for this product
  document.querySelectorAll(`.wishlist-btn[onclick*="${id}"]`).forEach(btn => {
    btn.classList.toggle('wishlisted', added);
    btn.innerHTML = added ? '❤️' : '🤍';
  });
};

// Export for external use
export { allProducts, filteredProducts };
