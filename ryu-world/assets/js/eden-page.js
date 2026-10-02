/* =========================================================
   龍の世界 / 悠久の楽園 ― ページの演出
   =========================================================
   ・楽園と龍（Scratch作品）を軽量プレイヤーで再生する
   ・歓喜の歌を流す（ブラウザに自動再生を止められたら、ボタンで誘う）
   ・資料を読み進めるほど、龍がこちらを見てくる
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const body = document.body;
    const canvas = document.getElementById("eden-canvas");
    const eyesBox = document.getElementById("dragon-eyes");
    const eyes = [...document.querySelectorAll("#dragon-eyes .eye")];
    const hero = document.getElementById("eden-hero");
    const lore = document.getElementById("eden-lore");
    const lastBlock = document.getElementById("lore-last");
    const music = document.getElementById("music");
    const musicBtn = document.getElementById("music-toggle");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ---------- 龍の眼の位置（ステージ座標）と、龍を形づくる層 ---------- */

    const EYE_POINTS = [{ x: -7.5, y: 66.5 }, { x: 6, y: 66.5 }];

    const DRAGON_LAYERS = [
        "スプライト3", "スプライト5", "スプライト6", "スプライト7", "スプライト9",
        "スプライト10", "スプライト11", "スプライト12", "スプライト13", "スプライト14",
        "スプライト15", "スプライト16", "スプライト17", "スプライト18", "スプライト21"
    ];


    /* ---------- 音楽 ---------- */

    const MUSIC_KEY = "ryu-eden-music";
    let musicWanted = true;

    try {
        musicWanted = localStorage.getItem(MUSIC_KEY) !== "off";
    } catch (e) { /* 保存できない環境でも動かす */ }

    let fadeTimer = null;

    function fadeTo(target, ms) {

        clearInterval(fadeTimer);

        const start = music.volume;
        const t0 = performance.now();

        fadeTimer = setInterval(() => {
            const k = Math.min(1, (performance.now() - t0) / ms);
            music.volume = start + (target - start) * k;
            if (k >= 1) {
                clearInterval(fadeTimer);
                if (target === 0) music.pause();
            }
        }, 50);

    }

    function setPressed(on) {
        musicBtn.setAttribute("aria-pressed", on ? "true" : "false");
    }

    async function playMusic() {

        try {
            music.volume = 0;
            await music.play();
            fadeTo(0.8, 2500);
            setPressed(true);
            musicBtn.classList.remove("is-inviting");
            return true;
        } catch (e) {
            // ブラウザが自動再生を止めた：ボタンを押してもらう
            setPressed(false);
            musicBtn.classList.add("is-inviting");
            return false;
        }

    }

    musicBtn.addEventListener("click", () => {

        const on = musicBtn.getAttribute("aria-pressed") !== "true";

        musicWanted = on;

        try {
            localStorage.setItem(MUSIC_KEY, on ? "on" : "off");
        } catch (e) { /* 何もしない */ }

        if (on) {
            playMusic();
        } else {
            setPressed(false);
            fadeTo(0, 800);
        }

    });

    setPressed(false);


    /* ---------- 楽園の再生 ---------- */

    const player = new EdenPlayer(canvas, EDEN_PROJECT, "../../assets/eden/");

    // 曲はページ側の <audio> で流す（フリーBGMの歓喜の歌）
    player.sounds["歓喜の歌"] = () => {
        if (musicWanted) playMusic();
        return () => false;   // 曲はループし続けるので、終わりを待ち続ける
    };
    player.sounds["ポップ"] = () => null;

    player.onBroadcast = (name) => {
        if (name === "来たらん") {
            setTimeout(() => body.classList.add("is-arrived"), 3500);
        }
    };

    player.extra.gazeTargets = new Set(DRAGON_LAYERS);

    function fit() {
        const r = canvas.getBoundingClientRect();
        player.resize(r.width, r.height, window.devicePixelRatio || 1);
    }

    try {
        await player.load();
    } catch (e) {
        // WebGLが使えない環境：資料だけは読めるようにする
        body.classList.add("is-ready", "is-arrived", "no-webgl");
        return;
    }

    fit();
    window.addEventListener("resize", fit);

    body.classList.add("is-ready");
    player.start();


    /* ---------- マウス・指の位置 ---------- */

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener("pointermove", (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        player.setMouseFromClient(e.clientX, e.clientY, canvas.getBoundingClientRect());
    }, { passive: true });


    /* ---------- 資料：一文ずつ浮かび上がる ---------- */

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("is-visible");
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(".lore-block p, .lore-block h2, .lore-quote")
        .forEach((el) => io.observe(el));

    document.documentElement.classList.add("has-reveal");


    /* ---------- 龍が見てくる ---------- */

    /*
     * 「気づき」(0〜1)：資料をどこまで読んだか、どれだけ留まっているかで
     * 少しずつ高まる。高まるほど龍の眼が浮かび、視線がカーソルを追い、
     * 龍の体がわずかにこちらへ寄ってくる。最後まで読むと、一度だけ見開く。
     */
    let readSeconds = 0;
    let awareness = 0;
    let flared = false;
    let last = performance.now();

    function tick(now) {

        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;

        const vh = window.innerHeight;
        const heroH = hero.offsetHeight;
        const y = window.scrollY;

        // 読んでいる位置（資料の始まり〜終わり）
        const loreTop = lore.offsetTop;
        const loreSpan = Math.max(1, lore.offsetHeight - vh * 0.6);
        const progress = Math.max(0, Math.min(1, (y + vh * 0.5 - loreTop) / loreSpan));

        if (y > heroH * 0.4 && document.visibilityState === "visible") {
            readSeconds += dt;
        }

        const target = body.classList.contains("is-arrived")
            ? Math.min(1, Math.max(progress * 1.05, readSeconds / 50))
            : 0;

        awareness += (target - awareness) * Math.min(1, dt * 1.5);

        // 資料を読むあいだは、絵を少し沈める
        document.documentElement.style.setProperty("--veil", Math.min(1, y / heroH).toFixed(3));
        eyesBox.style.setProperty("--awareness", (awareness * 0.9).toFixed(3));

        // 龍の視線：カーソルの方へ
        const mx = player.mouse.x / 240;
        const my = player.mouse.y / 180;

        player.extra.gaze.x = mx * 5 * awareness;
        player.extra.gaze.y = my * 3 * awareness;

        // 眼の位置（龍の層と同じだけ動かし、さらに瞳を少しカーソルへ寄せる）
        if (player.view) {

            const rect = canvas.getBoundingClientRect();
            const scale = rect.width / player.view.w;   // ステージ1単位あたりの画面px
            const follow = { x: player.mouse.x / 70, y: player.mouse.y / 70 };

            eyes.forEach((eye, i) => {

                const p = EYE_POINTS[i];
                const u = player.stageToUnit(
                    p.x + follow.x + player.extra.gaze.x + mx * 1.4 * awareness,
                    p.y + follow.y + player.extra.gaze.y + my * 1.0 * awareness
                );
                const size = Math.max(0.5, (scale * 5) / 26);

                eye.style.transform =
                    `translate(${(rect.left + u.x * rect.width).toFixed(1)}px, ` +
                    `${(rect.top + u.y * rect.height).toFixed(1)}px) scale(${size.toFixed(3)})`;

            });

        }

        // 最後まで読んだら、一度だけ強く見開く
        if (!flared && lastBlock.getBoundingClientRect().top < vh * 0.55) {

            flared = true;

            if (!reduceMotion) {
                eyesBox.classList.add("is-flare");
                const t0 = performance.now();
                const pulse = () => {
                    const k = (performance.now() - t0) / 2400;
                    player.extra.tone = k < 1 ? Math.sin(Math.PI * k) * 0.06 : 0;
                    if (k < 1) requestAnimationFrame(pulse);
                };
                requestAnimationFrame(pulse);
            }

        }

        requestAnimationFrame(tick);

    }

    requestAnimationFrame(tick);

});
