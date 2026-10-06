/* =========================================================
   龍の世界 / 悠久の楽園 ― 天使たちのページ
   =========================================================
   ・angels-data.js の天使を並べる
   ・空には、リリン達が絶えず生まれては消えていく
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const IMG = "../../../assets/eden/places/";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ---------- 道しるべ・音楽 ---------- */

    document.querySelectorAll("[data-eden-gates]").forEach((el) => {
        renderEdenGates(el, { base: "../", exclude: "angels" });
    });

    const music = EdenMusic.init(
        document.getElementById("music"),
        document.getElementById("music-toggle")
    );

    music.start();


    /* ---------- 天使を並べる ---------- */

    // 「\n」を改行にして、段落ごとに <p> を作る
    function paragraphs(lines, className) {
        return lines.map((text) => {
            const p = document.createElement("p");
            if (className) p.className = className;
            text.split("\n").forEach((line, i) => {
                if (i > 0) p.appendChild(document.createElement("br"));
                p.appendChild(document.createTextNode(line));
            });
            return p;
        });
    }

    const list = document.getElementById("angel-list");

    ANGELS.forEach((angel, index) => {

        const sec = document.createElement("section");
        sec.className = "angel";
        sec.style.setProperty("--i", index);

        const figure = document.createElement("figure");
        figure.className = "angel-figure";
        figure.innerHTML = `<img src="${IMG}${angel.image}" alt="${angel.name}" loading="lazy">`;

        const text = document.createElement("div");
        text.className = "angel-text";

        if (angel.en) {
            const en = document.createElement("p");
            en.className = "angel-en";
            en.textContent = angel.en;
            text.appendChild(en);
        }

        const h2 = document.createElement("h2");
        h2.textContent = angel.name;
        text.appendChild(h2);

        paragraphs(angel.lines).forEach((p) => text.appendChild(p));

        sec.append(figure, text);

        // 共にいる者たち（エカマータの兄弟たち＝リリン など）
        if (angel.kin) {

            const kin = document.createElement("div");
            kin.className = "angel-kin";

            const row = document.createElement("div");
            row.className = "kin-row";
            angel.kin.images.forEach((src, i) => {
                const img = document.createElement("img");
                img.src = IMG + src;
                img.alt = "";
                img.loading = "lazy";
                img.style.setProperty("--k", i);
                row.appendChild(img);
            });

            const kt = document.createElement("div");
            kt.className = "kin-text";
            kt.innerHTML =
                `<h3>${angel.kin.name}` +
                (angel.kin.sub ? `<span>${angel.kin.sub}</span>` : "") +
                "</h3>";
            paragraphs(angel.kin.lines).forEach((p) => kt.appendChild(p));

            kin.append(row, kt);
            sec.appendChild(kin);

        }

        list.appendChild(sec);

    });


    /* ---------- 一つずつ浮かび上がる ---------- */

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add("is-visible");
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".angel, .angel-kin, .angels-yet, .place-paths")
        .forEach((el) => io.observe(el));

    document.documentElement.classList.add("has-reveal");

    body.classList.add("is-ready");
    setTimeout(() => body.classList.add("is-arrived"), 300);


    /* ---------- 空のリリン達：毎日生まれ、毎日死んでいく ---------- */

    const sky = document.getElementById("lilin-sky");
    const LILIN = ["lilin-1.webp", "lilin-2.webp", "lilin-3.webp"];
    const MAX = window.innerWidth < 700 ? 7 : 12;
    let alive = 0;

    function birth() {

        if (document.hidden || alive >= MAX) return;

        const img = document.createElement("img");
        img.className = "lilin";
        img.src = IMG + LILIN[Math.floor(Math.random() * LILIN.length)];
        img.alt = "";

        const life = 9 + Math.random() * 8;                 // 生きている秒数
        img.style.left = `${Math.random() * 92}%`;
        img.style.top = `${10 + Math.random() * 75}%`;
        img.style.setProperty("--w", `${36 + Math.random() * 60}px`);
        img.style.setProperty("--life", `${life.toFixed(1)}s`);
        img.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
        img.style.setProperty("--dy", `${-30 - Math.random() * 90}px`);
        if (Math.random() < 0.5) img.style.setProperty("--flip", "-1");

        alive++;
        img.addEventListener("animationend", () => {
            img.remove();
            alive--;
        });

        sky.appendChild(img);

    }

    if (!reduceMotion) {
        for (let i = 0; i < 4; i++) setTimeout(birth, i * 500);
        setInterval(birth, 1400);
    }

});
