/**
 * Chaupal - UI Helper Utilities
 * Theme toggles, Indian greetings, IST timestamps, Indian number formatting, toasts and modals
 */

export function initTheme() {
  const savedTheme = localStorage.getItem('chaupal_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('chaupal_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

/**
 * Returns Indian greeting based on local time of day
 */
export function getTimeGreeting() {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 5 && hours < 12) {
    return { devanagari: 'सुप्रभात', translit: 'Suprabhat', english: 'Good Morning', icon: '🌅' };
  } else if (hours >= 12 && hours < 17) {
    return { devanagari: 'नमस्ते', translit: 'Namaste', english: 'Good Afternoon', icon: '☀️' };
  } else if (hours >= 17 && hours < 21) {
    return { devanagari: 'शुभ संध्या', translit: 'Shubh Sandhya', english: 'Good Evening', icon: '🌇' };
  } else {
    return { devanagari: 'शुभ रात्रि', translit: 'Shubh Ratri', english: 'Good Night', icon: '🌙' };
  }
}

/**
 * Formats numbers in Indian system (e.g., 1.2K, 1.5L)
 */
export function formatIndianCount(num) {
  const n = Number(num) || 0;
  if (n < 1000) return n.toString();
  if (n < 100000) {
    const k = (n / 1000).toFixed(1);
    return k.endsWith('.0') ? `${Math.floor(n / 1000)}K` : `${k}K`;
  }
  const l = (n / 100000).toFixed(1);
  return l.endsWith('.0') ? `${Math.floor(n / 100000)}L` : `${l}L`;
}

/**
 * Formats timestamps in IST (Indian Standard Time) with relative Hindi/English indicators
 */
export function formatISTTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Abhi abhi (Just now)';
  }
  if (diffInSeconds < 3600) {
    const m = Math.floor(diffInSeconds / 60);
    return `${m}m pehle`;
  }
  if (diffInSeconds < 86400) {
    const h = Math.floor(diffInSeconds / 3600);
    return `${h} ghante pehle`;
  }
  if (diffInSeconds < 604800) {
    const d = Math.floor(diffInSeconds / 86400);
    return `${d} din pehle`;
  }

  // Format in IST
  try {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric'
    }) + ' IST';
  } catch (e) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Toast Notification System
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-solid fa-circle-info';
  if (type === 'success') icon = 'fa-solid fa-circle-check text-green-500';
  if (type === 'error') icon = 'fa-solid fa-circle-exclamation text-red-500';

  toast.innerHTML = `
    <i class="${icon}" style="font-size: 1.15rem; color: ${type === 'success' ? '#138808' : type === 'error' ? '#EF4444' : '#FF9933'}"></i>
    <div style="flex: 1; font-weight: 500;">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/**
 * Modal Manager
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Button Ripple Effect
 */
export function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn-primary, .btn-secondary, .ripple-btn');
    if (!target) return;

    const circle = document.createElement('span');
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-circle');

    const ripple = target.querySelector('.ripple-circle');
    if (ripple) ripple.remove();

    target.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
}

/**
 * Indian Festival Helper
 */
export function getActiveIndianFestival() {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 9 = Oct

  // Map seasons and active festivals
  if (month === 9 || month === 10) {
    return {
      name: 'Diwali & Navratri Season',
      hindi: 'शुभ दीपावली और दुर्गा पूजा महोत्सव',
      desc: 'Diyon ki roshni aur mithaiyon ki mithas! Wishing everyone prosperity and joy. 🪔✨',
      motif: '🪔'
    };
  } else if (month === 2 || month === 3) {
    return {
      name: 'Holi Mahotsav',
      hindi: 'होली के पावन रंग, अपनों के संग',
      desc: 'Rang, gulal aur gujiya ki bahaar! Wishing you colorful festivities. 🎨🌸',
      motif: '🎨'
    };
  } else if (month === 7) {
    return {
      name: 'Azadi Ka Amrit Mahotsav',
      hindi: 'स्वतंत्रता दिवस की हार्दिक शुभकामनाएं',
      desc: 'Proudly celebrating the spirit and heritage of incredible India! 🇮🇳🕊️',
      motif: '🇮🇳'
    };
  } else if (month === 0) {
    return {
      name: 'Republic Day & Makar Sankranti',
      hindi: 'गणतंत्र दिवस और मकर संक्रांति',
      desc: 'Til-gul khao aur meetha bolo! Happy celebrations to all. 🪁🇮🇳',
      motif: '🪁'
    };
  } else {
    return {
      name: 'Chaupal Utsav',
      hindi: 'अपनी बात, अपनों के साथ',
      desc: 'Bharat ke har kone se judte dil aur bante naye dost! 🇮🇳☕',
      motif: '🪔'
    };
  }
}

export function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
