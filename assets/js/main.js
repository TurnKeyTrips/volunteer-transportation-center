import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';

Alpine.plugin(collapse);

window.Alpine = Alpine;
Alpine.start();

// ---------------------------------------------------------------------------
// Confetti: a small celebratory burst when key CTAs are clicked.
// Add `data-confetti` to any <a> or <button> to enable it.
// Same-tab navigation is delayed ~500ms so the burst is visible.
// ---------------------------------------------------------------------------
const CONFETTI_COLORS = ['#2980b3', '#85bcdd', '#ffa020', '#f97b07', '#ffffff', '#ffd688'];

function burstConfetti(x, y) {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 32 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 4 + Math.random() * 7;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      circle: Math.random() < 0.3,
      life: 70 + Math.random() * 30,
      t: 0,
    };
  });

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.t >= p.life) continue;
      alive = true;
      p.t++;
      p.vy += 0.18;          // gravity
      p.vx *= 0.985;         // drag
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillStyle = p.color;
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }
    if (alive) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-confetti]');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rect = el.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

  // Delay same-tab link navigation just long enough to enjoy the pop
  if (el.tagName === 'A' && el.href && el.target !== '_blank' && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    setTimeout(() => { window.location.href = el.href; }, 500);
  }
});
