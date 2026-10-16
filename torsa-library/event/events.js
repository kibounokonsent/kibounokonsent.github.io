/* =========================================================
   トルサ図書館：イベント（全画面の一枚絵が、部品ごとに Live2D のように動く）
   ---------------------------------------------------------
   index.html から読み込まれます。設定（セリフ・表情・部品・骨・動きの大きさ・いつ起こるか）は
   event/events.json にあるので、ふだんはこのファイルを開かなくても直せます。

   いじりやすい場所（このファイルの中を検索してください）
   ・CSS        … 画面の見た目（会話の箱・「吹き出し非表示」・さわったときのひとこと・うしろの煙）
   ・pose(      … 毎フレームの動き（呼吸・頭のゆらぎ・髪・耳・目・汗・葉）
   ・react(     … イベント中にトルサにさわったときの動き（head／ear／horn／collar／leaf／body）と、小ネタ（secrets）
   ・choose(    … 選択肢をえらんだときの流れ（画面がゆれてから部品が出る、など）
   ・applyMotion( … セリフや選択肢の "motion"・"boneMotion" で、途中から動きの大きさや速さを変える
   ・LEAF_MODE  … 葉の動き（rest／wiggle／tight／loose）の強さ
   ・TYPE_MS    … 文字が出る速さ（1文字あたりのミリ秒）
   ・struggle   … 葉から抜け出そうと、上へゆさゆさもがく動き（motion の struggle で強さ、struggleSpeed で速さ）
   ・allSpeed   … すべての動きの速さ（motion の allSpeed。2 で2倍。frame( の中）
   ・drawLeaves( … うしろのゆらゆら揺れる葉っぱ（bg.leaves。作るのは buildLeaves(）
   ・flash(     … 白くぱちぱち光る（セリフ・選択肢・さわったときの "flash"）
   ・BOX_VARS   … 会話の箱の見た目（events.json の "box"。いちばん外に書くと全イベント共通）
   ・special(   … 何回目かにさわったときの特別な反応（secrets・touch の "on"）
   ・playSound( … 効果音ファイルを鳴らす（イベントの "sounds" に登録、"sound" で鳴らす、"stopSound" で止める）

   確認用：ブラウザのコンソールで __event("vault-fall") と打つと、その場でイベントが始まります。
   URL の最後に ?event=vault-fall を付けると、入館してすぐに始まります。
   ========================================================= */
