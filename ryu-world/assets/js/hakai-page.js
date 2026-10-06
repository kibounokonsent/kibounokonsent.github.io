/* =========================================================
   龍の世界 / 破壊之王の間 ― ページの演出
   =========================================================
   ・破壊之王の間（Scratch作品）を、悠久の楽園と同じ軽量プレイヤーで再生する
   ・夢想世界を流す（ブラウザに自動再生を止められたら、ボタンで誘う）
   ・冒頭の黒い幕が消えたら、世界の名を出す

   軽量化：
   ・背景（赤い月と城）と赤い靄は動かないので、一度だけ別の canvas に描き、
     毎フレームは破壊之王の体（翼・外套など）だけを描く
   ・黒い幕が消えるまでは、見た目を正確に保つため、すべてをまとめて描く
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const body = document.body;
    const canvas = document.getElementById("eden-canvas");
    const back = document.getElementById("hakai-back");
    const front = document.getElementById("hakai-front");
    const hero = document.getElementById("eden-hero");
    const music = document.getElementById("music");
    const musicBtn = document.getElementById("music-toggle");


    /* ---------- 音楽 ---------- */

    const MUSIC_KEY = "ryu-hakai-music";
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


    /* ---------- 破壊之王の間の再生 ---------- */

    const player = new EdenPlayer(canvas, HAKAI_PROJECT, "../../assets/hakai/", { alpha: true });

    // Scratch 側のスプライト名
    const HAZE = "\u3000";      // 赤い靄（いちばん上の、動かない層）
    const CURTAIN = "  ";        // 冒頭の黒い幕

    let layered = false;

    /* 動かない層を、それぞれの canvas に焼き付ける */
    function bake() {

        [back, front].forEach((c) => {
            c.width = canvas.width;
            c.height = canvas.height;
        });

        player.render((t) => t.isStage);
        back.getContext("2d").drawImage(canvas, 0, 0);

        player.render((t) => t.def.name === HAZE);
        front.getContext("2d").drawImage(canvas, 0, 0);

        player.render();

    }

    function enterLayered() {

        if (layered) return;

        layered = true;

        bake();

        player.skipStage = true;
        player.skipLayers = new Set([HAZE, CURTAIN]);

        body.classList.add("is-layered");

    }

    function fit() {
        const r = canvas.getBoundingClientRect();
        player.resize(r.width, r.height, window.devicePixelRatio || 1);
        if (layered) bake();
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

    if (musicWanted) {
        playMusic();
    }

    // 冒頭の幕は 1秒待ってから約3.3秒かけて消える。消え終わる頃に名を出す
    setTimeout(() => body.classList.add("is-arrived"), 4600);

    // 幕が消えきったら、動かない層を焼き付けて「動く層だけ描く」に切り替える
    const watchCurtain = setInterval(() => {
        const c = player.targets.find((t) => t.def.name === CURTAIN);
        if (!c || !c.visible || (c.effects.ghost || 0) >= 100) {
            clearInterval(watchCurtain);
            enterLayered();
        }
    }, 120);


    /* ---------- 資料：一文ずつ浮かび上がる ---------- */

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("is-visible");
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(
        ".lore-block p, .lore-block h2, .lore-block h3, .king-profile, .lore-quote"
    )
        .forEach((el) => io.observe(el));

    document.documentElement.classList.add("has-reveal");


    /* ---------- 読むあいだは、絵を少し沈める ---------- */

    function onScroll() {
        const heroH = hero.offsetHeight || window.innerHeight;
        document.documentElement.style.setProperty(
            "--veil",
            Math.min(1, window.scrollY / heroH).toFixed(3)
        );
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

});
