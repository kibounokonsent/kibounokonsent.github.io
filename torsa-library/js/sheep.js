/* =========================================================
   トルサ図書館：羊の間（トルサの部屋）と、本館の東のはしからつづく廊下
   ---------------------------------------------------------
   ・本館の東の書館への扉より右は、少しずつ暗くなって、そのままあたたかい色の廊下になる。
     廊下のいちばん奥に「羊の間」の扉がある（いつでも入れる）。
   ・羊の間：トルサの部屋。天蓋のベッド・ぬいぐるみ・窓・ランプ・本棚・ナイトキャップ・時計・ホットミルク・ガーランド・毛糸のかご・スリッパなどに
     さわると、トルサがひとこと話す。ランプはさわると明かりが消えて、ガーランドの電球と月の光が浮かびあがる。
   ・部屋の名前・札の文字・ささやきは data/rooms.json の "sheep"、トルサのセリフは data/torsa.json の lines
     （enterSheep・backFromSheep・doorSheep・sheepBed・sheepPlush など。このファイルの SPOTS に一覧）。
   いじりやすい場所（このファイルの中を検索してください）
   ・CORR     … 廊下の長さ（len）と、扉の位置（door）
   ・SPOTS    … 部屋の中でさわれる場所と、そのときのセリフの名前
   ・roomHTML( … 部屋の並び（図書館の部品と、ベッド・毛糸のかご・スリッパの絵 bedSVG( など）
   ========================================================= */
