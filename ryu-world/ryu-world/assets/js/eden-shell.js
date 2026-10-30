/* =========================================================
   龍の世界 / 悠久の楽園 ― 楽園の枠
   =========================================================
   ・音楽を持ち続け、中の場所から「流して」と頼まれたら流す
   ・中の枠に、# で指定された場所を開く
   ・中で場所を移ったら、# とページの題名を合わせる
     （再読み込みしても、同じ場所に戻れるように）
   ========================================================= */

(function () {

    "use strict";

    const PLACES = ["gate", "dragon", "angels", "life", "knowledge", "book"];

    const frame = document.getElementById("eden-frame");

    const music = EdenMusic.init(
        document.getElementById("music"),
        document.getElementById("music-toggle")
    );

    // 中の場所から使う窓口
    window.EdenShell = {
        music,
        start() {
            music.start();
        }
    };

    function placeFromHash() {
        const h = location.hash.replace("#", "");
        return PLACES.includes(h) ? h : "gate";
    }

    function open(place) {
        frame.src = `${place}/index.html`;
    }

    open(placeFromHash());

    // 中で場所を移ったら、# と題名を合わせる
    frame.addEventListener("load", () => {

        let doc;

        try {
            doc = frame.contentDocument;
        } catch (e) {
            return;
        }

        if (!doc) return;

        const m = doc.location.pathname.match(/\/([^/]+)\/index\.html$/);
        const place = m && PLACES.includes(m[1]) ? m[1] : null;

        if (place) {
            const hash = place === "gate" ? "" : `#${place}`;
            if (location.hash !== hash) {
                history.replaceState(null, "", location.pathname + location.search + hash);
            }
        }

        if (doc.title) document.title = doc.title;

        // 中の枠に操作が移るよう、読み込みのたびに焦点を渡す
        try {
            frame.contentWindow.focus();
        } catch (e) { /* 何もしない */ }

    });

    // # を書き換えられたら、その場所を開く
    window.addEventListener("hashchange", () => {
        const want = placeFromHash();
        if (!frame.src.endsWith(`/${want}/index.html`)) open(want);
    });

})();
