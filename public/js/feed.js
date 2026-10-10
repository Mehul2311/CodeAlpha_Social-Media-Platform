/**
 * Chaupal - Feed Module
 * Home feed, Explore, Trending, Search, and Post Composer
 */

import { api } from './api.js';
import { getCurrentUser } from './auth.js';
import { formatIndianCount, formatISTTime, showToast, escapeHtml, openModal, closeModal } from './ui.js';
import { animateHeartBurst, animateFeedEntrance } from './animations.js';

let currentFeedType = 'following';
let currentTag = null;
let currentSearch = null;
let currentPosts = [];
let pendingImageUrl = '';

export function initFeed() {
  setupComposer();
  setupFeedTabs();
  setupSearch();
  loadFeed();

  // Listen for global auth changes to refresh feed appropriately
  window.addEventListener('chaupal:auth_changed', () => {
    loadFeed();
  });
}

export async function loadFeed() {
  const container = document.getElementById('feed-posts-container');
  if (!container) return;

  renderFeedSkeleton(container);

  try {
    const params = {};
    if (currentTag) {
      params.tag = currentTag;
    } else if (currentSearch) {
      params.search = currentSearch;
    } else {
      params.type = currentFeedType;
    }

    const data = await api.getFeed(params);
    currentPosts = data.posts || [];
    renderPosts(currentPosts, container);
  } catch (err) {
    container.innerHTML = `
      <div class="c-card empty-state-card">
        <i class="fa-solid fa-triangle-exclamation empty-state-icon" style="color: #EF4444;"></i>
        <h3 class="empty-state-title">Kuch gadbad ho gayi</h3>
        <p class="empty-state-desc">${escapeHtml(err.message)}</p>
        <button id="btn-retry-feed" class="btn-primary" style="margin-top: 0.5rem;">Dobara Koshish Karein</button>
      </div>
    `;
    document.getElementById('btn-retry-feed')?.addEventListener('click', () => loadFeed());
  }
}

function renderFeedSkeleton(container) {
  let skeletonsHtml = '';
  for (let i = 0; i < 3; i++) {
    skeletonsHtml += `
      <div class="c-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem;">
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <div class="skeleton-box" style="width: 44px; height: 44px; border-radius: 50%;"></div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
            <div class="skeleton-box" style="width: 140px; height: 14px;"></div>
            <div class="skeleton-box" style="width: 80px; height: 10px;"></div>
          </div>
        </div>
        <div class="skeleton-box" style="width: 100%; height: 50px;"></div>
        <div class="skeleton-box" style="width: 100%; height: 180px; border-radius: 8px;"></div>
      </div>
    `;
  }
  container.innerHTML = skeletonsHtml;
}

