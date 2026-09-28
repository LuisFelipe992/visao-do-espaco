/* =========================================================
   VISÃO DO ESPAÇO — loader.js
   Camada única de acesso aos dados (JSON sob demanda + cache)

   >>> REGISTRO DE CATEGORIAS <<<
   Menu, home, busca, páginas de listagem e detalhes são todos
   gerados a partir da lista CATEGORIAS abaixo.
   - Novo OBJETO  -> basta adicionar no JSON da categoria.
   - Nova CATEGORIA -> adicionar uma linha aqui + criar o JSON.
   ========================================================= */

const CATEGORIAS = [
  { key: 'estrelas',       arquivo: 'data/estrelas.json',       nome: 'Estrelas',       singular: 'Estrela',      icone: '✦', cor: '#f5c451', menu: true, home: true,
    descricao: 'Gigantes cósmicas, anãs vermelhas e estrelas próximas que iluminam o Universo.' },
  { key: 'galaxias',       arquivo: 'data/galaxias.json',       nome: 'Galáxias',       singular: 'Galáxia',      icone: '✧', cor: '#8f7bff', menu: true, home: true,
    descricao: 'Ilhas cósmicas com bilhões de estrelas, gás, poeira e matéria escura.' },
  { key: 'buracos-negros', arquivo: 'data/buracos-negros.json', nome: 'Buracos Negros', singular: 'Buraco negro', icone: '●', cor: '#6e3fd6', menu: true, home: true,
    descricao: 'Regiões onde a gravidade é tão intensa que nem a luz consegue escapar.' },
  { key: 'asteroides',     arquivo: 'data/asteroides.json',     nome: 'Asteroides',     singular: 'Asteroide',    icone: '☄', cor: '#9a8f80', menu: true, home: true,
    descricao: 'Remanescentes rochosos da formação do Sistema Solar.' },
  { key: 'curiosidades',   arquivo: 'data/curiosidades.json',   nome: 'Curiosidades',   singular: 'Curiosidade',  icone: '✺', cor: '#3fa0f5', menu: true, home: true,
    descricao: 'Fatos surpreendentes sobre o Cosmos que desafiam a intuição.' },
  { key: 'outros',         arquivo: 'data/outros.json',         nome: 'Outros',         singular: 'Objeto',       icone: '◌', cor: '#4fc3a1', menu: true, home: true,
    descricao: 'Cometas, nebulosas, planetas anões e tudo o que não cabe nas outras gavetas.' },
  // luas: usam página própria e aparecem dentro dos planetas (não entram no menu/home)
  { key: 'luas',           arquivo: 'data/luas.json',           nome: 'Luas',           singular: 'Lua',          icone: '☾', cor: '#c9c5d6', menu: false, home: false,
    descricao: 'Companheiras naturais dos planetas.', detalhe: i => `lua.html?id=${i.id}` }
];

const DATA_SOURCES = {
  planetas: 'data/planetas.json',
  glossario: 'data/glossario.json',
  ...Object.fromEntries(CATEGORIAS.map(c => [c.key, c.arquivo]))
};

const VisaoData = (() => {
  const cache = {};

  /** Carrega um JSON. Arquivo ausente/inválido vira lista vazia (não quebra o site). */
  async function load(colecao) {
    if (cache[colecao]) return cache[colecao];
    const path = DATA_SOURCES[colecao];
    if (!path) throw new Error(`Coleção desconhecida: ${colecao}`);
    let json = [];
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      json = await res.json();
    } catch (err) {
      console.warn(`[VisaoData] Não foi possível carregar ${path}:`, err.message);
    }
    cache[colecao] = Array.isArray(json) ? json : [];
    return cache[colecao];
  }

  async function loadAll() {
    const keys = Object.keys(DATA_SOURCES);
    const results = await Promise.all(keys.map(load));
    return keys.reduce((acc, key, i) => (acc[key] = results[i], acc), {});
  }

  function getCategoria(key) { return CATEGORIAS.find(c => c.key === key) || null; }
  async function getItens(key) { return load(key); }

  /** URL da página de detalhe de um item de categoria */
  function hrefDe(cat, item) {
    return cat.detalhe ? cat.detalhe(item) : `objeto.html?cat=${cat.key}&id=${encodeURIComponent(item.id)}`;
  }

  async function getById(id) {
    const all = await loadAll();
    for (const key of ['planetas', ...CATEGORIAS.map(c => c.key)]) {
      const found = (all[key] || []).find(o => o.id === id);
      if (found) return { ...found, _colecao: key };
    }
    return null;
  }

  async function getPlanetas() {
    const arr = await load('planetas');
    return [...arr].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
  }

  async function getEstrelas() { return load('estrelas'); }
  async function getGalaxias() { return load('galaxias'); }
  async function getGlossario() { return load('glossario'); }

  async function getLuasDoPlaneta(planetaId) {
    const luas = await load('luas');
    return luas.filter(l => l.planeta === planetaId);
  }

  /** Índice plano de tudo, usado pela busca */
  async function getIndex() {
    const all = await loadAll();
    const index = [];
    const tagsDe = o => (Array.isArray(o.tags) ? o.tags : []).join(' ');
    all.planetas.forEach(p => index.push({ nome: p.nome, extra: tagsDe(p), categoria: 'planeta', href: `planeta.html?id=${p.id}` }));
    CATEGORIAS.forEach(c => (all[c.key] || []).forEach(o =>
      index.push({ nome: o.nome, extra: tagsDe(o), categoria: c.singular.toLowerCase(), icone: c.icone, href: hrefDe(c, o) })));
    all.glossario.forEach(t => index.push({ nome: t.termo, extra: '', categoria: 'glossário', href: `glossario.html#${slugify(t.termo)}` }));
    return index;
  }

  function slugify(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  return { load, loadAll, getById, getCategoria, getItens, hrefDe, getPlanetas, getEstrelas, getGalaxias, getGlossario, getLuasDoPlaneta, getIndex, slugify };
})();