window.TorsaEvents = (ctxIn) => {
  "use strict";
  const ctx = ctxIn || {};
  const reduced = ctx.reduced ?? matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SFX = ctx.SFX || { play() {}, blip() {} };
  const TYPE_MS = 34;
  const D2R = Math.PI / 180;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;

  let CONF = null;
  const confReady = fetch(ctx.url || "event/events.json")
    .then((r) => { if (!r.ok) throw new Error("events.json"); return r.json(); })
    .then((j) => (CONF = j))
    .catch((e) => { console.warn("event/events.json を読み込めなかったので、イベントは起こりません", e); return null; });

  /* ---------- CSS（画面の見た目） ---------- */
  const CSS = `
.ev { position: fixed; inset: 0; z-index: 190; overflow: hidden; background: #0b0714; color: #2b2a3a; cursor: pointer;
  -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
.ev[hidden] { display: none !important; }
.ev:focus { outline: none; }
.ev-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 38%, var(--ev-glow) 0%, transparent 70%), linear-gradient(var(--ev-top), var(--ev-bottom)); }
.ev-bg.has-img { background-size: cover; background-position: center; }
.ev-bg::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 46px, transparent 46px 210px); filter: blur(10px); opacity: .55; }
.ev-smoke { position: absolute; width: 70vmax; height: 70vmax; border-radius: 50%; filter: blur(30px); opacity: .32; pointer-events: none;
  background: radial-gradient(circle, rgba(220, 70, 110, .55), rgba(150, 40, 90, .18) 45%, transparent 70%); }
.ev-smoke.a { left: -30vmax; bottom: -38vmax; animation: ev-drift 19s ease-in-out infinite alternate; }
.ev-smoke.b { right: -34vmax; top: -30vmax; opacity: .22; animation: ev-drift 23s ease-in-out -7s infinite alternate-reverse; }
@keyframes ev-drift { to { transform: translate(9vmax, -6vmax) scale(1.15); } }
.ev-motes i { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: #ffd6e6; box-shadow: 0 0 8px 2px rgba(255, 150, 190, .55); opacity: 0;
  animation: ev-mote var(--d) linear var(--dl) infinite; }
@keyframes ev-mote { 0% { opacity: 0; transform: translate(0, 0); } 15% { opacity: .8; } 85% { opacity: .6; } 100% { opacity: 0; transform: translate(var(--dx), -38vh); } }
.ev-cv, .ev-leaves { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.ev-leaves { pointer-events: none; }
.ev-leaves[hidden] { display: none; }
.ev-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 80% at 50% 45%, transparent 55%, rgba(5, 2, 12, .72) 100%); }
.ev-flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; will-change: opacity; }
.ev-fade { position: absolute; inset: 0; background: #05030a; opacity: 1; pointer-events: none; transition: opacity .7s ease; }
.ev.on .ev-fade { opacity: 0; }
.ev.out .ev-fade { opacity: 1; transition-duration: .6s; }

.ev-ui { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 max(16px, calc((100vw - var(--ev-maxw, 980px)) / 2)) calc(max(18px, env(safe-area-inset-bottom)) + var(--ev-lift, 0px)); transition: opacity .35s ease, transform .35s ease; }
.ev.ui-off .ev-ui { opacity: 0; transform: translateY(14px); pointer-events: none; }
.ev-box { position: relative; min-height: var(--ev-minh, 5.4em); padding: var(--ev-pad, 26px 30px 24px); border-radius: var(--ev-radius, 16px); background: var(--ev-box, #f7f2e5); color: var(--ev-ink, #2b2a3a);
  box-shadow: var(--ev-shadow, 0 0 0 1.5px var(--ev-line, #c9a35a), 0 0 0 5px var(--ev-ring, rgba(247, 242, 229, .92)), 0 0 0 6.5px var(--ev-ring2, rgba(201, 163, 90, .7)), 0 16px 40px rgba(0, 0, 0, .5));
  opacity: 0; transform: translateY(10px); transition: opacity .35s ease, transform .35s ease; }
.ev.talking .ev-box { opacity: 1; transform: none; }
.ev-name { position: absolute; left: 22px; top: -15px; padding: 2px 16px 3px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: .2em;
  background: var(--ev-name-bg, linear-gradient(90deg, #3d2652, #5a3570)); color: var(--ev-name-ink, #f3d08a); box-shadow: 0 0 0 1.5px var(--ev-line, #c9a35a); }
.ev-name:empty { display: none; }
.ev-tools { position: absolute; right: 16px; top: -15px; display: flex; gap: 8px; }
.ev-tools button { border: 0; padding: 3px 13px 4px; border-radius: 999px; font: 700 12px/1.6 var(--font-ui, sans-serif); letter-spacing: .06em; cursor: pointer;
  background: rgba(36, 22, 50, .88); color: #f2ecdc; box-shadow: 0 0 0 1.2px rgba(214, 176, 98, .75); }
.ev-tools button:hover { background: rgba(70, 42, 92, .95); }
.ev-tools button:focus-visible { outline: 2px solid #f3d08a; outline-offset: 2px; }
.ev-text { margin: 0; color: var(--ev-ink, #2b2a3a); font-weight: 500; font-size: var(--ev-fs, 18px); line-height: var(--ev-lh, 1.8); font-family: var(--ev-font, var(--font-ui, "Zen Maru Gothic", sans-serif)); min-height: 3.6em; }
.ev-text .ch { opacity: 0; } .ev-text .ch.on { opacity: 1; }
.ev-box.narr .ev-text { opacity: .7; text-align: center; font-family: var(--ev-narr-font, var(--font-read, serif)); letter-spacing: .08em; }
.ev-choices { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.ev-choices[hidden] { display: none; }
.ev-choices .ev-choice { display: inline-block; border: 1.5px solid var(--ev-line, #c9a35a); background: var(--ev-choice, rgba(255, 255, 255, .55)); color: var(--ev-ink, #2b2a3a); border-radius: 999px; padding: 6px 20px; font: 700 15px/1.5 var(--font-ui, sans-serif); letter-spacing: .06em; cursor: pointer; }
.ev-choices .ev-choice::before { content: "✦"; color: var(--ev-line, #c9a35a); margin-right: .5em; font-size: .8em; }
.ev-choices .ev-choice:hover, .ev-choices .ev-choice:focus-visible { background: var(--ev-choice-hover, #fff7e0); outline: none; box-shadow: 0 0 0 3px rgba(201, 163, 90, .35); }
.ev-next { position: absolute; right: 22px; bottom: 12px; font-size: 12px; color: var(--ev-next, #a08a5a); animation: ev-blink 1.2s steps(2) infinite; }
@keyframes ev-blink { 50% { opacity: .2; } }
.ev-hint { position: absolute; left: 0; right: 0; bottom: max(18px, env(safe-area-inset-bottom)); text-align: center; font-size: 12px; letter-spacing: .12em; color: rgba(242, 236, 220, .6);
  opacity: 0; transition: opacity .4s ease .3s; pointer-events: none; }
.ev.ui-off .ev-hint { opacity: 1; }
@media (max-width: 640px) {
  .ev-box { padding: var(--ev-pad-sp, 24px 18px 22px); min-height: var(--ev-minh-sp, 6.4em); }
  .ev-text { font-size: var(--ev-fs-sp, 16px); }
  .ev-name { left: 14px; } .ev-tools { right: 10px; gap: 6px; } .ev-tools button { padding: 3px 10px 4px; font-size: 11px; }
}
/* さわったときのひとこと（頭の横に出る小さな吹き出し） */
.ev-pop { position: absolute; left: 0; top: 0; max-width: min(15em, 70vw); margin: 0; padding: 8px 14px; border-radius: 14px; background: #fff7fa; color: #4a2a3e; box-shadow: 0 0 0 1.5px #e897ae, 0 8px 22px rgba(0, 0, 0, .35);
  font: 700 clamp(13px, 1vw + .6vh, 17px)/1.55 var(--font-ui, sans-serif); pointer-events: none; opacity: 0; transform: translateY(6px) scale(.96); transition: opacity .2s ease, transform .2s ease; }
.ev-pop.show { opacity: 1; transform: none; }
.ev.touching { cursor: grab; }
@media (prefers-reduced-motion: reduce) { .ev-smoke, .ev-motes i { animation: none; } }
`;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---------- 画面の部品 ---------- */
  const root = document.createElement("div");
  root.className = "ev"; root.hidden = true;
  root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "イベント");
  root.innerHTML = `
    <div class="ev-bg"><i class="ev-smoke a"></i><i class="ev-smoke b"></i><div class="ev-motes"></div></div>
    <canvas class="ev-leaves" aria-hidden="true" hidden></canvas>
    <canvas class="ev-cv" aria-hidden="true"></canvas>
    <div class="ev-vig"></div>
    <div class="ev-flash"></div>
    <div class="ev-ui">
      <div class="ev-box">
        <span class="ev-name"></span>
        <div class="ev-tools"><button type="button" class="ev-hide">吹き出し非表示</button><button type="button" class="ev-skip">スキップ</button></div>
        <p class="ev-text" aria-live="polite"></p>
        <div class="ev-choices" hidden></div>
        <span class="ev-next" hidden>▼</span>
      </div>
    </div>
    <p class="ev-hint">トルサ以外の場所をタップすると、吹き出しがもどります</p>
    <p class="ev-pop" aria-live="polite"></p>
    <div class="ev-fade"></div>`;
  const q = (s) => root.querySelector(s);
  const cv = q(".ev-cv"), g = cv.getContext("2d");
  const lv = q(".ev-leaves"), lg = lv.getContext("2d"); // うしろの葉っぱ
  const flashEl = q(".ev-flash"); // 白くぱちぱち光る
  const addRoot = () => { if (!root.isConnected) document.body.appendChild(root); };
  if (document.body) addRoot(); else addEventListener("DOMContentLoaded", addRoot);

  /* ---------- 部品の絵を読み込む ---------- */
  const cache = {}; // イベントID → { imgs, boxes }
  const loadImg = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { console.warn("イベントの部品が読めません:", src); res(null); }; im.src = src; });
  // 部品の中で、絵がある範囲（キャンバスの座標）を調べる。描き直した部品でも、自動で範囲が合う
  function measure(im, W, H) {
    const c = document.createElement("canvas"), k = 2; c.width = Math.ceil(W * k); c.height = Math.ceil(H * k);
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, c.width, c.height);
    let d; try { d = x.getImageData(0, 0, c.width, c.height).data; } catch (e) { return [0, 0, W, H]; }
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 3) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const p = 2;
    return [Math.max(0, x0 / k - p), Math.max(0, y0 / k - p), Math.min(W, (x1 + 1) / k + p), Math.min(H, (y1 + 1) / k + p)];
  }
  // 絵のファイル（1つ）から、レイヤー（id）ごとに部品の絵を作る。使っているグラデーションだけを入れる
  function partSVG(doc, rootEl, layerId) {
    const el = doc.getElementById(layerId); if (!el) return null;
    const g = el.cloneNode(true); g.removeAttribute("style"); g.removeAttribute("display"); // 非表示にしたレイヤーも使う
    const need = new Set(), defs = [];
    const scan = (txt) => { for (const m of txt.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)) { const id = m[1] || m[2]; if (!need.has(id)) { need.add(id); const d = doc.getElementById(id); if (d) { defs.push(d); scan(d.outerHTML); } } } };
    const body = new XMLSerializer().serializeToString(g); scan(body);
    const vb = rootEl.getAttribute("viewBox"), w = rootEl.getAttribute("width"), h = rootEl.getAttribute("height");
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${vb}"><defs>${defs.map((d) => new XMLSerializer().serializeToString(d)).join("")}</defs>${body}</svg>`;
  }
  function prefetch(id) {
    if (cache[id]) return cache[id].ready;
    const ev = CONF && CONF.events[id]; if (!ev) return Promise.resolve(null);
    const c = (cache[id] = { imgs: {}, boxes: {} });
    const [W, H] = ev.canvas;
    c.ready = fetch(ev.art).then((r) => { if (!r.ok) throw new Error(ev.art); return r.text(); }).then((txt) => {
      const doc = new DOMParser().parseFromString(txt, "image/svg+xml"), rootEl = doc.documentElement;
      return Promise.all(ev.parts.map((p) => {
        const svg = partSVG(doc, rootEl, p.layer || p.id);
        if (!svg) { console.warn("イベントの絵に、このレイヤーがありません:", p.layer || p.id); return null; }
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        return loadImg(url).then((im) => { if (!im) return; c.imgs[p.id] = im; c.boxes[p.id] = measure(im, W, H); });
      }));
    }).catch((e) => console.warn("イベントの絵を読み込めません:", e)).then(() => c);
    return c.ready;
  }

  /* ---------- 状態 ---------- */
  let EV = null, EID = "", C = null, bmp = {}, ppu = 1, dpr = 1, cssW = 0, cssH = 0, cam = null, raf = 0, t0 = 0, lastT = 0;
  let lines = [], li = -1, typing = 0, fullDone = true, ending = false, playing = false, resizeT = 0;
  const S = {}; // 表情（いまの値）
  const T = {}; // 表情（目標の値）
  const FACE_KEYS = ["blush", "lines", "sweat", "squeeze", "hide", "tremble", "tilt"];
  const L = { mode: "rest", amt: 0, wig: 0, off: 0, alpha: 0, enter: 0 }; // 葉
  // 葉の動き：in＝巻きつく向きに回る量、wig＝うねうねの強さ、off＝外へ開く量（loose）、alpha＝見え方
  const LEAF_MODE = { rest: { amt: 0.15, wig: 0.15, off: 0, alpha: 1 }, wiggle: { amt: 0.45, wig: 1, off: 0, alpha: 1 }, tight: { amt: 1, wig: 0.45, off: 0, alpha: 1 }, loose: { amt: -0.4, wig: 0.2, off: 1, alpha: 0 } };
  const A = { x: 0, y: 0, tx: 0, ty: 0 }; // マウスの方を向く量
  const HR = { r: 0, v: 0 }; // 髪の遅れ（ばね）
  let shakeAt = -99, shakeAmt = 0, fallAt = -99, squeezeAt = 0, squeezeFrom = -9, flickAt = 6, flickFrom = -9, flickSide = 1, sweatAt = 0;

  // さわったときの反応（いつさわったか・どれだけ強いか）
  const RX = { head: -9, ear_l: -9, ear_r: -9, horn: -9, collar: -9, body: -9, leaf: {}, blush: 0, blushAt: -9, trem: 0, tremAt: -9, jump: null, pokeAmt: {}, flinch: null, bounce: {} };
  let lastM = {}, lastA = {}, headPt = null, alphaData = {}, replay = false;
  // 部品の見え方（0〜1）。parts の "hidden": true は最初かくれていて、セリフや選択肢の "show" で出てくる
  const VIS = {}, VIS_T = {}, VIS_F = {}, popInAt = {}; // VIS_F＝何秒かけて出る・消えるか（fadeSec）
  const autoT = {}; // autoHide のタイマー
  let choosing = false, secretN = {}, touchN = {}; // touchN＝さわった回数（on の何回目に使う）
  // 途中から変える動き：MO＝motion の上書き、BO＝骨ごとの上書き。SM・SB はなめらかに近づいている今の値、PH はゆれの進み具合
  let MO = {}, BO = {}, SM = {}, SB = {}, PH = {};
  // 動きの時計（allSpeed の分だけ速く進む）。さわったときの反応も、この時計で動く
  let AT = 0;
  addEventListener("pointermove", (e) => { if (!playing) return; A.tx = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1); A.ty = clamp((e.clientY / innerHeight) * 2 - 1, -1, 1); }, { passive: true });

  /* ---------- カメラと、部品の絵の作り直し ---------- */
  function layout() {
    cssW = root.clientWidth || innerWidth; cssH = root.clientHeight || innerHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    if (!lv.hidden) { lv.width = cv.width; lv.height = cv.height; }
    // カメラ：キャンバスの anchor の点を、画面の at（左上0〜右下1）に置く。view＝画面に入れる広さ（幅・高さ）、rotate＝傾き（度）
    const portrait = cssH > cssW * 1.15;
    const C0 = EV.camera, cfg = (portrait && C0.phone) ? { ...C0, ...C0.phone } : C0;
    const [vw, vh] = cfg.view, s = Math.min(cssW / vw, cssH / vh);
    const boxW = Math.min(cssW, cssH * vw / vh); // 横長の画面でも、まんなかの「見本の形」の中で位置を決める
    const ax = cssW / 2 + (cfg.at[0] - 0.5) * boxW, ay = cfg.at[1] * cssH;
    cam = { s, ax, ay, anchor: cfg.anchor, rot: (cfg.rotate || 0) * D2R };
    const nppu = s * dpr * (EV.camera.zoom || 1);
    if (Math.abs(nppu - ppu) > 0.01 || !Object.keys(bmp).length) { ppu = nppu; raster(); }
  }
  function raster() {
    bmp = {}; alphaData = {};
    EV.parts.forEach((p) => {
      const im = C.imgs[p.id], b = C.boxes[p.id]; if (!im || !b) return;
      const [x0, y0, x1, y1] = b, w = Math.max(1, Math.ceil((x1 - x0) * ppu)), h = Math.max(1, Math.ceil((y1 - y0) * ppu));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const [W, H] = EV.canvas;
      c.getContext("2d").drawImage(im, -x0 * ppu, -y0 * ppu, W * ppu, H * ppu);
      bmp[p.id] = { c, x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    });
  }
  addEventListener("resize", () => { if (!playing) return; clearTimeout(resizeT); resizeT = setTimeout(layout, 150); });

  /* ---------- 骨（行列） ---------- */
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const local = (pv, o) => {
    const c = Math.cos((o.r || 0) * D2R), s = Math.sin((o.r || 0) * D2R), sx = o.sx ?? 1, sy = o.sy ?? 1;
    const a = c * sx, b = s * sx, cc = -s * sy, d = c * sy;
    return [a, b, cc, d, pv[0] + (o.x || 0) - (a * pv[0] + cc * pv[1]), pv[1] + (o.y || 0) - (b * pv[0] + d * pv[1])];
  };
  const pulse = (t, d) => (t > 0 && t < d ? Math.sin(Math.PI * t / d) : 0);
  const damp = (t, f, k) => (t > 0 ? Math.exp(-k * t) * Math.sin(2 * Math.PI * f * t) : 0);

  // 骨の回る中心。"pivotOf": "部品名" と書くと、その部品の絵のまんなかを中心にする（絵を描き直しても自動で合う）
  function pivotOf(b) {
    if (b.pivotOf && C && C.boxes[b.pivotOf]) { const [x0, y0, x1, y1] = C.boxes[b.pivotOf]; return [(x0 + x1) / 2, (y0 + y1) / 2]; }
    return b.pivot || [0, 0];
  }

  /* ---------- 毎フレームの動き ---------- */
  // 頭にくっつく部品は、マウスの方を向いたときも同じだけ動かす（顔の部品がばらばらにずれないように）
  const HEAD_BONES = new Set(["head", "hair", "ahoge", "lock_l", "lock_r", "lock_back_l", "lock_back_r", "ear_l", "ear_r", "horn_l", "horn_r", "eye_l", "eye_r", "sweat"]);
  const HEAD_Z = 1;
  function pose(t, dt) {
    const R = reduced ? 0.35 : 1, km = 1 - Math.exp(-dt * 1.8); // 1.8＝変わるときのなめらかさ（大きいほど早く切りかわる）
    const target = { ...(EV.motion || {}), ...MO };
    Object.keys(target).forEach((k2) => { const v = target[k2]; if (typeof v === "number") SM[k2] = SM[k2] === undefined ? v : lerp(SM[k2], v, km); else SM[k2] = v; });
    const M = SM;
    // 骨ごとの値（bones に書いた値を、boneMotion で途中から上書きできる）
    const bv = (b, key, dflt) => { const tv = (BO[b.id] && BO[b.id][key] !== undefined) ? BO[b.id][key] : (b[key] ?? dflt); const id = b.id + "." + key; if (typeof tv !== "number") return tv; SB[id] = SB[id] === undefined ? tv : lerp(SB[id], tv, km); return SB[id]; };
    // ゆれの進み具合を足していく（速さが途中で変わっても、カクッとしないように）
    const adv = (id, sp) => (PH[id] = (PH[id] || 0) + dt * sp);
    // 表情・葉は、目標の値へなめらかに近づく
    const k = 1 - Math.exp(-dt * 5.5);
    FACE_KEYS.forEach((key) => { S[key] = lerp(S[key] ?? 0, T[key] ?? 0, k); });
    const lm = LEAF_MODE[L.mode] || LEAF_MODE.rest, kl = 1 - Math.exp(-dt * (L.mode === "loose" ? 1.6 : 4));
    L.amt = lerp(L.amt, lm.amt, kl); L.wig = lerp(L.wig, lm.wig, kl); L.off = lerp(L.off, lm.off, kl); L.alpha = lerp(L.alpha, lm.alpha * (ending ? 0 : 1), 1 - Math.exp(-dt * (L.mode === "loose" ? 0.9 : 6)));
    L.enter = Math.min(1, L.enter + dt / 0.55);
    // マウスの方を向く（しばらく動かなければ正面へ）
    const ka = 1 - Math.exp(-dt * 2.4);
    A.x = lerp(A.x, A.tx * (M.look ?? 1), ka); A.y = lerp(A.y, A.ty * (M.look ?? 1), ka);

    const br = Math.sin((2 * Math.PI * t) / (M.breathe || 3.6)); // 呼吸
    // さわったときの反応（react( で時刻が入る）
    const pat = 0.5 * pulse(t - RX.head, 0.7), hornJ = 0.4 * pulse(t - RX.horn, 0.3), hideX = 0.35 * pulse(t - RX.collar, 1.5);
    const blushX = 0.6 * RX.blush * Math.exp(-Math.max(0, t - RX.blushAt) * 0.5), tremX = 0.3 * RX.trem * Math.exp(-Math.max(0, t - RX.tremAt) * 2.2);
    const tr = clamp(S.tremble + tremX, 0, 1.6) * R; // ぷるぷる
    const hide = clamp(S.hide + hideX, 0, 1.4);
    const jit = (f, ph) => Math.sin(t * f + ph) * Math.sin(t * f * 0.37 + ph * 2);
    // 転んだ直後：すとんと落ちて、少しはずむ
    const ft = t - fallAt;
    const fall = ft < 0.9 ? -16 * Math.max(0, 1 - ft / 0.16) ** 2 + 2.4 * damp(ft - 0.16, 3.2, 6) : 0;
    const squash = ft > 0.14 && ft < 0.9 ? 0.05 * damp(ft - 0.14, 3, 7) : 0;

    // もがく（struggle）：葉から抜け出そうと、上へぐっと伸びあがっては戻る。伸びあがるたびに左右へかたむく向きが入れかわる
    // motion の struggle＝強さ（0でなし、1でふつう）、struggleSpeed＝1秒に何回伸びあがるか
    const stg = Math.max(0, M.struggle ?? 0) * R;
    const sph = adv("_struggle", M.struggleSpeed ?? 1.4);
    const sw = Math.sin(Math.PI * 2 * sph);
    const heave = stg * Math.max(0, sw) ** 1.6 * (0.8 + 0.2 * Math.sin(sph * 2.3)); // 上へ伸びるときだけ（ゆさっ）
    // 左右へのかたむき。motion の struggleSide で強さ（0でなし＝上下だけ、1で左右にもゆさゆさ）。いまは 0
    const side = stg * (M.struggleSide ?? 0) * Math.sin(Math.PI * sph);
    const P = {};
    const jumpY = RX.jump ? RX.jump.h * pulse(t - RX.jump.at, 0.32) : 0;
    // ビクッ（touch の flinch）：からだごと小さく跳ねて、耳がぴんと立ち、目をぎゅっ
    const flU = RX.flinch ? t - RX.flinch.at : -9, flA = RX.flinch ? RX.flinch.amt : 0;
    const flinch = flA * pulse(flU, 0.24);
    P.root = { y: fall * R - 3.2 * hornJ * R - jumpY * R - 2.6 * flinch * R - 4.5 * heave, sy: 1 - squash * R + 0.025 * heave, sx: 1 + squash * 0.6 * R - 0.015 * heave, r: 1.6 * side };
    // からだ：呼吸と、ゆっくりしたゆれ（震えは、からだだけを小さく）
    P.body = { sy: 1 + (M.breatheAmount ?? 0.012) * br * R, r: Math.sin(t * 0.43) * 0.3 * R + Math.sin(t * 9) * 0.25 * tr + 1 * damp(t - RX.body, 1.8, 4) * R + 1.4 * flA * damp(flU, 3, 6) * R + 1.4 * side * (0.4 + heave) };
    // 足：からだのゆれに、ゆっくりついていく（布が足にめり込まないように）。event/events.json の bones に "legs" があるときだけ
    P.legs = { r: P.body.r * (M.legsFollow ?? 0.85) + Math.sin(t * 0.37 + 0.8) * 0.3 * R, sy: 1 + (M.breatheAmount ?? 0.012) * br * 0.35 * R };
    // 頭：顔の部品はぜんぶ一緒に、ゆっくり動く（ぴくぴくさせない）
    const headR = (Math.sin(t * 0.45) * (M.sway ?? 0.8) + Math.sin(t * 0.19 + 1) * 0.3) * R + S.tilt + A.x * 0.8 * R;
    P.head = { r: headR - 1.8 * side, y: hide * 3.4 + 2.6 * pat + br * 0.3 * R + A.y * 0.4 * R - 1.2 * heave };
    // 髪は頭より少し遅れてついてくる（ばね）
    HR.v += ((headR - HR.r) * 60 - HR.v * 9) * dt; HR.r += HR.v * dt;
    const lag = (HR.r - headR) * (M.hairLag ?? 0.55);
    P.hair = { r: lag * 0.6 };
    P.ahoge = { r: (Math.sin(t * 1.2) * 4 + Math.sin(t * 0.5) * 2) * R + lag * 4 + 5 * damp(t - RX.head, 2, 3.5) + 6 * heave - 3 * side };
    P.lock_l = { r: Math.sin(t * 1.1 + 0.5) * 2.2 * R + lag * 2.4 };
    P.lock_r = { r: Math.sin(t * 1.1 + 2.1) * 2.2 * R + lag * 2.4 };
    P.lock_back_l = { r: Math.sin(t * 0.9 + 1.2) * 1.6 * R + lag * 1.8 };
    P.lock_back_r = { r: Math.sin(t * 0.9 + 2.8) * 1.6 * R + lag * 1.8 };
    // 耳：照れるとたれる。ときどき片耳がぴくっ
    // 耳：照れると、ゆっくりたれる（ひとりでにぴくっとはしない。さわったときだけ動く）
    const droop = (hide * 6 + S.squeeze * 2 + 9 * pat + Math.sin(t * 0.9) * 0.8 * R) - 10 * flA * pulse(flU, 0.5);
    P.ear_l = { r: -droop + 7 * damp(t - RX.ear_l, 2.5, 4.5) + 5 * heave };
    P.ear_r = { r: droop - 7 * damp(t - RX.ear_r, 2.5, 4.5) - 5 * heave };
    P.horn_l = { r: Math.sin(t * 0.8) * 0.4 * R }; P.horn_r = { r: -Math.sin(t * 0.8) * 0.4 * R };
    // 目：ぎゅっとつむる。ときどき、もう一段ぎゅっ
    const sq = clamp(S.squeeze + 0.25 * heave + 0.4 * flA * pulse(flU, 0.5) + 0.3 * pat + 0.25 * pulse(t - RX.horn, 0.7) + 0.2 * pulse(t - Math.max(RX.ear_l, RX.ear_r), 0.6), 0, 1.3);
    P.eye_l = { sy: 1 - 0.2 * sq, sx: 1 + 0.04 * sq }; P.eye_r = { sy: 1 - 0.2 * sq, sx: 1 + 0.04 * sq };
    // 汗：ゆっくりたれて、また出てくる
    const sc = ((t - sweatAt) / 2.6) % 1;
    P.sweat = { y: sc * 5 };
    P._sweatA = S.sweat * (sc < 0.15 ? sc / 0.15 : sc > 0.8 ? (1 - sc) / 0.2 : 1);
    // 襟：顔をうずめると、少し持ち上がる
    P.collar = { y: -1.8 * hide - br * 0.25 * R, sy: 1 + 0.03 * hide };
    P._blush = S.blush + blushX;
    P.cape_l = { r: Math.sin(t * 0.8) * 0.6 * R };
    P.cape_r = { r: -Math.sin(t * 0.8 + 0.6) * 0.6 * R };
    // 葉：ゆらゆら＋モードごとの動き（巻きつく・うねる・ほどける）
    EV.bones.filter((b) => b.leaf).forEach((b) => {
      // 葉ごとの設定（bones の葉に書く。書かなければ motion の共通の値）：sway＝ゆれの大きさ（度）、speed＝速さ、wiggle＝うねうねの強さ（倍）、tilt＝いつも傾けておく角度（度）
      const ph = b.phase || 0, sp = bv(b, "speed", M.leafSpeed ?? 0.55), inn = b.in || 4;
      const lt = adv(b.id, sp / 0.55); // ゆれの時計（ふつうの速さ 0.55 のとき、時間と同じに進む）
      const sway = Math.sin(lt * 0.55 * 2 + ph) * bv(b, "sway", M.leafSway ?? 2.2) * R + bv(b, "tilt", 0);
      const wig = (Math.sin(lt * 3.4 + ph * 1.7) * 1.6 + Math.sin(lt * 5.3 + ph) * 0.8) * L.wig * bv(b, "wiggle", 1) * R;
      const enter = 1 - L.enter; // 最初は外から、しゅるっと巻きつく
      const intro = enter > 0 ? -inn * 5 * enter * enter : 0;
      const tight = jit(23, ph) * 0.5 * (L.mode === "tight" ? 1 : 0) * R;
      const poke = (RX.pokeAmt[b.id] ?? 3.5) * damp(t - (RX.leaf[b.id] ?? -9), 1.6, 3) * (inn > 0 ? 1 : -1);
      // swayX・swayY：回転のかわりに（または一緒に）、横・縦にふわふわ動く量（キャンバスの単位）
      const mx = bv(b, "swayX", 0), my = bv(b, "swayY", 0);
      // もがくと、葉がからだに引っぱられて、ぐいっと持ち上がる（すこし遅れてついてくる）
      const tug = stg * Math.max(0, Math.sin(Math.PI * 2 * sph - 0.5)) ** 1.6;
      P[b.id] = { x: Math.sin(lt * 0.55 * 2 + ph) * mx * R, y: Math.sin(lt * 0.55 * 2 + ph + 0.6) * my * R - 2.5 * tug, r: sway + wig + inn * L.amt + intro + tight - inn * 2.2 * L.off + poke + (inn > 0 ? 1 : -1) * 2 * tug, sx: 1 + 0.02 * L.amt, sy: 1 + 0.015 * Math.sin(t * 2.1 + ph) * L.wig };
      P["_a_" + b.id] = clamp(L.alpha * (0.2 + 0.8 * L.enter), 0, 1);
    });
    // wobble：からだとは別に、その骨だけでゆれる（チョコバーなど）。r＝回る角度、x・y＝ずれ、speed＝速さ。さわってビクッとしたときは大きくはねる
    EV.bones.filter((b) => b.wobble).forEach((b) => {
      const w = { ...b.wobble, ...((BO[b.id] || {}).wobble || {}) }, ph = w.phase ?? 0.7;
      const sm = (key, d) => { const id = b.id + ".w." + key, tv = w[key] ?? d; SB[id] = SB[id] === undefined ? tv : lerp(SB[id], tv, km); return SB[id]; };
      const wt = adv(b.id + ".w", sm("speed", 1.5)), wr = sm("r", 3);
      P[b.id] = {
        r: (wr * Math.sin(wt * 2.2 + ph) + wr * 0.35 * Math.sin(wt * 3.7 + ph * 2)) * R + 7 * flA * damp(flU, 3.5, 4.5) * R,
        x: sm("x", 0.5) * Math.sin(wt * 1.6 + ph * 3) * R,
        y: sm("y", 0.4) * Math.sin(wt * 2.6 + ph) * R - 2 * flinch * R
      };
    });
    // bounce：さわったとき、その骨が横・縦・回転の向きに、ぶるんと跳ねてだんだん止まる
    Object.entries(RX.bounce).forEach(([bone, k]) => {
      const d = damp(t - k.at, k.speed ?? 2.2, k.stop ?? 4) * R; if (!d) return;
      const q2 = P[bone] || (P[bone] = {});
      q2.x = (q2.x || 0) + (k.x || 0) * d; q2.y = (q2.y || 0) + (k.y || 0) * d;
      if (!(EV.bones.find((b) => b.id === bone) || {}).leaf) q2.r = (q2.r || 0) + (k.r || 0) * d; // 葉の回転は poke で足している
    });
    return P;
  }

  function frame(now) {
    if (!playing) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000, dt = Math.min(0.05, Math.max(0.001, t - lastT)); lastT = t;
    // allSpeed：すべての動きの速さ（motion の allSpeed。1 でふつう、2 で2倍）。なめらかに変わる
    const spd = Math.max(0, SM.allSpeed ?? (EV.motion && EV.motion.allSpeed) ?? 1);
    const sdt = Math.min(0.08, dt * spd);
    AT += sdt;
    const P = pose(AT, sdt);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cv.width, cv.height);
    // カメラ：ゆっくり寄る・画面のゆれ
    const z = 1 + ((EV.camera.zoom || 1) - 1) * Math.min(1, t / 40);
    const st = t - shakeAt, sk = reduced ? 0 : shakeAmt * Math.exp(-st * 7) * (st > 0 ? 1 : 0);
    const sx = Math.sin(st * 61) * 7 * sk, sy = Math.cos(st * 47) * 5 * sk;
    drawLeaves(AT, sk);
    drawFlash(t);
    const cs = cam.s * z * dpr, co = Math.cos(cam.rot) * cs, si = Math.sin(cam.rot) * cs, [kx, ky] = cam.anchor;
    // anchor を中心に、拡大して傾けてから、画面の (ax, ay) に置く
    const base = [co, si, -si, co, (cam.ax + sx) * dpr - (co * kx - si * ky), (cam.ay + sy) * dpr - (si * kx + co * ky)];
    // 骨の行列
    const W = {};
    EV.bones.forEach((b) => { const m = local(pivotOf(b), P[b.id] || {}); W[b.id] = b.parent && W[b.parent] ? mul(W[b.parent], m) : m; });
    // 頭の位置（さわったときのひとことを、この横に出す）
    const hb = EV.bones.find((b) => b.id === "head");
    if (hb && W.head) { const m = mul(base, W.head), x = hb.pivot[0], y = hb.pivot[1] - 40; headPt = [(m[0] * x + m[2] * y + m[4]) / dpr, (m[1] * x + m[3] * y + m[5]) / dpr]; }
    for (const p of EV.parts) {
      const im = bmp[p.id]; if (!im) continue;
      let a = 1;
      if (p.alpha === "blush") a = clamp(P._blush, 0, 1);
      else if (p.alpha === "lines") a = clamp(S.lines, 0, 1) * (0.75 + 0.25 * Math.sin(AT * 6));
      else if (p.alpha === "sweat") a = clamp(P._sweatA, 0, 1);
      if (P["_a_" + p.bone] !== undefined) a *= P["_a_" + p.bone];
      if (VIS[p.id] !== undefined) {
        const vt = VIS_T[p.id] ?? 1, vd = vt - VIS[p.id];
        if (VIS_F[p.id]) VIS[p.id] += Math.sign(vd) * Math.min(Math.abs(vd), dt / VIS_F[p.id]); // fadeSec：決めた秒数で、まっすぐ消える・出る
        else VIS[p.id] += vd * Math.min(1, dt * 7);
        a *= VIS[p.id];
        // 出てくるとき：ふわっと少し大きくなってから落ち着く
      }
      if (a <= 0.004) { lastA[p.id] = 0; continue; }
      const zz = (HEAD_BONES.has(p.bone) ? HEAD_Z : (p.z || 0)) * (reduced ? 0.3 : 1);
      const par = [1, 0, 0, 1, A.x * zz * 0.9, A.y * zz * 0.5]; // 奥行き：手前の部品ほど大きく動く
      let m = mul(base, mul(par, W[p.bone] || [1, 0, 0, 1, 0, 0]));
      const popU = t - (popInAt[p.id] ?? -9);
      if (popU > 0 && popU < 0.6 && im) { const k = 1 + 0.12 * Math.sin(Math.PI * popU / 0.6) * (1 - popU / 0.6), cx = im.x + im.w / 2, cy = im.y + im.h / 2; m = mul(m, [k, 0, 0, k, cx - k * cx, cy - k * cy]); }
      g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
      g.globalAlpha = a;
      g.drawImage(im.c, im.x, im.y, im.w, im.h);
      // 頬の赤みが 1 をこえたら、もう一枚重ねて赤くする
      lastM[p.id] = m; lastA[p.id] = a;
      if (p.alpha === "blush" && P._blush > 1) { g.globalAlpha = clamp(P._blush - 1, 0, 1) * (0.85 + 0.15 * Math.sin(AT * 3)); g.drawImage(im.c, im.x, im.y, im.w, im.h); }
    }
    g.globalAlpha = 1;
  }

  /* ---------- うしろの葉っぱ（event/events.json の bg.leaves） ---------- */
  // 画面いっぱいに葉を散らして、1枚ずつ根もとを中心にゆらゆらさせる。奥の葉ほど小さく・暗く・ぼやけて、マウスの方へ少しずれる
  // 葉の絵：parts＝イベントの絵の中のレイヤー（例: ["leaf_right"]）、images＝画像ファイル（根もとは絵の下のまんなか）。どちらもなければ、ここで描いた葉
  let BL = null;
  // ここで描く葉（根もとが下、先が上）
  function makeLeaf(ratio, c1, c2, vein) {
    const h = 256, w = Math.round(h * ratio), c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), cx = w / 2, b = h * 0.92;
    x.beginPath(); x.moveTo(cx, b);
    x.bezierCurveTo(cx - w * 0.62, b * 0.74, cx - w * 0.46, b * 0.16, cx, 2);
    x.bezierCurveTo(cx + w * 0.46, b * 0.16, cx + w * 0.62, b * 0.74, cx, b);
    const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    x.fillStyle = gr; x.fill();
    x.strokeStyle = vein; x.lineCap = "round";
    x.lineWidth = w * 0.035; x.beginPath(); x.moveTo(cx, h); x.quadraticCurveTo(cx + w * 0.05, b * 0.5, cx, b * 0.06); x.stroke(); // 茎と、まんなかの筋
    x.lineWidth = w * 0.02;
    for (let i = 1; i <= 5; i++) {
      const yy = b * (0.86 - i * 0.13), sp = w * 0.36 * (1 - Math.abs(i - 2.4) / 5);
      x.beginPath(); x.moveTo(cx, yy); x.quadraticCurveTo(cx - sp * 0.5, yy - h * 0.03, cx - sp, yy - h * 0.1);
      x.moveTo(cx, yy); x.quadraticCurveTo(cx + sp * 0.5, yy - h * 0.03, cx + sp, yy - h * 0.1); x.stroke();
    }
    return { c, fx: 0.5, fy: 1 };
  }
  // 奥行きごとの絵（暗さ・ぼかしを先に焼きこんでおく）
  function depthVariant(sp, dark, blur, tint) {
    const pad = Math.ceil(blur * 2.5), c = document.createElement("canvas");
    c.width = sp.c.width + pad * 2; c.height = sp.c.height + pad * 2;
    const x = c.getContext("2d");
    if (blur) x.filter = `blur(${blur}px)`;
    x.drawImage(sp.c, pad, pad); x.filter = "none";
    if (dark > 0) { x.globalCompositeOperation = "source-atop"; x.globalAlpha = dark; x.fillStyle = tint; x.fillRect(0, 0, c.width, c.height); }
    return { c, px: pad + sp.fx * sp.c.width, py: pad + sp.fy * sp.c.height, h0: Math.max(sp.c.width, sp.c.height) }; // h0＝絵の長い方の辺（size はこの長さになる）
  }
  const imgCache = {};
  async function buildLeaves() {
    BL = null;
    const o = (EV.bg || {}).leaves;
    lv.hidden = !o || o.count === 0;
    if (lv.hidden) return;
    const base = [];
    (o.parts || []).forEach((id) => {
      const im = C && C.imgs[id], b = C && C.boxes[id]; if (!im || !b) return;
      const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0, k = 256 / Math.max(w, h), [W, H] = EV.canvas;
      const c = document.createElement("canvas"); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
      c.getContext("2d").drawImage(im, -x0 * k, -y0 * k, W * k, H * k);
      const bone = EV.bones.find((bb) => bb.id === id), pv = bone ? pivotOf(bone) : [(x0 + x1) / 2, y1];
      base.push({ c, fx: clamp((pv[0] - x0) / w, 0, 1), fy: clamp((pv[1] - y0) / h, 0, 1) });
    });
    // images：["ファイル"] か [{ "src": "ファイル", "pivot": [横, 縦] }]。pivot＝根もとの場所（絵の左上0〜右下1。書かなければ下のまんなか [0.5, 1]）
    for (const it of o.images || []) {
      // angle＝根もとから見て、葉の先がまうえから何度かたむいているか（右がプラス）。散らすときに、この分をもどして向きをそろえる
      const src = typeof it === "string" ? it : it.src, pv = (typeof it === "object" && it.pivot) || [0.5, 1], ang = (typeof it === "object" && it.angle) || 0;
      const im = await (imgCache[src] ||= loadImg(src)); if (!im) continue;
      const iw = im.naturalWidth || im.width || 256, ih = im.naturalHeight || im.height || 256; // SVG でも大きさを読む
      const k = 384 / Math.max(iw, ih), c = document.createElement("canvas");
      c.width = Math.ceil(iw * k); c.height = Math.ceil(ih * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      base.push({ c, fx: pv[0], fy: pv[1], ang });
    }
    if (!base.length) {
      const cols = o.colors || ["#2f5d3d", "#3f7d4c", "#24492f", "#52905a", "#386b3f"], vein = o.vein || "rgba(20, 40, 24, .45)";
      [0.42, 0.55, 0.68, 0.36].forEach((r, i) => base.push(makeLeaf(r, cols[i % cols.length], cols[(i + 2) % cols.length], vein)));
    }
    // fadeBase：根もとを見えなくする。根もとから、葉の長さのこの割合までを、だんだん透明にする（0でそのまま）
    const fb = o.fadeBase ?? 0.3;
    if (fb > 0) base.forEach((sp) => {
      const x = sp.c.getContext("2d"), px = sp.fx * sp.c.width, py = sp.fy * sp.c.height, r = fb * Math.max(sp.c.width, sp.c.height);
      const gr = x.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.35, "rgba(0,0,0,0.15)"); gr.addColorStop(1, "rgba(0,0,0,1)");
      x.globalCompositeOperation = "destination-in"; x.fillStyle = gr; x.fillRect(0, 0, sp.c.width, sp.c.height); x.globalCompositeOperation = "source-over";
    });
    // 奥（0）・まんなか（1）・手前（2）
    // depth: false にすると、奥行きをつけない（暗くもぼかしもしない。絵のままの色で、くっきり見せる）
    const flat = o.depth === false;
    const tint = o.tint || (EV.bg && EV.bg.bottom) || "#120c1f", blur = (o.blur === false || flat) ? [0, 0, 0] : [6, 2, 0];
    const dark = flat ? [0, 0, 0] : (o.dark || [0.6, 0.35, 0.12]);
    const sprites = base.map((sp) => ({ ang: sp.ang || 0, v: [0, 1, 2].map((d) => depthVariant(sp, dark[d], blur[d], tint)) }));
    // すきまなく散らす（ます目に区切って、その中でずらす）。根もとは画面のまんなかの方、先は外を向く
    const n = o.count ?? 70, cols = Math.ceil(Math.sqrt(n * 1.6)), rows = Math.ceil(n / cols), sz = o.size || [70, 170];
    const items = [];
    for (let i = 0; i < n; i++) {
      let x, y, dir;
      if (o.edges) {
        // edges：根もとを画面の外（ふち）に置いて、葉の先は画面の内がわへのびる（根もとはぜったいに見えない）
        const u = (i + Math.random()) / n * 4, side = Math.floor(u) % 4, f = u - Math.floor(u), m = o.edgeOut ?? 0.06; // edgeOut＝根もとを画面の外へどれだけ出すか（画面の幅・高さに対する割合）
        [x, y] = side === 0 ? [f, -m] : side === 1 ? [1 + m, f] : side === 2 ? [1 - f, 1 + m] : [-m, 1 - f];
        dir = Math.atan2(0.45 - y, 0.5 - x) / D2R + 90 + (Math.random() - 0.5) * (o.spread ?? 70); // spread＝内がわへ向ける向きのばらつき（度）
      } else {
        x = ((i % cols) + Math.random()) / cols * 1.1 - 0.05; y = (Math.floor(i / cols) + Math.random()) / rows * 1.1 - 0.05;
        dir = Math.atan2(y - 0.45, x - 0.5) / D2R + 90 + (Math.random() - 0.5) * 100;
      }
      const r = Math.random(), layer = r < 0.45 ? 0 : r < 0.8 ? 1 : 2, spr = Math.floor(Math.random() * sprites.length), flip = Math.random() < 0.5;
      // 絵の葉のかたむき（angle）をもどしてから向ける。左右反転した葉は、かたむきも反対になる
      const rot = dir - (flip ? -1 : 1) * sprites[spr].ang;
      items.push({ x, y, layer, s: lerp(sz[0], sz[1], Math.random()), rot, sp: 0.6 + Math.random() * 0.8, ph: Math.random() * 6.283, spr, flip });
    }
    items.sort((a, b) => a.layer - b.layer);
    BL = { sprites, items };
    lv.width = cv.width; lv.height = cv.height;
  }
  function drawLeaves(t, sk) {
    if (!BL || lv.hidden) return;
    const o = EV.bg.leaves, R = reduced ? 0.35 : 1, W = lv.width, H = lv.height;
    const unit = Math.min(cssW, cssH) / 700 * dpr, sway = (o.sway ?? 7) * R, sp = o.speed ?? 0.6;
    const flat = o.depth === false, LS = flat ? [0.85, 1, 1.15] : [0.6, 0.85, 1.25], PX = flat ? [8, 12, 16] : [5, 12, 24]; // 奥行きごとの大きさと、マウスの方へずれる量
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H);
    lg.globalAlpha = o.opacity ?? 1;
    for (const it of BL.items) {
      const v = BL.sprites[it.spr].v[it.layer], k = it.s * LS[it.layer] * unit / v.h0, w = t * sp * it.sp;
      const a = (it.rot + Math.sin(w + it.ph) * sway + Math.sin(w * 2.3 + it.ph * 1.7) * sway * 0.3 + Math.sin(t * 37 + it.ph) * sk * 6) * D2R;
      const x = it.x * W + A.x * PX[it.layer] * dpr + Math.sin(w * 0.7 + it.ph) * 3 * unit * R, y = it.y * H + A.y * PX[it.layer] * 0.6 * dpr;
      const c = Math.cos(a) * k, s = Math.sin(a) * k, f = it.flip ? -1 : 1;
      lg.setTransform(c * f, s * f, -s, c, x, y);
      lg.drawImage(v.c, -v.px, -v.py);
    }
    lg.globalAlpha = 1;
  }

  /* ---------- フラッシュ（白くぱちぱち光る） ---------- */
  // セリフ・選択肢・さわったときに "flash": 1 か "flash": { "count": 3, "strength": 1, "gap": 0.11, "fade": 0.14, "delay": 0, "color": "#fff" }
  // count＝何回光るか、strength＝明るさ（0〜1）、gap＝光る間隔（秒）、fade＝消える早さ（秒。小さいほどパッと消える）、delay＝光りはじめるまで（秒）、color＝光の色
  let FL = [];
  function flash(spec) {
    if (!spec) return;
    const o = typeof spec === "number" ? { strength: spec } : spec === true ? {} : spec;
    const now = (performance.now() - t0) / 1000, n = reduced ? 1 : Math.max(1, o.count ?? 3), gap = o.gap ?? 0.11;
    const amt = clamp(o.strength ?? 1, 0, 1) * (reduced ? 0.35 : 1);
    let at = now + (o.delay ?? 0);
    for (let i = 0; i < n; i++) { FL.push({ at, amt: amt * (i === 0 ? 1 : 0.55 + Math.random() * 0.45), fade: o.fade ?? 0.14 }); at += gap * (0.7 + Math.random() * 0.6); }
    flashEl.style.background = o.color || "#fff";
  }
  function drawFlash(t) {
    if (!FL.length) { if (flashEl.style.opacity !== "0") flashEl.style.opacity = "0"; return; }
    let a = 0;
    FL = FL.filter((f) => { const u = t - f.at; if (u > f.fade * 7) return false; if (u > 0) a = Math.max(a, f.amt * (u < 0.025 ? u / 0.025 : Math.exp(-(u - 0.025) / f.fade))); return true; });
    flashEl.style.opacity = clamp(a, 0, 1).toFixed(3);
  }

  /* ---------- 効果音ファイル（event/events.json の sounds） ---------- */
  // イベントの "sounds" に名前とファイルを書いておき、セリフ・選択肢・さわったときに "sound": "名前" で鳴らす。"stopSound": "名前"（true ですべて）で止める
  // sounds の書き方：{ "src": "ファイル", "volume": 0〜1, "loop": true でループ, "rate": 再生の速さ, "fadeIn": ループが大きくなるまでの秒 }
  // src は ["a.opus", "a.mp3"] のように並べると、そのブラウザで鳴らせる方を使う（iPhone などで .opus が鳴らないときの保険）
  const SND = {}, LOOPS = {};
  const sndConf = (name) => ((EV && EV.sounds) || {})[name] || ((CONF && CONF.sounds) || {})[name];
  const sndType = (s) => /\.(opus|ogg)$/i.test(s) ? 'audio/ogg; codecs="opus"' : /\.mp3$/i.test(s) ? "audio/mpeg" : /\.(m4a|aac)$/i.test(s) ? "audio/mp4" : /\.wav$/i.test(s) ? "audio/wav" : /\.webm$/i.test(s) ? "audio/webm" : "";
  function pickSrc(src) { const list = Array.isArray(src) ? src : [src], a = document.createElement("audio"); return list.find((s) => a.canPlayType(sndType(s))) || list[0]; }
  function loadSound(name) {
    const key = EID + ":" + name; if (SND[key]) return SND[key];
    const c = sndConf(name); if (!c || !c.src) { console.warn("効果音がありません（events.json の sounds）:", name); return null; }
    const au = new Audio(pickSrc(c.src)); au.preload = "auto";
    au.addEventListener("error", () => console.warn("効果音のファイルが読めません:", au.src), { once: true });
    return (SND[key] = { au, c });
  }
  function fadeTo(au, to, sec, done) {
    const from = au.volume, st = performance.now();
    if (!sec) { au.volume = clamp(to, 0, 1); done && done(); return; }
    const step = () => { const k = Math.min(1, (performance.now() - st) / (sec * 1000)); au.volume = clamp(from + (to - from) * k, 0, 1); if (k < 1) requestAnimationFrame(step); else done && done(); };
    requestAnimationFrame(step);
  }
  // "sound": "pan" ／ ["pan", "kuchu"] ／ { "name": "kuchu", "loop": true, "volume": 0.5 }（ここに書いた値が sounds より優先）
  function playSound(spec) {
    if (!spec) return;
    if (Array.isArray(spec)) { spec.forEach(playSound); return; }
    const o = typeof spec === "string" ? { name: spec } : spec, s = loadSound(o.name); if (!s) return;
    if (SFX.muted) return; // サイトで音を消しているときは鳴らさない
    const loop = o.loop ?? s.c.loop ?? false, vol = clamp((o.volume ?? s.c.volume ?? 1) * (typeof SFX.volume === "number" ? SFX.volume : 1), 0, 1);
    const au = s.au.cloneNode(); au.playbackRate = o.rate ?? s.c.rate ?? 1;
    if (loop) {
      if (LOOPS[o.name]) return; // もう鳴っているループは、重ねない
      au.loop = true; au.volume = 0; LOOPS[o.name] = au;
      au.play().then(() => fadeTo(au, vol, o.fadeIn ?? s.c.fadeIn ?? 0.3)).catch(() => {});
      return;
    }
    au.volume = vol; au.play().catch(() => {});
  }
  // "stopSound": "kuchu" ／ ["kuchu"] ／ true（ループをぜんぶ）／ { "name": "kuchu", "fade": 1.5 }（fade＝何秒かけて小さくして止めるか）
  function stopSound(spec, sec = 0.4) {
    if (spec === true || spec === "all") { Object.keys(LOOPS).forEach((n) => stopSound(n, sec)); return; }
    if (Array.isArray(spec)) { spec.forEach((n) => stopSound(n, sec)); return; }
    const name = typeof spec === "string" ? spec : spec && spec.name, au = LOOPS[name]; if (!au) return;
    delete LOOPS[name];
    fadeTo(au, 0, (spec && spec.fade != null) ? spec.fade : sec, () => au.pause());
  }
  // セリフ・選択肢・さわったときに共通：flash・stopSound・sound
  function fx(o) { if (!o) return; if (o.flash) flash(o.flash); if (o.stopSound) stopSound(o.stopSound); if (o.sound) playSound(o.sound); }

  /* ---------- さわる（イベント中のトルサ） ---------- */
  // どの部品をさわったか：手前の部品から順に、その場所に絵があるかを調べる
  function alphaAt(id, lx, ly) {
    const im = bmp[id];
    if (!(id in alphaData)) { try { alphaData[id] = im.c.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, im.c.width, im.c.height).data; } catch (e) { alphaData[id] = null; } }
    const d = alphaData[id]; if (!d) return 255; // 調べられないときは、四角い範囲でさわったことにする
    const x = Math.floor((lx - im.x) * ppu), y = Math.floor((ly - im.y) * ppu);
    if (x < 0 || y < 0 || x >= im.c.width || y >= im.c.height) return 0;
    return d[(y * im.c.width + x) * 4 + 3];
  }
  function hit(cx, cy) {
    const r = cv.getBoundingClientRect(), px = (cx - r.left) * dpr, py = (cy - r.top) * dpr;
    for (let i = EV.parts.length - 1; i >= 0; i--) {
      const p = EV.parts[i], im = bmp[p.id], m = lastM[p.id];
      if (!im || !m || (lastA[p.id] ?? 1) < 0.25) continue;
      const det = m[0] * m[3] - m[1] * m[2]; if (!det) continue;
      const dx = px - m[4], dy = py - m[5];
      const lx = (m[3] * dx - m[2] * dy) / det, ly = (-m[1] * dx + m[0] * dy) / det;
      if (lx < im.x || ly < im.y || lx > im.x + im.w || ly > im.y + im.h) continue;
      if (alphaAt(p.id, lx, ly) > 40) return p.touch ? p : null; // いちばん手前の絵がさわれない部品なら、なにもしない
    }
    return null;
  }
  let popT = 0, popAt = -9, patAt = -9;
  function pop(text) {
    const el = q(".ev-pop"); el.textContent = text;
    const w = Math.min(el.offsetWidth || 220, cssW - 24), h = el.offsetHeight || 40;
    const [hx, hy] = headPt || [cssW / 2, cssH * 0.2];
    let x = hx + 40, y = hy - h / 2;
    if (x + w > cssW - 12) x = hx - 40 - w;
    x = clamp(x, 12, cssW - w - 12); y = clamp(y, 12, cssH - h - 12);
    el.style.left = x + "px"; el.style.top = y + "px";
    el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
    clearTimeout(popT); popT = setTimeout(() => el.classList.remove("show"), 2600);
  }
  // ひとことが出るときは、ふだんトルサをなでてセリフが出るときと同じ音（heart）
  function popLine(text) { pop(text); SFX.play(EV.touchLineSfx || "heart"); }
  function react(p, quiet) {
    const t = AT, rt = (performance.now() - t0) / 1000, kind = p.touch; // t＝動きの時計（allSpeed で速くなる）、rt＝ほんとうの時間（ひとことの間隔）
    if (kind === "ear") RX[p.bone] = t;
    else if (kind === "leaf") RX.leaf[p.bone] = t;
    else RX[kind] = t;
    if (kind === "head" || kind === "collar" || kind === "ear") { RX.blush = Math.min(0.7, RX.blush * Math.exp(-(t - RX.blushAt) * 0.5) + 0.22); RX.blushAt = t; }
    if (kind === "horn" || kind === "ear") { RX.trem = 1; RX.tremAt = t; }
    // on：何回目にさわったときに、特別な反応を起こすか（secrets は部品ごと、touch は場所ごとに数える）
    const secC = (EV.secrets || {})[p.id], cnf = secC || (EV.touch || {})[kind] || {};
    let saidSpecial = false;
    if (!quiet && cnf.on) {
      const key = secC ? p.id : "touch:" + kind;
      let n = touchN[key] = (touchN[key] || 0) + 1;
      if (cnf.cycle > 0) { n = ((n - 1) % cnf.cycle) + 1; } // cycle：その回数で数えなおす（くり返し起こす）
      const sp = cnf.on[String(n)];
      if (sp) saidSpecial = special(sp, p, t, rt);
    }
    // 小ネタ：部品ごとの特別な反応（event/events.json の secrets）。lines は順番に、最後まで出たら repeat からランダムに
    const sec = (EV.secrets || {})[p.id];
    // bounce：さわった部品が跳ねる向き（x＝横、y＝縦〈マイナスで上〉、r＝回転）。secrets（部品ごと）が touch（場所ごと）より優先
    const bc = (sec && sec.bounce) || ((EV.touch || {})[kind] || {}).bounce;
    if (bc) { RX.bounce[p.bone] = { at: t, ...bc }; if (kind === "leaf") RX.pokeAmt[p.bone] = bc.r ?? 0; }
    if (sec) {
      if (sec.jump) RX.jump = { at: t, h: sec.jump };
      if (sec.leafPoke && kind === "leaf" && !bc) RX.pokeAmt[p.bone] = sec.leafPoke;
      if (sec.sfx) SFX.play(sec.sfx);
      if (!quiet) fx(sec);
      if (sec.flinch) { RX.flinch = { at: t, amt: sec.flinch }; RX.trem = Math.max(RX.trem, 0.5 * sec.flinch); RX.tremAt = t; }
      if (!quiet && !saidSpecial && rt - popAt > 1.4) {
        const n = secretN[p.id] = (secretN[p.id] || 0) + 1, ls = sec.lines || [];
        const text = n <= ls.length ? ls[n - 1] : (sec.repeat && sec.repeat.length ? sec.repeat[Math.floor(Math.random() * sec.repeat.length)] : ls[ls.length - 1]);
        if (text) { popAt = rt; popLine(text); }
      }
      return;
    }
    const conf = (EV.touch || {})[kind] || {};
    if (conf.flinch) { RX.flinch = { at: t, amt: conf.flinch }; RX.trem = Math.max(RX.trem, 0.5 * conf.flinch); RX.tremAt = t; }
    if (conf.sfx) SFX.play(conf.sfx);
    if (!quiet) fx(conf);
    if (!quiet && !saidSpecial && conf.lines && conf.lines.length && rt - popAt > 1.4) { popAt = rt; popLine(conf.lines[Math.floor(Math.random() * conf.lines.length)]); }
  }
  // 何回目かの特別な反応（on の中身）。say＝ひとこと（並べるとランダム）、face＝表情、show／hide＝部品を出す・かくす（fadeSec 秒で）、
  // shake＝画面のゆれ、jump＝跳ねる高さ、flinch＝ビクッ、bounce＝さわった部品が跳ねる、sfx＝いつもの効果音、flash・sound・stopSound、motion・boneMotion
  function special(r, p, t, rt) {
    if (r.face) setFace(r.face);
    if (r.show) setShown(r.show, true, r.fadeSec);
    if (r.hide) setShown(r.hide, false, r.fadeSec);
    if (r.shake) { shakeAt = rt; shakeAmt = r.shake; }
    if (r.jump) RX.jump = { at: t, h: r.jump };
    if (r.flinch) { RX.flinch = { at: t, amt: r.flinch }; RX.trem = Math.max(RX.trem, 0.5 * r.flinch); RX.tremAt = t; }
    if (r.bounce) RX.bounce[p.bone] = { at: t, ...r.bounce };
    if (r.blush) { RX.blush = Math.min(1.2, RX.blush + r.blush); RX.blushAt = t; }
    if (r.sfx) SFX.play(r.sfx);
    applyMotion(r); fx(r);
    if (r.say) { const ls = Array.isArray(r.say) ? r.say : [r.say]; popAt = rt; popLine(ls[Math.floor(Math.random() * ls.length)]); return true; }
    return false;
  }
  let pressed = null, suppressClick = false, hoverRaf = 0;
  root.addEventListener("pointerdown", (e) => {
    suppressClick = false;
    if (!playing || ending || e.target.closest(".ev-box, .ev-tools")) return;
    const p = hit(e.clientX, e.clientY);
    if (!p) return;
    suppressClick = true; pressed = p; patAt = performance.now();
    react(p);
  });
  root.addEventListener("pointermove", (e) => {
    if (!playing) return;
    if (pressed && pressed.touch === "head") {
      // 頭の上でこすると、なでなで
      const now = performance.now(); if (now - patAt < 380) return;
      const p = hit(e.clientX, e.clientY); if (p && p.touch === "head") { patAt = now; react(p, true); }
      return;
    }
    if (e.pointerType !== "mouse" || hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => { hoverRaf = 0; root.classList.toggle("touching", !e.target.closest(".ev-box") && !!hit(e.clientX, e.clientY)); });
  });
  addEventListener("pointerup", () => { pressed = null; });
  addEventListener("pointercancel", () => { pressed = null; });

  // セリフや選択肢に "motion": { "leafSpeed": 1.2 } と書くと、そこから共通の動きが変わる。
  // "boneMotion": { "leaf_back": { "speed": 1.2, "sway": 4 } } と書くと、その骨だけ変わる（チョコバーは { "bou": { "wobble": { "speed": 3 } } }）
  function applyMotion(o) {
    if (!o) return;
    if (o.motion) Object.assign(MO, o.motion);
    if (o.boneMotion) Object.entries(o.boneMotion).forEach(([id, v]) => { BO[id] = { ...(BO[id] || {}), ...v, wobble: { ...((BO[id] || {}).wobble || {}), ...(v.wobble || {}) } }; });
  }
  // show／hide：部品を出す・かくす。fadeSec＝何秒かけて出る・消えるか（書かなければ、0.3秒くらいでふわっと）
  function setShown(ids, on, fadeSec) {
    const t = (performance.now() - t0) / 1000;
    (typeof ids === "string" ? [ids] : ids || []).forEach((id) => {
      if (VIS[id] === undefined) VIS[id] = on ? 0 : 1; VIS_T[id] = on ? 1 : 0;
      if (fadeSec > 0) VIS_F[id] = fadeSec; else delete VIS_F[id];
      if (on && !(fadeSec > 1)) popInAt[id] = t;
      // autoHide：parts に "autoHide": 3 と書いた部品は、出てから3秒で、ひとりでに消える（autoHideFade 秒かけて。書かなければ1秒）
      clearTimeout(autoT[id]); delete autoT[id];
      const pc = EV.parts.find((pp) => pp.id === id);
      if (on && pc && pc.autoHide > 0) autoT[id] = setTimeout(() => { delete autoT[id]; if (playing) setShown([id], false, pc.autoHideFade ?? 1); }, pc.autoHide * 1000);
    });
  }

  /* ---------- 会話 ---------- */
  function setFace(name) {
    const f = (EV.faces || {})[name] || {};
    FACE_KEYS.forEach((key) => { T[key] = f[key] ?? 0; });
  }
  function showLine(i) {
    const l = lines[i]; li = i;
    const speaker = l.speaker ?? (ctx.DATA && ctx.DATA.torsa && ctx.DATA.torsa.name) ?? "トルサ";
    q(".ev-name").textContent = speaker;
    q(".ev-box").classList.toggle("narr", !speaker);
    if (l.face) setFace(l.face);
    if (l.leaves) L.mode = l.leaves;
    if (l.shake) { shakeAt = (performance.now() - t0) / 1000; shakeAmt = l.shake; }
    if (l.sfx) SFX.play(l.sfx);
    fx(l);
    applyMotion(l);
    if (l.show) setShown(l.show, true, l.fadeSec);
    if (l.hide) setShown(l.hide, false, l.fadeSec);
    q(".ev-choices").hidden = true; q(".ev-choices").innerHTML = ""; choosing = false;
    const el = q(".ev-text"), chars = Array.from(l.text);
    el.setAttribute("aria-label", l.text);
    el.innerHTML = chars.map((c) => `<span class="ch" aria-hidden="true">${esc(c)}</span>`).join("");
    q(".ev-next").hidden = true; fullDone = false; clearInterval(typing);
    const spans = el.querySelectorAll(".ch");
    const done = () => { clearInterval(typing); typing = 0; fullDone = true; if (l.choices && l.choices.length) showChoices(l.choices); else q(".ev-next").hidden = false; };
    if (reduced) { spans.forEach((s) => s.classList.add("on")); done(); return; }
    let n = 0;
    typing = setInterval(() => {
      if (spans[n]) { spans[n].classList.add("on"); if (speaker && n % 2 === 0 && /[^\s…。、・（）「」！？]/.test(spans[n].textContent)) SFX.blip && SFX.blip(11); }
      n++; if (n >= spans.length) done();
    }, TYPE_MS);
  }
  // 選択肢：えらぶまで会話は進まない。えらぶと、その選択肢の lines が次に入る
  function showChoices(list) {
    choosing = true; q(".ev-next").hidden = true;
    const box = q(".ev-choices");
    // <button> にすると、サイト全体の「ボタンを押した音」も一緒に鳴るので、ボタンの役のふつうの要素にする
    box.innerHTML = list.map((c, i) => `<span class="ev-choice" role="button" tabindex="0" data-i="${i}">${esc(c.label)}</span>`).join("");
    box.hidden = false;
    const first = box.querySelector(".ev-choice"); if (first) first.focus({ preventScroll: true });
    box.onclick = (e) => { const b = e.target.closest(".ev-choice"); if (!b) return; e.stopPropagation(); choose(list[+b.dataset.i]); };
  }
  function choose(c) {
    if (!choosing) return;
    choosing = false; q(".ev-choices").hidden = true;
    SFX.play(c.sfxPick || "pat"); // 選んだときも、なでたときと同じ音
    // 画面が少しゆれてから、部品が出る
    const t = (performance.now() - t0) / 1000;
    if (c.shake) { shakeAt = t; shakeAmt = c.shake; }
    const wait = c.shake && !reduced ? (c.wait ?? 0.45) * 1000 : 0;
    setTimeout(() => {
      if (!playing || ending) return;
      if (c.show) setShown(c.show, true, c.fadeSec);
      if (c.hide) setShown(c.hide, false, c.fadeSec);
      applyMotion(c);
      if (c.sfx) SFX.play(c.sfx);
      fx(c);
      lines.splice(li + 1, 0, ...(c.lines || []));
      if (li + 1 < lines.length) showLine(li + 1); else end();
    }, wait);
  }
  function advance() {
    if (!playing || ending || li < 0 || choosing) return;
    const l = lines[li];
    if (!fullDone) { clearInterval(typing); typing = 0; q(".ev-text").querySelectorAll(".ch").forEach((s) => s.classList.add("on")); fullDone = true; if (l.choices && l.choices.length) showChoices(l.choices); else q(".ev-next").hidden = false; return; }
    if (li + 1 < lines.length) showLine(li + 1); else end();
  }

  /* ---------- 始める・終わる ---------- */
  async function play(id, opts) {
    if (playing) return false;
    replay = !!(opts && opts.replay);
    // 見たことは、始まったときに覚えておく（途中で再読み込みしても、思い出に残る。来館記録をリセットすると、また起こる）
    if (!replay) { const mem = ctx.mem; if (mem) { (mem.events ||= {})[id] = (mem.events[id] || 0) + 1; ctx.save && ctx.save(); } }
    await confReady; if (!CONF || !CONF.events[id]) { console.warn("イベントがありません:", id); return false; }
    EV = CONF.events[id]; EID = id; playing = true; ending = false;
    addRoot();
    document.body.classList.add("in-event");
    root.hidden = false; root.classList.remove("on", "out", "ui-off", "talking");
    setupBg();
    C = await prefetch(id);
    await buildLeaves();
    Object.keys(EV.sounds || {}).forEach(loadSound); // 効果音を先に読んでおく
    FL = []; flashEl.style.opacity = "0";
    bmp = {}; ppu = 0;
    lines = (EV.lines || []).slice(); li = -1; choosing = false;
    MO = {}; BO = {}; SM = {}; SB = {}; PH = {};
    Object.keys(VIS).forEach((k) => { delete VIS[k]; delete VIS_T[k]; delete VIS_F[k]; delete popInAt[k]; }); Object.keys(autoT).forEach((k) => { clearTimeout(autoT[k]); delete autoT[k]; }); secretN = {}; touchN = {};
    EV.parts.forEach((p) => { if (p.hidden) { VIS[p.id] = 0; VIS_T[p.id] = 0; } });
    q(".ev-choices").hidden = true;
    q(".ev-text").innerHTML = ""; q(".ev-name").textContent = ""; q(".ev-next").hidden = true;
    FACE_KEYS.forEach((key) => { S[key] = T[key] = 0; });
    if (lines[0] && lines[0].face) { setFace(lines[0].face); FACE_KEYS.forEach((key) => { S[key] = T[key]; }); }
    Object.assign(L, { mode: "rest", amt: -0.6, wig: 0, off: 0, alpha: 1, enter: 0 });
    Object.assign(A, { x: 0, y: 0, tx: 0, ty: 0 }); HR.r = HR.v = 0;
    Object.assign(RX, { head: -9, ear_l: -9, ear_r: -9, horn: -9, collar: -9, body: -9, leaf: {}, blush: 0, blushAt: -9, trem: 0, tremAt: -9, jump: null, pokeAmt: {}, flinch: null, bounce: {} }); lastM = {}; lastA = {};
    q(".ev-pop").classList.remove("show");
    layout();
    t0 = performance.now(); lastT = 0; AT = 0; fallAt = 0.05; sweatAt = 0; squeezeAt = 2; squeezeFrom = -9; flickAt = 5; flickFrom = -9;
    const intro = EV.intro || {};
    shakeAt = 0.14; shakeAmt = intro.shake ?? 1;
    if (!raf) raf = requestAnimationFrame(frame);
    requestAnimationFrame(() => root.classList.add("on"));
    if (intro.sfx) setTimeout(() => SFX.play(intro.sfx), 120);
    if (intro.flash || intro.sound || intro.stopSound) setTimeout(() => fx(intro), 120);
    root.tabIndex = -1; root.focus({ preventScroll: true });
    setTimeout(() => { if (!playing) return; root.classList.add("talking"); layout(); if (lines.length) showLine(0); else end(); }, reduced ? 300 : 1150);
    return true;
  }
  function end() {
    if (!playing || ending) return;
    ending = true; L.mode = "loose"; clearInterval(typing); typing = 0;
    stopSound(true, 0.9); // ループしている効果音は、暗くなるのに合わせて小さくして止める
    root.classList.remove("talking", "ui-off");
    setTimeout(() => root.classList.add("out"), 650);
    setTimeout(() => {
      playing = false; root.hidden = true; root.classList.remove("on", "out");
      document.body.classList.remove("in-event");
      if (EV.after && ctx.say && !replay) setTimeout(() => ctx.say(EV.after, 5200), 500);
      if (ctx.onEnd) ctx.onEnd(EID);
      dispatchEvent(new CustomEvent("torsa:event-end", { detail: { id: EID } }));
    }, 1350);
  }
  function setupBg() {
    const bg = EV.bg || {}, el = q(".ev-bg");
    el.style.setProperty("--ev-top", bg.top || "#2a1c46"); el.style.setProperty("--ev-bottom", bg.bottom || "#120c1f"); el.style.setProperty("--ev-glow", bg.glow || "#5b3a7a");
    el.classList.toggle("has-img", !!bg.image); el.style.backgroundImage = bg.image ? `url("${bg.image}")` : "";
    el.querySelectorAll(".ev-smoke").forEach((s) => (s.hidden = bg.smoke === false));
    // 会話の箱：events.json のいちばん外の "box"（すべてのイベントで共通）に、イベントの中の "box"（そのイベントだけ）を上から重ねる
    const bx = { ...((CONF && CONF.box) || {}), ...(EV.box || {}) };
    const px = (v) => (typeof v === "number" ? v + "px" : v);
    const BOX_VARS = {
      color: "--ev-box", ink: "--ev-ink", line: "--ev-line", ring: "--ev-ring", ring2: "--ev-ring2", shadow: "--ev-shadow",
      nameBg: "--ev-name-bg", nameInk: "--ev-name-ink", choice: "--ev-choice", choiceHover: "--ev-choice-hover", next: "--ev-next",
      font: "--ev-font", narrFont: "--ev-narr-font", fontSize: "--ev-fs", fontSizePhone: "--ev-fs-sp", lineHeight: "--ev-lh",
      radius: "--ev-radius", padding: "--ev-pad", paddingPhone: "--ev-pad-sp", minHeight: "--ev-minh", minHeightPhone: "--ev-minh-sp",
      maxWidth: "--ev-maxw", lift: "--ev-lift"
    };
    Object.entries(BOX_VARS).forEach(([k, v]) => { if (bx[k] !== undefined && bx[k] !== "") root.style.setProperty(v, k === "lineHeight" ? String(bx[k]) : px(bx[k])); else root.style.removeProperty(v); });
    const motes = q(".ev-motes"); motes.innerHTML = "";
    for (let i = 0; i < (bg.motes ?? 24); i++) {
      const m = document.createElement("i");
      m.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;top:${(40 + Math.random() * 70).toFixed(1)}%;--d:${(9 + Math.random() * 10).toFixed(1)}s;--dl:${(-Math.random() * 18).toFixed(1)}s;--dx:${((Math.random() - 0.5) * 16).toFixed(1)}vw;transform:scale(${(0.4 + Math.random() * 0.9).toFixed(2)})`;
      motes.appendChild(m);
    }
  }

  /* ---------- 操作 ---------- */
  root.addEventListener("click", (e) => {
    if (e.target.closest(".ev-tools")) return;
    if (suppressClick) { suppressClick = false; return; } // トルサにさわったときは、会話を進めない
    if (root.classList.contains("ui-off")) { root.classList.remove("ui-off"); return; }
    if (e.target.closest(".ev-choices")) return;
    advance();
  });
  q(".ev-hide").addEventListener("click", () => root.classList.add("ui-off"));
  q(".ev-skip").addEventListener("click", () => end());
  addEventListener("keydown", (e) => {
    if (!playing) return;
    if (choosing && /^[1-9]$/.test(e.key)) { const b = q(`.ev-choices .ev-choice[data-i="${+e.key - 1}"]`); if (b) { e.preventDefault(); b.click(); } e.stopPropagation(); return; }
    if (e.key === "Enter" || e.key === " ") { if (e.target.closest && e.target.closest(".ev-tools button")) return;
      if (e.target.closest && e.target.closest(".ev-choice")) { e.preventDefault(); e.target.closest(".ev-choice").click(); e.stopPropagation(); return; } e.preventDefault(); if (root.classList.contains("ui-off")) root.classList.remove("ui-off"); else advance(); }
    else if (e.key === "h" || e.key === "H") root.classList.toggle("ui-off");
    e.stopPropagation();
  }, true);

  /* ---------- いつ起こるか（event/events.json の trigger） ---------- */
  let waitT = 0;
  function onHall(hallId) {
    clearTimeout(waitT);
    confReady.then(() => {
      if (!CONF) return;
      Object.entries(CONF.events).forEach(([id, ev]) => {
        const tr = ev.trigger || {}; if (tr.hall !== hallId) return;
        if (tr.once !== false && ctx.mem && ctx.mem.events && ctx.mem.events[id]) return;
        prefetch(id); // 先に絵を読んでおく
        const tryPlay = () => {
          if (playing || (ctx.hall && ctx.hall() !== hallId)) return;
          if ((ctx.affinity ? ctx.affinity() : 0) < (tr.minAffinity || 0)) return;
          if (ctx.busy && ctx.busy()) { waitT = setTimeout(tryPlay, 2500); return; }
          play(id);
        };
        waitT = setTimeout(tryPlay, (tr.delaySec ?? 8) * 1000);
      });
    });
  }

  // URL に ?event=名前 があれば、入館してすぐに始める
  const want = new URLSearchParams(location.search).get("event");
  if (want && !ctx.standalone) {
    const iv = setInterval(() => {
      if (document.body && !document.body.classList.contains("at-door") && (!ctx.ready || ctx.ready())) { clearInterval(iv); setTimeout(() => play(want), 900); }
    }, 400);
  }
  window.__event = (id) => play(id || (CONF && Object.keys(CONF.events)[0]));

  // 思い出（パレット）用：イベントの一覧
  const list = () => (CONF ? Object.entries(CONF.events).map(([id, e]) => ({ id, name: e.name || id, hall: (e.trigger || {}).hall || "" })) : []);
  return { play, prefetch, onHall, list, get playing() { return playing; }, ready: confReady };
};