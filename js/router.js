/* =========================================================
   VISÃO DO ESPAÇO — router.js
   Monta o layout compartilhado (header/footer) em toda página
   e resolve parâmetros de navegação entre objetos.
   O menu é gerado a partir de CATEGORIAS (loader.js).
   ========================================================= */

function navItems() {
  if (typeof CATEGORIAS === 'undefined') { console.error('loader.js desatualizado: limpe o cache (Ctrl+F5) e confira se js/loader.js é a versão nova.'); return []; }
  return [
    { label: 'Sistema Solar', href: 'index.html#sistema-solar', page: 'home' },
    ...CATEGORIAS.filter(c => c.menu).map(c => ({ label: c.nome, href: `categoria.html?cat=${c.key}`, page: c.key })),
    { label: 'Glossário', href: 'glossario.html', page: 'glossario' },
    { label: 'Sobre', href: 'sobre.html', page: 'sobre' }
  ];
}

function renderHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;
  el.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="brand"><img src="img/logo/logo-dark.png" width="50"> Visão do Espaço</a>
      <nav class="main-nav">
        ${navItems().map(i => `<a href="${i.href}" data-page="${i.page}">${i.label}</a>`).join('')}
      </nav>
      <div class="header-tools">
        <div class="search-box">
          <input type="text" placeholder="Buscar no Universo..." data-search-input autocomplete="off" />
          <div class="search-results" data-search-results></div>
        </div>
        <button class="nav-toggle" aria-label="Abrir menu">☰</button>
      </div>
    </div>`;
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  const links = [
    `<li><a href="index.html#sistema-solar">Sistema Solar</a></li>`,
    ...CATEGORIAS.filter(c => c.menu).map(c => `<li><a href="categoria.html?cat=${c.key}">${c.nome}</a></li>`),
    `<li><a href="glossario.html">Glossário</a></li>`
  ].join('');
  el.innerHTML = `
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <div class="brand" style="margin-bottom:14px"><span class="mark"></span> Visão do Espaço</div>
        <p>Uma enciclopédia visual do Universo — planetas, luas, estrelas e galáxias, explorados como num museu virtual.</p>
      </div>
      <div class="footer-cols">
        <div><h4>Explorar</h4><ul>${links}</ul></div>
        <div>
          <h4>Projeto</h4>
          <ul>
            <li><a href="sobre.html">Sobre</a></li>
            <li><a href="index.html">Página inicial</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>© 2026 Visão do Espaço — projeto educacional, não afiliado à NASA ou ESA.</span>
      <span>Dados estruturados em JSON · HTML5 · CSS3 · JavaScript puro</span>
    </div>`;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Categoria da URL atual. Aceita ?cat=estrelas e o formato antigo ?tipo=estrela|galaxia */
function resolveCat() {
  const legacy = { estrela: 'estrelas', galaxia: 'galaxias' };
  const cat = getParam('cat') || legacy[getParam('tipo')] || getParam('tipo');
  return cat || 'estrelas';
}

function mountLayout() {
  renderHeader();
  renderFooter();
}

document.addEventListener('DOMContentLoaded', mountLayout);
