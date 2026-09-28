/* =========================================================
   VISÃO DO ESPAÇO — slider.js
   ========================================================= */

/** Slider de tela cheia (hero da home) */
function createHeroSlider(container, slidesData, renderSlide) {
  const track = container.querySelector('.hero-track');
  const dotsWrap = container.querySelector('.hero-nav');
  const prevBtn = container.querySelector('[data-hero-prev]');
  const nextBtn = container.querySelector('[data-hero-next]');

  track.innerHTML = slidesData.map(renderSlide).join('');
  dotsWrap.innerHTML = slidesData.map((_, i) => `<button class="hero-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join('');

  let current = 0;
  let timer = null;
  const dots = [...dotsWrap.querySelectorAll('.hero-dot')];

  function go(i) {
    current = (i + slidesData.length) % slidesData.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), 6500);
  }

  dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.i)));
  prevBtn?.addEventListener('click', () => go(current - 1));
  nextBtn?.addEventListener('click', () => go(current + 1));

  // swipe touch support
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 50) go(current + (delta < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  resetTimer();
  return { go };
}

/** Slider horizontal genérico (luas, galeria, relacionados) com setas */
function enableHSlider(wrapEl) {
  const track = wrapEl.querySelector('.hslider');
  const prev = wrapEl.querySelector('[data-hs-prev]');
  const next = wrapEl.querySelector('[data-hs-next]');
  if (!track) return;
  const scrollAmount = () => Math.min(track.clientWidth * 0.8, 480);
  prev?.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
}
