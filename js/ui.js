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

/* ---------------------------------------------------------
   IMAGENS REAIS — opcional, por objeto
   Se o JSON informar um caminho de arquivo (ex.: "img/saturno.jpg")
   em imagem_capa ou num item da galeria, essa imagem é usada.
   Caso contrário (ids curtos como "sol_1", ou campo ausente),
   mantém-se a ilustração em CSS de sempre.
   --------------------------------------------------------- */
function isImagePath(str) {
  return typeof str === 'string' && /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(str.trim());
}

/** Monta o `style` de um .orb: foto real (se houver) por baixo do mesmo
    brilho/sombra em CSS, ou a cor sólida de sempre como fallback. */
function orbStyle(obj, fallbackColor) {
  const color = obj.cor_predominante || fallbackColor || '#7b6fd6';
  const img = isImagePath(obj.imagem_capa) ? obj.imagem_capa : null;
  if (!img) return `--orb-color:${color}`;
  return `--orb-color:${color}; background-image:` +
    `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.45), transparent 42%),` +
    `radial-gradient(circle at 66% 72%, rgba(0,0,0,0.45), transparent 60%),` +
    `url('${img}'); background-size: cover; background-position: center;`;
}

/** Constrói um card de objeto (planeta/lua/estrela/galáxia) reutilizável */
function objectCardHTML(obj, href, kicker, fallbackColor) {
  const ring = obj.id === 'saturno' ? ' has-ring' : '';
  return `
    <a class="obj-card reveal" href="${href}">
      <div class="thumb">
        <div class="orb${ring}" style="${orbStyle(obj, fallbackColor)}"></div>
      </div>
      <div class="info">
        <div class="kicker">${kicker}</div>
        <h3>${obj.nome}</h3>
        <p>${obj.descricao_curta || ''}</p>
      </div>
    </a>`;
}

/* ---------------------------------------------------------
   COMPARADOR — lista persistida em localStorage, usada por
   comparar.html e pelo botão "Comparar" nas páginas de detalhe.
   --------------------------------------------------------- */
const COMPARE_KEY = 'visao_compare';

function getCompareList() {
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY)) || []; }
  catch (e) { return []; }
}
function setCompareList(ids) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify([...new Set(ids)]));
}
function addToCompareAndGo(id) {
  const list = getCompareList();
  if (!list.includes(id)) list.push(id);
  setCompareList(list);
  window.location.href = 'comparar.html';
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
