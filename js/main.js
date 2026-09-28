/* =========================================================
   VISÃO DO ESPAÇO — main.js
   Ponto de entrada: identifica a página atual e renderiza
   seu conteúdo dinamicamente a partir dos arquivos JSON.
   ========================================================= */

const SYMBOLS = { mercurio:'☿', venus:'♀', terra:'🜨', marte:'♂', saturno:'♄', sol:'☉' };
const CURIOSIDADES = [
  'A luz do Sol leva cerca de 8 minutos para alcançar a Terra — quando você olha para o Sol, está vendo o passado.',
  'Um dia em Vênus é mais longo que um ano em Vênus.',
  'Os anéis de Saturno têm até 280 mil km de diâmetro, mas menos de 1 km de espessura em alguns pontos.',
  'Titã, a maior lua de Saturno, é o único satélite do Sistema Solar com lagos líquidos em sua superfície.',
  'A Via Láctea colidirá com a galáxia de Andrômeda em cerca de 4,5 bilhões de anos.',
  'Fobos, lua de Marte, está se aproximando do planeta e pode se romper em alguns milhões de anos.'
];

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  try {
    if (page === 'home') await renderHome();
    else if (page === 'planeta') await renderPlanetaPage();
    else if (page === 'lua') await renderLuaPage();
    else if (page === 'objeto') await renderObjetoPage();
    else if (page === 'categoria') await renderCategoriaPage();
    else if (page === 'glossario') await renderGlossarioPage();
  } catch (err) {
    console.error(err);
  }
  initReveal();
});

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */
async function renderHome() {
  const [planetas, estrelas] = await Promise.all([VisaoData.getPlanetas(), VisaoData.getEstrelas()]);
  const heroObjects = [estrelas[0], ...planetas];

  const heroEl = document.querySelector('.hero-slider');
  if (heroEl) {
    createHeroSlider(heroEl, heroObjects, (obj) => {
      const isSol = obj.id === 'sol';
      const href = isSol ? `objeto.html?cat=estrelas&id=${obj.id}` : `planeta.html?id=${obj.id}`;
      const ring = obj.id === 'saturno' ? ' has-ring' : '';
      return `
        <div class="hero-slide">
          <div class="glow" style="--slide-color:${obj.cor_predominante}55"></div>
          <div class="hero-slide-content">
            <span class="symbol">${obj.simbolo || ''}</span>
            <div class="eyebrow">${isSol ? 'Estrela central' : `Planeta · Ordem ${obj.ordem}`}</div>
            <h1>${obj.nome}</h1>
            <p class="lead">${obj.descricao_curta}</p>
            <a class="btn primary" href="${href}">Explorar ${obj.nome} →</a>
          </div>
          <div class="orb${ring}" style="--orb-color:${obj.cor_predominante}"></div>
        </div>`;
    });
  }

  // categorias
  const categorias = [
    { ic:'☉', nome:'Sistema Solar', desc:'Planetas, luas e o Sol que os governa.', href:'index.html#sistema-solar' },
    ...CATEGORIAS.filter(c => c.menu).map(c => ({ ic:c.icone, nome:c.nome, desc:c.descricao, href:`categoria.html?cat=${c.key}` })),
    { ic:'§', nome:'Glossário', desc:'Termos essenciais para explorar o Universo.', href:'glossario.html' },
    { ic:'ℹ', nome:'Sobre o projeto', desc:'Conheça a proposta do Visão do Espaço.', href:'sobre.html' }
  ];
  const catGrid = document.querySelector('[data-categorias]');
  if (catGrid) {
    catGrid.innerHTML = categorias.map(c => `
      <a class="cat-card reveal" href="${c.href}">
        <span class="ic">${c.ic}</span>
        <h3>${c.nome}</h3>
        <p>${c.desc}</p>
      </a>`).join('');
  }

  // sistema solar (destaques)
  const solarGrid = document.querySelector('[data-sistema-solar]');
  if (solarGrid) {
    solarGrid.innerHTML = planetas.map(p => objectCardHTML(p, `planeta.html?id=${p.id}`, `Planeta · ${p.tipo}`)).join('');
  }

  // uma seção com slider para cada categoria que tenha itens
  const secWrap = document.querySelector('[data-category-sections]');
  const homeCats = CATEGORIAS.filter(c => c.home);
  const homeData = await Promise.all(homeCats.map(c => VisaoData.getItens(c.key)));
  if (secWrap) {
    secWrap.innerHTML = homeCats.map((c, i) => homeData[i].length ? `
      <section id="${c.key}">
        <div class="wrap">
          <div class="section-head reveal">
            <div>
              <div class="eyebrow">Explore o Universo</div>
              <h2>${c.nome}</h2>
              <p>${c.descricao}</p>
            </div>
            <a class="cat-section-link" href="categoria.html?cat=${c.key}">Ver todos (${homeData[i].length}) →</a>
          </div>
          <div class="hslider-wrap">
            <div class="hslider" data-hslider-track>${homeData[i].map(o => cardDe(c, o)).join('')}</div>
            <div class="hslider-arrows">
              <button data-hs-prev aria-label="Anterior">←</button>
              <button data-hs-next aria-label="Próximo">→</button>
            </div>
          </div>
        </div>
      </section>` : '').join('');
    secWrap.querySelectorAll('.hslider-wrap').forEach(enableHSlider);
  }

  // curiosidade do dia (determinística pelo dia, mistura textos fixos + data/curiosidades.json)
  const curiosityEl = document.querySelector('[data-curiosidade]');
  if (curiosityEl) {
    const extras = homeData[homeCats.findIndex(c => c.key === 'curiosidades')] || [];
    const pool = [...CURIOSIDADES, ...extras.map(c => c.descricao_curta).filter(Boolean)];
    curiosityEl.textContent = pool[Math.floor(Date.now() / 86400000) % pool.length];
  }

  // linha do tempo
  const timelineEl = document.querySelector('[data-timeline]');
  if (timelineEl) {
    const eventos = [
      { ano: '1957', texto: 'Lançamento do Sputnik 1, primeiro satélite artificial da história.' },
      { ano: '1969', texto: 'Missão Apollo 11 pousa os primeiros humanos na Lua.' },
      { ano: '1977', texto: 'Lançamento das sondas Voyager 1 e 2 rumo aos planetas exteriores.' },
      { ano: '1990', texto: 'Telescópio Espacial Hubble é colocado em órbita.' },
      { ano: '2004', texto: 'Sonda Cassini-Huygens entra em órbita de Saturno.' },
      { ano: '2021', texto: 'Telescópio Espacial James Webb é lançado ao espaço.' }
    ];
    timelineEl.innerHTML = eventos.map(e => `
      <div class="timeline-item">
        <div class="year mono">${e.ano}</div>
        <p>${e.texto}</p>
      </div>`).join('');
  }
}

