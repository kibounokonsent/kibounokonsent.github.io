/* ─────────────────────────────────────────────────────────────
   ROSTER 工房の音
   ・音声ファイルは使わず、Web Audio ですべて合成する
   ・WS（工房の時刻表）を映像と音で共有し、歯車の「カチッ」と
     歯車が一歯ぶん進む瞬間、圧力計の針と蒸気の噴き出しを揃える
   ───────────────────────────────────────────────────────────── */
(function(){
"use strict";
function rng(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
var T0 = performance.now();
function now(){ return (performance.now() - T0) / 1000; }

/* ── 工房の時刻表 ── */
var RATE = 1.15;      /* 歯車が一歯進む回数／秒 */
var BURST = 2.8;      /* 蒸気を逃がす長さ */
var WHISTLE = 3.8;    /* 遠くの汽笛の長さ */
var R = rng(4242);
var bursts = [], whistles = [], anvils = [], flicks = [];
var gen = {b: 7 + R() * 3, w: 34, a: 12, f: 8};
function fill(until){
  while (gen.b < until){ bursts.push(gen.b); gen.b += 22 + R() * 16; }
  while (gen.w < until){ whistles.push(gen.w); gen.w += 85 + R() * 70; }
  while (gen.a < until){ anvils.push({t: gen.a, n: 2 + (R() * 3 | 0), gap: .48 + R() * .2, pan: -.75 + R() * .4, p: 2 + R() * .6}); gen.a += 13 + R() * 22; }
  while (gen.f < until){ flicks.push({t: gen.f, d: .25 + R() * .5, s: R() * 100}); gen.f += 11 + R() * 30; }
  var old = until - 400;
  if (bursts.length > 40) bursts = bursts.filter(function(b){ return b > old; });
  if (anvils.length > 40) anvils = anvils.filter(function(a){ return a.t > old; });
  if (flicks.length > 40) flicks = flicks.filter(function(f){ return f.t > old; });
}
fill(240);

/* 一歯ぶんの送り：すっと進んで少し行き過ぎ、戻って止まる */
function stepEase(f){
  if (f >= .26) return 1;
  if (f <= 0) return 0;
  var x = f / .26 - 1, c1 = 1.9, c3 = c1 + 1;
  return 1 + c3 * x * x * x + c1 * x * x;
}
var kickN = 0, kickT = -99, marks = {gear: -99, lamp: -99, gauge: -99};
function teeth(t){
  var x = t * RATE, k = Math.floor(x), v = k + stepEase(x - k);
  if (kickN) v += kickN - 1 + stepEase(Math.min(1, (t - kickT) * 2.5));
  return v;
}
function pressure(t){
  fill(t + 120);
  var b = null, n = null;
  for (var i = 0; i < bursts.length; i++){ if (bursts[i] <= t) b = bursts[i]; else { n = bursts[i]; break; } }
  if (b !== null && t - b < BURST){
    var k = (t - b) / BURST;
    return {p: .95 - .45 * (1 - Math.pow(1 - k, 3)), vent: 1 - k, venting: true};
  }
  var start = b === null ? 0 : b + BURST, from = b === null ? .6 : .5;
  var q = Math.max(0, Math.min(1, (t - start) / Math.max(1, n - start)));
  return {p: from + (.95 - from) * Math.pow(q, 1.7), vent: 0, venting: false};
}
function whistle(t){
  for (var i = 0; i < whistles.length; i++){
    var d = t - whistles[i];
    if (d >= 0 && d < WHISTLE) return Math.min(1, d / .5, (WHISTLE - d) / 1.2);
  }
  return 0;
}
function flicker(t){
  for (var i = 0; i < flicks.length; i++){
    var f = flicks[i], d = t - f.t;
    if (d >= 0 && d < f.d){ var x = d / f.d; return Math.sin(x * 47 + f.s) > .15 ? .9 : .28; }
  }
  return 1;
}

/* ── 音 ── */
var AC = window.AudioContext || window.webkitAudioContext;
var ctx = null, on = false, waiting = false, master, sceneBus, sceneLP, deskBus, watchBus, verb, nbuf, bbuf, rbufs, hissG, hissF, lastUntil = 0, timer = null, lastStamp = 0;
var POS = {gear: .55, valve: .35, gauge: .1, window: -.5, lamp: 0, mug: .45, watch: .7};
var SR = rng(99);

function mkNoise(sec, brown){
  var len = ctx.sampleRate * sec | 0, b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (var c = 0; c < 2; c++){
    var d = b.getChannelData(c), last = 0;
    for (var i = 0; i < len; i++){
      var w = Math.random() * 2 - 1;
      if (brown){ last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
  }
  return b;
}
function mkImpulse(sec, decay){
  var len = ctx.sampleRate * sec | 0, b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (var c = 0; c < 2; c++){ var d = b.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return b;
}
/* 紙のこすれ：細かい「パリ」の粒を重ねたノイズ */
function mkRustle(seed){
  var r = rng(seed), sr = ctx.sampleRate, len = sr * .8 | 0, env = new Float32Array(len), b = ctx.createBuffer(2, len, sr);
  for (var g = 0; g < 90; g++){
    var pos = Math.pow(r(), 1.3) * len * .9 | 0, amp = .2 + r() * .8, dec = sr * (.002 + r() * .01);
    for (var j = 0; j < dec * 5 && pos + j < len; j++) env[pos + j] += amp * Math.exp(-j / dec);
  }
  for (var c = 0; c < 2; c++){
    var d = b.getChannelData(c);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.min(1.2, env[i] + .14 * Math.sin(Math.PI * i / len));
  }
  return b;
}

function G(v){ var g = ctx.createGain(); g.gain.value = v || 0; return g; }
function out(pan, bus, send){
  var n = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
  if (n.pan) n.pan.value = Math.max(-1, Math.min(1, pan || 0));
  n.connect(bus || sceneBus);
  if (send){ var s = G(send); n.connect(s); s.connect(verb); }
  return n;
}
function env(g, at, a, peak, d){
  g.gain.setValueAtTime(.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), at + a);
  g.gain.exponentialRampToValueAtTime(.0001, at + a + d);
}
function tone(at, f, dur, peak, dst, type, f2, a){
  var o = ctx.createOscillator(), g = G(0); a = a || .002;
  o.type = type || "sine";
  o.frequency.setValueAtTime(f, at);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + a + dur);
  env(g, at, a, peak, dur);
  o.connect(g); g.connect(dst);
  o.start(at); o.stop(at + a + dur + .05);
  return o;
}
function noise(at, dur, peak, dst, ftype, freq, q, a, buf){
  var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = G(0); a = a || .002;
  s.buffer = buf || nbuf; s.loop = true;
  f.type = ftype; f.frequency.value = freq; f.Q.value = q || 1;
  env(g, at, a, peak, dur);
  s.connect(f); f.connect(g); g.connect(dst);
  s.start(at, Math.random() * 1.5); s.stop(at + a + dur + .05);
  return {f: f, g: g};
}
function loop(buf){ var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * 2); return s; }
function filt(type, freq, q){ var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1; return f; }

/* 金属の打音：不協和な倍音を重ねる */
function clank(at, o){
  var d = out(o.pan, o.bus, o.send == null ? .3 : o.send), p = o.pitch || 1, g = o.gain || .25, h = o.heavy ? 1.8 : 1;
  [[1, 1], [2.76, .45], [5.4, .22], [8.93, .1]].forEach(function(q){ tone(at, 340 * p * q[0], .16 * h / Math.sqrt(q[0]), g * q[1] * .5, d); });
  noise(at, .03, g * .9, d, "bandpass", 2600 * p, 1.1);
  tone(at, o.heavy ? 96 : 120, .09 * h, g * (o.heavy ? 1.1 : .5), d, "sine", 48);
}
/* 歯車が一歯進む：先に爪が外れる「カチ」、止まるときに「ゴトッ」 */
function gearTick(at, heavy){
  var d = out(POS.gear, null, .2);
  noise(at, .014, heavy ? .16 : .1, d, "bandpass", 4300, 3);
  tone(at, 2300, .02, .03, d);
  clank(at + .22 / RATE, {pan: POS.gear, pitch: heavy ? .62 : .95, gain: heavy ? .3 : .13, heavy: heavy, send: heavy ? .5 : .25});
  if (heavy) noise(at + .24 / RATE, .5, .05, d, "lowpass", 260, .7, .01, bbuf);
}
/* 蒸気を逃がす */
function vent(at){
  var d = out(POS.valve, null, .35);
  clank(at, {pan: POS.valve, pitch: 1.5, gain: .16});
  var s = ctx.createBufferSource(), f = filt("bandpass", 1800, .6), hp = filt("highpass", 900), g = G(0);
  s.buffer = nbuf; s.loop = true;
  f.frequency.setValueAtTime(1800, at);
  f.frequency.exponentialRampToValueAtTime(5200, at + .25);
  f.frequency.exponentialRampToValueAtTime(3000, at + BURST);
  g.gain.setValueAtTime(.0001, at);
  g.gain.exponentialRampToValueAtTime(.34, at + .05);
  g.gain.exponentialRampToValueAtTime(.2, at + 1.4);
  g.gain.exponentialRampToValueAtTime(.0001, at + BURST + .2);
  s.connect(hp); hp.connect(f); f.connect(g); g.connect(d);
  s.start(at, Math.random()); s.stop(at + BURST + .3);
  noise(at, .45, .22, d, "lowpass", 800, .7, .01, bbuf);
}
/* 遠くの工場の汽笛 */
function whistleSound(at){
  var d = out(POS.window, null, 1.1), lp = filt("lowpass", 1400), g = G(0), dur = WHISTLE;
  lp.connect(g); g.connect(d);
  g.gain.setValueAtTime(.0001, at);
  g.gain.exponentialRampToValueAtTime(.045, at + .5);
  g.gain.setValueAtTime(.045, at + dur - 1.2);
  g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  var lfo = ctx.createOscillator(); lfo.frequency.value = 5.2; lfo.start(at); lfo.stop(at + dur + .1);
  [233, 277, 349].forEach(function(f){
    var o = ctx.createOscillator(), lg = G(f * .004);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * .93, at);
    o.frequency.exponentialRampToValueAtTime(f, at + .45);
    o.frequency.setValueAtTime(f, at + dur - 1);
    o.frequency.exponentialRampToValueAtTime(f * .9, at + dur);
    lfo.connect(lg); lg.connect(o.frequency);
    o.connect(lp); o.start(at); o.stop(at + dur + .1);
  });
  var s = ctx.createBufferSource(), bf = filt("bandpass", 1000, 1.4), bg = G(0);
  s.buffer = nbuf; s.loop = true;
  bg.gain.setValueAtTime(.0001, at); bg.gain.exponentialRampToValueAtTime(.03, at + .3); bg.gain.setValueAtTime(.03, at + dur - 1.2); bg.gain.exponentialRampToValueAtTime(.0001, at + dur);
  s.connect(bf); bf.connect(bg); bg.connect(d); s.start(at); s.stop(at + dur + .1);
}
function crackle(at, dur){
  var d = out(POS.lamp, null, .1);
  for (var i = 0; i < 6; i++) noise(at + SR() * dur, .006, .05 + SR() * .05, d, "highpass", 2800);
}
function watchTick(at, k){
  var d = out(POS.watch, watchBus, .04);
  noise(at, .01, .07, d, "bandpass", k % 2 ? 5200 : 6400, 5);
  tone(at, k % 2 ? 3300 : 3900, .018, .018, d);
}

/* コーヒー */
function ceramic(at, d, g){ [1870, 2720, 4130, 5650].forEach(function(f, i){ tone(at, f * (.97 + SR() * .06), .2 - i * .035, g / (i + 1), d); }); }
function gurgle(at, dur, d){
  var s = ctx.createBufferSource(), f = filt("bandpass", 500, 6), g = G(0);
  s.buffer = nbuf; s.loop = true;
  g.gain.setValueAtTime(.0001, at);
  g.gain.exponentialRampToValueAtTime(.5, at + .08);
  g.gain.setValueAtTime(.4, at + dur - .25);
  g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  for (var x = 0; x < dur; x += .035) f.frequency.setValueAtTime(360 + SR() * 720, at + x);
  s.connect(f); f.connect(g); g.connect(d); s.start(at); s.stop(at + dur + .05);
  for (var i = 0; i < 16; i++) tone(at + SR() * dur, 260 + SR() * 200, .05, .05 + SR() * .06, d, "sine", 700 + SR() * 500, .003);
}
function splash(at, d){
  noise(at, .45, .42, d, "lowpass", 2200, .8, .005);
  noise(at, .25, .22, d, "bandpass", 700, 1.5);
  tone(at, 90, .12, .2, d, "sine", 50);
  for (var i = 0; i < 6; i++) tone(at + .02 + SR() * .25, 500 + SR() * 400, .04, .04, d, "sine", 1300 + SR() * 600, .002);
}
function soak(at, d){ noise(at, 1.5, .05, d, "highpass", 2600, .7, .25, rbufs[0]); }
/* 浮かび上がる記録：低く鳴る残響 */
function emerge(at){
  var d = out(0, deskBus, 1);
  [98, 146.8, 196].forEach(function(f, i){ tone(at, f, 3, [.05, .035, .015][i], d, "sine", null, 1); });
  tone(at + .4, 587, 2.2, .006, d, "sine", null, .8);
}
function rustle(at, g, rate, bus){
  var s = ctx.createBufferSource(), hp = filt("highpass", 700), pk = filt("peaking", 3000, .7), gg = G(g), d = out((SR() - .5) * .4, bus || deskBus, .15);
  pk.gain.value = 4;
  s.buffer = rbufs[SR() * rbufs.length | 0]; s.playbackRate.value = rate || 1;
  s.connect(hp); hp.connect(pk); pk.connect(gg); gg.connect(d);
  s.start(at);
}

/* ── 環境音（常に鳴っている層） ── */
function beds(){
  var room = loop(bbuf), rf = filt("lowpass", 380), rg = G(.16);
  room.connect(rf); rf.connect(rg); rg.connect(sceneBus);
  var humG = G(.025), h1 = ctx.createOscillator(), h2 = ctx.createOscillator(), h2g = G(.4), hf = filt("lowpass", 300);
  h1.frequency.value = 49; h2.type = "triangle"; h2.frequency.value = 98;
  h1.connect(hf); h2.connect(h2g); h2g.connect(hf); hf.connect(humG); humG.connect(sceneBus);
  var lfo = ctx.createOscillator(), lg = G(.012); lfo.frequency.value = .11; lfo.connect(lg); lg.connect(humG.gain);
  h1.start(); h2.start(); lfo.start();
  var city = loop(bbuf), cf = filt("bandpass", 160, .8), cg = G(.12);
  city.connect(cf); cf.connect(cg); cg.connect(out(POS.window, null, .3));
  var hs = loop(nbuf), hp = filt("highpass", 1800);
  hissF = filt("bandpass", 4200, .5); hissG = G(0);
  hs.connect(hp); hp.connect(hissF); hissF.connect(hissG); hissG.connect(out(POS.valve, null, .25));
  var bz = ctx.createOscillator(), bf = filt("bandpass", 210, 3), bg = G(.004);
  bz.type = "sawtooth"; bz.frequency.value = 100; bz.connect(bf); bf.connect(bg); bg.connect(out(POS.lamp)); bz.start();
}

function init(){
  ctx = new AC();
  nbuf = mkNoise(2); bbuf = mkNoise(4, true); rbufs = [11, 23, 37].map(mkRustle);
  var comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = .004; comp.release.value = .2;
  master = G(0); master.connect(comp); comp.connect(ctx.destination);
  verb = ctx.createConvolver(); verb.buffer = mkImpulse(2.6, 2.8);
  var vo = G(.5); verb.connect(vo); vo.connect(master);
  sceneLP = filt("lowpass", 18000, .5); sceneBus = G(1); sceneBus.connect(sceneLP); sceneLP.connect(master);
  deskBus = G(1); deskBus.connect(master);
  watchBus = G(.6); watchBus.connect(deskBus);
  beds();
}

/* 先読みスケジューラ：映像と同じ時刻表から、次の0.25秒ぶんの音を予約する */
function sched(){
  if (!on || !ctx || ctx.state !== "running") return;
  var t = now(), until = t + .25, from = lastUntil;
  if (until - from > 1.5 || from > until) from = t;
  var base = ctx.currentTime;
  function A(x){ return base + Math.max(0, x - t); }
  fill(until + 120);
  for (var k = Math.floor(from * RATE) + 1; k <= Math.floor(until * RATE); k++) gearTick(A(k / RATE), k % 18 === 0);
  bursts.forEach(function(b){ if (b > from && b <= until) vent(A(b)); });
  whistles.forEach(function(w){ if (w > from && w <= until) whistleSound(A(w)); });
  anvils.forEach(function(a){
    for (var i = 0; i < a.n; i++){ var x = a.t + i * a.gap; if (x > from && x <= until) clank(A(x), {pan: a.pan, pitch: a.p, gain: .045, send: 1.3}); }
  });
  flicks.forEach(function(f){ if (f.t > from && f.t <= until) crackle(A(f.t), f.d); });
  for (var w = Math.floor(from * 4) + 1; w <= Math.floor(until * 4); w++) watchTick(A(w / 4), w);
  var P = pressure(t), leak = P.venting ? .004 : .004 + .035 * Math.pow(Math.max(0, (P.p - .7) / .25), 2);
  hissG.gain.setTargetAtTime(leak, base, .1);
  hissF.frequency.setTargetAtTime(3600 + P.p * 1600, base, .2);
  lastUntil = until;
}

/* 下にスクロールして紙面を読んでいるあいだは、工房の音が遠くくぐもる */
var sceneEl = document.getElementById("scene");
function focus(){
  if (!ctx || !sceneEl) return;
  var r = sceneEl.getBoundingClientRect(), vis = Math.max(0, Math.min(1, r.bottom / Math.max(1, r.height))), c = ctx.currentTime;
  sceneBus.gain.setTargetAtTime(.32 + .68 * vis, c, .2);
  sceneLP.frequency.setTargetAtTime(650 + 17000 * vis * vis * vis, c, .2);
  watchBus.gain.setTargetAtTime(.35 + .65 * (1 - vis), c, .3);
}
var fq = false;
window.addEventListener("scroll", function(){ if (fq || !on) return; fq = true; requestAnimationFrame(function(){ fq = false; focus(); }); }, {passive: true});

/* ── 切替スイッチ ── */
var sw = document.getElementById("soundsw");
function ui(){
  if (!sw) return;
  sw.setAttribute("aria-pressed", on ? "true" : "false");
  sw.dataset.state = on ? "on" : (waiting ? "wait" : "off");
  sw.querySelector("small").textContent = on ? "ON · 鳴動中" : (waiting ? "触れると再開" : "OFF · 消音");
  sw.setAttribute("aria-label", on ? "工房の音を止める" : "工房の音を鳴らす");
}
function setOn(v){
  if (v && !AC) return;
  waiting = false;
  if (v){
    if (!ctx){ try { init(); } catch(e){ return; } }
    on = true; ui();
    ctx.resume();
    lastUntil = now();
    var c = ctx.currentTime;
    master.gain.cancelScheduledValues(c); master.gain.setTargetAtTime(.9, c, .25);
    clank(c + .03, {pan: .85, pitch: 1.9, gain: .12, bus: deskBus, send: .1});
    focus();
    if (!timer) timer = setInterval(sched, 50);
  } else {
    on = false; ui();
    if (ctx){
      var c2 = ctx.currentTime;
      clank(c2 + .01, {pan: .85, pitch: 1.6, gain: .12, bus: deskBus, send: .1});
      master.gain.setTargetAtTime(0, c2 + .08, .12);
      setTimeout(function(){ if (!on && ctx) ctx.suspend(); }, 700);
    }
  }
  try { localStorage.setItem("roster-sound", v ? "1" : "0"); } catch(e){}
}
if (sw){
  if (!AC) sw.hidden = true;
  sw.addEventListener("click", function(){ setOn(!on); });
}
try { waiting = localStorage.getItem("roster-sound") === "1"; } catch(e){}
if (waiting){
  var wake = function(e){
    if (!waiting){ off(); return; }
    if (sw && sw.contains(e.target)){ off(); waiting = false; return; }
    off(); setOn(true);
  };
  var off = function(){ document.removeEventListener("pointerdown", wake, true); document.removeEventListener("keydown", wake, true); };
  document.addEventListener("pointerdown", wake, true);
  document.addEventListener("keydown", wake, true);
}
ui();
document.addEventListener("visibilitychange", function(){
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else if (on){ ctx.resume(); lastUntil = now(); }
});

function live(){ return on && ctx && ctx.state === "running"; }
function at0(){ return ctx.currentTime + .02; }

window.WS = {
  now: now, RATE: RATE, BURST: BURST,
  teeth: teeth, pressure: pressure, whistle: whistle, flicker: flicker,
  since: function(k){ return now() - marks[k]; },
  kick: function(k){
    var t = now();
    if (k === "gear"){ if (t - kickT < .35) return; kickN++; kickT = t; if (live()){ var a = at0(); clank(a, {pan: POS.gear, pitch: .8, gain: .42, heavy: true, send: .5}); var d = out(POS.gear, null, .4); tone(a, 1250, .9, .05, d); tone(a, 3375, .5, .025, d); } }
    if (k === "lamp" && live()){ var a2 = at0(), d2 = out(POS.lamp, null, .3), o = ctx.createOscillator(), bf = filt("bandpass", 1050, 9), g = G(0);
      o.type = "square"; o.frequency.setValueAtTime(19, a2); o.frequency.exponentialRampToValueAtTime(9, a2 + 1.1);
      env(g, a2, .05, .35, 1.1); o.connect(bf); bf.connect(g); g.connect(d2); o.start(a2); o.stop(a2 + 1.3);
      for (var i = 0; i < 4; i++) tone(a2 + i * .07 + SR() * .03, 3000 + SR() * 2000, .05, .02, d2);
      crackle(a2 + .1, .4); }
    if (k === "gauge" && live()){ var a3 = at0(), d3 = out(POS.gauge, null, .3);
      tone(a3, 2950, .25, .08, d3); tone(a3, 4610, .15, .04, d3); noise(a3, .02, .1, d3, "bandpass", 1500, 2);
      var sp = tone(a3 + .01, 560, .7, .03, d3, "triangle", 470); }
    marks[k] = t;
  },
  burstNow: function(){
    var t = now();
    if (pressure(t).venting) return false;
    bursts = bursts.filter(function(b){ return b < t - BURST || b > t + 14; });
    bursts.push(t); bursts.sort(function(a, b){ return a - b; });
    if (live()) vent(at0());
    return true;
  }
};

window.SFX = {
  pos: POS,
  isOn: function(){ return on; },
  /* full: マグを倒したとき（カップが倒れ、注ぎ、跳ねる）／false: 紙面のスイッチから */
  spill: function(full){
    if (!live()) return;
    var a = at0(), d = out(POS.mug, null, .3), dd = out(0, deskBus, .3);
    if (full){
      ceramic(a, d, .09); noise(a, .05, .25, d, "bandpass", 380, 3);
      tone(a + .42, 140, .12, .35, d, "sine", 70);
      for (var i = 0; i < 4; i++) ceramic(a + .45 + i * .06 * (1 - i * .15), d, .04 / (i + 1));
      gurgle(a + .38, .9, d);
      splash(a + .68, dd); soak(a + .8, dd); emerge(a + 1.1);
    } else {
      splash(a, dd); soak(a + .1, dd); emerge(a + .45);
    }
  },
  drip: function(){
    if (!live()) return;
    var a = at0(), d = out(POS.mug, deskBus, .4);
    tone(a, 900, .04, .12, d, "sine", 2200, .001); tone(a + .012, 1500, .05, .035, d, "sine", 2600);
  },
  /* 紙面を取り替える */
  swap: function(){
    if (!live()) return;
    var a = at0();
    rustle(a, .9, .85); rustle(a + .22, .7, 1.05);
    noise(a + .5, .1, .35, out(0, deskBus, .2), "lowpass", 1100, .7);
  },
  page: function(){
    if (!live()) return;
    var a = at0();
    rustle(a, .55, .9 + SR() * .25);
    noise(a, .28, .12, out(0, deskBus), "lowpass", 600, .7, .07);
  },
  stamp: function(delay){
    if (!live()) return;
    var a = ctx.currentTime + (delay || 0) + .01;
    if (a - lastStamp < .09) a = lastStamp + .09;
    lastStamp = a;
    var d = out((SR() - .5) * .4, deskBus, .25);
    tone(a, 95, .16, .5, d, "sine", 42);
    noise(a, .07, .32, d, "lowpass", 700, .7);
    noise(a + .004, .03, .12, d, "bandpass", 1800, 2);
  }
};
})();
