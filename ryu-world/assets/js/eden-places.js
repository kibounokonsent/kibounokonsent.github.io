/* =========================================================
   龍の世界 / 悠久の楽園 ― 楽園の中の場所
   =========================================================
   楽園の門（world/eden/gate/）から分かれていく場所の一覧。
   場所を増やすときは、ここに1行足して、world/eden/<id>/ にページを置き、
   eden-shell.js の PLACES にも id を足す。

   id    : フォルダ名（world/eden/<id>/index.html）
   name  : 場所の名前
   en    : 英字の添え名
   glyph : 印の形（dragon / angel / life / knowledge）
   ========================================================= */

const EDEN_PLACES = [
    { id: "dragon",    name: "龍の間",   en: "THE SLEEPING DRAGON", glyph: "dragon" },
    { id: "angels",    name: "天使たち", en: "THE ANGELS",          glyph: "angel" },
    { id: "life",      name: "生命の木", en: "TREE OF LIFE",        glyph: "life" },
    { id: "knowledge", name: "知恵の木", en: "TREE OF KNOWLEDGE",   glyph: "knowledge" },
    { id: "book",      name: "龍の書",   en: "THE BOOK OF RYŪ",     glyph: "book" }
];


/*
 * 場所への道しるべを描く。
 *   container : 描き込む要素
 *   options.base    : 場所のフォルダへの相対パス（どのページからも "../"）
 *   options.exclude : 今いる場所の id（その場所は描かない）
 */
function renderEdenGates(container, options = {}) {

    const base = options.base || "../";

    const GLYPHS = {
        // 龍：光と闇が混じる結晶
        dragon:
            '<svg viewBox="-16 -20 32 40" aria-hidden="true">' +
            '<polygon points="0,-18 -12,0 0,3" fill="#fbfbf8"/>' +
            '<polygon points="0,-18 12,0 0,3" fill="#151517"/>' +
            '<polygon points="-12,0 0,3 0,18" fill="#151517"/>' +
            '<polygon points="12,0 0,3 0,18" fill="#e9e7e1"/>' +
            '<polygon points="0,-18 12,0 0,18 -12,0" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>' +
            "</svg>",
        // 天使：眼と、ひと組の翼
        angel:
            '<svg viewBox="-22 -14 44 28" aria-hidden="true">' +
            '<path d="M-5,-1 C-12,-12 -20,-10 -21,-4 C-16,-6 -12,-3 -9,1 C-14,0 -17,3 -17,6 C-12,3 -8,4 -5,4 Z" fill="#f4e7b0" stroke="#d9c36a" stroke-width="0.8"/>' +
            '<path d="M5,-1 C12,-12 20,-10 21,-4 C16,-6 12,-3 9,1 C14,0 17,3 17,6 C12,3 8,4 5,4 Z" fill="#f4e7b0" stroke="#d9c36a" stroke-width="0.8"/>' +
            '<circle r="5.5" fill="#fff" stroke="#d9c36a" stroke-width="0.8"/>' +
            '<circle r="3.2" fill="#3c8fe6"/><circle cx="-1" cy="-1" r="1" fill="#fff"/>' +
            "</svg>",
        // 生命の木：黒い球
        life:
            '<svg viewBox="-16 -16 32 32" aria-hidden="true">' +
            '<circle r="13" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-dasharray="3 2"/>' +
            '<circle r="8.5" fill="#0d0d10" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>' +
            "</svg>",
        // 龍の書：羽根ペン（hanepen.svg）
        book:
            '<svg viewBox="0 0 185.23 209.5" aria-hidden="true">' +
            '<g transform="translate(-161.71708,-68.81134)" fill="#f4f2ec">' +
            '<path d="M289.16006,107.88304c0,0 -13.09983,14.41427 -62.91184,77.24525c-26.9198,33.95561 -42.4894,76.41708 -42.4894,76.41708c0,0 -13.96968,10.62404 -17.84635,13.5735c-0.86664,0.65943 12.5441,-12.2786 46.10767,-17.33581c5.45164,-0.82148 21.78985,0.98584 35.0425,0.80626c17.13101,-0.23219 40.52714,-4.96747 40.29959,-4.79431c-0.87096,0.66273 -21.19649,7.16099 -38.79392,8.92694c-14.25414,1.43033 -24.32035,-2.1684 -39.76831,0.72506c-26.31746,4.9295 -47.08292,14.86831 -47.08292,14.86831c0,0 30.45364,-57.99521 56.49486,-94.2516c36.94616,-51.43891 70.94812,-76.18084 70.94812,-76.18084z"/>' +
            '<path d="M182.22641,239.6207l-5.58214,-23.75094c0,0 6.28951,13.46616 6.67344,10.43026c2.38021,-18.82085 10.66658,-55.05668 40.79035,-90.7027c49.55531,-57.46505 122.84152,-66.78598 122.84152,-66.78598c0,0 -24.50509,27.17481 -33.37849,39.85756c-1.51829,2.17 -21.95113,18.3131 -21.95113,18.3131c0,0 13.07581,-5.47405 12.78432,-4.89134c-1.15406,2.30627 -19.54252,16.66404 -19.54252,16.66404c0,0 16.19213,-7.15964 15.50643,-4.98473c-0.70722,2.2431 -1.55972,5.37363 -2.2035,7.61537c-0.45956,1.60016 -20.66698,13.1345 -20.66698,13.1345c0,0 19.99437,-7.16995 18.93968,-4.46333c-2.05793,5.28153 -5.14298,12.04675 -8.83,13.96613c-30.17138,15.7067 -62.32737,46.63732 -79.99525,65.02951c-3.14627,3.27528 23.81216,-9.98601 23.81216,-9.98601c0,0 -17.30501,11.43876 -24.15913,15.96935c-2.6524,1.75335 13.4555,0.3374 13.4555,0.3374l-26.71476,8.42697c0,0 17.33681,-36.6502 34.32414,-60.17664c1.21633,-1.68457 26.78684,-13.08646 26.78684,-13.08646c0,0 -21.94378,6.96205 -20.60854,5.55796c30.90119,-32.49432 64.72271,-78.57932 64.72271,-78.57932c0,0 -29.04735,18.04884 -71.79312,70.01118c-18.78523,22.83565 -45.21139,72.0939 -45.21139,72.0939z"/>' +
            "</g></svg>",
        // 知恵の木：白い球
        knowledge:
            '<svg viewBox="-16 -16 32 32" aria-hidden="true">' +
            '<circle r="13" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-dasharray="3 2"/>' +
            '<circle r="8.5" fill="#fbfbf8"/>' +
            "</svg>"
    };

    container.innerHTML = "";

    EDEN_PLACES
        .filter((p) => p.id !== options.exclude)
        .forEach((p) => {

            const a = document.createElement("a");

            a.className = "eden-gate";
            a.href = `${base}${p.id}/index.html`;
            a.dataset.place = p.id;
            a.innerHTML =
                `<span class="gate-glyph">${GLYPHS[p.glyph] || ""}</span>` +
                `<span class="gate-name">${p.name}</span>` +
                `<span class="gate-en">${p.en}</span>`;

            container.appendChild(a);

        });

}
