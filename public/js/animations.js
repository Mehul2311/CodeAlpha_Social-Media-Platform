/**
 * Chaupal - Animations Module
 * Heart particle burst, GSAP staggered reveal, and counter animations
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function animateHeartBurst(buttonEl) {
  if (prefersReducedMotion) return;

  const rect = buttonEl.getBoundingClientRect();
  const emojis = ['❤️', '🪔', '✨', '💖'];

  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('span');
    particle.className = 'heart-particle';
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Random trajectory
    const angle = (i * (360 / 6) + Math.random() * 20) * (Math.PI / 180);
    const distance = 35 + Math.random() * 25;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 15; // slightly upward bias

    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.left = `${rect.width / 2}px`;
    particle.style.top = `${rect.height / 2}px`;

    buttonEl.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
  }
}

export function animateFeedEntrance(selector) {
  if (prefersReducedMotion) return;

  if (window.gsap) {
    window.gsap.from(selector, {
      opacity: 0,
      y: 25,
      stagger: 0.08,
      duration: 0.45,
      ease: 'power2.out',
      clearProps: 'all'
    });
  } else {
    // Fallback: apply css class
    document.querySelectorAll(selector).forEach((el, idx) => {
      el.classList.add('fade-in-up');
      el.style.animationDelay = `${idx * 0.06}s`;
    });
  }
}

export function animateCounter(elementId, targetValue, duration = 600) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const target = Number(targetValue) || 0;
  if (prefersReducedMotion || target <= 0) {
    el.textContent = target.toString();
    return;
  }

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quad
    const easeProgress = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(easeProgress * target);

    el.textContent = current.toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toString();
    }
  }

  requestAnimationFrame(update);
}