window.SheepModule = (ctx) => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const f1 = (n) => Math.round(n * 10) / 10;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ROOM_ID = "sheep";
  const cfg = () => ((ctx.DATA && ctx.DATA.rooms && ctx.DATA.rooms.rooms) || {})[ROOM_ID] || {};
  const lines = (k) => ((ctx.DATA && ctx.DATA.torsa && ctx.DATA.torsa.lines) || {})[k] || [];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const say = (k, ms) => { const a = lines(k); if (a.length) ctx.say(pick(a), ms); };

  const CSS = `
#knTop .sh-corr, #knTop .sh-dusk { pointer-events: none; }
.sh-corr { position: absolute; top: 0; height: 100%; container-type: inline-size; overflow: hidden; contain: layout paint; }
.sh-corr > * { position: absolute; }
.sh-corr img.part, .sh-room-wrap img.part { display: block; height: auto; pointer-events: none; }
.sh-dusk { position: absolute; top: 0; height: 100%; pointer-events: none; }
.sh-wall { background: radial-gradient(ellipse 40% 50% at 50% 46%, rgba(255, 214, 150, .16), transparent 70%), linear-gradient(180deg, #0c1030 0%, #141943 34%, #1d2456 60%, #222859 66%); }
.sh-stars { opacity: .5; background-image: radial-gradient(1.2px 1.2px at 12% 18%, #fff6d8 50%, transparent 51%), radial-gradient(1px 1px at 33% 9%, #fff 50%, transparent 51%), radial-gradient(1.4px 1.4px at 62% 14%, #ffe9b0 50%, transparent 51%), radial-gradient(1px 1px at 81% 22%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 7%, #fff6d8 50%, transparent 51%), radial-gradient(1.2px 1.2px at 47% 27%, #fff 50%, transparent 51%); background-size: 26cqw 26cqw; }
.sh-floor { background: repeating-linear-gradient(90deg, rgba(0, 0, 0, .2) 0 .15cqw, transparent .15cqw 9cqw), linear-gradient(180deg, #4a3224, #2e1f17); }
.sh-runner { border-radius: .4cqw; background: linear-gradient(180deg, #1d2b60, #16224f); box-shadow: 0 0 0 .18cqw rgba(214, 176, 98, .55) inset, 0 0 0 .55cqw rgba(16, 24, 60, .9) inset, 0 0 0 .66cqw rgba(214, 176, 98, .3) inset; }
.sh-carpet { border-radius: 50%; background: radial-gradient(ellipse at 50% 40%, #2a3a7a, #1d2b60 60%, #141f4a); box-shadow: 0 0 0 .3cqw rgba(214, 176, 98, .45) inset, 0 0 0 .9cqw rgba(20, 31, 74, .9) inset, 0 0 0 1.05cqw rgba(214, 176, 98, .35) inset; }
.sh-warm { border-radius: 50%; pointer-events: none; background: radial-gradient(closest-side, rgba(255, 215, 161, .5), rgba(255, 215, 161, 0)); animation: shBreathe 4.6s ease-in-out infinite; }
.sh-blue { border-radius: 50%; pointer-events: none; background: radial-gradient(closest-side, rgba(150, 200, 255, .5), rgba(150, 200, 255, 0)); }
.sh-winglow { pointer-events: none; background: radial-gradient(closest-side, rgba(225, 230, 255, .28), rgba(185, 200, 255, 0)); }
.sh-art svg { width: 100%; height: 100%; display: block; overflow: visible; }
.sh-art { pointer-events: none; }
.sh-door { position: absolute; border: 0; padding: 0; background: transparent; cursor: pointer; pointer-events: auto; border-radius: 50% 50% 6px 6px / 30% 30% 6px 6px; }
.sh-door:hover, .sh-door:focus-visible { background: radial-gradient(closest-side, rgba(255, 228, 180, .18), transparent); outline: none; }
.sh-door:focus-visible { box-shadow: 0 0 0 2px #f3d08a; }
.sh-sign { position: absolute; transform: translate(-50%, -100%); z-index: 2; pointer-events: none; font-family: var(--font-display, serif); font-size: clamp(11px, 1.1cqw, 15px); letter-spacing: .22em; padding: .3em .9em .3em 1.1em; white-space: nowrap;
  color: #f3d08a; background: linear-gradient(180deg, rgba(20, 26, 66, .95), rgba(12, 16, 44, .95)); border: 1px solid rgba(214, 176, 98, .7); border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, .45); }
@keyframes shBreathe { 50% { opacity: .7; } }
/* 部屋 */
.room-sheep { background: #141943; }
.sh-room-wrap { inset: 0; }
.sh-room-wrap > *, .sh-night > * { position: absolute; }
.sh-spot { position: absolute; border: 0; padding: 0; background: transparent; cursor: pointer; border-radius: 18px; }
.sh-spot:hover, .sh-spot:focus-visible { background: radial-gradient(closest-side, rgba(255, 240, 200, .14), transparent); outline: none; }
.sh-spot:focus-visible { box-shadow: 0 0 0 2px #f3d08a; }
.sh-paper { background-color: #18204f; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M16 10Q16 16 22 16Q16 16 16 22Q16 16 10 16Q16 16 16 10Z' fill='%23d6b062' fill-opacity='.32'/%3E%3Ccircle cx='48' cy='46' r='2' fill='%23cfe0ff' fill-opacity='.22'/%3E%3Cpath d='M47 6a7 7 0 1 0 0 14a5.5 5.5 0 1 1 0-14z' fill='%23d6b062' fill-opacity='.2'/%3E%3C/svg%3E"), repeating-linear-gradient(90deg, rgba(255, 255, 255, .025) 0 2cqw, transparent 2cqw 4cqw), linear-gradient(180deg, #121848 0%, #1b235a 55%, #222a62 100%); background-size: 4cqw 4cqw, auto, auto; }
.sh-alcove { border-radius: 50% 50% 0 0 / 22% 22% 0 0; background: linear-gradient(180deg, #0e1338, #161d4c); box-shadow: inset 0 0 3cqw rgba(0, 0, 0, .45); }
.sh-skirt { background: linear-gradient(180deg, #6c4a33, #3e2a1e); }
.sh-floor { background: repeating-linear-gradient(90deg, rgba(0, 0, 0, .22) 0 .15cqw, transparent .15cqw 7cqw), repeating-linear-gradient(90deg, rgba(255, 220, 170, .04) 0 3.5cqw, transparent 3.5cqw 7cqw), linear-gradient(180deg, #503626, #2e1f17); }
/* 湯気は、それだけの小さな層で動かす（絵の中の線を動かすと、部屋ぜんたいを毎回描き直すことになる） */
.sh-steam { pointer-events: none; opacity: 0; animation: shSteam 3.4s ease-in-out infinite; will-change: transform, opacity; }
.sh-steam svg { width: 100%; height: 100%; display: block; overflow: visible; }
.sh-steam + .sh-steam { animation-delay: -1.7s; }
@keyframes shSteam { 0% { opacity: 0; transform: translateY(6px); } 40% { opacity: .9; } 100% { opacity: 0; transform: translateY(-8px); } }
.sh-dark { inset: 0; pointer-events: none; background: radial-gradient(ellipse 17% 30% at 47.5% 44%, rgba(6, 8, 26, .12), rgba(6, 8, 26, .78) 80%); opacity: 0; transition: opacity 1.2s ease; }
.sh-night, .sh-moonlit { pointer-events: none; transition: opacity 1.2s ease; }
.sh-night { opacity: 0; }
.sh-night .sh-bulbs svg > path, .sh-night .sh-bulbs svg > path ~ path { display: none; }
.sh-moonlit { opacity: .55; }
.room-sheep.sh-lamp-off .sh-dark, .room-sheep.sh-lamp-off .sh-night { opacity: 1; }
.room-sheep.sh-lamp-off .sh-moonlit { opacity: 0; }
.room-sheep.sh-lamp-off .sh-lamp { opacity: 0; }
.sh-lamp { transition: opacity 1s ease; }
.sh-night .sh-bulbs circle { transform-box: fill-box; transform-origin: center; transform: scale(1.6); }
.sh-shoot { pointer-events: none; overflow: hidden; }
.sh-shoot i { position: absolute; width: 30%; height: 2px; border-radius: 2px; background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff); transform: rotate(-24deg); opacity: 0; }
.sh-shoot i.go { animation: shShoot 1.3s ease-out; }
@keyframes shShoot { 0% { opacity: 0; transform: translate(0, 0) rotate(-24deg); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(-160%, 70%) rotate(-24deg); } }
@media (prefers-reduced-motion: reduce) { .sh-warm, .sh-steam { animation: none; opacity: .4; } }
body.fx-off .sh-warm, body.fx-off .sh-steam { animation: none; }
body.fx-off .sh-steam { opacity: .4; }
`;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  // 舞台の座標（横 W・縦 1000）を % にする。sp＝図書館の部品を、館内と同じ決まり（左はし・右はし・下はし）で置く
  const atW = (W) => (x, y, w, h) => `left:${f1(x / W * 100)}%;top:${f1(y / 10)}%;width:${f1(w / W * 100)}%;${h != null ? `height:${f1(h / 10)}%;` : ""}`;
  const spW = (W) => (name, a, b, bottom, extra = "", cls = "") => {
    const pp = ctx.parts()[name]; if (!pp) return "";
    const q = ctx.placePart(pp, [a, b, bottom]);
    return `<img class="part ${cls}" src="${ctx.partFile(name)}" alt="" style="${atW(W)(q.x, q.y, q.w)}${extra}">`;
  };
  const flipX = "transform:scaleX(-1);";

  /* =========================================================
     廊下（本館の東のはしにつながる）。x＝0 が館がわの入り口、右へ行くほど奥
     館とおなじ部品（柱・アーチ・壁板・ランタン・鉢植え・扉）で組み立てる
     ========================================================= */
  // over＝館に重なる長さ、len＝廊下の長さ、door＝入り口から扉のまんなかまで、tail＝扉の先の暗がり（広い画面でも、扉をトルサに隠れない位置に止めるため）
  const CORR = { over: 240, len: 1500, door: 1440, tail: 2200 };
  const CW = CORR.over + CORR.len + CORR.tail, FLOOR = 838;
  function corridorHTML(name) {
    const W = CW, A = atW(W), sp = spW(W), end = CORR.over + CORR.len, dx = CORR.door;
    let s = `${defsSVG()}<div class="sh-wall" style="${A(0, 0, W, 1000)}"></div><div class="sh-stars" style="${A(0, 0, end, 400)}"></div>`;
    // 奥の壁板と柱・アーチ（500 ごと）
    for (let x = CORR.over - 20; x < end - 200; x += 236) s += sp("wall_panel", x, x + 236, 885, "filter:brightness(.62);");
    const PIL = [CORR.over + 60, CORR.over + 560, dx - 250, dx + 250];
    s += sp("arch", PIL[0], PIL[1], 198) + sp("arch", PIL[1], PIL[2], 198) + sp("grand_arch", PIL[2], PIL[3], 180);
    s += `<div class="sh-floor" style="${A(0, 860, W, 140)}"></div>`;
    s += `<div class="sh-runner" style="${A(CORR.over - 60, 872, dx - CORR.over + 60, 52)}"></div>`;
    // 扉のまわりの明かりと扉（館の両はしと同じ扉）
    s += `<div class="sh-warm" style="${A(dx - 260, 340, 520, 560)}"></div>`;
    s += sp("end_door", dx - 150, dx + 150, 862);
    PIL.forEach((x) => { s += sp("pillar", x - 33, x + 33, 838) + sp("tama", x - 14, x + 14, 151) + `<div class="sh-blue" style="${A(x - 40, 96, 80, 80)}"></div>`; });
    // 宙に浮かぶランタンと、鉢植え・小さな机
    [CORR.over + 310, CORR.over + 820].forEach((x, i) => { s += sp("lantern", x - 30, x + 30, 150, `animation-delay:${-i * 3}s;`, "float-y") + `<div class="sh-warm" style="${A(x - 90, 40, 180, 180)}animation-delay:${-i * 1.5}s"></div>`; });
    s += sp("tree_a", CORR.over + 150, CORR.over + 270, 866) + sp("plant", CORR.over + 640, CORR.over + 760, 868) + sp("tree_b", dx - 420, dx - 290, 866) + sp("tree_small_b", dx + 300, dx + 380, 866);
    s += sp("candle", dx - 196, dx - 182, 860) + sp("candle", dx + 182, dx + 196, 860) + `<div class="sh-warm" style="${A(dx - 230, 740, 80, 80)}"></div><div class="sh-warm" style="${A(dx + 150, 740, 80, 80)}"></div>`;
    s += `<div class="sh-art" style="${A(CORR.over + 236, 380, 150, 188)}">${paintingSVG(0)}</div><div class="sh-art" style="${A(CORR.over + 680, 380, 150, 188)}">${paintingSVG(1)}</div>`;
    s += `<div class="sh-art" style="${A(dx - 210, 236, 420, 80)}">${garlandSVG(420, 18, 2)}</div>`;
    s += `<div class="sh-art" style="${A(dx - 150, 852, 300, 60)}">${matSVG()}</div>`;
    s += `<button class="sh-door" type="button" style="${A(dx - 128, 390, 256, 470)}" aria-label="${esc(name)}への扉"></button><span class="sh-sign" style="left:${f1(dx / W * 100)}%;top:${f1(372 / 10)}%">${esc(name)}</span>`;
    // 扉の先は暗がり（行き止まり）と、館とのつなぎめ（左のはしは、館の暗がりにとけこむ）
    s += `<div style="${A(dx + 330, 0, W - dx - 330, 1000)}background:linear-gradient(90deg,rgba(5,6,18,0),rgba(5,6,18,.92) 260px,#05060f 420px);"></div>`;
    s += `<div style="${A(0, 0, CORR.over + 200, 1000)}background:linear-gradient(90deg,rgba(7,8,22,.97),rgba(7,8,22,.7) 45%,rgba(7,8,22,0));"></div>`;
    return s.replace(/(id="|url\(#)sh/g, "$1cs"); // 部屋と同じ名前のグラデーションにならないように
  }
  // ひつじの顔（ぬいぐるみ・スリッパ・玄関マット・額絵でおなじ顔）。r＝顔の半径。
  // 茶色の丸い顔、トルサとおそろいの金のつの（左右にくるん）、左右上のもこもこの毛（左は顔のうしろ、右は顔の手前）、横長の黒い目と光、ピンクの頬、下の灰色の鼻先
  function sheepFace(x, y, r) {
    const n2 = (v) => Math.round(v * 1000) / 1000;
    // もこもこの毛：まるを重ねて、ふちの線は外がわだけに出す（下に線つき、上に線なしで重ねる）
    const wool = (cs) => `<g fill="#d9cdb5" stroke="#b9ab8e" stroke-width=".1">${cs.map(([a, b, rr]) => `<circle cx="${n2(a)}" cy="${n2(b)}" r="${n2(rr)}"/>`).join("")}</g><g fill="url(#shWool)">${cs.map(([a, b, rr]) => `<circle cx="${n2(a)}" cy="${n2(b)}" r="${n2(rr)}"/>`).join("")}</g>`;
    // 頭のうしろの毛（頭のてっぺんを、耳の高さまでぐるっとおおう）
    const cap = []; for (let d = 195; d <= 345; d += 18.75) { const t = d * Math.PI / 180; cap.push([Math.cos(t) * .95, -.12 + Math.sin(t) * .86, d === 195 || d === 345 ? .34 : .4]); }
    // おでこにかかる前髪の毛
    const fringe = [[-.58, -.66, .3], [-.22, -.8, .32], [.18, -.8, .32], [.56, -.68, .3], [-.02, -.6, .26]];
    return `<g transform="translate(${x} ${y}) scale(${r})">
      ${wool(cap)}
      <circle r="1" fill="url(#shFace)" stroke="#4a3832" stroke-width=".05"/>
      <g stroke="#8a6a2e" stroke-width=".05" stroke-linejoin="round">${SHEEP_HORN}<g transform="scale(-1 1)">${SHEEP_HORN}</g></g>
      ${wool(fringe)}
      <ellipse cx="-.98" cy=".3" rx=".27" ry=".09" fill="#f7c9df" opacity=".9"/><ellipse cx=".9" cy=".33" rx=".32" ry=".09" fill="#f7c9df" opacity=".9"/>
      <ellipse cx="-.56" cy=".1" rx=".27" ry=".11" fill="#1c1418"/><ellipse cx=".42" cy=".1" rx=".27" ry=".1" fill="#1c1418"/>
      <ellipse cx="-.45" cy=".05" rx=".08" ry=".04" fill="#fff"/><ellipse cx=".53" cy=".05" rx=".08" ry=".04" fill="#fff"/>
      <ellipse cx="-.1" cy=".64" rx=".54" ry=".4" fill="url(#shMuz)" stroke="#6f6966" stroke-width=".04"/>
    </g>`;
  }
  // 羊の角（左がわ。右は左右をかえす）：頭の毛の下から外へ出て、顔の横でくるんと巻く。根もとが太く、先へいくほど細い
  const SHEEP_HORN = (() => {
    const cx = -1.04, cy = .02, N = 28, L = [], R = [], P = (t) => { const a = (-58 - 330 * t) * Math.PI / 180, rr = .6 * (1 - .74 * t); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; };
    for (let i = 0; i <= N; i++) {
      const t = i / N, [px, py] = P(t), [qx, qy] = P(Math.min(1, t + .01)), [ox, oy] = P(Math.max(0, t - .01)), dx = qx - ox, dy = qy - oy, l = Math.hypot(dx, dy) || 1, w = .2 * (1 - .62 * t);
      L.push([px - dy / l * w, py + dx / l * w]); R.push([px + dy / l * w, py - dx / l * w]);
    }
    const f = (v) => Math.round(v * 1000) / 1000, pts = L.concat(R.reverse());
    const ridge = [.12, .24, .36, .48, .6, .72].map((t) => { const i = Math.round(t * N), a = L[i], b = R[N - i]; return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`; }).join("");
    return `<path d="M${pts.map(([a, b]) => f(a) + " " + f(b)).join("L")}Z" fill="url(#shHorn)"/><path d="${ridge}" fill="none" stroke-width=".035" opacity=".7"/>`;
  })();

  // 廊下の額絵（kind 0＝おひつじ座、1＝月とひつじ）160×200
  function paintingSVG(kind) {
    const canvas = kind === 0
      ? `<path d="M40 70L72 58L104 70L118 104" stroke="#cfe0ff" stroke-width="1.4" opacity=".7" fill="none"/>${[[40, 70, 4], [72, 58, 5.5], [104, 70, 4.5], [118, 104, 3.5]].map(([x, y, r]) => `<path d="${s4(x, y, r * 1.8)}" fill="#fff6d8"/>`).join("")}
         <path d="M60 128c-14 -6 -18 -24 -4 -30c12 -5 20 6 14 14c-4 5 -10 2 -9 -2" stroke="${GOLD}" stroke-width="2" fill="none" opacity=".55"/><path d="M68 132Q80 120 98 126Q112 134 108 148H58Q54 138 68 132Z" fill="none" stroke="${GOLD}" stroke-width="1.6" opacity=".45"/>
         ${[[30, 40], [128, 46], [120, 150], [34, 150], [86, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join("")}`
      : `<path d="${moonD(108, 48, 16)}" fill="${GOLD_HI}"/><path d="M20 140Q60 106 100 118Q126 124 140 140V168H20Z" fill="#2e4a34"/><path d="M20 152Q70 128 140 150V168H20Z" fill="#24382a"/>
         <g transform="translate(70 116)"><g fill="url(#shWool)"><circle cx="-8" cy="0" r="10"/><circle cx="6" cy="-4" r="11"/><circle cx="16" cy="4" r="9"/><circle cx="2" cy="6" r="10"/></g>${sheepFace(-18, -4, 6.5)}<path d="M-6 14V20M10 14V20" stroke="#55433d" stroke-width="3"/></g>
         ${[[34, 40], [60, 62], [130, 86], [44, 90], [86, 34]].map(([x, y], i) => `<path d="${s4(x, y, i % 2 ? 3 : 4.5)}" fill="#fff6d8"/>`).join("")}`;
    return `<svg viewBox="0 0 160 200" aria-hidden="true"><rect x="4" y="8" width="152" height="190" rx="4" fill="#000" opacity=".3"/>
      <rect x="0" y="0" width="160" height="190" rx="4" fill="${GOLD}"/><rect x="6" y="6" width="148" height="178" rx="2" fill="#9a7a3e"/><rect x="10" y="10" width="140" height="170" fill="url(#shPaint)"/>
      <rect x="10" y="10" width="140" height="170" fill="none" stroke="#f3d08a" stroke-width="1" opacity=".6"/>
      <svg x="10" y="10" width="140" height="170" viewBox="10 10 140 170">${canvas}</svg>
      <path d="M58 -2L80 -22L102 -2" fill="none" stroke="${GOLD}" stroke-width="1.6"/><circle cx="80" cy="-22" r="3" fill="${GOLD}"/></svg>`;
  }
  // 扉の前の、ひつじの玄関マット 300×60
  const matSVG = () => `<svg viewBox="0 0 300 60" aria-hidden="true"><ellipse cx="150" cy="32" rx="146" ry="26" fill="#000" opacity=".3"/><ellipse cx="150" cy="30" rx="142" ry="24" fill="#efe6d4"/><ellipse cx="150" cy="30" rx="130" ry="19" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <g transform="translate(150 30) scale(1 .55)"><g fill="#fffdf6" stroke="#cbbd9f" stroke-width="1.4"><circle cx="-8" cy="0" r="14"/><circle cx="10" cy="-4" r="16"/><circle cx="24" cy="6" r="13"/><circle cx="4" cy="10" r="14"/></g></g><g transform="translate(126 27)">${sheepFace(0, 0, 11)}</g>
    ${[-96, 96].map((x) => `<path d="${s4(150 + x, 30, 7)}" fill="${GOLD}"/>`).join("")}</svg>`;
  const CX = { xA: 0, el: null, vis: undefined };
  function addCorridor() {
    if (cfg().enabled === false || ctx.hall() !== "main" || document.querySelector("#knTop .sh-corr")) return;
    const W = ctx.world(), xA = W.L + W.W - CORR.over; CX.xA = xA;
    // 本館の東のはし：東の書館への扉より右は、少しずつ暗くなって、そのまま廊下になる
    const d1 = W.doors.find((x) => x.side === "east"), duskL = d1 ? d1.x + 140 : W.L + W.W - 300;
    const dusk = document.createElement("div"); dusk.className = "sh-dusk";
    dusk.style.cssText = `left:${((duskL - W.L) / W.W) * 100}%;width:${((W.L + W.W + 40 - duskL) / W.W) * 100}%;background:linear-gradient(90deg,rgba(7,8,22,0),rgba(7,8,22,.4) 35%,rgba(7,8,22,.85) 80%,rgba(7,8,22,.97))`;
    $("knTop").appendChild(dusk);
    const name = cfg().name || "羊の間", el = document.createElement("div"); el.className = "sh-corr"; el.setAttribute("aria-label", cfg().corridorName || "羊の間への廊下");
    el.style.cssText = `left:${((xA - W.L) / W.W) * 100}%;width:${(CW / W.W) * 100}%`;
    el.innerHTML = corridorHTML(name);
    $("knTop").appendChild(el); CX.el = el; CX.vis = undefined; if (ctx.camX) onCam(ctx.camX());
    const door = el.querySelector(".sh-door");
    door.addEventListener("click", () => { ctx.SFX.play("hover"); ctx.cancelWalk(); say("doorSheep"); setTimeout(() => ctx.enterRoom(ROOM_ID, door), 900); });
    ctx.reachEast(xA + CW, xA + CORR.door);
    // 場所の名前と、そこでのトルサのひとこと
    const H = (ctx.DATA.library.halls || {}).main || {}, Z = H.zones || ctx.DATA.library.zones, nm = cfg().corridorName || "羊の間への廊下";
    if (Z && !Z.some((z) => z.sh)) { const from = W.L + W.W - 80; Z.forEach((z) => { if (z.to == null && (z.from ?? -Infinity) < from) z.to = from; }); Z.push({ name: nm, from, sh: true }); }
    const zl = (ctx.DATA.torsa.lines.zone ||= {}); if (!zl[nm] && lines("enterSheepCorridor").length) zl[nm] = lines("enterSheepCorridor");
  }
  // 廊下が画面から遠いときは、廊下ごと描かない（軽くする。館の手前の層も小さくなって、スマホのメモリにやさしい）
  function onCam(camX) {
    if (!CX.el || !CX.el.isConnected) return;
    const vis = camX > CX.xA - 1600;
    if (vis !== CX.vis) { CX.vis = vis; CX.el.style.display = vis ? "" : "none"; } // 見えないだけ（visibility）だと、館の手前の層がそのぶん大きいままになるので、描かない（display）にする
  }

  /* =========================================================
     羊の間（トルサの部屋）。舞台は 1600×1000（横:縦＝16:10）
     館の部品（柱・アーチ・月の窓・机・本棚・鉢植え）に、部屋らしい壁紙・腰板・天蓋のベッド・カーテン・
     ナイトテーブル・星のガーランド・じゅうたんを足す。色は館とおなじ、くるみの木・紺・金
     ========================================================= */
  // さわれる場所：[x, y, 幅, 高さ, セリフの名前, 説明]（あとに書いたものほど上に重なる）
  const SPOTS = [
    [20, 520, 410, 350, "sheepBed", "天蓋のベッド"],
    [560, 220, 400, 330, "sheepWindow", "月の窓"],
    [580, 660, 200, 200, "sheepDesk", "トルサの机"],
    [1080, 230, 420, 520, "sheepShelf", "本棚"],
    [1060, 120, 500, 110, "sheepGarland", "星のガーランド"],
    [790, 520, 130, 150, "sheepLamp", "机のランプ"],
    [172, 506, 112, 132, "sheepPlush", "ひつじのぬいぐるみ"],
    [438, 228, 56, 124, "sheepCap", "ナイトキャップ"],
    [448, 684, 48, 64, "sheepClock", "月の目ざまし時計"],
    [498, 650, 58, 82, "sheepMilk", "ホットミルク"],
    [962, 760, 156, 120, "sheepYarn", "毛糸のかご"],
    [300, 884, 150, 60, "sheepSlippers", "スリッパ"]
  ];
  const s4 = (x, y, r) => `M${f1(x)} ${f1(y - r)}Q${f1(x)} ${f1(y)} ${f1(x + r)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y + r)}Q${f1(x)} ${f1(y)} ${f1(x - r)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y - r)}Z`;
  const s5 = (x, y, r) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; d += (i ? "L" : "M") + f1(x + Math.cos(a) * q) + " " + f1(y + Math.sin(a) * q); } return d + "Z"; };
  const moonD = (x, y, r) => `M${f1(x + r * .35)} ${f1(y - r * .94)}A${r} ${r} 0 1 0 ${f1(x + r * .35)} ${f1(y + r * .94)}A${f1(r * .78)} ${f1(r * .78)} 0 1 1 ${f1(x + r * .35)} ${f1(y - r * .94)}Z`;
  // 色
  const GOLD = "#d6b062", GOLD_HI = "#f3d08a", NAVY = "#1d2b60", NAVY_D = "#141f4a", WD = "#5b3d2b";
  const WOOD = `<linearGradient id="shW1" x1="0" x2="1"><stop offset="0" stop-color="#6c4a33"/><stop offset=".35" stop-color="#a27752"/><stop offset=".7" stop-color="#8a6142"/><stop offset="1" stop-color="#5b3d2b"/></linearGradient>`;
  const WOODV = `<linearGradient id="shW2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a27752"/><stop offset=".5" stop-color="#8a6142"/><stop offset="1" stop-color="#5b3d2b"/></linearGradient>`;
  const TAMA = `<radialGradient id="shTama" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#e6f2ff"/><stop offset=".45" stop-color="#7fb0ff"/><stop offset="1" stop-color="#2c4c9a"/></radialGradient>`;
  const VELVET = `<linearGradient id="shVel" x1="0" x2="1"><stop offset="0" stop-color="#16214f"/><stop offset=".3" stop-color="#2a3a80"/><stop offset=".55" stop-color="#1f2c66"/><stop offset=".8" stop-color="#2c3d86"/><stop offset="1" stop-color="#16214f"/></linearGradient>`;
  const WOOL = `<radialGradient id="shWool" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fffdf6"/><stop offset=".7" stop-color="#efe6d4"/><stop offset="1" stop-color="#d6c9ae"/></radialGradient>`;
  // どの絵でも使うグラデーションは、部屋のはじめに一度だけ書く（同じ id を何度も書かない）
  const defsSVG = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${WOOD}${WOODV}${TAMA}${VELVET}${WOOL}
    <linearGradient id="shQ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f3f86"/><stop offset=".55" stop-color="#1d2b60"/><stop offset="1" stop-color="#141f4a"/></linearGradient>
    <linearGradient id="shC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ea"/><stop offset="1" stop-color="#d9cdb5"/></linearGradient>
    <linearGradient id="shKnit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2bf72"/><stop offset="1" stop-color="#b98d45"/></linearGradient>
    <radialGradient id="shYs" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
    <radialGradient id="shHorn" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fbe3a0"/><stop offset=".6" stop-color="#e2b75e"/><stop offset="1" stop-color="#b98d45"/></radialGradient>
    <radialGradient id="shFace" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#7e655c"/><stop offset=".7" stop-color="#65514a"/><stop offset="1" stop-color="#55433d"/></radialGradient>
    <radialGradient id="shMuz" cx=".45" cy=".3" r=".75"><stop offset="0" stop-color="#b3ada8"/><stop offset="1" stop-color="#928c88"/></radialGradient>
    <linearGradient id="shPaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1640"/><stop offset="1" stop-color="#26357a"/></linearGradient>
    <radialGradient id="shBulb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d8"/><stop offset=".4" stop-color="#ffd98a"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="shMoonLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".0"/><stop offset=".25" stop-color="#cfe0ff" stop-opacity=".28"/><stop offset="1" stop-color="#cfe0ff" stop-opacity=".05"/></linearGradient>
  </defs></svg>`;

  // 腰板（床から上 240 のところまで）
  function wainscotSVG() {
    let p = "";
    for (let x = 8; x < 1600; x += 112) p += `<rect x="${x}" y="40" width="96" height="150" rx="3" fill="none" stroke="${WD}" stroke-width="3" opacity=".75"/><path d="M${x + 4} 186V44H${x + 92}" fill="none" stroke="#c99c71" stroke-width="1.6" opacity=".35"/>`;
    return `<svg viewBox="0 0 1600 240" preserveAspectRatio="none" aria-hidden="true"><rect width="1600" height="240" fill="url(#shW2)"/><rect width="1600" height="240" fill="#1a1230" opacity=".35"/>${p}
      <rect y="0" width="1600" height="18" fill="url(#shW2)"/><path d="M0 18H1600" stroke="${WD}" stroke-width="3"/><path d="M0 4H1600" stroke="${GOLD}" stroke-width="2" opacity=".75"/><path d="M0 222H1600" stroke="${WD}" stroke-width="4" opacity=".8"/></svg>`;
  }
  // 天井のふち（まわり縁）
  const crownSVG = () => `<svg viewBox="0 0 1600 44" preserveAspectRatio="none" aria-hidden="true"><rect width="1600" height="44" fill="url(#shW2)"/><path d="M0 34H1600" stroke="${GOLD}" stroke-width="2" opacity=".8"/><path d="M0 40H1600" stroke="${WD}" stroke-width="5"/>${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 40 + 6}" y="8" width="28" height="18" rx="2" fill="${WD}" opacity=".45"/>`).join("")}</svg>`;

  // 星のガーランド（w＝横の長さ、sag＝たるみ）。電球は、ランプを消すと明るく光る
  function garlandSVG(w, sag, seed) {
    const h = sag + 70, P = (t) => [w * t, 14 + 4 * (1 - t) * t * sag];
    let charms = "", bulbs = "";
    const n = Math.round(w / 46);
    for (let i = 1; i < n; i++) {
      const t = i / n, [x, y] = P(t), k = (i + seed) % 3;
      if (i % 2) bulbs += `<circle class="sh-bulb-glow" cx="${f1(x)}" cy="${f1(y + 7)}" r="13" fill="url(#shBulb)"/><circle cx="${f1(x)}" cy="${f1(y + 7)}" r="3.4" fill="#ffe7a8" stroke="${GOLD}" stroke-width="1"/>`;
      else {
        const L = 16 + ((i * 7 + seed) % 3) * 8, cy = y + L + 12;
        charms += `<path d="M${f1(x)} ${f1(y)}V${f1(cy - 10)}" stroke="${GOLD}" stroke-width="1" opacity=".8"/>`;
        charms += k === 0 ? `<path d="${s5(x, cy, 11)}" fill="${GOLD_HI}" stroke="#b08a43" stroke-width="1.2"/>`
          : k === 1 ? `<path d="${moonD(x, cy, 10)}" fill="#cfe0ff" stroke="#8aa4d8" stroke-width="1.2"/>`
          : `<path d="${s4(x, cy, 11)}" fill="#fff1c2" stroke="${GOLD}" stroke-width="1"/>`;
      }
    }
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M0 14Q${w / 2} ${14 + sag * 2} ${w} 14" fill="none" stroke="#b08a43" stroke-width="2"/>${charms}${bulbs}</svg>`;
  }
  // 天蓋のベッド（470×760。左がまくら側）
  function bedSVG() {
    const charms = Array.from({ length: 7 }, (_, i) => { const x = 65 + i * 55; return `<path d="M${x} 108V122" stroke="${GOLD}" stroke-width="1"/><path d="${s4(x, 128, 6)}" fill="${GOLD_HI}"/>`; }).join("");
    const folds = Array.from({ length: 9 }, (_, i) => { const x = 60 + i * 42; return `<path d="M${x} 112V560" stroke="#0c143a" stroke-width="10" opacity=".35"/><path d="M${x + 14} 112V560" stroke="#3a4c9a" stroke-width="4" opacity=".25"/>`; }).join("");
    const qstars = [[262, 552, 6], [318, 538, 5], [372, 560, 6], [292, 612, 4.5], [350, 640, 5], [240, 650, 4], [400, 610, 4], [226, 590, 4.5]].map(([x, y, r]) => `<path d="${s4(x, y, r * 1.6)}" fill="${GOLD_HI}"/>`).join("");
    return `<svg viewBox="0 0 470 760" aria-hidden="true">
      <ellipse cx="230" cy="750" rx="225" ry="10" fill="#000" opacity=".35"/>
      <!-- うしろのとばり -->
      <rect x="34" y="96" width="392" height="480" fill="url(#shVel)"/>${folds}
      <rect x="34" y="96" width="392" height="480" fill="#0a1030" opacity=".25"/>
      <!-- 柱（頭がわ・足がわ） -->
      <rect x="16" y="56" width="22" height="694" rx="4" fill="url(#shW1)"/><rect x="422" y="56" width="22" height="694" rx="4" fill="url(#shW1)"/>
      ${[27, 433].map((x) => `<rect x="${x - 15}" y="44" width="30" height="16" rx="3" fill="${GOLD}"/><circle cx="${x}" cy="30" r="15" fill="url(#shTama)"/><circle cx="${x - 5}" cy="25" r="4" fill="#fff" opacity=".7"/>${[230, 460, 600].map((y) => `<rect x="${x - 13}" y="${y}" width="26" height="8" rx="3" fill="${GOLD}" opacity=".85"/>`).join("")}`).join("")}
      <!-- 天蓋のはりと、ふちかざり -->
      <rect x="6" y="58" width="448" height="24" rx="4" fill="url(#shW2)"/><path d="M8 64H452" stroke="${GOLD}" stroke-width="2"/>
      <path d="M10 82H450V108${Array.from({ length: 8 }, (_, i) => { const x = 450 - i * 55; return `Q${x - 27.5} 132 ${x - 55} 108`; }).join("")}Z" fill="url(#shQ)" stroke="${GOLD}" stroke-width="2.4"/>
      <path d="M10 90H450" stroke="${GOLD}" stroke-width="1.4" opacity=".7"/>${charms}
      <g transform="translate(230 96)"><circle r="17" fill="${NAVY_D}" stroke="${GOLD}" stroke-width="2.4"/><path d="${moonD(-2, 0, 11)}" fill="${GOLD_HI}"/></g>
      <!-- 両わきのとばり（金のひもでたばねる） -->
      <path d="M38 106H120C104 190 72 250 54 290C70 330 96 400 104 470C80 476 56 470 38 466Z" fill="url(#shVel)"/>
      <path d="M120 106C104 190 72 250 54 290C70 330 96 400 104 470" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
      <path d="M60 110C58 180 50 240 46 286M86 110C80 190 62 250 50 290M50 296C60 360 70 420 74 468" stroke="#0c143a" stroke-width="5" opacity=".4" fill="none"/>
      <path d="M422 106H340C356 190 388 250 406 290C390 330 364 400 356 470C380 476 404 470 422 466Z" fill="url(#shVel)"/>
      <path d="M340 106C356 190 388 250 406 290C390 330 364 400 356 470" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
      <path d="M400 110C402 180 410 240 414 286M374 110C380 190 398 250 410 290M410 296C400 360 390 420 386 468" stroke="#0c143a" stroke-width="5" opacity=".4" fill="none"/>
      ${[[42, 290], [418, 290]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="7" fill="${GOLD}" stroke="#9a7a3e" stroke-width="1.4"/><path d="M${x} ${y + 6}V${y + 22}" stroke="${GOLD}" stroke-width="3"/><path d="M${x - 7} ${y + 22}H${x + 7}L${x + 9} ${y + 46}H${x - 9}Z" fill="${GOLD}"/><path d="M${x - 5} ${y + 30}V${y + 46}M${x} ${y + 30}V${y + 46}M${x + 5} ${y + 30}V${y + 46}" stroke="#9a7a3e" stroke-width="1"/>`).join("")}
      <!-- 頭の板 -->
      <path d="M38 600V390Q38 318 104 304Q170 318 170 390V600Z" fill="url(#shW1)"/><path d="M52 590V394Q52 334 104 320Q156 334 156 394V590" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <circle cx="104" cy="392" r="30" fill="${NAVY_D}" stroke="${GOLD}" stroke-width="3"/><path d="${moonD(102, 392, 20)}" fill="${GOLD_HI}"/><path d="${s4(90, 380, 6)}" fill="#fff1c2"/>
      <!-- ねどこ・まくら -->
      <rect x="40" y="520" width="384" height="56" rx="14" fill="url(#shC)"/>
      <path d="M40 572H204V690Q184 704 163 690Q142 704 122 690Q101 704 81 690Q60 704 40 690Z" fill="url(#shVel)"/><path d="M40 690Q60 704 81 690Q101 704 122 690Q142 704 163 690Q184 704 204 690" fill="none" stroke="${GOLD}" stroke-width="2"/><path d="M40 578H204" stroke="${GOLD}" stroke-width="1.6" opacity=".7"/>
      <path d="M56 488Q52 446 92 440H182Q214 446 210 490Q214 532 180 536H92Q52 532 56 488Z" fill="url(#shC)" stroke="#cbbd9f" stroke-width="2"/><path d="M76 488Q130 474 192 488" stroke="#cbbd9f" stroke-width="2" fill="none"/>
      <path d="M86 520Q80 486 112 482H196Q226 486 222 520Q226 548 196 552H112Q82 548 86 520Z" fill="${NAVY}" stroke="${GOLD}" stroke-width="2"/><path d="${s5(154, 517, 12)}" fill="${GOLD_HI}"/>
      ${[[86, 520], [222, 520]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${GOLD}"/>`).join("")}
      <!-- 紺のキルト（金の星）。手前にたれて、すそは波の形 -->
      <path d="M200 548Q206 520 236 518H404Q426 520 428 548V696${Array.from({ length: 6 }, (_, i) => { const x = 428 - i * 38; return `Q${x - 19} 714 ${x - 38} 696`; }).join("")}Z" fill="url(#shQ)"/>
      <path d="M200 548Q206 520 236 518H404Q426 520 428 548" fill="none" stroke="#2f3f86" stroke-width="2"/>
      <path d="M200 548L200 696" stroke="#0c143a" stroke-width="3" opacity=".5"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${228 + i * 38} 560V690" stroke="${GOLD}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".35"/>`).join("")}
      <path d="M200 600H428M200 650H428" stroke="${GOLD}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".35"/>
      ${qstars}
      <path d="M428 696${Array.from({ length: 6 }, (_, i) => { const x = 428 - i * 38; return `Q${x - 19} 714 ${x - 38} 696`; }).join("")}" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
      <path d="M200 548Q204 522 234 518H426Q428 522 428 534H232Q210 536 200 548Z" fill="url(#shC)"/><path d="M232 534H428" stroke="#cbbd9f" stroke-width="1.6"/>
      <!-- 足もとの、金色の編みもの -->
      <path d="M330 514H418Q432 516 432 540V646Q404 656 376 646Q352 654 330 646Z" fill="url(#shKnit)"/>
      ${Array.from({ length: 5 }, (_, i) => `<path d="M${342 + i * 18} 520V642" stroke="#9a7a3e" stroke-width="2" stroke-dasharray="5 3" opacity=".7"/>`).join("")}
      <path d="M330 646Q352 654 376 646Q404 656 432 646" fill="none" stroke="#9a7a3e" stroke-width="2"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${336 + i * 18} 650V664" stroke="#c9a258" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
      <!-- 寝台のわくと脚 -->
      <rect x="38" y="708" width="384" height="40" fill="#05060f" opacity=".45"/><rect x="44" y="708" width="16" height="40" rx="3" fill="${WD}"/><rect x="400" y="708" width="16" height="40" rx="3" fill="${WD}"/>
      <rect x="30" y="690" width="400" height="22" rx="4" fill="url(#shW2)"/><path d="M34 694H426" stroke="${GOLD}" stroke-width="2" opacity=".7"/>
      <!-- ひつじのぬいぐるみ（茶色の丸い顔・トルサとおそろいの金のつの・もこもこの毛・青いリボン） -->
      <g transform="translate(222 470)">
        <ellipse cx="4" cy="58" rx="54" ry="9" fill="#000" opacity=".2"/>
        <g fill="url(#shWool)" stroke="#cbbd9f" stroke-width="1.6"><circle cx="22" cy="40" r="22"/><circle cx="-14" cy="42" r="20"/><circle cx="34" cy="14" r="22"/><circle cx="6" cy="10" r="26"/><circle cx="-18" cy="16" r="20"/><circle cx="8" cy="36" r="22"/></g>
        <ellipse cx="-12" cy="58" rx="9" ry="6" fill="#55433d"/><ellipse cx="22" cy="60" rx="9" ry="6" fill="#55433d"/>
        ${sheepFace(-20, -6, 25)}
        <g transform="translate(0 9)"><path d="M-20 22l-14 -8v18zM-20 22l14 -8v18z" fill="#3a5fb0" stroke="#24407e" stroke-width="1.4"/><path d="M-22 26l-6 14M-18 26l6 14" stroke="#3a5fb0" stroke-width="5" stroke-linecap="round"/><circle cx="-20" cy="22" r="4.6" fill="${GOLD}"/></g>
      </g>
      <!-- 足がわの柱にかけた、ナイトキャップ -->
      <g transform="translate(446 132)"><circle cx="0" cy="0" r="3.4" fill="${GOLD}"/><path d="M0 2Q4 10 6 14" stroke="${GOLD}" stroke-width="1.6" fill="none"/>
        <path d="M-6 16Q10 10 22 22Q20 70 10 104Q-10 70 -14 30Q-12 18 -6 16Z" fill="#2a3a80" stroke="${NAVY_D}" stroke-width="1.4"/>
        <path d="M-16 26Q4 16 24 26Q24 34 22 36Q2 28 -16 36Z" fill="#f5f0e3" stroke="#cbbd9f" stroke-width="1.2"/>
        <path d="${s4(6, 52, 5)}" fill="${GOLD_HI}"/><path d="${s4(12, 78, 4)}" fill="${GOLD_HI}"/><path d="${moonD(-2, 66, 4)}" fill="#cfe0ff"/>
        <g fill="url(#shWool)" stroke="#cbbd9f" stroke-width="1"><circle cx="10" cy="112" r="9"/><circle cx="4" cy="108" r="6"/></g></g>
    </svg>`;
  }
  // ナイトテーブル（月の目ざまし時計と、ホットミルク）120×210
  const nightstandSVG = () => `<svg viewBox="0 0 120 210" aria-hidden="true">
    <ellipse cx="60" cy="206" rx="56" ry="5" fill="#000" opacity=".35"/>
    <rect x="10" y="96" width="100" height="98" rx="4" fill="url(#shW1)"/><rect x="4" y="88" width="112" height="12" rx="3" fill="url(#shW2)"/><path d="M6 92H114" stroke="${GOLD}" stroke-width="1.6" opacity=".8"/>
    <rect x="18" y="108" width="84" height="34" rx="3" fill="none" stroke="${WD}" stroke-width="2.4"/><circle cx="60" cy="125" r="4" fill="${GOLD}"/>
    <rect x="18" y="150" width="84" height="36" rx="3" fill="none" stroke="${WD}" stroke-width="2.4"/><circle cx="60" cy="168" r="4" fill="${GOLD}"/>
    <rect x="14" y="192" width="10" height="16" fill="${WD}"/><rect x="96" y="192" width="10" height="16" fill="${WD}"/>
    <!-- 時計 -->
    <path d="M14 88L20 78M44 88L38 78" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="29" cy="60" r="21" fill="${GOLD}" stroke="#9a7a3e" stroke-width="1.6"/><circle cx="29" cy="60" r="16" fill="#f5f0e3"/>
    <path d="${moonD(25, 58, 7)}" fill="#cfe0ff"/><path d="M29 60V49M29 60L37 64" stroke="${NAVY}" stroke-width="2" stroke-linecap="round"/><circle cx="29" cy="60" r="1.8" fill="${NAVY}"/>
    <circle cx="15" cy="40" r="6" fill="${GOLD}" stroke="#9a7a3e" stroke-width="1.2"/><circle cx="43" cy="40" r="6" fill="${GOLD}" stroke="#9a7a3e" stroke-width="1.2"/><path d="M26 37H32" stroke="#9a7a3e" stroke-width="2.4" stroke-linecap="round"/>
    <!-- ホットミルク -->
    <path d="M66 62H100V82Q100 88 94 88H72Q66 88 66 82Z" fill="#f5f0e3" stroke="#cbbd9f" stroke-width="1.4"/><path d="M100 66Q112 68 110 76Q108 82 100 82" fill="none" stroke="#cbbd9f" stroke-width="4"/>
    <ellipse cx="83" cy="62" rx="17" ry="4" fill="#fffdf6" stroke="#cbbd9f" stroke-width="1.2"/><path d="M72 74H94" stroke="${NAVY}" stroke-width="2" opacity=".6"/><path d="${s4(83, 78, 4)}" fill="${GOLD}"/>
  </svg>`;
  // 窓のカーテン（左がわ。右は左右をかえして使う）140×720
  const curtainSVG = () => `<svg viewBox="0 0 140 720" aria-hidden="true">
    <path d="M8 14H128C112 160 74 330 48 418C74 520 112 640 124 716H8Z" fill="url(#shVel)"/>
    <path d="M30 18C30 160 26 320 24 416M56 18C52 170 40 320 34 418M84 18C76 180 54 330 42 420M36 430C44 540 56 640 62 714M48 432C66 540 86 640 96 714" stroke="#0c143a" stroke-width="7" opacity=".38" fill="none"/>
    <path d="M44 18C42 170 34 320 30 416M70 18C64 180 48 330 38 420M42 432C56 540 70 640 78 714" stroke="#4a5cb0" stroke-width="3" opacity=".3" fill="none"/>
    <path d="M128 14C112 160 74 330 48 418C74 520 112 640 124 716" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <path d="M8 716H124" stroke="${GOLD}" stroke-width="3"/>
    <rect x="0" y="4" width="140" height="10" rx="5" fill="${GOLD}"/><circle cx="6" cy="9" r="9" fill="${GOLD}" stroke="#9a7a3e" stroke-width="1.4"/>
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="${16 + i * 15}" cy="15" r="4" fill="none" stroke="#9a7a3e" stroke-width="2"/>`).join("")}
    <path d="M6 418Q30 404 58 420Q30 436 6 424Z" fill="${GOLD}" stroke="#9a7a3e" stroke-width="1.4"/>
    <path d="M18 426V448" stroke="${GOLD}" stroke-width="3"/><path d="M11 448H25L28 486H8Z" fill="${GOLD}"/><path d="M12 456V486M18 456V486M24 456V486" stroke="#9a7a3e" stroke-width="1"/><circle cx="18" cy="448" r="5" fill="${GOLD_HI}"/>
  </svg>`;
  // じゅうたん（だ円、1100×140）
  function rugSVG() {
    let ring = ""; const N = 26;
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, x = 550 + Math.cos(a) * 452, y = 70 + Math.sin(a) * 48; ring += i % 2 ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="${GOLD}" opacity=".8"/>` : `<path d="${s4(x, y, 7)}" fill="${GOLD_HI}" opacity=".9" transform="translate(0 0)"/>`; }
    return `<svg viewBox="0 0 1100 140" aria-hidden="true">
      <ellipse cx="550" cy="74" rx="548" ry="64" fill="#000" opacity=".25"/>
      <ellipse cx="550" cy="70" rx="540" ry="62" fill="${NAVY_D}"/><ellipse cx="550" cy="70" rx="528" ry="56" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <ellipse cx="550" cy="70" rx="500" ry="52" fill="${NAVY}"/>${ring}
      <ellipse cx="550" cy="70" rx="410" ry="40" fill="none" stroke="${GOLD}" stroke-width="1.6" opacity=".7"/>
      <ellipse cx="550" cy="70" rx="400" ry="38" fill="#24357a"/>
      <ellipse cx="550" cy="70" rx="300" ry="28" fill="none" stroke="#cfe0ff" stroke-width="1" stroke-dasharray="6 8" opacity=".35"/>
      <g transform="translate(550 70) scale(1 .42)"><circle r="46" fill="${NAVY_D}" stroke="${GOLD}" stroke-width="3"/><path d="${moonD(-4, 0, 30)}" fill="${GOLD_HI}"/>
        ${[[-120, -20], [120, 10], [-200, 30], [210, -30], [-70, 60], [80, -64]].map(([x, y], i) => `<path d="${s4(x, y, i % 2 ? 9 : 13)}" fill="#fff1c2" opacity=".85"/>`).join("")}</g>
    </svg>`;
  }
  function yarnSVG() {
    const ball = (x, y, r, c, d) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#shYs)"/><path d="M${x - r * .7} ${y - r * .3}q${r * .7} ${r * .5} ${r * 1.4} 0M${x - r * .75} ${y + r * .15}q${r * .75} ${r * .5} ${r * 1.5} 0M${x - r * .5} ${y - r * .7}q${r * .5} ${r * .4} ${r} 0" stroke="${d}" stroke-width="1.6" fill="none"/>`;
    return `<svg viewBox="0 0 170 130" aria-hidden="true">
      <ellipse cx="85" cy="124" rx="78" ry="7" fill="#000" opacity=".35"/>
      ${ball(50, 62, 22, "#2f4f86", "#1d2b60")}${ball(90, 56, 25, "#7c3b3f", "#5a2a2e")}${ball(126, 66, 20, "#44694c", "#2e4a34")}${ball(72, 44, 16, "#d6b062", "#9a7a3e")}
      <path d="M110 50L150 8M122 54L160 14" stroke="#c99c71" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="8" r="4" fill="#d6b062"/><circle cx="160" cy="14" r="4" fill="#d6b062"/>
      <path d="M14 70Q18 122 48 122H122Q152 122 156 70Z" fill="url(#shW1)"/><path d="M18 82H152M22 96H148M28 110H142" stroke="#5b3d2b" stroke-width="3" opacity=".6"/><path d="M12 70H158" stroke="#c99c71" stroke-width="6" stroke-linecap="round"/>
      <path d="M30 120Q14 128 4 124" stroke="#2f4f86" stroke-width="2" fill="none"/>
    </svg>`;
  }
  const slippersSVG = () => `<svg viewBox="0 0 150 56" aria-hidden="true">
    ${[[40, 30, -6], [106, 34, 5]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse cx="0" cy="8" rx="36" ry="8" fill="#000" opacity=".28"/><ellipse cx="0" cy="0" rx="34" ry="14" fill="url(#shWool)" stroke="#cbbd9f" stroke-width="1.2"/>${sheepFace(-17, -1, 11)}</g>`).join("")}</svg>`;
  // 窓から床へ落ちる月の光（ランプを消すと、よく見える）
  const moonlitSVG = () => `<svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true"><path d="M150 0H450L600 160H0Z" fill="url(#shMoonLit)"/></svg>`;

  function roomHTML() {
    const W = 1600, A = atW(W), sp = spW(W), C = 760;
    const art = (x, y, w, h, svg, cls = "", extra = "") => `<div class="sh-art ${cls}" style="${A(x, y, w, h)}${extra}">${svg}</div>`;
    let s = `<div class="sh-room-wrap">${defsSVG()}<div class="sh-paper" style="${A(0, 0, W, 1000)}"></div>`;
    s += art(0, 0, W, 44, crownSVG());
    s += art(0, 620, W, 240, wainscotSVG());
    // 窓のある奥まり（館とおなじ月の窓・大アーチ・柱）
    s += `<div class="sh-alcove" style="${A(500, 120, 520, 740)}"></div>`;
    s += `<div class="sh-winglow" style="${A(C - 330, 200, 660, 640)}"></div>`;
    const wp = ctx.parts().window; if (wp) { const wq = ctx.placePart(wp, [530, 990, 830]); s += sp("window", 530, 990, 830) + `<div class="glass" style="${A(wq.x, wq.y, wq.w, wq.h)}">${ctx.glassSVG()}</div>`; }
    s += `<div class="sh-shoot" style="${A(620, 300, 300, 230)}border-radius:40% 40% 10% 10%"><i></i></div>`;
    s += sp("grand_arch", 480, 1040, 180);
    [480, 1040].forEach((x) => { s += sp("pillar", x - 33, x + 33, 838) + sp("tama", x - 14, x + 14, 151) + `<div class="sh-blue" style="${A(x - 40, 96, 80, 80)}"></div>`; });
    s += art(492, 138, 140, 720, curtainSVG()) + art(888, 138, 140, 720, curtainSVG(), "", flipX);
    // 右の本棚（トルサの本）
    s += sp("bookcase_b2", 1075, 1555, 868, flipX);
    // 星のガーランド（左右）
    s += art(1050, 118, 550, 124, garlandSVG(550, 36, 1));
    // 床・月の光・じゅうたん
    s += `<div class="sh-floor" style="${A(0, 860, W, 140)}"></div><div class="sh-skirt" style="${A(0, 852, W, 12)}"></div>`;
    s += art(250, 862, 1100, 140, rugSVG());
    s += art(480, 855, 600, 145, moonlitSVG(), "sh-moonlit");
    // 窓の下：トルサの机（ランプと百合）
    s += sp("desk", 570, 950, 860) + `<div class="sh-warm sh-lamp" style="${A(753, 520, 200, 180)}"></div>` + sp("flower_lily", 884, 930, 714);
    // 左：天蓋のベッド・ナイトテーブル・スリッパ／右：毛糸のかご・鉢植え
    s += art(0, 110, 470, 760, bedSVG());
    const wisp = `<svg viewBox="0 0 12 32" aria-hidden="true"><path d="M6 30q-5 -7 0 -14q5 -7 0 -14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/></svg>`;
    s += art(445, 662, 120, 210, nightstandSVG()) + `<div class="sh-warm sh-lamp" style="${A(440, 600, 140, 140)}animation-delay:-2s"></div>`;
    s += `<div class="sh-steam" style="${A(517, 684, 12, 32)}">${wisp}</div><div class="sh-steam" style="${A(528, 686, 12, 32)}">${wisp}</div>`;
    s += art(300, 884, 150, 56, slippersSVG());
    s += art(962, 762, 156, 120, yarnSVG());
    s += sp("tree_small_a", 1508, 1598, 866);
    s += sp("front_plant", -150, 230, 1080, "opacity:.95;") + sp("front_plant", 1370, 1750, 1080, flipX + "opacity:.95;");
    // ランプを消したときの暗がりと、そのとき光るもの（電球・月の光）
    s += `<div class="sh-dark" style="${A(0, 0, W, 1000)}"></div>`;
    s += `<div class="sh-night" style="${A(0, 0, W, 1000)}">${art(1050, 118, 550, 124, garlandSVG(550, 36, 1), "sh-bulbs")}${art(480, 855, 600, 145, moonlitSVG())}</div>`;
    SPOTS.forEach(([x, y, w, h, key, label]) => { s += `<button class="sh-spot" type="button" data-sh="${key}" style="${A(x, y, w, h)}" aria-label="${esc(label)}"></button>`; });
    return s + `</div>`;
  }
  // 部屋の中のしかけ（さわったところ・ランプ・ときどき流れ星）
  let shootT = 0;
  function mount(stage) {
    const room = $("room");
    room.classList.remove("sh-lamp-off");
    if (!stage.__shClick) stage.addEventListener("click", stage.__shClick = (e) => {
      if (!document.querySelector(".room-sheep")) return;
      const b = e.target.closest(".sh-spot"); if (!b) return;
      const key = b.dataset.sh;
      ctx.SFX.play(key === "sheepLamp" ? "tap" : "hover");
      if (key === "sheepLamp") { const off = !room.classList.contains("sh-lamp-off"); room.classList.toggle("sh-lamp-off", off); say(off ? "sheepLampOff" : "sheepLampOn"); return; }
      say(key);
    });
    const shoot = () => { const i = stage.querySelector(".sh-shoot i"); if (!i) return; i.classList.remove("go"); void i.offsetWidth; i.style.left = (40 + Math.random() * 40) + "%"; i.style.top = (10 + Math.random() * 30) + "%"; i.classList.add("go"); shootT = setTimeout(shoot, 7000 + Math.random() * 9000); };
    clearTimeout(shootT); shootT = setTimeout(shoot, 3500);
  }
  function unmount() { clearTimeout(shootT); const room = $("room"); if (room) room.classList.remove("sh-lamp-off"); }

  window.__shCam = onCam;
  return {
    owns: (id) => id === ROOM_ID,
    roomHTML, mount, unmount,
    roomCenter: () => .5,
    onHall: (id) => { if (id === "main") setTimeout(addCorridor, 0); },
    onCam,
    enterLine: () => say("enterSheep"),
    leaveLine: () => say("backFromSheep")
  };
};
