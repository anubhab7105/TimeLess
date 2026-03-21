/* =============================================
   TIMELESS — main.js
   App initialization, home page logic
   ============================================= */

import { ThemeManager, initReveal, setActiveNav, initScrollTop, initNavbar, initMobileMenu } from './utils.js';
import { Cart, Wishlist } from './cart.js';
import { loadProducts, renderProductCard, renderSkeletons } from './products.js';

// ---- App Init ----
document.addEventListener('DOMContentLoaded', async () => {
  // Theme
  ThemeManager.init();

  // Nav
  initNavbar();
  initMobileMenu();
  setActiveNav();

  // Cart & wishlist badges
  Cart.updateUI();
  Wishlist.updateUI();

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = ThemeManager.toggle();
      themeBtn.title = next === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      themeBtn.innerHTML = next === 'dark' ? '🌙' : '☀️';
    });
    const current = ThemeManager.get();
    themeBtn.innerHTML = current === 'dark' ? '🌙' : '☀️';
  }

  // Scroll top
  initScrollTop();

  // Animate hero on home
  animateHero();

  // Load featured products if on home page
  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid) {
    renderSkeletons(featuredGrid, 4);
    try {
      const products = await loadProducts();
      const featured = products.filter(p => p.badge).slice(0, 8);
      featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join('');
      requestAnimationFrame(() => {
        featuredGrid.querySelectorAll('.reveal').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 80);
        });
      });
    } catch (err) {
      featuredGrid.innerHTML = '<p style="color:var(--text2)">Failed to load products</p>';
    }
  }

  // New arrivals section
  const newGrid = document.getElementById('newArrivalsGrid');
  if (newGrid) {
    renderSkeletons(newGrid, 4);
    try {
      const products = await loadProducts();
      const newArr = products.filter(p => p.badge === 'NEW').slice(0, 4);
      newGrid.innerHTML = newArr.map(p => renderProductCard(p)).join('');
      requestAnimationFrame(() => {
        newGrid.querySelectorAll('.reveal').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 80);
        });
      });
    } catch {}
  }

  // Reveal observer
  initReveal();

  // Page fade-in
  document.body.classList.add('page-fade');

  // Product modal overlay must exist
  if (!document.getElementById('productModal')) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'productModal';
    document.body.appendChild(overlay);
  }
});

// ---- Hero Animation ----
function animateHero() {
  const title = document.querySelector('.hero-title');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const sub = document.querySelector('.hero-sub');
  const ctas = document.querySelector('.hero-ctas');
  const stats = document.querySelector('.hero-stats');

  const els = [eyebrow, title, sub, ctas, stats].filter(Boolean);
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    el.style.transitionDelay = `${i * 0.12}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
}

// ---- Marquee duplication ----
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
  }

  // Newsletter form
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = nlForm.querySelector('input');
      if (input && input.value) {
        import('./utils.js').then(({ Toast }) => {
          Toast.show('You\'re on the list! 🎉 Welcome to TimeLess', 'success', 4000);
        });
        input.value = '';
      }
    });
  }

  // Category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      const base = window.location.pathname.includes('/pages/') ? '' : 'pages/';
      window.location.href = `${base}shop.html${type ? '?type=' + type : ''}`;
    });
  });

  // Brand pills filter
  document.querySelectorAll('.brand-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const brand = pill.dataset.brand;
      const base = window.location.pathname.includes('/pages/') ? '' : 'pages/';
      window.location.href = `${base}shop.html${brand ? '?brand=' + brand : ''}`;
    });
  });
});
