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

  const picker = document.querySelector('[data-compare-picker]');
  const addBtn = document.querySelector('[data-compare-add]');
  const clearBtn = document.querySelector('[data-compare-clear]');
  const chipsEl = document.querySelector('[data-compare-chips]');
  const tableWrap = document.querySelector('[data-compare-table]');

  // ?ids=lua,plutao na URL inicia a comparação já preenchida
  const params = new URLSearchParams(location.search);
  let selected = params.has('ids')
    ? params.get('ids').split(',').map(s => s.trim()).filter(Boolean)
    : getCompareList();

  const index = (await VisaoData.getIndex()).filter(i => i.categoria !== 'glossário');
  picker.innerHTML = index
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map(i => `<option value="${hrefId(i.href)}">${i.nome} — ${capitalize(i.categoria)}</option>`)
    .join('');

  function hrefId(href) {
    try { return new URL(href, location.href).searchParams.get('id'); }
    catch (e) { return null; }
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  addBtn.addEventListener('click', () => {
    const id = picker.value;
    if (id && !selected.includes(id)) { selected.push(id); persist(); render(); }
  });
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
