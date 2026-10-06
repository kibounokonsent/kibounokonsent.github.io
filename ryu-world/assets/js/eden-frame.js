/* =========================================================
   龍の世界 / 悠久の楽園 ― 楽園の枠の中で開く
   =========================================================
   楽園の中の場所（門・龍の間・天使たち・木・龍の書）は、
   world/eden/index.html（楽園の枠）の中に読み込まれて表示される。
   枠が音楽を持ち続けるので、場所を移っても曲が途切れない。

   このページが枠の外で直接開かれたときは、枠ごと開き直す。
   <script src=".../eden-frame.js" data-place="angels"> のように、
   <head> の中で、このページの場所の名前を添えて読み込む。
   ========================================================= */

(function () {

    "use strict";

    // 枠（EdenShell を持つ親ページ）の中にいるか
    let shell = null;

    try {
        if (window.parent !== window && window.parent.EdenShell) {
            shell = window.parent.EdenShell;
        }
    } catch (e) {
        shell = null;   // 別のサイトの中に埋め込まれている
    }

    window.EdenFrame = { shell };

    if (shell) {
        document.documentElement.classList.add("in-eden-shell");
        return;
    }

    // 枠の外：枠のページへ移る（場所は # で伝える）
    const place = document.currentScript && document.currentScript.dataset.place;

    if (place) {
        document.documentElement.style.visibility = "hidden";
        location.replace("../index.html" + (place === "gate" ? "" : "#" + place));
    }

})();
