/**
 * Chaupal - Profile Module
 * Profile view, Edit profile, Followers/Following lists, and user posts grid
 */

import { api } from './api.js';
import { getCurrentUser } from './auth.js';
import { formatIndianCount, formatISTTime, showToast, escapeHtml, openModal, closeModal } from './ui.js';
import { animateCounter } from './animations.js';

let viewingUsername = null;
let profilePostsViewMode = 'grid'; // 'grid' | 'feed'

export function initProfile() {
  setupProfileNavigation();
  setupEditProfileForm();
}

function setupProfileNavigation() {
  window.addEventListener('chaupal:navigate_profile', (e) => {
    const username = e.detail.username;
    loadUserProfile(username);
  });
}

export async function loadUserProfile(username) {
  viewingUsername = username;

  const feedView = document.getElementById('feed-main-view');
  const profileView = document.getElementById('profile-view-container');

  if (feedView) feedView.style.display = 'none';
  if (profileView) {
    profileView.style.display = 'flex';
    profileView.innerHTML = `
      <div class="c-card" style="padding: 2rem; text-align: center;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--saffron-500);"></i>
        <p style="margin-top: 0.75rem; color: var(--text-secondary);">Profile load ho rahi hai...</p>
      </div>
    `;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const [profileRes, postsRes] = await Promise.all([
      api.getProfile(username),
      api.getUserPosts(username)
    ]);

    const user = profileRes.user;
    const posts = postsRes.posts || [];

    renderProfileView(user, posts, profileView);
  } catch (err) {
    if (profileView) {
      profileView.innerHTML = `
        <div class="c-card empty-state-card">
          <i class="fa-solid fa-user-slash empty-state-icon" style="color: #EF4444;"></i>
          <h3 class="empty-state-title">User nahi mila</h3>
          <p class="empty-state-desc">${escapeHtml(err.message)}</p>
          <button id="btn-back-home" class="btn-primary" style="margin-top: 0.5rem;">Feed par wapas jayein</button>
        </div>
      `;
      document.getElementById('btn-back-home')?.addEventListener('click', closeProfileView);
    }
  }
}

export function closeProfileView() {
  const feedView = document.getElementById('feed-main-view');
  const profileView = document.getElementById('profile-view-container');
  if (profileView) profileView.style.display = 'none';
  if (feedView) feedView.style.display = 'flex';
}

