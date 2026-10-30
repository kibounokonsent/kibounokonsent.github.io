/* =========================================================
   龍の世界 / 創世ページの近道
   ---------------------------------------------------------
   創世の物語はとても長いので、先に世界を見たい人のために
   左下へ小さな道を置く。

   ・はじめて来た人 … 冒頭の言葉が現れ終わってから、そっと灯る
                       「眠りを越えて、世界へ」
   ・一度でも世界へ行った人 … すぐに灯る「再び、世界へ」
   ・第四章に入ったら消える（もうすぐ本物の入口があるため）

   リンク先は世界地図。押すと、本物の入口と同じように
   闇に溶けてから移る（body.leaving：style.css）。
   ========================================================= */

(function () {

    "use strict";

    const link = document.getElementById("genesis-skip");
    if (!link) return;

    const label = link.querySelector(".skip-label");
    const tuning = window.RyuTuning;
    const visits = tuning?.visits?.() || {};
    const returning = Boolean(visits.genesis);

    if (returning) {
        link.classList.add("is-returning");
        if (label) label.textContent = "再び、世界へ";
    }

    // 灯るまでの時間（はじめての人には、冒頭の言葉を先に読んでもらう）
    window.setTimeout(() => {
        link.classList.add("is-shown");
    }, returning ? 1200 : 8200);


    /* 第四章に入ったら消す・世界への入口まで来たら記録する */

    const chapterFour = document.getElementById("chapter-four");
    const entry = document.getElementById("world-entry");

    if ("IntersectionObserver" in window) {

        if (chapterFour) {
            new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    // 第四章が画面に入った／それより下にいる間は隠す
                    const past = e.isIntersecting || e.boundingClientRect.top < 0;
                    link.classList.toggle("is-away", past);
                });
            }).observe(chapterFour);
        }

        if (entry) {
            new IntersectionObserver((entries, obs) => {
                if (entries.some((e) => e.isIntersecting)) {
                    tuning?.markVisit?.("genesis");
                    obs.disconnect();
                }
            }, { threshold: 0.4 }).observe(entry);
        }

    }


    /* 押したら、闇に溶けてから世界地図へ */

    link.addEventListener("click", (event) => {

        if (
            event.button !== 0 ||
            event.metaKey || event.ctrlKey ||
            event.shiftKey || event.altKey
        ) {
            return;
        }

        event.preventDefault();

        const reduce =
            document.documentElement.dataset.motion === "off" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        document.body.classList.add("leaving");

        window.setTimeout(() => {
            window.location.href = link.getAttribute("href");
        }, reduce ? 150 : 1300);

    });

    window.addEventListener("pageshow", () => {
        document.body.classList.remove("leaving");
    });

})();