export function renderPosts(posts, container) {
  if (!posts || posts.length === 0) {
    let emptyMsg = 'Abhi tak koi post nahi, pehli post aap karo!';
    let emptySub = 'Apne doston ke saath apni baat share karein aur charcha shuru karein.';
    if (currentTag) {
      emptyMsg = `#${currentTag} par abhi koi post nahi mili`;
      emptySub = 'Is hashtag par naye vichar post karein!';
    } else if (currentSearch) {
      emptyMsg = `"${currentSearch}" ke liye koi result nahi mila`;
      emptySub = 'Kisi aur shabda ya topic se dhoondhein.';
    }

    container.innerHTML = `
      <div class="c-card empty-state-card">
        <div class="empty-state-icon">🪔</div>
        <h3 class="empty-state-title">${emptyMsg}</h3>
        <p class="empty-state-desc">${emptySub}</p>
        <button id="btn-empty-create" class="btn-primary" style="margin-top: 0.5rem;">
          <i class="fa-solid fa-pen-nib"></i> Post Likhein
        </button>
      </div>
    `;
    document.getElementById('btn-empty-create')?.addEventListener('click', () => {
      document.getElementById('composer-textarea')?.focus();
    });
    return;
  }

  const currentUser = getCurrentUser();

  const postsHtml = posts.map(post => {
    const isLiked = Boolean(post.is_liked);
    const isAuthor = currentUser && currentUser.id === post.user_id;

    // Highlight hashtags
    const formattedContent = escapeHtml(post.content).replace(/#([a-zA-Z0-9_]+)/g, '<span class="post-hashtag" data-tag="$1">#$1</span>');

    return `
      <article class="c-card post-card hover-lift" data-post-id="${post.id}">
        <header class="post-header">
          <div class="post-author-info" data-username="${escapeHtml(post.username)}">
            <img src="${escapeHtml(post.avatar)}" alt="${escapeHtml(post.name)}" class="user-avatar avatar-md" loading="lazy" />
            <div class="post-author-names">
              <span class="post-author-name">
                ${escapeHtml(post.name)}
              </span>
              <div class="post-author-meta">
                <span>@${escapeHtml(post.username)}</span>
                <span aria-hidden="true">·</span>
                <span class="post-city-badge"><i class="fa-solid fa-location-dot" style="font-size: 0.7rem;"></i> ${escapeHtml(post.city || 'India')}</span>
                <span aria-hidden="true">·</span>
                <span>${formatISTTime(post.created_at)}</span>
              </div>
            </div>
          </div>
          <div class="post-menu-wrapper" style="position: relative;">
            <button class="post-menu-btn" data-post-id="${post.id}" aria-label="Post options">
              <i class="fa-solid fa-ellipsis"></i>
            </button>
          </div>
        </header>

        <div class="post-content-text">${formattedContent}</div>

        ${post.image_url ? `
          <div class="post-image-container" data-img-url="${escapeHtml(post.image_url)}">
            <img src="${escapeHtml(post.image_url)}" alt="Post attachment" loading="lazy" />
          </div>
        ` : ''}

        <footer class="post-actions-bar">
          <button class="post-action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}" data-liked="${isLiked}">
            <i class="${isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
            <span class="like-count">${formatIndianCount(post.like_count)}</span>
          </button>

          <button class="post-action-btn comment-btn" data-post-id="${post.id}">
            <i class="fa-regular fa-comment"></i>
            <span class="comment-count">${formatIndianCount(post.comment_count)}</span>
          </button>

          <button class="post-action-btn share-btn" data-post-id="${post.id}" title="Share Post">
            <i class="fa-regular fa-share-from-square"></i>
            <span>Share</span>
          </button>
        </footer>

        <!-- Threaded Comments Section Container -->
        <section class="post-comments-section" id="comments-section-${post.id}">
          <div class="comment-input-row">
            <img src="${currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}" class="user-avatar avatar-sm" alt="Me" />
            <input type="text" placeholder="Apna vichar likhein... (Write a comment)" class="comment-input" data-post-id="${post.id}" />
            <button class="btn-primary btn-submit-comment" data-post-id="${post.id}" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          <div class="comments-list" id="comments-list-${post.id}">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">Comments load ho rahe hain...</div>
          </div>
        </section>
      </article>
    `;
  }).join('');

  container.innerHTML = postsHtml;

  // Stagger reveal animation with GSAP or CSS fallback
  animateFeedEntrance('.post-card');

  // Attach post events
  attachPostCardEvents(container);
}

function attachPostCardEvents(container) {
  // Author Profile Click
  container.querySelectorAll('.post-author-info').forEach(el => {
    el.addEventListener('click', () => {
      const username = el.getAttribute('data-username');
      window.dispatchEvent(new CustomEvent('chaupal:navigate_profile', { detail: { username } }));
    });
  });

  // Hashtag Clicks
  container.querySelectorAll('.post-hashtag').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = el.getAttribute('data-tag');
      filterByHashtag(tag);
    });
  });

  // Image zoom click
  container.querySelectorAll('.post-image-container').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-img-url');
      const modalImg = document.getElementById('image-viewer-img');
      if (modalImg) {
        modalImg.src = url;
        openModal('image-viewer-modal');
      }
    });
  });

  // Like button
  container.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const postId = Number(btn.getAttribute('data-post-id'));
      const isCurrentlyLiked = btn.getAttribute('data-liked') === 'true';
      const currentUser = getCurrentUser();

      if (!currentUser) {
        showToast('Like karne ke liye pehle login karein (Please login to like)', 'info');
        openModal('auth-modal');
        return;
      }

      // Optimistic UI update
      const newLiked = !isCurrentlyLiked;
      btn.setAttribute('data-liked', String(newLiked));
      btn.classList.toggle('liked', newLiked);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = newLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      }

      const countSpan = btn.querySelector('.like-count');
      let currentVal = parseInt(countSpan.textContent.replace(/[^0-9]/g, '')) || 0;
      let newVal = newLiked ? currentVal + 1 : Math.max(0, currentVal - 1);
      countSpan.textContent = formatIndianCount(newVal);

      if (newLiked) {
        animateHeartBurst(btn);
      }

      try {
        const res = await api.toggleLike(postId);
        countSpan.textContent = formatIndianCount(res.like_count);
      } catch (err) {
        // Revert on failure
        btn.setAttribute('data-liked', String(isCurrentlyLiked));
        btn.classList.toggle('liked', isCurrentlyLiked);
        if (icon) icon.className = isCurrentlyLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        countSpan.textContent = formatIndianCount(currentVal);
        showToast(err.message, 'error');
      }
    });
  });

  // Comment button (toggle comments drawer)
  container.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const drawer = document.getElementById(`comments-section-${postId}`);
      if (drawer) {
        drawer.classList.toggle('open');
        if (drawer.classList.contains('open')) {
          window.dispatchEvent(new CustomEvent('chaupal:load_comments', { detail: { postId } }));
        }
      }
    });
  });

  // Share button
  container.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const url = `${window.location.origin}/#post-${postId}`;
      navigator.clipboard?.writeText(url).then(() => {
        showToast('Link copy ho gaya! Apne WhatsApp ya doston ko share karein 🔗', 'success');
      }).catch(() => {
        showToast('Post link: ' + url, 'info');
      });
    });
  });

  // Post Menu options (Edit / Delete)
  container.querySelectorAll('.post-menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = Number(btn.getAttribute('data-post-id'));
      const post = currentPosts.find(p => p.id === postId);
      if (!post) return;

      const currentUser = getCurrentUser();
      const isAuthor = currentUser && currentUser.id === post.user_id;

      if (isAuthor) {
        // Open edit or delete choice
        promptPostOptions(post);
      } else {
        // Share / Bookmark
        showToast('Post options: Aap is post ka link share kar sakte hain', 'info');
      }
    });
  });
}

