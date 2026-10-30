/* =========================================================
   龍の世界 / 各世界のページ（フロンズ・その他の世界・魂界）
   =========================================================
   中身はすべて works.js（WORKS / REALMS）から組み立てる。
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const realmKey = document.body.dataset.realm;
    const realm = REALMS[realmKey];

    if (!realm) {
        return;
    }

    const works = WORKS.filter((w) => w.world === realmKey);

    const KANJI = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

    const eraName = (n) => `第${KANJI[n] || n}の時代`;


    /* ---------- 見出し ---------- */

    document.getElementById("realm-title-en").textContent = realm.title;
    document.getElementById("realm-name").textContent = realm.name;
    document.getElementById("realm-lead").textContent = realm.lead;

    document.body.classList.add(`realm-${realmKey}`, `layout-${realm.layout}`);


    /* ---------- 設定（works.js の lore から） ---------- */

    const loreBox = document.createElement("section");
    loreBox.id = "realm-lore";
    loreBox.setAttribute("aria-label", "設定");

    const lore = realm.lore || [];

    lore.forEach((block) => {

        const sec = document.createElement("section");
        sec.className = "lore-block";

        const h = document.createElement("h2");
        h.className = "reveal";
        h.textContent = block.heading;
        sec.appendChild(h);

        (block.text || []).forEach((para) => {
            const p = document.createElement("p");
            p.className = "reveal";
            para.split("\n").forEach((line, i) => {
                if (i > 0) p.appendChild(document.createElement("br"));
                p.appendChild(document.createTextNode(line));
            });
            sec.appendChild(p);
        });

        loreBox.appendChild(sec);

    });

    if (!lore.length && realm.layout === "none") {
        const p = document.createElement("p");
        p.className = "lore-empty reveal";
        p.textContent = "この世界の設定は準備中です。";
        loreBox.appendChild(p);
    }

    const worksSection = document.getElementById("realm-works");
    worksSection.parentNode.insertBefore(loreBox, worksSection);

    // 設定と作品の両方がある世界は、作品の前に小さな見出しを置く
    if (realm.layout !== "none" && lore.length) {
        const h = document.createElement("h2");
        h.className = "works-heading reveal";
        h.textContent = "作品";
        worksSection.parentNode.insertBefore(h, worksSection);
    }

    if (realm.layout === "none") {
        worksSection.hidden = true;
    }


    /* ---------- 作品の印（世界ごとに形を変える） ---------- */

    function markSVG() {

        if (realmKey === "soul") {
            return '<span class="mark-wisp" aria-hidden="true"></span>';
        }

        return (
            '<svg class="mark-crystal" viewBox="-14 -20 28 40" aria-hidden="true">' +
            '<polygon class="f1" points="0,-19 -13,0 0,3" />' +
            '<polygon class="f2" points="0,-19 13,0 0,3" />' +
            '<polygon class="f3" points="-13,0 0,3 0,19" />' +
            '<polygon class="f4" points="13,0 0,3 0,19" />' +
            "</svg>"
        );

    }

    function workButton(work, index) {

        const btn = document.createElement("button");

        btn.type = "button";
        btn.className = "work";
        btn.dataset.index = String(index);

        if (work.url) {
            btn.classList.add("is-published");
        }

        btn.innerHTML =
            `<span class="work-mark">${markSVG()}</span>` +
            `<span class="work-title">${work.title}` +
            `${work.tentative ? '<span class="work-tentative">仮</span>' : ""}` +
            `</span>`;

        btn.addEventListener("click", () => toggleWork(index, btn));

        return btn;

    }


    /* ---------- 並べ方 ---------- */

    const container = document.getElementById("realm-works");

    if (realm.layout === "timeline") {

        /*
         * 時の流れ：上から下へ一本の流れが通り、
         * 同じ時代の作品はその流れから横に枝分かれして並ぶ。
         */
        const river = document.createElement("div");
        river.className = "time-river";
        river.setAttribute("aria-hidden", "true");
        container.appendChild(river);

        const eras = [...new Set(works.map((w) => w.era))].sort((a, b) => a - b);

        eras.forEach((era) => {

            const row = document.createElement("div");
            row.className = "era reveal";

            const inEra = works
                .map((w, i) => ({ w, i }))
                .filter(({ w }) => w.era === era);

            row.style.setProperty("--count", String(inEra.length));

            row.innerHTML =
                `<div class="era-mark"><span class="era-num">${KANJI[era] || era}</span>` +
                `<span class="era-name">${eraName(era)}</span></div>`;

            const list = document.createElement("div");
            list.className = `era-works${inEra.length > 1 ? " is-branch" : ""}`;

            inEra.forEach(({ w, i }) => list.appendChild(workButton(w, i)));

            row.appendChild(list);
            container.appendChild(row);

        });

        const end = document.createElement("p");
        end.className = "time-end reveal";
        end.textContent = "そして、時は流れ続ける。";
        container.appendChild(end);

    } else {

        /* 散らばる世界：それぞれが独立した、ひとつの世界として浮かぶ */
        const field = document.createElement("div");
        field.className = "scatter";

        works.forEach((w, i) => {

            const btn = workButton(w, i);
            btn.classList.add("reveal");
            btn.style.setProperty("--float", `${(i * 1.3) % 4}s`);
            field.appendChild(btn);

        });

        container.appendChild(field);

    }


    /* ---------- 読む位置に来たものから静かに現れる ---------- */

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
    document.documentElement.classList.add("has-reveal");


    /* ---------- 作品パネル ---------- */

    const panel = document.getElementById("work-panel");
    const eyebrow = document.getElementById("work-eyebrow");
    const nameEl = document.getElementById("work-name");
    const summaryEl = document.getElementById("work-summary");
    const link = document.getElementById("work-link");
    const soon = document.getElementById("work-soon");

    let openIndex = null;
    let openButton = null;

    function closeWork() {

        openIndex = null;
        openButton?.classList.remove("is-selected");
        openButton = null;

        document.body.classList.remove("has-selection");
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");

    }

    function toggleWork(index, btn) {

        if (openIndex === index) {
            closeWork();
            return;
        }

        const w = works[index];

        openButton?.classList.remove("is-selected");
        openIndex = index;
        openButton = btn;
        btn.classList.add("is-selected");

        document.body.classList.add("has-selection");

        eyebrow.textContent =
            [realm.name, w.era ? eraName(w.era) : null, w.genre || null]
                .filter(Boolean).join("・");
        nameEl.textContent = w.title + (w.tentative ? "（仮）" : "");
        // 段落（\n\n）と改行（\n）を反映して表示する
        summaryEl.textContent = "";
        (w.summary || "あらすじは準備中です。").split("\n\n").forEach((para) => {
            const p = document.createElement("p");
            para.split("\n").forEach((line, i) => {
                if (i > 0) p.appendChild(document.createElement("br"));
                p.appendChild(document.createTextNode(line));
            });
            summaryEl.appendChild(p);
        });
        summaryEl.classList.toggle("is-empty", !w.summary);

        if (w.url) {
            link.href = w.url;
            // 作品ではなく「世界」へ入るものは、ボタンの言葉を変えられる
            link.textContent = w.linkLabel || "作品を見る";
            // 外部の作品サイトは別のタブで開き、地図は残しておく
            const external = /^https?:/.test(w.url);
            link.target = external ? "_blank" : "";
            link.rel = external ? "noopener" : "";
            link.hidden = false;
            soon.hidden = true;
        } else {
            link.hidden = true;
            soon.hidden = false;
        }

        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");

    }

    document.getElementById("work-close").addEventListener("click", closeWork);

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeWork();
        }
    });

});
