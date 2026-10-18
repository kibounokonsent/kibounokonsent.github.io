/* =========================================================
   トルサ図書館：トルサの動きと、さわったときの反応
   ---------------------------------------------------------
   index.html から読み込まれます（index.html の中の大きな <script> より先に読み込む）。
   ここだけ直せば、トルサの動き・さわったときの反応・セリフの選び方を変えられます。

   いじりやすい場所（このファイルの中を検索してください）
   ・FACE        … 表情の名前と、頬の赤み（blush）・汗（sweat）・平らな目（flat）・しょんぼり（droop）。blush＝照れ（うっすら）、soblush＝赤面、sad＝しょんぼり
   ・DEPTH       … 顔を向けたときの、部品ごとの奥行き（立体に見せる量）
   ・pose(       … ふだんの動き（呼吸・頭のゆらぎ・耳・アホ毛・まばたき）
   ・case "head" … さわったときの動き（head / horn / ear / nose）。胸と腰は event/touch-specialness.js
   ・PARTS       … さわる場所ごとに、使うセリフ（torsa.json の名前）と表情（胸と腰は event/touch-specialness.json）
   ・startHold   … 頭を押したままにしたときの反応（間隔は 1050、ひとことは 3600 ミリ秒後）
   ・placeZones  … さわれる場所の位置（rig.json の zones から決める）

   さわれる場所のボタン（.pat-zone）は index.html の <div class="torsa-fig"> の中にあります。
   ボタンに data-part="名前" を付けて、rig.json の zones（tools/rig/finish_rig.py）に同じ名前の範囲を足し、
   下の PARTS とさわったときの動き（case "名前"）を足すと、新しい場所を増やせます。
   ========================================================= */
