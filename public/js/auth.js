/**
 * Chaupal - Authentication Module
 * Manages user sessions, login/signup flows, demo account switches
 */

import { api, setToken } from './api.js';
import { showToast, closeModal, openModal } from './ui.js';

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export async function checkAuthState() {
  try {
    const data = await api.getCurrentUser();
    currentUser = data.user;
    updateAuthUI();
    return currentUser;
  } catch (err) {
    currentUser = null;
    updateAuthUI();
    return null;
  }
}

export async function handleLogin(identifier, password) {
  try {
    const res = await api.login({ identifier, password });
    currentUser = res.user;
    if (res.token) {
      setToken(res.token);
    }
    showToast(res.message || `Namaste ${currentUser.name}!`, 'success');
    closeModal('auth-modal');
    updateAuthUI();
    window.dispatchEvent(new CustomEvent('chaupal:auth_changed', { detail: { user: currentUser } }));
    return currentUser;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

export async function handleSignup(formData) {
  try {
    const res = await api.signup(formData);
    currentUser = res.user;
    if (res.token) {
      setToken(res.token);
    }
    showToast(res.message || 'Chaupal par aapka swaagat hai!', 'success');
    closeModal('auth-modal');
    updateAuthUI();
    window.dispatchEvent(new CustomEvent('chaupal:auth_changed', { detail: { user: currentUser } }));
    return currentUser;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

export async function handleLogout() {
  try {
    await api.logout();
    setToken(null);
    currentUser = null;
    showToast('Aap safalta se logout ho gaye. Phir milenge! 👋', 'info');
    updateAuthUI();
    window.dispatchEvent(new CustomEvent('chaupal:auth_changed', { detail: { user: null } }));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function updateAuthUI() {
  const headerAuthSlot = document.getElementById('header-auth-slot');
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  const composerAvatar = document.getElementById('composer-avatar');
  const mobileNavProfileBtn = document.getElementById('mobile-nav-profile');

  if (currentUser) {
    // Header
    if (headerAuthSlot) {
      headerAuthSlot.innerHTML = `
        <div class="header-profile-menu" style="display: flex; align-items: center; gap: 0.6rem;">
          <button id="header-user-btn" class="header-user-badge" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; border-radius: var(--radius-full); background: var(--bg-elevated); border: 1px solid var(--border-subtle);">
            <img src="${currentUser.avatar}" alt="${currentUser.name}" class="user-avatar avatar-sm" />
            <span style="font-weight: 600; font-size: 0.85rem; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentUser.name.split(' ')[0]}</span>
          </button>
          <button id="btn-logout" class="btn-secondary" title="Logout" style="padding: 0.45rem 0.75rem; font-size: 0.8rem;">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      `;

      document.getElementById('header-user-btn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('chaupal:navigate_profile', { detail: { username: currentUser.username } }));
      });

      document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
    }

    // Sidebar
    if (sidebarUserCard) {
      sidebarUserCard.innerHTML = `
        <div class="c-card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="sidebar-profile-link">
            <img src="${currentUser.avatar}" alt="${currentUser.name}" class="user-avatar avatar-md" />
            <div style="min-width: 0;">
              <h4 style="font-size: 0.95rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${currentUser.name}</h4>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">@${currentUser.username}</p>
            </div>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${currentUser.bio || 'Chaupal sadasya'}
          </p>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; font-size: 0.78rem;">
            <div style="text-align: center;">
              <div style="font-weight: 700; color: var(--text-primary);">${currentUser.follower_count || 0}</div>
              <div style="color: var(--text-muted);">Followers</div>
            </div>
            <div style="text-align: center;">
              <div style="font-weight: 700; color: var(--text-primary);">${currentUser.following_count || 0}</div>
              <div style="color: var(--text-muted);">Following</div>
            </div>
            <div style="text-align: center;">
              <div style="font-weight: 700; color: var(--text-primary);">${currentUser.post_count || 0}</div>
              <div style="color: var(--text-muted);">Posts</div>
            </div>
          </div>
          <button id="sidebar-view-profile-btn" class="btn-outline-saffron" style="width: 100%; font-size: 0.82rem; padding: 0.4rem;">
            <i class="fa-regular fa-user"></i> Apni Profile Dekhein
          </button>
        </div>
      `;

      const viewProfile = () => {
        window.dispatchEvent(new CustomEvent('chaupal:navigate_profile', { detail: { username: currentUser.username } }));
      };
      document.getElementById('sidebar-profile-link')?.addEventListener('click', viewProfile);
      document.getElementById('sidebar-view-profile-btn')?.addEventListener('click', viewProfile);
    }

    if (composerAvatar) {
      composerAvatar.src = currentUser.avatar;
    }

  } else {
    // Logged out
    if (headerAuthSlot) {
      headerAuthSlot.innerHTML = `
        <button id="btn-open-auth" class="btn-primary" style="font-size: 0.85rem; padding: 0.45rem 1rem;">
          <i class="fa-solid fa-right-to-bracket"></i> Login / Shuru Karein
        </button>
      `;
      document.getElementById('btn-open-auth')?.addEventListener('click', () => {
        openModal('auth-modal');
      });
    }

    if (sidebarUserCard) {
      sidebarUserCard.innerHTML = `
        <div class="c-card" style="padding: 1.15rem; display: flex; flex-direction: column; gap: 0.85rem; text-align: center; background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);">
          <div style="font-size: 2.2rem; line-height: 1;">🪔</div>
          <div>
            <h4 style="font-size: 1rem; font-weight: 700;">Chaupal me Shamil Hon</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">Apni baat kahein, desi muddo pe charcha karein!</p>
          </div>
          <button id="sidebar-login-cta" class="btn-primary" style="width: 100%; font-size: 0.85rem;">
            Login / Naya Account
          </button>
          <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px dashed var(--border-subtle); padding-top: 0.65rem;">
            <span>⚡ Quick Demo Login:</span>
            <div style="display: flex; gap: 0.4rem; justify-content: center; margin-top: 0.4rem;">
              <button class="quick-demo-btn" data-user="aarav_sharma" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--saffron-700); font-weight: 600;">@aarav</button>
              <button class="quick-demo-btn" data-user="priya.nair" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--green-600); font-weight: 600;">@priya</button>
              <button class="quick-demo-btn" data-user="tanvi_k" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--navy-500); font-weight: 600;">@tanvi</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('sidebar-login-cta')?.addEventListener('click', () => openModal('auth-modal'));
      document.querySelectorAll('.quick-demo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const u = e.currentTarget.getAttribute('data-user');
          handleLogin(u, 'password123');
        });
      });
    }

    if (composerAvatar) {
      composerAvatar.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    }
  }
}
