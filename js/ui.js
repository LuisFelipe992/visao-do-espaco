/* =========================================================
   VISÃO DO ESPAÇO — ui.js
   Efeitos visuais transversais e helpers compartilhados
   ========================================================= */

/** Campo de estrelas discreto, desenhado em canvas, com leve parallax */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      tw: Math.random() * 0.02 + 0.005
    }));
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const alpha = s.a + Math.sin(t * s.tw * 40) * 0.15;
      ctx.beginPath();
      ctx.fillStyle = `rgba(240,235,255,${Math.max(0, alpha)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 0.6;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
  else { draw(); }
}

/** Revela elementos com [data-reveal] ao entrarem na viewport */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
}

/** Menu mobile */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

/** Marca o link ativo do menu conforme a página atual */
function markActiveNav() {
  let page = document.body.dataset.page;
  if (page === 'categoria' || page === 'objeto') page = resolveCat();
  else if (page === 'planeta' || page === 'lua') page = 'home';
  document.querySelectorAll('.main-nav a[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
}

/** Aplica a cor predominante de um objeto como variável CSS num elemento */
function applyObjectColor(el, hexColor) {
  if (!el || !hexColor) return;
  el.style.setProperty('--orb-color', hexColor);
  el.style.setProperty('--slide-color', hexColor + '55');
}

/** Constrói um card de objeto (planeta/lua/estrela/galáxia) reutilizável */
function objectCardHTML(obj, href, kicker, fallbackColor) {
  const color = obj.cor_predominante || fallbackColor || '#7b6fd6';
  const ring = obj.id === 'saturno' ? ' has-ring' : '';
  return `
    <a class="obj-card reveal" href="${href}">
      <div class="thumb">
        <div class="orb${ring}" style="--orb-color:${color}"></div>
      </div>
      <div class="info">
        <div class="kicker">${kicker}</div>
        <h3>${obj.nome}</h3>
        <p>${obj.descricao_curta || ''}</p>
      </div>
    </a>`;
}

function initHeader() {
  initNavToggle();
  markActiveNav();
  initSearch();
}

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initHeader();
});