window.TorsaModule = (ctx) => {
  "use strict";
  // 胸・腰の特別なさわられ方は event/touch-specialness.js にまとめてあります（なくても、ほかの場所は動きます）
  const SPECIAL = Object.assign({ parts: {}, motions: {}, cooldown: {}, afterReact: {}, fallbackMs: {} }, window.TorsaTouchSpecial);
  // index.html から受け取るもの。DATA（読み込んだデータ）と mem（来館記録）はあとで中身が入れ替わるので、使うたびに ctx から読む
  const { $, reduced, pick, SFX, FX, say, setFace, save } = ctx;

  /* =========================================================
     トルサ（部品を組み立てて動かす：Live2Dのような動き）
     assets/torsa/rig/rig.json の部品を、読み込みのときに一度だけ絵にしておき、
     毎フレームは「部品の絵をずらして重ねる」だけにする（ベクターを毎回描き直さないので軽い）
     ========================================================= */
  const RIG = (() => {
    const D2R = Math.PI / 180;
    let rig = null, ready = false, cv = null, ctx = null, bmp = {}, boneList = [], boneById = {}, cssH = 0, ppuNow = 1, dpr = 1, building = 0;
    const reacts = [];
    // 表情：blush＝頬の赤み（0〜1）、flat＝目を平らに、sweat＝汗、droop＝しょんぼり（耳がたれて、少しうつむく）
    const FACE = { normal: {}, blush: { blush: .38 }, soblush: { blush: 1 }, sweat: { sweat: 1, flat: true }, surprise: { flat: true }, sad: { flat: true, droop: 1 } };
    const S = { blush: 0, blushTo: 0, flat: false, sweat: 0, sweatTo: 0, droop: 0, droopTo: 0, blinkUntil: 0, nextBlink: 4, nextFlick: 7, flick: null, deepFrom: -99 };
    /* 立体的な動き：顔の向き（A）・髪（H、少し遅れてついてくる）・からだ（B、顔の向きに少しだけついてくる）。
       どれも「ばね」で動かすので、止まるときに少しだけ行き過ぎて戻る */
    const A = { x: 0, y: 0, vx: 0, vy: 0 }, H = { x: 0, y: 0, vx: 0, vy: 0 }, B = { x: 0, y: 0, vx: 0, vy: 0 };
    const spring = (o, tx, ty, k, c, dt) => { o.vx += ((tx - o.x) * k - o.vx * c) * dt; o.vy += ((ty - o.y) * k - o.vy * c) * dt; o.x += o.vx * dt; o.y += o.vy * dt; };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    // マウス（指）の位置。しばらく動かなければ、ゆっくり正面に戻る
    const PTR = { x: 0, y: 0, at: -1e9 };
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { PTR.x = e.clientX; PTR.y = e.clientY; PTR.at = performance.now(); } }, { passive: true });
    /* 部品ごとの奥行き。z が大きいほど手前（顔の向きに合わせて大きく動く）、マイナスは奥（逆に動く）。
       g＝どの向きで動くか（head＝顔、hair＝髪、body＝からだ）、fs＝横を向いたときの縮み（耳や角は大きめ） */
    const DEPTH = {
      hairBack: { g: "hair", z: -6 }, earL: { g: "head", z: -2, fs: .16 }, earR: { g: "head", z: -2, fs: .16 },
      hornL: { g: "head", z: -3, fs: .1 }, hornR: { g: "head", z: -3, fs: .1 }, face: { g: "head", z: 0 },
      hairFront: { g: "hair", z: 4 }, ahoge: { g: "hair", z: 1 }, eyes: { g: "head", z: 3 }, eyesFlat: { g: "head", z: 3 },
      blush: { g: "head", z: 2.5 }, lockL: { g: "hair", z: 3.5 }, lockR: { g: "hair", z: 3.5 },
      neck: { g: "body", z: 3 }, brooch: { g: "body", z: 4 }, collarL: { g: "body", z: 1.5 }, collarR: { g: "body", z: 1.5 },
      torso: { g: "body", z: 0 }, sleeveL: { g: "body", z: 1.5 }, sleeveR: { g: "body", z: 1.5 }, cuffL: { g: "body", z: 4 }, book: { g: "body", z: 4.5 },
      capeL: { g: "body", z: 2 }, capeR: { g: "body", z: 2.5 }, capeLiningL: { g: "body", z: -4 }, capeLiningR: { g: "body", z: -4 },
      pants: { g: "legs", z: 0 }, shoeL: { g: "legs", z: 1 }, shoeR: { g: "legs", z: 1 }
    };
    const CENTER = { head: [64, 34], hair: [64, 34], body: [66, 100], legs: [70, 240] };
    const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
    const local = (pv, q) => { const c = Math.cos(q.r * D2R), s = Math.sin(q.r * D2R), a = c * q.sx, b = s * q.sx, cc = -s * q.sy, d = c * q.sy; return [a, b, cc, d, pv[0] + q.x - (a * pv[0] + cc * pv[1]), pv[1] + q.y - (b * pv[0] + d * pv[1])]; };
    const pulse = (t, d) => (t > 0 && t < d ? Math.sin(Math.PI * t / d) : 0);
    const damp = (t, f, k) => (t > 0 ? Math.exp(-k * t) * Math.sin(2 * Math.PI * f * t) : 0);
    const jolt = (t, f, k) => (t > 0 ? Math.min(1, t / .035) * Math.exp(-k * t) * Math.cos(2 * Math.PI * f * t) : 0);

    async function load(url, canvas) {
      cv = canvas; ctx = cv.getContext("2d");
      rig = await fetch(url).then((r) => { if (!r.ok) throw new Error("rig"); return r.json(); });
      boneList = rig.bones.map((b) => ({ ...b, q: { x: 0, y: 0, r: 0, sx: 1, sy: 1 }, m: null }));
      boneList.forEach((b) => { boneById[b.id] = b; });
      await rebuild();
      ready = true;
      addEventListener("resize", () => { clearTimeout(building); building = setTimeout(() => { if (Math.abs(cv.parentElement.clientHeight - cssH) > 8) rebuild(); }, 250); });
      // 設定の「最軽量」を選んだり外したりしたら、その細かさで絵を作り直す
      new MutationObserver(() => { if (targetDpr() !== dpr) { clearTimeout(building); building = setTimeout(rebuild, 120); } }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
      requestAnimationFrame(frame);
      return rig;
    }
    // 絵の細かさ：ふだんは画面の細かさ（2倍まで）。最軽量のときは1倍
    const targetDpr = () => Math.min(document.body.classList.contains("fx-min") ? 1 : 2, devicePixelRatio || 1);
    // 画面の大きさに合わせて、部品を一度だけ絵にしておく
    async function rebuild() {
      const [, , fw, fh] = rig.frame;
      // 新しい大きさの絵をぜんぶ作ってから、キャンバスの大きさを変える（作っているあいだにトルサが消えないように）
      const nH = cv.parentElement.clientHeight || 500, nDpr = targetDpr();
      const cH = Math.round(nH * nDpr), cW = Math.round(nH * nDpr * fw / fh), nppu = cH / fh;
      const pad = 1.5, out = {}, ppu = nppu;
      await Promise.all(rig.parts.map((p) => new Promise((ok) => {
        const [x, y, w, h] = p.bbox, bw = Math.max(1, Math.ceil((w + pad * 2) * ppu)), bh = Math.max(1, Math.ceil((h + pad * 2) * ppu));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${bw}" height="${bh}" viewBox="${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}" preserveAspectRatio="none"><defs>${p.defs}</defs>${p.body}</svg>`;
        const img = new Image(), u = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        img.onload = () => { const c = document.createElement("canvas"); c.width = bw; c.height = bh; c.getContext("2d").drawImage(img, 0, 0, bw, bh); out[p.id] = { c, x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 }; URL.revokeObjectURL(u); ok(); };
        img.onerror = () => { URL.revokeObjectURL(u); ok(); };
        img.src = u;
      })));
      cssH = nH; dpr = nDpr; cv.height = cH; cv.width = cW; ppuNow = nppu;
      bmp = out; stillDrawn = false;
      pose(lastT, performance.now()); draw(lastT);
    }

    /* ---------- 動き：ふだん（呼吸・ゆれ・耳・アホ毛・まばたき） ---------- */
    let idleT = 0, lastNow = 0, lastT = 0, lastDraw = 0, stillDrawn = false;
    function pose(t, now, dt = 0) {
      const q = (id) => boneById[id].q;
      boneList.forEach((b) => Object.assign(b.q, { x: 0, y: 0, r: 0, sx: 1, sy: 1 }));
      const cls = document.body.classList, still = cls.contains("fx-off") || cls.contains("torsa-still") || reduced;
      // ひかえめ：ゆれの大きさを小さく、ゆっくりにする
      const amp = cls.contains("torsa-lite") ? .4 : 1;
      t = cls.contains("torsa-lite") ? t * .7 : t;
      // 呼吸：吸う → 少し止める → ゆっくり吐く（4.6秒）。ときどき深呼吸
      const ph = (t / 4.6) % 1, inhale = ph < .4 ? .5 - .5 * Math.cos(Math.PI * ph / .4) : ph < .52 ? 1 : .5 + .5 * Math.cos(Math.PI * (ph - .52) / .48);
      const deep = Math.max(0, pulse(t - S.deepFrom, 4.6));
      const b = still ? 0 : inhale * (1 + .9 * deep) * (amp < 1 ? .6 : 1);
      q("body").sy = 1 + .011 * b; q("body").sx = 1 + .004 * b;
      if (!still) {
        q("head").r = amp * (.9 * Math.sin(t * .45) + .35 * Math.sin(t * .23 + 1));
        q("head").y = -.25 * b;
        q("neck").r = q("head").r * .25;
        q("ahoge").r = amp * 3.5 * Math.sin(t * 1.3) - q("head").r * 1.2;
        q("lockL").r = -q("head").r * .7 + amp * .7 * Math.sin(t * .9);
        q("lockR").r = -q("head").r * .7 + amp * .7 * Math.sin(t * .9 + 1.3);
        q("capeL").r = amp * .25 * Math.sin(t * .6); q("capeR").r = -amp * .25 * Math.sin(t * .6 + .8);
        // 耳：呼吸に合わせて少し上下。ときどき片耳だけぴくっ
        let lift = 1.6 * b + amp * .6 * Math.sin(t * .7), liftL = lift, liftR = lift;
        if (amp < 1) S.nextFlick = Math.max(S.nextFlick, t + 1);
        else if (t > S.nextFlick) { S.flick = { t0: t, side: Math.random() < .5 ? "L" : "R" }; S.nextFlick = t + 7 + Math.random() * 9; }
        if (S.flick) { const k = 7 * (pulse(t - S.flick.t0, .13) + .7 * pulse(t - S.flick.t0 - .2, .12)); if (S.flick.side === "L") liftL += k; else liftR += k; }
        q("earL").r = liftL; q("earR").r = -liftR;
        // 目：ときどき一瞬だけ平らな目に（まばたきのかわり）
        if (t > S.nextBlink) { S.blinkUntil = t + .16; S.nextBlink = t + 5 + Math.random() * 8; }
      }
      // 顔の向きの目標：ふだんはゆっくり見回す。マウスが動いていれば、そちらを少し見る
      let tx = 0, ty = 0;
      if (!still) {
        tx = amp * (.3 * Math.sin(t * .31) + .15 * Math.sin(t * .53 + 2));
        ty = amp * .16 * Math.sin(t * .41 + 1) - .08 * b;
        const idle = (now - PTR.at) / 1000, w = idle < 2.5 ? 1 : Math.max(0, 1 - (idle - 2.5) / 1.5);
        if (w > 0 && cv) {
          const r = cv.getBoundingClientRect(), [fx, fy, fw, fh] = rig.frame;
          const hx = r.left + (64 - fx) / fw * r.width, hy = r.top + (34 - fy) / fh * r.height;
          const px = clamp((PTR.x - hx) / (innerWidth * .45), -1, 1) * .55 * amp, py = clamp((PTR.y - hy) / (innerHeight * .5), -1, 1) * .45 * amp;
          tx += (px - tx) * w; ty += (py - ty) * w;
        }
      }
      // 動き：さわったときの反応（重ねがけできる）
      let flat = t < S.blinkUntil;
      for (let i = reacts.length - 1; i >= 0; i--) {
        const r = reacts[i], u = (now - r.at) / 1000, sg = r.side === "L" ? 1 : -1;
        if (u > 1.4) { reacts.splice(i, 1); continue; }
        switch (r.part) {
          case "head": // 頭：なでられて、ふにゃっと沈む。耳はたれる。少しうつむく
            ty += .32 * pulse(u, 1);
            q("head").y += .7 * pulse(u, .45); q("head").sy *= 1 - .012 * pulse(u, .45);
            q("earL").r -= 7 * pulse(u, .9); q("earR").r += 7 * pulse(u, .9);
            q("ahoge").r += 6 * damp(u, 3, 4);
            break;
          case "horn": // 角：ぴくっ
            q(r.side === "L" ? "hornL" : "hornR").r += -sg * 4.5 * damp(u, 7, 9);
            tx += sg * .2 * pulse(u, .6);
            q("head").r += sg * .7 * pulse(u, .3);
            q("ahoge").r += 4 * damp(u, 4, 6);
            break;
          case "ear": { // 耳：ぴくぴくっ（さわった方の耳）
            const k = 16 * (pulse(u, .14) + pulse(u - .22, .14));
            tx += sg * .3 * pulse(u, .8);
            if (r.side === "L") { q("earL").r += k; q("earR").r -= 4 * pulse(u - .05, .2); } else { q("earR").r -= k; q("earL").r += 4 * pulse(u - .05, .2); }
            break;
          }
          case "nose": // 鼻：ぴくっ（少し顔を引く）
            q("head").y -= .9 * pulse(u, .28); q("head").sy *= 1 - .012 * pulse(u, .28);
            ty -= .35 * pulse(u, .5);
            q("earL").r += 6 * pulse(u, .35); q("earR").r -= 6 * pulse(u, .35);
            if (u < .35) flat = true;
            break;
          default: { // 胸・腰など：event/touch-specialness.js にまとめた動き
            const m = SPECIAL.motions[r.part]; if (!m) break;
            const o = m({ u, q, pulse, damp, jolt }) || {};
            ty += o.ty || 0; if (o.flat) flat = true;
            break;
          }
        }
      }
      // しょんぼり：耳がたれて、少しうつむく（表情 sad）
      if (S.droop > .01) { q("earL").r -= 11 * S.droop; q("earR").r += 11 * S.droop; q("head").y += .8 * S.droop; ty += .3 * S.droop; q("ahoge").r -= 6 * S.droop; }
      // 向きの目標は決まった範囲におさめる（反応がいくつ重なっても顔がはずれないように）
      tx = clamp(tx, -.8, .8); ty = clamp(ty, -.8, .8);
      // ばねで向きを動かす（髪は少し遅れて、少し揺れ戻る）
      const h = Math.min(.05, dt);
      if (still && !reacts.length) { [A, H, B].forEach((o) => Object.assign(o, { x: 0, y: 0, vx: 0, vy: 0 })); }
      else for (let n = 0; n < 2; n++) { spring(A, tx, ty, 60, 13, h / 2); spring(H, A.x, A.y, 30, 5.5, h / 2); spring(B, A.x * .35, A.y * .25, 20, 8, h / 2); }
      [A, H, B].forEach((o) => { o.x = clamp(o.x, -1, 1); o.y = clamp(o.y, -1, 1); });
      // 向きに合わせて骨も少し動かす：顔を向けた方へ少し傾け、髪は遅れたぶんだけ揺れる
      q("head").r += A.x * 1.4; q("head").x += A.x * .9; q("head").y += A.y * .6;
      q("body").r += B.x * .8;
      const lagX = H.x - A.x, lagY = H.y - A.y;
      q("ahoge").r += -lagX * 16 + lagY * 6; q("lockL").r += -lagX * 9; q("lockR").r += -lagX * 9;
      S.curFlat = flat || S.flat;
      S.blush += (S.blushTo - S.blush) * .08; S.sweat += (S.sweatTo - S.sweat) * .1; S.droop += (S.droopTo - S.droop) * .06;
      // 骨を親から順に重ねる
      boneList.forEach((bn) => { const L = local(bn.pivot, bn.q); bn.m = bn.parent ? mul(boneById[bn.parent].m, L) : L; });
    }
    function draw(t) {
      if (!ready && !Object.keys(bmp).length) return;
      const [fx, fy] = rig.frame;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.imageSmoothingQuality = "high";
      const ppu = ppuNow, V = [ppu, 0, 0, ppu, -fx * ppu, -fy * ppu];
      rig.parts.forEach((p) => {
        const im = bmp[p.id]; if (!im) return;
        if (p.id === "eyes" && S.curFlat) return;
        if (p.id === "eyesFlat" && !S.curFlat) return;
        let a = 1;
        if (p.id === "blush") { a = S.blush; if (a < .02) return; }
        let m = mul(V, boneById[p.bone].m);
        const dp = DEPTH[p.id];
        if (dp) {
          const o = dp.g === "hair" ? H : dp.g === "head" ? A : B, k = dp.g === "legs" ? .4 : 1;
          const ax = o.x * k, ay = o.y * k, [hcx, hcy] = CENTER[dp.g], [bx, by, bw, bh] = p.bbox, cx = bx + bw / 2, cy = by + bh / 2;
          const unit = dp.g === "body" || dp.g === "legs" ? .45 : .55;
          const rel = clamp((cx - hcx) / 24, -1, 1), sx = (1 + (dp.fs ?? .07) * ax * rel) * (1 - .03 * Math.abs(ax)), sy = 1 - .025 * Math.abs(ay);
          const ncx = hcx + (cx - hcx) * (1 - .04 * Math.abs(ax)) + ax * dp.z * unit, ncy = cy + (cy - hcy) * (-.03 * Math.abs(ay)) + ay * dp.z * unit * .7;
          m = mul(m, [sx, 0, 0, sy, ncx - sx * cx, ncy - sy * cy]);
        }
        ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); ctx.globalAlpha = a;
        ctx.drawImage(im.c, im.x, im.y, im.w, im.h);
      });
      ctx.globalAlpha = 1;
      // 汗：頭の右上に小さなしずくを一つだけ
      if (S.sweat > .05) {
        const m = mul(V, boneById.head.m), k = (t * .7) % 1; ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        ctx.globalAlpha = S.sweat * (k < .8 ? 1 : (1 - k) / .2);
        ctx.translate(95, 24 + k * 3); ctx.beginPath(); ctx.moveTo(0, -4); ctx.bezierCurveTo(2.6, -.6, 2.8, 2.6, 0, 2.7); ctx.bezierCurveTo(-2.8, 2.6, -2.6, -.6, 0, -4);
        ctx.fillStyle = "#cdeeff"; ctx.strokeStyle = "#2b4a7a"; ctx.lineWidth = .6; ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(.1, (now - lastNow) / 1000); lastNow = now;
      const cl = document.body.classList;
      if (document.hidden || cl.contains("torsa-away") || cl.contains("reading")) return;
      // 会話・目録のあいだは止める。ひかえめのときは1秒に30回まで
      if (cl.contains("paused") && !reacts.length && !cl.contains("kn-live")) return; // kn-live＝カネルのイベント中（トルサの表情が変わるので動かす）
      if (cl.contains("lite") && now - lastDraw < 32) return;
      // 動きがオフで、さわった反応も表情の変化も終わっているときは、同じ絵なので描き直さない（見た目は同じ）
      const still = cl.contains("fx-off") || cl.contains("torsa-still") || reduced;
      const settled = !reacts.length && S.sweat <= .05 && Math.abs(S.blush - S.blushTo) < .003 && Math.abs(S.sweat - S.sweatTo) < .003 && Math.abs(S.droop - S.droopTo) < .003;
      if (still && settled) { if (stillDrawn) return; stillDrawn = true; } else stillDrawn = false;
      // じっとしているとき（さわっていない・マウスも止まっている）は1秒に30回まで。ゆっくりした呼吸やゆれは、30回でも見た目が変わらない
      // （館内のきらめきの層と同じフレームに描く。描き直しのないフレームができるので軽くなる）
      if (!reacts.length && now - PTR.at > 2500 && Math.round(now / 16.667) % 2 !== 0 && now - lastDraw < 40) return;
      const step = Math.min(.1, (now - (lastDraw || now)) / 1000); lastDraw = now;
      idleT += step; lastT = idleT;
      pose(idleT, now, step); draw(idleT);
    }
    return {
      load,
      get ready() { return ready; },
      get rig() { return rig; },
      react(part, side) { if (!ready || reduced || document.body.classList.contains("torsa-still")) return; const now = performance.now(); const same = reacts.filter((r) => r.part === part), last = same[same.length - 1];
        // 同じところを続けてなでても、動きが積み重なりすぎないようにする（顔の部品がずれないように）
        if (last && now - last.at < (SPECIAL.cooldown[part] ?? 420)) return; if (same.length >= 2) reacts.splice(reacts.indexOf(same[0]), 1); reacts.push({ part, side, at: now }); if (SPECIAL.afterReact[part]) SPECIAL.afterReact[part]({ S, idleT }); },
      face(name) { const f = FACE[name] || FACE.normal; S.blushTo = f.blush || 0; S.sweatTo = f.sweat || 0; S.droopTo = f.droop || 0; S.flat = !!f.flat; if (ready && (reduced || document.body.classList.contains("fx-off") || document.body.classList.contains("torsa-still"))) { S.blush = S.blushTo; S.sweat = S.sweatTo; S.droop = S.droopTo; pose(idleT, performance.now()); draw(idleT); } stillDrawn = false; }
    };
  })();

  /* ---------- さわれる場所の位置：rig.json の zones から決める ----------
     #patZone は "head"、左右がある場所（角・耳）は data-part に L / R を付けた名前（hornL など）、
     ほかは data-part の名前そのまま（nose, chest など）で zones を探す */
  function placeZones(rig) {
    const [fx, fy, fw, fh] = rig.frame, Z = rig.zones || {};
    $("torsaFig").querySelectorAll(".pat-zone").forEach((el) => {
      const part = el.id === "patZone" ? "head" : el.dataset.part;
      const key = el.classList.contains("l") ? part + "L" : el.classList.contains("r") ? part + "R" : part;
      const z = Z[key]; if (!z) return;
      Object.assign(el.style, { left: (z[0] - fx) / fw * 100 + "%", top: (z[1] - fy) / fh * 100 + "%", width: z[2] / fw * 100 + "%", height: z[3] / fh * 100 + "%" });
    });
  }

  /* ---------- トルサにさわる（頭・角・耳・鼻・ブローチ） ---------- */
  function setupTouch() {
    const fig = $("torsaFig");

    // ページを読み込むたびに部位ごとのタッチ回数をリセット
    ctx.mem.touch = {};
    save();

    const PARTS = {
      head:  { lines: "pat", face: "blush" },
      horn:  { lines: "patHorn", face: "surprise" },
      ear:   { lines: "patEar", face: "blush" },
      nose:  { lines: "patNose", face: "blush" },
      ...SPECIAL.parts // 胸・腰：event/touch-specialness.json
    };

    let cool = 0;

    // 部品で動かせないとき（rig.json が読めなかったとき）の、からだ全体の小さな動き
    function react(part, side) {
      if (RIG.ready) { RIG.react(part, side); return; }
      if (document.body.classList.contains("torsa-still")) return;
      const img = $("torsaImg");
      img.animate([{ transform: "none" }, { transform: "translateY(-1%)" }, { transform: "none" }], { duration: SPECIAL.fallbackMs[part] ?? 260, easing: "ease-out" });
    }

    const heart = (x, y) => {
      FX.parts.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1.4 - Math.random(),
        life: 70,
        max: 70,
        size: 16 + Math.random() * 8,
        col: "#ffb8cc",
        star: false,
        heart: true
      });
    };

    function bind(zone) {
      const part = zone.dataset.part || "head";
      const side = zone.classList.contains("l") ? "L" : "R";
      // 胸・腰の設定は event/touch-specialness.json の読みこみが終わったあとに入るので、さわったときに探す
      const cfgNow = () => PARTS[part] || SPECIAL.parts[part] || PARTS.head;

      let down = null;
      let strokes = 0;
      let lastDir = 0;
      // 頭を押したままにしているあいだも、ときどき「なでなで」の反応をする
      let holdTimer = 0, holdStart = 0, holdSaid = false;
      function startHold() {
        clearInterval(holdTimer);
        if (part !== "head") return;
        holdStart = performance.now(); holdSaid = false;
        holdTimer = setInterval(() => {
          if (!down) { clearInterval(holdTimer); return; }
          const held = performance.now() - holdStart;
          if (held < 650) return;
          stroke();
          // 長くなでていると、一度だけひとこと
          if (!holdSaid && held > 3600 && ctx.DATA && performance.now() > cool) {
            const arr = (ctx.DATA.torsa.lines || {}).patHold;
            if (arr && arr.length) { holdSaid = true; cool = performance.now() + 2500; const l = pick(arr); say(typeof l === "string" ? { text: l, face: "blush" } : { face: "blush", ...l }, 4200); }
          }
        }, 1050);
      }
      const stopHold = () => clearInterval(holdTimer);

      function stroke(e) {
        strokes++;
        SFX.play("pat");

        const r = zone.getBoundingClientRect();
        const x = e ? e.clientX : r.left + r.width / 2;
        const y = e ? e.clientY : r.top + r.height / 2;

        react(part, side);

        // きらめきは頭をなでたときだけ、ひかえめに
        if (part === "head" && strokes % 2 === 1) heart(x, y - 10);
        setFace(cfgNow().face, 2600);
      }

      function finish() {
        if (!strokes || !ctx.DATA) return;

        const L = ctx.DATA.torsa.lines || {};
        let arr;
        let reactionFace = cfgNow().face;

        if (part === "head") {
          // 頭：既存のセリフと、たくさん撫でたときのセリフ
          ctx.mem.pats = (ctx.mem.pats || 0) + strokes;

          const key =
            ctx.mem.pats >= (ctx.DATA.torsa.patManyFrom || 12) &&
            L.patMany &&
            Math.random() < 0.5
              ? "patMany"
              : "pat";

          arr = L[key] || L.pat;

          if (key === "patMany") {
            reactionFace = "blush";
          }
        } else {
          // 頭以外：初回だけ専用セリフを使う
          ctx.mem.touch = ctx.mem.touch || {};

          const previous = ctx.mem.touch[part] || 0;
          ctx.mem.touch[part] = previous + 1;

          const first = L[cfgNow().lines + "First"] || [];
          const base = L[cfgNow().lines] || [];

          // 初回用があれば初回用、2回目以降は既存のセリフ
          arr = previous === 0 && first.length ? first : base;

          // 該当するセリフがなければ予備のセリフを使う
          if (!arr.length) {
            arr = L.pat || [];
          }
        }

        save();

        // セリフの連続表示を防ぐ
        if (performance.now() > cool) {
          cool = performance.now() + 1200;
          SFX.play("heart");

          if (arr && arr.length) {
            const line = pick(arr);

            say(
              typeof line === "string"
                ? { text: line, face: reactionFace }
                : { face: reactionFace, ...line },
              5200
            );
          }
        }

        strokes = 0;
      }

      zone.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.setPointerCapture(e.pointerId);

        down = { x: e.clientX, d: 0 };
        lastDir = 0;

        stroke(e);
        startHold();
      });

      zone.addEventListener("pointermove", (e) => {
        if (!down) return;

        const dx = e.clientX - down.x;
        const dir = Math.sign(dx);

        down.d += Math.abs(dx);
        down.x = e.clientX;

        if (
          down.d > 46 ||
          (dir && lastDir && dir !== lastDir && down.d > 18)
        ) {
          stroke(e);
          down.d = 0;
        }

        if (dir) lastDir = dir;
      });

      const up = () => {
        stopHold();
        if (!down) return;

        down = null;
        finish();
      };

      zone.addEventListener("pointerup", up);
      zone.addEventListener("pointercancel", up);

      zone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          stroke();
          finish();
        }
      });

      zone.addEventListener("click", (e) => e.stopPropagation());
    }

    fig.querySelectorAll(".pat-zone").forEach(bind);

    // URLに ?zones を付けると当たり判定を表示
    if (/[?&]zones\b/.test(location.search)) {
      fig.querySelectorAll(".pat-zone").forEach((z) => {
        z.classList.add("debug");
      });
    }
  }

  return { RIG, placeZones, setupTouch };
};
