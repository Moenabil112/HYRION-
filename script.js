/* HYRION Vision Book — interactions
   Scroll progress · side rail active section · live telemetry · reveal · lang toggle (FR/EN/AR) */

(function () {
  const sections = Array.from(document.querySelectorAll('section.page, section.closing'));
  const sideLinks = Array.from(document.querySelectorAll('.siderail a'));
  const progressBar = document.getElementById('progress');
  const tRead = document.getElementById('t-read');
  const tSection = document.getElementById('t-section');
  const tPct = document.getElementById('t-pct');

  // Default labels (FR) — will be overridden by translations.js if loaded
  let sectionLabels = (window.HYRION_SECTION_LABELS && window.HYRION_SECTION_LABELS.fr) || {
    cover: 'Couverture', index: '00 · Sommaire', observation: '01 · Observation',
    identity: '02 · Identité', infrastructure: '03 · Infrastructure', value: '04 · Valeur',
    partnership: '05 · Partenariat', advisor: '06 · Conseiller', closing: '07 · Clôture'
  };

  /* ----- scroll progress + active section ----- */
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = Math.min(100, Math.max(0, (h.scrollTop / max) * 100));
    if (progressBar) progressBar.style.width = pct.toFixed(1) + '%';
    if (tPct) tPct.textContent = Math.round(pct) + ' %';

    const midline = window.scrollY + window.innerHeight * 0.4;
    let active = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= midline) active = s;
    }
    const id = active.id;
    sideLinks.forEach(a => {
      const match = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', match);
    });
    if (tSection) tSection.textContent = sectionLabels[id] || id;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ----- reading timer ----- */
  let start = Date.now();
  function tick() {
    const s = Math.floor((Date.now() - start) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    if (tRead) tRead.textContent = mm + ':' + ss;
  }
  setInterval(tick, 1000);

  /* ----- reveal on scroll ----- */
  const revealEls = document.querySelectorAll('.callout, .arquote, .functions, .dimensions, .timeline, .mandate, .identity-grid, .mono-block');
  revealEls.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ===== LANGUAGE TOGGLE (FR / EN / AR) =====
     Each translation entry is [selector, fr, en, ar].
     - FR/EN/AR: swap innerHTML for every entry to that language slot.
     - AR also: body.ar-mode (RTL + Alexandria font via CSS).
  */
  const T = window.HYRION_TRANSLATIONS || [];
  const LANG_IDX = { fr: 1, en: 2, ar: 3 };

  function setLang(lang) {
    const slot = LANG_IDX[lang];
    if (slot != null) {
      T.forEach(entry => {
        const sel = entry[0];
        const html = entry[slot];
        if (html == null) return;
        const el = document.querySelector(sel);
        if (!el) return;
        el.innerHTML = html;
      });

      // Side rail labels
      const labels = (window.HYRION_SIDERAIL && window.HYRION_SIDERAIL[lang]) || null;
      if (labels) {
        sideLinks.forEach((a, i) => {
          const lab = a.querySelector('.label');
          if (lab && labels[i] != null) lab.textContent = labels[i];
        });
      }
      // Section labels for telemetry
      const slMap = (window.HYRION_SECTION_LABELS && window.HYRION_SECTION_LABELS[lang]) || null;
      if (slMap) sectionLabels = slMap;
    }

    // Arabic full mode → RTL + Alexandria
    const isAR = lang === 'ar';
    document.body.classList.toggle('ar-mode', isAR);
    document.documentElement.lang = lang;
    document.documentElement.dir = isAR ? 'rtl' : 'ltr';

    onScroll();
  }

  const langBtns = document.querySelectorAll('.lang-toggle button');
  langBtns.forEach(b => {
    b.addEventListener('click', () => {
      langBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      setLang(b.dataset.lang);
    });
  });

  /* ----- smooth in-page navigation ----- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 40, behavior: 'smooth' });
      }
    });
  });
})();