function promptPostOptions(post) {
  const confirmed = confirm('Aap is post ko Edit karna chahte hain ya Delete?\n\nOK dabayein Edit ke liye, Cancel dabayein Delete ke liye.');
  if (confirmed) {
    // Open edit modal
    const editArea = document.getElementById('edit-post-textarea');
    const editImg = document.getElementById('edit-post-image');
    const editId = document.getElementById('edit-post-id');
    if (editArea && editId) {
      editArea.value = post.content;
      if (editImg) editImg.value = post.image_url || '';
      editId.value = post.id;
      openModal('edit-post-modal');
    }
  } else {
    // Delete confirmation
    if (confirm('Kya aap sach me yeh post delete karna chahte hain?')) {
      api.deletePost(post.id).then(() => {
        showToast('Post delete ho gaya', 'info');
        loadFeed();
      }).catch(err => {
        showToast(err.message, 'error');
      });
    }
  }
}

function setupComposer() {
  const textarea = document.getElementById('composer-textarea');
  const submitBtn = document.getElementById('composer-submit-btn');
  const charCount = document.getElementById('composer-char-count');
  const imgToolBtn = document.getElementById('composer-tool-image');
  const urlContainer = document.getElementById('composer-url-container');
  const urlInput = document.getElementById('composer-image-url-input');
  const urlApplyBtn = document.getElementById('composer-apply-url-btn');
  const fileInput = document.getElementById('composer-file-input');
  const previewContainer = document.getElementById('composer-preview-container');
  const previewImg = document.getElementById('composer-preview-img');
  const removePreviewBtn = document.getElementById('composer-remove-preview');

  if (!textarea || !submitBtn) return;

  // Auto-resize & char counter
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
    const count = textarea.value.length;
    if (charCount) {
      charCount.textContent = `${count}/1500`;
      charCount.style.color = count > 1400 ? '#EF4444' : 'var(--text-muted)';
    }
  });

  // Toggle Image URL field
  imgToolBtn?.addEventListener('click', () => {
    if (urlContainer) {
      urlContainer.style.display = urlContainer.style.display === 'flex' ? 'none' : 'flex';
      if (urlContainer.style.display === 'flex') {
        urlInput?.focus();
      }
    }
  });

  // Apply URL
  urlApplyBtn?.addEventListener('click', () => {
    const url = urlInput?.value.trim();
    if (url) {
      pendingImageUrl = url;
      if (previewImg && previewContainer) {
        previewImg.src = url;
        previewContainer.style.display = 'block';
      }
      if (urlContainer) urlContainer.style.display = 'none';
    }
  });

  // Local File Upload as Data URL
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        pendingImageUrl = evt.target.result;
        if (previewImg && previewContainer) {
          previewImg.src = pendingImageUrl;
          previewContainer.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Remove preview
  removePreviewBtn?.addEventListener('click', () => {
    pendingImageUrl = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
  });

  // Submit Post
  submitBtn.addEventListener('click', async () => {
    const content = textarea.value.trim();
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showToast('Post karne ke liye pehle login karein (Please login to post)', 'info');
      openModal('auth-modal');
      return;
    }

    if (!content) {
      showToast('Post me kuch likhna zaroori hai', 'error');
      textarea.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Post ho raha hai...';

    try {
      const res = await api.createPost({
        content,
        image_url: pendingImageUrl || null
      });

      showToast('Post Chaupal par publish ho gaya! 🎉', 'success');

      // Reset composer
      textarea.value = '';
      textarea.style.height = 'auto';
      if (charCount) charCount.textContent = '0/1500';
      pendingImageUrl = '';
      if (previewContainer) previewContainer.style.display = 'none';
      if (urlInput) urlInput.value = '';
      if (fileInput) fileInput.value = '';

      // Reload feed to show post
      loadFeed();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Chaupal me Baantain';
    }
  });
}

