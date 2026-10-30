/* =========================================================
   龍の世界 / 悠久の楽園 ― 龍の書のページ
   =========================================================
   ・本文を一段落ずつ浮かび上がらせる
   ・目次：いま読んでいる章を光らせる
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;


    /* ---------- 道しるべ・音楽 ---------- */

    document.querySelectorAll("[data-eden-gates]").forEach((el) => {
        renderEdenGates(el, { base: "../", exclude: "book" });
    });

    const music = EdenMusic.init(
        document.getElementById("music"),
        document.getElementById("music-toggle")
    );

    music.start();


    /* ---------- 一段落ずつ浮かび上がる ---------- */

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("is-visible");
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });

    document.querySelectorAll(
        ".book-opening, .chapter-head, .chapter-body p, .place-paths"
    ).forEach((el) => io.observe(el));

    document.documentElement.classList.add("has-reveal");


    /* ---------- 目次：読んでいる章を光らせる ---------- */

    const links = new Map(
        [...document.querySelectorAll(".book-toc a")].map((a) => [a.hash.slice(1), a])
    );

    const chapterIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            links.forEach((a) => a.classList.remove("is-current"));
            links.get(en.target.id)?.classList.add("is-current");
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll(".book-chapter").forEach((s) => chapterIO.observe(s));

    // 目次から飛ぶとき、なめらかに（枠の中でも # を書き換えずに動く）
    links.forEach((a, id) => {
        a.addEventListener("click", (e) => {
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    body.classList.add("is-ready");
    setTimeout(() => body.classList.add("is-arrived"), 300);

});
