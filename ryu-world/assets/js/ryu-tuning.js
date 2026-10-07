/* =========================================================
   龍の世界 / 調律（音・揺らぎ・眺め）― 全ページ共通
   =========================================================
   ・響き … サイト全体の音（環境音と、触れたときの音）
   ・揺らぎ … 演出の動き（止めると、動きはすべて静止する）
   ・眺め … 世界地図を立体で見るか、真上から平面で見るか（地図のページのみ）

   音はすべてその場で合成する（音声ファイルは使わない）。
   ブラウザの決まりで、最初に画面に触れるまでは鳴らない。

   使い方（<head> の中で読み込む）：
     <script src=".../ryu-tuning.js"
             data-ambient="deep"      … 環境音の種類（deep / genesis / realm / none）
             data-view="true"         … 「眺め」の項目を出す（世界地図のみ）
             data-pos="map"></script> … ボタンの位置の調整（map / below-music）

   他のスクリプトからは window.RyuTuning を使う：
     RyuTuning.get("sound")                    … "on" / "off"
     RyuTuning.select("eden")                  … 世界を選んだ音
     RyuTuning.cue("river-life")               … 創世の演出の音
     RyuTuning.mood("alias")                   … 環境音の色合い
     RyuTuning.progress(0.5)                   … 創世ページの進み具合（0〜1）
     window.addEventListener("ryu-tuning", e => e.detail.settings)
   ========================================================= */

