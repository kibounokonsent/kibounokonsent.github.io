/* =========================================================
   狂乱病院 ARCHIVE — core
   データ（js/data/）を読んで画面を組み立てるだけのプログラム。
   記事の追加・修正で、このファイルを触る必要はありません。
   ========================================================= */
(() => {
  'use strict';

  /* ───────── storage（使えない環境でも落ちないように） ───────── */
  const store = {
    get(k, d, s = sessionStorage) { try { const v = s.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v, s = sessionStorage) { try { s.setItem(k, JSON.stringify(v)); } catch { /* noop */ } },
  };
  const local = { get: (k, d) => store.get(k, d, localStorage), set: (k, v) => store.set(k, v, localStorage) };

  /* ───────── utils ───────── */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const ART = {};
  ARTICLES.forEach((a) => {
    if (!a || !a.id) return;
    if (ART[a.id]) console.warn('[狂乱病院] 記事IDが重複しています:', a.id);
    if (!CAT[a.cat]) console.warn('[狂乱病院] 存在しないカテゴリー:', a.id, a.cat);
    ART[a.id] = a;
  });
  const ALL = Object.values(ART);
  const byUpdated = (a, b) => String(b.updated || '').localeCompare(String(a.updated || '')) || a.title.localeCompare(b.title, 'ja');
  const fmtDate = (d) => (d ? String(d).replace(/-/g, '.') : '----.--.--');

  /* =========================================================
     ネタバレモード
       'safe'    … ネタバレなし（初見向け）：spoiler の記事・節・ブロック・情報行・||文字|| を完全に消す
       'spoiler' … ネタバレあり（完全資料集）：すべて表示し、注意を出す
     ========================================================= */
  const MODES = ['safe', 'spoiler'];
  let mode = local.get('kh-mode', null);
  if (!MODES.includes(mode)) mode = null;
  const spoilerOn = () => mode === 'spoiler';
  const catVisible = (c) => !!c && (!c.spoiler || spoilerOn());
  const CATS = () => CATEGORIES.filter(catVisible);
  const visible = (a) => !!a && catVisible(CAT[a.cat]) && (spoilerOn() || !a.spoiler) && (!a.madness || sanity.value <= 0);
  const LIST = () => ALL.filter(visible);
  const get = (id) => (visible(ART[id]) ? ART[id] : null);
  const fileNo = (a) => String(LIST().indexOf(a) + 1).padStart(3, '0');
  const inCat = (id) => LIST().filter((a) => a.cat === id);
  const showPart = (p) => !p || !p.spoiler || spoilerOn();

  /* 本文の書式： [[id]] [[id|表示名]] **太字** ==血文字== {{黒塗り}} ||ネタバレ文字|| */
  function inline(text) {
    let s = esc(text);
    s = s.replace(/\|\|(.+?)\|\|/g, (_, t) => (spoilerOn() ? `<span class="spoil-inline" title="ネタバレ">${t}</span>` : ''));
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, id, label) => {
      const raw = ART[id.trim()];
      const a = get(id.trim());
      const name = label || (raw ? raw.title : id);
      if (!raw) { console.warn('[狂乱病院] リンク先がありません:', id); return `<span class="deadlink" title="記録なし">${name}</span>`; }
      if (!a) return name; // ネタバレなしモードでは、リンクを外して文字だけ残す
      return `<a class="wlink" href="#/article/${a.id}">${name}</a>`;
    });
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/==(.+?)==/g, '<em class="blood">$1</em>');
    s = s.replace(/\{\{(.+?)\}\}/g, '<span class="redact" tabindex="0" title="黒塗り">$1</span>');
    return s.replace(/\n/g, '<br>');
  }
  const plain = (t) => String(t ?? '')
    .replace(/\|\|(.+?)\|\|/g, (_, x) => (spoilerOn() ? x : ''))
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, id, l) => l || (ART[id] ? ART[id].title : id))
    .replace(/\*\*|==|\{\{|\}\}/g, '');
  const infoOf = (a) => (a.info || []).filter((r) => !r[2] || spoilerOn());
  const sectionsOf = (a) => (a.sections || []).filter(showPart);

  /* ───────── icons ───────── */
  const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    cross: P('<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>'),
    person: P('<circle cx="12" cy="7.5" r="3.5"/><path d="M4.5 21c.6-4.2 3.6-6.5 7.5-6.5s6.9 2.3 7.5 6.5"/><path d="M10.5 7.2h.01M13.5 7.2h.01" stroke-width="2.2"/>'),
    scalpel: P('<path d="M3 21l9.5-9.5"/><path d="M12.5 11.5L20 4c1 1 1 3-.5 4.5L14 14z"/><path d="M6.5 17.5l1 1"/>'),
    bed: P('<path d="M3 6v13M21 13v6M3 15h18v-2a3 3 0 00-3-3h-7v5"/><circle cx="7" cy="11.5" r="1.8"/>'),
    claw: P('<path d="M5 20c2-6 2-11 0-16 4 3 6 7 6 12"/><path d="M11 20c1.5-5 1.5-9 .5-13 3.5 3 5 6.5 4.5 11"/><path d="M17 20c1-3 1-6 .5-8.5 2.5 2 3.5 4.5 3 7.5"/>'),
    door: P('<path d="M5 21V4a1 1 0 011-1h12a1 1 0 011 1v17"/><path d="M3 21h18"/><path d="M15 12h.01" stroke-width="2.4"/><path d="M8 7h6"/>'),
    pulse: P('<path d="M2 12h4l2-5 3 10 3-12 2 7h6"/>'),
    branch: P('<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10M6 12c0-3 4-5 10-0"/><path d="M8 12h8"/>'),
    book: P('<path d="M4 4.5A1.5 1.5 0 015.5 3H20v16H5.5A1.5 1.5 0 004 20.5z"/><path d="M4 20.5A1.5 1.5 0 005.5 22H20v-3"/><path d="M9 8h7"/>'),
    search: P('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>'),
    eye: P('<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>'),
    eyeOff: P('<path d="M3 3l18 18"/><path d="M10.6 5.6A10.6 10.6 0 0112 5.5c6.4 0 10 6.5 10 6.5a17.4 17.4 0 01-3.2 3.9M6.4 6.9C3.6 8.7 2 12 2 12s3.6 6.5 10 6.5c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>'),
    back: P('<path d="M15 5l-7 7 7 7"/>'),
    next: P('<path d="M9 5l7 7-7 7"/>'),
    sound: P('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>'),
    mute: P('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
    list: P('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />'),
  };

  /* ───────── logo（SITE.logo が空なら文字タイトル） ───────── */
  function logoHTML(kind) {
    const src = kind === 'small' ? (SITE.logoSmall || SITE.logo) : SITE.logo;
    if (src) return `<img class="logo-img logo-img--${kind}" src="${esc(src)}" alt="${esc(SITE.title)}">`;
    return `<span class="logo-text logo-text--${kind}" data-text="${esc(SITE.title)}">${esc(SITE.title)}</span>`;
  }

  /* トップ用ロゴ：まず <img> で表示し、読み込めたらインラインSVGに置き換えて演出をかける */
  function heroLogoHTML() {
    return `<span class="hl" role="img" aria-label="${esc(SITE.title)} ${esc(SITE.subtitle || '')}"><img class="hl-img" src="${esc(SITE.heroLogo)}" alt=""></span>`;
  }

  /* ───────── sanity gauge ───────── */
  const FX = Object.assign({ entryGate: true, sanityGauge: true, sanityLoss: 6, sanityDrain: { seconds: 15, amount: 1 }, redactLoss: 3, whispers: true, corruption: true, zeroRot: 0.22, destroy: true, destroyHits: 7, jumpscare: true, sound: true, soundVolume: 0.7, ambient: true, ambientVolume: 0.6, ecg: true }, SITE.effects || {});
  let effectsOn = local.get('kh-effects', true);
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fxActive = () => effectsOn && !reduceMotion;

  const sanity = {
    value: store.get('kh-sanity', 100),
    seen: new Set(store.get('kh-seen', [])),
    locked: local.get('kh-lock', false),      // 精神安定剤：true のあいだ減らない
    level(v = this.value) { return !FX.sanityGauge ? 'high' : v <= 0 ? 'zero' : v < 30 ? 'low' : v < 60 ? 'mid' : 'high'; },
    paint() {
      document.documentElement.dataset.sanity = this.level();
      document.documentElement.dataset.lock = this.locked ? 'on' : 'off';
      const g = $('#sanity');
      if (!g) return;
      g.hidden = !FX.sanityGauge;
      g.style.setProperty('--v', Math.max(0, this.value) + '%');
      $('#sanity-num').textContent = this.value <= 0 ? '狂気' : String(this.value).padStart(3, '0');
      const lb = $('#sanity-lock');
      if (lb) lb.textContent = this.locked ? '安定剤をやめる（ゲージが減る）' : '精神安定剤を投与（減らなくなる）';
      $('#sanity-lock-icon').hidden = !this.locked;
    },
    /* 値を変える唯一の入口 */
    set(v, opts = {}) {
      const before = this.value;
      const lvBefore = this.level(before);
      this.value = Math.max(0, Math.min(100, Math.round(v)));
      store.set('kh-sanity', this.value);
      this.paint();
      if (this.value < before && !opts.quiet) {
        const g = $('#sanity');
        g.classList.remove('hit'); void g.offsetWidth; g.classList.add('hit');
        corrupt.burst();
        if (before - this.value >= 3 && this.value > 0) sfx.thump(before - this.value >= 6 ? .7 : .45);   // 大きく削れると心臓が跳ねる
      }
      const lvAfter = this.level();
      if (before > 0 && this.value === 0) { madness(); route(true); }          // 0 のときだけの記事が現れる
      else if (before === 0 && this.value > 0) route(true);                   // 正気に戻ると消える
      if (lvBefore !== lvAfter) { corrupt.restart(); amb.retune(); }
    },
    lose(n) { if (FX.sanityGauge && !this.locked && this.value > 0) this.set(this.value - n); },
    visit(id) {
      if (!FX.sanityGauge || this.seen.has(id)) return;
      this.seen.add(id);
      store.set('kh-seen', [...this.seen]);
      this.lose(FX.sanityLoss || 6);
    },
    reset() {
      this.seen.clear(); store.set('kh-seen', []); store.set('kh-redact', []);
      wreck.clear();
      $('#gore').innerHTML = '';
      this.set(100, { quiet: true });
    },
    toggleLock() { this.locked = !this.locked; local.set('kh-lock', this.locked); this.paint(); },
  };
  /* 作者確認用：ブラウザのコンソールで khSanity(0) と打つとゲージを直接変更 */
  window.khSanity = (v) => sanity.set(Number(v));
  window.khJumpscare = () => jumpscare();   // 作者確認用：ジャンプスケアだけを見る

  /* 記事を読んでいるあいだ、じわじわ削れる */
  let readingId = null;
  setInterval(() => {
    const d = FX.sanityDrain;
    if (readingId && d && d.amount && document.visibilityState === 'visible') sanity.lose(d.amount);
  }, Math.max(3, (FX.sanityDrain && FX.sanityDrain.seconds) || 15) * 1000);

  /* 黒塗りを覗くと削れる（1か所につき1回） */
  function peekRedact(el) {
    if (el.dataset.peeked) return;
    el.dataset.peeked = '1';
    const key = (location.hash + '|' + el.textContent).slice(0, 200);
    const done = store.get('kh-redact', []);
    if (done.includes(key)) return;
    done.push(key); store.set('kh-redact', done);
    sanity.lose(FX.redactLoss || 3);
  }

  function madness() {
    sfx.alarm();
    const el = document.createElement('div');
    el.className = 'madness';
    el.innerHTML = `<div class="madness-inner"><p class="madness-en">SANITY 000</p><p class="madness-ja">精神ゲージが 0 になりました</p><p class="madness-sub">あなたは、もう平常ではいられない。<br>……記録が、増えている。</p>${FX.destroy ? '<p class="madness-hint">古い記録が、邪魔だ。<br>叩いて、壊せ。</p>' : ''}<button class="btn btn--ghost" type="button">それでも読む</button></div>`;
    document.body.appendChild(el);
    $('button', el).addEventListener('click', () => el.remove());
  }

  /* =========================================================
     狂気の演出エンジン
     精神ゲージの段階（mid / low / zero）に合わせて
       ・文字化け（本文の一部が一瞬化ける）
       ・ノイズ（画面が裂ける・色がずれる）
       ・責める言葉が一瞬チラつく
     をだんだん激しくする。演出OFF・視差効果を減らす設定では止まる。
     ========================================================= */
  const MOJI = SITE.mojibake || '縺繧繝ｿ譁蟄怜喧縺代€ゅ\uFFFDｧ髮ｻ蜒譛ｬ蠖薙¢髯｢逞ｲ荳ｭ辟｡莉･蜈ｨ驛ｨ竊鍋ｴ\uFFFD';
  const TIERS = {
    mid:  { moji: [2600, 5200, 1, .30, 140, 320], noise: [9000, 16000],  blame: null },
    low:  { moji: [900, 2200, 2, .45, 160, 520],  noise: [3500, 7500],   blame: [6500, 12000, 1] },
    zero: { moji: [450, 1300, 4, .6, 200, 750],   noise: [1600, 4200],   blame: [2400, 5200, 3] },
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* トップのロゴ（インラインSVG化・赤ずれ/グリッチ用の複製・文字化け） */
  const heroLogo = {
    cache: null,
    async mount() {
      const box = document.querySelector('.hl');
      if (!box || !SITE.heroLogo) return;
      try {
        if (!this.cache) {
          const r = await fetch(SITE.heroLogo);
          if (!r.ok) throw new Error('logo');
          this.cache = await r.text();
        }
        const doc = new DOMParser().parseFromString(this.cache, 'image/svg+xml');
        const root = doc.documentElement;
        if (doc.querySelector('parsererror') || root.nodeName.toLowerCase() !== 'svg') throw new Error('svg');
        root.querySelectorAll('script, foreignObject').forEach((n) => n.remove());
        if (!box.isConnected) return;
        const main = document.importNode(root, true);
        main.removeAttribute('width'); main.removeAttribute('height');
        main.setAttribute('aria-hidden', 'true'); main.removeAttribute('role'); main.removeAttribute('aria-label');
        main.classList.add('hl-main');
        main.querySelectorAll('[id]').forEach((el) => {
          let m = el.id.match(/^kh-g(\d+)$/); if (m) el.setAttribute('data-i', m[1]);
          m = el.id.match(/^kh-alt-(\d+)-(\d+)$/); if (m) { el.setAttribute('data-alt-i', m[1]); if (!el.getAttribute('display')) el.style.display = 'none'; }
        });
        const ghost = (cls) => {
          const c = main.cloneNode(true);
          c.classList.remove('hl-main'); c.classList.add('hl-ghost', cls);
          c.querySelectorAll('[data-role="fx"], [data-role="junk"]').forEach((n) => n.remove());
          if (cls === 'hl-shadow') c.querySelectorAll('[data-role="top"], [data-role="sub"]').forEach((n) => n.remove()); /* 赤い下ずれは英字に付けない */
          c.querySelectorAll('[filter], [mask]').forEach((n) => { n.removeAttribute('filter'); n.removeAttribute('mask'); });
          c.querySelectorAll('defs').forEach((n) => n.remove());
          c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
          return c;
        };
        /* ゆれ（jitter）はロゴ全体（英字も）にかける */
        const wrapIn = (svg) => {
          const els = [...svg.children].filter((n) => n.tagName !== 'defs');
          if (!els.length) return;
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', 'hl-body');
          svg.insertBefore(g, els[0]); els.forEach((n) => g.appendChild(n));
        };
        this.junk = [...main.querySelectorAll('[data-role="junk"] > path')].map((n) => n.cloneNode(true));
        wrapIn(main);
        const ghosts = ['hl-shadow', 'hl-a', 'hl-b'].map((c) => { const g = ghost(c); wrapIn(g); return g; });
        box.replaceChildren(ghosts[0], main, ghosts[1], ghosts[2]);
        box.classList.add('is-live');
      } catch (e) { /* 読み込めない（file:// で開いた等）ときは <img> のまま表示 */ }
    },
    /* 化け字に一瞬だけ差し替えて、元に戻す */
    moji(count, minMs, maxMs) {
      const box = document.querySelector('.hl.is-live');
      if (!box) return;
      const main = box.querySelector('.hl-main');
      const slots = [...new Set([...main.querySelectorAll('[data-alt-i]')].map((n) => n.getAttribute('data-alt-i')))];
      if (!slots.length) return;
      const n = Math.min(slots.length, 1 + Math.floor(Math.random() * count));
      [...slots].sort(() => Math.random() - 0.5).slice(0, n).forEach((i) => {
        if (box.dataset['m' + i]) return;
        const alts = [...main.querySelectorAll(`[data-alt-i="${i}"]`)];
        const v = Math.floor(Math.random() * alts.length);
        const set = (on) => box.querySelectorAll('svg').forEach((svg) => {
          const g = svg.querySelector(`[data-i="${i}"]`);
          const a = svg.querySelectorAll(`[data-alt-i="${i}"]`)[v];
          if (g) g.style.display = on ? 'none' : '';
          if (a) a.style.display = on ? 'inline' : 'none';
        });
        box.dataset['m' + i] = '1'; set(true);
        setTimeout(() => { set(false); delete box.dataset['m' + i]; }, rnd(minMs, maxMs));
      });
      this.mojiEn(box, main, count, minMs, maxMs);
    },
    /* 英字：1文字ずつ別の記号に化けさせる（#kh-top / #kh-sub が1文字1pathのときだけ） */
    mojiEn(box, main, count, minMs, maxMs) {
      if (!this.junk || !this.junk.length) return;
      if (!this.en) {
        this.en = [];
        ['top', 'sub'].forEach((role) => {
          const grp = main.querySelector(`[data-role="${role}"]`);
          if (!grp || grp.children.length < 5) return;
          const kids = [...grp.children];
          const bbs = kids.map((n) => n.getBBox());
          const hs = bbs.map((b) => b.height).sort((x, y) => x - y);
          const cap = hs[Math.floor(hs.length / 2)];
          const ys = bbs.map((b) => b.y + b.height / 2).sort((x, y) => x - y);
          const cy = ys[Math.floor(ys.length / 2)];
          kids.forEach((n, k) => this.en.push({ role, k, cx: bbs[k].x + bbs[k].width / 2, cy, cap, fill: n.getAttribute('fill') }));
        });
      }
      if (!this.en.length) return;
      const n = Math.min(this.en.length, 1 + Math.floor(Math.random() * count * 1.5));
      [...this.en].sort(() => Math.random() - 0.5).slice(0, n).forEach((L) => {
        const key = `e${L.role}${L.k}`;
        if (box.dataset[key]) return;
        const tpl = this.junk[Math.floor(Math.random() * this.junk.length)];
        const added = [];
        box.querySelectorAll('svg').forEach((svg) => {
          const grp = svg.querySelector(`[data-role="${L.role}"]`);
          if (!grp) return;
          const orig = [...grp.children].filter((c) => !c.classList.contains('hl-junk'))[L.k];
          if (!orig) return;
          const j = tpl.cloneNode(true);
          j.removeAttribute('id'); j.classList.add('hl-junk');
          if (L.fill) j.setAttribute('fill', L.fill);
          j.setAttribute('transform', `translate(${L.cx} ${L.cy}) scale(${L.cap})`);
          orig.style.display = 'none'; grp.appendChild(j); added.push([orig, j]);
        });
        box.dataset[key] = '1';
        setTimeout(() => { added.forEach(([o, j]) => { o.style.display = ''; j.remove(); }); delete box.dataset[key]; }, rnd(minMs, maxMs));
      });
    },
  };

  const corrupt = {
    timers: [],
    nodes: [],
    scan() {
      const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim().length > 1 && !n.parentElement.closest('button, input, .spoil-mark, svg, .is-mad, .remnant') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      this.nodes = [];
      while (w.nextNode()) this.nodes.push(w.currentNode);
    },
    stop() { this.timers.forEach(clearTimeout); this.timers = []; },
    restart() {
      this.stop();
      const t = TIERS[sanity.level()];
      if (!t || !FX.corruption) return;
      const loop = (range, fn) => {
        if (!range) return;
        const go = () => { this.timers.push(setTimeout(() => { if (fxActive() && document.visibilityState === 'visible') fn(); go(); }, rnd(range[0], range[1]))); };
        go();
      };
      loop(t.moji, () => this.mojibake(t.moji));
      loop(t.noise, () => this.noise());
      loop(t.blame, () => this.blame(t.blame[2]));
    },
    /* 文字化け：テキストを一瞬だけ化けさせて、元に戻す */
    mojibake([, , count, rate, minMs, maxMs]) {
      if (!this.nodes.length) return;
      const n = 1 + Math.floor(Math.random() * count);
      for (let i = 0; i < n; i++) {
        const node = pick(this.nodes);
        if (!node.isConnected || node.__kh) continue;
        const orig = node.nodeValue;
        const bad = [...orig].map((c) => (/\s/.test(c) || Math.random() > rate ? c : MOJI[Math.floor(Math.random() * MOJI.length)])).join('');
        node.__kh = true;
        node.nodeValue = bad;
        node.parentElement?.classList.add('is-moji');
        setTimeout(() => {
          if (node.nodeValue === bad) node.nodeValue = orig;
          node.parentElement?.classList.remove('is-moji');
          node.__kh = false;
        }, rnd(minMs, maxMs));
      }
      if (Math.random() < 0.4) heroLogo.moji(count, minMs, maxMs); // ロゴの文字も化ける
      if (Math.random() < 0.5) sfx.tick();
    },
    /* ノイズ：画面が裂けて色がずれる */
    noise() {
      const fx = $('#noise');
      fx.querySelectorAll('.tear').forEach((t) => {
        t.style.top = rnd(0, 95) + 'vh';
        t.style.height = rnd(2, 14) + 'vh';
        t.style.setProperty('--dx', rnd(-40, 40) + 'px');
      });
      const dur = rnd(140, 380);
      document.documentElement.classList.add('is-glitch');
      sfx.static(dur / 1000 + .05);
      setTimeout(() => document.documentElement.classList.remove('is-glitch'), dur);
    },
    /* 責める言葉が一瞬チラつく */
    blame(max) {
      const words = SITE.blameTexts || [];
      if (!words.length) return;
      const n = 1 + Math.floor(Math.random() * max);
      sfx.blame(rnd(.16, .3));
      for (let i = 0; i < n; i++) {
        const el = document.createElement('span');
        el.className = 'blame' + (Math.random() < .3 ? ' blame--red' : '') + (Math.random() < .25 ? ' blame--v' : '');
        el.textContent = pick(words);
        el.style.left = rnd(4, 70) + 'vw';
        el.style.top = rnd(12, 82) + 'vh';
        el.style.fontSize = Math.round(rnd(26, sanity.value <= 0 ? 96 : 64)) + 'px';
        el.style.transform = `rotate(${rnd(-8, 8)}deg)`;
        $('#blames').appendChild(el);
        const life = rnd(110, 260);
        setTimeout(() => el.remove(), life);
      }
    },
    /* ゲージが減った瞬間の小さなノイズ */
    burst() { if (fxActive() && sanity.level() !== 'high') this.noise(); },
  };

  /* =========================================================
     音（ブラウザ内で合成。音声ファイルは不要）
     effects.sound: false で無音。演出OFF・ヘッダーの音ボタンOFFでも無音。
       ・sfx … 叩く／扉／注射／悲鳴／ノイズ／責める声など、その場で鳴る効果音
       ・amb … 心電図モニター・蛍光灯の唸り・空調のノイズ・院内の物音（常に流れる環境音）
               精神ゲージの段階（high / mid / low / zero）で、だんだん不穏になる
     ========================================================= */
  let soundOn = local.get('kh-sound', true);
  let actx = null, master = null;
  function audio() {
    if (!FX.sound || !effectsOn || !soundOn) return null;
    try {
      if (!actx) {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        const comp = actx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.ratio.value = 4;
        master = actx.createGain(); master.gain.value = FX.soundVolume ?? 0.7;
        master.connect(comp); comp.connect(actx.destination);
      }
      if (actx.state === 'suspended' && document.visibilityState === 'visible') actx.resume();
      return actx;
    } catch { return null; }
  }
  /* ノイズの素材（作るのは最初の1回だけ） */
  const BUF = {};
  function whiteBuf(c) {
    if (BUF.white) return BUF.white;
    const b = c.createBuffer(1, c.sampleRate * 4, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return (BUF.white = b);
  }
  function pinkBuf(c) {
    if (BUF.pink) return BUF.pink;
    const b = c.createBuffer(1, c.sampleRate * 6, c.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852;
      b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926;
    }
    return (BUF.pink = b);
  }
  /* 壊れた電波のような、ざらついたノイズ（サンプルを粗く間引く） */
  function crunchBuf(c, sec) {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * sec), c.sampleRate), d = b.getChannelData(0);
    let v = 0, hold = 0;
    for (let i = 0; i < d.length; i++) {
      if (hold-- <= 0) { v = Math.round((Math.random() * 2 - 1) * 3) / 3; hold = Math.floor(rnd(1, Math.random() < .1 ? 60 : 14)); }
      d[i] = v;
    }
    return b;
  }
  /* 残響（廊下の奥で鳴っているように） */
  function reverbIR(c, sec, decay) {
    const len = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function distCurve(k) {
    const n = 2048, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x)); }
    return curve;
  }

  const sfx = {
    /* 効果音の出口（音量 vol） */
    out(c, vol = 1) { const g = c.createGain(); g.gain.value = vol; g.connect(master); return g; },
    /* 左右の位置（-1 左 〜 1 右） */
    pan(c, dest, p) {
      if (!c.createStereoPanner) return dest;
      const s = c.createStereoPanner(); s.pan.value = Math.max(-1, Math.min(1, p)); s.connect(dest); return s;
    },
    tone(c, o, type, f1, f2, t, dur, vol) {
      const s = c.createOscillator(); s.type = type;
      s.frequency.setValueAtTime(f1, t); s.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(g); g.connect(o); s.start(t); s.stop(t + dur + 0.05);
    },
    noise(c, o, t, dur, vol, type, f1, f2, q) {
      const n = c.createBufferSource(); n.buffer = whiteBuf(c);
      const f = c.createBiquadFilter(); f.type = type; if (q) f.Q.value = q;
      f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      n.connect(f); f.connect(g); g.connect(o); n.start(t, rnd(0, 4 - dur - .05), dur + .05);
    },
    thud() { const c = audio(); if (!c) return; const o = this.out(c, .8), t = c.currentTime; this.tone(c, o, 'sine', 80, 38, t, .35, 1); },
    hit() { const c = audio(); if (!c) return; const o = this.out(c, .7), t = c.currentTime;
      this.tone(c, o, 'sine', 120, 45, t, .18, .9); this.noise(c, o, t, .14, .7, 'lowpass', 1400, 300); },
    smash() { const c = audio(); if (!c) return; const o = this.out(c, .9), t = c.currentTime;
      this.tone(c, o, 'sine', 95, 28, t, .6, 1); this.noise(c, o, t, .55, .9, 'lowpass', 2600, 180); this.noise(c, o, t + .05, .4, .4, 'bandpass', 900, 200); },
    creak(vol = .35) { const c = audio(); if (!c) return; const o = this.out(c, vol), t = c.currentTime;
      const s = c.createOscillator(); s.type = 'sawtooth';
      s.frequency.setValueAtTime(70, t); s.frequency.linearRampToValueAtTime(130, t + .5); s.frequency.linearRampToValueAtTime(85, t + 1.3);
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9; f.frequency.value = 700;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.6, t + .15); g.gain.linearRampToValueAtTime(0.001, t + 1.4);
      s.connect(f); f.connect(g); g.connect(o); s.start(t); s.stop(t + 1.5); },
    inject() { const c = audio(); if (!c) return; const o = this.out(c, .5), t = c.currentTime;
      this.tone(c, o, 'triangle', 1800, 900, t, .05, .4); this.noise(c, o, t + .05, .5, .25, 'highpass', 4000, 2500); },
    /* ジャンプスケア用の悲鳴 */
    scream() {
      const c = audio(); if (!c) return; const o = this.out(c, 1), t = c.currentTime;
      this.tone(c, o, 'sine', 90, 26, t, .9, 1);                          // 衝撃
      const ws = c.createWaveShaper(); ws.curve = distCurve(380);
      const sg = c.createGain(); sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(.45, t + .03); sg.gain.setValueAtTime(.45, t + 1.0); sg.gain.exponentialRampToValueAtTime(0.001, t + 1.7);
      ws.connect(sg); sg.connect(o);
      [520, 557, 611, 1046].forEach((f, i) => {                             // 金属が軋むような叫び
        const s = c.createOscillator(); s.type = i % 2 ? 'square' : 'sawtooth';
        s.frequency.setValueAtTime(f * 1.35, t); s.frequency.exponentialRampToValueAtTime(f, t + .12); s.frequency.exponentialRampToValueAtTime(f * .32, t + 1.6);
        const l = c.createOscillator(); l.frequency.value = 21 + i * 7; const lg = c.createGain(); lg.gain.value = f * .07;
        l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + 1.7);
        const g = c.createGain(); g.gain.value = .2; s.connect(g); g.connect(ws); s.start(t); s.stop(t + 1.7);
      });
      this.noise(c, o, t, 1.6, .9, 'bandpass', 3600, 600);
    },

    /* ── ここから追加の効果音 ── */
    /* 画面が裂けるノイズ（ザザッ） */
    static(dur = .25) {
      const c = audio(); if (!c) return; const o = this.out(c, .32), t = c.currentTime;
      const n = c.createBufferSource(); n.buffer = crunchBuf(c, dur + .05);
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 380;
      const g = c.createGain(); g.gain.setValueAtTime(.9, t); g.gain.setValueAtTime(.9, t + dur * .8); g.gain.linearRampToValueAtTime(0, t + dur);
      n.connect(hp); hp.connect(g); g.connect(o); n.start(t);
      const s = c.createOscillator(); s.type = 'square';                   // 混線したデータ音
      for (let k = 0; k < dur; k += .025) s.frequency.setValueAtTime(rnd(180, 3200), t + k);
      const sg = c.createGain(); sg.gain.setValueAtTime(.12, t); sg.gain.setValueAtTime(0, t + dur);
      s.connect(sg); sg.connect(o); s.start(t); s.stop(t + dur + .02);
      this.tone(c, o, 'sine', 70, 40, t, Math.min(.3, dur), .5);           // 低い「ボッ」
    },
    /* 文字化けの小さな電子音 */
    tick() {
      const c = audio(); if (!c) return; const o = this.out(c, .05), t = c.currentTime;
      for (let i = 0, n = 1 + Math.floor(Math.random() * 3); i < n; i++) this.tone(c, o, 'square', rnd(2400, 6200), rnd(1200, 3000), t + i * .03, .018, .8);
    },
    /* 責める言葉：逆再生したような、くぐもった声 */
    blame(dur = .25) {
      const c = audio(); if (!c) return; const o = this.pan(c, this.out(c, .32), rnd(-.7, .7)), t = c.currentTime, d = Math.max(.18, dur + .06);
      const ws = c.createWaveShaper(); ws.curve = distCurve(60);
      const env = c.createGain(); env.gain.setValueAtTime(0.001, t); env.gain.exponentialRampToValueAtTime(1, t + d * .9); env.gain.linearRampToValueAtTime(0, t + d);
      ws.connect(env); env.connect(o);
      const s = c.createOscillator(); s.type = 'sawtooth';
      s.frequency.setValueAtTime(rnd(70, 95), t); s.frequency.exponentialRampToValueAtTime(rnd(110, 150), t + d);
      [[450, 6, .8], [820, 7, .6], [2500, 8, .25]].forEach(([f, q, v]) => {   // 「お」の口の形
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
        const g = c.createGain(); g.gain.value = v * 3; s.connect(bp); bp.connect(g); g.connect(ws);
      });
      s.start(t); s.stop(t + d + .02);
      this.noise(c, env, t, d, .4, 'bandpass', 900, 2600, 1.5);
    },
    /* 背景の囁き：息まじりの、言葉にならない声 */
    whisper() {
      const c = audio(); if (!c) return;
      const o = this.pan(c, this.out(c, .16), rnd(-1, 1)), t = c.currentTime;
      if (amb.verb) { const s = c.createGain(); s.gain.value = .5; o.connect(s); s.connect(amb.verb); }
      let k = 0;
      for (let i = 0, n = 3 + Math.floor(Math.random() * 4); i < n; i++) {
        const d = rnd(.1, .24), sib = Math.random() < .3;
        this.noise(c, o, t + k, d, sib ? .35 : .9, sib ? 'highpass' : 'bandpass', sib ? 4800 : rnd(900, 1500), sib ? 6000 : rnd(1600, 3000), sib ? 0 : 2.5);
        k += d + rnd(.02, .12);
      }
    },
    /* 記録を開いたときの、カルテをめくる音 */
    page() {
      const c = audio(); if (!c) return; const o = this.out(c, .16), t = c.currentTime;
      this.noise(c, o, t, .16, .8, 'bandpass', 3200, 1300, 1.2);
      this.noise(c, o, t + .1, .09, .4, 'bandpass', 2400, 1800, 1.5);
    },
    /* 精神が大きく削れたとき：心臓が跳ねる */
    thump(vol = .7) {
      const c = audio(); if (!c) return; const o = this.out(c, vol), t = c.currentTime;
      this.tone(c, o, 'sine', 78, 40, t, .2, 1); this.tone(c, o, 'sine', 160, 70, t, .08, .35);
      this.tone(c, o, 'sine', 66, 36, t + .19, .22, .65);
    },
    /* 精神ゲージ 0：モニターの警報 → 心停止音 */
    alarm() {
      const c = audio(); if (!c) return; const o = this.pan(c, this.out(c, .22), -.3), t = c.currentTime;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(o);
      [0, .16, .32, .7, .86, 1.02].forEach((k) => {
        const s = c.createOscillator(); s.type = 'square'; s.frequency.value = 988;
        const g = c.createGain(); g.gain.setValueAtTime(0, t + k); g.gain.linearRampToValueAtTime(.5, t + k + .01); g.gain.setValueAtTime(.5, t + k + .11); g.gain.linearRampToValueAtTime(0, t + k + .13);
        s.connect(g); g.connect(lp); s.start(t + k); s.stop(t + k + .15);
      });
      amb.flatline(3.2, 1.5);
    },
  };

  /* =========================================================
     環境音：病院の空気
       hum   … 蛍光灯・電源の唸り（ブーン）
       hiss  … 空調・古いスピーカーのサー音
       drone … 精神が削れるほど湧いてくる、低い不協和音
       ECG   … 心電図モニター。ゲージが減るほど速く・不規則になり、0 では心停止（ピーー）も
       物音  … 水滴・遠くの金属音・ストレッチャーの車輪・足音・ノック・遠い泣き声・耳元の息
     ========================================================= */
  const TUNE = {
    //       唸り   サー    低音    心拍  ゆらぎ 欠落  物音の間隔(ms)   出る物音（重み）
    high: { hum: .05,  hiss: .016, drone: 0,    bpm: 64,  jit: .02, skip: 0,   ev: [14000, 28000], pool: { drip: 3, buzz: 3, chime: 1, squeak: 1 } },
    mid:  { hum: .065, hiss: .03,  drone: .03,  bpm: 84,  jit: .07, skip: .03, ev: [9000, 18000],  pool: { drip: 2, buzz: 3, squeak: 2, clang: 1, chime: 1, steps: 1 } },
    low:  { hum: .08,  hiss: .05,  drone: .08,  bpm: 108, jit: .2,  skip: .08, ev: [6000, 12000],  pool: { drip: 1, buzz: 2, squeak: 1, clang: 2, steps: 2, knock: 1, wail: 1, chime: 1 } },
    zero: { hum: .1,   hiss: .08,  drone: .14,  bpm: 126, jit: .28, skip: .1,  ev: [3500, 8000],   pool: { buzz: 2, clang: 1, steps: 2, knock: 2, wail: 2, breath: 2 }, flat: [18000, 34000] },
  };
  const amb = {
    on: false, n: null, verb: null, timers: [], nextFlat: 0, flatUntil: 0,
    tune() { return TUNE[sanity.level()] || TUNE.high; },
    vol() { return FX.ambientVolume ?? 0.6; },
    start() {
      if (this.on || !FX.ambient) return;
      const c = audio(); if (!c) return;
      this.on = true;
      document.documentElement.dataset.snd = 'on';
      const t = c.currentTime, n = {};
      n.bus = c.createGain(); n.bus.gain.setValueAtTime(0, t); n.bus.gain.setTargetAtTime(this.vol(), t, .9); n.bus.connect(master);
      this.verb = c.createConvolver(); this.verb.buffer = reverbIR(c, 3.2, 2.6);
      const vg = c.createGain(); vg.gain.value = .55; this.verb.connect(vg); vg.connect(n.bus);
      const loop = (node) => { node.start(t); (n.src = n.src || []).push(node); return node; };
      const osc = (type, f) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; return loop(o); };

      /* 蛍光灯の唸り */
      n.hum = c.createGain(); n.hum.gain.value = 0;
      const hlp = c.createBiquadFilter(); hlp.type = 'lowpass'; hlp.frequency.value = 900; hlp.connect(n.hum); n.hum.connect(n.bus);
      [[50, 'sine', .8], [100, 'sine', .5], [150, 'sawtooth', .07], [200, 'square', .025]].forEach(([f, ty, v]) => {
        const g = c.createGain(); g.gain.value = v; osc(ty, f).connect(g); g.connect(hlp);
      });
      /* ちらつくときのジジッ（ふだんは 0） */
      n.buzz = c.createGain(); n.buzz.gain.value = 0;
      const bbp = c.createBiquadFilter(); bbp.type = 'bandpass'; bbp.frequency.value = 1700; bbp.Q.value = .8;
      osc('sawtooth', 100).connect(bbp); osc('square', 120.5).connect(bbp); bbp.connect(n.buzz); n.buzz.connect(n.bus);
      /* サー音 */
      const hs = c.createBufferSource(); hs.buffer = pinkBuf(c); hs.loop = true; loop(hs);
      const hhp = c.createBiquadFilter(); hhp.type = 'highpass'; hhp.frequency.value = 250;
      const hlp2 = c.createBiquadFilter(); hlp2.type = 'lowpass'; hlp2.frequency.value = 5200;
      n.hiss = c.createGain(); n.hiss.gain.value = 0;
      hs.connect(hhp); hhp.connect(hlp2); hlp2.connect(n.hiss); n.hiss.connect(n.bus);
      /* 低い不協和音（ゆっくり揺れる） */
      n.drone = c.createGain(); n.drone.gain.value = 0;
      const dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 420; dlp.connect(n.drone); n.drone.connect(n.bus);
      [[55, 'sawtooth', .35], [55.9, 'sawtooth', .35], [77.8, 'sine', .5], [116.5, 'triangle', .18]].forEach(([f, ty, v]) => {
        const g = c.createGain(); g.gain.value = v; osc(ty, f).connect(g); g.connect(dlp);
      });
      const lfo = osc('sine', .09), lg = c.createGain(); lg.gain.value = 160; lfo.connect(lg); lg.connect(dlp.frequency);
      this.n = n;
      this.retune(true);
      this.nextFlat = performance.now() + rnd(8000, 14000);
      this.beat();
      this.events();
    },
    stop() {
      if (!this.on) return;
      this.on = false;
      document.documentElement.dataset.snd = 'off';
      document.documentElement.classList.remove('is-flat');
      this.timers.forEach(clearTimeout); this.timers = [];
      const n = this.n; this.n = null;
      if (n && actx) {
        const t = actx.currentTime;
        n.bus.gain.cancelScheduledValues(t); n.bus.gain.setTargetAtTime(0, t, .25);
        setTimeout(() => { (n.src || []).forEach((s) => { try { s.stop(); } catch { /* noop */ } }); n.bus.disconnect(); }, 1500);
      }
    },
    /* ゲージの段階に合わせて、層の音量をゆっくり変える */
    retune(now) {
      if (!this.on || !this.n) return;
      const T = this.tune(), t = actx.currentTime, k = now ? .6 : 2.2;
      this.n.hum.gain.setTargetAtTime(T.hum, t, k);
      this.n.hiss.gain.setTargetAtTime(T.hiss, t, k);
      this.n.drone.gain.setTargetAtTime(T.drone, t, k * 1.5);
    },
    /* ジャンプスケア前の「静寂」 */
    duck(silent) {
      if (!this.on || !this.n) return;
      const t = actx.currentTime;
      this.n.bus.gain.cancelScheduledValues(t);
      this.n.bus.gain.setTargetAtTime(silent ? 0 : this.vol(), t, silent ? .04 : 1.4);
    },
    later(ms, fn) { this.timers.push(setTimeout(fn, ms)); },

    /* ── 心電図モニター ── */
    beat() {
      if (!this.on) return;
      const T = this.tune(), lv = sanity.level(), now = performance.now();
      let ms = (60000 / T.bpm) * (1 + rnd(-T.jit, T.jit));
      if (FX.ecg && now >= this.flatUntil) {
        if (T.flat && now >= this.nextFlat) {                 // 0 のとき：ときどき心停止
          const d = rnd(3, 5.5);
          this.flatline(d);
          this.nextFlat = now + d * 1000 + rnd(T.flat[0], T.flat[1]);
          ms = d * 1000 + rnd(500, 1400);
        } else if (Math.random() >= T.skip) {
          this.blip(lv);
          if ((lv === 'low' || lv === 'zero') && Math.random() < .14) this.later(rnd(150, 230), () => this.blip(lv)); // 期外収縮
        }
      }
      this.later(ms, () => this.beat());
    },
    blip(lv) {
      const c = audio(); if (!c || !this.n) return;
      const t = c.currentTime + .01, zero = lv === 'zero';
      const o = sfx.pan(c, this.n.bus, -.35);
      const f = zero ? rnd(940, 1010) : 1000, len = .085;
      [[f, 'sine', .13], [f * 2, 'sine', .015]].concat(zero ? [[f * 1.06, 'sine', .05]] : []).forEach(([fr, ty, v]) => {
        const s = c.createOscillator(); s.type = ty; s.frequency.value = fr;
        const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.setValueAtTime(v, t + len); g.gain.linearRampToValueAtTime(0, t + len + .025);
        s.connect(g); g.connect(o); s.start(t); s.stop(t + len + .05);
      });
      if (lv === 'low' || zero) {                              // 自分の心臓の音も聞こえてくる
        const h = c.createGain(); h.gain.value = zero ? .55 : .25; h.connect(this.n.bus);
        sfx.tone(c, h, 'sine', 72, 38, t, .2, 1); sfx.tone(c, h, 'sine', 62, 34, t + .17, .2, .6);
      }
      pulseUI();
    },
    /* 心停止音（ピーーー） */
    flatline(sec, delay = 0) {
      const c = audio(); if (!c || !this.n) return;
      const t = c.currentTime + delay, o = sfx.pan(c, this.n.bus, -.35);
      this.flatUntil = performance.now() + (delay + sec) * 1000;
      const s = c.createOscillator(); s.type = 'sine'; s.frequency.value = 1000;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .01); g.gain.setValueAtTime(.12, t + sec); g.gain.linearRampToValueAtTime(0, t + sec + .05);
      s.connect(g); g.connect(o); s.start(t); s.stop(t + sec + .1);
      const root = document.documentElement;
      this.later(delay * 1000, () => root.classList.add('is-flat'));
      this.later((delay + sec) * 1000, () => root.classList.remove('is-flat'));
    },

    /* ── 院内の物音 ── */
    events() {
      if (!this.on) return;
      const T = this.tune();
      this.later(rnd(T.ev[0], T.ev[1]), () => {
        if (this.on && document.visibilityState === 'visible' && performance.now() >= this.flatUntil) {
          const pool = Object.entries(T.pool), sum = pool.reduce((s, [, w]) => s + w, 0);
          let r = Math.random() * sum;
          const name = (pool.find(([, w]) => (r -= w) < 0) || pool[0])[0];
          this.ev[name]?.call(this);
        }
        this.events();
      });
    },
    /* 物音の出口：dry（そのまま）と wet（残響）の割合で距離感を出す */
    place(c, p, dry, wet) {
      const o = c.createGain();
      const d = c.createGain(); d.gain.value = dry; o.connect(d); d.connect(sfx.pan(c, this.n.bus, p));
      const w = c.createGain(); w.gain.value = wet; o.connect(w); w.connect(this.verb);
      return o;
    },
    ev: {
      /* 水滴（ぴちょん） */
      drip() {
        const c = actx, o = this.place(c, rnd(-.8, .8), .35, 1);
        let k = 0;
        for (let i = 0, n = 1 + Math.floor(Math.random() * 3); i < n; i++) {
          const t = c.currentTime + k, f = rnd(1300, 2300);
          sfx.tone(c, o, 'sine', f, f * .42, t, .06, .2);
          k += rnd(.5, 1.3);
        }
      },
      /* 蛍光灯がジジッ… と点滅する */
      buzz() {
        const c = actx, g = this.n.buzz.gain, t = c.currentTime;
        let k = 0;
        for (let i = 0, n = 6 + Math.floor(Math.random() * 10); i < n; i++) {
          g.setValueAtTime(Math.random() < .55 ? rnd(.025, .07) : 0, t + k);
          k += rnd(.025, .09);
        }
        g.setValueAtTime(0, t + k);
        const o = this.place(c, rnd(-.5, .5), .4, .2);
        for (let i = 0; i < 4; i++) sfx.noise(c, o, t + rnd(0, k), .02, .15, 'highpass', 3000, 5000);
      },
      /* 院内放送のチャイム（正気を失うほど、音程が狂う） */
      chime() {
        const c = actx, lv = sanity.level(), o = this.place(c, rnd(-.3, .3), .12, 1.1), t = c.currentTime;
        const up = [523.3, 659.3, 784, 1046.5];
        const notes = lv === 'high' ? up : lv === 'mid' ? up.map((f) => f * rnd(.97, 1.01)) : [...up].reverse().map((f) => f * rnd(.86, .95));
        notes.forEach((f, i) => {
          const ti = t + i * .42;
          [[f, 'sine', .07], [f * 2.01, 'sine', .015], [f, 'triangle', .02]].forEach(([fr, ty, v]) => {
            const s = c.createOscillator(); s.type = ty; s.frequency.setValueAtTime(fr, ti);
            if (lv === 'low') s.frequency.linearRampToValueAtTime(fr * .9, ti + 1.2);  // 伸びたテープのように
            const g = c.createGain(); g.gain.setValueAtTime(0, ti); g.gain.linearRampToValueAtTime(v, ti + .01); g.gain.exponentialRampToValueAtTime(.0005, ti + 1.3);
            s.connect(g); g.connect(o); s.start(ti); s.stop(ti + 1.35);
          });
        });
      },
      /* ストレッチャーの車輪がキィ…キィ…と横切る */
      squeak() {
        const c = actx, t = c.currentTime, n = 4 + Math.floor(Math.random() * 4), from = Math.random() < .5 ? -1 : 1;
        for (let i = 0; i < n; i++) {
          const ti = t + i * rnd(.4, .5), o = this.place(c, from * (1 - (2 * i) / (n - 1)) * .8, .12, .6);
          const s = c.createOscillator(); s.type = 'sine'; const f = rnd(2100, 2700);
          s.frequency.setValueAtTime(f, ti); s.frequency.linearRampToValueAtTime(f * 1.08, ti + .1);
          const v = c.createOscillator(); v.frequency.value = 34; const vg = c.createGain(); vg.gain.value = 70; v.connect(vg); vg.connect(s.frequency);
          const g = c.createGain(); g.gain.setValueAtTime(0, ti); g.gain.linearRampToValueAtTime(.05, ti + .03); g.gain.linearRampToValueAtTime(0, ti + .14);
          s.connect(g); g.connect(o); s.start(ti); s.stop(ti + .16); v.start(ti); v.stop(ti + .16);
        }
        const r = this.place(c, 0, .15, .4);
        sfx.noise(c, r, t, Math.min(3.8, n * .48), .18, 'lowpass', 160, 110);
      },
      /* 遠くで金属が落ちる */
      clang() {
        const c = actx, t = c.currentTime, o = this.place(c, rnd(-.9, .9), .08, 1.2), base = rnd(170, 260);
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900; lp.connect(o);
        [[1, .09], [2.76, .06], [5.4, .04], [8.93, .025]].forEach(([m, v]) => sfx.tone(c, lp, 'sine', base * m, base * m * .995, t, rnd(1.4, 2.4), v));
        sfx.noise(c, lp, t, .08, .3, 'bandpass', 2400, 900, 1);
      },
      /* 足音。正気を失っているほど、近づいてくる */
      steps() {
        const c = actx, t = c.currentTime, lv = sanity.level(), n = 5 + Math.floor(Math.random() * 5), near = lv === 'zero' || (lv === 'low' && Math.random() < .5);
        const p = rnd(-.8, .8);
        for (let i = 0; i < n; i++) {
          const ti = t + i * rnd(.56, .68), a = near ? .04 + (i / n) * .3 : .07;
          const o = this.place(c, p * (near ? 1 - i / n : 1), near ? .3 + i / n : .15, .7);
          sfx.tone(c, o, 'sine', 95, 45, ti, .13, a * 2.2); sfx.noise(c, o, ti, .07, a * 1.6, 'lowpass', 900, 300);
        }
      },
      /* 扉を叩く音（コン、コン、コン） */
      knock() {
        const c = actx, t = c.currentTime, o = this.place(c, rnd(-1, 1), .7, .4);
        const times = [0, .24, .48]; if (Math.random() < .4) times.push(1.3 + rnd(0, .5));
        times.forEach((k) => {
          sfx.noise(c, o, t + k, .09, .55, 'bandpass', 320, 220, 3);
          sfx.tone(c, o, 'sine', 150, 85, t + k, .1, .4);
        });
      },
      /* 廊下の奥の、泣き声のような何か */
      wail() {
        const c = actx, t = c.currentTime, d = rnd(2.2, 3.4), o = this.place(c, rnd(-1, 1), .03, 1);
        const s = c.createOscillator(); s.type = 'sawtooth';
        const f = rnd(330, 420); s.frequency.setValueAtTime(f, t); s.frequency.linearRampToValueAtTime(f * 1.12, t + d * .3); s.frequency.exponentialRampToValueAtTime(f * .62, t + d);
        const v = c.createOscillator(); v.frequency.value = rnd(4.5, 6.5); const vg = c.createGain(); vg.gain.value = f * .03; v.connect(vg); vg.connect(s.frequency);
        const env = c.createGain(); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(.08, t + d * .35); env.gain.linearRampToValueAtTime(0, t + d);
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
        [[800, 6], [1150, 7]].forEach(([ff, q]) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q; s.connect(bp); bp.connect(lp); });
        lp.connect(env); env.connect(o); s.start(t); s.stop(t + d + .05); v.start(t); v.stop(t + d + .05);
      },
      /* 耳元の息づかい */
      breath() {
        const c = actx, t = c.currentTime, o = this.place(c, Math.random() < .5 ? -.95 : .95, 1, .05);
        const n = c.createBufferSource(); n.buffer = pinkBuf(c);
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .8;
        bp.frequency.setValueAtTime(700, t); bp.frequency.linearRampToValueAtTime(1300, t + 1.1); bp.frequency.setValueAtTime(1100, t + 1.3); bp.frequency.linearRampToValueAtTime(550, t + 2.8);
        const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + 1); g.gain.linearRampToValueAtTime(0, t + 1.2);
        g.gain.linearRampToValueAtTime(.5, t + 1.5); g.gain.linearRampToValueAtTime(0, t + 2.9);
        n.connect(bp); bp.connect(g); g.connect(o); n.start(t, rnd(0, 2), 3);
      },
    },
  };
  /* 心拍に合わせて、ゲージと画面がかすかに脈打つ */
  function pulseUI() {
    const root = document.documentElement, g = $('#sanity');
    root.classList.add('is-beat'); g && g.classList.add('is-beat');
    setTimeout(() => { root.classList.remove('is-beat'); g && g.classList.remove('is-beat'); }, 140);
  }
  /* 作者確認用：コンソールで khSfx('wail') などと打つと、その音だけ鳴らせる */
  window.khSfx = (name) => {
    amb.start();
    if (amb.ev[name] && amb.on) amb.ev[name].call(amb);
    else if (sfx[name]) sfx[name]();
    else console.log('[狂乱病院] 鳴らせる音:', [...Object.keys(amb.ev), 'static', 'tick', 'blame', 'whisper', 'page', 'thump', 'alarm', 'hit', 'smash', 'creak', 'inject', 'scream', 'thud'].join(', '));
  };

  /* =========================================================
     精神安定剤：自分に注射する演出
     ========================================================= */
  function injectFx(label, done) {
    if (!fxActive()) { done(); return; }
    const el = document.createElement('div');
    el.className = 'inject';
    el.innerHTML = `
      <svg class="inject-svg" viewBox="0 0 600 380" aria-hidden="true">
        <defs>
          <linearGradient id="kh-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc6b7"/><stop offset=".3" stop-color="#c2a797"/><stop offset=".7" stop-color="#5a443a"/><stop offset="1" stop-color="#0b0808"/></linearGradient>
          <linearGradient id="kh-fadeg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".18" stop-color="#fff"/><stop offset=".82" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
          <mask id="kh-fade" maskUnits="userSpaceOnUse" x="-40" y="0" width="690" height="400"><rect x="-40" y="0" width="690" height="400" fill="url(#kh-fadeg)"/></mask>
          <linearGradient id="kh-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".06"/><stop offset="1" stop-color="#ffffff" stop-opacity=".3"/></linearGradient>
          <linearGradient id="kh-liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6f5c6"/><stop offset="1" stop-color="#4fb874"/></linearGradient>
        </defs>
        <g class="inj-arm" mask="url(#kh-fade)">
          <path d="M-30 236 C 110 220, 290 226, 460 238 C 520 242, 572 256, 640 280 L 640 400 L -30 400 Z" fill="url(#kh-skin)"/>
          <path d="M-30 236 C 110 220, 290 226, 460 238 C 520 242, 572 256, 640 280" fill="none" stroke="#f0ddd0" stroke-width="2" opacity=".5"/>
          <path d="M20 292 C 140 276, 250 284, 370 272 S 520 282, 640 296" stroke="#6b7c9c" stroke-width="3.2" fill="none" opacity=".55"/>
          <path d="M150 330 C 220 314, 290 318, 345 292" stroke="#6b7c9c" stroke-width="2" fill="none" opacity=".45"/>
          <ellipse cx="318" cy="262" rx="26" ry="9" fill="#6b3a3a" opacity=".22"/>
          <circle cx="322" cy="258" r="1.8" fill="#5a1414"/><circle cx="331" cy="262" r="1.6" fill="#5a1414"/><circle cx="310" cy="265" r="1.6" fill="#5a1414"/><circle cx="338" cy="256" r="1.4" fill="#5a1414"/>
        </g>
        <g class="inj-blood"><circle cx="300" cy="244" r="4.2" fill="#9a0c10"/><path class="inj-trail" d="M300 246 C 298 256, 302 266, 299 280" stroke="#8a0b0b" stroke-width="3" fill="none" stroke-linecap="round"/></g>
        <g transform="translate(300 241) rotate(-36)">
          <g class="inj-move">
            <path d="M0 0 L72 -1.4 L72 1.4 Z" fill="#d7dee2"/>
            <rect x="70" y="-6" width="18" height="12" rx="2" fill="#9fb3bd"/>
            <rect class="inj-liquid" x="90" y="-14" width="150" height="28" fill="url(#kh-liquid)"/>
            <rect x="88" y="-17" width="170" height="34" rx="4" fill="url(#kh-glass)" stroke="#e3eaee" stroke-width="2"/>
            <g stroke="#2a2a2a" stroke-width="1.2" opacity=".7"><path d="M110 -17v8M130 -17v6M150 -17v8M170 -17v6M190 -17v8M210 -17v6M230 -17v8"/></g>
            <rect x="256" y="-27" width="9" height="54" rx="2" fill="#e3eaee"/>
            <g class="inj-plunger">
              <rect x="238" y="-14" width="12" height="28" rx="2" fill="#151515"/>
              <rect x="250" y="-4" width="96" height="8" fill="#cfd8dc"/>
              <rect x="344" y="-22" width="9" height="44" rx="3" fill="#e3eaee"/>
            </g>
          </g>
        </g>
      </svg>
      <p class="inject-label">${esc(label)}</p>`;
    document.body.appendChild(el);
    setTimeout(() => sfx.inject(), 820);
    setTimeout(() => { $('.inject-label', el).textContent = '投与完了'; el.classList.add('is-done'); done(); }, 2150);
    setTimeout(() => { el.classList.add('is-out'); }, 2700);
    setTimeout(() => el.remove(), 3200);
  }

  /* =========================================================
     精神ゲージ 0：古い記録を叩き壊す
     一覧のカード・記事ページを叩くと、血を噴きながら壊れていく。
     すべて壊すと……。
     ========================================================= */
  const CARD_SEL = '.file, .karte, .badge, .profile, .door';
  const idOf = (el) => (el.getAttribute('href') || '').match(/#\/article\/(.+)$/)?.[1] || el.dataset.id || null;
  const CRACK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120' preserveAspectRatio='none'%3E%3Cg fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M95 55 L70 30 L58 8 M70 30 L40 34 L10 22 M95 55 L60 70 L30 96 L12 118 M60 70 L38 64 L4 70 M95 55 L120 82 L132 118 M120 82 L150 90 L190 104 M95 55 L128 40 L160 18 L196 6 M128 40 L170 50 L200 46 M95 55 L100 20 L96 0'/%3E%3C/g%3E%3Cg fill='none' stroke='%23c8141c' stroke-width='.8' opacity='.8'%3E%3Cpath d='M95 55 L70 30 L58 8 M95 55 L120 82 L132 118 M95 55 L128 40 L160 18 M95 55 L60 70 L30 96'/%3E%3C/g%3E%3C/svg%3E")`;

  const wreck = {
    broken: new Set(store.get('kh-broken', [])),
    hp: store.get('kh-hp', {}),
    max() { return Math.max(1, FX.destroyHits || 7); },
    active() { return FX.destroy && FX.sanityGauge && sanity.value <= 0; },
    targets() { return LIST().filter((a) => !a.madness); },
    left() { return this.targets().filter((a) => !this.broken.has(a.id)).length; },
    save() { store.set('kh-broken', [...this.broken]); store.set('kh-hp', this.hp); },
    clear() { this.broken.clear(); this.hp = {}; this.save(); },
    hit(id, el, x, y) {
      if (this.broken.has(id) || el.classList.contains('is-breaking')) return;
      audio(); // 最初のタップで音を有効化
      const hp = (this.hp[id] ?? this.max()) - 1;
      this.hp[id] = hp;
      paintDamage(el, 1 - hp / this.max());
      el.classList.remove('is-hit'); void el.offsetWidth; el.classList.add('is-hit');
      splatter(x, y, hp <= 0 ? 34 : 12);
      stain(el, x, y, hp <= 0 ? 2 : 1);
      if (hp <= 0) {
        this.broken.add(id); this.save();
        sfx.smash();
        screenSplat(x, y);
        el.classList.add('is-breaking');
        setTimeout(() => {
          if (el.matches('.art')) route(true); else toRemnant(el);
          hud();
          if (this.left() === 0) setTimeout(jumpscare, 900);
        }, 650);
      } else { this.save(); sfx.hit(); }
    },
  };

  function paintDamage(el, dmg) {
    el.style.setProperty('--dmg', dmg.toFixed(2));
    el.classList.add('is-damaged');
    if (!el.querySelector(':scope > .crack')) {
      const c = document.createElement('span');
      c.className = 'crack';
      c.style.backgroundImage = CRACK;
      c.style.setProperty('--cx', Math.round(rnd(-30, 30)) + '%');
      c.style.transform = `scale(${rnd(.9, 1.4).toFixed(2)}) rotate(${Math.round(rnd(-25, 25))}deg)`;
      el.appendChild(c);
    }
  }
  function toRemnant(el) {
    const a = ART[idOf(el)];
    el.style.minHeight = Math.max(90, el.offsetHeight) + 'px';
    el.removeAttribute('href');
    el.className = el.className.replace(/\b(is-hit|is-breaking|is-damaged)\b/g, '') + ' is-broken';
    el.innerHTML = `<span class="remnant"><b>破壊された記録</b><small>${esc(a ? a.title : '')}</small></span>`;
  }
  function stain(el, x, y, big) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 1 + big; i++) {
      const s = document.createElement('span');
      s.className = 'stain';
      const size = rnd(18, 46) * big;
      s.style.cssText = `left:${x - r.left + rnd(-14, 14) - size / 2}px;top:${y - r.top + rnd(-14, 14) - size / 2}px;width:${size}px;height:${size * rnd(.6, 1)}px;transform:rotate(${rnd(0, 360)}deg)`;
      el.appendChild(s);
    }
  }
  function splatter(x, y, n) {
    if (!fxActive()) return;
    const layer = $('#gore');
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = 'gore-drop';
      const ang = rnd(-Math.PI, 0) + rnd(-.5, .5), sp = rnd(40, 190);
      d.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(ang) * sp}px;--dy:${Math.sin(ang) * sp}px;--fall:${rnd(80, 260)}px;width:${rnd(3, 10)}px;height:${rnd(3, 10)}px;animation-duration:${rnd(.55, 1)}s`;
      layer.appendChild(d);
      setTimeout(() => d.remove(), 1100);
    }
  }
  function screenSplat(x, y) {
    if (!fxActive()) return;
    const layer = $('#gore');
    const s = document.createElement('span');
    s.className = 'screen-splat';
    const size = rnd(120, 260);
    s.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;transform:rotate(${rnd(0, 360)}deg)`;
    layer.appendChild(s);
    const all = layer.querySelectorAll('.screen-splat');
    if (all.length > 14) all[0].remove();
  }
  function hud() {
    const h = $('#wreck-hud');
    if (!h) return;
    const on = wreck.active() && wreck.left() > 0;
    h.hidden = !on;
    if (on) h.innerHTML = `<span class="wreck-hud-h">古い記録が、邪魔だ。</span><span>叩いて壊せ　残り <b>${wreck.left()}</b> / ${wreck.targets().length}</span>`;
  }

  /* すべて壊した先 */
  function jumpscare() {
    const imgs = SITE.jumpscareImages || [];
    if (!FX.jumpscare || !fxActive() || !imgs.length) { endScreen(); return; }
    corrupt.stop();
    amb.duck(true);   // すべての音が止まる
    // 画像は 'パス' か { src: 'パス', focus: [横, 縦] }（focus は顔の位置。0〜1 の割合）
    const chosen = pick(imgs);
    const src = typeof chosen === 'string' ? chosen : chosen.src;
    const [fx, fy] = (typeof chosen === 'object' && chosen.focus) || [0.5, 0.5];
    const el = document.createElement('div');
    el.className = 'js';
    el.innerHTML = `<img class="js-img" src="${esc(src)}" alt=""><div class="js-flash"></div>`;
    document.body.appendChild(el);
    const img = $('.js-img', el);
    const fit = () => {
      const ar = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1;
      const w = Math.max(innerWidth * 1.4, innerHeight * 1.4 * ar), h = w / ar;   // 縦長のスマホでも顔が大きく出るように
      img.style.width = w + 'px'; img.style.height = h + 'px';
      img.style.setProperty('--dx', ((0.5 - fx) * w) + 'px');   // 顔が画面の中心に来るようにずらす
      img.style.setProperty('--dy', ((0.5 - fy) * h) + 'px');
    };
    if (img.complete) fit(); else img.addEventListener('load', fit);
    setTimeout(() => { el.classList.add('is-go'); sfx.scream(); }, 900);   // 一瞬の静寂のあと
    setTimeout(() => el.classList.add('is-cut'), 2500);
    setTimeout(() => { el.remove(); amb.duck(false); endScreen(); }, 2900);
  }
  function endScreen() {
    const d = document.createElement('div');
    d.className = 'js-end';
    d.innerHTML = `
      <div class="js-end-in">
        <p class="js-end-en">ALL RECORDS DESTROYED</p>
        <p class="js-end-ja">オルドレンジに、見つかった。</p>
        <p class="js-end-sub">すべての記録は、血に沈んだ。</p>
        <div class="js-end-actions">
          <button class="btn btn--blood" type="button" data-a="reset">正気に戻る</button>
          <button class="btn btn--ghost" type="button" data-a="stay">このまま狂っている</button>
        </div>
      </div>`;
    document.body.appendChild(d);
    d.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      d.remove();
      if (a === 'reset') injectFx('鎮静剤 大量投与中…', () => sanity.reset());
      else corrupt.restart();
    });
  }

  /* 0 のとき：古い記録の文字を、恒常的に壊す（0 のときだけの記事は無傷） */
  function rot() {
    const rate = FX.zeroRot ?? 0.22;
    const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.trim() && !n.parentElement.closest('.is-mad, .spoil-banner, button, input, svg, .remnant') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach((n) => { n.nodeValue = [...n.nodeValue].map((c) => (/\s/.test(c) || Math.random() > rate ? c : MOJI[Math.floor(Math.random() * MOJI.length)])).join(''); });
  }

  /* 0 のとき、描画後にカードを傷つけ、壊れたものは残骸にする */
  function decorate() {
    app.querySelectorAll(CARD_SEL).forEach((el) => {
      const id = idOf(el); const a = id && ART[id];
      if (!a || a.madness) return;
      el.style.setProperty('--rt', rnd(-2.2, 2.2).toFixed(2) + 'deg');
      if (wreck.broken.has(id)) toRemnant(el);
      else if (wreck.hp[id] != null) paintDamage(el, 1 - wreck.hp[id] / wreck.max());
    });
    const art = app.querySelector('.art[data-id]:not(.is-mad)');
    if (art && wreck.hp[art.dataset.id] != null) paintDamage(art, 1 - wreck.hp[art.dataset.id] / wreck.max());
  }

  /* ───────── whispers ───────── */
  function whisperLoop() {
    const words = SITE.whisperTexts || [];
    const tick = () => {
      setTimeout(() => {
        if (effectsOn && FX.whispers && !reduceMotion && words.length && document.visibilityState === 'visible') {
          const w = document.createElement('span');
          w.className = 'whisper';
          w.textContent = words[Math.floor(Math.random() * words.length)];
          w.style.left = (8 + Math.random() * 80) + 'vw';
          w.style.top = (18 + Math.random() * 70) + 'vh';
          w.style.fontSize = (14 + Math.random() * 26) + 'px';
          $('#whispers').appendChild(w);
          sfx.whisper();
          setTimeout(() => w.remove(), 4200);
        }
        tick();
      }, 14000 + Math.random() * 22000);
    };
    tick();
  }

  /* =========================================================
     入口：ネタバレモードの選択（入院区分）
     ========================================================= */
  const MODE_TEXT = {
    safe:    { ward: '一般外来', en: 'OUTPATIENT', label: 'ネタバレなし', who: '初めて狂乱病院に来た方へ', desc: '物語の核心に触れる記録は、一覧にも検索にも出てきません。' },
    spoiler: { ward: '特別病棟', en: 'CLOSED WARD', label: 'ネタバレあり', who: '作品を知っている方へ', desc: '結末や裏側を含む、すべての記録を閲覧できます。' },
  };

  /* 入口の扉（両開き）。m = 'safe' | 'spoiler' */
  function entranceDoor(m) {
    const t = MODE_TEXT[m];
    const closed = m === 'spoiler';
    return `
      <button class="ent-door ent-door--${m}" type="button" data-mode="${m}" aria-label="${t.ward}（${t.label}）">
        <span class="ent-plate"><b>${t.ward}</b><small>${t.en}</small></span>
        <span class="ent-frame">
          <span class="ent-light" aria-hidden="true"></span>
          <span class="ent-leaf ent-leaf--l" aria-hidden="true"><i class="ent-win"></i><i class="ent-push"></i></span>
          <span class="ent-leaf ent-leaf--r" aria-hidden="true"><i class="ent-win"></i><i class="ent-push"></i></span>
          ${closed ? '<span class="ent-chain" aria-hidden="true"></span><span class="ent-sticker" aria-hidden="true">関係者以外<br>立入禁止</span>' : ''}
        </span>
        <span class="ent-tag">${closed ? '⚠ ' : ''}${t.label}</span>
        <span class="ent-who">${t.who}</span>
        <span class="ent-desc">${t.desc}</span>
      </button>`;
  }

  function entryGate() {
    if (mode) return;
    if (!FX.entryGate) { setMode(SITE.defaultMode === 'spoiler' ? 'spoiler' : 'safe', true); return; }
    const g = document.createElement('div');
    g.className = 'gate gate--entrance';
    g.innerHTML = `
      <div class="ent-scene" aria-hidden="true"><span class="ent-floor"></span><span class="ent-lamp"></span></div>
      <div class="ent">
        <div class="ent-sign"><span class="ent-sign-cross">✚</span><span class="ent-sign-logo">${logoHTML('large')}</span></div>
        <p class="ent-hours">KYORAN HOSPITAL ／ 夜間受付</p>
        <div class="ent-desk">
          <p class="ent-desk-h">受付窓口</p>
          <p class="ent-desk-t">入院区分を選び、扉を開けてください。</p>
          <p class="ent-desk-note">流血・狂気・身体損壊の描写と、点滅・文字化け・<strong>大きな音</strong>の演出を含みます。<br>扉を開けると院内の音が流れます（右上のスピーカーで消音できます）。</p>
        </div>
        <div class="ent-doors">${entranceDoor('safe')}${entranceDoor('spoiler')}</div>
        <p class="gate-foot">区分はあとから画面上部のボタンで変更できます。</p>
        <button class="gate-leave" data-act="leave" type="button">帰る</button>
      </div>
      <div class="ent-black" aria-hidden="true"></div>`;
    document.body.appendChild(g);
    document.body.classList.add('is-locked');
    let busy = false;
    g.addEventListener('click', (e) => {
      if (busy) return;
      const door = e.target.closest('[data-mode]');
      if (door) {
        busy = true;
        const m = door.dataset.mode;
        // 扉の中心に向かって吸い込まれる
        const r = door.querySelector('.ent-frame').getBoundingClientRect();
        const box = g.querySelector('.ent').getBoundingClientRect();
        g.style.setProperty('--ox', (r.left + r.width / 2 - box.left) + 'px');   // .ent の中での扉の中心
        g.style.setProperty('--oy', (r.top + r.height / 2 - box.top) + 'px');
        g.style.setProperty('--vx', (r.left + r.width / 2) + 'px');              // 画面の中での扉の中心
        g.style.setProperty('--vy', (r.top + r.height / 2) + 'px');
        door.classList.add('is-open');
        g.classList.add('is-entering', 'is-entering--' + m);
        sfx.creak();
        const wait = fxActive() ? 1900 : 0;
        setTimeout(() => {
          setMode(m, true);
          g.classList.add('is-out');
          document.body.classList.remove('is-locked');
          setTimeout(() => g.remove(), 900);
        }, wait);
        return;
      }
      const leave = e.target.closest('[data-act="leave"]');
      if (leave) {
        leave.textContent = '帰れません';
        leave.disabled = true;
        g.classList.add('is-denied');
        sfx.thud();
      }
    });
  }

  /* 途中でネタバレありに切り替えるときの確認 */
  function confirmSpoiler() {
    const d = document.createElement('div');
    d.className = 'gate gate--small';
    d.innerHTML = `
      <div class="gate-inner">
        <p class="gate-label">TRANSFER ／ 転棟</p>
        <p class="gate-q">特別病棟（ネタバレあり）へ移りますか？</p>
        <p class="gate-text">結末・物語の裏側を含む、すべての記録が表示されます。<br>一度読んだ記録は、忘れられません。</p>
        <div class="gate-actions">
          <button class="btn btn--blood" type="button" data-yes>移る</button>
          <button class="btn btn--ghost" type="button" data-no>やめる</button>
        </div>
      </div>`;
    document.body.appendChild(d);
    const close = () => { d.classList.add('is-out'); setTimeout(() => d.remove(), 600); };
    d.addEventListener('click', (e) => {
      if (e.target.closest('[data-yes]')) { setMode('spoiler'); close(); }
      else if (e.target.closest('[data-no]') || e.target === d) close();
    });
  }

  function setMode(m, silent) {
    mode = m;
    local.set('kh-mode', m);
    paintMode();
    if (!silent) route();
    else route(true);
  }

  function paintMode() {
    document.documentElement.dataset.mode = mode || 'safe';
    const b = $('#mode-btn');
    if (!b) return;
    const t = MODE_TEXT[mode || 'safe'];
    b.innerHTML = `${spoilerOn() ? ICONS.eye : ICONS.eyeOff}<span class="mode-btn-label">${t.label}</span>`;
    b.title = `${t.ward}（${t.label}）— クリックで切り替え`;
  }

  /* ───────── parts ───────── */
  const groupOf = (a) => (CAT[a.cat]?.groups || []).find((g) => g.id === a.group);
  const placeName = (a) => { const c = CAT[a.cat] || {}; const g = groupOf(a); return `${c.ward || ''} ${g ? g.name : (c.name || '')}`; };
  const infoRows = (a, n) => infoOf(a).slice(0, n);
  const spoilTag = (a) => (a.spoiler ? '<span class="tag-spoiler">ネタバレ</span>' : '');
  const stampTag = (a, cls) => (a.stamp ? `<span class="${cls}">${esc(a.stamp)}</span>` : '');

  const thumb = (a, cls = '') => a.image
    ? `<div class="thumb ${cls}"><img src="${esc(a.image)}" alt="" loading="lazy"></div>`
    : `<div class="thumb thumb--none ${cls}" aria-hidden="true"><span>NO<br>IMAGE</span></div>`;

  function card(a) {
    return `
      <a class="file ${a.madness ? 'is-mad' : ''}" href="#/article/${a.id}" data-cat="${esc(a.cat)}">
        ${thumb(a, 'file-thumb')}
        <div class="file-body">
          <p class="file-meta"><span>FILE No.${fileNo(a)}</span><span>${esc(placeName(a))}</span></p>
          <h3 class="file-title">${esc(a.title)}${spoilTag(a)}</h3>
          <p class="file-sum">${esc(plain(a.summary))}</p>
          <p class="file-date">更新 ${fmtDate(a.updated)}</p>
        </div>
      </a>`;
  }

  /* ── 一覧レイアウト ── */
  const LAYOUTS = {
    files: (items) => `<div class="files">${items.map(card).join('')}</div>`,

    /* 主要人物：大きなプロフィール */
    profile: (items) => `<div class="profiles">${items.map((a) => `
      <a class="profile" href="#/article/${a.id}">
        <div class="profile-img">${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : '<span>NO IMAGE</span>'}</div>
        <div class="profile-body">
          <p class="profile-en">${esc(a.en || '')}</p>
          <h3 class="profile-name">${esc(a.title)}${spoilTag(a)}</h3>
          ${a.kana ? `<p class="profile-kana">${esc(a.kana)}</p>` : ''}
          <p class="profile-sum">${esc(plain(a.summary))}</p>
          <dl class="profile-dl">${infoRows(a, 3).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(plain(v))}</dd>`).join('')}</dl>
        </div>
        ${stampTag(a, 'stamp profile-stamp')}
      </a>`).join('')}</div>`,

    /* 医師・職員：職員証 */
    badge: (items) => `<div class="badges">${items.map((a) => `
      <a class="badge" href="#/article/${a.id}">
        <span class="badge-hole" aria-hidden="true"></span>
        <p class="badge-org">${esc(SITE.title)}<span>STAFF ID</span></p>
        <div class="badge-main">
          <div class="badge-photo">${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : '<span>NO<br>PHOTO</span>'}</div>
          <div class="badge-id">
            <p class="badge-name">${esc(a.title)}</p>
            ${a.kana ? `<p class="badge-kana">${esc(a.kana)}</p>` : ''}
            ${infoRows(a, 2).map(([k, v]) => `<p class="badge-row"><span>${esc(k)}</span>${esc(plain(v))}</p>`).join('')}
          </div>
        </div>
        <div class="badge-foot"><span class="badge-bar" aria-hidden="true"></span><span class="badge-no">No.${fileNo(a)}</span></div>
        ${stampTag(a, 'badge-stamp')}${a.spoiler ? '<span class="badge-stamp">機密</span>' : ''}
      </a>`).join('')}</div>`,

    /* 入院患者：カルテ */
    karte: (items) => `<div class="kartes">${items.map((a, i) => `
      <a class="karte ${a.madness ? 'is-mad' : ''}" href="#/article/${a.id}" style="--tilt:${[-1.2, .8, -.5, 1.1][i % 4]}deg">
        <span class="karte-clip" aria-hidden="true"></span>
        <header class="karte-h"><span>診療録</span><span>患者番号 ${fileNo(a)}</span></header>
        <div class="karte-top">
          <div class="karte-photo">${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : '<span>写真<br>なし</span>'}</div>
          <div class="karte-who">
            <p class="karte-label">氏名</p>
            <p class="karte-name">${esc(a.title)}</p>
            ${a.kana ? `<p class="karte-kana">${esc(a.kana)}</p>` : ''}
          </div>
        </div>
        <table class="karte-table">${infoRows(a, 3).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(plain(v))}</td></tr>`).join('')}</table>
        <p class="karte-label">所見</p>
        <p class="karte-note">${esc(plain(a.summary))}</p>
        <p class="karte-date">記録日 ${fmtDate(a.updated)}</p>
        ${a.stamp ? `<span class="karte-stamp">${esc(a.stamp)}</span>` : ''}${a.spoiler ? '<span class="karte-stamp">機密</span>' : ''}
      </a>`).join('')}</div>`,

    /* 病院施設：扉の並ぶ廊下 */
    doors: (items) => `<div class="corridor">${items.map(door).join('')}</div>`,
  };

  function door(a) {
    return `
      <a class="door" href="#/article/${a.id}">
        <p class="door-plate"><span class="door-room">${esc(a.room || 'ROOM ' + fileNo(a))}</span><span class="door-name">${esc(a.title)}</span></p>
        <div class="door-frame">
          <div class="door-inside"><p>${esc(plain(a.summary))}</p></div>
          <div class="door-leaf">
            <span class="door-window"></span>
            <span class="door-knob"></span>
            ${a.stamp || a.spoiler ? `<span class="door-sign">${esc(a.stamp || '立入禁止')}</span>` : ''}
          </div>
        </div>
      </a>`;
  }

  /* 記事がないときの空欄 */
  function emptyFor(layout, text) {
    if (layout === 'doors') {
      return `<div class="corridor">${['施錠中', '施錠中', '使用禁止', '施錠中'].map((s, i) => `
        <div class="door is-locked" aria-hidden="true">
          <p class="door-plate"><span class="door-room">ROOM ---</span><span class="door-name">${i === 2 ? '██████' : '未記録'}</span></p>
          <div class="door-frame"><div class="door-leaf"><span class="door-window"></span><span class="door-knob"></span><span class="door-sign">${s}</span></div></div>
        </div>`).join('')}</div>
        <p class="corridor-note">${esc(text || '扉はまだ開かない。')}</p>`;
    }
    if (layout === 'karte') return `<div class="kartes"><div class="karte is-blank"><span class="karte-clip"></span><header class="karte-h"><span>診療録</span><span>患者番号 ---</span></header><p class="karte-blank">${esc(text || '空床。')}</p></div></div>`;
    return `<div class="empty"><p class="empty-en">NO RECORDS</p><p>${esc(text || 'この病棟には、まだ誰もいない。')}</p></div>`;
  }

  /* 表の行：['A','B'] か、ネタバレ行なら { cells: ['A','B'], spoiler: true } */
  const tableRows = (b) => (b.rows || []).filter((r) => Array.isArray(r) || showPart(r)).map((r) => (Array.isArray(r) ? r : r.cells || []));

  /* ── 本文ブロック ── */
  function block(b) {
    if (!showPart(b)) return '';
    const html = blockInner(b);
    return b && b.spoiler ? `<div class="spoil-block"><span class="spoil-mark">ネタバレ</span>${html}</div>` : html;
  }
  function blockInner(b) {
    if (typeof b === 'string') return `<p>${inline(b)}</p>`;
    switch (b.type) {
      case 'p': return `<p>${inline(b.text)}</p>`;
      case 'list': return `<ul class="b-list">${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
      case 'olist': return `<ol class="b-list b-list--ol">${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ol>`;
      case 'warn': return `<aside class="b-box b-warn"><p class="b-box-h">⚠ ${esc(b.title || '警告')}</p><p>${inline(b.text)}</p></aside>`;
      case 'note': return `<aside class="b-box b-note"><p class="b-box-h">${esc(b.title || 'メモ')}</p><p>${inline(b.text)}</p></aside>`;
      case 'record': return `<aside class="b-record"><p class="b-record-h">${esc(b.title || '記録')}</p><p class="b-record-t">${inline(b.text)}</p></aside>`;
      case 'quote': return `<blockquote class="b-quote"><p>${inline(b.text)}</p>${b.by ? `<cite>── ${inline(b.by)}</cite>` : ''}</blockquote>`;
      case 'table': {
        const rows = tableRows(b);
        return `<div class="b-table-wrap"><table class="b-table">${b.head ? `<thead><tr>${b.head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      }
      case 'image': return `<figure class="b-figure"><img src="${esc(b.src)}" alt="${esc(b.caption || '')}" loading="lazy">${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ''}</figure>`;
      case 'flow': return `<ol class="b-flow">${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ol>`;
      case 'html': return b.html; // 上級者向け：生のHTML
      default: return '';
    }
  }

  /* ───────── views ───────── */
  function spoilerBanner() {
    if (!spoilerOn()) return '';
    return `<div class="spoil-banner" role="note">
      <span class="spoil-banner-icon">⚠</span>
      <p><strong>ネタバレあります！</strong><span>特別病棟モード：結末・物語の裏側を含むすべての記録を表示しています。</span></p>
      <button type="button" class="spoil-banner-btn" data-set-mode="safe">ネタバレなしに戻す</button>
    </div>`;
  }

  function viewHome() {
    const recent = [...LIST()].sort(byUpdated).slice(0, 6);
    const zero = sanity.value <= 0 && FX.sanityGauge;
    const notices = ((zero ? SITE.blameTexts : SITE.notices) || []).map((n) => `<span>${esc(n)}</span>`).join('<span class="sep">✚</span>');
    return `
      <section class="hero">
        <div class="hero-light" aria-hidden="true"></div>
        ${SITE.heroLogo ? '' : '<p class="hero-label">PRIVATE MEDICAL ARCHIVE</p>'}
        <h1 class="hero-logo${SITE.heroLogo ? ' hero-logo--svg' : ''}">${SITE.heroLogo ? heroLogoHTML() : logoHTML('large')}</h1>
        ${SITE.heroLogo ? '' : `<p class="hero-sub">${esc(SITE.subtitle)}</p>`}
        <p class="hero-tag">${esc(zero ? 'もう、平常ではいられない。' : SITE.tagline)}</p>
        <div class="hero-actions">
          <a class="btn btn--blood" href="#/article/kyoran-byouin">作品概要を読む</a>
          <a class="btn btn--ghost" href="#/all">全記録を見る</a>
        </div>
        <p class="hero-mode">現在の入院区分：<strong>${MODE_TEXT[mode || 'safe'].ward}（${MODE_TEXT[mode || 'safe'].label}）</strong></p>
      </section>
      ${notices ? `<div class="ticker" aria-label="院内放送"><div class="ticker-track">${notices}<span class="sep">✚</span>${notices}<span class="sep">✚</span></div></div>` : ''}
      <section class="sec">
        <header class="sec-h"><p class="sec-en">FLOOR GUIDE</p><h2>院内案内図</h2></header>
        <div class="wards ${CATS().length % 4 === 3 ? 'wards--feature' : CATS().length % 3 === 0 ? 'wards--3' : ''}">
          ${CATS().map((c) => {
            const n = inCat(c.id).length;
            return `<a class="ward" href="#/cat/${c.id}" data-cat="${c.id}">
              <span class="ward-no">${esc(c.ward)}</span>
              <span class="ward-icon">${ICONS[c.icon] || ''}</span>
              <span class="ward-name">${esc(c.name)}</span>
              <span class="ward-en">${esc(c.en)}</span>
              <span class="ward-count">${n ? `記録 ${n} 件` : '空室'}</span>
            </a>`;
          }).join('')}
        </div>
      </section>
      <section class="sec">
        <header class="sec-h"><p class="sec-en">RECENT RECORDS</p><h2>最近更新された記録</h2></header>
        <div class="files">${recent.map(card).join('')}</div>
        <p class="sec-more"><a href="#/all">すべての記録 →</a></p>
      </section>`;
  }

  function wardNav(current) {
    return `<nav class="ward-strip" aria-label="病棟">${CATS().map((c) =>
      `<a href="#/cat/${c.id}" class="${c.id === current ? 'is-on' : ''}">${esc(c.ward)} ${esc(c.name)}</a>`).join('')}</nav>`;
  }

  function viewCategory(id) {
    const c = CAT[id];
    if (!catVisible(c)) return viewMissing();
    const items = inCat(id).sort(byUpdated);
    const render = (list, layout, emptyText) => (list.length ? (LAYOUTS[layout] || LAYOUTS.files)(list) : emptyFor(layout, emptyText));
    let body;
    if (c.groups && c.groups.length) {
      const known = new Set(c.groups.map((g) => g.id));
      const rest = items.filter((a) => !known.has(a.group));
      body = `
        <nav class="group-tabs">${c.groups.map((g) => `<a href="#/cat/${c.id}" data-jump="g-${g.id}">${esc(g.name)}<small>${items.filter((a) => a.group === g.id).length}</small></a>`).join('')}</nav>
        ${c.groups.map((g) => `
          <section class="group" id="g-${g.id}" data-layout="${esc(g.layout || 'files')}">
            <header class="sec-h"><p class="sec-en">${esc(g.en || '')}</p><h2>${esc(g.name)}</h2></header>
            ${render(items.filter((a) => a.group === g.id), g.layout || c.layout, g.empty)}
          </section>`).join('')}
        ${rest.length ? `<section class="group"><header class="sec-h"><p class="sec-en">OTHERS</p><h2>その他</h2></header>${render(rest, c.layout)}</section>` : ''}`;
    } else {
      body = render(items, c.layout, c.empty);
    }
    return `
      <nav class="crumbs"><a href="#/">受付</a><span>／</span><span>${esc(c.ward)} ${esc(c.name)}</span></nav>
      <header class="page-h">
        <span class="page-icon">${ICONS[c.icon] || ''}</span>
        <p class="page-en">WARD ${esc(c.ward)} ／ ${esc(c.en)}</p>
        <h1 class="page-title">${esc(c.name)}</h1>
        <p class="page-desc">${esc(c.desc)}</p>
      </header>
      ${body}
      ${wardNav(id)}`;
  }

  function viewArticle(id) {
    const a = get(id);
    if (!a) return viewMissing(); // ネタバレなしモードでは、存在そのものを見せない
    if (wreck.active() && !a.madness && wreck.broken.has(a.id)) {
      return `<div class="empty empty--big empty--blood"><p class="empty-en">DESTROYED</p><p>この記録は、あなたが壊した。<br>もう、読めない。</p><a class="btn btn--ghost" href="#/">受付へ戻る</a></div>`;
    }
    const c = CAT[a.cat] || {};
    const g = groupOf(a);
    const layout = g?.layout || c.layout || 'files';
    const sibs = inCat(a.cat).filter((x) => !g || x.group === a.group).sort(byUpdated);
    const i = sibs.indexOf(a);
    const prev = sibs[i - 1], next = sibs[i + 1];
    const related = (a.related || []).map(get).filter(Boolean);
    const secs = sectionsOf(a);
    const info = infoOf(a);
    const toc = secs.length > 2
      ? `<nav class="toc"><p class="toc-h">目次</p><ol>${secs.map((s, n) => `<li><a href="#/article/${a.id}" data-jump="s${n}">${esc(s.h)}${s.spoiler ? ' <span class="toc-spoil">ネタバレ</span>' : ''}</a></li>`).join('')}</ol></nav>` : '';
    const chartName = ({ badge: ['職員記録', 'STAFF RECORD'], doors: ['区画記録', 'AREA RECORD'] })[layout] || ['診療録', 'MEDICAL CHART'];

    return `
      <nav class="crumbs"><a href="#/">受付</a><span>／</span><a href="#/cat/${a.cat}">${esc(c.ward || '')} ${esc(c.name || '')}</a>${g ? `<span>／</span><span>${esc(g.name)}</span>` : ''}<span>／</span><span>${esc(a.title)}</span></nav>
      <article class="art ${a.madness ? 'is-mad' : ''}" data-id="${esc(a.id)}" data-cat="${esc(a.cat)}" data-layout="${esc(layout)}">
        <header class="art-h">
          <p class="art-file">FILE No.${fileNo(a)} ／ ${esc(a.en || c.en || '')}</p>
          <h1 class="art-title" data-text="${esc(a.title)}">${esc(a.title)}</h1>
          ${a.kana ? `<p class="art-kana">${esc(a.kana)}</p>` : ''}
          <p class="art-sum">${inline(a.summary)}</p>
          <p class="art-stamp">${a.spoiler ? '<span class="stamp">機密</span>' : ''}<span>更新 ${fmtDate(a.updated)}</span></p>
          ${a.spoiler ? '<p class="art-spoil">⚠ この記録はネタバレ記事です。物語の核心に触れる内容を含みます。</p>' : ''}
        </header>
        <div class="art-grid">
          <div class="art-main">
            ${toc}
            ${secs.map((s, n) => `
              <section class="art-sec ${s.spoiler ? 'is-spoil' : ''}" id="s${n}">
                <h2>${esc(s.h)}${s.spoiler ? '<span class="spoil-mark spoil-mark--h">ネタバレ</span>' : ''}</h2>
                ${(s.body || []).map(block).join('')}
              </section>`).join('')}
          </div>
          <aside class="art-side">
            <div class="chart">
              <p class="chart-h">${chartName[0]} <span>${chartName[1]}</span></p>
              ${a.image ? `<div class="chart-img"><img src="${esc(a.image)}" alt="${esc(a.title)}"></div>` : `<div class="chart-img chart-img--none" aria-hidden="true"><span>NO IMAGE</span></div>`}
              <p class="chart-name">${esc(a.title)}</p>
              ${info.length ? `<dl class="chart-dl">${info.map(([k, v, sp]) => `<dt>${esc(k)}</dt><dd class="${sp ? 'is-spoil' : ''}">${inline(v)}</dd>`).join('')}</dl>` : ''}
            </div>
          </aside>
        </div>
      </article>
      ${related.length ? `
        <section class="sec sec--tight">
          <header class="sec-h"><p class="sec-en">RELATED FILES</p><h2>関連項目</h2></header>
          <div class="files files--small">${related.map(card).join('')}</div>
        </section>` : ''}
      <nav class="pager">
        ${prev ? `<a href="#/article/${prev.id}" class="pager-prev">${ICONS.back}<span><small>前の記録</small>${esc(prev.title)}</span></a>` : '<span></span>'}
        ${next ? `<a href="#/article/${next.id}" class="pager-next"><span><small>次の記録</small>${esc(next.title)}</span>${ICONS.next}</a>` : '<span></span>'}
      </nav>`;
  }

  function viewAll(sort) {
    const s = sort || 'updated';
    const items = [...LIST()];
    if (s === 'updated') items.sort(byUpdated);
    if (s === 'name') items.sort((a, b) => (a.kana || a.title).localeCompare(b.kana || b.title, 'ja'));
    if (s === 'ward') items.sort((a, b) => CATEGORIES.findIndex((c) => c.id === a.cat) - CATEGORIES.findIndex((c) => c.id === b.cat) || byUpdated(a, b));
    const tab = (k, l) => `<a href="#/all?sort=${k}" class="${s === k ? 'is-on' : ''}">${l}</a>`;
    return `
      <nav class="crumbs"><a href="#/">受付</a><span>／</span><span>全記録</span></nav>
      <header class="page-h">
        <span class="page-icon">${ICONS.list}</span>
        <p class="page-en">ALL RECORDS ／ ${items.length} FILES</p>
        <h1 class="page-title">全記録</h1>
      </header>
      <div class="tabs">${tab('updated', '更新順')}${tab('name', '名前順')}${tab('ward', '病棟順')}</div>
      <div class="files">${items.map(card).join('')}</div>`;
  }

  function blockText(b) {
    if (!showPart(b)) return '';
    if (typeof b === 'string') return b;
    return [b.title, b.text, b.by, b.caption, ...(b.items || []), ...(b.head || []), ...(b.rows ? tableRows(b).flat() : [])].join(' ');
  }
  function searchHits(q) {
    const k = q.trim().toLowerCase();
    if (!k) return [];
    return LIST().map((a) => {
      const body = sectionsOf(a).map((s) => s.h + ' ' + (s.body || []).map(blockText).join(' ')).join(' ');
      const fields = [
        [a.title, 10], [a.kana, 8], [a.en, 6], [(a.keywords || []).join(' '), 7],
        [a.summary, 4], [infoOf(a).map((r) => r[0] + ' ' + r[1]).join(' '), 3], [body, 1],
      ];
      let score = 0;
      fields.forEach(([t, w]) => { if (t && plain(t).toLowerCase().includes(k)) score += w; });
      return { a, score };
    }).filter((r) => r.score > 0).sort((x, y) => y.score - x.score).map((r) => r.a);
  }

  function viewSearch(q) {
    const hits = searchHits(q);
    return `
      <nav class="crumbs"><a href="#/">受付</a><span>／</span><span>検索</span></nav>
      <header class="page-h">
        <span class="page-icon">${ICONS.search}</span>
        <p class="page-en">SEARCH ／ ${hits.length} HITS</p>
        <h1 class="page-title">「${esc(q)}」の記録</h1>
      </header>
      ${hits.length ? `<div class="files">${hits.map(card).join('')}</div>`
        : `<div class="empty"><p class="empty-en">NOT FOUND</p><p>該当する記録はありません。……あるいは、消されたのかもしれない。</p></div>`}`;
  }

  function viewMissing() {
    return `<div class="empty empty--big"><p class="empty-en">404 ／ MISSING PATIENT</p><p>この記録は存在しない。最初から、存在しなかった。</p><a class="btn btn--ghost" href="#/">受付へ戻る</a></div>`;
  }

  /* ───────── router ───────── */
  const app = $('#app');
  function route(keepScroll) {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [path, qs] = raw.split('?');
    const params = new URLSearchParams(qs || '');
    const [head, arg] = path.split('/');
    let html, title = SITE.title;

    if (!head) html = viewHome();
    else if (head === 'cat') { html = viewCategory(arg); title = (catVisible(CAT[arg]) ? CAT[arg].name : '記録なし') + ' ｜ ' + SITE.title; }
    else if (head === 'article') { html = viewArticle(arg); title = (get(arg)?.title || '記録なし') + ' ｜ ' + SITE.title; }
    else if (head === 'all') { html = viewAll(params.get('sort')); title = '全記録 ｜ ' + SITE.title; }
    else if (head === 'search') { html = viewSearch(params.get('q') || ''); title = '検索 ｜ ' + SITE.title; }
    else html = viewMissing();

    app.classList.remove('is-in'); void app.offsetWidth;
    app.innerHTML = spoilerBanner() + html;
    app.classList.add('is-in');
    document.title = title;
    if (keepScroll !== true) window.scrollTo(0, 0);
    $('#search-input').value = head === 'search' ? (params.get('q') || '') : '';
    document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#/' + (head || '')));

    readingId = head === 'article' && get(arg) ? arg : null;
    if (wreck.active()) { decorate(); if (FX.corruption) rot(); }
    hud();
    corrupt.scan();
    heroLogo.mount();
    if (readingId) sanity.visit(arg);
  }

  /* 精神ゲージ 0：古い記録を叩く（リンク遷移より先に横取りする） */
  document.addEventListener('click', (e) => {
    if (!wreck.active()) return;
    const el = e.target.closest(CARD_SEL + ', .art[data-id]');
    if (!el || !app.contains(el)) return;
    if (el.matches('.art') && e.target.closest('a, button, .toc, .chart')) return; // 記事内のリンクはそのまま使える
    const id = idOf(el); const a = id && ART[id];
    if (!a || a.madness || el.classList.contains('is-broken')) return;
    e.preventDefault(); e.stopPropagation();
    wreck.hit(id, el, e.clientX, e.clientY);
  }, true);

  document.addEventListener('click', (e) => {
    const j = e.target.closest('[data-jump]');
    if (j) { e.preventDefault(); document.getElementById(j.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    const m = e.target.closest('[data-set-mode]');
    if (m) setMode(m.dataset.setMode);
  });

  /* ───────── shell ───────── */
  function shell() {
    $('#logo-slot').innerHTML = logoHTML('small');
    $('#search-icon').innerHTML = ICONS.search;
    $('#search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = $('#search-input').value.trim();
      if (q) location.hash = '#/search?q=' + encodeURIComponent(q);
    });

    $('#mode-btn').addEventListener('click', () => (spoilerOn() ? setMode('safe') : confirmSpoiler()));

    $('#sanity').addEventListener('click', () => $('#sanity-pop').toggleAttribute('hidden'));
    $('#sanity-reset').addEventListener('click', () => { $('#sanity-pop').hidden = true; injectFx('鎮静剤 投与中…', () => sanity.reset()); });
    $('#sanity-lock').addEventListener('click', () => {
      $('#sanity-pop').hidden = true;
      if (sanity.locked) sanity.toggleLock();
      else injectFx('精神安定剤 投与中…', () => sanity.toggleLock());
    });
    app.addEventListener('mouseover', (e) => { const r = e.target.closest('.redact'); if (r) peekRedact(r); });
    app.addEventListener('focusin', (e) => { const r = e.target.closest('.redact'); if (r) peekRedact(r); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.sanity-wrap')) $('#sanity-pop').hidden = true; });

    const fxBtn = $('#fx-toggle');
    const paintFx = () => { document.documentElement.dataset.fx = effectsOn ? 'on' : 'off'; fxBtn.textContent = effectsOn ? '演出：ON' : '演出：OFF'; };
    fxBtn.addEventListener('click', () => { effectsOn = !effectsOn; local.set('kh-effects', effectsOn); paintFx(); paintSnd(); if (effectsOn) amb.start(); else amb.stop(); });
    paintFx();

    /* 音のON/OFF（ヘッダーのスピーカー） */
    const sndBtn = $('#snd-btn');
    const paintSnd = () => {
      if (!sndBtn) return;
      sndBtn.hidden = !FX.sound;
      const on = soundOn && effectsOn;
      sndBtn.innerHTML = `${on ? ICONS.sound : ICONS.mute}<span class="mode-btn-label">${on ? '音あり' : '無音'}</span>`;
      sndBtn.title = on ? '音：ON — クリックで消音' : (effectsOn ? '音：OFF — クリックで音を出す' : '演出OFF中は無音です');
      sndBtn.classList.toggle('is-off', !on);
      sndBtn.setAttribute('aria-pressed', String(on));
    };
    sndBtn?.addEventListener('click', () => {
      soundOn = !soundOn; local.set('kh-sound', soundOn);
      if (soundOn && !effectsOn) { effectsOn = true; local.set('kh-effects', true); paintFx(); }
      paintSnd();
      if (soundOn) { amb.start(); sfx.page(); } else amb.stop();
    });
    paintSnd();
    /* ブラウザは「最初の操作」までは音を出せないので、最初のクリック／キー入力で環境音を始める */
    const kick = () => { if (!amb.on) amb.start(); else audio(); };
    ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, kick, { capture: true, passive: true }));
    /* 別タブにいるあいだは止める */
    document.addEventListener('visibilitychange', () => {
      if (!actx) return;
      if (document.visibilityState === 'hidden') actx.suspend();
      else if (amb.on) actx.resume();
    });
    /* 施設の扉にマウスを乗せると、きしむ */
    let creakAt = 0;
    app.addEventListener('mouseover', (e) => {
      const d = e.target.closest('.door:not(.is-locked)');
      if (!d || d.contains(e.relatedTarget) || performance.now() - creakAt < 1200) return;
      creakAt = performance.now(); sfx.creak(.14);
    });

    $('#year').textContent = new Date().getFullYear();
    sanity.paint();
    paintMode();
    corrupt.restart();
  }

  shell();
  window.addEventListener('hashchange', () => { sfx.page(); route(); });
  route();
  entryGate();
  whisperLoop();
})();
