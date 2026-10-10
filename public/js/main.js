/**
 * Chaupal - Main Entry Point
 * Orchestrates initialization, header setup, festival banner, modals and navigation
 */

import { initTheme, toggleTheme, getTimeGreeting, getActiveIndianFestival, initRippleEffect, openModal, closeModal, showToast } from './ui.js';
import { checkAuthState, handleLogin, handleSignup, getCurrentUser } from './auth.js';
import { initFeed, loadFeed } from './feed.js';
import { initInteractions } from './interactions.js';
import { initProfile, loadUserProfile, closeProfileView } from './profile.js';
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Theme
  initTheme();
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // 2. Setup Indian Time Greeting
  setupTimeGreeting();

  // 3. Setup Indian Festival Banner
  setupFestivalBanner();

  // 4. Initialize Core Modules
  initRippleEffect();
  initProfile();
  initInteractions();

  // 5. Check Auth & Initialize Feed
  await checkAuthState();
  initFeed();

  // 6. Setup Modal Listeners & Navigation
  setupGlobalModals();
  setupMobileBottomNav();
});

function setupTimeGreeting() {
  const greetingEl = document.getElementById('header-greeting');
  if (!greetingEl) return;

  const greeting = getTimeGreeting();
  greetingEl.innerHTML = `
    <span>${greeting.icon}</span>
    <span class="hindi-text" style="font-weight: 700;">${greeting.devanagari}</span>
    <span style="font-size: 0.75rem; color: var(--text-secondary);">(${greeting.translit})</span>
  `;
}

function setupFestivalBanner() {
  const bannerContainer = document.getElementById('festival-banner-container');
  if (!bannerContainer) return;

  const festival = getActiveIndianFestival();
  bannerContainer.innerHTML = `
    <div class="festival-banner">
      <div>
        <div class="festival-badge"><i class="fa-solid fa-sparkles"></i> Indian Festivity</div>
        <div class="festival-title">${festival.name} · <span class="hindi-text" style="font-weight: 700; color: var(--saffron-700);">${festival.hindi}</span></div>
        <div class="festival-message">${festival.desc}</div>
      </div>
      <button id="btn-festival-dismiss" title="Dismiss" style="color: var(--text-muted); padding: 0.25rem 0.5rem; font-size: 0.9rem;">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `;

  document.getElementById('btn-festival-dismiss')?.addEventListener('click', () => {
    bannerContainer.style.display = 'none';
  });
}

function setupGlobalModals() {
  // Close modals on clicking overlay or close buttons
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      } );
    });
  });

  // Auth Modal Tab Switcher (Login vs Signup)
  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  const formLogin = document.getElementById('auth-form-login');
  const formSignup = document.getElementById('auth-form-signup');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup?.classList.remove('active');
    if (formLogin) formLogin.style.display = 'flex';
    if (formSignup) formSignup.style.display = 'none';
  });

  tabSignup?.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin?.classList.remove('active');
    if (formSignup) formSignup.style.display = 'flex';
    if (formLogin) formLogin.style.display = 'none';
  });

  // Login Form Submit
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const submitBtn = formLogin.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Login ho raha hai...';
    }

    try {
      await handleLogin(identifier, password);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Chaupal me Pravesh Karein';
      }
    }
  });

  // Signup Form Submit
  formSignup?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name')?.value.trim();
    const username = document.getElementById('signup-username')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const city = document.getElementById('signup-city')?.value.trim();
    const bio = document.getElementById('signup-bio')?.value.trim();

    const submitBtn = formSignup.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Account ban raha hai...';
    }

    try {
      await handleSignup({ name, username, email, password, city, bio });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Naya Sadasya Banein';
      }
    }
  });

  // Edit Post Modal Form
  const editPostForm = document.getElementById('edit-post-form');
  editPostForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = document.getElementById('edit-post-id')?.value;
    const content = document.getElementById('edit-post-textarea')?.value.trim();
    const imageUrl = document.getElementById('edit-post-image')?.value.trim();

    try {
      await api.updatePost(postId, { content, image_url: imageUrl || null });
      showToast('Post safalta se update ho gaya!', 'success');
      closeModal('edit-post-modal');
      loadFeed();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function setupMobileBottomNav() {
  const homeBtn = document.getElementById('mobile-nav-home');
  const exploreBtn = document.getElementById('mobile-nav-explore');
  const createBtn = document.getElementById('mobile-nav-create');
  const profileBtn = document.getElementById('mobile-nav-profile');

  const navBtns = [homeBtn, exploreBtn, profileBtn];

  function setActiveNav(btn) {
    navBtns.forEach(b => b?.classList.remove('active'));
    btn?.classList.add('active');
  }

  homeBtn?.addEventListener('click', () => {
    setActiveNav(homeBtn);
    closeProfileView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadFeed();
  });

  exploreBtn?.addEventListener('click', () => {
    setActiveNav(exploreBtn);
    closeProfileView();
    // Switch to explore tab
    const exploreTab = document.querySelector('.feed-tab-btn[data-tab="all"]');
    if (exploreTab) exploreTab.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  createBtn?.addEventListener('click', () => {
    closeProfileView();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      openModal('auth-modal');
      return;
    }
    const composer = document.getElementById('composer-textarea');
    if (composer) {
      composer.focus();
      composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  profileBtn?.addEventListener('click', () => {
    setActiveNav(profileBtn);
    const currentUser = getCurrentUser();
    if (currentUser) {
      loadUserProfile(currentUser.username);
    } else {
      openModal('auth-modal');
    }
  });
}
