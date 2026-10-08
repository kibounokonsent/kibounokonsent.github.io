/* ============================================================================
   js/world-map.js — 3D世界地図（three.js）
   世界の形：中央の円盤（中層）を、上下に伸びる◇（八面体）が包む。
   地表の◇の内側が既知の領土、外側の円と八方向の線が未知の領域。
   通常は編集不要。都市の位置などは data/ 側で変更してください。
   ============================================================================ */
(function () {
  const W = OA.World = {};
  const R = 10;          // 円盤の半径 ＝ 既知の領土◇の対角線の半分
  const APEX = 7;        // ◇の上下の頂点の高さ
  const SPAN = R * 1.04; // 地表テクスチャの範囲

  let renderer, scene, camera, raycaster, canvas, labelsEl;
  let running = false, lastT = 0, idleSince = 0, focusedId = null, layerMode = 'all';
  let underside, fogPts, starPts, terrainMat;
  const cam = { theta: 0.75, phi: 0.62, radius: 62, tx: 0, ty: 0, tz: 0 };
  const markers = [];
  let stopTween = null;
  let heightAt = () => 0;

  W.onSelect = () => {};

  /* ---------------- 地形（平面地図から作る。地図画像がなければ自動生成） ---------------- */
  function makeNoise(seed) {
    const r = OA.rng(seed), P = new Float32Array(512 * 512);
    for (let i = 0; i < P.length; i++) P[i] = r();
    const h = (x, y) => P[((y & 511) << 9) | (x & 511)];
    const vn = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return OA.lerp(OA.lerp(h(xi, yi), h(xi + 1, yi), u), OA.lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
    };
    return (x, y) => { let a = 0, amp = .5, f = 1; for (let o = 0; o < 5; o++) { a += amp * vn(x * f + 100, y * f + 100); f *= 2.03; amp *= .5; } return a; };
  }
  const sstep = (a, b, x) => { const t = OA.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const mix = (c1, c2, t) => [OA.lerp(c1[0], c2[0], t), OA.lerp(c1[1], c2[1], t), OA.lerp(c1[2], c2[2], t)];
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  function buildTerrain() {
    const N = 256, fbm = makeNoise('origin-terrain');
    const H = new Float32Array(N * N);
    const landCities = ORIGIN.cities.filter(c => c.layer === 'middle' && !/海/.test(c.type));
    const seaCities = ORIGIN.cities.filter(c => /海/.test(c.type));
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i / (N - 1) * 2 - 1) * SPAN, z = (j / (N - 1) * 2 - 1) * SPAN;
      let s = fbm(x * .3, z * .3);
      for (const c of landCities) { const p = c.move ? c.move.center : c.pos; const d = (x - p[0]) ** 2 + (z - p[1]) ** 2; s += .2 * Math.exp(-d / 5); }
      for (const c of seaCities) { const d = (x - c.pos[0]) ** 2 + (z - c.pos[1]) ** 2; s -= .5 * Math.exp(-d / 4.5); }
      s -= .32 * sstep(7.2, 10.2, Math.abs(x) + Math.abs(z));
      H[j * N + i] = s - .52;
    }
    heightAt = (x, z) => {
      const i = OA.clamp(Math.round((x / SPAN * .5 + .5) * (N - 1)), 0, N - 1);
      const j = OA.clamp(Math.round((z / SPAN * .5 + .5) * (N - 1)), 0, N - 1);
      return Math.max(0, H[j * N + i]) * 1.6;
    };

    // 色を塗る
    const small = document.createElement('canvas'); small.width = small.height = N;
    const sctx = small.getContext('2d'), img = sctx.createImageData(N, N);
    const C = {
      deep: hex('#141747'), shallow: hex('#2f4597'), beach: hex('#cbbf98'), low: hex('#5d8460'), hill: hex('#8b8d66'),
      peak: hex('#bdb3a6'), ice: hex('#e4ecf7'), sand: hex('#dcb66f'), fog: hex('#1a1530'), fogLand: hex('#2d2648'),
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i / (N - 1) * 2 - 1) * SPAN, z = (j / (N - 1) * 2 - 1) * SPAN, k = (j * N + i) * 4;
      const h = H[j * N + i], r = Math.hypot(x, z), d1 = Math.abs(x) + Math.abs(z);
      if (r > R) { img.data[k + 3] = 0; continue; }
      let col;
      const hx = (H[j * N + Math.min(N - 1, i + 1)] - H[j * N + Math.max(0, i - 1)]);
      const hz = (H[Math.min(N - 1, j + 1) * N + i] - H[Math.max(0, j - 1) * N + i]);
      const shade = 1 - (hx + hz) * 6;
      if (d1 <= R) {
        if (h <= 0) col = mix(C.shallow, C.deep, OA.clamp(-h * 5, 0, 1));
        else {
          const cold = sstep(-4.6, -6.8, z), hot = sstep(3.6, 5.4, z) * sstep(-1.5, 0.5, x);
          col = h < .015 ? C.beach : mix(C.low, C.hill, OA.clamp(h * 4, 0, 1));
          if (h > .17) col = mix(col, C.peak, OA.clamp((h - .17) * 6, 0, 1));
          col = mix(col, C.sand, hot); col = mix(col, C.ice, cold);
          col = col.map(v => v * shade);
        }
      } else {
        // 未知の領域：霞がかかり、陸地の影だけがうっすら見える
        const f = fbm(x * 1.1 + 40, z * 1.1);
        col = mix(C.fog, h > 0 ? C.fogLand : C.fog, .8);
        col = col.map(v => v * (.8 + f * .5));
      }
      img.data[k] = col[0]; img.data[k + 1] = col[1]; img.data[k + 2] = col[2]; img.data[k + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);

    const S = 2048, cv = document.createElement('canvas'); cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(small, 0, 0, S, S);
    const P = (x, z) => [(x / SPAN * .5 + .5) * S, (z / SPAN * .5 + .5) * S];
    const diamond = () => { ctx.beginPath(); [[R, 0], [0, R], [-R, 0], [0, -R]].forEach((p, i) => { const q = P(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); };
    const circle = rad => { ctx.beginPath(); const c = P(0, 0); ctx.arc(c[0], c[1], rad / SPAN * .5 * S, 0, Math.PI * 2); };
    // 既知の領土の経緯線
    ctx.save(); diamond(); ctx.clip();
    ctx.strokeStyle = 'rgba(230,220,255,.10)'; ctx.lineWidth = 2;
    for (let g = -R; g <= R; g += 2) {
      let a = P(g, -R), b = P(g, R); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      a = P(-R, g); b = P(R, g); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
    // 未知の領域の斜線
    ctx.save(); circle(R); ctx.clip();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.strokeStyle = 'rgba(180,160,255,.08)'; ctx.lineWidth = 3;
    for (let t = -S; t < S * 2; t += 26) { ctx.beginPath(); ctx.moveTo(t, 0); ctx.lineTo(t - S, S); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // 既知の領土を塗り直して斜線を消す
    ctx.save(); diamond(); ctx.clip(); ctx.drawImage(small, 0, 0, S, S);
    ctx.strokeStyle = 'rgba(230,220,255,.10)'; ctx.lineWidth = 2;
    for (let g = -R; g <= R; g += 2) {
      let a = P(g, -R), b = P(g, R); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      a = P(-R, g); b = P(R, g); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
    // ◇の境界
    ctx.save(); ctx.shadowColor = '#b79bff'; ctx.shadowBlur = 24; ctx.strokeStyle = '#d9c8ff'; ctx.lineWidth = 6; diamond(); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = 'rgba(217,200,255,.6)'; ctx.lineWidth = 4; circle(R - .05); ctx.stroke();
    // 原点
    const c0 = P(0, 0);
    ctx.strokeStyle = '#efe6ff'; ctx.lineWidth = 4;
    [26, 46].forEach(rr => { ctx.beginPath(); ctx.arc(c0[0], c0[1], rr, 0, Math.PI * 2); ctx.stroke(); });
    return cv;
  }

  /* ---------------- 小物 ---------------- */
  function glowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  function lineMat(color, opacity) { return new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }); }
  function seg(points) { return new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p[0], p[1], p[2]))); }

  function buildWorldShape(root) {
    const corners = [[R, 0, 0], [0, 0, R], [-R, 0, 0], [0, 0, -R]];
    // 八面体（上層・下層を包む◇）
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x8c6cff, transparent: true, opacity: .035, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const pos = [];
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4];
      pos.push(...a, ...b, 0, APEX, 0, ...a, ...b, 0, -APEX, 0);
    }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    root.add(new THREE.Mesh(fg, faceMat));
    const edges = [];
    corners.forEach(c => { edges.push(c, [0, APEX, 0], c, [0, -APEX, 0]); });
    root.add(new THREE.LineSegments(seg(edges), lineMat(0xb79bff, .45)));

    // 縦の軸（世界の芯）
    for (const rot of [0, Math.PI / 2]) {
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, APEX, 0), new THREE.Vector3(1.6, 0, 0), new THREE.Vector3(0, -APEX, 0));
      const curve2 = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, APEX, 0), new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(0, -APEX, 0));
      for (const cu of [curve, curve2]) {
        const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(cu.getPoints(40)), lineMat(0xd8c8ff, .22));
        l.rotation.y = rot; root.add(l);
      }
    }

    // 上層・下層の面
    for (const L of ORIGIN.world.layers) {
      if (!L.y) continue;
      const s = R * (1 - Math.abs(L.y) / APEX);
      const shape = new THREE.Shape([new THREE.Vector2(s, 0), new THREE.Vector2(0, s), new THREE.Vector2(-s, 0), new THREE.Vector2(0, -s)]);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: 0xa080ff, transparent: true, opacity: .05, side: THREE.DoubleSide, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.y = L.y; root.add(m);
      const ring = new THREE.LineLoop(seg([[s, L.y, 0], [0, L.y, s], [-s, L.y, 0], [0, L.y, -s]]), lineMat(0xcbb6ff, .35));
      ring.userData.layer = L.id; root.add(ring);
    }

    // 外側の円と八方向の線（未知の領域）
    const circ = (rad, op) => {
      const pts = []; for (let i = 0; i <= 128; i++) { const a = i / 128 * Math.PI * 2; pts.push([Math.cos(a) * rad, 0.02, Math.sin(a) * rad]); }
      root.add(new THREE.Line(seg(pts), lineMat(0xb79bff, op)));
    };
    circ(R * 1.22, .35); circ(R * 1.5, .12);
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
      const g = seg([[ca * R * 1.03, .02, sa * R * 1.03], [ca * R * 1.9, .02, sa * R * 1.9]]);
      g.setAttribute('color', new THREE.Float32BufferAttribute([.85, .78, 1, 0, 0, 0], 3));
      root.add(new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
    }

    // 未知の領域の霧
    const n = 1800, fp = new Float32Array(n * 3), r = OA.rng('fog');
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, rad = R * (1.02 + Math.pow(r(), 1.6) * .8);
      fp[i * 3] = Math.cos(a) * rad; fp[i * 3 + 1] = (r() - .5) * 1.2 * (rad - R); fp[i * 3 + 2] = Math.sin(a) * rad;
    }
    const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    fogPts = new THREE.Points(fgeo, new THREE.PointsMaterial({ color: 0x9d86ff, size: .16, map: glowTexture(), transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
    root.add(fogPts);

    // 星
    const sn = 2600, sp = new Float32Array(sn * 3);
    for (let i = 0; i < sn; i++) {
      const u = r() * 2 - 1, t = r() * Math.PI * 2, rad = 90 + r() * 60, q = Math.sqrt(1 - u * u);
      sp[i * 3] = q * Math.cos(t) * rad; sp[i * 3 + 1] = u * rad; sp[i * 3 + 2] = q * Math.sin(t) * rad;
    }
    const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    starPts = new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0xffffff, size: .5, map: glowTexture(), transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(starPts);
  }

  function buildDisc(root) {
    const custom = ORIGIN.world.mapImage;
    const cv = buildTerrain();
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const geo = new THREE.PlaneGeometry(SPAN * 2, SPAN * 2, 180, 180);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      if (!custom && Math.abs(x) + Math.abs(z) <= R) p.setY(i, heightAt(x, z));
    }
    geo.computeVertexNormals();
    terrainMat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: .5 });
    root.add(new THREE.Mesh(geo, terrainMat));
    if (custom) {
      new THREE.TextureLoader().load(custom, t => { terrainMat.map = t; terrainMat.alphaTest = 0; terrainMat.needsUpdate = true; });
    }
    // 円盤の側面と裏
    const side = new THREE.Mesh(new THREE.CylinderGeometry(R, R * .97, .5, 128, 1, true),
      new THREE.MeshLambertMaterial({ color: 0x2a2148, side: THREE.DoubleSide }));
    side.position.y = -.25; root.add(side);
    underside = new THREE.Mesh(new THREE.CircleGeometry(R * .97, 96), new THREE.MeshLambertMaterial({ color: 0x1d1736, transparent: true, opacity: .94, side: THREE.DoubleSide }));
    underside.rotation.x = Math.PI / 2; underside.position.y = -.5; root.add(underside);
  }

  /* ---------------- 都市のマーカー ---------------- */
  function cityPos(c, t) {
    const L = OA.layerOf(c.layer);
    let x = c.pos[0], z = c.pos[1];
    if (c.move) { const a = t * c.move.speed; x = c.move.center[0] + Math.cos(a) * c.move.radius[0]; z = c.move.center[1] + Math.sin(a) * c.move.radius[1]; }
    let y = L.y + (c.height || 0);
    if (c.layer === 'middle') y = heightAt(x, z) + .25;
    return new THREE.Vector3(x, y, z);
  }

  function buildMarkers(root) {
    const glow = glowTexture();
    const add = (m) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'mlabel' + (m.kind === 'origin' ? ' origin' : '');
      btn.style.setProperty('--c', m.color);
      btn.innerHTML = `${OA.esc(m.name)} <small>${OA.esc(m.sub)}</small>`;
      btn.addEventListener('click', e => { e.stopPropagation(); W.focus(m.id); });
      labelsEl.appendChild(btn);
      m.label = btn; markers.push(m);
    };
    // 原点
    const o = ORIGIN.world.origin;
    const og = new THREE.Group();
    const os = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    os.scale.set(1.6, 1.6, 1.6); og.add(os); og.position.set(0, .3, 0); root.add(og);
    add({ id: 'origin', kind: 'origin', name: o.name, sub: 'ORIGIN', color: '#ffffff', group: og, sprite: os, layer: 'middle', pos: () => og.position });

    for (const c of ORIGIN.cities) {
      const col = new THREE.Color(c.color);
      const g = new THREE.Group();
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.set(1.1, 1.1, 1.1); g.add(s);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.16), new THREE.MeshBasicMaterial({ color: col }));
      g.add(gem);
      root.add(g);
      const p0 = cityPos(c, 0);
      g.position.copy(p0);
      // 上層・下層の都市は、地表への柱を立てる
      let pillar = null;
      if (c.layer !== 'middle') {
        pillar = new THREE.Line(seg([[0, 0, 0], [0, -p0.y + (c.layer === 'upper' ? heightAt(p0.x, p0.z) : 0), 0]]), lineMat(col, .5));
        g.add(pillar);
      }
      add({ id: c.id, kind: 'city', city: c, name: c.name, sub: c.type, color: c.color, group: g, sprite: s, gem, layer: c.layer, pos: () => g.position });
    }
  }

  /* ---------------- カメラ ---------------- */
  function applyCam() {
    const sp = Math.sin(cam.phi);
    camera.position.set(cam.tx + cam.radius * sp * Math.sin(cam.theta), cam.ty + cam.radius * Math.cos(cam.phi), cam.tz + cam.radius * sp * Math.cos(cam.theta));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }
  function camTo(to, dur, done) {
    if (stopTween) stopTween();
    const from = { ...cam };
    // 回転は近い向きへ
    if (to.theta !== undefined) { let d = to.theta - from.theta; d = Math.atan2(Math.sin(d), Math.cos(d)); to.theta = from.theta + d; }
    stopTween = OA.tween(dur, e => { for (const k in to) cam[k] = OA.lerp(from[k], to[k], e); }, () => { stopTween = null; done && done(); });
  }

  function bindControls() {
    const pts = new Map(); let downX = 0, downY = 0, moved = false, pinch0 = 0, rad0 = 0;
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      downX = e.clientX; downY = e.clientY; moved = false; idleSince = performance.now();
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); rad0 = cam.radius; }
      canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) moved = true;
      if (!moved) return;
      if (stopTween) { stopTween(); stopTween = null; }
      if (pts.size === 2) {
        const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        cam.radius = OA.clamp(rad0 * pinch0 / d, 3, 70);
      } else {
        cam.theta -= (e.clientX - prev[0]) * .005;
        cam.phi = OA.clamp(cam.phi - (e.clientY - prev[1]) * .004, .12, Math.PI - .12);
      }
      idleSince = performance.now();
    });
    const up = e => {
      pts.delete(e.pointerId); canvas.classList.remove('dragging');
      if (!moved && pts.size === 0) pick(e);
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', e => { pts.delete(e.pointerId); canvas.classList.remove('dragging'); });
    canvas.addEventListener('wheel', e => {
      e.preventDefault(); if (stopTween) { stopTween(); stopTween = null; }
      cam.radius = OA.clamp(cam.radius * Math.exp(e.deltaY * .001), 3, 70); idleSince = performance.now();
    }, { passive: false });
  }
  function pick(e) {
    const rect = canvas.getBoundingClientRect();
    const v = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(v, camera);
    const hit = raycaster.intersectObjects(markers.map(m => m.sprite))[0];
    if (hit) { const m = markers.find(mm => mm.sprite === hit.object); if (m) W.focus(m.id); }
  }

  /* ---------------- 階層の切り替え ---------------- */
  W.setLayer = function (id, moveCam = true) {
    layerMode = id;
    const lower = id === 'lower';
    const op0 = underside.material.opacity, op1 = lower ? .08 : .94;
    OA.tween(600, e => { underside.material.opacity = OA.lerp(op0, op1, e); });
    terrainMat.transparent = lower; terrainMat.opacity = lower ? .35 : 1; terrainMat.depthWrite = !lower; terrainMat.needsUpdate = true;
    if (moveCam && !focusedId) {
      const L = id === 'all' ? { y: 0 } : OA.layerOf(id);
      camTo({ tx: 0, ty: L.y, tz: 0, radius: id === 'all' ? 30 : 24, phi: lower ? 1.95 : id === 'upper' ? 1.15 : 1.0 }, 1100);
    }
    W.onLayer && W.onLayer(id);
  };
  W.layer = () => layerMode;

  /* ---------------- 選ぶ・近づく・入る ---------------- */
  W.focus = function (id) {
    const m = markers.find(mm => mm.id === id); if (!m) return;
    focusedId = id;
    markers.forEach(mm => mm.label.classList.toggle('on', mm.id === id));
    if (m.layer === 'lower' && layerMode !== 'lower') W.setLayer('lower', false);
    if (m.layer !== 'lower' && layerMode === 'lower') W.setLayer('all', false);
    const p = m.pos();
    const lower = m.layer === 'lower';
    camTo({ tx: p.x, ty: p.y, tz: p.z, radius: m.kind === 'origin' ? 14 : 8, phi: lower ? 1.9 : .95, theta: Math.atan2(p.x, p.z) + .35 }, 1400);
    W.onSelect(m.kind === 'origin' ? null : m.city);
  };
  W.unfocus = function () {
    focusedId = null; markers.forEach(mm => mm.label.classList.remove('on'));
    const L = layerMode === 'all' ? { y: 0 } : OA.layerOf(layerMode);
    camTo({ tx: 0, ty: L.y, tz: 0, radius: 30, phi: layerMode === 'lower' ? 1.95 : 1.0 }, 1200);
  };
  W.enter = function (id, done) {
    const m = markers.find(mm => mm.id === id); if (!m) return done();
    const p = m.pos();
    camTo({ tx: p.x, ty: p.y, tz: p.z, radius: 1.2, phi: m.layer === 'lower' ? 1.75 : 1.32 }, 1500, done);
  };
  W.intro = function (done) {
    camTo({ radius: 30, phi: 1.0, theta: cam.theta + .9 }, 2800, done);
  };
  W.instant = function () { if (stopTween) stopTween(); Object.assign(cam, { radius: 30, phi: 1.0 }); };

  /* ---------------- 毎フレーム ---------------- */
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    const t = now / 1000;
    if (!focusedId && !stopTween && now - idleSince > 4000) cam.theta += dt * .035;
    applyCam();
    fogPts.rotation.y += dt * .01; starPts.rotation.y += dt * .002;

    const w = canvas.clientWidth, h = canvas.clientHeight;
    const camAbove = camera.position.y > 0.2;
    for (const m of markers) {
      if (m.city && m.city.move) m.group.position.copy(cityPos(m.city, t));
      if (m.gem) m.gem.rotation.y += dt * 1.4;
      const pulse = 1 + Math.sin(t * 2 + m.group.position.x) * .12;
      m.sprite.scale.setScalar((m.id === focusedId ? 1.8 : 1.1) * pulse * (m.kind === 'origin' ? 1.5 : 1));
      const v = m.group.position.clone().project(camera);
      const off = v.z > 1 || v.x < -1.2 || v.x > 1.2 || v.y < -1.2 || v.y > 1.2;
      m.label.classList.toggle('hidden-l', off);
      if (off) continue;
      m.label.style.transform = `translate(${(v.x * .5 + .5) * w + 10}px, ${(-v.y * .5 + .5) * h}px) translate(0,-50%)`;
      const hiddenBelow = m.layer === 'lower' && camAbove && layerMode !== 'lower';
      const otherLayer = layerMode !== 'all' && m.kind !== 'origin' && m.layer !== layerMode;
      m.label.classList.toggle('dim', hiddenBelow || otherLayer);
    }
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w < 640 ? 60 : 45; camera.updateProjectionMatrix();
  }

  W.init = function (cv, lbl) {
    canvas = cv; labelsEl = lbl;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0818, .006);
    camera = new THREE.PerspectiveCamera(45, 1, .1, 400);
    raycaster = new THREE.Raycaster();
    scene.add(new THREE.HemisphereLight(0xcfc4ff, 0x2a1d4a, .75));
    const sun = new THREE.DirectionalLight(0xfff4e6, .8); sun.position.set(10, 14, 6); scene.add(sun);
    const root = new THREE.Group(); scene.add(root);
    buildDisc(root); buildWorldShape(root); buildMarkers(root);
    bindControls();
    window.addEventListener('resize', resize);
    resize(); applyCam();
  };
  W.start = function () { if (running) return; running = true; lastT = performance.now(); idleSince = lastT; resize(); requestAnimationFrame(frame); };
  W.stop = function () { running = false; };
  W.focused = () => focusedId;
})();