/* ---------------------------------------------------------
   PÁGINA DE PLANETA
   --------------------------------------------------------- */
async function renderPlanetaPage() {
  const id = getParam('id');
  const root = document.querySelector('[data-detail-root]');
  const planetas = await VisaoData.getPlanetas();
  const planeta = planetas.find(p => p.id === id);
  if (!planeta) return renderNotFound(root, 'Planeta não encontrado.');

  document.title = `${planeta.nome} — Visão do Espaço`;
  renderDetailHero(planeta, `Planeta · Posição ${planeta.ordem} a partir do Sol`);
  renderFactGrid(planetaFacts(planeta));

  const luas = await VisaoData.getLuasDoPlaneta(planeta.id);
  const luasSection = document.querySelector('[data-luas-section]');
  if (luasSection) {
    if (luas.length) {
      luasSection.querySelector('[data-hslider-track]').innerHTML =
        luas.map(l => objectCardHTML(l, `lua.html?id=${l.id}`, `Lua de ${planeta.nome}`)).join('');
      enableHSlider(luasSection);
    } else {
      luasSection.innerHTML = `<div class="empty-state">${planeta.nome} não possui luas conhecidas.</div>`;
    }
  }

  renderRichSections(planeta.secoes);
  renderGallery(planeta);
}

