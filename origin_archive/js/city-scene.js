/* ============================================================================
   js/city-scene.js — 都市の中（横に広がる街並み・調べる場所・キャラクター）
   街の見た目は data/cities.js の scene、キャラクターは data/characters.js で決まります。
   通常は編集不要。
   ============================================================================ */
(function () {
  const C = OA.City = {};
  const WORLD = 3000, GROUND = 850;
  const LAYERS = { far: .22, mid: .55, near: 1 };

  let view, canvas, ctx, stage, track, fx, minimap, mmView;
  let city = null, S = 1, DPR = 1, VW = 1000, MAX = 2000, camX = 0, vel = 0;
  let running = false, lastT = 0, built = null, imgBg = null;
  let particles = [], walkers = [], extras = {};
  const met = new Set(), punched = new Set(), pokes = {};
  C.dragMoved = false;
  C.onBack = () => {}; C.onArticle = () => {};

  /* ---------------- 色の小道具 ---------------- */
  const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgba = (h, a) => { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; };
  const shadeHex = (h, k) => { const c = hexRgb(h).map(v => OA.clamp(Math.round(v * k), 0, 255)); return `rgb(${c[0]},${c[1]},${c[2]})`; };

  /* ---------------- 建物の形 ---------------- */
  function windows(g, x, top, w, h, glow, r, density = .35) {
    const cw = 14, ch = 20;
    g.fillStyle = rgba(glow, .85);
    for (let yy = top + 16; yy < top + h - 24; yy += ch + 10)
      for (let xx = x + 12; xx < x + w - 18; xx += cw + 10)
        if (r() < density) g.fillRect(xx, yy, cw, ch);
  }
  function roofCurve(g, x, y, w, lift) {
    g.beginPath(); g.moveTo(x - w * .18, y);
    g.quadraticCurveTo(x + w * .5, y - lift * 1.8, x + w * 1.18, y);
    g.quadraticCurveTo(x + w * .5, y - lift * .9, x - w * .18, y); g.fill();
  }
  const SHAPES = {
    box(g, x, b, w, h, col, glow, r) { g.fillStyle = col; g.fillRect(x, b - h, w, h); windows(g, x, b - h, w, h, glow, r); },
    tower(g, x, b, w, h, col, glow, r) {
      w *= .55; h *= 1.35; g.fillStyle = col; g.fillRect(x, b - h, w, h);
      g.fillRect(x + w * .45, b - h - 60, 4, 60); g.fillStyle = glow; g.beginPath(); g.arc(x + w * .45 + 2, b - h - 62, 5, 0, 7); g.fill();
      windows(g, x, b - h, w, h, glow, r, .45);
    },
    dome(g, x, b, w, h, col, glow, r) {
      const hh = h * .55; g.fillStyle = col; g.fillRect(x, b - hh, w, hh);
      g.beginPath(); g.ellipse(x + w / 2, b - hh, w / 2, w * .45, 0, Math.PI, 0); g.fill();
      g.fillRect(x + w / 2 - 3, b - hh - w * .45 - 30, 6, 32);
      g.fillStyle = rgba(glow, .8); for (let i = 0; i < 3; i++) g.fillRect(x + w * (.2 + i * .25), b - hh * .7, 10, hh * .4);
    },
    spire(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; g.fillRect(x, b - h, w, h);
      g.beginPath(); g.moveTo(x - 6, b - h); g.lineTo(x + w / 2, b - h - w * 1.6); g.lineTo(x + w + 6, b - h); g.fill();
      g.fillStyle = rgba(glow, .85);
      g.beginPath(); const ax = x + w / 2, ay = b - h * .55; g.moveTo(ax - 12, ay + 40); g.lineTo(ax - 12, ay); g.quadraticCurveTo(ax, ay - 26, ax + 12, ay); g.lineTo(ax + 12, ay + 40); g.fill();
    },
    pagoda(g, x, b, w, h, col, glow, r) {
      const tiers = 2 + Math.floor(r() * 3); let y = b, ww = w;
      g.fillStyle = col;
      for (let i = 0; i < tiers; i++) {
        const th = h / tiers; g.fillRect(x + (w - ww) / 2, y - th, ww, th);
        g.fillStyle = rgba(glow, .7); g.fillRect(x + (w - ww) / 2 + ww * .2, y - th * .7, ww * .6, th * .3); g.fillStyle = col;
        roofCurve(g, x + (w - ww) / 2, y - th, ww, 22); y -= th + 10; ww *= .78;
      }
      g.fillRect(x + w / 2 - 3, y - 30, 6, 40);
    },
    coral(g, x, b, w, h, col, glow, r) {
      g.strokeStyle = col; g.lineCap = 'round';
      const branch = (px, py, ang, len, th, d) => {
        const nx = px + Math.cos(ang) * len, ny = py + Math.sin(ang) * len;
        g.lineWidth = th; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
        if (d > 0) { branch(nx, ny, ang - .35 - r() * .3, len * .72, th * .7, d - 1); branch(nx, ny, ang + .35 + r() * .3, len * .72, th * .7, d - 1); }
        else { g.fillStyle = rgba(glow, .9); g.beginPath(); g.arc(nx, ny, 4, 0, 7); g.fill(); }
      };
      branch(x + w / 2, b, -Math.PI / 2, h * .38, 18, 4);
    },
    tent(g, x, b, w, h, col, glow, r) {
      h *= .6; g.fillStyle = col; g.beginPath(); g.moveTo(x, b); g.quadraticCurveTo(x + w * .3, b - h * .4, x + w / 2, b - h); g.quadraticCurveTo(x + w * .7, b - h * .4, x + w, b); g.fill();
      g.fillRect(x + w / 2 - 2, b - h - 30, 4, 30); g.fillStyle = glow; g.beginPath(); g.moveTo(x + w / 2 + 2, b - h - 30); g.lineTo(x + w / 2 + 26, b - h - 22); g.lineTo(x + w / 2 + 2, b - h - 14); g.fill();
      g.fillStyle = rgba(glow, .75); g.beginPath(); g.moveTo(x + w / 2 - 14, b); g.lineTo(x + w / 2, b - h * .35); g.lineTo(x + w / 2 + 14, b); g.fill();
    },
    cake(g, x, b, w, h, col, glow, r) {
      const tiers = 2 + Math.floor(r() * 2); let y = b, ww = w;
      for (let i = 0; i < tiers; i++) {
        const th = h * .8 / tiers; g.fillStyle = col; g.fillRect(x + (w - ww) / 2, y - th, ww, th);
        g.fillStyle = rgba(glow, .85); g.beginPath(); const xs = x + (w - ww) / 2; g.moveTo(xs, y - th);
        for (let k = 0; k <= 8; k++) g.quadraticCurveTo(xs + ww * (k - .5) / 8, y - th + 18 + (k % 2) * 10, xs + ww * k / 8, y - th);
        g.fill(); y -= th; ww *= .72;
      }
      g.fillStyle = glow; g.beginPath(); g.arc(x + w / 2, y - 12, 12, 0, 7); g.fill();
    },
    ice(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; g.beginPath(); g.moveTo(x, b);
      const n = 4 + Math.floor(r() * 3);
      for (let i = 0; i <= n; i++) { const px = x + w * i / n; g.lineTo(px - w / n / 2, b - h * (.4 + r() * .6)); g.lineTo(px, b - h * (.15 + r() * .3)); }
      g.lineTo(x + w, b); g.fill();
      g.strokeStyle = rgba(glow, .5); g.lineWidth = 2; g.stroke();
    },
    crystal(g, x, b, w, h, col, glow, r) {
      for (let i = 0; i < 3; i++) {
        const cx = x + w * (.2 + i * .3), hh = h * (.6 + r() * .7), ww = 14 + r() * 18;
        g.fillStyle = col; g.beginPath(); g.moveTo(cx - ww, b); g.lineTo(cx - ww * .6, b - hh * .8); g.lineTo(cx, b - hh); g.lineTo(cx + ww * .6, b - hh * .8); g.lineTo(cx + ww, b); g.fill();
        g.strokeStyle = rgba(glow, .7); g.lineWidth = 2; g.beginPath(); g.moveTo(cx, b - hh); g.lineTo(cx, b); g.stroke();
      }
    },
    mushroom(g, x, b, w, h, col, glow, r) {
      const cx = x + w / 2, hh = h * .7;
      g.fillStyle = col; g.fillRect(cx - w * .08, b - hh, w * .16, hh);
      g.beginPath(); g.ellipse(cx, b - hh, w * .55, w * .28, 0, Math.PI, 0); g.fill();
      g.fillStyle = rgba(glow, .9);
      for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(cx + (r() - .5) * w * .8, b - hh - r() * w * .2, 4 + r() * 6, 0, 7); g.fill(); }
      g.fillStyle = rgba(glow, .25); g.beginPath(); g.ellipse(cx, b - hh + 6, w * .5, 10, 0, 0, 7); g.fill();
    },
    gear(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; g.fillRect(x + w * .4, b - h * .6, w * .2, h * .6);
      gearPath(g, x + w / 2, b - h * .6, w * .55, 10); g.fill();
      g.fillStyle = rgba(glow, .5); g.beginPath(); g.arc(x + w / 2, b - h * .6, w * .14, 0, 7); g.fill();
    },
    chimney(g, x, b, w, h, col, glow, r) {
      const hh = h * .5; g.fillStyle = col; g.fillRect(x, b - hh, w, hh);
      g.beginPath(); g.moveTo(x, b - hh); for (let i = 0; i < 4; i++) { g.lineTo(x + w * (i + .5) / 4, b - hh - 26); g.lineTo(x + w * (i + 1) / 4, b - hh); } g.fill();
      for (let i = 0; i < 2; i++) g.fillRect(x + w * (.15 + i * .45), b - h * 1.1, 18, h * .6);
      windows(g, x, b - hh, w, hh, glow, r, .5);
    },
    blob(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; g.save(); g.translate(x + w / 2, b); g.rotate((r() - .5) * .3);
      g.beginPath(); g.moveTo(-w / 2, 0);
      g.bezierCurveTo(-w * .7, -h * .6, -w * .1, -h * 1.2, w * .1, -h);
      g.bezierCurveTo(w * .6, -h * .9, w * .7, -h * .4, w / 2, 0); g.fill();
      g.fillStyle = rgba(glow, .9); g.beginPath(); g.arc(0, -h * .55, w * .14, 0, 7); g.fill();
      g.fillRect(-w * .25, -h * .3, w * .16, h * .3);
      g.restore();
    },
    pier(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; const top = b - 70;
      g.fillRect(x - 20, top, w + 40, 14);
      for (let px = x; px <= x + w; px += 40) g.fillRect(px, top, 8, 90);
      g.fillRect(x + w * .3, top - h * .5, w * .4, h * .5);
      g.fillStyle = rgba(glow, .85); g.fillRect(x + w * .38, top - h * .38, w * .1, 20);
    },
    mast(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; const deck = b - 40;
      g.beginPath(); g.moveTo(x - 10, deck); g.lineTo(x + w + 30, deck); g.lineTo(x + w, b + 10); g.lineTo(x + 10, b + 10); g.fill();
      for (let i = 0; i < 2; i++) {
        const mx = x + w * (.3 + i * .4), mh = h * (1 - i * .2);
        g.fillRect(mx, deck - mh, 5, mh);
        g.fillStyle = rgba(glow, .35); g.beginPath(); g.moveTo(mx + 6, deck - mh + 10); g.quadraticCurveTo(mx + 60, deck - mh * .6, mx + 6, deck - 30); g.fill(); g.fillStyle = col;
      }
    },
    stall(g, x, b, w, h, col, glow, r) {
      w *= .8; const hh = 120 + r() * 50; g.fillStyle = col; g.fillRect(x, b - hh, w, hh);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? col : rgba(glow, .8); g.beginPath(); g.moveTo(x - 10 + i * (w + 20) / 6, b - hh); g.lineTo(x - 10 + (i + 1) * (w + 20) / 6, b - hh); g.lineTo(x - 10 + (i + .5) * (w + 20) / 6, b - hh + 28); g.fill(); }
      g.fillStyle = rgba(glow, .5); g.fillRect(x + 10, b - hh + 46, w - 20, hh - 80);
    },
    island(g, x, b, w, h, col, glow, r) {
      const y = b - h * 1.1 - r() * 140, d = Math.min(110, h * .3);
      g.fillStyle = col; g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x + w + 20, y); g.lineTo(x + w * .65, y + d * .7); g.lineTo(x + w * .45, y + d); g.lineTo(x + w * .3, y + d * .6); g.fill();
      g.fillRect(x + w * .2, y - 70, w * .3, 70); g.beginPath(); g.ellipse(x + w * .7, y, w * .2, 60, 0, Math.PI, 0); g.fill();
      g.fillStyle = rgba(glow, .9); g.fillRect(x + w * .27, y - 50, 14, 20);
    },
    stalactite(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col;
      for (let i = 0; i < 3; i++) { const cx = x + w * (.2 + i * .3), hh = 120 + r() * h; g.beginPath(); g.moveTo(cx - 26, -10); g.lineTo(cx, hh); g.lineTo(cx + 26, -10); g.fill(); }
      SHAPES.box(g, x, b, w * .8, h * .6, col, glow, r);
    },
    cistern(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; const top = b - h;
      g.fillRect(x + w * .2, top + 80, 8, h - 80); g.fillRect(x + w * .8 - 8, top + 80, 8, h - 80);
      g.beginPath(); g.ellipse(x + w / 2, top + 50, w * .45, 60, 0, 0, 7); g.fill();
      g.fillStyle = rgba(glow, .7); g.fillRect(x + w * .1, top + 46, w * .8, 8);
    },
    shell(g, x, b, w, h, col, glow, r) {
      const W2 = 1100, H2 = 460, cx = x + W2 / 2;
      g.fillStyle = col; g.beginPath(); g.ellipse(cx, b + 40, W2 / 2, H2, 0, Math.PI, 0); g.fill();
      g.strokeStyle = rgba(glow, .25); g.lineWidth = 6;
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(cx + i * 180, b - H2 * .45, 90, 70, 0, 0, 7); g.stroke(); }
      for (let i = 0; i < 9; i++) { g.fillStyle = rgba(glow, .8); g.fillRect(cx - 380 + i * 90, b - H2 * .25 - r() * 120, 10, 14); }
    },
    arch(g, x, b, w, h, col, glow, r) {
      g.fillStyle = col; g.beginPath(); g.rect(x, b - h, w, h);
      const n = Math.max(2, Math.round(w / 60)), aw = w / n * .55;
      for (let i = 0; i < n; i++) {
        const ax = x + w / n * (i + .5);
        g.moveTo(ax - aw / 2, b); g.lineTo(ax - aw / 2, b - h * .45); g.arc(ax, b - h * .45, aw / 2, Math.PI, 0); g.lineTo(ax + aw / 2, b);
      }
      g.fill('evenodd');
      g.fillStyle = rgba(glow, .5); g.fillRect(x, b - h - 8, w, 8);
    },
  };
  function gearPath(g, cx, cy, rad, teeth) {
    g.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = i / teeth * Math.PI * 2, a1 = a0 + Math.PI / teeth * .45, a2 = a0 + Math.PI / teeth, a3 = a2 + Math.PI / teeth * .45;
      const ro = rad, ri = rad * .8;
      g.lineTo(cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri); g.lineTo(cx + Math.cos(a1) * ro, cy + Math.sin(a1) * ro);
      g.lineTo(cx + Math.cos(a2) * ro, cy + Math.sin(a2) * ro); g.lineTo(cx + Math.cos(a3) * ri, cy + Math.sin(a3) * ri);
    }
    g.closePath();
  }

  /* ---------------- 層ごとに街並みを描いておく ---------------- */
  function buildLayers() {
    const sc = city.scene, P = sc.palette;
    const out = {};
    const spec = {
      far: { base: 760, hmin: 220, hmax: 470, wmin: 90, wmax: 200, gap: [-30, 30], col: P.far },
      mid: { base: 805, hmin: 160, hmax: 340, wmin: 100, wmax: 220, gap: [10, 90], col: P.mid },
      near: { base: GROUND, hmin: 90, hmax: 230, wmin: 110, wmax: 240, gap: [120, 320], col: P.near },
    };
    for (const key of ['far', 'mid', 'near']) {
      const f = LAYERS[key], sp = spec[key];
      const span = MAX * f + VW;
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(span * S * DPR); cv.height = Math.ceil(1000 * S * DPR);
      const g = cv.getContext('2d'); g.scale(S * DPR, S * DPR);
      const r = OA.rng(city.id + key);
      const kinds = (sc.layers && sc.layers[key]) || ['box'];
      if (key === 'near') {
        drawGround(g, span, P);
      }
      let x = -40 - r() * 60;
      while (x < span + 40) {
        const kind = kinds[Math.floor(r() * kinds.length)];
        const w = OA.lerp(sp.wmin, sp.wmax, r()), h = OA.lerp(sp.hmin, sp.hmax, r());
        if (kind === 'shell' && key !== 'far') { x += w; continue; }
        (SHAPES[kind] || SHAPES.box)(g, x, sp.base, w, h, sp.col, P.glow, r);
        x += (kind === 'shell' ? 1150 : w) + OA.lerp(sp.gap[0], sp.gap[1], r());
      }
      if (key !== 'near') {
        // 遠くほど空の色に溶ける
        g.fillStyle = rgba(P.sky[1], key === 'far' ? .45 : .18); g.globalCompositeOperation = 'source-atop';
        g.fillRect(0, 0, span, 1000); g.globalCompositeOperation = 'source-over';
        if (key === 'mid') { g.fillStyle = P.mid; g.fillRect(0, 805, span, 200); }
        if (key === 'far') { g.fillStyle = P.far; g.fillRect(0, 760, span, 240); }
      }
      out[key] = { cv, f };
    }
    return out;
  }
  function drawGround(g, span, P) {
    const ground = city.scene.ground;
    const gr = g.createLinearGradient(0, GROUND, 0, 1000);
    gr.addColorStop(0, P.ground); gr.addColorStop(1, shadeHex(P.ground, .6));
    g.fillStyle = gr; g.fillRect(0, GROUND - 4, span, 1000);
    if (ground === 'lake') {
      g.fillStyle = rgba(P.glow, .12); g.fillRect(0, GROUND + 50, span, 70);
      g.fillStyle = rgba(P.glow, .25); for (let x = 0; x < span; x += 60) g.fillRect(x, GROUND + 70 + (x % 120 ? 10 : 30), 30, 3);
    }
    if (ground === 'cloud') {
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let x = -40; x < span + 80; x += 90) { g.beginPath(); g.arc(x, GROUND + 10 + (x % 180 ? 0 : 14), 70, 0, 7); g.fill(); }
    }
    g.fillStyle = rgba(P.glow, .18); g.fillRect(0, GROUND - 4, span, 3);
  }

  /* ---------------- 動くもの ---------------- */
  function initDynamic() {
    const r = OA.rng(city.id + 'dyn'), sc = city.scene;
    particles = [];
    const type = sc.particles || 'none';
    const count = { bubbles: 70, snow: 140, sand: 90, steam: 16, sparkle: 80, spores: 90, petals: 50, embers: 60, dust: 50 }[type] || 0;
    for (let i = 0; i < count; i++) particles.push(newParticle(type, r, true));
    walkers = [];
    const n = 7;
    for (let i = 0; i < n; i++) walkers.push({ x: r() * WORLD, dir: r() < .5 ? -1 : 1, speed: 18 + r() * 26, h: 100 + r() * 50, phase: r() * 10, depth: r() * 30 });
    extras = { list: sc.extras || [], r };
    imgBg = null;
    if (sc.image) { const im = new Image(); im.onload = () => { imgBg = im; }; im.src = sc.image; }
  }
  function newParticle(type, r, initial) {
    const p = { type, x: r() * (VW + 200) - 100, y: initial ? r() * 1000 : 0, s: 2 + r() * 4, a: .3 + r() * .6, v: 20 + r() * 40, ph: r() * 6 };
    if (type === 'bubbles' || type === 'steam' || type === 'spores' || type === 'embers') p.y = initial ? p.y : 1000 + r() * 40;
    if (type === 'steam') { p.s = 14 + r() * 26; p.a = .04 + r() * .06; }
    if (type === 'sand') { p.x = initial ? p.x : -20; p.y = 500 + r() * 500; }
    return p;
  }

  function drawSky(t) {
    const P = city.scene.palette, w = VW;
    const gr = ctx.createLinearGradient(0, 0, 0, 1000);
    gr.addColorStop(0, P.sky[0]); gr.addColorStop(1, P.sky[1]);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, 1000);
    const cel = city.scene.celestial;
    const cx = w * .72 - camX * .04, cy = 200;
    if (cel === 'sun') {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260); g.addColorStop(0, 'rgba(255,250,220,.95)'); g.addColorStop(.25, 'rgba(255,240,200,.5)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - 260, cy - 260, 520, 520);
    } else if (cel === 'moon') {
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, 7); ctx.fill();
      ctx.fillStyle = '#f4f0ff'; ctx.beginPath(); ctx.arc(cx, cy, 56, 0, 7); ctx.fill();
      ctx.fillStyle = P.sky[0]; ctx.beginPath(); ctx.arc(cx + 22, cy - 12, 50, 0, 7); ctx.fill();
      // 星
      const r = OA.rng(city.id + 'stars'); ctx.fillStyle = '#fff';
      for (let i = 0; i < 90; i++) { const sx = r() * (w + 400) - camX * .03 % 400, sy = r() * 520; ctx.globalAlpha = .3 + .5 * Math.abs(Math.sin(t + i)); ctx.fillRect(sx, sy, 2, 2); }
      ctx.globalAlpha = 1;
    }
  }

  function drawExtras(t, phase) {
    const P = city.scene.palette;
    for (const ex of extras.list) {
      if (phase === 'back') {
        if (ex === 'aurora') {
          for (let k = 0; k < 3; k++) {
            ctx.fillStyle = rgba(k === 1 ? '#b79bff' : P.glow, .12);
            ctx.beginPath(); ctx.moveTo(0, 300);
            for (let x = 0; x <= VW; x += 40) ctx.lineTo(x, 140 + k * 60 + Math.sin(x * .004 + t * .4 + k) * 60 - camX * .0);
            for (let x = VW; x >= 0; x -= 40) ctx.lineTo(x, 300 + k * 60 + Math.sin(x * .003 + t * .3 + k) * 50);
            ctx.fill();
          }
        }
        if (ex === 'rays') {
          for (let k = 0; k < 6; k++) {
            const x0 = ((k * 320 - camX * .1) % (VW + 400) + VW + 400) % (VW + 400) - 200 + Math.sin(t * .3 + k) * 40;
            const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(200,255,255,.16)'); g.addColorStop(1, 'rgba(200,255,255,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + 90, 0); ctx.lineTo(x0 + 260, 900); ctx.lineTo(x0 + 120, 900); ctx.fill();
          }
        }
        if (ex === 'robot') {
          const bx = 700 - camX * LAYERS.far, by = 760;
          ctx.fillStyle = shadeHex(P.far, 1.15);
          ctx.fillRect(bx, by - 520, 170, 260); ctx.fillRect(bx + 40, by - 600, 90, 80);
          ctx.fillRect(bx - 50, by - 500, 50, 200); ctx.fillRect(bx + 170, by - 500, 50, 200);
          ctx.fillRect(bx + 20, by - 260, 50, 260); ctx.fillRect(bx + 100, by - 260, 50, 260);
          ctx.fillStyle = Math.sin(t * 1.5) > -.8 ? P.glow : P.far; ctx.fillRect(bx + 55, by - 575, 60, 12);
        }
        if (ex === 'gears') {
          for (let k = 0; k < 4; k++) {
            const gx = 300 + k * 760 - camX * LAYERS.far * 1.3, gy = 300 + (k % 2) * 160, rad = 120 + (k % 3) * 60;
            ctx.save(); ctx.translate(gx, gy); ctx.rotate(t * (k % 2 ? -.15 : .2));
            ctx.fillStyle = rgba(P.glow, .1); gearPath(ctx, 0, 0, rad, 14); ctx.fill();
            ctx.fillStyle = P.sky[0]; ctx.beginPath(); ctx.arc(0, 0, rad * .35, 0, 7); ctx.fill();
            ctx.restore();
          }
        }
        if (ex === 'airship') {
          for (let k = 0; k < 3; k++) {
            const ax = ((t * (14 + k * 6) + k * 900) % (VW + 600)) - 300 - camX * .1, ay = 160 + k * 110;
            ctx.fillStyle = rgba(P.mid, .9); ctx.beginPath(); ctx.ellipse(ax, ay, 90 - k * 15, 30 - k * 4, 0, 0, 7); ctx.fill();
            ctx.fillRect(ax - 25, ay + 26, 50, 16);
            ctx.fillStyle = P.glow; ctx.fillRect(ax - 18, ay + 30, 8, 6); ctx.fillRect(ax + 2, ay + 30, 8, 6);
          }
        }
        if (ex === 'clouds') {
          ctx.fillStyle = 'rgba(255,255,255,.55)';
          for (let k = 0; k < 7; k++) {
            const cx = ((k * 420 - camX * .15 + t * 6) % (VW + 600) + VW + 600) % (VW + 600) - 300, cy = 120 + (k % 3) * 120;
            for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(cx + j * 46, cy + (j % 2) * 12, 40 + (j % 2) * 16, 0, 7); ctx.fill(); }
          }
        }
      }
      if (phase === 'mid') {
        if (ex === 'jelly') {
          for (let k = 0; k < 8; k++) {
            const jx = (k * 410 + 150) - camX * LAYERS.mid + Math.sin(t * .4 + k) * 30, jy = 200 + (k % 4) * 110 + Math.sin(t * .8 + k * 2) * 40;
            const pul = 1 + Math.sin(t * 2 + k) * .12;
            ctx.fillStyle = rgba(P.glow, .35); ctx.beginPath(); ctx.ellipse(jx, jy, 34 * pul, 26 / pul, 0, Math.PI, 0); ctx.fill();
            ctx.strokeStyle = rgba(P.glow, .3); ctx.lineWidth = 2;
            for (let l = -2; l <= 2; l++) { ctx.beginPath(); ctx.moveTo(jx + l * 10, jy); ctx.quadraticCurveTo(jx + l * 12 + Math.sin(t * 2 + l) * 8, jy + 40, jx + l * 8, jy + 70); ctx.stroke(); }
          }
        }
        if (ex === 'runes') {
          for (let k = 0; k < 6; k++) {
            const rx = k * 520 + 260 - camX * LAYERS.mid, ry = 260 + (k % 2) * 140 + Math.sin(t * .6 + k) * 20;
            ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * (k % 2 ? .2 : -.15));
            ctx.strokeStyle = rgba(P.glow, .45); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.stroke();
            ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.moveTo(Math.cos(a) * 40, Math.sin(a) * 40); ctx.lineTo(Math.cos(a + Math.PI / 2) * 40, Math.sin(a + Math.PI / 2) * 40); } ctx.stroke();
            ctx.restore();
          }
        }
        if (ex === 'train') {
          const off = -camX * LAYERS.mid, y = 470;
          ctx.fillStyle = shadeHex(P.mid, .8); ctx.fillRect(0, y, VW, 14);
          for (let x = (off % 260 + 260) % 260 - 260; x < VW; x += 260) ctx.fillRect(x + 110, y, 22, 805 - y);
          const tx = ((t * 160) % (MAX * LAYERS.mid + VW + 900)) - 450 + off;
          ctx.fillStyle = shadeHex(P.mid, 1.4);
          for (let c = 0; c < 4; c++) { ctx.fillRect(tx - c * 130, y - 46, 120, 46); ctx.fillStyle = P.glow; for (let wdw = 0; wdw < 4; wdw++) ctx.fillRect(tx - c * 130 + 12 + wdw * 26, y - 36, 14, 12); ctx.fillStyle = shadeHex(P.mid, 1.4); }
        }
      }
      if (phase === 'front') {
        if (ex === 'lanterns') {
          const off = -camX;
          for (let k = 0; k < 6; k++) {
            const x0 = k * 520 + 80 + off, x1 = x0 + 380, y0 = 560;
            if (x1 < -50 || x0 > VW + 50) continue;
            ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 + 90, x1, y0); ctx.stroke();
            for (let i = 1; i < 8; i++) {
              const u = i / 8, lx = OA.lerp(x0, x1, u), ly = y0 + 4 * 90 * u * (1 - u) * .5 * 2 * .5 + 6;
              ctx.fillStyle = rgba(P.glow, .25 + .2 * Math.sin(t * 2 + i)); ctx.beginPath(); ctx.arc(lx, ly + 10, 16, 0, 7); ctx.fill();
              ctx.fillStyle = P.glow; ctx.beginPath(); ctx.arc(lx, ly + 10, 6, 0, 7); ctx.fill();
            }
          }
        }
        if (ex === 'waves') {
          for (let k = 0; k < 3; k++) {
            ctx.fillStyle = rgba(k ? '#ffffff' : '#7fb0e6', k ? .12 : .35);
            ctx.beginPath(); ctx.moveTo(0, 1000);
            for (let x = 0; x <= VW; x += 30) ctx.lineTo(x, GROUND + 20 + k * 40 + Math.sin((x + camX) * .02 + t * (1.4 + k * .3)) * 8);
            ctx.lineTo(VW, 1000); ctx.fill();
          }
        }
      }
    }
  }

  function drawWalkers(t, dt) {
    const P = city.scene.palette, swim = /海底/.test(city.type);
    ctx.fillStyle = shadeHex(P.near, .55);
    for (const w of walkers) {
      w.x += w.dir * w.speed * dt;
      if (w.x < 40 || w.x > WORLD - 40) w.dir *= -1;
      const sx = w.x - camX; if (sx < -60 || sx > VW + 60) continue;
      const by = GROUND + 6 + w.depth + (swim ? Math.sin(t * 1.5 + w.phase) * 10 - 30 : 0), h = w.h;
      const step = Math.sin(t * 6 + w.phase) * (swim ? 0 : 1);
      ctx.beginPath(); ctx.arc(sx, by - h + 12, 12, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sx - 16, by - h * .4); ctx.quadraticCurveTo(sx - 15, by - h + 26, sx, by - h + 26); ctx.quadraticCurveTo(sx + 15, by - h + 26, sx + 16, by - h * .4); ctx.fill();
      ctx.fillRect(sx - 9 + step * 4, by - h * .42, 7, h * .42); ctx.fillRect(sx + 2 - step * 4, by - h * .42, 7, h * .42);
    }
  }

  function drawParticles(t, dt) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]; const r = extras.r;
      switch (p.type) {
        case 'bubbles': p.y -= p.v * dt; p.x += Math.sin(t + p.ph) * .3; break;
        case 'snow': p.y += p.v * .6 * dt; p.x += Math.sin(t * .8 + p.ph) * .4 - .2; break;
        case 'sand': p.x += p.v * 6 * dt; p.y += Math.sin(t * 2 + p.ph) * .5; break;
        case 'steam': p.y -= p.v * .5 * dt; p.s += dt * 8; p.a -= dt * .01; break;
        case 'spores': case 'embers': p.y -= p.v * .3 * dt; p.x += Math.sin(t * .6 + p.ph) * .5; break;
        case 'petals': p.y += p.v * .5 * dt; p.x += Math.sin(t + p.ph) * 1.2 + .4; break;
        default: p.x += Math.sin(t * .3 + p.ph) * .2; p.y += Math.cos(t * .3 + p.ph) * .2;
      }
      const wrap = p.y < -40 || p.y > 1040 || p.x < -150 || p.x > VW + 150 || p.a <= 0;
      if (wrap) { particles[i] = newParticle(p.type, r, false); if (p.type === 'snow' || p.type === 'petals') particles[i].y = -10; continue; }
      const P = city.scene.palette;
      switch (p.type) {
        case 'bubbles': ctx.strokeStyle = `rgba(220,255,255,${p.a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.s + 1, 0, 7); ctx.stroke(); break;
        case 'snow': ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .7, 0, 7); ctx.fill(); break;
        case 'sand': ctx.fillStyle = `rgba(255,230,180,${p.a * .7})`; ctx.fillRect(p.x, p.y, p.s * 3, 1.5); break;
        case 'steam': ctx.fillStyle = `rgba(255,245,235,${Math.max(0, p.a)})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); break;
        case 'sparkle': ctx.fillStyle = rgba(P.glow, p.a * Math.abs(Math.sin(t * 2 + p.ph))); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4); ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); ctx.restore(); break;
        case 'spores': ctx.fillStyle = rgba(P.glow, p.a * .8); ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .6, 0, 7); ctx.fill(); break;
        case 'embers': ctx.fillStyle = rgba(P.glow, p.a * .6); ctx.fillRect(p.x, p.y, 2, 2); break;
        case 'petals': ctx.fillStyle = `rgba(255,190,215,${p.a})`; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.s * 1.4, p.s * .7, t + p.ph, 0, 7); ctx.fill(); break;
        default: ctx.fillStyle = `rgba(255,255,255,${p.a * .3})`; ctx.fillRect(p.x, p.y, 2, 2);
      }
    }
  }

  /* ---------------- 毎フレーム ---------------- */
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now; const t = now / 1000;
    if (!dragging) { camX += vel * dt; vel *= Math.pow(.04, dt); if (Math.abs(vel) < 2) vel = 0; }
    camX = OA.clamp(camX, 0, MAX);
    ctx.setTransform(S * DPR, 0, 0, S * DPR, 0, 0);
    drawSky(t);
    drawExtras(t, 'back');
    if (imgBg) {
      const iw = (MAX * .6 + VW), ih = 1000; ctx.drawImage(imgBg, -camX * .6, 0, iw, ih);
    } else {
      blit('far'); blit('mid');
      drawExtras(t, 'mid');
      blit('near');
    }
    drawWalkers(t, dt);
    drawExtras(t, 'front');
    drawParticles(t, dt);
    track.style.transform = `translate3d(${-camX * S}px,0,0)`;
    mmView.style.left = (camX / WORLD * 100) + '%';
    mmView.style.width = (VW / WORLD * 100) + '%';
  }
  function blit(key) {
    const L = built[key]; if (!L) return;
    ctx.drawImage(L.cv, -camX * L.f, 0, L.cv.width / (S * DPR), 1000);
  }

  /* ---------------- 画面サイズ ---------------- */
  function layout() {
    const w = view.clientWidth, h = view.clientHeight;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    S = h / 1000; VW = w / S; MAX = Math.max(0, WORLD - VW);
    canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
    track.style.width = WORLD * S + 'px';
    built = buildLayers();
    camX = OA.clamp(camX, 0, MAX);
  }

  /* ---------------- 街の中の人と場所 ---------------- */
  function silhouette(color) {
    return `<svg viewBox="0 0 100 260" aria-hidden="true"><g fill="${color}">
      <circle cx="50" cy="32" r="22"/><path d="M50 58c-26 0-34 18-36 44l-6 118c0 10 8 16 16 16h52c8 0 16-6 16-16l-6-118c-2-26-10-44-36-44z"/>
      <rect x="30" y="226" width="14" height="34" rx="5"/><rect x="56" y="226" width="14" height="34" rx="5"/></g>
      <path d="M28 26c4-16 40-20 46 2-12-6-30-8-46-2z" fill="rgba(0,0,0,.25)"/></svg>`;
  }
  function buildStage() {
    track.innerHTML = '';
    const P = city.scene.palette;
    for (const sp of city.spots || []) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'spot'; b.style.left = (sp.x / WORLD * 100) + '%'; b.style.top = (sp.y / 10) + '%';
      b.style.setProperty('--sc', P.glow);
      b.innerHTML = `<span class="spot-gem"></span><span class="spot-name">${OA.esc(sp.name)}</span>`;
      b.addEventListener('click', e => { if (C.dragMoved) return; e.stopPropagation(); b.classList.add('seen'); showSpot(sp); });
      track.appendChild(b);
    }
    for (const ch of ORIGIN.characters.filter(c => c.city === city.id)) {
      const el = document.createElement('div');
      el.className = 'char' + (ch.sample ? ' sample' : ''); el.dataset.id = ch.id;
      el.style.left = (ch.x / WORLD * 100) + '%';
      el.style.height = ((ch.height || 260) / 10) + '%';
      el.style.bottom = ((1000 - GROUND - 14) / 10) + '%';
      const face = ch.face || { top: 3, size: 46 };
      el.innerHTML = `<button type="button" class="char-body" aria-label="${OA.esc(ch.name)}と話す">${ch.image ? `<img src="${OA.esc(ch.image)}" alt="">` : silhouette(ch.color || '#444')}</button>
        <button type="button" class="char-face" aria-label="${OA.esc(ch.name)}の顔をつつく" style="top:${face.top}%;width:${face.size}%;aspect-ratio:1"></button>
        <span class="char-tag">${OA.esc(ch.name)}</span>`;
      el.querySelector('.char-body').addEventListener('click', e => { if (C.dragMoved) return; e.stopPropagation(); talk(ch); });
      el.querySelector('.char-face').addEventListener('click', e => { if (C.dragMoved) return; e.stopPropagation(); poke(ch, el); });
      track.appendChild(el);
    }
    // ミニマップ
    minimap.querySelectorAll('.mm-dot').forEach(d => d.remove());
    for (const sp of city.spots || []) { const d = document.createElement('span'); d.className = 'mm-dot'; d.style.left = (sp.x / WORLD * 100) + '%'; minimap.appendChild(d); }
    for (const ch of ORIGIN.characters.filter(c => c.city === city.id)) { const d = document.createElement('span'); d.className = 'mm-dot char'; d.style.left = (ch.x / WORLD * 100) + '%'; minimap.appendChild(d); }
  }

  function showSpot(sp) {
    closeDialog();
    OA.$('#spot-name').textContent = sp.name; OA.$('#spot-text').textContent = sp.text || '';
    OA.$('#spot-card').hidden = false;
  }

  /* ---------------- 会話 ---------------- */
  let typing = null;
  function pickLines(ch) {
    const T = ch.talk || [];
    let pool;
    if (punched.has(ch.id)) { pool = T.filter(x => x.when === 'afterPunch'); punched.delete(ch.id); }
    if (!pool || !pool.length) pool = !met.has(ch.id) ? T.filter(x => x.when === 'first') : T.filter(x => x.when === 'again');
    if (!pool.length) pool = T.length ? T : [{ lines: ['……'] }];
    met.add(ch.id);
    return pool[Math.floor(Math.random() * pool.length)].lines;
  }
  function typeText(el, text, done) {
    if (typing) clearInterval(typing);
    let i = 0; el.textContent = '';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = text; done && done(); return; }
    typing = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(typing); typing = null; done && done(); } }, 32);
  }
  function talk(ch) {
    OA.$('#spot-card').hidden = true;
    const lines = pickLines(ch);
    const dlg = OA.$('#dialog');
    OA.$('#dialog-name').textContent = ch.name;
    OA.$('#dialog-portrait').innerHTML = ch.image ? `<img src="${OA.esc(ch.image)}" alt="">` : silhouette(ch.color || '#444');
    dlg.hidden = false;
    let idx = 0;
    const acts = OA.$('#dialog-actions');
    const show = () => {
      acts.innerHTML = '';
      typeText(OA.$('#dialog-text'), lines[idx], () => {
        if (idx < lines.length - 1) addAct('次へ', () => { idx++; show(); }, true);
        else {
          addAct('もう一度話す', () => talk(ch));
          addAct('この人について', () => C.onArticle(ch.id));
          addAct('閉じる', closeDialog);
        }
      });
    };
    const addAct = (label, fn, primary) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' btn-primary' : ''); b.textContent = label; b.onclick = fn; acts.appendChild(b); if (primary) b.focus({ preventScroll: true }); };
    show();
  }
  function closeDialog() { OA.$('#dialog').hidden = true; if (typing) { clearInterval(typing); typing = null; } }
  C.closeDialog = closeDialog;

  /* ---------------- 顔をつつく ---------------- */
  function poke(ch, el) {
    closeDialog();
    const list = ch.poke && ch.poke.length ? ch.poke : [{ say: '……？', react: 'flinch' }];
    const n = pokes[ch.id] = (pokes[ch.id] || 0) + 1;
    const p = list[Math.min(n - 1, list.length - 1)];
    el.querySelectorAll('.bubble,.vein').forEach(b => b.remove());
    el.classList.remove('r-flinch', 'r-angry', 'r-dodge', 'r-punch'); void el.offsetWidth;
    el.classList.add('r-' + (p.react || 'flinch'));
    const bub = document.createElement('span'); bub.className = 'bubble'; bub.textContent = p.say; el.appendChild(bub);
    if (p.react === 'angry' || p.react === 'punch') { const v = document.createElement('span'); v.className = 'vein'; v.textContent = '💢'; el.appendChild(v); }
    setTimeout(() => { bub.remove(); el.querySelectorAll('.vein').forEach(v => v.remove()); }, 1800);
    if (p.react === 'punch') {
      setTimeout(() => punch(el), 420);
      punched.add(ch.id); pokes[ch.id] = 0;
    }
  }
  function punch(el) {
    const rect = el.querySelector('.char-face').getBoundingClientRect();
    const vr = view.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - vr.left, cy = rect.top + rect.height / 2 - vr.top;
    view.classList.remove('shake'); void view.offsetWidth; view.classList.add('shake');
    fx.innerHTML = `
      <div class="hit-flash"></div>
      <svg class="hit-burst" style="left:${cx}px;top:${cy}px" viewBox="-100 -100 200 200" aria-hidden="true">
        <polygon fill="#fff" stroke="#1c1430" stroke-width="4" points="${burstPoints()}"/>
        <polygon fill="#ffd75a" points="${burstPoints(.55)}"/></svg>
      <span class="hit-word" style="left:${cx}px;top:${cy - 40}px">ドゴッ！</span>
      <svg class="crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="rgba(255,255,255,.85)" stroke-width=".35">${crackLines(cx / vr.width * 100, cy / vr.height * 100)}</g></svg>`;
    setTimeout(() => { fx.innerHTML = ''; }, 1700);
  }
  function burstPoints(k = 1) {
    const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = (i % 2 ? 50 : 96) * k; pts.push((Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1)); }
    return pts.join(' ');
  }
  function crackLines(x, y) {
    let s = ''; const r = OA.rng('crack' + Date.now());
    for (let i = 0; i < 9; i++) {
      let px = x, py = y, a = i / 9 * Math.PI * 2 + r() * .4; s += `<path d="M${px} ${py}`;
      for (let k = 0; k < 5; k++) { a += (r() - .5) * .8; px += Math.cos(a) * (6 + r() * 8); py += Math.sin(a) * (6 + r() * 8); s += ` L${px.toFixed(1)} ${py.toFixed(1)}`; }
      s += '"/>';
    }
    return s;
  }

  /* ---------------- 操作 ---------------- */
  let dragging = false;
  function bind() {
    let lastX = 0, startX = 0, lastMove = 0;
    stage.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; C.dragMoved = false; lastX = startX = e.clientX; vel = 0; lastMove = performance.now();
      stage.classList.add('dragging');
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      if (Math.abs(e.clientX - startX) > 6) C.dragMoved = true;
      if (!C.dragMoved) return;
      const now = performance.now(), dtm = Math.max(1, now - lastMove); lastMove = now;
      camX -= dx / S; vel = -dx / S / (dtm / 1000) * .6;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return; dragging = false; stage.classList.remove('dragging');
      setTimeout(() => { C.dragMoved = false; }, 0);
    });
    stage.addEventListener('wheel', e => { e.preventDefault(); camX += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) / S; vel = 0; }, { passive: false });
    const pan = d => { vel = d * 1400; };
    OA.$('#pan-left').addEventListener('click', () => pan(-1));
    OA.$('#pan-right').addEventListener('click', () => pan(1));
    minimap.addEventListener('click', e => { const r = minimap.getBoundingClientRect(); C.panTo((e.clientX - r.left) / r.width * WORLD); });
    window.addEventListener('keydown', e => {
      if (!running || OA.$('#archive').hidden === false) return;
      if (e.key === 'ArrowLeft') pan(-.6); if (e.key === 'ArrowRight') pan(.6);
    });
    stage.addEventListener('click', () => { if (!C.dragMoved) { OA.$('#spot-card').hidden = true; } });
    OA.$('#spot-close').addEventListener('click', () => { OA.$('#spot-card').hidden = true; });
    let rt; window.addEventListener('resize', () => { if (!running) return; clearTimeout(rt); rt = setTimeout(layout, 150); });
  }
  C.panTo = function (x, dur = 900) {
    const from = camX, to = OA.clamp(x - VW / 2, 0, MAX); vel = 0;
    OA.tween(dur, e => { camX = OA.lerp(from, to, e); });
  };

  C.init = function () {
    view = OA.$('#city-view'); canvas = OA.$('#city-canvas'); ctx = canvas.getContext('2d');
    stage = OA.$('#city-stage'); fx = OA.$('#city-fx'); minimap = OA.$('#minimap'); mmView = OA.$('#minimap-view');
    track = document.createElement('div'); track.className = 'stage-track'; stage.appendChild(track);
    bind();
  };

  C.open = function (c, opts = {}) {
    city = c; view.hidden = false;
    OA.$('#city-name').textContent = c.name; OA.$('#city-type').textContent = c.type + ' · ' + c.en;
    OA.$('#spot-card').hidden = true; closeDialog();
    camX = 0; layout(); initDynamic(); buildStage();
    const focusX = opts.focusX != null ? opts.focusX : WORLD / 2;
    const target = OA.clamp(focusX - VW / 2, 0, MAX);
    camX = OA.clamp(target - 380, 0, MAX);
    running = true; lastT = performance.now(); requestAnimationFrame(frame);
    // 入った瞬間の演出
    view.classList.remove('entering'); void view.offsetWidth; view.classList.add('entering');
    const tt = OA.$('#city-enter-title');
    tt.querySelector('.cet-en').textContent = c.en; tt.querySelector('.cet-jp').textContent = c.name;
    tt.classList.remove('show'); void tt.offsetWidth; tt.classList.add('show');
    const from = camX; OA.tween(2400, e => { if (!dragging) camX = OA.lerp(from, target, e); });
    if (opts.highlight) setTimeout(() => {
      const el = track.querySelector(`.char[data-id="${opts.highlight}"]`);
      if (el) { el.classList.add('r-flinch'); setTimeout(() => el.classList.remove('r-flinch'), 600); }
    }, 2400);
  };
  C.close = function () { running = false; view.hidden = true; closeDialog(); };
  C.current = () => city;
})();
