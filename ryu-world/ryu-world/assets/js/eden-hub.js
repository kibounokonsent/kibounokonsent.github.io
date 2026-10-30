/* =========================================================
   龍の世界 / 悠久の楽園 ― 門のページの演出
   =========================================================
   ・龍のいない楽園の景色（Scratch作品）を軽量プレイヤーで再生する
   ・歓喜の歌を流す（楽園の全ページで続けて聞こえる：eden-music.js）
   ・龍の間・天使たち・生命の木・知恵の木への道しるべを出す
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const body = document.body;
    const canvas = document.getElementById("eden-canvas");
    const hero = document.getElementById("eden-hero");


    /* ---------- 道しるべ ---------- */

    document.querySelectorAll("[data-eden-gates]").forEach((el) => {
        renderEdenGates(el, { base: "../" });
    });


    /* ---------- 音楽 ---------- */

    const music = EdenMusic.init(
        document.getElementById("music"),
        document.getElementById("music-toggle")
    );


    /* ---------- 楽園の景色の再生 ---------- */

    const assetBase = body.dataset.assets || "../../assets/eden/";
    const player = new EdenPlayer(canvas, EDEN_HUB_PROJECT, assetBase);

    /*
     * Scratch 側では「ポップ」という名前の音が、実は長い歓喜の歌になっている。
     * 曲はページ側の <audio> で流すので、鳴らす合図だけを受け取る。
     */
    player.sounds["ポップ"] = () => {
        music.start();
        return () => false;   // 曲はループし続けるので、終わりを待ち続ける
    };

    player.onBroadcast = (name) => {
        if (name === "来たらん") {
            setTimeout(() => body.classList.add("is-arrived"), 3500);
        }
    };

    function fit() {
        const r = canvas.getBoundingClientRect();
        player.resize(r.width, r.height, window.devicePixelRatio || 1);
    }

    function onScroll() {
        const heroH = hero.offsetHeight || window.innerHeight;
        document.documentElement.style.setProperty(
            "--veil",
            Math.min(1, window.scrollY / heroH).toFixed(3)
        );
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();


    /* ---------- 資料：一文ずつ浮かび上がる ---------- */

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("is-visible");
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(".lore-block p, .lore-block h2, .path-gates")
        .forEach((el) => io.observe(el));

    document.documentElement.classList.add("has-reveal");


    try {
        await player.load();
    } catch (e) {
        // WebGLが使えない環境：資料と道しるべだけは使えるようにする
        body.classList.add("is-ready", "is-arrived", "no-webgl");
        return;
    }

    fit();
    window.addEventListener("resize", fit);

    body.classList.add("is-ready");
    player.start();


    /* ---------- マウス・指の位置（景色がわずかに追いかけてくる） ---------- */

    window.addEventListener("pointermove", (e) => {
        player.setMouseFromClient(e.clientX, e.clientY, canvas.getBoundingClientRect());
    }, { passive: true });

});
