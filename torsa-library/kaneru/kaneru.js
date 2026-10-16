/* =========================================================
   トルサ図書館：カネル（好感度100のイベントと、赤い月の間）
   ---------------------------------------------------------
   index.html から読み込まれます。セリフと設定は kaneru/kaneru.json、
   カネルの絵（部品ごと）は kaneru/rig.json、窓の外の城は kaneru/castle.svg。

   いじりやすい場所（このファイルの中を検索してください）
   ・pose(        … カネルのふだんの動き（呼吸・翼・マント・髪・まばたき）
   ・pressure(    … さわろうとしたときの「圧」の演出
   ・redmoonHTML  … 赤い月の間の絵（舞台は 1600×1000）。窓の外の景色は outsideScene
   ・candleImg    … 赤いろうそく（図書館のろうそくを赤く色がえした kaneru/candle_red.svg）
   ・hallCorridorHTML … 西の書館の奥につづく廊下の絵（館内にそのまま置く。長さは CORR.len）
   ・FX_STEP      … イベントの演出（kaneru.json の fx の名前）

   カネルはテレパシーでしか話しません。カネルのセリフはぜんぶ《 》で、
   声の音（ぽぽぽ）は鳴らさず、心に響くような低い音だけを鳴らします。
   ========================================================= */