function renderProfileView(user, posts, container) {
  const currentUser = getCurrentUser();
  const isSelf = currentUser && currentUser.id === user.id;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      <!-- Back to Feed Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="btn-profile-back" class="btn-secondary" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;">
          <i class="fa-solid fa-arrow-left"></i> Wapas Feed Par Jayein
        </button>
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
          @${escapeHtml(user.username)}
        </span>
      </div>

      <!-- Main Profile Card -->
      <div class="c-card profile-card">
        <div class="profile-cover"></div>
        <div class="profile-details">
          <div class="profile-avatar-row">
            <div class="profile-avatar-wrapper">
              <img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" class="user-avatar avatar-xl profile-avatar" />
            </div>

            <div class="profile-actions-slot">
              ${isSelf ? `
                <button id="btn-open-edit-profile" class="btn-secondary" style="font-size: 0.85rem;">
                  <i class="fa-solid fa-pen"></i> Edit Profile
                </button>
              ` : `
                <button id="btn-profile-follow" class="btn-primary btn-follow ${user.is_following ? 'following' : ''}" data-user-id="${user.id}">
                  ${user.is_following ? 'Following' : 'Follow'}
                </button>
              `}
            </div>
          </div>

          <h2 class="profile-name">${escapeHtml(user.name)}</h2>
          <div class="profile-handle">@${escapeHtml(user.username)}</div>

          <p class="profile-bio">${escapeHtml(user.bio || 'Chaupal par sadasya')}</p>

          <div class="profile-meta-chips">
            <div class="profile-meta-item">
              <i class="fa-solid fa-location-dot" style="color: var(--green-600);"></i>
              <span>${escapeHtml(user.city || 'India')}</span>
            </div>
            <div class="profile-meta-item">
              <i class="fa-regular fa-calendar" style="color: var(--saffron-600);"></i>
              <span>Judne ki taareekh: ${formatISTTime(user.created_at)}</span>
            </div>
          </div>

          <div class="profile-stats-row">
            <div class="stat-item" id="stat-posts">
              <span class="stat-value" id="val-posts">${user.post_count}</span>
              <span class="stat-label">Posts</span>
            </div>
            <div class="stat-item" id="stat-followers">
              <span class="stat-value" id="val-followers">${user.follower_count}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item" id="stat-following">
              <span class="stat-value" id="val-following">${user.following_count}</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      <!-- User's Posts Header & View Mode Switcher -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 0.25rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700;">
          ${escapeHtml(user.name.split(' ')[0])} ke Posts (${posts.length})
        </h3>
        <div style="display: flex; gap: 0.35rem; background: var(--bg-surface); padding: 0.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <button id="btn-mode-grid" class="btn-mode ${profilePostsViewMode === 'grid' ? 'active' : ''}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border-radius: 4px; ${profilePostsViewMode === 'grid' ? 'background: var(--saffron-100); color: var(--saffron-700); font-weight: 600;' : 'color: var(--text-muted);'}">
            <i class="fa-solid fa-table-cells"></i> Grid
          </button>
          <button id="btn-mode-feed" class="btn-mode ${profilePostsViewMode === 'feed' ? 'active' : ''}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border-radius: 4px; ${profilePostsViewMode === 'feed' ? 'background: var(--saffron-100); color: var(--saffron-700); font-weight: 600;' : 'color: var(--text-muted);'}">
            <i class="fa-solid fa-bars"></i> Feed
          </button>
        </div>
      </div>

      <!-- User Posts Container -->
      <div id="profile-posts-content">
        ${renderProfilePosts(posts, profilePostsViewMode)}
      </div>
    </div>
  `;

  // Animate counter values
  animateCounter('val-posts', user.post_count);
  animateCounter('val-followers', user.follower_count);
  animateCounter('val-following', user.following_count);

  // Attach Back Button
  document.getElementById('btn-profile-back')?.addEventListener('click', closeProfileView);

  // View Switchers
  document.getElementById('btn-mode-grid')?.addEventListener('click', () => {
    profilePostsViewMode = 'grid';
    renderProfileView(user, posts, container);
  });
  document.getElementById('btn-mode-feed')?.addEventListener('click', () => {
    profilePostsViewMode = 'feed';
    renderProfileView(user, posts, container);
  });

  // Edit Profile Click
  document.getElementById('btn-open-edit-profile')?.addEventListener('click', () => {
    const nameInput = document.getElementById('edit-profile-name');
    const bioInput = document.getElementById('edit-profile-bio');
    const cityInput = document.getElementById('edit-profile-city');
    const avatarInput = document.getElementById('edit-profile-avatar');

    if (nameInput) nameInput.value = user.name;
    if (bioInput) bioInput.value = user.bio || '';
    if (cityInput) cityInput.value = user.city || '';
    if (avatarInput) avatarInput.value = user.avatar || '';

    openModal('edit-profile-modal');
  });

  // Follow Button Toggle
  const followBtn = document.getElementById('btn-profile-follow');
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      if (!currentUser) {
        showToast('Follow karne ke liye pehle login karein', 'info');
        openModal('auth-modal');
        return;
      }

      try {
        const res = await api.toggleFollow(user.id);
        showToast(res.message, 'success');
        followBtn.textContent = res.is_following ? 'Following' : 'Follow';
        followBtn.classList.toggle('following', res.is_following);
        followBtn.classList.toggle('btn-primary', !res.is_following);
        const followerVal = document.getElementById('val-followers');
        if (followerVal) followerVal.textContent = res.target_follower_count;
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Followers List Modal Trigger
  document.getElementById('stat-followers')?.addEventListener('click', () => {
    openFollowListModal(user.username, 'followers');
  });

  // Following List Modal Trigger
  document.getElementById('stat-following')?.addEventListener('click', () => {
    openFollowListModal(user.username, 'following');
  });
}

function renderProfilePosts(posts, mode) {
  if (!posts || posts.length === 0) {
    return `
      <div class="c-card empty-state-card">
        <div class="empty-state-icon">📝</div>
        <h3 class="empty-state-title">Abhi koi post nahi kiya</h3>
        <p class="empty-state-desc">Jaise hi naya post aayega, yahan dikhai dega.</p>
      </div>
    `;
  }

  if (mode === 'grid') {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.85rem;">
        ${posts.map(p => `
          <div class="c-card" style="padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.65rem; min-height: 140px; cursor: pointer;" onclick="window.chaupalShowPostDetails(${p.id})">
            ${p.image_url ? `
              <div style="height: 110px; border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-elevated); margin-bottom: 0.35rem;">
                <img src="${escapeHtml(p.image_url)}" style="width: 100%; height: 100%; object-fit: cover;" alt="Attachment" />
              </div>
            ` : ''}
            <p style="font-size: 0.85rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(p.content)}
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.4rem;">
              <span><i class="fa-solid fa-heart" style="color: #EF4444;"></i> ${formatIndianCount(p.like_count)}</span>
              <span><i class="fa-solid fa-comment" style="color: var(--saffron-600);"></i> ${formatIndianCount(p.comment_count)}</span>
              <span>${formatISTTime(p.created_at)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    // Standard cards
    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${posts.map(p => `
          <div class="c-card" style="padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              ${formatISTTime(p.created_at)}
            </div>
            <div style="font-size: 0.95rem; line-height: 1.55;">
              ${escapeHtml(p.content)}
            </div>
            ${p.image_url ? `
              <div style="border-radius: var(--radius-md); overflow: hidden; max-height: 300px;">
                <img src="${escapeHtml(p.image_url)}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
            <div style="display: flex; gap: 1.25rem; font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
              <span><i class="fa-solid fa-heart" style="color: #EF4444;"></i> ${formatIndianCount(p.like_count)} likes</span>
              <span><i class="fa-solid fa-comment" style="color: var(--saffron-600);"></i> ${formatIndianCount(p.comment_count)} comments</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Global hook for clicking a post in grid
window.chaupalShowPostDetails = async (postId) => {
  try {
    const res = await api.getPost(postId);
    if (res.post) {
      showToast(`Post: "${res.post.content.slice(0, 50)}..."`, 'info');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function openFollowListModal(username, type) {
  const modalTitle = document.getElementById('follow-list-modal-title');
  const modalContent = document.getElementById('follow-list-modal-content');

  if (modalTitle) modalTitle.textContent = type === 'followers' ? `Followers (${username})` : `Following (${username})`;
  if (modalContent) modalContent.innerHTML = `<div style="text-align: center; padding: 1rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>`;

  openModal('follow-list-modal');

  try {
    const data = type === 'followers' ? await api.getFollowers(username) : await api.getFollowing(username);
    const list = type === 'followers' ? data.followers : data.following;

    if (!list || list.length === 0) {
      modalContent.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Abhi koi ${type} nahi hain.</div>`;
      return;
    }

    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${list.map(u => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-radius: var(--radius-md); background: var(--bg-elevated);">
            <div style="display: flex; align-items: center; gap: 0.65rem; cursor: pointer;" onclick="window.chaupalOpenProfileFromModal('${escapeHtml(u.username)}')">
              <img src="${escapeHtml(u.avatar)}" class="user-avatar avatar-sm" alt="${escapeHtml(u.name)}" />
              <div>
                <div style="font-weight: 600; font-size: 0.88rem;">${escapeHtml(u.name)}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">@${escapeHtml(u.username)} · ${escapeHtml(u.city || '')}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    modalContent.innerHTML = `<div style="color: #EF4444; text-align: center;">List load nahi ho payi</div>`;
  }
}

window.chaupalOpenProfileFromModal = (username) => {
  closeModal('follow-list-modal');
  loadUserProfile(username);
};

function setupEditProfileForm() {
  const form = document.getElementById('edit-profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-profile-name')?.value.trim();
    const bio = document.getElementById('edit-profile-bio')?.value.trim();
    const city = document.getElementById('edit-profile-city')?.value.trim();
    const avatar = document.getElementById('edit-profile-avatar')?.value.trim();

    try {
      const res = await api.updateProfile({ name, bio, city, avatar });
      showToast(res.message, 'success');
      closeModal('edit-profile-modal');

      // Update current user state & reload profile
      window.dispatchEvent(new CustomEvent('chaupal:auth_changed', { detail: { user: res.user } }));
      if (viewingUsername) {
        loadUserProfile(viewingUsername);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