/* ---------------------------------------------------------
   PÁGINA DE LUA
   --------------------------------------------------------- */
async function renderLuaPage() {
  const id = getParam('id');
  const root = document.querySelector('[data-detail-root]');
  const luas = await VisaoData.load('luas');
  const lua = luas.find(l => l.id === id);
  if (!lua) return renderNotFound(root, 'Lua não encontrada.');

  document.title = `${lua.nome} — Visão do Espaço`;
  const crumbEl = document.querySelector('[data-crumbs]');
  if (crumbEl) crumbEl.innerHTML = `<a href="index.html">Início</a> / <a href="planeta.html?id=${lua.planeta}">${lua.planeta_nome}</a> / ${lua.nome}`;

  renderDetailHero(lua, `Lua de ${lua.planeta_nome}`, false);
  renderFactGrid(luaFacts(lua));
  renderRichSections(lua.secoes);
  renderGallery(lua);

  // luas irmãs (relacionadas)
  const relSection = document.querySelector('[data-relacionados-section]');
  if (relSection) {
    const irmas = luas.filter(l => l.planeta === lua.planeta && l.id !== lua.id);
    if (irmas.length) {
      relSection.querySelector('[data-hslider-track]').innerHTML =
        irmas.map(l => objectCardHTML(l, `lua.html?id=${l.id}`, `Lua de ${lua.planeta_nome}`)).join('');
      enableHSlider(relSection);
    } else {
      relSection.closest('section').style.display = 'none';
    }
  }
}

/* ---------------------------------------------------------
   PÁGINA GENÉRICA (qualquer categoria de data/*.json)
   --------------------------------------------------------- */
async function renderObjetoPage() {
  const cat = VisaoData.getCategoria(resolveCat());
  const id = getParam('id');
  const root = document.querySelector('[data-detail-root]');
  if (!cat) return renderNotFound(root, 'Categoria não encontrada.');
  const lista = await VisaoData.getItens(cat.key);
  const obj = lista.find(o => o.id === id);
  if (!obj) return renderNotFound(root, 'Objeto não encontrado.');
  if (!obj.cor_predominante) obj.cor_predominante = cat.cor;

  document.title = `${obj.nome} — Visão do Espaço`;
  const crumbEl = document.querySelector('[data-crumbs]');
  if (crumbEl) crumbEl.innerHTML = `<a href="index.html">Início</a> / <a href="categoria.html?cat=${cat.key}">${cat.nome}</a> / ${obj.nome}`;

  const kicker = cat.singular + (obj.tipo ? ` · ${obj.tipo}` : obj.tipo_espectral ? ` · ${obj.tipo_espectral}` : '');
  renderDetailHero(obj, kicker);
  const symbolEl = document.querySelector('[data-symbol]');
  if (symbolEl && !obj.simbolo) symbolEl.textContent = cat.icone;

  const facts = genericFacts(obj);
  if (facts.length) renderFactGrid(facts);
  else { const sec = document.querySelector('[data-dados-section]'); if (sec) sec.style.display = 'none'; }

  renderRichSections(obj.secoes);
  renderGallery(obj);

  const outros = lista.filter(o => o.id !== obj.id);
  const relSection = document.querySelector('[data-relacionados-section]');
  if (relSection && outros.length) {
    relSection.style.display = '';
    const eb = relSection.querySelector('[data-rel-eyebrow]');
    if (eb) eb.textContent = `Mais em ${cat.nome}`;
    relSection.querySelector('[data-hslider-track]').innerHTML = outros.map(o => cardDe(cat, o)).join('');
    enableHSlider(relSection);
  }
}

/* ---------------------------------------------------------
   PÁGINA DE CATEGORIA (categoria.html?cat=...)
   --------------------------------------------------------- */
