/* =========================================================
   龍の世界 / コンセントズ
   =========================================================
   3体のコンセントを、枠 → 黒い影 → 本体 の順に組み立てて見せる。
   キャラクターを増やす・説明を書くときは CONSENTS を書き換える。

   bg     : 枠（背景）の絵        assets/consents/
   image  : 本体の絵              assets/consents/
   height : 本体の元の高さ（Scratchのステージ単位。大きさの基準になる）
   theme  : ページの色（"hope" / "void" / "despair"）
   lines  : 説明文。1つの "" が1段落、段落の中の改行は「\n」
   ========================================================= */

const CONSENTS = [
    {
        id: "kibou",
        name: "希望のコンセント",
        en: "CONSENT OF HOPE",
        bg: "kibou-bg.webp",
        image: "kibou.webp",
        height: 351.75,
        lines: []
    },
    {
        id: "kuukyo",
        name: "空虚のコンセント",
        en: "CONSENT OF VOID",
        bg: "kuukyo-bg.webp",
        image: "kuukyo.webp",
        height: 389.12,
        lines: []
    },
    {
        id: "zetubou",
        name: "絶望のコンセント",
        en: "CONSENT OF DESPAIR",
        bg: "zetubou-bg.webp",
        image: "zetubou.webp",
        height: 337.0,
        lines: []
    }
];

document.addEventListener("DOMContentLoaded", () => {

    const IMG = "../../assets/consents/";
    const body = document.body;
    const stage = document.getElementById("consent-stage");
    const bg = stage.querySelector(".c-bg");
    const shadow = stage.querySelector(".c-shadow");
    const char = stage.querySelector(".c-char");
    const select = document.getElementById("consent-select");
    const info = document.getElementById("consent-info");

    // 先に絵を読み込んでおく（切り替えたときに待たせない）
    CONSENTS.forEach((c) => {
        [c.bg, c.image].forEach((f) => { const i = new Image(); i.src = IMG + f; });
    });


    /* ---------- 切り替えのボタン ---------- */

    const buttons = CONSENTS.map((c, i) => {

        const b = document.createElement("button");
        b.type = "button";
        b.className = "consent-btn";
        b.dataset.consent = c.id;
        b.setAttribute("aria-pressed", "false");
        b.innerHTML =
            `<span class="btn-thumb"><img src="${IMG}${c.image}" alt=""></span>` +
            `<span class="btn-name">${c.name}</span>`;
        b.addEventListener("click", () => show(i));
        select.appendChild(b);
        return b;

    });


    /* ---------- 組み立てる ---------- */

    let current = -1;

    function show(index) {

        if (index === current) return;
        current = index;

        const c = CONSENTS[index];

        body.dataset.consent = c.id;
        buttons.forEach((b, i) => b.setAttribute("aria-pressed", i === index ? "true" : "false"));

        // 本体の大きさ：元の高さに合わせ、ステージ（高さ360）からはみ出さないように
        const h = Math.min(95, (c.height * 0.94 / 360) * 100);
        stage.style.setProperty("--char-h", `${h.toFixed(2)}%`);

        bg.src = IMG + c.bg;
        shadow.src = IMG + c.image;
        char.src = IMG + c.image;
        char.alt = c.name;

        // 組み立ての演出をやり直す
        stage.classList.remove("is-assembling");
        void stage.offsetWidth;
        stage.classList.add("is-assembling");

        // 説明
        info.querySelector(".info-en").textContent = c.en;
        info.querySelector(".info-name").textContent = c.name;

        const text = info.querySelector(".info-text");
        text.textContent = "";
        const lines = c.lines.length ? c.lines : ["この記録は、まだ綴られていない。"];
        lines.forEach((para) => {
            const p = document.createElement("p");
            para.split("\n").forEach((line, i) => {
                if (i > 0) p.appendChild(document.createElement("br"));
                p.appendChild(document.createTextNode(line));
            });
            text.appendChild(p);
        });
        text.classList.toggle("is-empty", !c.lines.length);

        info.classList.remove("is-shown");
        void info.offsetWidth;
        info.classList.add("is-shown");

        if (location.hash !== `#${c.id}`) {
            history.replaceState(null, "", `#${c.id}`);
        }

    }

    // ←→ キーでも切り替えられる
    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") show((current + 1) % CONSENTS.length);
        if (e.key === "ArrowLeft") show((current + CONSENTS.length - 1) % CONSENTS.length);
    });

    const fromHash = CONSENTS.findIndex((c) => `#${c.id}` === location.hash);
    show(fromHash >= 0 ? fromHash : 0);

    requestAnimationFrame(() => body.classList.add("is-ready"));

});
