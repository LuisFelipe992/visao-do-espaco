/* =========================================================
   VISÃO DO ESPAÇO — comparar.js
   Seleciona objetos de qualquer categoria e monta uma tabela
   comparativa, reutilizando as mesmas funções de "fatos" que
   as páginas de detalhe já usam (planetaFacts, luaFacts, etc,
   definidas em main.js).
   ========================================================= */

const COMPARE_FACTS_BY_COLLECTION = {
  planetas: typeof planetaFacts !== 'undefined' ? planetaFacts : null,
  luas: typeof luaFacts !== 'undefined' ? luaFacts : null,
  estrelas: typeof estrelaFacts !== 'undefined' ? estrelaFacts : null,
  galaxias: typeof galaxiaFacts !== 'undefined' ? galaxiaFacts : null
};

async function initComparar() {
  const root = document.querySelector('[data-comparar-root]');
  if (!root) return;

  const comboInput = document.querySelector('[data-combo-input]');
  const comboList = document.querySelector('[data-combo-list]');
  const clearBtn = document.querySelector('[data-compare-clear]');
  const chipsEl = document.querySelector('[data-compare-chips]');
  const tableWrap = document.querySelector('[data-compare-table]');

  // ?ids=lua,plutao na URL inicia a comparação já preenchida
  const params = new URLSearchParams(location.search);
  let selected = params.has('ids')
    ? params.get('ids').split(',').map(s => s.trim()).filter(Boolean)
    : getCompareList();

  const index = (await VisaoData.getIndex()).filter(i => i.categoria !== 'glossário');
  index.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  index.forEach(i => { i.cid = hrefId(i.href); });

  function hrefId(href) {
    try { return new URL(href, location.href).searchParams.get('id'); }
    catch (e) { return null; }
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- combobox com busca ---------- */
  let active = -1;
  let shown = [];

  function openList(open) {
    comboList.classList.toggle('open', open);
    comboInput.setAttribute('aria-expanded', open);
  }

  function renderCombo() {
    const q = normalize(comboInput.value.trim());
    const rank = i => {
      const n = normalize(i.nome);
      if (n.startsWith(q)) return 0;
      if (n.includes(q)) return 1;
      return 2; // casou só por tags/categoria
    };
    shown = (q ? index.filter(i => normalize(i.nome + ' ' + (i.extra || '') + ' ' + i.categoria).includes(q)) : [...index])
      .sort((a, b) => rank(a) - rank(b) || a.nome.localeCompare(b.nome, 'pt-BR'))
      .slice(0, 30);
    active = shown.length ? 0 : -1;
    comboList.innerHTML = shown.length
      ? shown.map((i, n) => {
          const done = selected.includes(i.cid);
          return `<div class="combo-item${n === active ? ' active' : ''}${done ? ' done' : ''}" role="option" data-n="${n}">
            <span>${i.nome}</span><span class="tag">${i.icone || '●'} ${capitalize(i.categoria)}${done ? ' ✓' : ''}</span></div>`;
        }).join('')
      : `<div class="combo-none">Nenhum objeto encontrado para “${comboInput.value}”.</div>`;
    openList(true);
  }

  function setActive(n) {
    if (!shown.length) return;
    active = (n + shown.length) % shown.length;
    comboList.querySelectorAll('.combo-item').forEach((el, i) => el.classList.toggle('active', i === active));
    comboList.querySelector('.combo-item.active')?.scrollIntoView({ block: 'nearest' });
  }

  function pick(n) {
    const item = shown[n];
    if (!item || !item.cid) return;
    if (!selected.includes(item.cid)) { selected.push(item.cid); persist(); render(); }
    comboInput.value = '';
    renderCombo();
    comboInput.focus();
  }

  comboInput.addEventListener('focus', renderCombo);
  comboInput.addEventListener('input', renderCombo);
  comboInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (active >= 0) pick(active); }
    else if (e.key === 'Escape') openList(false);
  });
  comboList.addEventListener('mousedown', e => {
    const el = e.target.closest('.combo-item');
    if (el) { e.preventDefault(); pick(+el.dataset.n); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('[data-combo]')) openList(false); });

  clearBtn.addEventListener('click', () => { selected = []; persist(); render(); });

  function persist() { setCompareList(selected); }

  function factsFor(obj) {
    const fn = COMPARE_FACTS_BY_COLLECTION[obj._colecao];
    return (fn ? fn(obj) : genericFacts(obj)).filter(f => f.value != null && f.value !== '');
  }

  async function render() {
    const objs = (await Promise.all(selected.map(id => VisaoData.getById(id)))).filter(Boolean);
    selected = objs.map(o => o.id); // remove ids inválidos
    persist();

    chipsEl.innerHTML = objs.length
      ? objs.map(o => `<span class="compare-chip">${o.nome}<button type="button" data-remove="${o.id}" aria-label="Remover ${o.nome}">×</button></span>`).join('')
      : `<span class="compare-chip compare-chip-empty">Nenhum objeto selecionado ainda — escolha acima.</span>`;
    chipsEl.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      selected = selected.filter(id => id !== b.dataset.remove);
      persist(); render();
    }));

    if (objs.length < 2) {
      tableWrap.innerHTML = `<div class="empty-state">Selecione pelo menos 2 objetos para ver a comparação.</div>`;
      return;
    }

    const perObj = objs.map(obj => ({ obj, facts: factsFor(obj) }));
    const labels = [];
    perObj.forEach(p => p.facts.forEach(f => { if (!labels.includes(f.label)) labels.push(f.label); }));

    const header = `
      <div class="compare-row compare-head">
        <div class="compare-cell compare-label"></div>
        ${perObj.map(p => `
          <div class="compare-cell compare-obj">
            <div class="orb" style="${orbStyle(p.obj)}"></div>
            <div class="name">${p.obj.nome}</div>
          </div>`).join('')}
      </div>`;

    const rows = labels.map(label => `
      <div class="compare-row">
        <div class="compare-cell compare-label">${label}</div>
        ${perObj.map(p => {
          const f = p.facts.find(x => x.label === label);
          return `<div class="compare-cell">${f ? f.value : '—'}</div>`;
        }).join('')}
      </div>`).join('');

    tableWrap.innerHTML = `<div class="compare-grid-wrap"><div class="compare-grid" style="--cols:${perObj.length}">${header}${rows}</div></div>`;
  }

  render();
}

document.addEventListener('DOMContentLoaded', initComparar);