async function renderCategoriaPage() {
  const cat = VisaoData.getCategoria(getParam('cat'));
  const root = document.querySelector('[data-cat-root]');
  if (!cat) return renderNotFound(root, 'Categoria não encontrada.');
  const itens = await VisaoData.getItens(cat.key);

  document.title = `${cat.nome} — Visão do Espaço`;
  const set = (sel, v) => { const e = document.querySelector(sel); if (e) e.textContent = v; };
  set('[data-cat-icon]', cat.icone);
  set('[data-cat-title]', cat.nome);
  set('[data-cat-desc]', cat.descricao);
  set('[data-cat-count]', `${itens.length} ${itens.length === 1 ? 'objeto catalogado' : 'objetos catalogados'}`);
  const glow = document.querySelector('.cat-hero .glow');
  if (glow) glow.style.setProperty('--slide-color', cat.cor + '55');

  const sliderSec = document.querySelector('[data-cat-slider-section]');
  const gridEl = document.querySelector('[data-cat-grid]');
  if (!itens.length) {
    if (sliderSec) sliderSec.style.display = 'none';
    gridEl.outerHTML = `<div class="empty-state">Nenhum item em <span class="mono">${cat.arquivo}</span> ainda. Adicione objetos ao JSON e eles aparecerão aqui.</div>`;
    return;
  }
  const cards = itens.map(o => cardDe(cat, o)).join('');
  if (itens.length > 3) {
    sliderSec.querySelector('[data-hslider-track]').innerHTML = cards;
    enableHSlider(sliderSec);
  } else if (sliderSec) sliderSec.style.display = 'none';
  gridEl.innerHTML = cards;
}

/* ---------------------------------------------------------
   GLOSSÁRIO
   --------------------------------------------------------- */
async function renderGlossarioPage() {
  const termos = await VisaoData.getGlossario();
  const el = document.querySelector('[data-glossario-list]');
  if (!el) return;
  el.innerHTML = termos.map(t => `
    <dt id="${VisaoData.slugify(t.termo)}">${t.termo}</dt>
    <dd>${t.definicao}</dd>`).join('');
}

/* ---------------------------------------------------------
   HELPERS DE RENDERIZAÇÃO COMPARTILHADOS
   --------------------------------------------------------- */
function renderDetailHero(obj, kicker, showSymbol = true) {
  const heroEl = document.querySelector('.detail-hero');
  if (!heroEl) return;
  applyObjectColor(heroEl, obj.cor_predominante || '#7b6fd6');
  const ring = obj.id === 'saturno' ? ' has-ring' : '';
  heroEl.querySelector('[data-eyebrow]').textContent = kicker;
  heroEl.querySelector('[data-title]').textContent = obj.nome;
  heroEl.querySelector('[data-lead]').textContent = obj.descricao_completa || obj.descricao_curta;
  const orbEl = heroEl.querySelector('.orb');
  if (orbEl) {
    orbEl.className = `orb${ring}`;
    orbEl.style.setProperty('--orb-color', obj.cor_predominante || '#7b6fd6');
  }
  const symbolEl = heroEl.querySelector('[data-symbol]');
  if (symbolEl) symbolEl.textContent = showSymbol ? (obj.simbolo || '') : '';
}

function renderFactGrid(facts) {
  const grid = document.querySelector('[data-fact-grid]');
  if (!grid) return;
  grid.innerHTML = facts.map(f => `
    <div class="fact">
      <div class="label">${f.label}</div>
      <div class="value">${f.value}</div>
    </div>`).join('');
}

function renderRichSections(secoes) {
  const el = document.querySelector('[data-rich-sections]');
  if (!el || !secoes) return;
  const labels = {
    historia: 'História', caracteristicas: 'Características', formacao: 'Formação',
    atmosfera: 'Atmosfera', geologia: 'Geologia', curiosidades: 'Curiosidades',
    exploracao: 'Exploração espacial', missoes: 'Missões', bibliografia: 'Bibliografia'
  };
  el.innerHTML = Object.entries(secoes).map(([key, val]) => {
    if (val == null || val === '' || (Array.isArray(val) && !val.length)) return '';
    const label = labels[key] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
    const content = Array.isArray(val)
      ? `<ul>${val.map(v => `<li>${v}</li>`).join('')}</ul>`
      : `<p>${val}</p>`;
    return `
      <div class="rich-section reveal">
        <h3>${label}</h3>
        <div class="body">${content}</div>
      </div>`;
  }).join('');
}