function setupFeedTabs() {
  const tabs = document.querySelectorAll('.feed-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentFeedType = tab.getAttribute('data-tab');
      currentTag = null;
      currentSearch = null;

      // Update feed title banner
      const titleEl = document.getElementById('feed-section-title');
      if (titleEl) {
        if (currentFeedType === 'following') titleEl.textContent = 'Apno Ka Feed';
        else if (currentFeedType === 'all') titleEl.textContent = 'Desh Videsh (Explore)';
        else if (currentFeedType === 'trending') titleEl.textContent = 'Charchit Mudde (Trending)';
      }

      loadFeed();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('header-search-input');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim();
      if (query.length > 0) {
        currentSearch = query;
        currentTag = null;
        const titleEl = document.getElementById('feed-section-title');
        if (titleEl) titleEl.textContent = `Search results for "${query}"`;
        loadFeed();
      } else {
        currentSearch = null;
        loadFeed();
      }
    }, 400);
  });
}

export function filterByHashtag(tag) {
  currentTag = tag;
  currentSearch = null;
  const titleEl = document.getElementById('feed-section-title');
  if (titleEl) {
    titleEl.innerHTML = `<span style="color: var(--saffron-600);">#${escapeHtml(tag)}</span> ke posts <button id="btn-clear-filter" style="font-size: 0.75rem; color: var(--text-muted); text-decoration: underline; margin-left: 0.5rem;">Filter Hatayein</button>`;
    document.getElementById('btn-clear-filter')?.addEventListener('click', () => {
      currentTag = null;
      if (titleEl) titleEl.textContent = 'Apno Ka Feed';
      loadFeed();
    });
  }
  loadFeed();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
