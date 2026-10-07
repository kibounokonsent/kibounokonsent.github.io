/* ==========================================================
   タップ音 / 消音ボタン
   ----------------------------------------------------------
   ・音ファイルは使わず、ブラウザ内で合成しています（Web Audio API）
   ・☰メニューの「SOUND」でON/OFF。設定は次回以降も保存されます
   ・リンク・ボタン・画像などをタップすると音が鳴ります
========================================================== */

(function () {

    const STORAGE_KEY = "portfolio-sound-muted";

    let ctx = null;
    let muted = false;

    try {
        muted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) { /* 保存できない環境では毎回ONで始める */ }


    function getContext() {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    // 短い電子音を1つ鳴らす（フィルター付き）
    //   freq: 開始周波数 / slideTo: 終了周波数 / filter: ローパスの周波数
    function tone(freq, start, dur, type, vol, slideTo, filter) {
        const c = getContext();
        if (!c) return;

        const t0 = c.currentTime + start;
        const osc = c.createOscillator();
        const gain = c.createGain();
        const lp = c.createBiquadFilter();

        osc.type = type || "sine";
        osc.frequency.setValueAtTime(freq, t0);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);

        lp.type = "lowpass";
        lp.frequency.setValueAtTime(filter || 6000, t0);
        if (filter) lp.frequency.exponentialRampToValueAtTime(Math.max(filter / 4, 200), t0 + dur);
        lp.Q.value = 6;

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        osc.connect(lp).connect(gain).connect(c.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    // SF風のサウンド
    const SOUNDS = {
        // カーソルを合わせたとき：ごく軽い電子音
        hover: () => {
            tone(2600, 0, 0.04, "sine", 0.022, 3400);
        },
        // 通常タップ：短い電子ピッ
        tap:   () => {
            tone(1400, 0, 0.07, "square", 0.05, 900, 5000);
            tone(2800, 0.01, 0.05, "sine", 0.04, 2000);
        },
        // ナビ：上昇する2音のコンソール音
        nav:   () => {
            tone(660, 0, 0.07, "square", 0.05, 700, 4000);
            tone(990, 0.07, 0.09, "square", 0.05, 1320, 5000);
            tone(1980, 0.08, 0.08, "sine", 0.03);
        },
        // 画像拡大：スキャンが立ち上がるスイープ
        zoom:  () => {
            tone(220, 0, 0.28, "sawtooth", 0.05, 1600, 3000);
            tone(880, 0.12, 0.16, "sine", 0.05, 1760);
        },
        // 閉じる：下降するパワーダウン
        close: () => {
            tone(1200, 0, 0.2, "sawtooth", 0.045, 180, 3500);
        },
        // サウンドON：起動音（3連の上昇アルペジオ）
        on:    () => {
            tone(523, 0, 0.07, "square", 0.05, 0, 4500);
            tone(784, 0.07, 0.07, "square", 0.05, 0, 4500);
            tone(1175, 0.14, 0.14, "square", 0.05, 1568, 5500);
            tone(2349, 0.15, 0.1, "sine", 0.03);
        },
    };

    function play(name) {
        if (muted) return;
        try { (SOUNDS[name] || SOUNDS.tap)(); } catch (e) { /* 音が出せなくても動作は止めない */ }
    }



    /* ---------- タップの検出 ---------- */

    document.addEventListener("pointerdown", (event) => {

        const target = event.target.closest(
            "a, button, .zoom-image, .art-card img, [role='button']"
        );
        if (!target || target.closest("[data-silent]")) return;

        if (target.closest("nav")) {
            play("nav");
        } else if (target.matches(".zoom-image, .art-card img")) {
            play("zoom");
        } else if (target.id === "modal-close") {
            play("close");
        } else {
            play("tap");
        }

    }, true);

    /* ---------- カーソルを合わせたときの軽い音（マウス操作のみ） ---------- */

    const HOVER_TARGETS = "a, button, .zoom-image, .art-card img, [role='button']";
    let lastHover = null;
    let lastHoverTime = 0;

    document.addEventListener("pointerover", (event) => {

        // タッチ操作では鳴らさない（タップ音と二重になるため）
        if (event.pointerType !== "mouse") return;

        const target = event.target.closest(HOVER_TARGETS);
        if (!target) { lastHover = null; return; }
        if (target === lastHover) return;

        lastHover = target;

        // 連続して鳴りすぎないように間隔をあける
        const now = performance.now();
        if (now - lastHoverTime < 70) return;
        lastHoverTime = now;

        play("hover");

    }, true);

    // モーダルの背景タップ・Escでも閉じる音
    document.addEventListener("click", (event) => {
        const modal = document.getElementById("image-modal");
        if (modal && event.target === modal) play("close");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") play("close");
    });


    /* ---------- 消音の切り替え ----------
       ボタン本体は partials.js の設定パネル（☰メニュー）にある。
       ここでは状態の保存と、ONにしたときの起動音だけを担当する。
    ------------------------------------------------------------ */

    function setMuted(value) {
        muted = !!value;
        try { localStorage.setItem(STORAGE_KEY, muted ? "1" : "0"); } catch (e) {}
        if (!muted) play("on");
    }

    function isMuted() {
        return muted;
    }

    window.portfolioSound = { play, setMuted, isMuted };

})();
