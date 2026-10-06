/* =========================================================
   龍の世界 / 悠久の楽園 ― 生命の木・知恵の木のページ
   =========================================================
   木の絵の上の球（8つ）に、光を順に灯す。
     生命の木（黒い球）：根元から梢へ、昏い紫の光がのぼっていく
     知恵の木（白い球）：梢から根元へ、白い光がくだっていく
   どの木かは <body data-tree="life|knowledge"> で決まる。
   ========================================================= */

/* 球の位置（絵の幅・高さに対する％）と半径（幅に対する％）。根元 → 梢の順 */
const TREE_SPHERES = {
    // 生命の木：黒い球の木
    life: [
        [55.54, 91.87, 6.03], [85.12, 83.46, 6.02], [37.39, 77.8, 6.03], [39.59, 59.34, 6.03],
        [47.1, 43.35, 6.02], [15.51, 38.34, 6.02], [58.82, 26.89, 6.02], [51.81, 9.71, 6.02]
    ],
    // 知恵の木：白い球の木
    knowledge: [
        [44.48, 91.7, 6.11], [15.16, 83.69, 6.11], [62.26, 77.94, 6.11], [59.23, 59.96, 6.1],
        [52.8, 43.61, 6.11], [84.39, 38.9, 6.11], [40.42, 27.26, 6.11], [48.73, 9.55, 6.11]
    ]
};

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const kind = body.dataset.tree;
    const figure = document.getElementById("tree-figure");


    /* ---------- 道しるべ・音楽 ---------- */

    document.querySelectorAll("[data-eden-gates]").forEach((el) => {
        renderEdenGates(el, { base: "../", exclude: kind });
    });

    const music = EdenMusic.init(
        document.getElementById("music"),
        document.getElementById("music-toggle")
    );

    music.start();


    /* ---------- 球に光を灯す ---------- */

    const spheres = TREE_SPHERES[kind] || [];
    const n = spheres.length;

    spheres.forEach(([x, y, r], i) => {

        const s = document.createElement("span");
        s.className = "sphere";
        s.style.setProperty("--x", `${x}%`);
        s.style.setProperty("--y", `${y}%`);
        s.style.setProperty("--r", `${r}%`);
        // 生命の木は根元から、知恵の木は梢から順に灯る
        s.style.setProperty("--order", kind === "knowledge" ? n - 1 - i : i);
        figure.appendChild(s);

    });

    figure.style.setProperty("--count", n);


    /* ---------- 一つずつ浮かび上がる ---------- */

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("is-visible");
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".lore-block p, .lore-block h2, .place-paths")
        .forEach((el) => io.observe(el));

    document.documentElement.classList.add("has-reveal");

    const img = figure.querySelector("img");
    const ready = () => {
        body.classList.add("is-ready");
        setTimeout(() => body.classList.add("is-arrived"), 400);
    };

    if (img.complete) ready();
    else img.addEventListener("load", ready, { once: true });

});
