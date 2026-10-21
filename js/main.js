/* Mesón Barrero — comportamiento de la página
   - cabecera transparente → sólida al bajar
   - idioma ES/PT/EN (sin cookies; preferencia en localStorage)
   - horario e indicador abierto/cerrado en hora de Madrid
   - navegación de categorías de la carta
   - enlaces de WhatsApp con mensaje preparado según idioma */
(function () {
  'use strict';
  var I = window.I18N || { langs: ['es'], ui: { es: {} }, dict: [] };
  var PHONE = '34654794293';

  /* Cabecera */
  var hd = document.querySelector('.site-header'), hero = document.querySelector('.hero');
  function onScroll() { if (hd) hd.classList.toggle('solid', !hero || window.scrollY > hero.offsetHeight - 90); }
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* Idiomas */
  var lang = 'es', map = {};
  I.dict.forEach(function (r) { map[r[0]] = { es: r[0], pt: r[1], en: r[2] }; });
  var nodes = [];
  (function walk(n) {
    for (var c = n.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { var t = c.nodeValue; if (t.trim() && map[t.trim()]) nodes.push({ n: c, es: t }); }
      else if (c.nodeType === 1 && !/^(SCRIPT|STYLE|SVG)$/.test(c.tagName) && !c.classList.contains('lang')) walk(c);
    }
  })(document.body);
  var attrNodes = [];
  document.querySelectorAll('[aria-label],[title]').forEach(function (el) {
    ['aria-label', 'title'].forEach(function (a) { var v = el.getAttribute(a); if (v && map[v]) attrNodes.push({ el: el, a: a, es: v }); });
  });

  function waLink(l) {
    var U = I.ui[l] || I.ui.es;
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(U.wa || 'Hola');
  }
  function setLang(l) {
    if (!I.ui[l]) l = 'es';
    lang = l;
    nodes.forEach(function (o) { var k = o.es.trim(), tr = map[k][l] || k; o.n.nodeValue = o.es.replace(k, tr); });
    attrNodes.forEach(function (o) { o.el.setAttribute(o.a, map[o.es][l] || o.es); });
    document.documentElement.lang = l;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'); });
    document.querySelectorAll('a.wa').forEach(function (a) { a.href = waLink(l); });
    renderHours();
    try { localStorage.setItem('mb-lang', l); } catch (e) { /* almacenamiento no disponible: se ignora */ }
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.lang button').forEach(function (b) { b.addEventListener('click', function () {
    if (reduce || b.dataset.lang === lang) { setLang(b.dataset.lang); return; }
    var els = document.querySelectorAll('main, footer');
    els.forEach(function (e) { e.classList.add('fading'); });
    setTimeout(function () { setLang(b.dataset.lang); els.forEach(function (e) { e.classList.remove('fading'); }); }, 150);
  }); });

  /* Horario: todos los días 11:00–22:00 (minutos desde medianoche, hora de Madrid) */
  var H = { 0: [[660, 1320]], 1: [[660, 1320]], 2: [[660, 1320]], 3: [[660, 1320]], 4: [[660, 1320]], 5: [[660, 1320]], 6: [[660, 1320]] };
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return h + ':' + (mm < 10 ? '0' + mm : mm); }
  var now = new Date(), d = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }, hh = 0, mm = 0, wk = '';
    parts.forEach(function (x) { if (x.type === 'weekday') wk = x.value; if (x.type === 'hour') hh = parseInt(x.value, 10) % 24; if (x.type === 'minute') mm = parseInt(x.value, 10); });
    if (wk in wd) { d = wd[wk]; mins = hh * 60 + mm; }
  } catch (e) { /* sin Intl: hora local del visitante */ }
  var ul = document.getElementById('hours'), st = document.getElementById('status'), txt = document.getElementById('status-text');
  /* Franjas de servicio (hora de Madrid): comidas 13:00–16:00, cenas 20:00–22:00 */
  var MEALS = [[780, 960, 'meal'], [1200, 1320, 'dinner']];
  function mealNow() { for (var i = 0; i < MEALS.length; i++) if (mins >= MEALS[i][0] && mins < MEALS[i][1]) return MEALS[i]; return null; }
  /* Botones del hero según el momento: en servicio → llamar; abierto → reservar; cerrado → consultar por WhatsApp */
  var ctaMain = document.getElementById('cta-main'), ctaAlt = document.getElementById('cta-alt');
  function setCta(mode) {
    if (!ctaMain || !ctaAlt) return;
    var t = function (es) { return (map[es] && map[es][lang]) || es; };
    ctaMain.classList.remove('wa');
    if (mode === 'service') { ctaMain.href = 'tel:+34654794293'; ctaMain.textContent = t('Llamar · 654 79 42 93'); ctaAlt.href = '#carta'; ctaAlt.textContent = t('Ver la carta de hoy'); }
    else if (mode === 'open') { ctaMain.href = '#reservas'; ctaMain.textContent = t('Reservar mesa'); ctaAlt.href = '#carta'; ctaAlt.textContent = t('Descubrir la carta'); }
    else { ctaMain.href = waLink(lang); ctaMain.classList.add('wa'); ctaMain.target = '_blank'; ctaMain.rel = 'noopener'; ctaMain.textContent = t('Consultar disponibilidad'); ctaAlt.href = '#carta'; ctaAlt.textContent = t('Descubrir la carta'); }
    if (mode !== 'closed') { ctaMain.removeAttribute('target'); ctaMain.removeAttribute('rel'); }
    document.body.setAttribute('data-mode', mode);
  }
  function renderHours() {
    var U = I.ui[lang] || I.ui.es, names = U.days || [];
    if (ul) {
      ul.innerHTML = '';
      [1, 2, 3, 4, 5, 6, 0].forEach(function (i) {
        var li = document.createElement('li'); if (i === d) li.className = 'today';
        var a = document.createElement('span'); a.textContent = names[i] || '';
        var b = document.createElement('span'); b.textContent = H[i].length ? H[i].map(function (r) { return fmt(r[0]) + ' – ' + fmt(r[1]); }).join(', ') : U.closedDay;
        li.appendChild(a); li.appendChild(b); ul.appendChild(li);
      });
    }
    if (!st || !txt) return;
    var open = false, closesAt = null;
    H[d].forEach(function (r) { if (mins >= r[0] && mins < r[1]) { open = true; closesAt = r[1]; } });
    st.classList.remove('open', 'closed');
    var meal = open ? mealNow() : null;
    if (open) { st.classList.add('open'); txt.textContent = meal ? U[meal[2]] + fmt(Math.min(meal[1], closesAt)) : U.open + fmt(closesAt); }
    setCta(!open ? 'closed' : meal ? 'service' : 'open');
    if (!open) {
      st.classList.add('closed'); var nextTxt = '';
      for (var k = 0; k < 7 && !nextTxt; k++) {
        var di = (d + k) % 7, rs = H[di];
        for (var j = 0; j < rs.length; j++) {
          if (k === 0 && rs[j][0] <= mins) continue;
          nextTxt = (k === 0 ? U.today : k === 1 ? U.tomorrow : U.on + (names[di] || '').toLowerCase()) + ' ' + fmt(rs[j][0]); break;
        }
      }
      txt.textContent = U.closed + (nextTxt ? U.opens + nextTxt : '');
    }
  }

  /* Copiar teléfono */
  function copy(t, btn, labelKey) {
    var U = I.ui[lang] || I.ui.es;
    function done(ok) { btn.textContent = ok ? U.copied : U.selectCopy; setTimeout(function () { btn.textContent = map[labelKey] ? map[labelKey][lang] : labelKey; }, 1800); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); });
      else done(false);
    } catch (e) { done(false); }
  }
  var cp = document.getElementById('copy-phone');
  if (cp) cp.addEventListener('click', function () { copy('654794293', cp, 'Copiar número'); });

  /* Navegación de la carta: resalta la categoría visible */
  var catLinks = document.querySelectorAll('.cat-nav a');
  if (catLinks.length && 'IntersectionObserver' in window) {
    var byId = {}; catLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { catLinks.forEach(function (a) { a.removeAttribute('aria-current'); }); if (byId[e.target.id]) byId[e.target.id].setAttribute('aria-current', 'true'); } });
    }, { rootMargin: '-140px 0px -60% 0px' });
    document.querySelectorAll('.grp[id]').forEach(function (g) { io.observe(g); });
  }

  /* Año del pie */
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* Idioma inicial: guardado → navegador → español */
  var init = '';
  try { init = localStorage.getItem('mb-lang') || ''; } catch (e) { init = ''; }
  if (!I.ui[init]) { var nl = (navigator.language || 'es').slice(0, 2).toLowerCase(); init = I.ui[nl] ? nl : 'es'; }
  setLang(init);
})();