function renderGallery(obj) {
  const el = document.querySelector('[data-gallery-track]');
  if (!el) return;
  const items = obj.galeria && obj.galeria.length ? obj.galeria : [obj.imagem_capa];
  el.innerHTML = items.map(() => `<div class="orb" style="--orb-color:${obj.cor_predominante || '#7b6fd6'}"></div>`).join('');
  const wrap = el.closest('.hslider-wrap');
  if (wrap) enableHSlider(wrap);
}

/** Card de um item de categoria (cor e link vêm da categoria) */
function cardDe(cat, obj) {
  const kicker = cat.singular + (obj.tipo ? ` · ${obj.tipo}` : obj.tipo_espectral ? ` · ${obj.tipo_espectral}` : '');
  return objectCardHTML(obj, VisaoData.hrefDe(cat, obj), kicker, cat.cor);
}

/** Campos reconhecidos automaticamente (ordem = ordem de exibição). Qualquer um presente no JSON vira um "fato". */
const FIELD_LABELS = {
  diametro:'Diâmetro', raio:'Raio', massa:'Massa', gravidade:'Gravidade', temperatura:'Temperatura',
  tipo:'Tipo', tipo_espectral:'Tipo espectral', luminosidade:'Luminosidade', idade:'Idade',
  distancia:'Distância', distancia_terra:'Relação com a Terra', numero_estrelas:'Nº de estrelas',
  periodo_orbital:'Período orbital', periodo_rotacao:'Rotação', composicao:'Composição',
  descoberta:'Descoberta', localizacao:'Localização'
};

/** Fatos automáticos + campo opcional "dados": {"Rótulo": "valor"} ou [{label, value}] para qualquer dado extra */
function genericFacts(o) {
  const facts = Object.entries(FIELD_LABELS).filter(([k]) => o[k]).map(([k, label]) => ({ label, value: o[k] }));
  if (Array.isArray(o.dados)) facts.push(...o.dados.map(d => ({ label: d.label, value: d.value })));
  else if (o.dados && typeof o.dados === 'object') facts.push(...Object.entries(o.dados).map(([label, value]) => ({ label, value })));
  return facts;
}

function renderNotFound(root, msg) {
  if (root) root.innerHTML = `<section class="wrap"><div class="empty-state">${msg}</div></section>`;
}

/* ---------------------------------------------------------
   TABELAS DE FATOS POR TIPO DE OBJETO
   --------------------------------------------------------- */
function planetaFacts(p) {
  return [
    { label: 'Diâmetro', value: p.diametro }, { label: 'Massa', value: p.massa },
    { label: 'Gravidade', value: p.gravidade }, { label: 'Temperatura', value: p.temperatura },
    { label: 'Rotação', value: p.periodo_rotacao }, { label: 'Translação', value: p.periodo_orbital },
    { label: 'Nº de luas', value: p.numero_luas }, { label: 'Distância do Sol', value: p.distancia_sol },
    { label: 'Tipo', value: p.tipo }
  ];
}
function luaFacts(l) {
  return [
    { label: 'Diâmetro', value: l.diametro }, { label: 'Massa', value: l.massa },
    { label: 'Gravidade', value: l.gravidade }, { label: 'Temperatura', value: l.temperatura },
    { label: 'Distância do planeta', value: l.distancia_planeta }, { label: 'Período orbital', value: l.periodo_orbital },
    { label: 'Planeta', value: l.planeta_nome }
  ];
}
function estrelaFacts(s) {
  return [
    { label: 'Diâmetro', value: s.diametro }, { label: 'Massa', value: s.massa },
    { label: 'Gravidade', value: s.gravidade }, { label: 'Temperatura', value: s.temperatura },
    { label: 'Tipo espectral', value: s.tipo_espectral }, { label: 'Idade', value: s.idade }
  ];
}
function galaxiaFacts(g) {
  return [
    { label: 'Diâmetro', value: g.diametro }, { label: 'Massa', value: g.massa },
    { label: 'Tipo', value: g.tipo }, { label: 'Nº de estrelas', value: g.numero_estrelas },
    { label: 'Relação com a Terra', value: g.distancia_terra }
  ];
}
