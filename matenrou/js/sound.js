/* =========================================================
   魔天楼 ── 音（遠い鐘と、聖堂のオルガン）
   ・音が鳴るのは物語の節目だけ：入口の門／転生／堕天／契約の封／ラグナロク／アポカリプス／塔の門
     ふだん読んでいるあいだは何も鳴らない
   ・軽さのために、音はその場で合成し続けるのではなく、必要になる少し前に一度だけ「録音」しておき（OfflineAudioContext）、
     鳴らすときはそれを再生するだけ。聖堂の残響も録音に焼き込んでいる。何も鳴っていないあいだは音の仕組みごと眠らせる
   ・音色：長調の明るい和音は使わない。三度を抜いた五度と二度の和音、わずかにずらした二本のパイプのうなり（ヴォワ・セレスト）、
     遠くでくぐもる低い鐘。神々しいが、どこか不穏に
   app.js からは window.MatenrouSound.play('名前') で呼ぶ。鳴らす／鳴らさないはヘッダーの鐘のボタンと入口の門で切り替え
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'matenrou-sound';
  var VOLUME = 0.75;   // 全体の音量（0〜1）
  var SR = 22050;      // 録音の細かさ（低めにして軽くしている）

  var on = (function () { try { var v = localStorage.getItem(KEY); return v === null ? true : v === '1'; } catch (e) { return true; } })();
  var OAC = window.OfflineAudioContext, AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, cache = {}, playing = [], sleepT = null, buttons = [];

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* ---------- 録音のための部品 ---------- */
  var IR = null;
  // 石の聖堂の残響（後ろほど暗くなりながら、6秒かけて消える）
  function impulse(oc) {
    var len = Math.floor(SR * 6), b = oc.createBuffer(2, len, SR);
    if (!IR) {
      IR = [];
      for (var c = 0; c < 2; c++) {
        var d = new Float32Array(len), lp = 0;
        for (var i = 0; i < len; i++) {
          var t = i / len;
          lp += (.45 - .4 * t) * ((Math.random() * 2 - 1) - lp);
          d[i] = i < SR * .025 ? 0 : lp * Math.pow(1 - t, 3);
        }
        IR.push(d);
      }
    }
    b.getChannelData(0).set(IR[0]); b.getChannelData(1).set(IR[1]);
    return b;
  }
  function kit(oc) {
    var out = oc.createGain();
    var dry = oc.createGain(); dry.gain.value = .35; out.connect(dry); dry.connect(oc.destination);
    var cv = oc.createConvolver(); cv.buffer = impulse(oc);
    var wet = oc.createGain(); wet.gain.value = .8; out.connect(cv); cv.connect(wet); wet.connect(oc.destination);
    var nb = oc.createBuffer(1, SR, SR), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var flute = (function () { var re = new Float32Array([0, 0, 0, 0]), im = new Float32Array([0, 1, .14, .05]); return oc.createPeriodicWave(re, im); })();
    return { oc: oc, out: out, noise: nb, flute: flute };
  }
  function env(g, t, peak, a, hold, r) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + hold);
    g.gain.exponentialRampToValueAtTime(.0001, t + a + hold + r);
  }

  // 鐘：教会の鐘の倍音の並び。bright を下げるほど高い倍音が削れて、遠くでくぐもって聞こえる
  var PARTIALS = [[.5, .7, 1], [1, .55, .75], [1.19, .32, .6], [1.5, .12, .4], [2, .38, .45], [2.51, .1, .28], [3.01, .07, .2], [4.17, .04, .12]];
  function bell(k, t, midi, vel, len, bright) {
    var oc = k.oc, f = mtof(midi), g = oc.createGain(), lp = oc.createBiquadFilter();
    g.gain.value = .2 * vel; lp.type = 'lowpass'; lp.frequency.value = 600 + 5000 * bright; lp.Q.value = .3;
    g.connect(lp); lp.connect(k.out);
    PARTIALS.forEach(function (p, i) {
      var n = i === 0 || i === 1 ? 2 : 1;          // いちばん低い二つの倍音は、ずらして重ねてゆっくり唸らせる
      for (var j = 0; j < n; j++) {
        var o = oc.createOscillator(), og = oc.createGain();
        o.frequency.value = f * p[0] + (j ? .4 + i * .3 : 0);
        env(og, t, p[1] * (j ? .6 : 1) * (i > 3 ? bright : 1), .004 + i * .002, 0, len * p[2]);
        o.connect(og); og.connect(g); o.start(t); o.stop(t + len * p[2] + .05);
      }
    });
    var s = oc.createBufferSource(), sf = oc.createBiquadFilter(), sg = oc.createGain();
    s.buffer = k.noise; sf.type = 'bandpass'; sf.frequency.value = Math.min(f * 2.5, 4000); sf.Q.value = 1.2;
    env(sg, t, .2 * bright, .003, 0, .08); s.connect(sf); sf.connect(sg); sg.connect(g); s.start(t); s.stop(t + .15);
  }

  // オルガン：やわらかいフルート管を二本、わずかにずらして重ねる（うなりが冷たく揺れる）。低い音は重さのある管で
  function organ(k, t, notes, dur, o) {
    var oc = k.oc, att = o.att || 1.2, rel = o.rel || 2.5;
    var g = oc.createGain(), lp = oc.createBiquadFilter();
    g.gain.value = (o.vel || .6) * .12 / Math.sqrt(notes.length);
    lp.type = 'lowpass'; lp.frequency.value = o.cut || 1800; lp.Q.value = .3;
    g.connect(lp); lp.connect(k.out);
    notes.forEach(function (m) {
      var f = mtof(m);
      [[-5, 1], [5, 1], [0, m < 48 ? .5 : .18, 2]].forEach(function (r) {
        var osc = oc.createOscillator(), og = oc.createGain();
        osc.setPeriodicWave(k.flute); osc.frequency.value = f * (r[2] || 1); osc.detune.value = r[0];
        if (o.glide) osc.frequency.exponentialRampToValueAtTime(f * (r[2] || 1) * o.glide, t + att + dur);
        env(og, t, r[1], att, dur, rel);
        osc.connect(og); og.connect(g); osc.start(t); osc.stop(t + att + dur + rel + .05);
      });
    });
  }
  // 地鳴り
  function rumble(k, t, dur, vel) {
    var oc = k.oc, s = oc.createBufferSource(), f = oc.createBiquadFilter(), g = oc.createGain();
    s.buffer = k.noise; s.loop = true; f.type = 'lowpass'; f.frequency.value = 110;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(f); f.connect(g); g.connect(k.out); s.start(t); s.stop(t + dur);
  }

  /* ---------- 鳴る場面（len＝録音の長さ秒、peak＝仕上がりの大きさ） ---------- */
  var SCENES = {
    // 入口の門：遠くで低い鐘がひとつ。オルガンの空虚五度が、かすかに満ちる
    gate: { len: 11, peak: .5, build: function (k) {
      bell(k, .05, 45, 1, 10, .45);
      organ(k, .4, [38, 45], 2.6, { att: 1.8, rel: 3.5, vel: .45, cut: 1200 });
    } },
    // 転生：五度に二度が重なって昇っていき、門が開くと高く冷たい鐘がひとつ
    rebirth: { len: 13, peak: .55, build: function (k) {
      organ(k, 0, [50, 57], 4.8, { att: 1.5, vel: .5, cut: 1400 });
      organ(k, 1.9, [64], 2.8, { att: 1.6, vel: .4, cut: 1800 });
      organ(k, 3.9, [69, 71], 1.0, { att: 1.4, vel: .4, cut: 2200 });
      organ(k, 6.1, [62, 69, 76, 81], 1.6, { att: .5, rel: 4, vel: .55, cut: 3000 });
      bell(k, 6.3, 74, .7, 8, .55);
    } },
    // 堕天：高い和音がゆっくり沈み落ちていき、下から三全音が現れ、最後に低い鐘がくぐもって鳴る
    fall: { len: 15, peak: .6, build: function (k) {
      organ(k, 0, [69, 76], 3.6, { att: .9, rel: 2.5, vel: .45, cut: 2400, glide: .79 });
      organ(k, 2.2, [45, 52], 3.4, { att: 1.8, rel: 2, vel: .5, cut: 1100 });
      organ(k, 4.2, [38, 44], 1.6, { att: 1.5, rel: 3, vel: .55, cut: 800 });
      bell(k, 6.2, 36, 1.1, 12, .3);
      organ(k, 6.2, [26, 38, 45], 1.2, { att: .3, rel: 5, vel: .6, cut: 600 });
    } },
    // 契約の封：低いうなりが膨らみ、封が閉じる瞬間に重い鐘と、半音でぶつかる低い和音
    seal: { len: 13, peak: .6, build: function (k) {
      organ(k, 0, [38, 45], .6, { att: 2.2, rel: 1.5, vel: .5, cut: 700 });
      bell(k, 2.6, 38, 1.1, 11, .35);
      organ(k, 2.6, [26, 38, 39, 45], 1, { att: .25, rel: 5, vel: .6, cut: 700 });
    } },
    // ラグナロク：神が降りてくる。鐘がゆっくり、しだいに高く間を詰めて重なり、オルガンは五度を積み上げたまま解決しない
    ragnarok: { len: 16, peak: .7, build: function (k) {
      [[0, 45, 1, .45], [1.7, 52, .8, .45], [3.1, 57, .75, .5], [4.2, 64, .65, .5], [5.1, 69, .6, .55], [5.8, 45, 1.2, .5], [5.8, 76, .5, .6]].forEach(function (b) { bell(k, b[0], b[1], b[2], 10, b[3]); });
      organ(k, 0, [38, 45], 5.5, { att: 4.5, rel: 3, vel: .55, cut: 1200 });
      organ(k, 2, [57, 64], 3.8, { att: 3.2, rel: 3, vel: .45, cut: 2000 });
      organ(k, 4, [69, 76, 83], 1.8, { att: 2.2, rel: 3, vel: .4, cut: 3500 });
      organ(k, 5.8, [26, 38, 45, 52, 57, 64, 69, 76], 1.6, { att: .6, rel: 6, vel: .7, cut: 2600 });
    } },
    // アポカリプス：低い鐘がばらばらに鳴り、地が鳴り、上からかすかに天使の軋むような高音（半音でぶつかる）
    apocalypse: { len: 15, peak: .65, build: function (k) {
      [[0, 37, 1.1], [1.3, 43, .8], [2.4, 38, 1], [3.7, 44, .9], [4.6, 37, 1.1], [5.9, 43, .9], [6.6, 38, 1.1]].forEach(function (b) { bell(k, b[0], b[1], b[2], 9, .3); });
      organ(k, 0, [25, 37, 38, 44], 5.2, { att: 2, rel: 4, vel: .6, cut: 650 });
      organ(k, 3, [80, 81], 2.6, { att: 2, rel: 3, vel: .18, cut: 4000 });
      rumble(k, 0, 8, .5);
    } },
    // 天界の門：高く澄んだ鐘がひとつ、上で冷たい響きが揺れる
    heavenGate: { len: 11, peak: .45, build: function (k) {
      bell(k, .1, 69, .7, 9, .6);
      organ(k, 0, [74, 81, 88], 2.4, { att: 1.8, rel: 4, vel: .35, cut: 3500 });
    } },
    // 魔界の門：深くくぐもった鐘と、底のうなり
    abyssGate: { len: 12, peak: .55, build: function (k) {
      bell(k, .1, 33, 1, 11, .25);
      organ(k, 0, [26, 32], 3, { att: 2, rel: 4, vel: .55, cut: 550 });
    } }
  };

  // 録音する（一度作ったら使い回す）。録音は音の仕組みの別の流れで行われ、画面の動きを止めない
  function render(name) {
    if (cache[name]) return cache[name];
    var sc = SCENES[name]; if (!sc || !OAC) return Promise.reject();
    var oc; try { oc = new OAC(2, Math.floor(SR * sc.len), SR); } catch (e) { return Promise.reject(e); }
    sc.build(kit(oc));
    cache[name] = oc.startRendering().then(function (buf) {
      var pk = 0;
      for (var c = 0; c < buf.numberOfChannels; c++) { var d = buf.getChannelData(c); for (var i = 0; i < d.length; i += 4) { var a = Math.abs(d[i]); if (a > pk) pk = a; } }
      if (pk > 0) { var s = sc.peak / pk; for (var c2 = 0; c2 < buf.numberOfChannels; c2++) { var d2 = buf.getChannelData(c2); for (var j = 0; j < d2.length; j++) d2[j] *= s; } }
      return buf;
    });
    cache[name].catch(function () { delete cache[name]; });
    return cache[name];
  }
  // 次に必要になりそうな音を、手が空いたときに一つずつ録音しておく
  var queue = [], busyQ = false;
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 800); };
  function prefetch(names) {
    if (!on || !OAC) return;
    names.forEach(function (n) { if (!cache[n] && queue.indexOf(n) < 0) queue.push(n); });
    pump();
  }
  function pump() {
    if (busyQ || !queue.length) return;
    busyQ = true;
    idle(function () { var n = queue.shift(); render(n).then(next, next); });
    function next() { busyQ = false; pump(); }
  }
  function likelyNext() {
    var W = window.__W || {};
    if (W.spoil == null) return ['gate'];
    if (!W.reborn) return ['rebirth'];
    if (!W.fallen) return ['fall'];
    if (!W.pact) return ['seal'];
    if (!W.event) return ['ragnarok', 'apocalypse'];
    return [];
  }

  /* ---------- 鳴らす ---------- */
  function ensure() {
    if (!on || !AC) return false;
    if (!ctx) {
      try { ctx = new AC(); } catch (e) { return false; }
      master = ctx.createGain(); master.gain.value = VOLUME; master.connect(ctx.destination);
    }
    clearTimeout(sleepT);
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  // 何も鳴っていなければ、音の仕組みを眠らせる（そのあいだは何も計算しない）
  function sleepSoon() {
    clearTimeout(sleepT);
    sleepT = setTimeout(function () { if (ctx && !playing.length && ctx.state === 'running') ctx.suspend(); }, 1500);
  }
  function scene(name) {
    if (!ensure()) return;
    var asked = performance.now();
    render(name).then(function (buf) {
      if (!on || !ensure()) return;
      var late = (performance.now() - asked) / 1000;           // 録音が間に合わなかった分だけ先から鳴らし、画面とずれないようにする
      if (late > buf.duration - 1) return;
      var src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = buf; src.connect(g); g.connect(master);
      var item = { src: src, g: g, name: name }; playing.push(item);
      src.onended = function () { var i = playing.indexOf(item); if (i >= 0) playing.splice(i, 1); g.disconnect(); if (!playing.length) sleepSoon(); };
      src.start(0, late > .05 ? late : 0);
    }, function () {});
  }
  // 儀式を飛ばしたとき：その音をすっと消す
  function cut() {
    if (!ctx) return;
    playing.forEach(function (p) { p.g.gain.setTargetAtTime(0, ctx.currentTime, .2); try { p.src.stop(ctx.currentTime + 1.2); } catch (e) {} });
  }

  /* ---------- 鳴らす／鳴らさない ---------- */
  var ICON_ON = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v1.5"/><path d="M6.5 16.5c.8-1 1.2-2.4 1.2-4.2V11a4.3 4.3 0 0 1 8.6 0v1.3c0 1.8.4 3.2 1.2 4.2z"/><path d="M5 16.5h14"/><path d="M10.3 19a1.8 1.8 0 0 0 3.4 0"/></svg>';
  var ICON_OFF = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v1.5"/><path d="M6.5 16.5c.8-1 1.2-2.4 1.2-4.2V11a4.3 4.3 0 0 1 8.6 0v1.3c0 1.8.4 3.2 1.2 4.2z"/><path d="M5 16.5h14"/><path d="M10.3 19a1.8 1.8 0 0 0 3.4 0"/><path d="M4 4l16 16"/></svg>';
  function paintButtons() {
    buttons = buttons.filter(function (b) { return document.body.contains(b.el); });
    buttons.forEach(function (b) {
      b.el.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (b.kind === 'icon') { b.el.innerHTML = on ? ICON_ON : ICON_OFF; b.el.setAttribute('aria-label', on ? '鐘とオルガンの音を止める' : '鐘とオルガンの音を鳴らす'); b.el.title = on ? '音：鳴らす（物語の節目だけ）' : '音：鳴らさない'; }
      else b.el.innerHTML = (on ? ICON_ON : ICON_OFF) + '<span>鐘とオルガンの音：<b>' + (on ? '鳴らす' : '鳴らさない') + '</b></span>';
    });
  }
  function setOn(v) {
    on = !!v;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    if (on) { ensure(); prefetch(likelyNext()); sleepSoon(); }
    else if (ctx) { cut(); setTimeout(function () { if (!on && ctx) ctx.suspend(); }, 1300); }
    paintButtons();
  }
  function bindButton(el, kind) {
    if (!el) return;
    buttons.push({ el: el, kind: kind || 'icon' });
    el.addEventListener('click', function (e) { e.stopPropagation(); setOn(!on); });
    paintButtons();
  }

  // ブラウザは、閲覧者が一度どこかを押すまで音を出させてくれない。最初に押されたときに用意だけしておく
  function wake() { if (on && ensure()) { sleepSoon(); document.removeEventListener('pointerdown', wake, true); document.removeEventListener('keydown', wake, true); } }
  document.addEventListener('pointerdown', wake, true);
  document.addEventListener('keydown', wake, true);
  document.addEventListener('visibilitychange', function () { if (ctx && document.hidden && ctx.state === 'running') ctx.suspend(); });

  var prefT = null;
  window.MatenrouSound = {
    play: function (name, a) {
      if (!on) return;
      if (name === 'world') { clearTimeout(prefT); prefT = setTimeout(function () { prefetch(likelyNext()); }, 600); return; }
      if (name === 'tower') { prefetch([a === 'heaven' ? 'heavenGate' : 'abyssGate']); watchGate(a); return; }
      if (name === 'cut') { cut(); return; }
      if (name === 'pact') { prefetch(['seal']); return; }   // 契約の問いかけでは鳴らさず、封の音を用意するだけ
      if (SCENES[name]) scene(name);
    },
    bindButton: bindButton,
    isOn: function () { return on; },
    toggle: function () { setOn(!on); }
  };

  // 塔の門が見えたときに一度だけ
  var gateIO = null;
  function watchGate(kind) {
    if (gateIO) { gateIO.disconnect(); gateIO = null; }
    if (!('IntersectionObserver' in window)) return;
    var el = document.querySelector('.gate-stage'); if (!el) return;
    gateIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && ctx) { gateIO.disconnect(); gateIO = null; scene(kind === 'heaven' ? 'heavenGate' : 'abyssGate'); } });
    }, { threshold: .4 });
    gateIO.observe(el);
  }
})();