window.KaneruModule = (ctx) => {
  "use strict";
  const { $, reduced, SFX } = ctx;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const f1 = (n) => Math.round(n * 10) / 10;
  const cls = () => document.body.classList;
  const still = () => reduced || cls().contains("fx-off");
  const lite = () => cls().contains("lite") || cls().contains("fx-off");

  let CFG = null;
  const ready = fetch("kaneru/kaneru.json").then((r) => (r.ok ? r.json() : null)).then((c) => { CFG = c; return c; }).catch((e) => { console.warn("kaneru.json を読めませんでした", e); return null; });
  let rigP = null;
  const loadRig = () => (rigP ||= fetch("kaneru/rig.json").then((r) => { if (!r.ok) throw new Error("rig"); return r.json(); }));

  /* ---------- 来館記録（mem.kaneru） ---------- */
  const K = () => (ctx.mem.kaneru ||= { seen: false, touch: 0 });
  const unlocked = () => !!(ctx.mem.kaneru && ctx.mem.kaneru.seen);
  const NAME = () => (unlocked() || EV.named ? (CFG && CFG.name) || "カネル" : (CFG && CFG.unknownName) || "？？？");
  const tele = (t) => { const m = (CFG && CFG.telepathyMark) || ["《", "》"]; return m[0] + t + m[1]; };

  /* ---------- 見た目（CSS はここで足す） ---------- */
  const css = document.createElement("style");
  css.textContent = `
#knTop { pointer-events: none; } #knTop .kn-door { pointer-events: auto; }
.kn-corr { position: absolute; top: 0; height: 100%; background: #070305; container-type: inline-size; overflow: hidden; }
.kn-corr > * { position: absolute; }
.kn-far { position: absolute; inset: 0; pointer-events: none; }
.kn-corr { contain: layout paint; }
.kn-far svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.kn-wall { position: absolute; inset: 0; pointer-events: none; }
.kn-wall > * { position: absolute; }
.kn-glow.kn-still { animation: none; }
.kn-dusk { position: absolute; top: 0; height: 100%; pointer-events: none; }
.kn-fig { position: absolute; pointer-events: none; }
/* 話しかけてくるとき：トルサの反対側（画面の左）へ出てくる。.kn-body ごと動かす */
.kn-body { position: absolute; inset: 0; }
.kn-body.kn-away { position: fixed; z-index: 11; inset: auto; transition: left .9s cubic-bezier(.3,.7,.2,1), top .9s cubic-bezier(.3,.7,.2,1), width .9s cubic-bezier(.3,.7,.2,1), height .9s cubic-bezier(.3,.7,.2,1); }
.kn-body.kn-away .kn-shadow { opacity: 0; }
.kn-body .kn-shadow { transition: opacity .6s; }
.kn-body canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.kn-body .kn-aura { display: none; position: absolute; left: calc(var(--kn-body, 40%) - 68%); width: 136%; top: 4%; bottom: 0; background: radial-gradient(closest-side, rgba(200, 20, 40, .34), rgba(120, 0, 30, .14) 55%, transparent); animation: knAura 5.2s ease-in-out infinite; }
.kn-body .kn-shadow { position: absolute; left: calc(var(--kn-body, 40%) - 17%); width: 34%; bottom: 0.4%; height: 5%; border-radius: 50%; background: radial-gradient(closest-side, rgba(0, 0, 0, .75), transparent); }
.kn-fig.kn-hidden { opacity: 0; }
.kn-fig.kn-ev-fig { z-index: 61; }
.kn-call { position: absolute; pointer-events: auto; left: calc(var(--kn-body, 40%) - 18%); width: 36%; top: 4%; bottom: 2%; border: 0; padding: 0; background: transparent; cursor: pointer; }
.kn-call span { position: absolute; left: 50%; top: -6%; transform: translate(-50%, -100%); white-space: nowrap; font: 700 12px/1 var(--font-ui, sans-serif); letter-spacing: .16em; color: #ffd6dc; background: linear-gradient(180deg, rgba(50, 6, 14, .94), rgba(18, 2, 6, .94)); border: 1px solid rgba(220, 50, 70, .7); border-radius: 999px; padding: 6px 14px; box-shadow: 0 0 12px rgba(200, 20, 50, .4); animation: knCallPulse 2s ease-in-out infinite; }
.kn-call:focus-visible span { outline: 2px solid #ff8a9a; outline-offset: 2px; }
@keyframes knCallPulse { 50% { opacity: .65; } }

.kn-fig.kn-in, .kn-body.kn-in { animation: knIn 2.2s ease-out both; }
.kn-fig.kn-out, .kn-body.kn-out { animation: knOut 2.4s ease-in both; }
.kn-body.kn-hidden { opacity: 0; }
/* 赤い月の間では窓を背にしているので、少し逆光（話すために出てくるときは、ふつうの明るさ） */
.kn-fig.kn-backlit .kn-body:not(.kn-away) canvas { filter: brightness(.42) saturate(.8); }
.kn-fig.kn-backlit .kn-body.kn-lit canvas { filter: none; }
.kn-body.kn-turned canvas { filter: brightness(.55) saturate(.8); opacity: .82; }
.kn-body canvas { transition: filter 2.6s ease-in-out, opacity 1.2s, transform .55s ease-in-out; }
/* 話しているあいだは、トルサのほう（右）を向く */
.kn-body.kn-away.kn-faceR canvas { transform: scaleX(-1); }
.kn-hit { position: absolute; pointer-events: auto; cursor: not-allowed; border: 0; padding: 0; background: transparent; border-radius: 40% 40% 18% 18%; }
.kn-hit:focus-visible, .kn-talk:focus-visible { outline: 2px dashed #ff8a9a; outline-offset: 3px; }
.kn-talk { position: absolute; border: 0; padding: 0; background: transparent; cursor: pointer; border-radius: 45%; }
.kn-talk:hover { background: radial-gradient(closest-side, rgba(255, 60, 90, .07), transparent); }
body.kn-patok .kn-head { cursor: pointer; }
@keyframes knAura { 50% { opacity: .62; transform: scale(1.04); } }
/* 現れる・消える：大きな「ぼかし」は毎フレームとても重いので使わず、光って薄れる形に（見た目はほぼ同じ） */
@keyframes knIn { 0% { opacity: 0; filter: brightness(2.2) saturate(0); transform: translateY(2%) scale(.96); } 45% { opacity: .85; filter: brightness(1.5) saturate(.6); } 100% { opacity: 1; filter: none; transform: none; } }
@keyframes knOut { 0% { opacity: 1; filter: none; } 100% { opacity: 0; filter: brightness(1.8) saturate(.2); transform: translateY(-3%) scale(1.04); } }

/* 館が赤く染まる */
/* 館を赤く染める層：重い「かけ算」の重ね方は使わず、ふつうに半透明の赤を1枚だけ重ねる（軽い） */
.kn-red { position: absolute; inset: 0; z-index: 60; pointer-events: none; opacity: 0; will-change: opacity; contain: strict; transition: opacity 3.2s ease; background: radial-gradient(ellipse 60% 70% at 50% 42%, rgba(200, 14, 40, .38), rgba(110, 0, 22, .6) 60%, rgba(30, 0, 8, .85)); }
.kn-red2 { display: none; }
.kn-red.on, .kn-red2.on { opacity: 1; }
/* 館が赤いあいだは、本棚の本の光（スクリーンの重ね方で、館の層ぜんたいと毎フレーム混ぜていて重い）を、ふつうの重ね方にする。赤い霧の下なので見た目はほぼ同じ */
body.kn-redhall .live .shine { mix-blend-mode: normal; opacity: .45; }
/* 月の窓を赤く：かけ算で色をのせるので、ステンドグラスの模様と月はそのまま見える */
.kn-winred { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 3s ease; background: radial-gradient(closest-side, rgba(255, 50, 60, .55), rgba(180, 0, 30, .55) 60%, rgba(110, 0, 20, .45)); border-radius: 50% 50% 0 0 / 30% 30% 0 0; }
.kn-winred::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(closest-side, rgba(255, 50, 70, .3), rgba(200, 0, 30, .18) 80%); }
.kn-winred.on { opacity: 1; }

.kn-shake { animation: knShake .9s ease-out; }
@keyframes knShake { 10% { transform: translate(-6px, 3px); } 22% { transform: translate(5px, -4px); } 36% { transform: translate(-4px, 2px); } 52% { transform: translate(3px, -1px); } 70% { transform: translate(-1px, 1px); } 100% { transform: none; } }

/* 会話の箱（イベント）：event/events.js の「会話の箱」と同じ形と同じ設定（--ev-* の変数）。
   設定は event/events.json の "box"（全イベント共通）に、kaneru.json の "box"、カネルのセリフでは "boxKaneru" を重ねる */
.kn-ev { position: fixed; inset: 0; z-index: 25; cursor: pointer; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
.kn-ev:focus { outline: none; }
.kn-ui { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 max(16px, calc((100vw - var(--ev-maxw, 980px)) / 2)) calc(max(18px, env(safe-area-inset-bottom)) + var(--ev-lift, 0px)); transition: opacity .35s ease, transform .35s ease; }
.kn-ev.ui-off .kn-ui { opacity: 0; transform: translateY(14px); pointer-events: none; }
.kn-box { position: relative; min-height: var(--ev-minh, 5.4em); padding: var(--ev-pad, 26px 30px 24px); border-radius: var(--ev-radius, 16px); background: var(--ev-box, #f7f2e5); color: var(--ev-ink, #2b2a3a);
  box-shadow: var(--ev-shadow, 0 0 0 1.5px var(--ev-line, #c9a35a), 0 0 0 5px var(--ev-ring, rgba(247, 242, 229, .92)), 0 0 0 6.5px var(--ev-ring2, rgba(201, 163, 90, .7)), 0 16px 40px rgba(0, 0, 0, .5));
  opacity: 0; transform: translateY(10px); transition: opacity .35s ease, transform .35s ease, background .5s ease, color .5s ease, box-shadow .5s ease; }
.kn-ev.talking .kn-box { opacity: 1; transform: none; }
.kn-name { position: absolute; left: 22px; top: -15px; padding: 2px 16px 3px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: .2em; font-family: var(--font-ui, sans-serif);
  background: var(--ev-name-bg, linear-gradient(90deg, #3d2652, #5a3570)); color: var(--ev-name-ink, #f3d08a); box-shadow: 0 0 0 1.5px var(--ev-line, #c9a35a); }
.kn-name:empty { display: none; }
.kn-name small { font-size: .8em; font-weight: 500; letter-spacing: .08em; margin-left: .6em; opacity: .8; }
.kn-tools { position: absolute; right: 16px; top: -15px; display: flex; gap: 8px; }
.kn-tools button { border: 0; padding: 3px 13px 4px; border-radius: 999px; font: 700 12px/1.6 var(--font-ui, sans-serif); letter-spacing: .06em; cursor: pointer; background: rgba(36, 22, 50, .88); color: #f2ecdc; box-shadow: 0 0 0 1.2px rgba(214, 176, 98, .75); }
.kn-tools button:hover { background: rgba(70, 42, 92, .95); }
.kn-tools button:focus-visible { outline: 2px solid #f3d08a; outline-offset: 2px; }
.kn-text { margin: 0; color: var(--ev-ink, #2b2a3a); font-weight: 500; font-size: var(--ev-fs, 18px); line-height: var(--ev-lh, 1.8); font-family: var(--ev-font, var(--font-ui, "Zen Maru Gothic", sans-serif)); min-height: 3.6em; }
.kn-text .ch { opacity: 0; } .kn-text .ch.on { opacity: 1; }
.kn-box.narr .kn-text { opacity: .7; text-align: center; font-family: var(--ev-narr-font, var(--font-read, serif)); letter-spacing: .08em; }
.kn-box.notice .kn-text { text-align: center; }
/* カネル（心に響く声）：文字がにじむように浮かびあがる */
.kn-box.tele .kn-text { text-align: center; letter-spacing: .16em; text-shadow: 0 0 10px var(--kn-glow, rgba(255, 40, 70, .75)); }
/* 軽くするため、1文字ずつの「ぼかし（filter）」はやめて、光のにじみ（text-shadow）が引いていく形にした */
.kn-box.tele .kn-text .ch { color: transparent; text-shadow: 0 0 14px var(--kn-glow, rgba(255, 40, 70, .9)); transition: opacity .8s ease, color .8s ease, text-shadow .8s ease; }
.kn-box.tele .kn-text .ch.on { color: inherit; text-shadow: 0 0 10px var(--kn-glow, rgba(255, 40, 70, .75)); }
.kn-next { position: absolute; right: 22px; bottom: 12px; font-size: 12px; color: var(--ev-next, #a08a5a); animation: knBlink 1.2s steps(2) infinite; }
.kn-next[hidden] { display: none; }
@keyframes knBlink { 50% { opacity: .2; } }
.kn-hint { position: absolute; left: 0; right: 0; bottom: max(18px, env(safe-area-inset-bottom)); margin: 0; text-align: center; font-size: 12px; letter-spacing: .12em; color: rgba(242, 236, 220, .6); opacity: 0; transition: opacity .35s; pointer-events: none; }
.kn-ev.ui-off .kn-hint { opacity: 1; }
/* スマホ（せまい画面）：キャラクターは画面の下にいるので、会話の箱は画面の上に出す（吹き出しを消しても、絵はそのまま） */
@media (max-width: 720px) {
  .kn-ui { top: calc(80px + env(safe-area-inset-top, 0px)); bottom: auto; padding-bottom: 0; }
  .kn-ev.ui-off .kn-ui { transform: translateY(-14px); }
  .kn-box { transform: translateY(-10px); }
  .kn-hint { bottom: auto; top: calc(86px + env(safe-area-inset-top, 0px)); }
}
@media (max-width: 640px) {
  .kn-box { padding: var(--ev-pad-sp, 24px 18px 22px); min-height: var(--ev-minh-sp, 6.4em); }
  .kn-text { font-size: var(--ev-fs-sp, 16px); }
  .kn-name { left: 14px; } .kn-tools { right: 10px; gap: 6px; } .kn-tools button { padding: 3px 10px 4px; font-size: 11px; }
}

/* 心に響く声（さわろうとしたとき・ときどき） */
/* カネルの吹き出し（部屋の中で話すとき）：黒い赤。トルサの吹き出しと同じように、カネルの横に出る */
.kn-tele { position: fixed; z-index: 24; margin: 0; max-width: min(19em, 42vw); padding: 12px 20px 13px; border-radius: 14px; pointer-events: none; font-family: "Kaisei Decol", "Shippori Mincho", serif; font-size: clamp(15px, 1.7vw, 19px); line-height: 1.7; letter-spacing: .14em; color: #ffdfe3; text-shadow: 0 0 8px rgba(230, 30, 60, .75); background: linear-gradient(180deg, #1a0308, #080103); box-shadow: 0 0 0 1.5px #7a0e1e, 0 0 0 4px rgba(14, 2, 5, .95), 0 0 0 5.5px rgba(150, 18, 38, .65), 0 0 24px rgba(160, 10, 40, .45), 0 12px 30px rgba(0, 0, 0, .55); opacity: 0; transform: translateY(6px); transition: opacity .45s ease, transform .45s ease; }
.kn-tele.show { opacity: 1; transform: none; }
.kn-tele .kn-tname { display: inline-block; margin-bottom: 3px; padding: 0 .8em; border-radius: 999px; font-size: 10.5px; letter-spacing: .16em; color: #ffc9d0; text-shadow: none; background: linear-gradient(90deg, #2a0309, #6a0c1a); box-shadow: 0 0 0 1px #7a0e1e; font-family: var(--font-ui, sans-serif); font-weight: 700; }
.kn-tele .kn-tname small { font-weight: 500; opacity: .75; margin-left: .5em; letter-spacing: .06em; }
.kn-tele .kn-tbody { display: block; }
.kn-tele .kn-thint { display: block; margin-top: 4px; font-family: var(--font-ui, sans-serif); font-size: 11px; letter-spacing: .1em; color: #d89aa6; text-shadow: none; animation: knBlink 1.6s steps(2) infinite; }
.kn-tele.big .kn-tbody { font-size: 1.5em; letter-spacing: .24em; }
.kn-tele::after { content: ""; position: absolute; left: -8px; top: 26px; width: 14px; height: 14px; background: #150206; border-left: 1.5px solid #7a0e1e; border-bottom: 1.5px solid #7a0e1e; transform: rotate(45deg); }
@media (max-width: 720px) { .kn-tele { left: 16px !important; right: 16px; top: calc(70px + env(safe-area-inset-top, 0px)) !important; max-width: none; } .kn-tele::after { left: 64px; top: auto; bottom: -8px; border-left: 0; border-top: 0; border-right: 1.5px solid #7a0e1e; } }
.kn-press { position: fixed; inset: 0; z-index: 23; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(60, 0, 12, .55) 70%, rgba(10, 0, 4, .9)); opacity: 0; }
.kn-press.show { animation: knPress 2.2s ease-out both; }
@keyframes knPress { 0% { opacity: 0; } 10% { opacity: 1; } 100% { opacity: 0; } }
.kn-ring { position: fixed; z-index: 24; pointer-events: none; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; border: 3px solid rgba(255, 40, 70, .9); box-shadow: 0 0 22px rgba(255, 20, 60, .8), inset 0 0 18px rgba(120, 0, 20, .8); animation: knRing 1.1s ease-out both; }
@keyframes knRing { from { transform: scale(.4); opacity: 1; } to { transform: scale(14); opacity: 0; border-width: 1px; } }
.kn-push { position: fixed; z-index: 24; pointer-events: none; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 220, 225, .9), rgba(255, 60, 80, .4), transparent); }
.kn-book { position: fixed; z-index: 24; left: 50%; top: 30%; width: min(16vw, 130px); aspect-ratio: 3 / 4; transform: translate(-50%, -50%); pointer-events: none; opacity: 0; }
.kn-book.show { animation: knBook 4.8s ease-in-out both; }
@keyframes knBook { 0% { opacity: 0; transform: translate(-50%, -46%) scale(.9); } 30% { opacity: .7; } 70% { opacity: .6; } 100% { opacity: 0; transform: translate(-50%, -54%) scale(1.05); } }

/* 西の書館の奥：赤い廊下への入り口 */
.kn-arch { position: absolute; border: 0; padding: 0; background: transparent; cursor: pointer; }
.kn-arch svg { width: 100%; height: 100%; display: block; overflow: visible; }
.kn-arch:hover .kn-arch-glow, .kn-arch:focus-visible .kn-arch-glow { opacity: 1; }
.kn-arch:focus-visible { outline: 2px dashed #ff8a9a; outline-offset: 2px; }
.kn-arch-glow { transition: opacity .4s; opacity: .7; }

/* 部屋の中 */
.kn-room-wall { inset: 0; }
.kn-corr img.part { display: block; height: auto; pointer-events: none; }
.kn-glow { border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 40, 70, .38), rgba(160, 0, 30, .12) 60%, transparent); pointer-events: none; animation: knGlow 3.8s ease-in-out infinite; }
@keyframes knFlick { 25% { transform: scale(.94, 1.05) rotate(-2deg); } 50% { transform: scale(1.04, .95) rotate(1.5deg); } 75% { transform: scale(.97, 1.03) rotate(-1deg); } }
@keyframes knGlow { 50% { opacity: .7; } }
.kn-motes i { position: absolute; width: .35cqw; height: .35cqw; border-radius: 50%; background: #ff5a6e; box-shadow: 0 0 .6cqw #ff2040; opacity: 0; animation: knMote linear infinite; }
@keyframes knMote { 0% { opacity: 0; transform: translate(0, 0); } 15% { opacity: .8; } 85% { opacity: .5; } 100% { opacity: 0; transform: translate(3cqw, -14cqw); } }
.kn-door { position: absolute; border: 0; padding: 0; background: transparent; cursor: pointer; }
.kn-door svg { width: 100%; height: 100%; display: block; }
.kn-door:hover .kn-door-glow, .kn-door:focus-visible .kn-door-glow { opacity: 1; }
.kn-door:focus-visible { outline: 2px dashed #ff8a9a; outline-offset: 3px; }
.kn-door-glow { opacity: .55; transition: opacity .4s; }
.kn-sign { position: absolute; transform: translate(-50%, -100%); font-family: var(--font-display, serif); font-size: clamp(11px, 1.1cqw, 15px); letter-spacing: .24em; padding: .25em .8em .25em 1em; white-space: nowrap; color: #ffd0d6; background: linear-gradient(180deg, rgba(50, 6, 14, .94), rgba(18, 2, 6, .94)); border: 1px solid rgba(220, 50, 70, .7); border-radius: 3px; box-shadow: 0 4px 14px rgba(0, 0, 0, .5), 0 0 12px rgba(200, 20, 50, .35); pointer-events: none; }
.room-redmoon { background: #070305; }
.room-redmoon .room-stage > :not(button) { pointer-events: none; }
body.fx-off .kn-glow, body.fx-off .kn-body .kn-aura, body.fx-off .kn-motes { animation: none !important; }
body.fx-off .kn-motes { display: none; }
@media (prefers-reduced-motion: reduce) { .kn-glow, .kn-body .kn-aura, .kn-motes i { animation: none !important; } .kn-motes { display: none; } }
`;
  document.head.appendChild(css);

  /* =========================================================
     カネル（部品を組み立てて動かす：Live2Dのような動き）
     rig.json の部品を、読み込みのときに一度だけ絵にしておき、毎フレームは重ねるだけ
     ========================================================= */
  function Figure(canvas) {
    const D2R = Math.PI / 180;
    let rig = null, g = canvas.getContext("2d"), bmp = {}, bones = [], byId = {}, cssH = 0, ppu = 1, alive = true, raf = 0, lastDraw = 0, t0 = performance.now(), building = 0;
    const S = { wingAt: -1e9, wingHold: 0, blinkAt: 2.5, blinkUntil: 0, flare: -99, turn: 0, turnTo: 0, look: 0, lookTo: 0, twitch: -99, nextTwitch: 9 };
    const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
    const local = (pv, q) => { const c = Math.cos(q.r * D2R), s = Math.sin(q.r * D2R), a = c * q.sx, b = s * q.sx, cc = -s * q.sy, d = c * q.sy; return [a, b, cc, d, pv[0] + q.x - (a * pv[0] + cc * pv[1]), pv[1] + q.y - (b * pv[0] + d * pv[1])]; };
    const pulse = (t, d) => (t > 0 && t < d ? Math.sin(Math.PI * t / d) : 0);
    const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
    // 奥行き：顔を横に向けたとき、手前の部品ほど大きく、奥の部品は逆に動く
    const DEPTH = { hairBack: -3, hoodIn: -4, face: 0, eyesClosed: 2.1, whites: 1.9, brows: 2.3, nose: 2.2, eyes: 2, lashes: 2.1, blush: 1.5, ear: -1, bangs: 3.2, locks: 2.6, lockFront: 3.4, ahoge: 1 };

    async function load(data) {
      rig = data; bones = rig.bones.map((b) => ({ ...b, q: null, m: null })); bones.forEach((b) => { byId[b.id] = b; });
      await rebuild();
      if (!alive) return;
      addEventListener("resize", onResize);
      raf = requestAnimationFrame(frame);
    }
    function refit() { if (alive && rig && Math.abs(canvas.clientHeight - cssH) > 8) rebuild(); }
    function onResize() { clearTimeout(building); building = setTimeout(() => { if (alive && Math.abs(canvas.clientHeight - cssH) > 8) rebuild(); }, 250); }
    async function rebuild() {
      const [, , fw, fh] = rig.frame, nH = canvas.clientHeight || 400, dpr = Math.min(3, devicePixelRatio || 1);
      const cH = Math.round(nH * dpr), cW = Math.round(cH * fw / fh), np = cH / fh, pad = 1.5, out = {};
      // 部品の絵は、話すために左へ出てきたときの大きさ（いちばん大きいとき）で作っておく。
      // 大きくなっても引きのばさないので、話すときもぼやけない（小さいときは縮めて描くだけ）
      const big = typeof leftSpot === "function" ? leftSpot().height : 0, hp = Math.max(np, Math.round(big * dpr) / fh);
      await Promise.all(rig.parts.map((p) => new Promise((ok) => {
        const [x, y, w, h] = p.bbox, bw = Math.max(1, Math.ceil((w + pad * 2) * hp)), bh = Math.max(1, Math.ceil((h + pad * 2) * hp));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${bw}" height="${bh}" viewBox="${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}" preserveAspectRatio="none">${p.body}</svg>`;
        const img = new Image(), u = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        img.onload = () => { const c = document.createElement("canvas"); c.width = bw; c.height = bh; c.getContext("2d").drawImage(img, 0, 0, bw, bh); out[p.id] = { c, x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 }; URL.revokeObjectURL(u); ok(); };
        img.onerror = () => { URL.revokeObjectURL(u); ok(); };
        img.src = u;
      })));
      if (!alive) return;
      cssH = nH; canvas.width = cW; canvas.height = cH; ppu = np; bmp = out;
      step(performance.now(), true);
    }
    // 翼：ふだんはしまっていて、移動するときや、さわられそうになって威嚇するときだけ、ばさっと開いて、すっと閉じる
    function wingOpen(now) {
      const u = (now - S.wingAt) / 1000, open = .28, close = .75, hold = S.wingHold / 1000;
      if (u < 0) return 0;
      if (u < open) { const k = u / open; return 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); } // 行きすぎて戻る（ばさっ）
      if (u < open + hold) return 1;
      const k = (u - open - hold) / close; return k >= 1 ? 0 : .5 + .5 * Math.cos(Math.PI * k);           // すっと閉じる
    }
    function pose(t, now) {
      const q = (id) => byId[id].q;
      bones.forEach((b) => { b.q = { x: 0, y: 0, r: 0, sx: 1, sy: 1 }; });
      const st = still(), amp = cls().contains("torsa-lite") ? .5 : 1;
      S.turn += (S.turnTo - S.turn) * .04; S.look += (S.lookTo - S.look) * .05;
      // 呼吸：ゆっくり（5.4秒）
      const ph = (t / 5.4) % 1, br = st ? 0 : (ph < .45 ? .5 - .5 * Math.cos(Math.PI * ph / .45) : .5 + .5 * Math.cos(Math.PI * (ph - .45) / .55));
      q("body").sy = 1 + .009 * br; q("body").sx = 1 + .003 * br;
      // さわろうとしたとき：翼がばっと広がり、からだが少し大きくなる
      const fu = (now - S.flare) / 1000, fl = st ? 0 : Math.max(0, pulse(fu, 1.6)) * (fu < .25 ? fu / .25 : 1);
      if (!st) {
        const w = amp * (Math.sin(t * .55) * 2.2 + Math.sin(t * .23 + 1) * .8) - S.turn * 6;
        q("wingR").r = w + 9 * fl; q("wingR2").r = w * .7 - 3 + 7 * fl - S.turn * 2;
        q("wingL").r = -w - 9 * fl; q("wingL2").r = -w * .7 + 3 - 7 * fl + S.turn * 2;
        q("wingR").sy = q("wingL").sy = 1 + .02 * Math.sin(t * .55 + .6);
      }
      {
        // 翼の開き具合 wo（0＝しまう、1＝開く）。閉じるときは、根もとへ小さくたたみながら、からだのうしろへ寄せる
        const wo = S.wo = Math.max(0, wingOpen(now)), f = 1 - Math.min(1, wo);
        [["wingR", 1], ["wingR2", 1], ["wingL", -1], ["wingL2", -1]].forEach(([id, sg]) => {
          const b = q(id), k = .2 + .8 * Math.min(1.15, wo);
          b.sx *= k; b.sy *= k; b.r += sg * 28 * f;
        });
      }
      if (!st) {
        q("head").r = amp * (.6 * Math.sin(t * .31) + .25 * Math.sin(t * .17 + 2)) - S.turn * 3;
        q("head").y = -.3 * br + S.turn * 1.2;
        q("capeL").r = amp * .5 * Math.sin(t * .42); q("capeR").r = -amp * .5 * Math.sin(t * .42 + .9);
        q("armL").r = amp * .4 * Math.sin(t * .37 + .3); q("armR").r = -amp * .4 * Math.sin(t * .37 + 1.4);
        q("ahoge").r = amp * 3 * Math.sin(t * 1.05) - q("head").r * 1.1;
        q("locks").r = amp * .6 * Math.sin(t * .8 + .5) - q("head").r * .5; q("locks").sy = 1 + .006 * Math.sin(t * .8);
        q("lockFront").r = amp * 1 * Math.sin(t * .9 + 1.6) - q("head").r * .6;
        // とがった耳：ときどき小さくぴくっ
        // とがった耳は動かさない。かわりにアホ毛が、ときどきぴこぴこっと2回はねる
        if (t > S.nextTwitch) { S.twitch = t; S.nextTwitch = t + 5 + Math.random() * 7; }
        q("ahoge").r += 9 * (pulse(t - S.twitch, .16) + .8 * pulse(t - S.twitch - .22, .16));
        // まばたき（ゆっくりめ）
        if (t > S.blinkAt) { S.blinkUntil = t + .2; S.blinkAt = t + 3.5 + Math.random() * 5; }
        q("body").y = -1.2 * fl; q("body").sx *= 1 + .01 * fl;
      }
      S.blink = !st && t < S.blinkUntil;
      bones.forEach((b) => { const L = local(b.pivot, b.q); b.m = b.parent ? mul(byId[b.parent].m, L) : L; });
    }
    function draw() {
      if (!rig || !Object.keys(bmp).length) return;
      const [fx, fy] = rig.frame, V = [ppu, 0, 0, ppu, -fx * ppu, -fy * ppu];
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height); g.imageSmoothingQuality = "high";
      const ax = S.look * .8 - S.turn * .9;
      const wa = Math.min(1, (S.wo || 0) * 1.8);
      rig.parts.forEach((p) => {
        const im = bmp[p.id]; if (!im) return;
        const wing = p.id.startsWith("wing"); if (wing && wa < .02) return;
        g.globalAlpha = wing ? wa : 1;
        let m = mul(V, byId[p.bone].m);
        // まばたき：目をあけた部品（白目・ひとみ・まつげ・まゆ）を消して、描いてもらった閉じた目（eyesClosed）を出す
        if (S.blink ? ["eyes", "whites", "lashes", "brows"].includes(p.id) : p.id === "eyesClosed") return;
        const z = DEPTH[p.id];
        if (z != null && ax) m = mul(m, [1, 0, 0, 1, ax * z * .55, 0]);
        g.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        g.drawImage(im.c, im.x, im.y, im.w, im.h);
      });
      g.globalAlpha = 1;
    }
    function step(now, force) { const t = (now - t0) / 1000; pose(t, now); draw(); }
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      // 1秒に30回まで（ゆっくりした動きなので、見た目は変わらない）。動きなしのときは止める
      if (now - lastDraw < 32) return;
      if (still() && lastDraw && now - S.flare > 2000 && now - S.wingAt > S.wingHold + 1500) return;
      lastDraw = now; step(now);
    }
    return {
      load, refit,
      flare() { S.flare = performance.now(); this.wings(1500); },
      // 翼をばさっと開いて、hold ミリ秒たったら閉じる（開いているあいだに呼ぶと、開いたまま延長）
      wings(hold = 900) { const now = performance.now(), u = now - S.wingAt; if (u > 280 && u < 280 + S.wingHold) { S.wingHold = u - 280 + hold; } else { S.wingAt = now; S.wingHold = hold; SFX.play("wings"); } },
      turn(v) { S.turnTo = v ? 1 : 0; },
      look(v) { S.lookTo = Math.max(-1, Math.min(1, v)); },
      get frame() { return rig && rig.frame; },
      destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener("resize", onResize); bmp = {}; }
    };
  }

  // カネルの姿を el の中に出す（el は位置と大きさを決めた入れもの）
  let FIG = null;
  function mountFigure(el) {
    if (FIG) { FIG.destroy(); FIG = null; }
    el.innerHTML = `<div class="kn-body"><div class="kn-aura"></div><div class="kn-shadow"></div><canvas role="img" aria-label="カネル。赤と黒の髪、とがった耳、赤い目の吸血鬼の少年。黒いマントと、目玉のような模様の翼"></canvas></div>`;
    const f = Figure(el.querySelector("canvas")); FIG = f;
    return loadRig().then((r) => (FIG === f ? f.load(r).then(() => f) : f)).catch((e) => { console.warn("カネルの部品データを読めませんでした", e); return f; });
  }
  function dropFigure() { if (FIG) { FIG.destroy(); FIG = null; } document.querySelectorAll("body > .kn-body").forEach((b) => b.remove()); }

  /* ---------- 話しかけてくるとき：トルサの反対側（画面の左）に出てきて、話が終わると元の場所にもどる ---------- */
  // 左の場所の大きさは leftSpot で決める（トルサと同じくらいの大きさで、ひざから上が見えるくらい）
  // トルサと同じくらいの背の高さにして、足もとの高さをそろえ、トルサと左右反対の位置に出す
  // （カネルの絵：頭のてっぺん14〜足もと342、からだのまんなか x=140。トルサの絵：頭のてっぺん4〜足もと308）
  const KN_TOP = 14, KN_FEET = 342, KN_CX = 140, TS_TOP = 4, TS_FEET = 308;
  function leftSpot() {
    const tc = $("torsaCanvas"), tr = ctx.torsaRig && ctx.torsaRig();
    if (tc && !tc.hidden && tr && tr.frame && !cls().contains("gazing")) {
      const r = tc.getBoundingClientRect();
      if (r.height > 40) {
        const [tfx, tfy, tfw, tfh] = tr.frame, tp = r.height / tfh;                 // トルサの1単位あたりの大きさ
        const feetY = r.top + (TS_FEET - tfy) * tp, kp = tp * (TS_FEET - TS_TOP) / (KN_FEET - KN_TOP);
        const tcx = r.left + (66 - tfx) * tp;
        // トルサと左右反対の位置。せまい画面（スマホ）では近くなりすぎるので、トルサから離れるように左へずらす（からだの半分くらいまでは画面の外に出てもよい）
        const gap = Math.max(24, innerWidth * .05), apart = r.left + r.width * .1 - 48 * kp - gap;
        const cx = Math.max(Math.min(innerWidth - tcx, apart, innerWidth < 720 ? innerWidth * .2 : Infinity), 8 * kp);
        const [kfx, kfy, kfw, kfh] = [-4, -4, 362.8, 350.5];
        // 左に出ているあいだは左右反転（右向き）して描くので、反転したあとのからだのまんなかが cx に来るようにする
        return { left: cx - (kfw - (KN_CX - kfx)) * kp, top: feetY - (KN_FEET - kfy) * kp, width: kfw * kp, height: kfh * kp };
      }
    }
    const W = innerWidth, H = innerHeight, phone = W < 720;
    const h = phone ? Math.min(H * .74, W * 1.1) : Math.min(H * 1.08, W * .56), w = h * 362.8 / 350.5;
    return { left: phone ? -w * .22 : Math.max(-w * .16, W * .03 - w * .1), top: phone ? H * .14 : H * .2, width: w, height: h };
  }
  const setBox = (el, r) => Object.assign(el.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
  let awayT = 0;
  function approach(fig, on, ms = 900, instant = false) {
    if (FIG) FIG.wings(instant ? 1100 : ms + 300); // 移動するときは翼を広げる
    const body = fig && fig.querySelector(".kn-body") || document.querySelector("body > .kn-body"); if (!body) return Promise.resolve();
    clearTimeout(awayT);
    const isAway = body.classList.contains("kn-away");
    if (on === isAway && !(on && body.dataset.back)) return Promise.resolve();
    return new Promise((done) => {
      if (on) {
        if (!isAway) {
          const r = body.getBoundingClientRect();
          body.style.transition = "none"; body.classList.add("kn-away"); setBox(body, r); document.body.appendChild(body); void body.offsetWidth; body.style.transition = "";
        }
        delete body.dataset.back;
        if (instant) body.style.transition = "none";
        setBox(body, leftSpot());
        body.classList.add("kn-faceR");
        if (instant) { void body.offsetWidth; body.style.transition = ""; if (FIG) FIG.refit(); done(); return; }
        awayT = setTimeout(() => { if (FIG) FIG.refit(); done(); }, reduced ? 0 : ms);
      } else {
        body.dataset.back = "1"; body.classList.remove("kn-faceR");
        const r = fig.getBoundingClientRect(); setBox(body, r);
        awayT = setTimeout(() => {
          if (!body.dataset.back) { done(); return; }
          delete body.dataset.back;
          // 窓の前にもどったら、明るいところから、ゆっくり逆光で暗くなる
          body.classList.add("kn-lit"); body.classList.remove("kn-away"); body.style.cssText = ""; fig.appendChild(body); void body.offsetWidth;
          requestAnimationFrame(() => requestAnimationFrame(() => body.classList.remove("kn-lit")));
          if (FIG) FIG.refit(); done();
        }, reduced ? 0 : ms);
      }
    });
  }
  // 部屋の中：話すあいだだけ左へ出てきて、ms たったら元の場所へもどる
  let goT = 0;
  function comeAndGo(fig, ms) { if (!fig || !FIG) return; clearTimeout(goT); approach(fig, true); goT = setTimeout(() => { if (fig.isConnected) approach(fig, false); }, ms); }
  addEventListener("resize", () => { const b = document.querySelector("body > .kn-body.kn-away"); if (b && !b.dataset.back) setBox(b, leftSpot()); });

  /* ---------- 心に響く声 ---------- */
  // 部屋の中のカネルの声：黒い赤の吹き出しを、左に出てきたカネルの横に出す（big＝「触るな」のように強く）
  let teleT = 0;
  function teleShow(text, small, ms, hint) {
    let el = document.querySelector(".kn-tele");
    if (!el) { el = document.createElement("p"); el.className = "kn-tele"; el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
    const sp = leftSpot();
    el.style.left = Math.round(Math.max(16, sp.left + sp.width * .75)) + "px"; el.style.top = Math.round(sp.top + sp.height * .08) + "px";
    el.innerHTML = `<span class="kn-tname">${esc(NAME())}<small>心に響く声</small></span><span class="kn-tbody">${esc(tele(text))}</span>${hint ? `<span class="kn-thint">${esc(hint)}</span>` : ""}`;
    el.classList.toggle("big", !small);
    ctx.hideBubble(); // トルサの吹き出しとかぶらないように、カネルが話すあいだはトルサの吹き出しを消す
    el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
    clearTimeout(teleT); teleT = setTimeout(() => el.classList.remove("show"), ms || (small ? 4600 : 3200));
    SFX.play("telepathy");
  }

  /* =========================================================
     さわろうとしたとき：「触るな」と、圧
     ========================================================= */
  let pressCool = 0;
  function pressure(e, figEl) {
    if (performance.now() < pressCool) return;
    pressCool = performance.now() + 2600; convStop();
    const k = K(), arr = (CFG && CFG.kaneru && CFG.kaneru.touch) || ["触るな。"];
    const line = arr[Math.min(k.touch, arr.length - 1)]; k.touch++; ctx.save(); kLike("touch");
    SFX.play("pressure");
    if (FIG) FIG.flare();
    // 画面のふちが暗く赤くなり、カネルから赤い輪がひろがる
    let pr = document.querySelector(".kn-press"); if (!pr) { pr = document.createElement("div"); pr.className = "kn-press"; document.body.appendChild(pr); }
    pr.classList.remove("show"); void pr.offsetWidth; pr.classList.add("show");
    const r = figEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45;
    if (!reduced) {
      for (let i = 0; i < 2; i++) setTimeout(() => { const ring = document.createElement("i"); ring.className = "kn-ring"; ring.style.left = cx + "px"; ring.style.top = cy + "px"; document.body.appendChild(ring); setTimeout(() => ring.remove(), 1200); }, i * 180);
      // さわろうとした指先が、押し返される
      const px = e && e.clientX != null ? e.clientX : cx, py = e && e.clientY != null ? e.clientY : cy;
      const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, push = document.createElement("i"); push.className = "kn-push"; push.style.left = px + "px"; push.style.top = py + "px"; document.body.appendChild(push);
      push.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${f1(dx / d * 140)}px, ${f1(dy / d * 140)}px) scale(.4)`, opacity: 0 }], { duration: 700, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => push.remove();
      const stage = $("roomScroll"); stage.classList.remove("kn-shake"); void stage.offsetWidth; stage.classList.add("kn-shake");
    }
    comeAndGo(figEl, 3900);
    setTimeout(() => teleShow(line), reduced ? 0 : 450);
    // トルサはびっくりして、しょんぼり
    ctx.setFace("sweat", 2600);
    setTimeout(() => { const a = torsaLines("afterPressure"); if (a.length) ctx.say(pick(a), 5200); }, reduced ? 3700 : 4000);
  }

  /* =========================================================
     セリフ（トルサ）
     ========================================================= */
  const torsaLines = (key) => ((CFG && CFG.torsa && CFG.torsa[key]) || []);
  function torsaSay(key, ms) { const a = torsaLines(key); if (a.length) ctx.say(pick(a), ms || 5600); }
  function torsaSeq(key, gap = 3600) { torsaLines(key).forEach((l, i) => setTimeout(() => { if (ROOMNOW) ctx.say(l, 5200); }, i * gap)); }

  /* =========================================================
     部屋の絵
     ========================================================= */
  const at = (W) => (x, y, w, h) => `left:${f1(x / W * 100)}%;top:${f1(y / 10)}%;width:${f1(w / W * 100)}%;${h != null ? `height:${f1(h / 10)}%;` : ""}`;
  const MOTES = (n, W) => { let s = '<div class="kn-motes" style="inset:0" aria-hidden="true">'; for (let i = 0; i < n; i++) s += `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(30 + Math.random() * 60).toFixed(1)}%;animation-duration:${(9 + Math.random() * 9).toFixed(1)}s;animation-delay:${(-Math.random() * 18).toFixed(1)}s"></i>`; return s + "</div>"; };
  // 赤いろうそく：図書館のろうそく（assets/parts/candle.svg）を赤く色がえしたもの（kaneru/candle_red.svg）。
  // x＝まんなか、bottom＝下のはし、h＝火の先までの高さ（館内の単位）。火のまわりに、ぼんやりした光
  const CANDLE = "kaneru/candle_red.svg", CANDLE_AR = 100.09 / 350.32;
  const candleImg = (A, x, bottom, h, i = 0, glow = 1, still = false) => { const w = h * CANDLE_AR, fy = bottom - h * .9;
    return (glow ? `<div class="kn-glow${still ? " kn-still" : ""}" style="${A(x - h * .6 * glow, fy - h * .45 * glow, h * 1.2 * glow, h * 1.2 * glow)}animation-delay:${-i * .9}s"></div>` : "") + `<img class="part" src="${CANDLE}" alt="" style="${A(x - w / 2, bottom - h, w)}">`; };
  // 燭台（黒い鉄。上に赤いろうそくが3本）
  const candelabra = (A, x, bottom, h) => {
    const w = h * .42, y = bottom - h;
    const svg = `<svg viewBox="0 0 100 240" preserveAspectRatio="none" style="width:100%;height:100%;display:block" aria-hidden="true"><defs><linearGradient id="knIr" x1="0" x2="1"><stop offset="0" stop-color="#0c0809"/><stop offset=".5" stop-color="#3a2a2e"/><stop offset="1" stop-color="#0c0809"/></linearGradient></defs>
      <path d="M50 70V222M22 222h56l-8 14H30z" stroke="url(#knIr)" stroke-width="7" fill="#1a1214"/><path d="M14 52q0 22 36 22t36-22" fill="none" stroke="url(#knIr)" stroke-width="6"/><circle cx="50" cy="120" r="7" fill="#2a1e22"/><circle cx="50" cy="170" r="5" fill="#2a1e22"/>
      ${[14, 50, 86].map((cx) => `<rect x="${cx - 9}" y="${cx === 50 ? 44 : 54}" width="18" height="6" rx="2" fill="#3a2a2e"/>`).join("")}</svg>`;
    let s = `<div style="${A(x - w / 2, y, w, h)}">${svg}</div>`;
    [[14, 54, .3], [50, 44, .36], [86, 54, .3]].forEach(([cx, cy, k], i) => { s += candleImg(A, x - w / 2 + cx / 100 * w, y + cy / 240 * h + 1, h * k, i); });
    return s;
  };
  // 柱（黒い石、赤い筋）
  const pillar = (A, x, top, bottom, w = 56) => `<div style="${A(x - w / 2, top, w, bottom - top)}background:linear-gradient(90deg,#050304,#1d1417 30%,#2c2024 50%,#140d10 75%,#050304);box-shadow:inset 0 0 0 1px rgba(150,20,40,.18)"></div><div style="${A(x - w / 2 - 10, top - 18, w + 20, 22)}background:linear-gradient(#2b2024,#0b0708);border-bottom:2px solid #6a1020"></div><div style="${A(x - w / 2 - 10, bottom - 6, w + 20, 26)}background:linear-gradient(#1d1417,#050304);border-top:2px solid #4a0a16"></div>`;

  /* ---------- 窓の外の景色 ----------
     部屋（や廊下）の外には、ひとつの景色（赤い夜空・月・城）があり、どの窓からも同じ景色の「その窓のうしろ」が見える。
     だから、月はひとつ、城もひとつ。月と城は、いただいた城2.svg から取りだして、軽い絵（WebP）にしたもの（kaneru/moon.webp・kaneru/castle.webp） */
  const MOON_R = 138;          // moon.webp（元の 526.4 四方）の中の、月の円の半径
  const CASTLE_AR = 288 / 430; // castle.webp の 横÷縦
  // span＝景色を描く横のはば [左, 右]（遠くの景色はゆっくり動くので、窓より広めに描いておく）
  function outsideScene(id, W, H, { moon, castle, horizon = H * .7, seed = 3, span = [0, W] }) {
    let st = seed; const rnd = () => { st = (st * 16807) % 2147483647; return st / 2147483647; };
    const [X0, X1] = span, SW = X1 - X0;
    let stars = ""; for (let i = 0; i < Math.round(SW * horizon / 26000); i++) stars += `<circle cx="${f1(X0 + rnd() * SW)}" cy="${f1(rnd() * horizon)}" r="${f1(.6 + rnd() * 1.3)}" fill="#ffe0e4" opacity="${(.3 + rnd() * .6).toFixed(2)}"/>`;
    let s = `<defs><linearGradient id="${id}Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0007"/><stop offset=".45" stop-color="#2a0012"/><stop offset=".8" stop-color="#4e0618"/><stop offset="1" stop-color="#2a0008"/></linearGradient>
      <radialGradient id="${id}Pu" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7d1c9d" stop-opacity=".45"/><stop offset="1" stop-color="#7d1c9d" stop-opacity="0"/></radialGradient></defs>
      <rect x="${X0}" width="${SW}" height="${H}" fill="url(#${id}Sky)"/>${stars}
      <ellipse cx="${f1(X0 + SW * .25)}" cy="${f1(horizon * .55)}" rx="${f1(SW * .16)}" ry="${f1(horizon * .35)}" fill="url(#${id}Pu)"/><ellipse cx="${f1(X0 + SW * .72)}" cy="${f1(horizon * .3)}" rx="${f1(SW * .14)}" ry="${f1(horizon * .3)}" fill="url(#${id}Pu)"/>`;
    if (moon) { const k = moon.r / MOON_R, sz = 526.4 * k; s += `<image href="kaneru/moon.webp" x="${f1(moon.cx - sz / 2)}" y="${f1(moon.cy - sz / 2)}" width="${f1(sz)}" height="${f1(sz)}"/>`; }
    // 遠くの丘（どの窓から見ても、地平線がつながる）
    let hill = `M${X0} ${H}V${f1(horizon)}`; for (let x = X0; x <= X1; x += 80) hill += `L${x} ${f1(horizon - 14 - Math.sin(x * .006 + seed) * 18 - rnd() * 10)}`; hill += `L${X1} ${H}Z`;
    s += `<path d="${hill}" fill="#14010a"/>`;
    if (castle) { const w = castle.h * CASTLE_AR; s += `<image href="kaneru/castle.webp" x="${f1(castle.x - w / 2)}" y="${f1(castle.bottom - castle.h)}" width="${f1(w)}" height="${f1(castle.h)}"/>`; }
    return s + `<rect x="${X0}" width="${SW}" height="${H}" fill="#ff2040" opacity=".05"/>`;
  }
  // とがったアーチの窓の形（内側）と、窓わく
  const archPath = (x, y, w, bottom) => `M${x} ${bottom}V${f1(y + (bottom - y) * .3)}Q${x} ${y} ${f1(x + w / 2)} ${y}Q${x + w} ${y} ${x + w} ${f1(y + (bottom - y) * .3)}V${bottom}Z`;
  const archFrame = (x, y, w, bottom) => { const d = archPath(x, y, w, bottom), mx = x + w / 2, my = f1(y + (bottom - y) * .58);
    return `<path d="${d}" fill="none" stroke="#050304" stroke-width="16"/><path d="${d}" fill="none" stroke="#5a0c1a" stroke-width="2" opacity=".9"/>
      <path d="M${mx} ${y + 2}V${bottom}M${x} ${my}H${x + w}" stroke="#050304" stroke-width="7"/><path d="M${mx} ${y + 2}V${bottom}M${x} ${my}H${x + w}" stroke="#3a0812" stroke-width="1.5"/>
      <rect x="${x - 22}" y="${bottom}" width="${w + 44}" height="14" rx="2" fill="#120a0c"/><rect x="${x - 22}" y="${bottom}" width="${w + 44}" height="2" fill="#6a1020"/>`; };
  // 丸窓のわく（バラ窓）：
  //  外がわ＝石を組んだ重いわく（迫石のつなぎめ・面取りのかげ・内がわのふちに月の光があたる）
  //  内がわ＝細い鉄のトレーサリー（まんなかの飾り・8枚の花びら形・外まわりの16の小さな弧）。ガラスに少し色とつや
  // まんなかの宝石：金の台座（面取り）に、カットした赤い宝石。面ごとに明るさのちがうグラデーションと、白いきらめき
  function gem(cx, cy, R) {
    const g = R * .74, P = (a, rr) => `${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)}`;
    const N = 8, out = [], tab = [];
    for (let i = 0; i < N; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / N + Math.PI / N; out.push(P(a, g)); tab.push(P(a, g * .5)); }
    let facets = "";
    for (let i = 0; i < N; i++) { const j = (i + 1) % N, sh = [.0, .18, .38, .55, .7, .55, .3, .12][i];
      facets += `<path d="M${out[i]}L${out[j]}L${tab[j]}L${tab[i]}Z" fill="url(#knGemF)" opacity="1"/><path d="M${out[i]}L${out[j]}L${tab[j]}L${tab[i]}Z" fill="#${sh > .4 ? "000" : "fff"}" opacity="${(sh > .4 ? sh - .3 : .32 - sh).toFixed(2)}"/>`; }
    let prongs = ""; for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4; prongs += `<circle cx="${f1(cx + Math.cos(a) * g * .98)}" cy="${f1(cy + Math.sin(a) * g * .98)}" r="${f1(R * .09)}" fill="url(#knGold)" stroke="#3a2410" stroke-width=".8"/>`; }
    let rays = ""; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; rays += `<path d="M${P(a, -g * .55)}L${P(a, g * .55)}" stroke="#fff" stroke-width="${i % 2 ? .8 : 1.6}" stroke-linecap="round" opacity="${i % 2 ? .5 : .85}"/>`; }
    return `<defs>
        <radialGradient id="knGemF" cx="${f1(cx - g * .25)}" cy="${f1(cy - g * .3)}" r="${f1(g * 1.3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff8a9a"/><stop offset=".35" stop-color="#e01838"/><stop offset=".7" stop-color="#8a0618"/><stop offset="1" stop-color="#3a0008"/></radialGradient>
        <radialGradient id="knGemT" cx="${f1(cx - g * .12)}" cy="${f1(cy - g * .16)}" r="${f1(g * .62)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2e6"/><stop offset=".25" stop-color="#ff5a70"/><stop offset=".7" stop-color="#c0102c"/><stop offset="1" stop-color="#6a0414"/></radialGradient>
        <linearGradient id="knGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2a0"/><stop offset=".3" stop-color="#c9a35a"/><stop offset=".6" stop-color="#7a5a24"/><stop offset=".85" stop-color="#d6b062"/><stop offset="1" stop-color="#5a3e14"/></linearGradient>
        <radialGradient id="knGemGlow" cx="${cx}" cy="${cy}" r="${f1(R * 2.2)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff3050" stop-opacity=".55"/><stop offset=".5" stop-color="#ff3050" stop-opacity=".12"/><stop offset="1" stop-color="#ff3050" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${f1(R * 2.2)}" fill="url(#knGemGlow)"/>
      <circle cx="${cx}" cy="${cy}" r="${f1(R * 1.08)}" fill="#120a0c" stroke="#050203" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${f1(R * .98)}" fill="none" stroke="url(#knGold)" stroke-width="${f1(R * .16)}"/>
      <circle cx="${cx}" cy="${cy}" r="${f1(R * .9)}" fill="none" stroke="#3a2410" stroke-width="1"/>
      <path d="M${out.join("L")}Z" fill="#2a0008"/>
      ${facets}
      <path d="M${tab.join("L")}Z" fill="url(#knGemT)" stroke="#ffb0bc" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M${out.join("L")}Z" fill="none" stroke="#ffc2cb" stroke-opacity=".55" stroke-width="1"/>
      ${prongs}
      <path d="M${P(-2.4, g * .42)}L${P(-1.75, g * .44)}L${P(-2.0, g * .2)}Z" fill="#fff" opacity=".75"/>
      <g transform="translate(${f1(cx - g * .28)} ${f1(cy - g * .3)}) scale(.55)">${rays.replace(/M([\d.-]+) ([\d.-]+)L([\d.-]+) ([\d.-]+)/g, (m, a, b, c, d) => `M${f1(a - cx)} ${f1(b - cy)}L${f1(c - cx)} ${f1(d - cy)}`)}</g>`;
  }
  function moonFrame(cx, cy, R) {
    const r = R - 34, P = (a, rr) => [f1(cx + Math.cos(a) * rr), f1(cy + Math.sin(a) * rr)];
    const circ = (rr) => `M${f1(cx - rr)} ${cy}a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(2 * rr)} 0a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-2 * rr)} 0Z`;
    const ringAt = (x, y, rr) => `M${f1(x - rr)} ${y}a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(2 * rr)} 0a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-2 * rr)} 0Z`;
    // 石のわく：32個の迫石
    let stones = ""; for (let i = 0; i < 32; i++) { const a0 = i * Math.PI / 16, a1 = (i + 1) * Math.PI / 16, [x0, y0] = P(a0, R), [x1, y1] = P(a1, R), [x2, y2] = P(a1, r + 8), [x3, y3] = P(a0, r + 8);
      stones += `<path d="M${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r + 8} ${r + 8} 0 0 0 ${x3} ${y3}Z" fill="url(#knStone)" opacity="${(.82 + (i * 37 % 7) * .025).toFixed(3)}"/>`; }
    let joints = ""; for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, [x0, y0] = P(a, R - 1), [x1, y1] = P(a, r + 9); joints += `M${x0} ${y0}L${x1} ${y1}`; }
    // トレーサリー
    let tr = circ(r * .2) + circ(r * .62) + circ(r * .98);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8, [x, y] = P(a, r * .41); tr += ringAt(+x, +y, r * .2); }
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, [x0, y0] = P(a, r * .62), [x1, y1] = P(a, r * .98); tr += `M${x0} ${y0}L${x1} ${y1}`; const [x, y] = P(a + Math.PI / 16, r * .8); tr += ringAt(+x, +y, r * .095); }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, [x0, y0] = P(a, r * .2), [x1, y1] = P(a, r * .62); tr += `M${x0} ${y0}L${x1} ${y1}`; }
    let foils = ""; for (let i = 0; i < 32; i++) { const a = (i + .5) * Math.PI / 16, [x, y] = P(a, r + 2); foils += `<circle cx="${x}" cy="${y}" r="6.5"/>`; }
    const keys = [0, 1, 2, 3].map((k) => { const a = k * Math.PI / 2 - Math.PI / 2, [x, y] = P(a, R + 4); return `<g transform="translate(${x} ${y}) rotate(${k * 90})"><path d="M-22 6L0 -26L22 6Z" fill="url(#knStone)" stroke="#050304" stroke-width="2"/><path d="M-12 2L0 -14L12 2Z" fill="#2a0a12"/><circle cy="-4" r="3.5" fill="#b0182e"/></g>`; }).join("");
    return `<defs>
        <radialGradient id="knStone" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse" fx="${cx}" fy="${cy}" gradientTransform="translate(${cx - R} ${cy - R}) scale(${2 * R})"><stop offset="0" stop-color="#3a1a20"/><stop offset=".86" stop-color="#2a1418"/><stop offset=".93" stop-color="#1a0c10"/><stop offset="1" stop-color="#070304"/></radialGradient>
        <radialGradient id="knRimLight" cx="${cx}" cy="${cy}" r="${r + 14}" gradientUnits="userSpaceOnUse"><stop offset=".86" stop-color="#ff3a55" stop-opacity="0"/><stop offset=".95" stop-color="#ff3a55" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a7a" stop-opacity="0"/></radialGradient>
        <linearGradient id="knLead" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a1a20"/><stop offset=".5" stop-color="#140608"/><stop offset="1" stop-color="#2a0e14"/></linearGradient>
        <linearGradient id="knGl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".35" stop-color="#fff" stop-opacity=".02"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#ffd6dc" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="knGv" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${R + 26}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="22"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#knGv)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff5060" opacity=".04"/>
      <path d="${tr}" fill="none" stroke="#050203" stroke-width="5" stroke-linejoin="round"/>
      <path d="${tr}" fill="none" stroke="url(#knLead)" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="${tr}" fill="none" stroke="#c84a5a" stroke-opacity=".28" stroke-width=".9" transform="translate(-.8 -.8)"/>
      <!-- まんなかは空洞（宝石なし。窓ごしに月が見える） -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#knGl)"/>
      <path d="M${f1(cx - r * .64)} ${f1(cy - r * .46)}Q${f1(cx - r * .22)} ${f1(cy - r * .9)} ${f1(cx + r * .32)} ${f1(cy - r * .8)}" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="12" stroke-linecap="round"/>
      ${stones}
      <path d="${joints}" stroke="#050203" stroke-width="1.6" opacity=".9"/>
      <path d="${circ(R)}" fill="none" stroke="#050203" stroke-width="4"/><path d="${circ(R - 6)}" fill="none" stroke="#4a2a30" stroke-opacity=".6" stroke-width="1.2"/>
      <path d="${circ(r + 8)}" fill="none" stroke="#050203" stroke-width="3"/>
      <g fill="#140a0d" stroke="#050203" stroke-width="1.5">${foils}</g>
      <circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="url(#knRimLight)" stroke-width="28"/>
      ${keys}
      <path d="M${f1(cx - R * .72)} ${f1(cy + R * .9)}H${f1(cx + R * .72)}l30 18v10H${f1(cx - R * .72 - 30)}v-10Z" fill="#160b0e" stroke="#050203" stroke-width="2"/><path d="M${f1(cx - R * .72 - 30)} ${f1(cy + R * .9 + 18)}H${f1(cx + R * .72 + 30)}" stroke="#5a1a24" stroke-width="1.5"/>`;
  }
  // 部屋の奥の壁（黒）。うっすら赤い模様のパネル
  const darkWall = (A, W, floor) => `<div style="inset:0;background:linear-gradient(180deg,#040203 0%,#0d0608 40%,#140a0c 72%,#0a0506 ${floor / 10}%);"></div>
    <div style="left:0;right:0;top:${(floor - 380) / 10}%;height:38%;background:repeating-linear-gradient(90deg,rgba(0,0,0,.45) 0 .18cqw,transparent .18cqw ${f1(2000 / W)}cqw),radial-gradient(ellipse 50% 60% at 50% 50%,rgba(90,8,24,.25),transparent),linear-gradient(180deg,#120709,#1a0c0f);box-shadow:inset 0 .3cqw 0 #3a0c16,inset 0 .5cqw 0 #070304"></div>
    <div style="left:0;right:0;top:${floor / 10}%;bottom:0;background:linear-gradient(180deg,#120a0c,#050304 60%,#020101)"></div>`;

  // 窓の穴のあいた壁（SVG。穴は fill-rule="evenodd" であける）。CSS のマスクはスマホで歩くたびに描きなおされてチラつくので使わない
  function wallSVG(id, W, floor, holes) {
    const h = holes.join(""), pt = floor - 380;
    return `<svg viewBox="0 0 ${W} 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><defs>
      <linearGradient id="${id}B" x1="0" y1="0" x2="0" y2="${floor}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#040203"/><stop offset=".4" stop-color="#0d0608"/><stop offset=".72" stop-color="#140a0c"/><stop offset="1" stop-color="#0a0506"/></linearGradient>
      <linearGradient id="${id}P" x1="0" y1="${pt}" x2="0" y2="${floor}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#120709"/><stop offset="1" stop-color="#1a0c0f"/></linearGradient>
      <pattern id="${id}S" width="20" height="1000" patternUnits="userSpaceOnUse"><rect width="1.8" height="1000" fill="#000" fill-opacity=".45"/></pattern>
      <linearGradient id="${id}F" x1="0" y1="${floor}" x2="0" y2="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#120a0c"/><stop offset=".6" stop-color="#050304"/><stop offset="1" stop-color="#020101"/></linearGradient></defs>
      <path fill-rule="evenodd" fill="url(#${id}B)" d="M0 0H${W}V${floor}H0Z${h}"/>
      <clipPath id="${id}C"><rect y="${pt}" width="${W}" height="${floor - pt}"/></clipPath>
      <g clip-path="url(#${id}C)"><path fill-rule="evenodd" fill="url(#${id}P)" d="M0 ${pt}H${W}V${floor}H0Z${h}"/>
      <path fill-rule="evenodd" fill="url(#${id}S)" d="M0 ${pt}H${W}V${floor}H0Z${h}"/></g>
      <rect y="${pt}" width="${W}" height="3" fill="#3a0c16"/><rect y="${pt + 3}" width="${W}" height="2" fill="#070304"/>
      <rect y="${floor}" width="${W}" height="${1000 - floor}" fill="url(#${id}F)"/></svg>`;
  }
  const circlePath = (cx, cy, r) => `M${f1(cx - r)} ${cy}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
  // 遠くの景色の層（壁のうしろ）。transform だけで動かすので、歩いても描きなおしがなく軽い
  const farLayer = (id, W, scene) => `<div class="kn-far" id="${id}"><svg viewBox="0 0 ${W} 1000" preserveAspectRatio="none" aria-hidden="true">${scene}</svg></div>`;

  // 窓から差しこむ赤い月の光：光の柱と、床に落ちる光だまり。窓わく（桟・トレーサリー）のかげも、同じ形でうつす。
  // 動かない絵なので一度だけ描かれ、軽い
  function moonLight(C, MY, MR, LW, RW, FLOOR) {
    const r = MR - 34, fy = FLOOR + 70, k = .22;               // 床の光だまり：丸窓をつぶした楕円（k＝たての縮み）
    const ell = (rr) => `M${f1(C - rr)} ${fy}a${f1(rr)} ${f1(rr * k)} 0 1 0 ${f1(2 * rr)} 0a${f1(rr)} ${f1(rr * k)} 0 1 0 ${f1(-2 * rr)} 0Z`;
    const Pf = (a, rr) => `${f1(C + Math.cos(a) * rr)} ${f1(fy + Math.sin(a) * rr * k)}`;
    let sh = ell(r * .2) + ell(r * .62);
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; sh += `M${Pf(a, r * .62)}L${Pf(a, r * .98)}`; }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sh += `M${Pf(a, r * .2)}L${Pf(a, r * .62)}`; }
    // 光の柱：丸窓の円と床の光だまりをつなぐ形。かげは、窓わく（放射の桟と輪）を窓から床へうつした形
    const Pw = (a, rr) => `${f1(C + Math.cos(a) * rr)} ${f1(MY + Math.sin(a) * rr)}`, Pt = (a, rr, t) => `${f1(C + Math.cos(a) * rr * (1 + .15 * t))} ${f1(MY + (fy - MY) * t + Math.sin(a) * rr * (1 - (1 - k) * t))}`;
    let streaks = ""; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; streaks += `M${Pw(a, r * .98)}L${Pt(a, r * .98, 1)}`; }
    let rings = ""; [.35, .7].forEach((t) => { [.62, .98].forEach((q) => { let d = ""; for (let i = 0; i <= 32; i++) { const a = i * Math.PI / 16; d += (i ? "L" : "M") + Pt(a, r * q, t); } rings += d; }); });
    const archPool = (x, y, w, b) => { const cx = x + w / 2, py = FLOOR + 40, pw = w * .95; return `<path d="M${f1(x + 8)} ${b}L${f1(cx - pw / 2 + 40)} ${py}H${f1(cx + pw / 2 + 40)}L${f1(x + w - 8)} ${b}Z" fill="url(#knShaftS)"/><ellipse cx="${f1(cx + 40)}" cy="${py}" rx="${f1(pw / 2)}" ry="${f1(pw * .12)}" fill="url(#knPoolS)"/><path d="M${f1(cx + 40)} ${f1(py - pw * .12)}V${f1(py + pw * .12)}M${f1(cx + 40 - pw / 2)} ${py}H${f1(cx + 40 + pw / 2)}" stroke="#000" stroke-opacity=".45" stroke-width="6"/>`; };
    return `<svg viewBox="0 0 1600 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true">
      <defs><linearGradient id="knShaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3a55" stop-opacity=".2"/><stop offset=".7" stop-color="#ff3a55" stop-opacity=".08"/><stop offset="1" stop-color="#ff3a55" stop-opacity=".16"/></linearGradient>
        <linearGradient id="knShaftS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3a55" stop-opacity=".12"/><stop offset="1" stop-color="#ff3a55" stop-opacity=".03"/></linearGradient>
        <radialGradient id="knPool"><stop offset="0" stop-color="#ff6a7a" stop-opacity=".55"/><stop offset=".7" stop-color="#ff2a48" stop-opacity=".3"/><stop offset="1" stop-color="#ff2a48" stop-opacity="0"/></radialGradient>
        <linearGradient id="knShH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff"/><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="knShM" maskUnits="userSpaceOnUse" x="${f1(C - r * 1.3)}" y="${f1(MY - r)}" width="${f1(r * 2.6)}" height="${f1(fy - MY + r + 40)}"><rect x="${f1(C - r * 1.3)}" y="${f1(MY - r)}" width="${f1(r * 2.6)}" height="${f1(fy - MY + r + 40)}" fill="url(#knShH)"/></mask>
        <radialGradient id="knPoolS"><stop offset="0" stop-color="#ff4a60" stop-opacity=".35"/><stop offset="1" stop-color="#ff2a48" stop-opacity="0"/></radialGradient></defs>
      <g mask="url(#knShM)"><path d="M${f1(C - r * .98)} ${MY}L${f1(C - r * 1.13)} ${fy}A${f1(r * 1.13)} ${f1(r * k)} 0 0 0 ${f1(C + r * 1.13)} ${fy}L${f1(C + r * .98)} ${MY}A${f1(r * .98)} ${f1(r * .98)} 0 0 0 ${f1(C - r * .98)} ${MY}Z" fill="url(#knShaft)"/>
      <path d="${streaks}" stroke="#000" stroke-opacity=".28" stroke-width="6" fill="none"/><path d="${rings}" stroke="#000" stroke-opacity=".12" stroke-width="5" fill="none"/></g>
      <path d="${ell(r)}" fill="url(#knPool)"/>
      <path d="${sh}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="5"/>
      ${archPool(...LW)}${archPool(...RW)}</svg>`;
  }

  function redmoonHTML() {
    const W = 1600, A = at(W); A.W = W; const C = 800, FLOOR = 860;
    const MR = 300, MY = 410, LW = [233, 258, 234, 720], RW = [1133, 258, 234, 720];
    // 窓の外（遠くの景色）：まんなかに赤い満月、右の窓の向こうに城。壁には窓の穴をあけて、うしろの景色を見せる
    let s = farLayer("knRfar", 1600, outsideScene("knR", 1600, 1000, { moon: { cx: C, cy: MY - 6, r: 172 }, castle: { x: 1262, bottom: 770, h: 370 }, horizon: 660, seed: 5, span: [-700, 2300] }));
    s += `<div class="kn-wall">${wallSVG("knRw", 1600, FLOOR, [circlePath(C, MY, MR - 30), archPath(...LW), archPath(...RW)])}
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><path d="M0 0H1600V120Q1290 40 1110 150Q980 30 800 30Q620 30 490 150Q310 40 0 120Z" fill="#030102"/><path d="M0 120Q310 40 490 150Q620 30 800 30Q980 30 1110 150Q1290 40 1600 120" fill="none" stroke="#4a0a16" stroke-width="3"/></svg></div>`;
    // 床に落ちる、赤い月の光
    s += `<div style="${A(C - 520, FLOOR - 10, 1040, 150)}background:radial-gradient(ellipse 50% 50% at 50% 20%,rgba(255,40,70,.32),rgba(120,0,24,.12) 55%,transparent 72%);"></div>`;
    s += `<div style="${A(C - 260, 140, 520, 760)}background:linear-gradient(180deg,rgba(255,40,70,.0),rgba(255,40,70,.08) 55%,rgba(255,40,70,.0));clip-path:polygon(30% 0,70% 0,100% 100%,0 100%);"></div>`;
    // 窓（まんなかの丸窓と、左右のとがった窓）。窓の外はひとつの景色：まんなかに赤い満月、右の窓の向こうに城
    s += `<svg viewBox="0 0 1600 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs><radialGradient id="knRim" cx="50%" cy="50%" r="50%"><stop offset=".9" stop-color="#1a0b0f"/><stop offset=".97" stop-color="#3a1a20"/><stop offset="1" stop-color="#050304"/></radialGradient>
      <radialGradient id="knHalo" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="#ff2040" stop-opacity=".4"/><stop offset="1" stop-color="#ff2040" stop-opacity="0"/></radialGradient></defs>
      <path d="${circlePath(C, MY, MR + 70)}${circlePath(C, MY, MR)}" fill-rule="evenodd" fill="url(#knHalo)"/>
      ${moonFrame(C, MY, MR)}${archFrame(...LW)}${archFrame(...RW)}</svg>`;
    // 柱
    [130, 545, 1055, 1470].forEach((x) => { s += pillar(A, x, 150, FLOOR); });
    // 赤いカーテン（丸窓の左右）
    s += `<svg viewBox="0 0 1600 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><defs><linearGradient id="knCur" x1="0" x2="1"><stop offset="0" stop-color="#0c0104"/><stop offset=".3" stop-color="#2e040c"/><stop offset=".55" stop-color="#120206"/><stop offset=".8" stop-color="#380610"/><stop offset="1" stop-color="#0a0104"/></linearGradient></defs>
      <path d="M470 90Q520 95 560 92Q575 300 540 470Q520 560 575 860H470Z" fill="url(#knCur)"/><path d="M1130 90Q1080 95 1040 92Q1025 300 1060 470Q1080 560 1025 860H1130Z" fill="url(#knCur)"/>
      <path d="M470 86H580M1020 86H1130" stroke="#0a0506" stroke-width="12" stroke-linecap="round"/><circle cx="548" cy="470" r="9" fill="#8a6a2c"/><circle cx="1052" cy="470" r="9" fill="#8a6a2c"/></svg>`;
    // 床の黒い大理石と、まんなかの細いじゅうたん
    s += `<div style="${A(C - 140, FLOOR + 6, 280, 140)}background:linear-gradient(180deg,#3a0812,#22040a);clip-path:polygon(28% 0,72% 0,100% 100%,0 100%);box-shadow:inset 0 0 0 2px #6a1020;"></div>`;
    // 窓から差しこむ月の光（窓わくのかげ入り）
    s += moonLight(C, MY, MR, LW, RW, FLOOR);
    // 燭台
    s += candelabra(A, 430, FLOOR + 10, 300) + candelabra(A, 1170, FLOOR + 10, 300);
    // カネル（丸窓の前）。ここで場所と大きさを決める：足もとが床、背の高さは 450
    const fh = 470, fw = fh * 362.8 / 350.5;
    // 絵のはばは翼とマントのぶん左右がちがうので、からだのまんなか（KN_CX）が窓のまんなかに来るように置く
    const bodyK = (KN_CX + 4) / 362.8, fx0 = C - fw * bodyK, fy0 = FLOOR + 22 - fh;
    s += `<div class="kn-fig kn-backlit" id="knFig" style="${A(fx0, fy0, fw, fh)}--kn-body:${f1(bodyK * 100)}%"></div>`;
    // カネルのまわり（からだ以外）＝話しかける。からだ＝さわる（圧）。頭＝カネルへの好感度が100ならなでられる
    s += `<button class="kn-talk" id="knTalk" style="${A(C - 270, FLOOR - fh - 30, 540, fh + 50)}" aria-label="カネルに話しかける"></button>`;
    s += `<button class="kn-hit" id="knHit" style="${A(C - 95, FLOOR - fh * .96, 190, fh * .95)}" aria-label="カネルにさわる"></button>`;
    const hx = fx0 + fw * .3, hy = fy0 + fh * .02, hw = fw * .22, hh = fh * .22;
    s += `<button class="kn-hit kn-head" id="knHead" style="${A(hx, hy, hw, hh)}" aria-label="カネルの頭をなでる"></button>`;
    s += MOTES(18, W);
    return s;
  }

  // 床に置いた赤いろうそく（廊下に点々と）：h はろうそくの胴の高さ。火の分だけ高い絵を置く
  const floorCandle = (A, x, bottom, h, i) => `<div style="${A(x - h * .3, bottom - 4, h * .6, 8)}background:#120709;border-radius:50%"></div>` + candleImg(A, x, bottom, h * 2.3, i, 1, true);

  // 本館の西のはしからつづく廊下（館内にそのまま置く）。x＝0 が廊下のいちばん奥（赤い月の間の扉がわ）、CW が本館がわの入り口
  const CORR = { len: 1900, over: 240, fade: 300, door: 560 };
  const CORR_REF = 1460, FAR = .55; // CORR_REF＝廊下の窓のあいだ（ここに立ったときの景色が基準）。FAR＝遠くの景色の動く速さ（館内の何倍か。小さいほど遠い） // door＝奥の壁から扉までの長さ（スマホでも、扉がトルサに隠れずに見える位置まで歩けるように）
  function hallCorridorHTML(CW) {
    const W = CW, A = at(W); A.W = W; const FLOOR = 838;
    // 柱は 60・860・1460・2060。いちばん奥の区画は扉、つぎの2つの区画にひとつずつ窓
    const CWIN = [[1080, 250, 160, 580], [1680, 250, 160, 580]];
    // 窓の外（遠くの景色）：手前の窓から赤い月、奥の窓から城。壁には窓の穴をあけて、うしろの景色を見せる
    let s = farLayer("knCfar", W, outsideScene("knC", W, 1000, { moon: { cx: CORR_REF - 300, cy: 380, r: 175 }, castle: { x: CORR_REF + 330, bottom: 680, h: 540 }, horizon: 560, seed: 9, span: [-1400, W + 1400] }));
    let arches = ""; for (let x = 0; x < W; x += 500) arches += `<path d="M${x} 150Q${x + 250} 30 ${x + 500} 150" fill="none" stroke="#2a060e" stroke-width="3"/>`;
    s += `<div class="kn-wall">${wallSVG("knCw", W, FLOOR, CWIN.map((w) => archPath(...w)))}
      <svg viewBox="0 0 ${W} 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><path d="M0 0H${W}V150${[...Array(Math.ceil(W / 500))].map((_, i) => `Q${W - i * 500 - 250} 30 ${W - (i + 1) * 500} 150`).join("")}Z" fill="#020101"/>${arches}</svg></div>`;
    s += `<svg viewBox="0 0 ${W} 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${CWIN.map((w) => archFrame(...w)).join("")}</svg>`;
    // 窓から床へ落ちる月の光（窓わくの十字のかげ）
    s += `<svg viewBox="0 0 ${W} 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true"><defs><linearGradient id="knCS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3a55" stop-opacity=".12"/><stop offset="1" stop-color="#ff3a55" stop-opacity=".03"/></linearGradient><radialGradient id="knCP"><stop offset="0" stop-color="#ff4a60" stop-opacity=".35"/><stop offset="1" stop-color="#ff2a48" stop-opacity="0"/></radialGradient></defs>
      ${CWIN.map(([x, y, w, b]) => { const cx = x + w / 2 - 70, py = FLOOR + 60; return `<path d="M${x + 6} ${b}L${f1(cx - w * .6)} ${py}H${f1(cx + w * .6)}L${x + w - 6} ${b}Z" fill="url(#knCS)"/><ellipse cx="${f1(cx)}" cy="${py}" rx="${f1(w * .62)}" ry="${f1(w * .14)}" fill="url(#knCP)"/><path d="M${f1(cx)} ${f1(py - w * .14)}V${f1(py + w * .14)}M${f1(cx - w * .62)} ${py}H${f1(cx + w * .62)}" stroke="#000" stroke-opacity=".45" stroke-width="5"/>`; }).join("")}</svg>`;
    [60, 860, 1460, 2060].forEach((x) => { s += pillar(A, x, 150, FLOOR, 46); });
    [860, 1460, 2060].forEach((x, i) => { s += `<div style="${A(x - 20, 470, 40, 10)}background:linear-gradient(#3a2a2e,#0b0708);border-radius:3px;"></div><div style="${A(x - 4, 478, 8, 46)}background:linear-gradient(90deg,#0b0708,#2a1e22,#0b0708);"></div>` + candleImg(A, x, 472, 66, i); });
    // 床の細い黒いじゅうたんと、点々とつづく赤いろうそく（奥の扉へ向かって）
    s += `<div style="${A(0, FLOOR + 40, W, 46)}background:linear-gradient(180deg,#1a0609,#0c0305);border-top:.1cqw solid #3a0a14;border-bottom:.1cqw solid #3a0a14;"></div>`;
    let i = 0;
    for (let x = W - 160; x > CORR.door + 170; x -= 130 + Math.round(Math.sin(x) * 22)) { const h = 24 + (1 - x / W) * 20 + (i % 3) * 4; s += floorCandle(A, x, FLOOR + 30 + (i % 2) * 40, h, i); i++; }
    // いちばん奥：赤い月の間の扉
    const dx = CORR.door, dw = 230, dh = 430;
    s += `<div class="kn-glow" style="${A(dx - 200, FLOOR - 420, 400, 460)}"></div>`;
    [dx - 165, dx + 165].forEach((x, k) => { s += floorCandle(A, x, FLOOR + 28, 58, k + 20); });
    s += `<button class="kn-door" id="knDoor" style="${A(dx - dw / 2, FLOOR - dh, dw, dh + 6)}" aria-label="${esc(((CFG && CFG.rooms.redmoon) || {}).name || "赤い月の間")}への扉"><svg viewBox="0 0 240 446" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="knDr" x1="0" x2="1"><stop offset="0" stop-color="#050304"/><stop offset=".5" stop-color="#1c1215"/><stop offset="1" stop-color="#050304"/></linearGradient><radialGradient id="knDm" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff8a90"/><stop offset=".6" stop-color="#d0102a"/><stop offset="1" stop-color="#5a0010"/></radialGradient></defs>
      <path d="M0 446V120Q0 0 120 0Q240 0 240 120V446Z" fill="#0b0607" stroke="#4a0a16" stroke-width="4"/><path d="M16 440V126Q16 18 120 18Q224 18 224 126V440Z" fill="url(#knDr)"/>
      <path d="M120 18V440" stroke="#000" stroke-width="4"/><g fill="none" stroke="#2c1e22" stroke-width="3"><path d="M34 180h70v230H34zM136 180h70v230h-70z"/></g>
      <circle cx="120" cy="104" r="40" fill="#0a0506" stroke="#6a1020" stroke-width="3"/><circle class="kn-door-glow" cx="120" cy="104" r="30" fill="url(#knDm)"/>
      <circle cx="100" cy="300" r="6" fill="#8a6a2c"/><circle cx="140" cy="300" r="6" fill="#8a6a2c"/>
      <rect class="kn-door-glow" x="20" y="438" width="200" height="8" fill="#ff2040" opacity=".6"/></svg></button>`;
    s += `<span class="kn-sign" style="left:${f1(dx / W * 100)}%;top:${f1((FLOOR - dh - 8) / 10)}%">${esc(((CFG && CFG.rooms.redmoon) || {}).name || "赤い月の間")}</span>`;
    // 奥の壁（扉の左）と、館とのつなぎめ（石のアーチ。右へ行くほど館の暗がりにとける）
    s += `<div style="${A(0, 0, 60, 1000)}background:linear-gradient(90deg,#020101,rgba(2,1,1,0));"></div>`;
    s += MOTES(6, W);
    return s;
  }

  /* =========================================================
     部屋に入る・出る（index.html の enterRoom から呼ばれる）
     ========================================================= */
  /* ---------- カネルへの好感度（画面には出ない。とても上がりにくい） ----------
     kaneru.json の kaneruAffinity：gain＝ふえる量（talk＝話しかける・visit＝赤い月の間に来る（1日1回））、cooldownSec＝続けてふえるまでの待ち時間、
     touch＝さわったとき（マイナスにすると減る）、patFrom＝この値から頭をなでられる（カネルは何も反応しない） */
  const KAFF = () => (CFG && CFG.kaneruAffinity) || {};
  const kaff = () => Math.max(0, Math.min(100, K().aff || 0));
  function kLike(kind) {
    const A = KAFF(), g = (A.gain || {})[kind]; if (!g) return;
    const k = K(), now = Date.now(); k.affCool ||= {};
    if (kind === "visit") { const day = new Date().toDateString(); if (k.affDay === day) return; k.affDay = day; }
    else if (now - (k.affCool[kind] || 0) < ((A.cooldownSec || {})[kind] || 0) * 1000) return;
    k.affCool[kind] = now; k.aff = Math.max(0, Math.min(100, Math.round((kaff() + g) * 100) / 100)); ctx.save();
    cls().toggle("kn-patok", kaff() >= (A.patFrom ?? 100));
  }
  window.__kaneruAff = (n) => { if (n != null) { K().aff = +n; ctx.save(); cls().toggle("kn-patok", kaff() >= (KAFF().patFrom ?? 100)); } return kaff(); }; // 確認用
  /* ---------- 話しかける ----------
     カネルが左に出てきて、ひとこと返す →《ほかに話すことでもあるのか。》→ タップすると、ほかの話も聞ける。
     しばらく何もしないと《もうないなら、もどるぞ。》で元の場所へもどる。
     何度も呼びだすと、しばらく反応しなくなる（kaneru.json の kaneru.talkLimit） */
  const CONV = { on: false, seen: [], waitT: 0, step: 0 };
  const summons = [];
  const KT = (k, d) => ((CFG && CFG.kaneru && CFG.kaneru[k]) || d);
  function talkTo(fig) {
    if (CONV.on) { convNext(fig); return; }
    if (performance.now() < pressCool || EV.on) return;
    const lim = KT("talkLimit", { count: 4, minutes: 5 }), now = Date.now();
    while (summons.length && now - summons[0] > lim.minutes * 60000) summons.shift();
    if (summons.length >= lim.count) {
      // 呼びすぎ：カネルは反応しない。トルサがときどきしょんぼり
      if (Math.random() < .5) { const t = KT("talkIgnoredTorsa", []); if (t.length) ctx.say(pick(t), 4200); }
      return;
    }
    summons.push(now);
    const tiers = (KT("talk", [])).filter((t) => kaff() >= (t.min || 0));
    const tier = tiers[tiers.length - 1]; if (!tier || !(tier.lines || []).length) return;
    kLike("talk");
    CONV.on = true; CONV.tier = tier; CONV.seen = []; CONV.fig = fig;
    clearTimeout(goT); approach(fig, true);
    setTimeout(() => convSay(), reduced ? 0 : 450);
    addEventListener("pointerdown", convTap, true);
  }
  function convSay() {
    if (!CONV.on) return;
    const rest = CONV.tier.lines.filter((l) => !CONV.seen.includes(l));
    if (!rest.length) { convEnd(pick(KT("talkEnd", ["……もう話すことはない。"]))); return; }
    const line = pick(rest); CONV.seen.push(line);
    teleShow(line, true, 60000);
    clearTimeout(CONV.waitT);
    // 少したってから「ほかに話すことでもあるのか」
    CONV.waitT = setTimeout(() => {
      if (!CONV.on) return;
      teleShow(pick(KT("talkAsk", ["ほかに話すことでもあるのか。"])), true, 60000, "（タップすると、ほかの話を聞けます）");
      CONV.asking = true;
      CONV.waitT = setTimeout(() => convEnd(pick(KT("talkBye", ["もうないなら、もどるぞ。"]))), (KT("talkWaitSec", 7)) * 1000);
    }, reduced ? 1800 : 2600);
    CONV.asking = false;
  }
  function convNext() { if (!CONV.on) return; if (!CONV.asking) return; CONV.asking = false; clearTimeout(CONV.waitT); convSay(); }
  function convTap(e) {
    if (!CONV.on) return;
    if (e.target.closest && e.target.closest(".topbar, #palette, .room-ui, .torsa, button:not(#knTalk):not(#knHit):not(#knHead)")) return;
    if (CONV.asking) { e.preventDefault(); e.stopPropagation(); convNext(); }
  }
  function convEnd(byeLine) {
    if (!CONV.on) return;
    clearTimeout(CONV.waitT); removeEventListener("pointerdown", convTap, true);
    teleShow(byeLine, true, 2600);
    const fig = CONV.fig, tier = CONV.tier; CONV.on = false; CONV.asking = false;
    goT = setTimeout(() => { if (fig && fig.isConnected) approach(fig, false); }, 1900);
    if (tier && tier.torsa && tier.torsa.length && Math.random() < (tier.torsaChance ?? .35)) setTimeout(() => { if (ROOMNOW === "redmoon") ctx.say(pick(tier.torsa), 5000); }, 3400);
  }
  function convStop() { if (!CONV.on) return; clearTimeout(CONV.waitT); removeEventListener("pointerdown", convTap, true); CONV.on = false; CONV.asking = false; }
  // 頭をなでる（好感度が100のときだけ）：カネルは何も反応しない。トルサは、はじめてのときだけびっくりする
  let patSaid = false;
  function patHead(e) {
    SFX.play("pat");
    if (!patSaid) { patSaid = true; setTimeout(() => { if (ROOMNOW === "redmoon") torsaSay("patKaneru"); }, 900); }
  }

  let ROOMNOW = null, idleT = 0, murmurT = 0;
  const ROOMS = {
    redmoon: { html: redmoonHTML, stage: "", center: .5, back: null, ratio: 1600 }
  };
  function mount(id, stage) {
    ROOMNOW = id; clearTimeout(idleT); clearTimeout(murmurT);
    const back = ROOMS[id].back;
    if (back) $("roomBackTo").textContent = ((CFG && CFG.rooms[back]) || {}).name + "へもどる";
    if (id === "redmoon") {
      const fig = stage.querySelector("#knFig"), hit = stage.querySelector("#knHit");
      mountFigure(fig);
      // 窓の外の景色は、部屋を横に見わたすと、少し遅れて動く
      const sc = $("roomScroll"), par = stage.querySelector("#knRfar");
      const onScroll = () => { if (!par.isConnected) { sc.removeEventListener("scroll", onScroll); return; } const k = stage.offsetWidth / 1600, cx = (sc.scrollLeft + sc.clientWidth / 2) / k; par.style.transform = `translate3d(${f1((1 - FAR) * (cx - 800) * k)}px,0,0)`; };
      sc.addEventListener("scroll", onScroll, { passive: true }); requestAnimationFrame(onScroll);
      // カネルが話すために左へ出ているあいだは、元の場所（からっぽ）をさわっても反応しない
      const away = () => !!document.querySelector("body > .kn-body.kn-away") || CONV.on;
      hit.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); if (away()) return; pressure(e, fig); });
      const talkEl = stage.querySelector("#knTalk"), head = stage.querySelector("#knHead");
      talkEl.addEventListener("click", (e) => { e.stopPropagation(); talkTo(fig); });
      head.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); if (away()) return; if (kaff() >= (KAFF().patFrom ?? 100)) patHead(e); else pressure(e, fig); });
      head.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (kaff() >= (KAFF().patFrom ?? 100)) patHead(); else pressure(null, fig); } });
      head.addEventListener("click", (e) => e.stopPropagation());
      cls().toggle("kn-patok", kaff() >= (KAFF().patFrom ?? 100));
      kLike("visit");
      hit.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pressure(null, fig); } });
      hit.addEventListener("click", (e) => e.stopPropagation());
      // マウスが近づくと、少しだけ視線をよこす
      hit.addEventListener("pointermove", (e) => { if (!FIG) return; const r = hit.getBoundingClientRect(); FIG.look((e.clientX - (r.left + r.width / 2)) / r.width); });
      hit.addEventListener("pointerleave", () => FIG && FIG.look(0));
      setTimeout(() => { if (ROOMNOW !== "redmoon") return; torsaSay("enterRedmoon"); setTimeout(() => { if (ROOMNOW === "redmoon") torsaSay("afterEnterRedmoon"); }, 5200); }, 1200);
      scheduleMurmur(20000);
    }
  }
  function scheduleMurmur(ms) {
    clearTimeout(murmurT);
    murmurT = setTimeout(() => {
      if (ROOMNOW !== "redmoon") return;
      const k = (CFG && CFG.kaneru) || {};
      if ((k.murmur || []).length && Math.random() < (k.murmurChance ?? .25) && !ctx.busy() && !CONV.on) { const m = pick(k.murmur); comeAndGo($("knFig"), 5400); setTimeout(() => teleShow(m, true), reduced ? 0 : 600); }
      scheduleMurmur(40000 + Math.random() * 30000);
    }, ms);
  }
  function unmount() { convStop(); clearTimeout(goT); const tb = document.querySelector(".kn-tele"); if (tb) tb.classList.remove("show"); if (ROOMNOW === "redmoon") dropFigure(); ROOMNOW = null; clearTimeout(murmurT); }

  /* =========================================================
     本館の西のはし：西の書館への扉より左が少しずつ暗くなり、そのまま赤いろうそくの廊下がつづき、
     いちばん奥に赤い月の間の扉がある（イベントのあとに現れる）
     ========================================================= */
  // 遠くの景色（窓の外）は、歩いても少し遅れてついてくる（館内より FAR 倍の速さで動く）
  window.__knPar = (camX, scale) => {
    const g = CORRX.far; if (!g || !g.isConnected) return;
    // 廊下が画面から遠いときは、廊下ごと描かない（軽くする）
    const vis = camX < CORRX.xA + CORR.len + CORR.over + 1400;
    if (vis !== CORRX.vis) { CORRX.vis = vis; CORRX.el.style.visibility = vis ? "" : "hidden"; }
    if (!vis) return;
    const dx = (1 - FAR) * (camX - (CORRX.xA + CORR_REF)) * (scale || 1);
    g.style.transform = `translate3d(${f1(dx)}px,0,0)`;
  };
  const CORRX = { xA: 0 };
  function addCorridor() {
    if (!unlocked() || ctx.hall() !== "main" || document.querySelector("#knTop .kn-corr")) return;
    const W = ctx.world(), CW = CORR.len + CORR.over, xA = W.L - CORR.len; CORRX.xA = xA;
    // 本館の西のはし：西の書館への扉より左は、少しずつ暗くなっていき、そのまま赤い廊下になる
    const d0 = W.doors.find((x) => x.side === "west"), duskR = d0 ? d0.x - 140 : W.L + 300;
    const dusk = document.createElement("div"); dusk.className = "kn-dusk";
    dusk.style.cssText = `left:${((W.L - 40 - W.L) / W.W) * 100}%;width:${((duskR - W.L + 40) / W.W) * 100}%;background:linear-gradient(90deg,rgba(8,2,6,.96),rgba(20,4,10,.78) 35%,rgba(30,6,14,.35) 75%,rgba(30,6,14,0))`;
    $("knTop").appendChild(dusk);
    const el = document.createElement("div");
    el.className = "kn-corr"; el.setAttribute("aria-label", (((CFG && CFG.rooms.corridor) || {}).name || "廊下"));
    el.style.cssText = `left:${((xA - W.L) / W.W) * 100}%;width:${(CW / W.W) * 100}%`;
    // 館とのつなぎめ：廊下の右のはしは、だんだん透けて、館の暗がりにとけこむ
    el.innerHTML = hallCorridorHTML(CW) + `<div style="right:0;top:0;bottom:0;width:${(CORR.fade / CW * 100).toFixed(2)}%;background:linear-gradient(90deg,rgba(7,3,5,0),rgba(8,3,7,.85) 60%,rgba(8,2,6,.96))"></div>`;
    $("knTop").appendChild(el); CORRX.far = el.querySelector("#knCfar"); CORRX.el = el; CORRX.vis = undefined;
    const door = el.querySelector("#knDoor");
    door.addEventListener("click", () => { SFX.play("hover"); ctx.cancelWalk(); torsaSay("doorRedmoon"); setTimeout(() => ctx.enterRoom("redmoon", door), 900); });
    // 廊下のいちばん奥まで歩けるようにする（扉が画面に入るところまで）
    ctx.reachWest(xA, xA + CORR.door);
    // 場所の名前と、そこでのトルサのひとこと
    const H = (ctx.DATA.library.halls || {}).main || {}, Z = H.zones || ctx.DATA.library.zones, nm = ((CFG && CFG.rooms.corridor) || {}).name || "赤い月の間への廊下";
    if (Z && !Z.some((z) => z.kn)) Z.unshift({ name: nm, to: W.L, kn: true });
    const zl = (ctx.DATA.torsa.lines.zone ||= {}); if (!zl[nm]) zl[nm] = torsaLines("enterCorridor");
  }

  /* =========================================================
     イベント：好感度100で、本館が赤く染まり、月の窓の前にカネルが現れる
     ========================================================= */
  const EV = { on: false, i: 0, named: false, timers: [], typing: 0, els: [], replay: false };
  let hereSince = 0;
  // 確認用：URL の最後に ?kaneru を付けて開くと、好感度に関係なく、入館して本館に少しいるとイベントが起こる
  const TEST = /[?&]kaneru\b/.test(location.search) || window.__kaneruTest === true;
  let testDone = false;
  let lastHall = null;
  function check() {
    if (!CFG || EV.on || !ctx.ready()) return;
    if (EV.staged && (ctx.hall() !== "main" || ctx.inRoom() || ctx.moving())) { unstage(); hereSince = 0; return; }
    if (EV.staged) return;
    // 棟や部屋を移っている最中・移った直後は数えなおす（移動と同時に起こって、ほかの棟でイベントが始まらないように）
    if (ctx.moving() || ctx.hall() !== lastHall) { lastHall = ctx.hall(); hereSince = 0; return; }
    const tr = CFG.trigger || {};
    if (TEST && !testDone && ctx.hall() === "main" && !ctx.inRoom() && !ctx.busy()) { if (!hereSince) hereSince = performance.now(); if (performance.now() - hereSince > 4000) { testDone = true; stage(); } return; }
    if (ctx.hall() !== (tr.hall || "main") || ctx.inRoom() || K().seen || ctx.affinity() < (tr.affinity ?? 100)) { hereSince = 0; return; }
    if (ctx.busy()) return;
    if (!hereSince) hereSince = performance.now();
    if (performance.now() - hereSince > (tr.delaySec ?? 6) * 1000) stage();
  }
  setInterval(check, 1500);

  function mk(tag, cl, parent = document.body) { const e = document.createElement(tag); e.className = cl; parent.appendChild(e); EV.els.push(e); return e; }
  // 会話の箱の設定（event/events.js と同じ名前）
  const BOX_VARS = {
    color: "--ev-box", ink: "--ev-ink", line: "--ev-line", ring: "--ev-ring", ring2: "--ev-ring2", shadow: "--ev-shadow",
    nameBg: "--ev-name-bg", nameInk: "--ev-name-ink", choice: "--ev-choice", choiceHover: "--ev-choice-hover", next: "--ev-next",
    font: "--ev-font", narrFont: "--ev-narr-font", fontSize: "--ev-fs", fontSizePhone: "--ev-fs-sp", lineHeight: "--ev-lh",
    radius: "--ev-radius", padding: "--ev-pad", paddingPhone: "--ev-pad-sp", minHeight: "--ev-minh", minHeightPhone: "--ev-minh-sp",
    maxWidth: "--ev-maxw", lift: "--ev-lift", glow: "--kn-glow"
  };
  const pxv = (v) => (typeof v === "number" ? v + "px" : v);
  function applyBox(el, bx) { Object.entries(BOX_VARS).forEach(([k, v]) => { if (bx[k] !== undefined && bx[k] !== "") el.style.setProperty(v, k === "lineHeight" ? String(bx[k]) : pxv(bx[k])); else el.style.removeProperty(v); }); }
  // 全イベント共通の箱（event/events.json の "box"）。なければ kaneru.json の "box" だけ
  let commonBox = null;
  const commonBoxP = () => (commonBox ? Promise.resolve(commonBox) : fetch("event/events.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((j) => (commonBox = (j && j.box) || {})));

  function play(id, opt = {}) {
    if (!CFG || EV.on || id !== CFG.event.id) return false;
    if (ctx.moving()) { setTimeout(() => play(id, opt), 800); return true; }
    // 本館の月の窓の前で起こる。ほかの場所にいたら、本館へ移ってから
    if (ctx.inRoom() || ctx.hall() !== "main") {
      ctx.goHall("main");
      const t0 = performance.now(), wait = setInterval(() => { if (ctx.hall() === "main" && !ctx.inRoom() && !$("curtain").classList.contains("on")) { clearInterval(wait); setTimeout(() => play(id, opt), 600); } else if (performance.now() - t0 > 15000) clearInterval(wait); }, 300);
      return true;
    }
    const staged = !!(opt.staged && EV.staged);
    EV.on = true; EV.i = staged ? (CFG.event.stagedStart ?? 0) : 0; EV.named = false; EV.replay = !!opt.replay;
    if (!staged) { unstage(); EV.els = []; }
    EV.staged = false;
    ctx.cancelWalk(); ctx.stopGaze(); ctx.lookAt(ctx.windowX()); ctx.hideBubble();
    cls().add("in-event", "kn-live");
    if (staged) { EV.fig.style.pointerEvents = ""; EV.fig.classList.remove("kn-callable"); const c = EV.fig.querySelector(".kn-call"); if (c) c.remove(); }
    else makeHallScene();
    // 会話の箱（event/events.js と同じ形）
    const root = EV.root = mk("div", "kn-ev");
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "イベント"); root.tabIndex = -1;
    root.innerHTML = `<div class="kn-ui"><div class="kn-box"><span class="kn-name"></span><div class="kn-tools"><button type="button" class="kn-hide">吹き出し非表示</button><button type="button" class="kn-skip">スキップ</button></div><p class="kn-text" aria-live="polite"></p><span class="kn-next" hidden>▼</span></div></div><p class="kn-hint">どこかをタップすると、吹き出しがもどります</p>`;
    root.addEventListener("click", (e) => {
      if (e.target.closest(".kn-tools")) return;
      if (root.classList.contains("ui-off")) { root.classList.remove("ui-off"); return; }
      next();
    });
    root.querySelector(".kn-hide").addEventListener("click", () => root.classList.add("ui-off"));
    root.querySelector(".kn-skip").addEventListener("click", () => finish());
    addEventListener("keydown", onKey, true);
    loadRig().catch(() => {});
    commonBoxP().then((cb) => {
      EV.box = { ...cb, ...((CFG && CFG.box) || {}) };
      EV.boxK = { ...EV.box, ...((CFG && CFG.boxKaneru) || {}) };
      applyBox(root, EV.box);
      setTimeout(() => { if (!EV.on) return; root.classList.add("talking"); show(); root.focus({ preventScroll: true }); }, 900);
    });
    return true;
  }
  // 館を赤く染める層と、月の窓の前のカネル（館内の位置に合わせて、毎フレーム置きなおす）
  function makeHallScene() {
    const hall = $("hall");
    EV.red = mk("div", "kn-red", hall); EV.red2 = mk("div", "kn-red2", hall);
    EV.fig = mk("div", "kn-fig kn-hidden kn-ev-fig", hall);
    const fh = 400, fw = fh * 362.8 / 350.5, bodyK = (KN_CX + 4) / 362.8;
    EV.fig.style.setProperty("--kn-body", f1(bodyK * 100) + "%");
    let lastKey = "", lastS = -1;
    EV.fig.style.left = "0px"; EV.fig.style.top = "0px"; EV.fig.style.willChange = "transform";
    // 位置は transform で動かす（left/top を毎フレーム変えると、館の並べなおしが起きて重い）。大きさは変わったときだけ
    const follow = () => {
      if (!EV.fig || !EV.fig.isConnected) return;
      const p = ctx.toScreen(ctx.windowX() - fw * bodyK, 852 - fh), key = `${f1(p.x)},${f1(p.y)},${p.s.toFixed(4)}`;
      if (key !== lastKey) {
        lastKey = key;
        if (p.s !== lastS) { lastS = p.s; EV.fig.style.width = f1(fw * p.s) + "px"; EV.fig.style.height = f1(fh * p.s) + "px"; }
        EV.fig.style.transform = `translate3d(${f1(p.x)}px, ${f1(p.y)}px, 0)`;
      }
      requestAnimationFrame(follow);
    };
    follow();
  }
  /* ---------- 好感度100：まず本館が赤く染まり、月の窓の前にカネルが立っている。話しかけるとイベントが始まる ---------- */
  function stage() {
    if (EV.staged || EV.on) return;
    EV.staged = true; EV.els = [];
    makeHallScene();
    FX_STEP.redden();
    FX_STEP.appear(true);
    EV.fig.classList.add("kn-callable");
    const call = document.createElement("button"); call.className = "kn-call"; call.type = "button";
    call.setAttribute("aria-label", "月の窓の前の人に話しかける"); call.innerHTML = `<span>話しかける</span>`;
    EV.fig.appendChild(call);
    const go = (e) => { e.preventDefault(); e.stopPropagation(); if (EV.staged && !EV.on) play(CFG.event.id, { staged: true }); };
    call.addEventListener("click", go); call.addEventListener("pointerdown", (e) => e.stopPropagation());
    setTimeout(() => { if (EV.staged && !EV.on) torsaSay("stagedHint", 6000); }, 2600);
  }
  function unstage() {
    if (!EV.staged || EV.on) return;
    EV.staged = false; EV.redOn = false; document.body.classList.remove("kn-redhall");
    const els = EV.els; EV.els = [];
    els.forEach((e) => { e.classList.remove("on"); });
    setTimeout(() => els.forEach((e) => e.remove()), 1200);
    dropFigure();
  }
  function onKey(e) {
    if (!EV.on) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); if (EV.root.classList.contains("ui-off")) EV.root.classList.remove("ui-off"); else next(); }
    else if (e.key === "h" || e.key === "H") { e.stopPropagation(); EV.root.classList.toggle("ui-off"); }
    else if (/^Arrow|^[aAdD]$/.test(e.key)) e.stopPropagation();
  }
  function show() {
    const st = CFG.event.steps[EV.i]; if (!st) { finish(); return; }
    if (st.fx && FX_STEP[st.fx]) FX_STEP[st.fx]();
    const who = st.who || "narration", box = EV.root.querySelector(".kn-box");
    box.classList.toggle("narr", who === "narration");
    box.classList.toggle("notice", who === "notice");
    box.classList.toggle("tele", who === "kaneru");
    applyBox(EV.root, who === "kaneru" ? EV.boxK : EV.box);
    const name = box.querySelector(".kn-name");
    name.innerHTML = who === "torsa" ? esc(ctx.torsaName()) : who === "kaneru" ? `${esc(NAME())}<small>心に響く声</small>` : who === "notice" ? "お知らせ" : "";
    const text = who === "kaneru" ? tele(st.text) : st.text;
    if (who === "torsa") ctx.setFace(st.face || "normal", 0);
    if (who === "kaneru") SFX.play("telepathy");
    if (who === "notice") SFX.play("sparkle");
    // カネルが話しかけてくるときは、トルサの反対側（左）へ出てくる
    if (who === "kaneru" && FIG && EV.fig && !document.querySelector("body > .kn-body")) approach(EV.fig, true);
    // 文字をひとつずつ出す（event/events.js と同じ速さ。カネルは声を出さないので「ぽぽぽ」は鳴らさず、にじむように浮かびあがる）
    const el = box.querySelector(".kn-text"), chars = Array.from(text);
    el.setAttribute("aria-label", text);
    el.innerHTML = chars.map((c) => `<span class="ch" aria-hidden="true">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
    const spans = el.querySelectorAll(".ch"), nx = box.querySelector(".kn-next");
    nx.hidden = true; clearInterval(EV.typing); EV.typing = 0;
    const done = () => { clearInterval(EV.typing); EV.typing = 0; spans.forEach((x) => x.classList.add("on")); nx.hidden = false; };
    if (reduced) { done(); return; }
    let n = 0; const gap = who === "kaneru" ? 90 : 34;
    EV.typing = setInterval(() => {
      if (spans[n]) { spans[n].classList.add("on"); if (who === "torsa" && n % 2 === 0 && /[^\s…。、・（）「」！？]/.test(spans[n].textContent)) SFX.blip && SFX.blip(11); }
      n++; if (n >= spans.length) done();
    }, gap);
    EV.done = done;
  }
  function next() {
    if (!EV.on) return;
    if (EV.typing) { EV.done(); return; }
    EV.i++; show();
  }
  // 演出（kaneru.json の fx）
  const FX_STEP = {
    redden() {
      SFX.play("redmoon");
      EV.redOn = true; winRed(); document.body.classList.add("kn-redhall");
      setTimeout(() => { EV.red && EV.red.classList.add("on"); EV.red2 && EV.red2.classList.add("on"); }, 900);
    },
    // 最初から左（トルサの反対側）に、右を向いて現れる
    appear(front) {
      SFX.play("appear"); SFX.play("telepathy", .4);
      EV.fig.classList.remove("kn-hidden");
      mountFigure(EV.fig).then(() => {
        const b = EV.fig.querySelector(".kn-body"); if (!b) return;
        b.classList.add("kn-hidden"); if (!front) approach(EV.fig, true, 0, true); else FIG && FIG.wings(1400);
        requestAnimationFrame(() => { b.classList.remove("kn-hidden"); b.classList.add("kn-in"); });
      });
    },
    project() {
      const b = mk("div", "kn-book");
      b.innerHTML = `<svg viewBox="0 0 150 200" aria-hidden="true"><defs><radialGradient id="knBk" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#ffb8c0" stop-opacity=".55"/><stop offset="1" stop-color="#ff2040" stop-opacity=".1"/></radialGradient></defs><rect x="12" y="8" width="126" height="184" rx="6" fill="url(#knBk)" stroke="#ffd0d6" stroke-opacity=".7" stroke-width="2"/><path d="M24 8v184" stroke="#ffd0d6" stroke-opacity=".5" stroke-width="3"/><rect x="40" y="36" width="80" height="128" rx="3" fill="none" stroke="#ffd0d6" stroke-opacity=".35" stroke-dasharray="4 5"/></svg>`;
      requestAnimationFrame(() => b.classList.add("show")); SFX.play("telepathy");
    },
    turn() { FIG && FIG.turn(true); const b = document.querySelector(".kn-body"); if (b) b.classList.add("kn-turned"); },
    unturn() { FIG && FIG.turn(false); const b = document.querySelector(".kn-body"); if (b) b.classList.remove("kn-turned"); },
    named() { EV.named = true; },
    rumble() { SFX.play("rumble"); if (!reduced) { const h = $("hall"); h.classList.remove("kn-shake"); void h.offsetWidth; h.classList.add("kn-shake"); } },
    // 話し終えたら、その場で赤い霧になって消える
    vanish() { SFX.play("vanish"); if (FIG) FIG.wings(2200); const b = document.querySelector("body > .kn-body"); if (b) { b.classList.remove("kn-in"); b.classList.add("kn-out"); } },
    clear() {
      EV.red && EV.red.classList.remove("on"); EV.red2 && EV.red2.classList.remove("on");
      EV.redOn = false; setTimeout(() => { if (!EV.redOn) document.body.classList.remove("kn-redhall"); }, 3200);
      setTimeout(() => { const b = document.querySelector("body > .kn-body"); if (b && b.classList.contains("kn-out")) dropFigure(); }, 2600);
    }
  };
  // 月の窓を赤くする層：月の窓の絵は奥の層（#back）にあるので、同じ層に、ガラスと同じ位置で赤い色をかけ算する。
  // 館が組み立て直されても（棟の移動・思い出から見たとき）、毎フレーム見なおして付けなおす
  function winRed() {
    if (EV.winLoop) return;
    EV.wins = [];
    const tick = () => {
      if (!EV.on && !EV.staged && !EV.wins.some((w) => w.classList.contains("on"))) { EV.wins.forEach((w) => w.remove()); EV.wins = []; EV.winLoop = 0; return; }
      const gl = [...document.querySelectorAll("#backTop .dyn.glass")], back = $("back");
      gl.forEach((g, i) => {
        let w = EV.wins[i];
        if (!w || !w.isConnected || w.parentNode !== back) { if (w) w.remove(); w = EV.wins[i] = document.createElement("div"); w.className = "kn-winred"; back.appendChild(w); void w.offsetWidth; }
        ["left", "top", "width", "height"].forEach((k) => { if (w.style[k] !== g.style[k]) w.style[k] = g.style[k]; });
        w.classList.toggle("on", !!EV.redOn);
      });
      EV.winLoop = setTimeout(tick, 300); // 窓の位置は画面の大きさを変えたときしか変わらないので、1秒に3回だけ見なおす
    };
    EV.winLoop = setTimeout(tick, 0);
  }
  function finish() {
    if (!EV.on) return;
    EV.on = false; clearInterval(EV.typing); EV.typing = 0;
    removeEventListener("keydown", onKey, true);
    if (!EV.replay) { K().seen = true; } ctx.markSeen(CFG.event.id);
    ctx.save();
    EV.redOn = false; setTimeout(() => { if (!EV.redOn) document.body.classList.remove("kn-redhall"); }, 3200);
    if (EV.red) EV.red.classList.remove("on"); if (EV.red2) EV.red2.classList.remove("on");
    { const b = document.querySelector("body > .kn-body"); if (b && !b.classList.contains("kn-out")) { b.classList.remove("kn-in"); b.classList.add("kn-out"); } }
    if (EV.root) { EV.root.classList.remove("talking"); EV.root.style.pointerEvents = "none"; }
    const els = EV.els; EV.els = [];
    setTimeout(() => { els.forEach((e) => e.remove()); dropFigure(); }, 2600);
    cls().remove("in-event", "kn-live");
    ctx.setFace("normal", 0);
    ctx.afterEvent();
    setTimeout(() => { if (ctx.hall() === "main") addCorridor(); }, 2700);
  }

  return {
    ready,
    owns: (id) => !!ROOMS[id],
    stageStyle: (id) => (ROOMS[id] || {}).stage || "",
    roomHTML: (id) => ROOMS[id].html(),
    roomCenter: (id) => (ROOMS[id] || {}).center ?? .5,
    backTo: (id) => (ROOMS[id] || {}).back || null,
    mount, unmount,
    // 部屋の設定（名前・ささやき）を、rooms.json の部屋と同じように使えるようにする
    rooms: () => (CFG && CFG.rooms) || {},
    warpIds: () => (unlocked() && CFG ? ["redmoon"] : []),
    onHall(id) { $("knTop").innerHTML = ""; CORRX.far = null; if (id === "main") ready.then(addCorridor); },
    idle() { if (ROOMNOW === "redmoon") { torsaSay("idleRedmoon"); return true; } return false; },
    enterLine(id) { return null; },
    leaveLine(id) { torsaSay(id === "redmoon" ? "backFromRedmoon" : "backFromCorridor"); },
    list: () => (CFG ? [{ id: CFG.event.id, name: CFG.event.name, hall: CFG.event.hall || "main" }] : []),
    play,
    get busy() { return EV.on; }
  };
};
