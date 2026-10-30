/* =========================================================
   龍の世界 / エイリアスワールド ― 十二使徒の鎖
   ---------------------------------------------------------
   背景に、十二使徒の十二色（世界地図と同じ色相環）の鎖を
   奥行きをつけて架け渡す。
   「世界を守るものなのに、どこか恐ろしい」印象のために、
   鎖は世界を縛るように画面の外から外へ垂れ下がり、
   ごくゆっくり軋むように揺れる。

   ・文字の後ろでは薄くなる（本文を読む邪魔をしない）
   ・「十二使徒」の段落まで読み進めると、鎖がわずかに灯る
   ・揺らぎOFF／動きを減らす設定では静止画として描く
   ・スマホでは描く解像度とコマ数を落とす
   ========================================================= */

(function () {

    "use strict";

    const canvas = document.getElementById("alias-chains");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const root = document.documentElement;
    const lite =
        window.matchMedia("(max-width: 700px)").matches ||
        (window.matchMedia("(pointer: coarse)").matches &&
            window.matchMedia("(max-width: 1100px)").matches);

    const still = () =>
        root.dataset.motion === "off" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ---------- 色（世界地図の十二使徒と同じ：hsl(i×30°, 42%, 62%)） ---------- */

    function hsl(h, s, l) {
        const a = s * Math.min(l, 1 - l);
        const f = (n) => {
            const k = (n + h * 12) % 12;
            return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        };
        return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round);
    }

    const COLORS = Array.from({ length: 12 }, (_, i) => hsl(i / 12, 0.42, 0.62));


    /* ---------- 決まった並び（毎回同じ形になるよう、種つきの乱数） ---------- */

    let seed = 12;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    /*
     * 鎖の架け方（画面の幅・高さに対する割合）。
     * 外から外へ渡し、中央の本文の帯は斜めに横切るだけにする。
     * depth：奥（0.4）〜手前（1）。手前ほど大きく、濃い。
     */
    const CHAINS = [
        { a: [-0.15, 0.06], b: [0.42, -0.12], sag: 0.16, depth: 0.55 },
        { a: [0.58, -0.12], b: [1.15, 0.10], sag: 0.18, depth: 0.6 },
        { a: [-0.2, 0.30], b: [0.36, 1.12], sag: 0.10, depth: 0.85 },
        { a: [0.64, 1.12], b: [1.2, 0.26], sag: 0.10, depth: 0.9 },
        { a: [-0.15, 0.52], b: [1.15, 0.42], sag: 0.22, depth: 0.42 },
        { a: [-0.2, 0.86], b: [0.5, 1.15], sag: 0.07, depth: 0.7 },
        { a: [0.5, 1.15], b: [1.2, 0.82], sag: 0.07, depth: 0.66 },
        { a: [0.08, -0.15], b: [0.26, 1.15], sag: 0.05, depth: 0.48 },
        { a: [0.92, -0.15], b: [0.74, 1.15], sag: 0.05, depth: 0.5 },
        { a: [-0.2, 0.18], b: [1.2, 0.20], sag: 0.30, depth: 0.4 },
        { a: [-0.18, 0.70], b: [1.18, 0.62], sag: 0.16, depth: 0.58 },
        { a: [-0.15, 1.02], b: [1.15, 0.98], sag: 0.12, depth: 1.0 }
    ].map((c, i) => ({
        ...c,
        color: COLORS[(i * 5) % 12],   // 隣り合う鎖が似た色にならないよう、色相環を飛び飛びに使う
        phase: rand() * Math.PI * 2,
        speed: 0.22 + rand() * 0.16,
        drift: 0.6 + rand() * 0.8
    }));


    /* ---------- 環の絵（色ごとに一度だけ描いておき、毎コマは貼るだけ） ---------- */

    const BASE = { len: 30, wid: 15, th: 3.6 };   // 一番手前の鎖の、環ひとつの大きさ（px）
    let SPRITE_SCALE = 2;
    const sprites = [];

    function makeSprites() {

        sprites.length = 0;

        const k = SPRITE_SCALE;
        const L = BASE.len * k;
        const Wd = BASE.wid * k;
        const T = BASE.th * k;
        const pad = 4 * k;

        COLORS.forEach((rgb) => {

            const [r, g, b] = rgb;
            const col = `rgb(${r},${g},${b})`;
            const dark = `rgb(${r * 0.32 | 0},${g * 0.32 | 0},${b * 0.32 | 0})`;
            const lite2 = `rgba(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)},0.9)`;

            /* 正面を向いた環（楕円の輪） */
            const ring = document.createElement("canvas");
            ring.width = Math.ceil(L + pad * 2);
            ring.height = Math.ceil(Wd + pad * 2);
            const rg = ring.getContext("2d");
            rg.translate(ring.width / 2, ring.height / 2);

            const rx = L / 2 - T / 2;
            const ry = Wd / 2 - T / 2;

            rg.lineWidth = T + 1.6 * k;
            rg.strokeStyle = "rgba(0,0,0,0.85)";
            rg.beginPath();
            rg.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            rg.stroke();

            rg.lineWidth = T;
            rg.strokeStyle = dark;
            rg.stroke();

            rg.lineWidth = T * 0.62;
            rg.strokeStyle = col;
            rg.beginPath();
            rg.ellipse(0, -T * 0.08, rx, ry, 0, 0, Math.PI * 2);
            rg.stroke();

            // 上側に細い照り返し
            rg.lineWidth = T * 0.24;
            rg.strokeStyle = lite2;
            rg.beginPath();
            rg.ellipse(0, -T * 0.18, rx, ry, 0, Math.PI * 1.12, Math.PI * 1.88);
            rg.stroke();

            /* 横を向いた環（細い棒に見える） */
            const bar = document.createElement("canvas");
            bar.width = Math.ceil(L + pad * 2);
            bar.height = Math.ceil(T * 1.5 + pad * 2);
            const bg = bar.getContext("2d");
            bg.translate(bar.width / 2, bar.height / 2);

            const bw = L - T * 0.4;
            const bh = T * 1.15;

            const pill = (w, h, dy = 0) => {
                bg.beginPath();
                if (bg.roundRect) {
                    bg.roundRect(-w / 2, -h / 2 + dy, w, h, h / 2);
                } else {
                    // 古いブラウザ向け：両端を半円にした棒
                    const r = h / 2;
                    bg.moveTo(-w / 2 + r, -r + dy);
                    bg.lineTo(w / 2 - r, -r + dy);
                    bg.arc(w / 2 - r, dy, r, -Math.PI / 2, Math.PI / 2);
                    bg.lineTo(-w / 2 + r, r + dy);
                    bg.arc(-w / 2 + r, dy, r, Math.PI / 2, Math.PI * 1.5);
                    bg.closePath();
                }
            };

            bg.fillStyle = "rgba(0,0,0,0.85)";
            pill(bw + 1.6 * k, bh + 1.6 * k);
            bg.fill();

            bg.fillStyle = dark;
            pill(bw, bh);
            bg.fill();

            bg.fillStyle = col;
            pill(bw * 0.94, bh * 0.5, -bh * 0.08);
            bg.fill();

            bg.fillStyle = lite2;
            pill(bw * 0.7, bh * 0.16, -bh * 0.26);
            bg.fill();

            sprites.push({ ring, bar });

        });

    }


    /* ---------- 画面の大きさ ---------- */

    let W = 0;
    let H = 0;
    let dpr = 1;

    function resize() {

        W = window.innerWidth;
        H = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.75);

        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;

        // 画面が小さいほど、鎖も少し細く
        unit = Math.max(0.62, Math.min(1.1, Math.min(W, H * 1.2) / 1100));

        const want = Math.min(2.5, dpr * unit * 1.05 + 0.2);
        if (Math.abs(want - SPRITE_SCALE) > 0.25 || !sprites.length) {
            SPRITE_SCALE = want;
            makeSprites();
        }

        draw(lastT);

    }

    let unit = 1;


    /* ---------- 描画 ---------- */

    let glow = 0.75;          // 現在の灯り（十二使徒の段落で上がる）
    let glowTarget = 1;
    let appear = 0;           // 現れ方（0→1）
    const born = performance.now();

    function smooth(x) {
        x = Math.max(0, Math.min(1, x));
        return x * x * (3 - 2 * x);
    }

    // 曲線上の点（端から端へ、たるみつき）
    function curvePoint(c, t, sag, sy) {
        const ax = c.a[0] * W;
        const ay = c.a[1] * H + sy;
        const bx = c.b[0] * W;
        const by = c.b[1] * H + sy;
        const x = ax + (bx - ax) * t;
        // 鎖は重さで垂れる：放物線（懸垂線に近い）
        const y = ay + (by - ay) * t + sag * H * 4 * t * (1 - t);
        return [x, y];
    }

    function drawChain(c, time, scrollY) {

        const d = c.depth;
        const s = unit * (0.45 + 0.55 * d);
        const link = BASE.len * s;
        const pitch = link * 0.74;   // 環どうしが噛み合う間隔

        // ゆっくり軋むような揺れ（たるみが呼吸する）
        const sway = Math.sin(time * c.speed + c.phase);
        const sag = c.sag * (1 + 0.05 * sway);
        // スクロールで、奥の鎖ほどゆっくり動く（奥行き）
        const sy = -scrollY * 0.05 * d + Math.sin(time * 0.17 + c.phase) * 3 * c.drift;

        // 曲線を細かく区切って長さを測る
        const N = 160;
        const pts = new Array(N + 1);
        const acc = new Float32Array(N + 1);
        for (let i = 0; i <= N; i++) {
            pts[i] = curvePoint(c, i / N, sag, sy);
            if (i) {
                acc[i] = acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
            }
        }

        const total = acc[N];
        const spr = sprites[COLORS.indexOf(c.color)];
        if (!spr) return;

        const k = s / SPRITE_SCALE;
        const baseAlpha = (0.16 + 0.34 * d) * glow * appear;
        const cx = W / 2;
        // 本文の帯の幅。スマホでは本文が画面のほとんどを占めるので、帯も広く・薄く
        const narrowScreen = W < 700;
        const colW = narrowScreen ? W * 0.5 : Math.min(W * 0.36, 380);
        const floor = narrowScreen ? 0.18 : 0.28;

        let j = 1;
        let n = 0;

        for (let dist = pitch * 0.5; dist < total; dist += pitch, n++) {

            while (j < N && acc[j] < dist) j++;

            const p0 = pts[j - 1];
            const p1 = pts[j];
            const u = (dist - acc[j - 1]) / ((acc[j] - acc[j - 1]) || 1);
            const x = p0[0] + (p1[0] - p0[0]) * u;
            const y = p0[1] + (p1[1] - p0[1]) * u;

            if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;

            // 本文の帯（画面中央）の後ろでは薄く
            const away = smooth((Math.abs(x - cx) - colW * 0.55) / colW);
            const a = baseAlpha * (floor + (1 - floor) * away);
            if (a < 0.01) continue;

            const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
            const img = n % 2 === 0 ? spr.ring : spr.bar;

            ctx.globalAlpha = a;
            ctx.setTransform(
                Math.cos(ang) * k * dpr, Math.sin(ang) * k * dpr,
                -Math.sin(ang) * k * dpr, Math.cos(ang) * k * dpr,
                x * dpr, y * dpr
            );
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

        }

    }

    let lastT = 0;

    function draw(time) {

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scrollY = window.scrollY || 0;

        // 奥から手前へ
        CHAINS.slice()
            .sort((p, q) => p.depth - q.depth)
            .forEach((c) => drawChain(c, time, scrollY));

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;

    }


    /* ---------- 時間の進み ---------- */

    const FPS = lite ? 20 : 30;
    let running = false;
    let prevFrame = 0;
    let clock = 0;

    function frame(now) {

        if (!running) return;

        const dt = Math.min(0.1, (now - prevFrame) / 1000 || 0);

        if (now - prevFrame >= 1000 / FPS - 2) {

            prevFrame = now;

            if (!still()) clock += dt;

            // ページが浮かび上がるのに続いて、闇の奥から鎖が現れる
            appear = smooth((now - born - 600) / 2600);
            glow += (glowTarget - glow) * 0.04;

            lastT = clock;
            draw(clock);

            // 揺らぎOFFで、現れ終わり・灯りも落ち着いたら止める
            if (still() && appear >= 1 && Math.abs(glowTarget - glow) < 0.005) {
                running = false;
                return;
            }

        }

        requestAnimationFrame(frame);

    }

    function start() {
        if (running || document.hidden) return;
        running = true;
        prevFrame = performance.now();
        requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) running = false;
        else start();
    });

    window.addEventListener("ryu-tuning", start);

    window.addEventListener("scroll", () => {
        if (!running) draw(lastT);
    }, { passive: true });

    window.addEventListener("resize", resize);


    /* ---------- 「十二使徒」まで読み進めたら、鎖がわずかに灯る ---------- */

    function watchApostles() {

        const target = [...document.querySelectorAll("#realm-lore .lore-block h2")]
            .find((h) => h.textContent.includes("十二使徒"));

        if (!target || !("IntersectionObserver" in window)) return;

        new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                // 見出しが画面に入ってから、読み終えて上へ去るまで
                const reached = e.isIntersecting || e.boundingClientRect.top < 0;
                glowTarget = reached ? 1.55 : 1;
                start();
            });
        }, { rootMargin: "0px 0px -25% 0px" }).observe(target.closest(".lore-block") || target);

    }


    resize();
    start();

    // realm.js が設定の段落を組み立て終えてから探す
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(watchApostles, 0));
    } else {
        setTimeout(watchApostles, 0);
    }

})();
