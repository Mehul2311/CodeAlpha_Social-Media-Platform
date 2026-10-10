/**
 * Chaupal - Interactions Module
 * Handles Threaded Comments, Follow/Unfollow, Suggestions Panel, and Trending Hashtags
 */

import { api } from './api.js';
import { getCurrentUser } from './auth.js';
import { formatIndianCount, formatISTTime, showToast, escapeHtml, openModal } from './ui.js';
import { filterByHashtag } from './feed.js';

export function initInteractions() {
  setupCommentsHandler();
  setupSuggestionsPanel();
  setupTrendingHashtags();

  window.addEventListener('chaupal:auth_changed', () => {
    setupSuggestionsPanel();
  });
}

function setupCommentsHandler() {
  // Listen for load comments event from post card
  window.addEventListener('chaupal:load_comments', async (e) => {
    const postId = e.detail.postId;
    const listEl = document.getElementById(`comments-list-${postId}`);
    if (!listEl) return;

    try {
      const data = await api.getComments(postId);
      renderCommentsList(postId, data.comments || [], listEl);
    } catch (err) {
      listEl.innerHTML = `<div style="color: #EF4444; font-size: 0.8rem; text-align: center;">Comments load nahi hue</div>`;
    }
  });

  // Delegate submit comment
  document.addEventListener('click', async (e) => {
    const submitBtn = e.target.closest('.btn-submit-comment');
    if (!submitBtn) return;

    const postId = submitBtn.getAttribute('data-post-id');
    const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
    if (!input) return;

    const content = input.value.trim();
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showToast('Comment karne ke liye login karein', 'info');
      openModal('auth-modal');
      return;
    }

    if (!content) {
      showToast('Comment me kuch likhna zaroori hai', 'error');
      return;
    }

    // Check if replying to someone (e.g. input starts with parent ID marker or user tag)
    const parentId = input.getAttribute('data-reply-to') || null;

    submitBtn.disabled = true;

    try {
      const res = await api.addComment(postId, {
        content,
        parent_id: parentId ? Number(parentId) : null
      });

      input.value = '';
      input.removeAttribute('data-reply-to');
      input.placeholder = 'Apna vichar likhein... (Write a comment)';

      showToast('Comment add ho gaya! 💬', 'success');

      // Update comment count on post card
      const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
      if (postCard) {
        const countSpan = postCard.querySelector('.comment-count');
        if (countSpan) countSpan.textContent = formatIndianCount(res.comment_count);
      }

      // Reload comments list
      const listEl = document.getElementById(`comments-list-${postId}`);
      if (listEl) {
        const data = await api.getComments(postId);
        renderCommentsList(postId, data.comments || [], listEl);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function renderCommentsList(postId, comments, container) {
  if (!comments || comments.length === 0) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">Abhi koi comment nahi hai. Pehla comment aap karein!</div>`;
    return;
  }

  const currentUser = getCurrentUser();

  const commentsHtml = comments.map(c => {
    const isAuthor = currentUser && (currentUser.id === c.user_id);

    return `
      <div class="comment-item" id="comment-${c.id}">
        <img src="${escapeHtml(c.avatar)}" alt="${escapeHtml(c.name)}" class="user-avatar avatar-sm" />
        <div class="comment-bubble">
          <div class="comment-header">
            <span class="comment-author" data-username="${escapeHtml(c.username)}">${escapeHtml(c.name)}</span>
            <span class="comment-time">${formatISTTime(c.created_at)}</span>
          </div>
          <div class="comment-body">${escapeHtml(c.content)}</div>
          <div class="comment-footer-actions">
            <button class="comment-reply-btn" data-post-id="${postId}" data-comment-id="${c.id}" data-author="${escapeHtml(c.username)}">
              <i class="fa-solid fa-reply"></i> Jawab dein (Reply)
            </button>
            ${isAuthor ? `
              <button class="comment-delete-btn" data-comment-id="${c.id}" data-post-id="${postId}" style="color: #EF4444; font-size: 0.72rem; cursor: pointer;">
                Delete
              </button>
            ` : ''}
          </div>

          <!-- Threaded Replies -->
          ${c.replies && c.replies.length > 0 ? `
            <div class="comment-replies-list">
              ${c.replies.map(r => `
                <div class="comment-item" id="comment-${r.id}">
                  <img src="${escapeHtml(r.avatar)}" alt="${escapeHtml(r.name)}" class="user-avatar" style="width: 26px; height: 26px;" />
                  <div class="comment-bubble" style="background-color: var(--bg-surface);">
                    <div class="comment-header">
                      <span class="comment-author" data-username="${escapeHtml(r.username)}">${escapeHtml(r.name)}</span>
                      <span class="comment-time">${formatISTTime(r.created_at)}</span>
                    </div>
                    <div class="comment-body">${escapeHtml(r.content)}</div>
                    ${currentUser && currentUser.id === r.user_id ? `
                      <button class="comment-delete-btn" data-comment-id="${r.id}" data-post-id="${postId}" style="color: #EF4444; font-size: 0.72rem; cursor: pointer; margin-top: 0.2rem;">
                        Delete
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = commentsHtml;

  // Attach reply buttons
  container.querySelectorAll('.comment-reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const author = btn.getAttribute('data-author');
      const commentId = btn.getAttribute('data-comment-id');
      const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
      if (input) {
        input.value = `@${author} `;
        input.setAttribute('data-reply-to', commentId);
        input.placeholder = `@${author} ko jawab likhein...`;
        input.focus();
      }
    });
  });

  // Attach delete comment
  container.querySelectorAll('.comment-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const commentId = btn.getAttribute('data-comment-id');
      if (confirm('Kya aap yeh comment delete karna chahte hain?')) {
        try {
          const res = await api.deleteComment(commentId);
          showToast('Comment delete ho gaya', 'info');
          // Update post card count
          const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
          if (postCard) {
            const countSpan = postCard.querySelector('.comment-count');
            if (countSpan) countSpan.textContent = formatIndianCount(res.comment_count);
          }
          // Reload comments
          const updated = await api.getComments(postId);
          renderCommentsList(postId, updated.comments || [], container);
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // Profile click in comments
  container.querySelectorAll('.comment-author').forEach(el => {
    el.addEventListener('click', () => {
      const u = el.getAttribute('data-username');
      window.dispatchEvent(new CustomEvent('chaupal:navigate_profile', { detail: { username: u } }));
    });
  });
}

export async function setupSuggestionsPanel() {
  const container = document.getElementById('suggestions-panel-container');
  if (!container) return;

  try {
    const data = await api.getSuggestions();
    const suggestions = data.suggestions || [];

    if (suggestions.length === 0) {
      container.innerHTML = `<div style="font-size: 0.82rem; color: var(--text-secondary); text-align: center; padding: 0.5rem;">Sabhi sadasya jude hue hain!</div>`;
      return;
    }

    container.innerHTML = `
      <div class="c-card" style="padding: 1.15rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h4 style="font-size: 0.95rem; font-weight: 700;">Suggested Sadasya</h4>
          <span style="font-size: 0.72rem; color: var(--text-muted);"><i class="fa-solid fa-users"></i></span>
        </div>
        <div class="suggestion-list">
          ${suggestions.map(s => `
            <div class="suggestion-item">
              <div class="suggestion-user-info" data-username="${escapeHtml(s.username)}">
                <img src="${escapeHtml(s.avatar)}" alt="${escapeHtml(s.name)}" class="user-avatar avatar-sm" />
                <div class="suggestion-names">
                  <div class="suggestion-name">${escapeHtml(s.name)}</div>
                  <div class="suggestion-handle">@${escapeHtml(s.username)} · ${escapeHtml(s.city.split(',')[0])}</div>
                </div>
              </div>
              <button class="btn-primary btn-follow" data-user-id="${s.id}" data-username="${escapeHtml(s.username)}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                Follow
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Attach click to profile
    container.querySelectorAll('.suggestion-user-info').forEach(el => {
      el.addEventListener('click', () => {
        const u = el.getAttribute('data-username');
        window.dispatchEvent(new CustomEvent('chaupal:navigate_profile', { detail: { username: u } }));
      });
    });

    // Attach follow toggle
    container.querySelectorAll('.btn-follow').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const userId = btn.getAttribute('data-user-id');
        const currentUser = getCurrentUser();

        if (!currentUser) {
          showToast('Follow karne ke liye pehle login karein', 'info');
          openModal('auth-modal');
          return;
        }

        try {
          const res = await api.toggleFollow(userId);
          showToast(res.message, 'success');
          btn.textContent = res.is_following ? 'Following' : 'Follow';
          btn.classList.toggle('following', res.is_following);
          btn.classList.toggle('btn-primary', !res.is_following);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

  } catch (err) {
    console.error('Failed to load suggestions:', err);
  }
}

function setupTrendingHashtags() {
  const container = document.getElementById('trending-topics-container');
  if (!container) return;

  const topics = [
    { tag: 'ChaiTime', count: '14.2K charchayein', category: 'Culture & Daily Life' },
    { tag: 'IPLFever', count: '48.9K charchayein', category: 'Sports · Cricket' },
    { tag: 'MumbaiRains', count: '22.5K charchayein', category: 'Monsoon Diaries' },
    { tag: 'DesiFood', count: '31.8K charchayein', category: 'Food & Street Flavors' },
    { tag: 'StartupLife', count: '9.4K charchayein', category: 'Tech · Bengaluru' },
    { tag: 'EngineeringLife', count: '18.1K charchayein', category: 'College & Youth' },
    { tag: 'DiwaliPrep', count: '27.3K charchayein', category: 'Indian Festivals' }
  ];

  container.innerHTML = `
    <div class="c-card" style="padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h4 style="font-size: 0.95rem; font-weight: 700;">Charchit Mudde (Trending)</h4>
        <i class="fa-solid fa-arrow-trend-up" style="color: var(--saffron-600); font-size: 0.85rem;"></i>
      </div>
      <div class="trend-list">
        ${topics.map(t => `
          <div class="trend-item" data-tag="${t.tag}">
            <span class="trend-category">${t.category}</span>
            <span class="trend-tag">#${t.tag}</span>
            <span class="trend-count">${t.count}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.trend-item').forEach(item => {
    item.addEventListener('click', () => {
      const tag = item.getAttribute('data-tag');
      filterByHashtag(tag);
    });
  });
}
