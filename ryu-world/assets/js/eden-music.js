/* =========================================================
   龍の世界 / 悠久の楽園 ― 楽園の音楽（全ページ共通）
   =========================================================
   楽園の中の場所（門・龍の間・天使たち・生命の木・知恵の木・龍の書）を
   行き来しても、歓喜の歌が途切れずに続いて聞こえるようにする。

   ふだんは楽園の枠（world/eden/index.html）が曲を持ち続け、
   中の場所は枠に「流して」と頼むだけ（eden-frame.js / eden-shell.js）。
   枠の外で開かれたときのために、ページ単体でも流せるようにしてある。

   ・オン／オフの好みを覚えておく（localStorage）
   ・ページを離れるときに再生位置を覚え、次のページでその続きから流す
     （sessionStorage。離れていた時間の分だけ進めておく）
   ・ブラウザに自動再生を止められたら、ボタンで誘う

   使い方：
     const music = EdenMusic.init(audioEl, buttonEl);
     music.start();          // 好みが「オン」なら流し始める
   ========================================================= */

(function () {

    "use strict";

    const PREF_KEY = "ryu-eden-music";
    const POS_KEY = "ryu-eden-music-pos";

    function init(audio, button) {

        /*
         * 楽園の枠の中にいるときは、自分では曲を持たない。
         * ボタンも隠し（枠のボタンが同じ場所に出ている）、
         * 「流して」という合図だけを枠へ渡す。
         */
        const shell = window.EdenFrame && window.EdenFrame.shell;

        if (shell) {
            if (button) button.hidden = true;
            if (audio) audio.removeAttribute("src");
            return {
                play: () => shell.music.play(),
                start: () => shell.start(),
                get wanted() {
                    return shell.music.wanted;
                }
            };
        }

        let wanted = true;

        try {
            wanted = localStorage.getItem(PREF_KEY) !== "off";
        } catch (e) { /* 保存できない環境でも動かす */ }

        let fadeTimer = null;

        function fadeTo(target, ms) {

            clearInterval(fadeTimer);

            const start = audio.volume;
            const t0 = performance.now();

            fadeTimer = setInterval(() => {
                const k = Math.min(1, (performance.now() - t0) / ms);
                audio.volume = start + (target - start) * k;
                if (k >= 1) {
                    clearInterval(fadeTimer);
                    if (target === 0) audio.pause();
                }
            }, 50);

        }

        function setPressed(on) {
            button.setAttribute("aria-pressed", on ? "true" : "false");
        }

        /* 前のページで流れていた位置の続きを探す */
        function resumePosition() {

            try {
                const saved = JSON.parse(sessionStorage.getItem(POS_KEY) || "null");
                if (!saved || !isFinite(audio.duration) || audio.duration <= 0) return;
                const elapsed = (Date.now() - saved.at) / 1000;
                if (elapsed > 600) return;   // 長く離れていたら最初から
                audio.currentTime = (saved.t + elapsed) % audio.duration;
            } catch (e) { /* 何もしない */ }

        }

        function waitMetadata() {
            if (audio.readyState >= 1) return Promise.resolve();
            return new Promise((resolve) => {
                audio.addEventListener("loadedmetadata", resolve, { once: true });
                audio.preload = "metadata";
                audio.load();
            });
        }

        let resumed = false;

        async function play() {

            try {
                if (!resumed) {
                    resumed = true;
                    await waitMetadata();
                    resumePosition();
                }
                audio.volume = 0;
                await audio.play();
                fadeTo(0.8, 2500);
                setPressed(true);
                button.classList.remove("is-inviting");
                return true;
            } catch (e) {
                // ブラウザが自動再生を止めた：ボタンを押してもらう
                setPressed(false);
                button.classList.add("is-inviting");
                return false;
            }

        }

        button.addEventListener("click", () => {

            const on = button.getAttribute("aria-pressed") !== "true";

            wanted = on;

            try {
                localStorage.setItem(PREF_KEY, on ? "on" : "off");
            } catch (e) { /* 何もしない */ }

            if (on) {
                play();
            } else {
                setPressed(false);
                fadeTo(0, 800);
            }

        });

        // ページを離れるとき、いまの再生位置を覚えておく
        window.addEventListener("pagehide", () => {
            if (audio.paused) return;
            try {
                sessionStorage.setItem(POS_KEY, JSON.stringify({ t: audio.currentTime, at: Date.now() }));
            } catch (e) { /* 何もしない */ }
        });

        setPressed(false);

        return {
            play,
            start() {
                if (wanted) play();
            },
            get wanted() {
                return wanted;
            }
        };

    }

    window.EdenMusic = { init };

})();
