/* =========================================================
   VISÃO DO ESPAÇO — search.js
   ========================================================= */

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function initSearch() {
  const input = document.querySelector('[data-search-input]');
  const resultsBox = document.querySelector('[data-search-results]');
  if (!input || !resultsBox) return;

  let index = null;

  const icons = { planeta: '●', 'glossário': '§' };

  function render(query) {
    const q = normalize(query.trim());
    if (!q) { resultsBox.classList.remove('open'); resultsBox.innerHTML = ''; return; }
    const matches = index.filter(item => normalize(item.nome + ' ' + (item.extra || '')).includes(q)).slice(0, 8);
    resultsBox.innerHTML = matches.length
      ? matches.map(m => `<a href="${m.href}"><span class="tag">${m.icone || icons[m.categoria] || '•'} ${m.categoria}</span>${m.nome}</a>`).join('')
      : `<div class="none">Nenhum objeto encontrado para “${query}”.</div>`;
    resultsBox.classList.add('open');
  }

  input.addEventListener('focus', async () => {
    if (!index) index = await VisaoData.getIndex();
    if (input.value) render(input.value);
  });

  input.addEventListener('input', async () => {
    if (!index) index = await VisaoData.getIndex();
    render(input.value);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) resultsBox.classList.remove('open');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = resultsBox.querySelector('a');
      if (first) window.location.href = first.getAttribute('href');
    }
  });
}
