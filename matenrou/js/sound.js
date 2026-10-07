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
  var BGM_LEVEL = 0.2; // 異変のあとに流れ続ける音楽の大きさ（うすく）
  var TAP_LEVEL = 1;   // 押したときの音の大きさ（0で鳴らさない）

  var on = (function () { try { var v = localStorage.getItem(KEY); return v === null ? true : v === '1'; } catch (e) { return true; } })();
  var OAC = window.OfflineAudioContext, AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, cache = {}, ready = {}, playing = [], sleepT = null, buttons = [];

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
  function kit(oc, wetAmt) {
    var out = oc.createGain();
    var dry = oc.createGain(); dry.gain.value = wetAmt == null ? .35 : 1 - wetAmt * .6; out.connect(dry); dry.connect(oc.destination);
    var cv = oc.createConvolver(); cv.buffer = impulse(oc);
    var wet = oc.createGain(); wet.gain.value = wetAmt == null ? .8 : wetAmt; out.connect(cv); cv.connect(wet); wet.connect(oc.destination);
    var nb = oc.createBuffer(1, SR, SR), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var flute = (function () { var re = new Float32Array([0, 0, 0, 0]), im = new Float32Array([0, 1, .14, .05]); return oc.createPeriodicWave(re, im); })();
    var principal = (function () { var h = [0, 1, .55, .38, .26, .17, .11, .07, .045, .03], re = new Float32Array(h.length); return oc.createPeriodicWave(re, new Float32Array(h)); })();
    return { oc: oc, out: out, noise: nb, flute: flute, principal: principal };
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

  // 満ちたオルガン（プリンシパルの 16'・8'・4'・2 2/3'・2' を重ねた、明るく堂々とした音）。ラグナロクの歓喜の歌で使う
  function plenum(k, t, notes, dur, o) {
    var oc = k.oc, att = o.att || .07, rel = o.rel || .9;
    var g = oc.createGain(), lp = oc.createBiquadFilter();
    g.gain.value = (o.vel || .6) * .1 / Math.sqrt(notes.length);
    lp.type = 'lowpass'; lp.frequency.value = o.cut || 5000; lp.Q.value = .3;
    g.connect(lp); lp.connect(k.out);
    var ranks = o.ranks || [[.5, .4], [1, 1], [2, .55], [3, .2], [4, .25]];
    notes.forEach(function (m) {
      var f = mtof(m);
      ranks.forEach(function (r) {
        var fr = f * r[0]; if (fr < 28 || fr > 6000) return;
        var osc = oc.createOscillator(), og = oc.createGain();
        osc.setPeriodicWave(k.principal); osc.frequency.value = fr; osc.detune.value = (Math.random() - .5) * 4;
        env(og, t, r[1], att, dur, rel);
        osc.connect(og); og.connect(g); osc.start(t); osc.stop(t + att + dur + rel + .05);
      });
      var s = oc.createBufferSource(), sf = oc.createBiquadFilter(), sg = oc.createGain();   // パイプが鳴り始める息
      s.buffer = k.noise; sf.type = 'bandpass'; sf.frequency.value = Math.min(f * 3, 5000); sf.Q.value = 2;
      env(sg, t, .12, .01, 0, .07); s.connect(sf); sf.connect(sg); sg.connect(g); s.start(t, Math.random() * .5); s.stop(t + .12);
    });
  }
  // 時計の刻み：金属の歯車が噛み合う、短い二つの響き
  function click(k, t, f1, f2) {
    var oc = k.oc;
    [[f1, .05, 1], [f2, .035, .6], [f1 * 2.76, .015, .3]].forEach(function (p) {
      var o = oc.createOscillator(), g = oc.createGain();
      o.frequency.value = p[0]; env(g, t, .25 * p[2], .001, 0, p[1]);
      o.connect(g); g.connect(k.out); o.start(t); o.stop(t + p[1] + .02);
    });
    var s = oc.createBufferSource(), sf = oc.createBiquadFilter(), sg = oc.createGain();
    s.buffer = k.noise; sf.type = 'highpass'; sf.frequency.value = 2500;
    env(sg, t, .3, .001, 0, .012); s.connect(sf); sf.connect(sg); sg.connect(k.out); s.start(t); s.stop(t + .03);
  }

  // ティンパニ（打ったとき少し高く、すぐに本来の高さへ落ちる）
  function timp(k, t, midi, vel) {
    var oc = k.oc, f = mtof(midi), g = oc.createGain(); g.gain.value = .5 * vel; g.connect(k.out);
    [[1, 1, 1.8], [1.5, .45, 1], [1.99, .25, .6], [2.44, .12, .4]].forEach(function (p) {
      var o = oc.createOscillator(), og = oc.createGain();
      o.frequency.setValueAtTime(f * p[0] * 1.06, t); o.frequency.exponentialRampToValueAtTime(f * p[0], t + .05);
      env(og, t, p[1], .003, 0, p[2]); o.connect(og); og.connect(g); o.start(t); o.stop(t + p[2] + .05);
    });
    var s = oc.createBufferSource(), sf = oc.createBiquadFilter(), sg = oc.createGain();
    s.buffer = k.noise; sf.type = 'lowpass'; sf.frequency.value = 700; env(sg, t, .6, .002, 0, .12);
    s.connect(sf); sf.connect(sg); sg.connect(g); s.start(t, Math.random() * .5); s.stop(t + .2);
  }
  // ティンパニのロール（だんだん強く）
  function roll(k, t, dur, midi, v0, v1) {
    for (var x = 0; x < dur; x += .06) timp(k, t + x, midi, (v0 + (v1 - v0) * x / dur) * (.85 + Math.random() * .3) * .45);
  }
  // 聖歌隊（「あー」の声の響きを、のこぎり波と声の共鳴で作る）。vowel：a＝あー／o＝おー（暗い）／i＝いー（鋭い）
  var VOWEL = { a: [[730, 1], [1090, .5], [2440, .25]], o: [[500, 1], [800, .45], [2500, .1]], i: [[300, .8], [2300, .55], [3000, .35]] };
  function choir(k, t, notes, dur, o) {
    var oc = k.oc, att = o.att || .8, rel = o.rel || 2;
    var g = oc.createGain(); g.gain.value = (o.vel || .5) * .22 / Math.sqrt(notes.length); g.connect(k.out);
    var bands = VOWEL[o.vowel || 'a'].map(function (v) { var b = oc.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = v[0]; b.Q.value = 6; var bg = oc.createGain(); bg.gain.value = v[1]; b.connect(bg); bg.connect(g); return b; });
    var vib = oc.createOscillator(), vg = oc.createGain(); vib.frequency.value = 5.2; vg.gain.value = 7; vib.connect(vg); vib.start(t); vib.stop(t + att + dur + rel + .1);
    notes.forEach(function (m) {
      [-9, 0, 9].forEach(function (dt) {
        var osc = oc.createOscillator(), og = oc.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = mtof(m); osc.detune.value = dt;
        if (o.glide) osc.frequency.exponentialRampToValueAtTime(mtof(m) * o.glide, t + att + dur);
        vg.connect(osc.detune);
        env(og, t, 1, att, dur, rel); osc.connect(og);
        bands.forEach(function (b) { og.connect(b); });
        osc.start(t); osc.stop(t + att + dur + rel + .05);
      });
    });
  }
  // 打ち砕く音（シンバルや崩れる石のような、広がるノイズ）
  function crash(k, t, dur, vel, f) {
    var oc = k.oc, s = oc.createBufferSource(), sf = oc.createBiquadFilter(), sg = oc.createGain();
    s.buffer = k.noise; s.loop = true; sf.type = f ? 'bandpass' : 'highpass'; sf.frequency.value = f || 3500; sf.Q.value = f ? .7 : .5;
    env(sg, t, vel, .004, 0, dur); s.connect(sf); sf.connect(sg); sg.connect(k.out); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
  }
  // （旧）紙に触れるような押したときの音。いまは使っていない（tap は小さな鐘）
  function tapSound(k, t) {
    var oc = k.oc;
    var s = oc.createBufferSource(), sf = oc.createBiquadFilter(), sg = oc.createGain();
    s.buffer = k.noise; sf.type = 'bandpass'; sf.frequency.value = 1700; sf.Q.value = .9;
    env(sg, t, .5, .002, 0, .028); s.connect(sf); sf.connect(sg); sg.connect(k.out); s.start(t); s.stop(t + .06);
    var o = oc.createOscillator(), og = oc.createGain(); o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(150, t + .05);
    env(og, t, .35, .002, 0, .06); o.connect(og); og.connect(k.out); o.start(t); o.stop(t + .08);
  }

  /* ---------- 鳴る場面（len＝録音の長さ秒、peak＝仕上がりの大きさ、wet＝響きの量、loop＝くり返す長さ） ---------- */
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
    // ラグナロク：神が降りてくる。あえて歓迎するように ── ティンパニのロールから、鐘とオルガンと聖歌隊が「歓喜の歌」（ベートーヴェン 第九）を
    // ニ長調で高らかに奏で、最後の主音でティンパニが轟き、すべての鐘が鳴りわたり、満ちたオルガンと聖歌隊が響く
    ragnarok: { len: 16, peak: .95, build: function (k) {
      var q = .42, s0 = .55, t = s0;
      roll(k, 0, s0, 33, .2, 1); bell(k, 0, 38, 1, 12, .6);
      var MEL = [[66, 1], [66, 1], [67, 1], [69, 1], [69, 1], [67, 1], [66, 1], [64, 1], [62, 1], [62, 1], [64, 1], [66, 1], [64, 1.5], [62, .5], [62, 2]];
      MEL.forEach(function (n, i) {
        var last = i === MEL.length - 1;
        bell(k, t, n[0] + 12, last ? 1 : .7, last ? 9 : 3.5, .85);                                        // 鐘（カリヨン）が旋律を
        if (i % 4 === 0 || last) bell(k, t, n[0] + 24, .3, 2, .9);                                        // 小節の頭で、さらに一つ上できらめく
        plenum(k, t, [n[0], n[0] + 12], q * n[1] * (last ? 1 : .9), { vel: .8, rel: last ? 3.5 : .35, ranks: [[1, 1], [2, .5], [4, .25]] });
        t += q * n[1];
      });
      var bar = q * 4;
      // 和音（主→属→主→属）。小節の頭でティンパニ、聖歌隊が「あー」と支える
      [[0, 4, [50, 54, 57], 38, 38], [1, 4, [49, 52, 57], 33, 33], [2, 4, [50, 54, 57], 38, 38], [3, 2, [49, 52, 55, 57], 33, 33]].forEach(function (c) {
        var ct = s0 + c[0] * bar;
        plenum(k, ct, c[2].concat([c[3], c[3] - 12]), q * c[1] * .96, { vel: .7, rel: .4, att: .05 });
        choir(k, ct, c[2].map(function (m) { return m + 12; }), q * c[1] * .9, { att: .25, rel: .5, vel: .55 });
        timp(k, ct, c[4], .9); timp(k, ct + q * 2, c[4], .55);
      });
      var fin = s0 + 14 * q;
      roll(k, fin - q * 2, q * 2, 33, .3, 1.2);
      timp(k, fin, 38, 1.4); timp(k, fin, 26, 1);
      crash(k, fin, 3.5, .35); crash(k, fin, 1.2, .3, 900);
      plenum(k, fin, [26, 38, 50, 54, 57, 62, 66, 69, 74, 78], 3.6, { vel: 1.1, rel: 4, cut: 6500 });
      choir(k, fin, [62, 66, 69, 74, 78], 3.4, { att: .3, rel: 3.5, vel: .8 });
      bell(k, fin, 38, 1.3, 13, .6); bell(k, fin, 50, 1.2, 11, .65); bell(k, fin + .9, 45, 1, 10, .6);
      var PEAL = [86, 85, 83, 81, 79, 78, 76, 74];
      for (var r = 0; r < 2; r++) PEAL.forEach(function (m, i) { bell(k, fin + .12 + r * 1.3 + i * .16, r === 1 ? PEAL[(i * 3) % 8] : m, .42, 4, .8); });
      timp(k, fin + 1.68, 33, .7); timp(k, fin + 2.1, 38, .9);
    } },
    // アポカリプス：天使の侵攻と、迎え撃つ人と悪魔。戦の太鼓、乱打される低い鐘、地鳴り、崩れる音、
    // 下から唸る「おー」の聖歌隊と、上から軋むように昇ってくる天使の「いー」の声（半音でぶつかる）
    apocalypse: { len: 16, peak: .95, build: function (k) {
      [[0, 31, 1.3], [.55, 31, .8], [1.1, 33, 1], [2.2, 26, 1.4], [2.6, 31, .9], [3.3, 33, 1], [4.4, 26, 1.4], [4.8, 31, .9], [5.5, 33, 1.1], [6.2, 31, 1], [6.5, 31, 1.1]].forEach(function (d) { timp(k, d[0], d[1], d[2]); });
      roll(k, 6.7, .9, 31, .4, 1.3); timp(k, 7.6, 26, 1.5);
      [[0, 37, 1.2], [.9, 43, .9], [1.6, 38, 1.1], [2.2, 44, 1], [3.0, 37, 1.1], [3.7, 43, .9], [4.4, 38, 1.2], [5.0, 44, 1], [5.6, 37, 1.1], [6.1, 43, 1], [6.6, 38, 1.2], [7.6, 37, 1.3]].forEach(function (b) { bell(k, b[0], b[1], b[2], 9, .45); });
      organ(k, 0, [25, 37, 38, 44], 6, { att: 1.5, rel: 4, vel: .9, cut: 750 });
      choir(k, .5, [49, 50, 56, 57], 6.5, { att: 3.5, rel: 3, vel: .7, vowel: 'o' });
      choir(k, 2.5, [80, 81, 86], 4.5, { att: 2.5, rel: 2.5, vel: .35, vowel: 'i', glide: 1.12 });
      rumble(k, 0, 9, 1);
      crash(k, 2.2, 1.6, .45, 700); crash(k, 4.4, 1.8, .5, 600); crash(k, 7.6, 3, .6, 500); crash(k, 7.6, 2.5, .3);
    } },
    // 異変のあと、うすく流れ続ける音楽（くり返す）
    // ラグナロクのあと：光の満ちた聖堂のコラール。オルガンと聖歌隊がゆっくり和音をたどり、遠くで鐘が歓喜の歌の断片を鳴らす
    bgm_ragnarok: { loop: 32, peak: .9, build: function (k) {
      var CH = [[38, [50, 54, 57, 62]], [43, [50, 55, 59, 62]], [35, [50, 54, 59, 62]], [33, [49, 52, 57, 64]], [38, [50, 54, 57, 66]], [40, [52, 55, 59, 64]], [33, [49, 52, 57, 61]], [38, [50, 54, 57, 62]]];
      CH.forEach(function (c, i) {
        var t = i * 4;
        organ(k, t, [c[0]].concat(c[1]), 3.2, { att: 1.2, rel: 2, vel: .55, cut: 2200 });
        choir(k, t + .2, c[1].map(function (m) { return m + 12; }), 3, { att: 1.5, rel: 2, vel: .3 });
      });
      [[0, 78], [.9, 78], [1.8, 79], [2.7, 81], [16, 81], [16.9, 79], [17.8, 78], [18.7, 76]].forEach(function (b) { bell(k, b[0] + 2, b[1], .35, 6, .55); });
      bell(k, 10, 50, .5, 10, .4); bell(k, 26, 45, .5, 10, .4);
    } },
    // アポカリプスのあと：まだ終わらない戦い。底のうなりがうねり、遠くで鐘が鳴りつづけ、ときどき太鼓が響く
    bgm_apocalypse: { loop: 32, peak: .9, build: function (k) {
      organ(k, 0, [25, 37, 44], 8, { att: 6, rel: 6, vel: .8, cut: 650 });
      organ(k, 14, [26, 38, 44], 8, { att: 6, rel: 6, vel: .8, cut: 650 });
      choir(k, 4, [49, 50, 56], 6, { att: 4, rel: 5, vel: .45, vowel: 'o' });
      choir(k, 20, [48, 49, 55], 6, { att: 4, rel: 5, vel: .45, vowel: 'o' });
      choir(k, 22, [80, 81], 3, { att: 3, rel: 4, vel: .12, vowel: 'i' });
      [[0, 37], [8, 38], [16, 37], [24, 43]].forEach(function (b) { bell(k, b[0] + .5, b[1], .9, 9, .3); });
      [[3, 31, .7], [3.5, 31, .5], [11, 33, .6], [19, 31, .7], [19.4, 31, .5], [27, 26, .8]].forEach(function (d) { timp(k, d[0], d[1], d[2]); });
      rumble(k, 0, 16, .35); rumble(k, 16, 16, .35);
    } },
    // 押したときの音
    // 押したときの音：小さな鐘をそっと鳴らしたような、短く軽い音（すぐ消える）
    tap: { len: 1.2, peak: .07, wet: .3, build: function (k) { bell(k, .005, 86, .6, 1.4, .55); } },
    // 世界の時計の刻み（チク・タク）と、ちょうどの時刻の小さな鐘（鳴らすときに高さを変える）
    tick: { len: .6, peak: .35, wet: .25, build: function (k) { click(k, .01, 2600, 3900); } },
    tock: { len: .6, peak: .3, wet: .25, build: function (k) { click(k, .01, 2050, 3100); } },
    hour: { len: 6, peak: .4, wet: .55, build: function (k) { bell(k, .01, 69, .7, 5.5, .6); } },
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
    var len = sc.loop ? sc.loop + 7 : sc.len;
    var oc; try { oc = new OAC(2, Math.floor(SR * len), SR); } catch (e) { return Promise.reject(e); }
    sc.build(kit(oc, sc.wet));
    cache[name] = oc.startRendering().then(function (buf) {
      if (sc.loop) {
        // くり返し用：終わりからはみ出した響きを頭に重ねて、継ぎ目なくつながるようにする
        var L = Math.floor(SR * sc.loop), lb = oc.createBuffer(2, L, SR);
        for (var ch = 0; ch < 2; ch++) {
          var src = buf.getChannelData(ch), dst = lb.getChannelData(ch);
          dst.set(src.subarray(0, L));
          for (var x = L; x < src.length; x++) dst[x - L] += src[x];
        }
        buf = lb;
      }
      var pk = 0;
      for (var c = 0; c < buf.numberOfChannels; c++) { var d = buf.getChannelData(c); for (var i = 0; i < d.length; i += 4) { var a = Math.abs(d[i]); if (a > pk) pk = a; } }
      if (pk > 0) { var s = sc.peak / pk; for (var c2 = 0; c2 < buf.numberOfChannels; c2++) { var d2 = buf.getChannelData(c2); for (var j = 0; j < d2.length; j++) d2[j] *= s; } }
      ready[name] = buf;
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
    if (!W.event) return ['tick', 'tock', 'hour', 'ragnarok', 'apocalypse', 'bgm_ragnarok', 'bgm_apocalypse'];
    return ['bgm_' + W.event];
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
    sleepT = setTimeout(function () { if (ctx && !playing.length && ctx.state === 'running') ctx.suspend(); }, 8000);
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
  // 用意できている短い音を、その場ですぐ鳴らす（rate で高さを変える）
  function blip(name, rate, vol) {
    var buf = ready[name]; if (!buf) { prefetch([name]); return; }
    var src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate || 1;
    if (vol != null && vol !== 1) { var vg = ctx.createGain(); vg.gain.value = vol; src.connect(vg); vg.connect(master); } else src.connect(master);
    var item = { src: src, g: master, name: name, blip: true }; playing.push(item);
    src.onended = function () { var i = playing.indexOf(item); if (i >= 0) playing.splice(i, 1); if (!playing.length) sleepSoon(); };
    src.start();
  }
  // 世界の時計：針を回すと5分ごとにチク・タク、ちょうどの時刻を通ると小さな鐘（12時＝天に近いほど高く、6時＝魔に近いほど低い）
  var HOUR_ST = [5, 4, 2, 0, -2, -4, -7, -4, -2, 0, 2, 4];
  var lastTick = 0, tickFlip = false;
  function clockTurn(t0, t1) {
    if (!ensure()) return;
    var lo = Math.min(t0, t1), hi = Math.max(t0, t1), n = performance.now();
    for (var x = Math.ceil(lo / 5) * 5; x <= hi; x += 5) {
      if (x === lo) continue;
      if (x % 60 === 0) { var h = (((x / 60) % 12) + 12) % 12; blip('hour', Math.pow(2, HOUR_ST[h] / 12)); lastTick = n; continue; }
      if (n - lastTick < 55) continue;
      lastTick = n; tickFlip = !tickFlip; blip(tickFlip ? 'tick' : 'tock', 1 + (Math.random() - .5) * .04);
    }
  }
  // 儀式を飛ばしたとき：その音をすっと消す
  function cut() {
    if (!ctx) return;
    playing.forEach(function (p) { if (p.blip || p.bgm) return; p.g.gain.setTargetAtTime(0, ctx.currentTime, .2); try { p.src.stop(ctx.currentTime + 1.2); } catch (e) {} });
  }

  /* ---------- 異変のあとの音楽（うすく、くり返し流れつづける） ---------- */
  var bgm = null, bgmWant = null, bgmSeen = false, bgmDelay = 0;
  function applyBgm() {
    var want = on ? bgmWant : null;
    if (bgm && bgm.ev === want) return;
    if (bgm) { var old = bgm; bgm = null; var i = playing.indexOf(old); if (i >= 0) playing.splice(i, 1); if (old.g) { old.g.gain.setTargetAtTime(0, ctx.currentTime, 1.2); try { old.src.stop(ctx.currentTime + 6); } catch (e) {} } if (!playing.length) sleepSoon(); }
    if (!want || !ctx) return;
    var item = { ev: want, bgm: true }; bgm = item; playing.push(item);
    var delay = bgmDelay; bgmDelay = 0;
    render('bgm_' + want).then(function (buf) {
      if (bgm !== item || !ensure()) return;
      var src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = buf; src.loop = true; src.connect(g); g.connect(master);
      var t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(BGM_LEVEL, t + 6);   // ゆっくり満ちてくる
      src.start(t); item.src = src; item.g = g;
    }, function () {});
  }
  function setEvent(ev) {
    ev = ev || null;
    if (bgmSeen && ev && ev !== bgmWant) bgmDelay = 8.5;   // いま異変が起きたところなら、異変の音が鳴り終わってから流す
    bgmSeen = true; bgmWant = ev;
    if (ev) prefetch(['bgm_' + ev]);
    applyBgm();
  }

  // 押したときの音：リンクやボタンなど、押せるものを押したときだけ。時計の文字盤（チク・タクが鳴る）は除く
  var TAP_SEL = 'a[href], button, summary, [role="tab"], [role="button"], label, select';
  document.addEventListener('pointerdown', function (e) {
    if (!on || !TAP_LEVEL || e.button > 0) return;
    var el = e.target.closest && e.target.closest(TAP_SEL); if (!el || (e.target.closest('#clock svg'))) return;
    if (!ensure()) return;
    blip('tap', .995 + Math.random() * .01, TAP_LEVEL);
    sleepSoon();
  }, true);

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
    if (on) { ensure(); prefetch(['tap'].concat(likelyNext())); applyBgm(); sleepSoon(); }
    else if (ctx) { cut(); applyBgm(); setTimeout(function () { if (!on && ctx) ctx.suspend(); }, 1300); }
    paintButtons();
  }
  function bindButton(el, kind) {
    if (!el) return;
    buttons.push({ el: el, kind: kind || 'icon' });
    el.addEventListener('click', function (e) { e.stopPropagation(); setOn(!on); });
    paintButtons();
  }

  // ブラウザは、閲覧者が一度どこかを押すまで音を出させてくれない。最初に押されたときに用意だけしておく
  function wake() { if (on && ensure()) { applyBgm(); sleepSoon(); document.removeEventListener('pointerdown', wake, true); document.removeEventListener('keydown', wake, true); } }
  document.addEventListener('pointerdown', wake, true);
  document.addEventListener('keydown', wake, true);
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) { if (ctx.state === 'running') ctx.suspend(); }
    else if (on && bgm) ctx.resume();
  });
  if (on) prefetch(['tap']);

  var prefT = null;
  window.MatenrouSound = {
    play: function (name, a, b) {
      if (!on) { if (name === 'world') { bgmWant = b || null; bgmSeen = true; } return; }
      if (name === 'world') { setEvent(b); clearTimeout(prefT); prefT = setTimeout(function () { prefetch(likelyNext()); }, 600); return; }
      if (name === 'tower') { prefetch([a === 'heaven' ? 'heavenGate' : 'abyssGate']); watchGate(a); return; }
      if (name === 'cut') { cut(); return; }
      if (name === 'clock') { clockTurn(a, b); return; }
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