(function () {

    "use strict";

    const script = document.currentScript;
    const OPT = {
        ambient: script?.dataset.ambient || "none",
        view: script?.dataset.view === "true",
        pos: script?.dataset.pos || "",
        ui: script?.dataset.ui !== "none"
    };

    const KEY = "ryu-tuning";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const settings = { sound: "on", motion: reduce ? "off" : "on", view: "3d" };

    try {
        Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch (e) { /* 保存できない環境でも動かす */ }

    const root = document.documentElement;

    function applyMotion() {
        root.dataset.motion = settings.motion;
    }

    applyMotion();


    /*
     * ======================================================
     * 見た目（このファイルだけで完結させる）
     * ======================================================
     */

    const css = `
html[data-motion="off"] *,
html[data-motion="off"] *::before,
html[data-motion="off"] *::after {
    animation-duration: 0.001s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
}

.ryu-tuning {
    position: fixed;
    top: clamp(1rem, 3vh, 1.8rem);
    right: clamp(1rem, 3vw, 2rem);
    z-index: 40;

    font-family: "Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", serif;
    color: #ece9e2;
    text-align: right;
}

.ryu-tuning[data-pos="below-music"] {
    top: calc(clamp(1rem, 3vh, 1.8rem) + 2.9rem);
}

@media (max-width: 700px) {
    .ryu-tuning[data-pos="map"] {
        top: calc(clamp(1.2rem, 3.5vh, 2.2rem) + 2.2rem);
    }
}

.ryu-tuning-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;

    padding: 0.4rem 0.2rem 0.4rem 0.6rem;

    border: 0;
    background: none;
    color: inherit;

    font: inherit;
    font-size: 0.74rem;
    letter-spacing: 0.3em;

    opacity: 0.6;

    cursor: pointer;

    text-shadow: 0 0 8px #000;

    transition: opacity 0.4s ease;
}

.ryu-tuning-toggle:hover,
.ryu-tuning-toggle:focus-visible,
.ryu-tuning.is-open .ryu-tuning-toggle {
    opacity: 1;
}

.ryu-tuning-toggle:focus-visible,
.ryu-tuning-panel button:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.6);
    outline-offset: 3px;
}

/* 四芒の印。響きがあるときだけ、ゆっくり瞬く */
.ryu-tuning-star {
    width: 13px;
    height: 13px;

    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
}

.ryu-tuning[data-sound="on"] .ryu-tuning-star {
    animation: ryuStar 4.8s ease-in-out infinite;
}

.ryu-tuning[data-sound="off"] .ryu-tuning-star {
    opacity: 0.45;
    filter: none;
}

@keyframes ryuStar {
    0%, 100% { transform: scale(0.85) rotate(0deg); opacity: 0.7; }
    50% { transform: scale(1.1) rotate(45deg); opacity: 1; }
}

.ryu-tuning-panel {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);

    min-width: 15.5rem;

    padding: 1.2rem 1.3rem 1.1rem;

    text-align: left;

    background:
        linear-gradient(180deg, rgba(10, 10, 12, 0.92), rgba(0, 0, 0, 0.94));
    border: 1px solid rgba(255, 255, 255, 0.16);

    box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);

    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;

    transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}

/* 上の縁に、細い光の筋 */
.ryu-tuning-panel::before {
    content: "";

    position: absolute;
    left: 1.3rem;
    right: 1.3rem;
    top: -1px;

    height: 1px;

    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
}

.ryu-tuning.is-open .ryu-tuning-panel {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.rt-eyebrow {
    margin: 0 0 1rem;

    font-size: 0.6rem;
    letter-spacing: 0.5em;

    opacity: 0.5;
}

.rt-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.4rem;

    padding: 0.55rem 0;

    border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.rt-name {
    font-size: 0.86rem;
    letter-spacing: 0.32em;
}

.rt-name small {
    display: block;

    margin-top: 0.2rem;

    font-size: 0.56rem;
    letter-spacing: 0.3em;

    opacity: 0.45;
}

.rt-opts {
    display: inline-flex;
    align-items: baseline;
    gap: 0.2rem;

    font-size: 0.74rem;
    letter-spacing: 0.16em;
    white-space: nowrap;
}

.rt-opts button {
    position: relative;

    padding: 0.35rem 0.35rem 0.45rem;

    border: 0;
    background: none;
    color: inherit;

    font: inherit;
    letter-spacing: inherit;

    opacity: 0.38;

    cursor: pointer;

    transition: opacity 0.4s ease, text-shadow 0.4s ease;
}

.rt-opts button:hover {
    opacity: 0.75;
}

.rt-opts button[aria-pressed="true"] {
    opacity: 1;

    text-shadow: 0 0 10px rgba(255, 255, 255, 0.55);
}

/* 選んでいる方の下に、小さな菱形 */
.rt-opts button[aria-pressed="true"]::after {
    content: "";

    position: absolute;
    left: 50%;
    bottom: 0;

    width: 4px;
    height: 4px;

    background: #fff;

    transform: translateX(-50%) rotate(45deg);

    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.rt-sep {
    opacity: 0.25;
}

.rt-note {
    margin: 0.8rem 0 0;

    font-size: 0.6rem;
    letter-spacing: 0.14em;
    line-height: 1.8;

    opacity: 0.42;
}
`;

    const style = document.createElement("style");
    style.textContent = css;
    (document.head || root).appendChild(style);


    /*
     * ======================================================
     * 音（Web Audio でその場で合成する）
     * ======================================================
     */

    const AC = window.AudioContext || window.webkitAudioContext;

    let ac = null;
    let master = null;
    let dry = null;
    let wet = null;
    let amb = null;
    let pendingMood = "base";
    let pendingProgress = 0;

    const now = () => ac.currentTime;

    function ramp(param, value, seconds) {
        const t = now();
        param.cancelScheduledValues(t);
        param.setValueAtTime(param.value, t);
        param.setTargetAtTime(value, t, Math.max(0.01, seconds / 3));
    }

    /* 残響（ノイズから作る、広い空間の響き） */
    function makeReverb(seconds = 3.6) {
        const rate = ac.sampleRate;
        const length = Math.floor(rate * seconds);
        const buffer = ac.createBuffer(2, length, rate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
            }
        }
        const conv = ac.createConvolver();
        conv.buffer = buffer;
        return conv;
    }

    function noiseBuffer(seconds = 2) {
        const length = Math.floor(ac.sampleRate * seconds);
        const buffer = ac.createBuffer(1, length, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    }

    function ensureAudio() {

        if (ac || !AC) return ac;

        ac = new AC();

        master = ac.createGain();
        master.gain.value = 0;
        master.connect(ac.destination);

        // 少しだけ角を落とす
        const comp = ac.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.ratio.value = 3;
        comp.connect(master);

        dry = ac.createGain();
        dry.gain.value = 0.9;
        dry.connect(comp);

        const reverb = makeReverb();
        wet = ac.createGain();
        wet.gain.value = 0.55;
        wet.connect(reverb);
        reverb.connect(comp);

        if (OPT.ambient !== "none") buildAmbient();

        return ac;

    }

    /* ---------- 環境音：低く続く響きと、遠い風、かすかな高い光 ---------- */

    function buildAmbient() {

        const out = ac.createGain();
        out.gain.value = 0;
        out.connect(dry);

        const send = ac.createGain();
        send.gain.value = 0.5;
        out.connect(send);
        send.connect(wet);

        // 低い響き
        const lp = ac.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 380;
        lp.Q.value = 0.6;
        lp.connect(out);

        const base = OPT.ambient === "realm" ? 65.41 : 55; // C2 / A1
        const drones = [
            [base, "sine", 0.32, -3],
            [base * 1.5, "sine", 0.18, 4],
            [base * 2, "triangle", 0.07, 2],
            [base * 3, "sine", 0.035, -5]
        ].map(([f, type, g, detune]) => {
            const o = ac.createOscillator();
            o.type = type;
            o.frequency.value = f;
            o.detune.value = detune;
            const gain = ac.createGain();
            gain.gain.value = g;
            o.connect(gain);
            gain.connect(lp);
            o.start();
            return { o, gain };
        });

        // 響きがゆっくり揺れる
        const lfo = ac.createOscillator();
        lfo.frequency.value = 0.045;
        const lfoGain = ac.createGain();
        lfoGain.gain.value = 120;
        lfo.connect(lfoGain);
        lfoGain.connect(lp.frequency);
        lfo.start();

        // 遠い風
        const wind = ac.createBufferSource();
        wind.buffer = noiseBuffer(4);
        wind.loop = true;
        const bp = ac.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 420;
        bp.Q.value = 0.8;
        const windGain = ac.createGain();
        windGain.gain.value = 0.05;
        wind.connect(bp);
        bp.connect(windGain);
        windGain.connect(out);
        wind.start();

        const wlfo = ac.createOscillator();
        wlfo.frequency.value = 0.07;
        const wlfoGain = ac.createGain();
        wlfoGain.gain.value = 260;
        wlfo.connect(wlfoGain);
        wlfoGain.connect(bp.frequency);
        wlfo.start();

        // かすかな高い光（楽園・創世の後半で現れる）
        const shimmer = ac.createGain();
        shimmer.gain.value = 0;
        shimmer.connect(out);
        [880, 1318.5, 1760, 2637].forEach((f, i) => {
            const o = ac.createOscillator();
            o.type = "sine";
            o.frequency.value = f;
            o.detune.value = (i % 2 ? 1 : -1) * 6;
            const g = ac.createGain();
            g.gain.value = 0.05 / (i + 1);
            const trem = ac.createOscillator();
            trem.frequency.value = 0.11 + i * 0.07;
            const tg = ac.createGain();
            tg.gain.value = 0.04 / (i + 1);
            trem.connect(tg);
            tg.connect(g.gain);
            o.connect(g);
            g.connect(shimmer);
            o.start();
            trem.start();
        });

        // 奈落の地鳴り
        const rumble = ac.createGain();
        rumble.gain.value = 0;
        rumble.connect(out);
        const ro = ac.createOscillator();
        ro.type = "sine";
        ro.frequency.value = 36.7;
        const ro2 = ac.createOscillator();
        ro2.type = "sine";
        ro2.frequency.value = 38.9;
        ro.connect(rumble);
        ro2.connect(rumble);
        ro.start();
        ro2.start();

        amb = { out, lp, drones, windGain, shimmer, rumble, send };

        applyMood(pendingMood, 0.1);
        if (OPT.ambient === "genesis") applyProgress(pendingProgress, 0.1);

    }

    const MOODS = {
        base: { lp: 380, shimmer: 0, rumble: 0, wind: 0.05, level: 0.16 },
        eden: { lp: 620, shimmer: 0.5, rumble: 0, wind: 0.035, level: 0.17 },
        alias: { lp: 230, shimmer: 0, rumble: 0.05, wind: 0.09, level: 0.15 },
        abyss: { lp: 180, shimmer: 0, rumble: 0.22, wind: 0.06, level: 0.16 },
        soul: { lp: 480, shimmer: 0.25, rumble: 0, wind: 0.06, level: 0.16 },
        quiet: { lp: 300, shimmer: 0, rumble: 0, wind: 0.03, level: 0.08 }
    };

    function applyMood(name, seconds = 2.5) {
        pendingMood = name;
        if (!amb) return;
        const m = MOODS[name] || MOODS.base;
        ramp(amb.lp.frequency, m.lp, seconds);
        ramp(amb.shimmer.gain, m.shimmer, seconds);
        ramp(amb.rumble.gain, m.rumble, seconds);
        ramp(amb.windGain.gain, m.wind, seconds);
        ramp(amb.out.gain, settings.sound === "on" ? m.level : 0, seconds + 1.5);
    }

    /* 創世ページ：色の無い闇 → 四つの流れ → 世界の誕生 と、響きが開いていく */
    function applyProgress(p, seconds = 1.2) {
        pendingProgress = p;
        if (!amb) return;
        ramp(amb.lp.frequency, 200 + 900 * p * p, seconds);
        ramp(amb.shimmer.gain, Math.max(0, (p - 0.55) / 0.45) * 0.6, seconds);
        ramp(amb.windGain.gain, 0.07 - p * 0.04, seconds);
    }

    /* ---------- 触れたときの音 ---------- */

    /* 鐘のような音（倍音を少しずらして重ねる） */
    function bell(freq, opts = {}) {

        if (!canPlay()) return;

        const t = now() + (opts.delay || 0);
        const level = opts.level ?? 0.12;
        const decay = opts.decay ?? 2.8;
        const partials = opts.partials || [[1, 1], [2.76, 0.42], [5.4, 0.18], [8.93, 0.07]];

        const out = ac.createGain();
        out.gain.value = 1;
        out.connect(dry);
        const send = ac.createGain();
        send.gain.value = opts.wet ?? 0.8;
        out.connect(send);
        send.connect(wet);

        partials.forEach(([ratio, g]) => {
            const o = ac.createOscillator();
            o.type = "sine";
            o.frequency.value = freq * ratio;
            const env = ac.createGain();
            env.gain.setValueAtTime(0, t);
            env.gain.linearRampToValueAtTime(level * g, t + 0.008);
            env.gain.exponentialRampToValueAtTime(0.0001, t + decay / Math.sqrt(ratio));
            o.connect(env);
            env.connect(out);
            o.start(t);
            o.stop(t + decay + 0.1);
        });

    }

    /* 息のような音（ノイズを帯域で絞り、音程を滑らせる） */
    function breath(from, to, seconds, level = 0.09, opts = {}) {

        if (!canPlay()) return;

        const t = now() + (opts.delay || 0);
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer(seconds + 0.2);
        const f = ac.createBiquadFilter();
        f.type = opts.type || "bandpass";
        f.Q.value = opts.q ?? 1.2;
        f.frequency.setValueAtTime(from, t);
        f.frequency.exponentialRampToValueAtTime(to, t + seconds);
        const env = ac.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(level, t + seconds * 0.35);
        env.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
        src.connect(f);
        f.connect(env);
        env.connect(dry);
        const send = ac.createGain();
        send.gain.value = 0.6;
        env.connect(send);
        send.connect(wet);
        src.start(t);
        src.stop(t + seconds + 0.2);

    }

    /* 低い響き（落ちていく正弦波） */
    function boom(from, to, seconds, level = 0.3, delay = 0) {

        if (!canPlay()) return;

        const t = now() + delay;
        const o = ac.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(from, t);
        o.frequency.exponentialRampToValueAtTime(to, t + seconds);
        const env = ac.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(level, t + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
        o.connect(env);
        env.connect(dry);
        const send = ac.createGain();
        send.gain.value = 0.4;
        env.connect(send);
        send.connect(wet);
        o.start(t);
        o.stop(t + seconds + 0.05);

    }

    // 最後に音を鳴らした時刻（触れた音が、ページ側の音と重ならないように）
    let lastCue = 0;

    function canPlay() {
        const ok = ac && ac.state === "running" && settings.sound === "on";
        if (ok) lastCue = performance.now();
        return ok;
    }

    // 世界ごとの響き（楽園が最も高く、奈落が最も低い）
    const WORLD_TONES = {
        eden: () => {
            bell(1046.5, { level: 0.1, decay: 4.2 });
            bell(1567.98, { level: 0.05, decay: 3.6, delay: 0.09 });
            bell(2093, { level: 0.03, decay: 3.2, delay: 0.18 });
        },
        fronz: () => {
            bell(659.25, { level: 0.11 });
            bell(987.77, { level: 0.05, delay: 0.12 });
        },
        misseo: () => {
            bell(587.33, { level: 0.11 });
            bell(880, { level: 0.05, delay: 0.12 });
        },
        other: () => {
            bell(783.99, { level: 0.08, decay: 2.2 });
            bell(1174.66, { level: 0.04, decay: 2, delay: 0.07 });
            bell(1318.5, { level: 0.03, decay: 1.8, delay: 0.16 });
        },
        soul: () => {
            bell(880, { level: 0.07, decay: 3.4, partials: [[1, 1], [2, 0.3], [3, 0.12]] });
            breath(900, 2400, 1.6, 0.03);
        },
        alias: () => {
            bell(196, { level: 0.16, decay: 4.5, partials: [[1, 1], [2.4, 0.5], [3.9, 0.3], [6.1, 0.12]] });
            bell(207.65, { level: 0.06, decay: 4, delay: 0.2 });
            breath(240, 120, 2.6, 0.05, { type: "lowpass", q: 0.7 });
        },
        abyss: () => {
            boom(110, 38, 3.2, 0.32);
            bell(98, { level: 0.1, decay: 4, partials: [[1, 1], [1.06, 0.6], [2.9, 0.2]] });
        }
    };

    const CUES = {
        // 創世ページ
        tremble: () => breath(160, 90, 1.2, 0.08, { type: "lowpass", q: 0.6 }),
        fought: () => {
            boom(90, 34, 2.8, 0.4);
            breath(300, 80, 2.4, 0.08, { type: "lowpass", q: 0.5 });
        },
        tear: () => {
            breath(1800, 6200, 0.7, 0.07, { q: 2 });
            breath(1400, 5200, 0.6, 0.05, { q: 2, delay: 0.18 });
            breath(2000, 7000, 0.5, 0.04, { q: 2, delay: 0.34 });
        },
        smolder: () => breath(220, 110, 2.2, 0.06, { type: "lowpass", q: 0.4 }),
        shatter: () => {
            boom(140, 30, 1.8, 0.35);
            breath(4000, 300, 1.2, 0.1, { q: 0.6 });
            [523.25, 554.37, 739.99, 783.99].forEach((f, i) =>
                bell(f, { level: 0.05, decay: 1.6, delay: 0.05 * i })
            );
        },
        flicker: () => [0, 1, 2, 3].forEach((i) =>
            bell([587.33, 440, 659.25, 739.99][i] * 2, { level: 0.025, decay: 0.8, delay: i * 0.13, wet: 1 })
        ),
        "river-life": () => bell(587.33, { level: 0.1, decay: 3.6 }),
        "river-knowledge": () => bell(440, { level: 0.1, decay: 3.6 }),
        "river-creation": () => bell(659.25, { level: 0.1, decay: 3.6 }),
        "river-soul": () => bell(739.99, { level: 0.1, decay: 3.6 }),
        birth: () => {
            [587.33, 739.99, 880, 1174.66, 1318.5, 1760, 2349.3].forEach((f, i) =>
                bell(f, { level: 0.045, decay: 3, delay: i * 0.16 + Math.random() * 0.05 })
            );
        },
        enter: () => {
            breath(200, 1600, 1.4, 0.08);
            bell(293.66, { level: 0.08, decay: 4 });
            bell(440, { level: 0.06, decay: 4, delay: 0.1 });
        },
        // 共通
        leave: () => {
            breath(300, 1900, 0.55, 0.12);
            bell(880, { level: 0.07, decay: 1.4, partials: [[1, 1], [2.76, 0.25]], wet: 0.7 });
        },
        // かすかに触れる音（なぞっただけの音なので、「鳴らした時刻」には数えない）
        tick: () => {
            const keep = lastCue;
            bell(2093, { level: 0.022, decay: 0.35, partials: [[1, 1]], wet: 0.3 });
            lastCue = keep;
        },
        // ボタンなどに触れたときの音（世界地図で世界を選んだ音と同じくらい聞こえるように）
        tap: () => {
            bell(1318.5, { level: 0.1, decay: 0.9, partials: [[1, 1], [2.76, 0.22]], wet: 0.45 });
            bell(659.25, { level: 0.045, decay: 1.1, partials: [[1, 1]], wet: 0.6, delay: 0.015 });
        },
        close: () => bell(392, { level: 0.05, decay: 1.6, partials: [[1, 1], [2.76, 0.2]] }),
        open: () => bell(1174.66, { level: 0.04, decay: 1.4 })
    };

    /* ---------- 鳴らし始め・止め ---------- */

    function soundOn() {
        if (!ac) return;
        if (ac.state === "suspended") ac.resume();
        ramp(master.gain, 1, 1.2);
        applyMood(pendingMood, 3);
    }

    function soundOff() {
        if (!ac) return;
        ramp(master.gain, 0, 0.8);
    }

    // 最初に触れたときに、音を目覚めさせる
    function unlock() {
        if (!AC || settings.sound !== "on") return;
        ensureAudio();
        if (ac.state === "suspended") ac.resume();
        soundOn();
    }

    ["pointerdown", "keydown", "touchend"].forEach((type) => {
        window.addEventListener(type, unlock, { capture: true, passive: true });
    });

    document.addEventListener("visibilitychange", () => {
        if (!ac) return;
        if (document.hidden) {
            ramp(master.gain, 0, 0.3);
        } else if (settings.sound === "on") {
            if (ac.state === "suspended") ac.resume();
            ramp(master.gain, 1, 1);
        }
    });


    /*
     * ======================================================
     * 設定の保存と通知
     * ======================================================
     */

    function set(key, value) {

        if (settings[key] === value) return;

        settings[key] = value;

        try {
            localStorage.setItem(KEY, JSON.stringify(settings));
        } catch (e) { /* 何もしない */ }

        if (key === "motion") applyMotion();

        if (key === "sound") {
            if (value === "on") {
                ensureAudio();
                soundOn();
                bell(1174.66, { level: 0.05, decay: 2 });
            } else {
                soundOff();
            }
        }

        updateUI();

        window.dispatchEvent(new CustomEvent("ryu-tuning", { detail: { key, value, settings: { ...settings } } }));

    }

    // 別のページ（楽園の枠など）で変えられたとき
    window.addEventListener("storage", (e) => {
        if (e.key !== KEY) return;
        try {
            const next = JSON.parse(e.newValue || "{}");
            Object.keys(next).forEach((k) => {
                if (settings[k] !== next[k]) {
                    settings[k] = next[k];
                    if (k === "motion") applyMotion();
                    if (k === "sound") (next[k] === "on" ? soundOn : soundOff)();
                    window.dispatchEvent(new CustomEvent("ryu-tuning", { detail: { key: k, value: next[k], settings: { ...settings } } }));
                }
            });
            updateUI();
        } catch (err) { /* 何もしない */ }
    });


    /*
     * ======================================================
     * 調律の印と、開く小さな板
     * ======================================================
     */

    let wrap = null;

    const ROWS = [
        { key: "sound", name: "響き", en: "RESONANCE", opts: [["on", "鳴らす"], ["off", "静める"]] },
        { key: "motion", name: "揺らぎ", en: "MOTION", opts: [["on", "動かす"], ["off", "止める"]] },
        { key: "view", name: "眺め", en: "VIEW", opts: [["3d", "立体"], ["flat", "平面"]], only: "view" }
    ];

    function buildUI() {

        if (!OPT.ui || !document.body) return;

        wrap = document.createElement("div");
        wrap.className = "ryu-tuning";
        if (OPT.pos) wrap.dataset.pos = OPT.pos;

        const rows = ROWS.filter((r) => !r.only || OPT[r.only]).map((r) =>
            `<div class="rt-row" role="group" aria-label="${r.name}">` +
            `<span class="rt-name">${r.name}<small>${r.en}</small></span>` +
            `<span class="rt-opts">` +
            r.opts.map(([v, label], i) =>
                (i ? '<span class="rt-sep" aria-hidden="true">／</span>' : "") +
                `<button type="button" data-key="${r.key}" data-val="${v}">${label}</button>`
            ).join("") +
            `</span></div>`
        ).join("");

        wrap.innerHTML =
            '<button type="button" class="ryu-tuning-toggle" aria-expanded="false" aria-controls="ryu-tuning-panel">' +
            '<svg class="ryu-tuning-star" viewBox="-10 -10 20 20" aria-hidden="true">' +
            '<path d="M0,-9 L1.6,-1.6 L9,0 L1.6,1.6 L0,9 L-1.6,1.6 L-9,0 L-1.6,-1.6 Z" fill="currentColor"/></svg>' +
            "<span>調律</span></button>" +
            '<div class="ryu-tuning-panel" id="ryu-tuning-panel" role="group" aria-label="調律">' +
            '<p class="rt-eyebrow">TUNING</p>' + rows +
            '<p class="rt-note">選んだ調律は、龍の世界のどこへ行っても続く。</p>' +
            "</div>";

        document.body.appendChild(wrap);

        const toggle = wrap.querySelector(".ryu-tuning-toggle");

        const setOpen = (open) => {
            wrap.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        };

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = !wrap.classList.contains("is-open");
            setOpen(open);
            if (open) CUES.open();
        });

        wrap.querySelectorAll(".rt-opts button").forEach((b) => {
            b.addEventListener("click", (e) => {
                e.stopPropagation();
                set(b.dataset.key, b.dataset.val);
                if (b.dataset.key !== "sound") CUES.tap();
            });
        });

        // 板の中の操作が、後ろの地図などに伝わらないように
        ["pointerdown", "pointerup", "wheel"].forEach((type) => {
            wrap.addEventListener(type, (e) => e.stopPropagation());
        });

        document.addEventListener("click", (e) => {
            if (!wrap.contains(e.target)) setOpen(false);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && wrap.classList.contains("is-open")) {
                setOpen(false);
                toggle.focus();
            }
        });

        updateUI();

    }

    function updateUI() {
        if (!wrap) return;
        wrap.dataset.sound = settings.sound;
        wrap.querySelectorAll(".rt-opts button").forEach((b) => {
            b.setAttribute("aria-pressed", settings[b.dataset.key] === b.dataset.val ? "true" : "false");
        });
    }


    /*
     * ======================================================
     * どのページでも：リンクで旅立つ音、触れたときのかすかな音
     * ======================================================
     */

    function hookLinks() {

        // window で受ける：ページ側がリンクを自分で扱うとき（楽園の枠など）を先に通すため
        window.addEventListener("click", (e) => {

            const a = e.target.closest?.("a[href]");

            if (!a || e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (a.target && a.target !== "_self") return;

            const href = a.getAttribute("href");
            if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;

            let url;
            try { url = new URL(a.href, location.href); } catch (err) { return; }
            if (url.origin !== location.origin) return;

            if (!canPlay()) return;

            tapHandled = true;

            // 旅立ちの音を、少しだけ聞かせてから移る
            e.preventDefault();
            const special = a.dataset.tuningCue;
            (CUES[special] || CUES.leave)();
            setTimeout(() => { location.href = url.href; }, special ? 650 : 260);

        });

        /*
         * ボタン・開閉・ページ内リンクなどに触れたときの音。
         * ページ側がすでに自分の音を鳴らしていれば（世界地図の選択など）重ねない。
         */
        let tapHandled = false;

        window.addEventListener("click", (e) => {

            if (tapHandled) { tapHandled = false; return; }

            const el = e.target.closest?.('button, summary, [role="button"], a[href], label, input[type="checkbox"], input[type="radio"], select');
            if (!el || el.closest(".ryu-tuning") || el.disabled) return;
            if (el.dataset.tuningSilent !== undefined) return;
            if (settings.sound !== "on" || !ac) return;

            if (performance.now() - lastCue < 120) return;

            if (ac.state === "running") {
                CUES.tap();
            } else {
                ac.resume().then(() => CUES.tap()).catch(() => {});
            }

        });

        let lastTick = 0;

        document.addEventListener("pointerover", (e) => {
            if (e.pointerType !== "mouse") return;
            const el = e.target.closest?.("a[href], button");
            if (!el || el.closest(".ryu-tuning") || el.contains(e.relatedTarget)) return;
            const t = performance.now();
            if (t - lastTick < 90) return;
            lastTick = t;
            CUES.tick();
        });

    }


    /*
     * ======================================================
     * 創世ページ：スクロールの進み具合で、響きが開いていく
     * ======================================================
     */

    function hookGenesis() {
        if (OPT.ambient !== "genesis") return;
        let raf = 0;
        const update = () => {
            raf = 0;
            const max = document.documentElement.scrollHeight - innerHeight;
            applyProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
        };
        window.addEventListener("scroll", () => {
            if (!raf) raf = requestAnimationFrame(update);
        }, { passive: true });
        update();
    }


    /*
     * ======================================================
     * 公開する窓口
     * ======================================================
     */

    window.RyuTuning = {
        get: (key) => settings[key],
        set,
        select: (world) => WORLD_TONES[world]?.(),
        cue: (name) => CUES[name]?.(),
        mood: (name) => applyMood(name),
        progress: (p) => applyProgress(p)
    };

    const start = () => {
        buildUI();
        hookLinks();
        hookGenesis();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

})();
