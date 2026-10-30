/* =========================================================
   龍の世界 / ページの曲（<audio> を流す小さな仕組み）
   =========================================================
   ・調律の「響き」を静めているときは流さない（ryu-tuning.js に従う）
   ・ブラウザに自動再生を止められたら、次に画面へ触れたときに流し始める
   ・ボタンがあれば、オン／オフの好みを覚えておく（localStorage）
   ・タブを離れている間は止め、戻ったら続きから

   使い方：
     const music = RyuMusic.init({
         audio:  document.getElementById("music"),
         button: document.getElementById("music-toggle"),  // 無くてもよい
         key:    "ryu-consents-music",                     // 好みを覚える名前
         volume: 0.6,                                      // 流すときの音量（0〜1）
         fadeIn: 2500                                      // 立ち上がりの長さ（ミリ秒）
     });
     music.start();     // 流し始める（止められていれば、触れたときに）
     music.fadeOut(600) // そっと消す
   ========================================================= */

(function () {

    "use strict";

    function tuningSilenced() {
        if (window.RyuTuning) return window.RyuTuning.get("sound") === "off";
        try {
            return JSON.parse(localStorage.getItem("ryu-tuning") || "{}").sound === "off";
        } catch (e) {
            return false;
        }
    }

    function init(opt) {

        const audio = opt.audio;
        const button = opt.button || null;
        const volume = opt.volume ?? 0.8;
        const fadeIn = opt.fadeIn ?? 2500;

        let wanted = true;

        if (button && opt.key) {
            try {
                wanted = localStorage.getItem(opt.key) !== "off";
            } catch (e) { /* 保存できない環境でも動かす */ }
        }

        let started = false;      // start() が呼ばれたか
        let waiting = false;      // 自動再生を止められ、触れられるのを待っているか
        let fadeTimer = null;

        function fadeTo(target, ms) {
            clearInterval(fadeTimer);
            const from = audio.volume;
            const t0 = performance.now();
            fadeTimer = setInterval(() => {
                const k = Math.min(1, (performance.now() - t0) / ms);
                audio.volume = from + (target - from) * k;
                if (k >= 1) {
                    clearInterval(fadeTimer);
                    if (target === 0) audio.pause();
                }
            }, 50);
        }

        function setPressed(on) {
            if (button) button.setAttribute("aria-pressed", on ? "true" : "false");
        }

        async function play() {

            if (tuningSilenced() || !wanted) return false;

            try {
                if (audio.paused) audio.volume = 0;
                await audio.play();
                fadeTo(volume, fadeIn);
                setPressed(true);
                waiting = false;
                if (button) button.classList.remove("is-inviting");
                return true;
            } catch (e) {
                // 自動再生を止められた：次に触れたときに流す
                waiting = true;
                setPressed(false);
                if (button) button.classList.add("is-inviting");
                return false;
            }

        }

        function stop(ms = 800) {
            setPressed(false);
            fadeTo(0, ms);
        }

        // 触れたら、待っていた曲を流す（曲のボタンそのものは除く）
        const onGesture = (e) => {
            if (!waiting || !started) return;
            if (button && button.contains(e.target)) return;
            play();
        };
        ["pointerdown", "keydown", "touchend"].forEach((type) => {
            window.addEventListener(type, onGesture, { capture: true, passive: true });
        });

        if (button) {
            button.addEventListener("click", () => {
                const on = button.getAttribute("aria-pressed") !== "true";
                wanted = on;
                started = true;
                try {
                    if (opt.key) localStorage.setItem(opt.key, on ? "on" : "off");
                } catch (e) { /* 何もしない */ }
                if (on) play();
                else stop();
            });
            setPressed(false);
        }

        // 調律の「響き」に従う
        window.addEventListener("ryu-tuning", (e) => {
            if (e.detail.key !== "sound") return;
            if (e.detail.value === "off") stop();
            else if (started && wanted && audio.paused) play();
        });

        // タブを離れている間は止める
        let pausedByHide = false;
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                if (!audio.paused) {
                    pausedByHide = true;
                    clearInterval(fadeTimer);
                    audio.pause();
                }
            } else if (pausedByHide) {
                pausedByHide = false;
                if (wanted && !tuningSilenced()) play();
            }
        });

        return {
            start() {
                started = true;
                return play();
            },
            fadeOut(ms = 600) {
                started = false;
                waiting = false;
                fadeTo(0, ms);
            },
            get playing() {
                return !audio.paused;
            }
        };

    }

    window.RyuMusic = { init };

})();
