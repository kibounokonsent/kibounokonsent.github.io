/* ============================================================================
   js/util.js — 共通の小道具（通常は編集不要）
   ============================================================================ */
window.OA = window.OA || {};

OA.$ = (s, r = document) => r.querySelector(s);
OA.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 決まった値から同じ乱数列を作る（都市ごとに同じ街並みになるように）
OA.rng = function (seed) {
  let h = 2166136261;
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  return function () {
    s += 0x6D2B79F5; let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

OA.ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
OA.lerp = (a, b, t) => a + (b - a) * t;
OA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// 値をなめらかに変化させる
OA.tween = function (dur, fn, done) {
  const t0 = performance.now();
  let stop = false;
  (function step(now) {
    if (stop) return;
    const t = Math.min(1, (now - t0) / dur);
    fn(OA.ease(t), t);
    if (t < 1) requestAnimationFrame(step); else if (done) done();
  })(t0);
  return () => { stop = true; };
};

OA.store = {
  get(k, d) { try { const v = localStorage.getItem('oa:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('oa:' + k, JSON.stringify(v)); } catch (e) { /* 保存できない環境でも動く */ } },
};

/* ----------------------------------------------------------------------------
   本文の書式（data/articles/world.js の説明を参照）を HTML にする
   ---------------------------------------------------------------------------- */
OA.inline = function (s) {
  return OA.esc(s).replace(/\[\[([a-z0-9\-]+)(?:\|([^\]]+))?\]\]/gi, (m, id, label) =>
    `<button type="button" class="alink" data-article="${id}">${label || id}</button>`);
};
OA.renderBody = function (text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  let html = '', para = [], list = [];
  const flushP = () => { if (para.length) { html += `<p>${OA.inline(para.join(''))}</p>`; para = []; } };
  const flushL = () => { if (list.length) { html += `<ul>${list.map(i => `<li>${OA.inline(i)}</li>`).join('')}</ul>`; list = []; } };
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) { flushP(); flushL(); continue; }
    let m;
    if ((m = line.match(/^【(.+)】$/))) { flushP(); flushL(); html += `<h2>${OA.esc(m[1])}</h2>`; continue; }
    if ((m = line.match(/^「([^」]+)」$/))) { flushP(); flushL(); html += `<h3>${OA.esc(m[1])}</h3>`; continue; }
    if ((m = line.match(/^[・\-]\s*(.+)$/))) { flushP(); list.push(m[1]); continue; }
    if ((m = line.match(/^>\s*(.+)$/))) { flushP(); flushL(); html += `<p class="note">${OA.inline(m[1])}</p>`; continue; }
    flushL(); para.push(line);
  }
  flushP(); flushL();
  return html;
};
OA.plain = text => String(text || '').replace(/\[\[[^|\]]+\|?([^\]]*)\]\]/g, '$1').replace(/[【】「」・>]/g, ' ');

/* ----------------------------------------------------------------------------
   データの整理：都市・キャラクターからも資料室の記事を自動で作る
   ---------------------------------------------------------------------------- */
OA.layerOf = id => ORIGIN.world.layers.find(l => l.id === id) || ORIGIN.world.layers[1];
OA.city = id => ORIGIN.cities.find(c => c.id === id);
OA.char = id => ORIGIN.characters.find(c => c.id === id);

OA.allArticles = function () {
  const list = ORIGIN.articles.slice();
  for (const c of ORIGIN.cities) {
    const chars = ORIGIN.characters.filter(ch => ch.city === c.id);
    const L = OA.layerOf(c.layer);
    list.push({
      id: c.id, cat: 'city', title: c.name, en: c.en, lede: c.summary, city: c.id, auto: true,
      facts: [['区分', c.type], ['階層', L.name], ['特徴', c.features.join('、')], ['文化', c.culture.join('、')], ['役割', c.role]],
      body: (c.about || '') +
        (c.spots && c.spots.length ? '\n【街の中で調べられる場所】\n' + c.spots.map(s => '・' + s.name).join('\n') + '\n' : '') +
        (chars.length ? '\n【この街にいる人物】\n' + chars.map(ch => `・[[${ch.id}|${ch.name}]]`).join('\n') + '\n' : ''),
      related: c.related || [],
    });
  }
  for (const ch of ORIGIN.characters) {
    const c = OA.city(ch.city);
    list.push({
      id: ch.id, cat: 'character', title: ch.name, en: ch.en || '', lede: ch.lede || '', char: ch.id, sample: ch.sample, auto: true,
      facts: Object.entries(ch.profile || {}), body: ch.about || '', related: (c ? [c.id] : []).concat(ch.related || []),
    });
  }
  return list;
};
