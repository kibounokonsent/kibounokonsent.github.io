/* =========================================================
   龍の世界 / 世界地図（立体）
   ========================================================= */

/*
 * ------------------------------------------------------
 * 世界データ
 * ------------------------------------------------------
 *
 * ここに書くのは「地図で見せる分」だけ。
 * 詳しい設定・年表・作品情報は各世界のページ側に置く。
 * ------------------------------------------------------
 */

const WORLD_DATA = {

    eden: {
        title: "ETERNAL EDEN",
        name: "悠久の楽園",
        description: "龍が眠る、すべての中心にして、すべての外側。時は流れず、ただ在るのみ。魂あるものは皆、最後にはここへ還る。",
        url: "eden/"
    },

    fronz: {
        title: "FRONZ WORLD",
        name: "フロンズワールド",
        description: "四つの流れが生み出した無数の世界のうち、大いなる世界として語られる一つ。龍の世界における、主な物語の舞台。",
        url: "fronz/"
    },

    misseo: {
        title: "MISSEO WORLD",
        name: "ミスセオワールド",
        description: "フロンズと並び、大いなる世界として語られるもう一つの世界。IFやクロスオーバーなど、別の物語が存在する。",
        url: "misseo/"
    },

    other: {
        title: "OTHER WORLDS",
        name: "その他の世界",
        description: "流れはやがて無数の世界を生み出した。フロンズ・ミスセオとは異なる、独立した物語の数々。",
        url: "other/"
    },

    soul: {
        title: "SOUL REALM",
        name: "魂界",
        description: "死せる者の魂が行き着く、無数の魂の世界。迷える魂も、傷ついた魂も、やがてここから楽園へ還っていく。",
        url: "soul/"
    },

    alias: {
        title: "ALIAS WORLD",
        name: "エイリアスワールド",
        description: "四つの流れから零れ落ちた深淵。忘れられた願い、失われた記憶、叶わなかった創造が沈み、積み重なって、すべての世界の礎となった。そこには秩序は無い。されど世界を支え、守るものはそこに在る。縁には十二使徒が立つ。",
        url: "alias/"
    },

    // ※説明文は仮。設定が固まったら差し替える
    abyss: {
        title: "ABYSS OF THE MOMENT",
        name: "刹那の奈落",
        description: "エイリアスのさらに底。すべての下に口を開ける、深い奈落。",
        url: "abyss/"
    }

};


/*
 * ------------------------------------------------------
 * 地図の寸法（px。z は上が正）
 * ------------------------------------------------------
 */

const LAYOUT = {
    edenZ: 320,
    fronzZ: 150,
    misseoZ: 0,
    aliasZ: -150,       // エイリアス（大地）の表面
    aliasRadius: 470,
    aliasThickness: 26,
    abyssZ: -330
};

/* 四つの川（色は創世ページと同じ）。角度は画面上の方向 */
const RIVERS = [
    { key: "life", name: "ラプラタ", color: "#c9a24a", angle: -135 },
    { key: "creation", name: "ドナウ", color: "#9a6fc9", angle: -45 },
    { key: "knowledge", name: "ナイル", color: "#5f8fc9", angle: 135 },
    { key: "soul", name: "ガンジス", color: "#4fae9d", angle: 45 }
];

/* 螺旋には、川の色の彩度を落として使う */
/* その他の世界（角度°・中心からの距離・高さ） */
const OTHER_WORLDS = [
    { a: 200, r: 250, z: 150 },
    { a: 335, r: 265, z: 132 },
    { a: 20, r: 230, z: 75 },
    { a: 110, r: 285, z: 95 },
    { a: 160, r: 215, z: 30 },
    { a: 250, r: 300, z: 20 },
    { a: 300, r: 225, z: -12 },
    { a: 60, r: 310, z: -5 }
];

const HELIX_COLORS = ["#b3a27c", "#7f97b5", "#9787ad", "#7aa39a"];


document.addEventListener("DOMContentLoaded", () => {

    const page = document.getElementById("world-page");
    const stage = document.getElementById("world-stage");
    const space = document.getElementById("world-space");
    const hint = document.getElementById("world-hint");

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /*
     * ======================================================
     * 3Dの部品
     * ======================================================
     */

    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const len = (a) => Math.hypot(a[0], a[1], a[2]);
    const norm = (a) => mul(a, 1 / (len(a) || 1));
    const cross = (a, b) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];

    // 光は「斜め上・手前」から
    const LIGHT = norm([-0.35, 0.45, 0.82]);

    function el(tag, className, parent) {

        const e = document.createElement(tag);

        if (className) {
            e.className = className;
        }

        if (parent) {
            parent.appendChild(e);
        }

        return e;

    }

    /* 要素（幅W×高さH）を、P0を起点に u（横）・v（縦）方向へ貼る */
    function placePlane(e, P0, u, v, W, H) {

        const n = norm(cross(u, v));
        const f = (x) => +x.toFixed(5);

        e.style.width = `${W}px`;
        e.style.height = `${H}px`;
        e.style.transform =
            `matrix3d(${f(u[0] / W)},${f(u[1] / W)},${f(u[2] / W)},0,` +
            `${f(v[0] / H)},${f(v[1] / H)},${f(v[2] / H)},0,` +
            `${f(n[0])},${f(n[1])},${f(n[2])},0,` +
            `${f(P0[0])},${f(P0[1])},${f(P0[2])},1)`;

        return e;

    }

    function quad(parent, className, P0, u, v) {

        return placePlane(
            el("div", `quad lf ${className}`, parent),
            P0, u, v, len(u), len(v)
        );

    }

    /* 三角形の面。法線から明るさを決める（簡易な陰影） */
    function tri(parent, P0, P1, P2, center, look) {

        const u = sub(P1, P0);
        const v = sub(P2, P0);
        const W = len(u);
        const H = len(v);

        let n = norm(cross(u, v));
        const c = mul(add(add(P0, P1), P2), 1 / 3);

        if (dot(n, sub(c, center)) < 0) {
            n = mul(n, -1);
        }

        const lit = look.ambient + (1 - look.ambient) * Math.max(0, dot(n, LIGHT));
        const [r, g, b] = look.color;
        const fill =
            `rgba(${Math.round(r * lit)},${Math.round(g * lit)},` +
            `${Math.round(b * lit)},${look.alpha})`;

        const face = placePlane(el("div", "face lf", parent), P0, u, v, W, H);

        face.innerHTML =
            `<svg width="${W.toFixed(2)}" height="${H.toFixed(2)}" ` +
            `viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}">` +
            `<polygon points="0,0 ${W.toFixed(2)},0 0,${H.toFixed(2)}" ` +
            `fill="${fill}" stroke="rgba(255,255,255,${look.edge})" ` +
            `stroke-width="1" stroke-linejoin="round" /></svg>`;

        return face;

    }

    /*
     * 上下に尖った結晶（双角錐）。
     * base: 中心まわりの水平な多角形 [[x,y], ...]
     * look: { color:[r,g,b] or (i, isTop) => [r,g,b], alpha, edge, ambient }
     */
    function crystal(parent, base, up, down, look, clickable) {

        const solid = el("div", `solid${clickable ? " is-clickable" : ""}`, parent);
        const T = [0, 0, -0 + up];
        const D = [0, 0, -down];
        const center = [0, 0, (up - down) / 4];

        base.forEach((p, i) => {

            const q = base[(i + 1) % base.length];
            const A = [p[0], p[1], 0];
            const B = [q[0], q[1], 0];

            const colorOf = (isTop) =>
                typeof look.color === "function"
                    ? look.color(i, isTop)
                    : look.color;

            tri(solid, A, B, T, center, { ...look, color: colorOf(true) });
            tri(solid, B, A, D, center, {
                ...look,
                color: colorOf(false),
                ambient: look.ambient * 0.8
            });

        });

        return solid;

    }

    function hslToRgb(h, s, l) {

        const f = (n) => {
            const k = (n + h * 12) % 12;
            const a = s * Math.min(l, 1 - l);
            return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
        };

        return [f(0), f(8), f(4)];

    }

    function rhombus(a, b) {
        return [[a, 0], [0, b], [-a, 0], [0, -b]];
    }

    function polygonBase(r, count, offset = 0) {

        return Array.from({ length: count }, (_, i) => {
            const t = offset + (Math.PI * 2 * i) / count;
            return [Math.cos(t) * r, Math.sin(t) * r];
        });

    }

    /* 常に正面を向く要素（光・文字） */
    function billboard(parent, className, pos = {}, html = "") {

        const e = el("div", `bb lf ${className}`, parent);

        if (pos.x) e.style.setProperty("--bx", `${pos.x}px`);
        if (pos.y) e.style.setProperty("--by", `${pos.y}px`);
        if (pos.z) e.style.setProperty("--bz", `${pos.z}px`);
        if (pos.dx) e.style.setProperty("--ldx", `${pos.dx}px`);
        if (pos.dy) e.style.setProperty("--ldy", `${pos.dy}px`);

        e.innerHTML = html;

        return e;

    }

    /*
     * 小さな結晶は、常に正面を向く1枚の絵で表す（面を1枚ずつ組むより
     * はるかに軽い）。上半分は明るく、下半分は暗く塗り分けて立体に見せる。
     */
    function crystalSprite(parent, w, h, look, clickable, pos = {}) {

        const [r, g, b] = look.color;
        const tone = (k) =>
            `rgba(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)},${look.alpha})`;
        const hw = w / 2;
        const hh = h / 2;
        const mid = h * 0.08;
        const edge = `rgba(255,255,255,${look.edge})`;

        const e = billboard(
            parent, `sprite${clickable ? " is-clickable" : ""}`, pos,
            `<svg width="${w}" height="${h}" viewBox="${-hw} ${-hh} ${w} ${h}" ` +
            `stroke="${edge}" stroke-width="1" stroke-linejoin="round">` +
            `<polygon points="0,${-hh} ${-hw},0 0,${mid}" fill="${tone(1)}" />` +
            `<polygon points="0,${-hh} ${hw},0 0,${mid}" fill="${tone(0.78)}" />` +
            `<polygon points="${-hw},0 0,${mid} 0,${hh}" fill="${tone(0.55)}" />` +
            `<polygon points="${hw},0 0,${mid} 0,${hh}" fill="${tone(0.4)}" />` +
            `</svg>`
        );

        return e;

    }

    /*
     * 世界の名前。
     * 3D空間の中には「位置の目印」だけを置き、実際の文字は3Dの外
     * （#label-layer）に描いて、毎フレーム目印の位置へ合わせる。
     *   ・結晶の奥に文字が隠れない（3Dの前後関係の影響を受けない）
     *   ・スマホで地図を縮めても、文字は読める大きさのまま
     */
    const labelLayer = (() => {
        let layer = document.getElementById("label-layer");
        if (!layer) {
            layer = document.createElement("div");
            layer.id = "label-layer";
            layer.setAttribute("aria-hidden", "true");
            stage.appendChild(layer);
        }
        return layer;
    })();

    const mapLabels = [];

    function label(parent, text, className, pos) {

        const anchor = billboard(parent, `label ${className || ""}`, pos, text);

        const twin = document.createElement("div");
        twin.className = `map-label ${className || ""}`;
        twin.textContent = text;
        labelLayer.appendChild(twin);

        const side = /label-side-l/.test(className || "")
            ? "l"
            : /label-side-r/.test(className || "") ? "r" : "c";

        mapLabels.push({ anchor, twin, side, node: parent.closest(".node") || parent });

        return anchor;

    }

    function syncLabels() {

        const base = stage.getBoundingClientRect();

        mapLabels.forEach((m) => {

            const r = m.anchor.getBoundingClientRect();
            const y = r.top + r.height / 2 - base.top;
            let x = r.left + r.width / 2 - base.left;
            let ax = "-50%";

            // 横に添える名前は、結晶側の端をそろえる
            if (m.side === "l") { x = r.right - base.left; ax = "-100%"; }
            if (m.side === "r") { x = r.left - base.left; ax = "0%"; }

            // 画面の端からはみ出さないように寄せる（スマホの縦長画面向け）
            if (m.side !== "c") {
                const w = m.width || (m.width = m.twin.offsetWidth);
                const pad = 6;
                if (m.side === "l") x = Math.max(x, w + pad);
                if (m.side === "r") x = Math.min(x, base.width - w - pad);
            }

            m.twin.style.transform =
                `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${ax}, -50%)`;

            const n = m.node;
            m.twin.classList.toggle("is-dimmed", n.classList.contains("is-dimmed"));
            m.twin.classList.toggle(
                "is-lit",
                n.classList.contains("is-selected") || n.classList.contains("is-hover")
            );

        });

    }

    /* 水平に寝かせた平面（その場の z に置く） */
    function flat(parent, className, w, h, z, html = "") {

        const e = el("div", `flat lf ${className}`, parent);

        e.style.width = `${w}px`;
        e.style.height = `${h}px`;
        e.style.transform =
            `translate3d(${-w / 2}px, ${-h / 2}px, ${z}px)`;
        e.innerHTML = html;

        return e;

    }

    function node(worldKey, x, y, z) {

        const n = el("div", "node", space);

        if (worldKey) {
            n.dataset.world = worldKey;
        }

        n.style.setProperty("--x", `${x.toFixed(1)}px`);
        n.style.setProperty("--y", `${y.toFixed(1)}px`);
        n.style.setProperty("--z", `${z.toFixed(1)}px`);

        return n;

    }


    /*
     * ======================================================
     * 世界の組み立て
     * ======================================================
     */

    const L = LAYOUT;

    /* ---------- 刹那の奈落：大地の真下に口を開ける ---------- */

    {
        const n = node("abyss", 0, 0, L.abyssZ);
        const aliasBottom = L.aliasZ - L.aliasThickness - L.abyssZ;

        billboard(n, "glow abyss-glow");

        // 大地の底から奈落へ、渦を巻きながら狭まっていく
        [
            { z: aliasBottom - 16, r: 290, a: 0.42 },
            { z: aliasBottom - 62, r: 190, a: 0.34 },
            { z: aliasBottom - 105, r: 105, a: 0.28 }
        ].forEach((ring) => {

            const d = ring.r * 2;

            flat(
                n, "vortex", d, d, ring.z,
                `<svg width="${d}" height="${d}" viewBox="${-ring.r} ${-ring.r} ${d} ${d}">` +
                `<circle r="${ring.r - 2}" style="--a:${ring.a}" /></svg>`
            );

        });

        crystal(
            n, rhombus(46, 46), 30, 120,
            { color: [130, 24, 28], alpha: 0.85, edge: 0.32, ambient: 0.35 },
            true
        );

        // 刹那の奈落の名前は常には出さない（大地の下に隠れた世界。触れたときだけ名前が出る）
    }

    /* ---------- エイリアスワールド：厚みのある大地 ---------- */

    {
        const n = node("alias", 0, 0, L.aliasZ);
        const R = L.aliasRadius;
        const T = L.aliasThickness;

        // 厚み：縁の輪を何枚か重ねて、横から見たときの側面にする
        //（側面を細かい面で組むと重くなるため）
        [-7, -14, -21, -T].forEach((z, k) => {

            const d = R * 2 + 4;

            flat(
                n, "rim-ring", d, d, z,
                `<svg width="${d}" height="${d}" viewBox="${-d / 2} ${-d / 2} ${d} ${d}">` +
                `<circle r="${R}" fill="${k === 3 ? "#060607" : "none"}" ` +
                `stroke="rgba(150,150,158,${(0.42 - k * 0.09).toFixed(2)})" stroke-width="${k === 3 ? 1.2 : 1}" />` +
                `</svg>`
            );

        });

        // 表面（紋様）
        const sigil = Array.from({ length: 12 }, (_, i) => {
            const size = i % 3 === 0 ? 560 : 500;
            return (
                `<rect x="${-size / 2}" y="${-size / 2}" width="${size}" ` +
                `height="${size}" transform="rotate(${7.5 * i})"` +
                `${i % 3 === 0 ? ' class="is-bold"' : ""} />`
            );
        }).join("");

        flat(
            n, "alias-art", 1000, 1000, 0,
            `<svg width="1000" height="1000" viewBox="-500 -500 1000 1000">` +
            `<defs><radialGradient id="alias-floor">` +
            `<stop offset="0" stop-color="#1c1c20" stop-opacity="0.42" />` +
            `<stop offset="0.6" stop-color="#0d0d10" stop-opacity="0.92" />` +
            `<stop offset="1" stop-color="#0a0a0c" stop-opacity="0.97" />` +
            `</radialGradient></defs>` +
            `<circle r="${R}" fill="url(#alias-floor)" />` +
            `<circle class="alias-rim" r="${R - 4}" />` +
            `<circle class="alias-rim faint" r="${R - 30}" />` +
            `<g class="alias-sigil">${sigil}</g>` +
            `<circle class="alias-rim faint" r="168" />` +
            // 触れる範囲：外側の輪（内側は上の世界・下の奈落に譲る）
            `<circle class="alias-hit" r="400" fill="none" ` +
            `stroke="transparent" stroke-width="140" /></svg>`
        );

        // 十二使徒：大地の縁に立ち、すべての世界を見守る（十二色の色相環）
        for (let i = 0; i < 12; i++) {

            const t = (Math.PI * 2 * i) / 12;
            const r = R - 16;
            const x = Math.cos(t) * r;
            const y = Math.sin(t) * r;
            const hue = i * 30;
            const color = `hsl(${hue}, 42%, 62%)`;
            const H = 74;

            [[1, 0], [0, 1]].forEach(([ux, uy]) => {

                const q = quad(
                    n, "apostle",
                    [x - ux * 5, y - uy * 5, H], [ux * 10, uy * 10, 0], [0, 0, -H]
                );

                q.style.setProperty("--ac", color);

            });

            const rgb = hslToRgb(hue / 360, 0.42, 0.66);

            crystalSprite(
                n, 16, 24,
                { color: rgb, alpha: 0.9, edge: 0.7 },
                true,
                { x: Math.round(x), y: Math.round(y), z: H + 12 }
            );

        }

        label(n, "エイリアスワールド", "label-alias", { y: 330, z: 4 });

        /*
         * 龍の世界の境界：十二使徒の立つ縁から、淡い光の天蓋が架かる。
         * この内側が「龍の世界」、外側は龍の世界の外。
         */
        const domeHeight = L.edenZ - L.aliasZ - 40;

        [12, 30, 48, 64, 78].forEach((deg, k) => {

            const t = (deg * Math.PI) / 180;
            const r = R * Math.cos(t);
            const d = Math.round(r * 2 + 4);

            flat(
                n, "dome-ring", d, d, Math.round(domeHeight * Math.sin(t)),
                `<svg width="${d}" height="${d}" viewBox="${-d / 2} ${-d / 2} ${d} ${d}">` +
                `<circle r="${r.toFixed(1)}" style="--a:${(0.2 - k * 0.025).toFixed(3)}" /></svg>`
            );

        });
    }

    /* ---------- 四つの川：中心から流れ、縁を越えてこぼれ落ちる ---------- */

    {
        const n = node(null, 0, 0, L.aliasZ + 1);
        const R = L.aliasRadius;

        RIVERS.forEach((river, i) => {

            const t = (river.angle * Math.PI) / 180;
            const d = [Math.cos(t), Math.sin(t), 0];
            const p = [-Math.sin(t), Math.cos(t), 0];

            const soft = river.color + "55";

            // 大地の上を流れる光
            const strip = quad(
                n, "river-strip",
                mul(p, -6), mul(d, R - 2), mul(p, 12)
            );

            strip.style.setProperty("--rc", river.color);
            strip.style.setProperty("--flow", `${1.6 + i * 0.25}s`);
            strip.innerHTML = '<span class="flow"></span>';

            // 縁からこぼれ、砂のように崩れて消えていく（交差した2枚）
            const rim = mul(d, R + 1);

            [
                { P0: add(rim, mul(p, -16)), u: mul(p, 32) }
            ].forEach((sheet, k) => {

                const fall = quad(n, "river-fall", sheet.P0, sheet.u, [0, 0, -210]);

                fall.style.setProperty("--rc", river.color);
                fall.style.setProperty("--rc-soft", soft);
                fall.style.setProperty("--fall", `${2.2 + i * 0.3 + k * 0.4}s`);
                fall.innerHTML =
                    '<span class="sand sand-a"></span><span class="sand sand-b"></span>';

            });

            label(n, river.name, "label-river", {
                x: Math.round(d[0] * 300 + p[0] * 22),
                y: Math.round(d[1] * 300 + p[1] * 22),
                z: 6
            });

        });
    }

    /* ---------- 魂界：大地の輪をゆっくり巡る、青白い魂の灯 ---------- */

    {
        const n = node("soul", 0, 0, L.aliasZ + 30);
        const orbit = el("div", "grp soul-orbit", n);
        const R = 400;

        // 魂の巡る道
        flat(
            orbit, "soul-path", R * 2 + 20, R * 2 + 20, -10,
            `<svg width="${R * 2 + 20}" height="${R * 2 + 20}" ` +
            `viewBox="${-R - 10} ${-R - 10} ${R * 2 + 20} ${R * 2 + 20}">` +
            `<circle r="${R}" /></svg>`
        );

        for (let i = 0; i < 18; i++) {

            const t = (Math.PI * 2 * i) / 18 + (i % 3) * 0.06;
            const w = billboard(orbit, "wisp hit", {
                x: Math.round(Math.cos(t) * R),
                y: Math.round(Math.sin(t) * R),
                z: (i * 7) % 16
            });

            w.style.setProperty("--d", `${(i * 0.37) % 3}s`);
            w.style.setProperty("--ws", `${26 + ((i * 5) % 12)}px`);

        }

        // エイリアスワールドの名前（手前の中央）と重ならない位置に置く
        const lt = (140 * Math.PI) / 180;

        label(n, "魂界", "label-small label-soul", {
            x: Math.round(Math.cos(lt) * R),
            y: Math.round(Math.sin(lt) * R),
            z: 20,
            dy: -16
        });
    }

    /* ---------- 名前のない無数の世界：龍の世界の外に漂う ---------- */

    {
        const n = node(null, -560, 420, L.aliasZ + 40);
        label(n, "龍の世界の外", "label-outside", {});
    }

    for (let i = 0; i < 16; i++) {

        const a = (Math.PI * 2 * i) / 16 + (i % 2 ? 0.12 : -0.08);
        const r = 545 + ((i * 37) % 90);
        const z = L.aliasZ + ((i * 53) % 300);
        const w = 30 + ((i * 13) % 24);
        const n = node(null, Math.cos(a) * r, Math.sin(a) * r, z);

        billboard(
            n, "nameless", {},
            `<svg width="${w}" height="${w * 0.56}" viewBox="-50 -28 100 56" ` +
            `style="--a:${(0.18 + ((i * 7) % 10) / 40).toFixed(2)}">` +
            `<polygon points="0,-26 48,0 0,26 -48,0" /></svg>`
        );

    }

    /* ---------- 礎の根：すべての世界は、エイリアスから伸びた光に支えられている ---------- */

    {
        const n = node(null, 0, 0, 0);
        const ground = L.aliasZ + 1;

        const thread = (x, y, top) => {

            [[1, 0], [0, 1]].forEach(([ux, uy]) => {
                quad(
                    n, "root",
                    [x - ux * 1.5, y - uy * 1.5, top],
                    [ux * 3, uy * 3, 0],
                    [0, 0, -(top - ground)]
                );
            });

        };

        OTHER_WORLDS.forEach((spec) => {
            const t = (spec.a * Math.PI) / 180;
            thread(Math.cos(t) * spec.r, Math.sin(t) * spec.r, spec.z - 18);
        });

        // 大いなる世界は、二本ずつ
        thread(150, 0, L.misseoZ);
        thread(-150, 0, L.misseoZ);
        thread(0, 82, L.fronzZ);
        thread(0, -82, L.fronzZ);
    }

    /* ---------- 光の柱：楽園から大地まで貫く ---------- */

    {
        const n = node(null, 0, 0, 0);
        const top = L.edenZ - 20;
        const bottom = L.aliasZ;
        const h = top - bottom;

        quad(n, "pillar", [-13, 0, top], [26, 0, 0], [0, 0, -h]);
        quad(n, "pillar", [0, -13, top], [0, 26, 0], [0, 0, -h]);
    }

    /* ---------- 螺旋：世界同士・外の世界をつなぐもの ---------- */

    function helixSVG(length, amplitude, wavelength) {

        const h = amplitude * 2 + 4;
        let paths = "";

        HELIX_COLORS.forEach((color, k) => {

            const phase = (Math.PI / 2) * k;
            let d = "";

            for (let x = 0; x <= length; x += 3) {
                const y =
                    h / 2 +
                    Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
                d += `${x === 0 ? "M" : "L"}${x},${y.toFixed(2)}`;
            }

            paths += `<path d="${d}" stroke="${color}" />`;

        });

        return {
            html:
                `<svg width="${length}" height="${h}" viewBox="0 0 ${length} ${h}">` +
                `${paths}</svg>`,
            h
        };

    }

    {
        // 横：ミスセオの高さで、世界の外まで伸びる
        const n = node(null, 0, 0, L.misseoZ - 4);
        const horiz = helixSVG(1240, 6, 30);
        const f = flat(n, "helix", 1240, horiz.h, 0, horiz.html);

        f.style.opacity = "0.55";
        f.style.webkitMaskImage = f.style.maskImage =
            "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)";

        // 縦：フロンズとミスセオをつなぐ（交差した2枚）
        const span = L.fronzZ - L.misseoZ;
        const vert = helixSVG(span, 6, 26);

        [
            { P0: [0, -vert.h / 2, L.misseoZ], v: [0, vert.h, 0] },
            { P0: [-vert.h / 2, 0, L.misseoZ], v: [vert.h, 0, 0] }
        ].forEach((s) => {

            const q = quad(n, "helix", s.P0, [0, 0, span], s.v);

            q.innerHTML = vert.html;
            q.style.opacity = "0.55";

        });
    }

    /* ---------- ミスセオワールド ---------- */

    {
        const n = node("misseo", 0, 0, L.misseoZ);

        // 創世の四色を、ごく淡く面ごとに映す
        const tints = [
            [120, 150, 190], [150, 130, 185], [185, 165, 120], [110, 165, 155]
        ];

        crystal(
            n, rhombus(150, 88), 46, 64,
            {
                color: (i, isTop) => isTop ? tints[i] : tints[(i + 2) % 4],
                alpha: 0.5,
                edge: 0.6,
                ambient: 0.4
            },
            true
        );

        // 名前は結晶の横に添える（真上に置くと、上のフロンズの結晶に隠れてしまう）
        label(n, "ミスセオワールド", "label-side label-side-r", { z: 30, dx: 250 });
    }

    /* ---------- フロンズワールド ---------- */

    {
        const n = node("fronz", 0, 0, L.fronzZ);

        crystal(
            n, rhombus(140, 82), 44, 56,
            { color: [150, 212, 186], alpha: 0.46, edge: 0.7, ambient: 0.45 },
            true
        );

        label(n, "フロンズワールド", "label-side label-side-l", { z: 30, dx: -250 });
    }

    /* ---------- その他の世界：フロンズ・ミスセオの周りに浮かぶ ---------- */

    OTHER_WORLDS.forEach((spec, i) => {

        const t = (spec.a * Math.PI) / 180;
        const n = node("other", Math.cos(t) * spec.r, Math.sin(t) * spec.r, spec.z);

        crystalSprite(
            n, 28, 40,
            { color: [176, 196, 230], alpha: 0.55, edge: 0.8 },
            true
        );

        if (i === 0) {
            label(n, "その他の世界", "label-small", { z: 22, dy: -12 });
        }

    });

    /* ---------- 悠久の楽園：軸の頂点、すべての光の源 ---------- */

    {
        const n = node("eden", 0, 0, L.edenZ);

        // 放射する光（3D空間の外の #eden-light に描く）
        const rays = Array.from({ length: 48 }, (_, i) => {
            const t = (Math.PI * 2 * i) / 48;
            const long = i % 4 === 0;
            const r1 = 46;
            const r2 = long ? 300 : 150 + ((i * 37) % 90);
            return (
                `<line x1="${(Math.cos(t) * r1).toFixed(1)}" y1="${(Math.sin(t) * r1).toFixed(1)}" ` +
                `x2="${(Math.cos(t) * r2).toFixed(1)}" y2="${(Math.sin(t) * r2).toFixed(1)}"` +
                `${long ? ' class="is-long"' : ""} />`
            );
        }).join("");

        document.querySelector("#eden-light .eden-rays").innerHTML =
            `<svg viewBox="-310 -310 620 620">${rays}</svg>`;

        // 光輪
        [
            { d: 190, base: "rotateX(0deg)", cls: "" },
            { d: 250, base: "rotateX(72deg) rotateY(14deg)", cls: "is-dark is-reverse" }
        ].forEach((ring) => {

            const r = el("div", `halo-ring halo-spin lf ${ring.cls}`, n);

            r.style.width = r.style.height = `${ring.d}px`;
            r.style.marginLeft = r.style.marginTop = `${-ring.d / 2}px`;
            r.style.setProperty("--halo-base", ring.base);
            r.style.transform = ring.base;

        });

        // 光の結晶（2つの結晶を45°ずらして重ねた星形）
        // 光と闇が混じり合う：白い面と黒い面を市松に組む（色は持たない）
        const look = {
            color: (i, isTop) =>
                (i + (isTop ? 0 : 1)) % 2 === 0 ? [252, 252, 250] : [14, 14, 16],
            alpha: 0.82,
            edge: 0.9,
            ambient: 0.72
        };

        crystal(n, rhombus(32, 32), 82, 56, look, true);

        // 天へ伸びる光
        quad(n, "beam", [-15, 0, 420], [30, 0, 0], [0, 0, -330]);
        quad(n, "beam", [0, -15, 420], [0, 30, 0], [0, 0, -330]);

        // 触れやすいよう、光の中心にも当たり判定を置く
        const hit = billboard(n, "hit glow");

        hit.style.width = hit.style.height = "110px";

        label(n, "悠久の楽園", "label-eden", { z: 96, dy: -18 });
    }


    /*
     * ======================================================
     * 視点（傾き・回転）
     * ======================================================
     *
     * 縦ドラッグ／ホイール … 真上 ↔ 横 に傾ける
     * 横ドラッグ           … 回す
     * 値はなめらかに追いかけ、追いついたら止まる。
     */

    const TILT_MIN = 0;
    const TILT_MAX = 76;
    const TILT_REST = 60;

    const view = {
        tilt: 0,
        spin: -24,
        tiltTarget: 0,
        spinTarget: -24,
        // 情報パネルを開いたとき、地図をパネルの無い側へ寄せる量（px）
        offX: 0,
        offY: 0,
        offXTarget: 0,
        offYTarget: 0
    };

    let autoSpin = !reduceMotion;
    let loopRunning = false;
    let lastTime = 0;

    const clampTilt = (t) => Math.max(TILT_MIN, Math.min(TILT_MAX, t));

    /*
     * 傾けるほど縦の軸（楽園〜奈落）が画面に現れるので、
     * その中ほど（Z_CENTER）が画面の中央に来るよう上下にずらす。
     */
    const Z_CENTER = -40;
    let currentScale = 1;

    const edenLight = document.getElementById("eden-light");
    const PERSPECTIVE = 1600;
    const PERSPECTIVE_ORIGIN_Y = 0.45; // CSS の perspective-origin と合わせる

    function applyView() {

        const t = (view.tilt * Math.PI) / 180;
        const shift = Z_CENTER * Math.sin(t) * currentScale + view.offY;

        space.style.setProperty("--tilt", `${view.tilt.toFixed(2)}deg`);
        space.style.setProperty("--spin", `${view.spin.toFixed(2)}deg`);
        space.style.setProperty("--shift", `${shift.toFixed(1)}px`);
        space.style.setProperty("--offx", `${view.offX.toFixed(1)}px`);

        // 楽園（軸上 z=edenZ）の画面上の位置と大きさを求めて、光を重ねる
        if (edenLight) {

            const z = LAYOUT.edenZ;
            const H = stage.clientHeight;
            const yInSpace = -z * Math.sin(t) * currentScale + shift;
            const zInSpace = z * Math.cos(t) * currentScale;
            const fromOrigin = H * 0.5 + yInSpace - H * PERSPECTIVE_ORIGIN_Y;
            const f = PERSPECTIVE / (PERSPECTIVE - zInSpace);
            const screenY = H * PERSPECTIVE_ORIGIN_Y + fromOrigin * f;

            edenLight.style.transform =
                `translate(${(stage.clientWidth / 2 + view.offX * f).toFixed(1)}px, ${screenY.toFixed(1)}px) ` +
                `scale(${(currentScale * f).toFixed(4)})`;

        }

        syncLabels();

    }

    /*
     * 端末の性能に合わせた軽量化：
     * 最初の数秒のフレーム時間が長ければ、装飾の動きを一部止める
     * （形・配置・操作はそのまま）。
     */
    const perf = { samples: [], decided: false };

    function watchPerformance(rawDt) {

        if (perf.decided) {
            return;
        }

        perf.samples.push(rawDt);

        if (perf.samples.length < 90) {
            return;
        }

        perf.decided = true;

        const sorted = perf.samples.slice(10).sort((x, y) => x - y);
        const median = sorted[Math.floor(sorted.length / 2)];

        if (median > 0.034) {
            page.classList.add("is-lite");
        }

    }

    function frame(now) {

        const rawDt = (now - lastTime) / 1000;
        const dt = Math.min(0.1, rawDt || 0.016);
        lastTime = now;

        watchPerformance(rawDt);

        const k = 1 - Math.exp(-dt / 0.35);

        if (autoSpin) {
            view.spinTarget += dt * 1.6;
        }

        view.tilt += (view.tiltTarget - view.tilt) * k;
        view.spin += (view.spinTarget - view.spin) * k;
        view.offX += (view.offXTarget - view.offX) * k;
        view.offY += (view.offYTarget - view.offY) * k;

        applyView();

        const settled =
            Math.abs(view.tiltTarget - view.tilt) < 0.01 &&
            Math.abs(view.spinTarget - view.spin) < 0.01 &&
            Math.abs(view.offXTarget - view.offX) < 0.5 &&
            Math.abs(view.offYTarget - view.offY) < 0.5;

        if (settled && !autoSpin) {
            loopRunning = false;
            return;
        }

        window.requestAnimationFrame(frame);

    }

    function wake() {

        if (loopRunning) {
            return;
        }

        loopRunning = true;
        lastTime = performance.now();

        window.requestAnimationFrame(frame);

    }

    function stopAuto() {
        autoSpin = false;
        hint?.classList.add("is-gone");
    }

    function fitScale() {
        // スマホの縦長画面では、外周の漂う結晶が少し切れても地図を大きく見せる
        const fitWidth = window.innerWidth <= 700 ? 960 : 1180;
        currentScale = Math.min(window.innerWidth / fitWidth, window.innerHeight / 1120);
        space.style.setProperty("--s", currentScale.toFixed(4));
        applyView();
    }

    fitScale();
    window.addEventListener("resize", () => {
        mapLabels.forEach((m) => { m.width = 0; });
        fitScale();
    });

    applyView();

    // 到着：真上からの同心円 → ゆっくり傾いて、縦の軸が見えてくる
    if (reduceMotion) {

        view.tilt = view.tiltTarget = TILT_REST;
        view.spin = view.spinTarget = 0;
        applyView();

    } else {

        window.setTimeout(() => {
            view.tiltTarget = TILT_REST;
            view.spinTarget = 0;
            wake();
        }, 1200);

        wake();

    }


    /* ---------- ドラッグ ---------- */

    let pointerStart = null;
    let dragged = false;

    stage.addEventListener("pointerdown", (event) => {

        if (event.button !== 0) {
            return;
        }

        pointerStart = {
            x: event.clientX,
            y: event.clientY,
            tilt: view.tiltTarget,
            spin: view.spinTarget,
            id: event.pointerId
        };

        dragged = false;

    });

    /*
     * 悠久の楽園：カーソルを合わせている間、または選んでいる間だけ光り輝く
     * （スマホなどカーソルの無い端末では、選んだときに輝く）
     */
    let edenHovered = false;

    function updateEdenRadiance() {
        page.classList.toggle(
            "is-eden-radiant",
            edenHovered || selectedWorld === "eden"
        );
    }

    stage.addEventListener("pointermove", (event) => {

        if (event.pointerType === "mouse" && !pointerStart) {

            const over = Boolean(
                event.target.closest?.('.node[data-world="eden"]')
            );

            if (over !== edenHovered) {
                edenHovered = over;
                updateEdenRadiance();
            }

        }

    });

    // カーソルを合わせた世界の名前を、そっと添える
    const tip = document.getElementById("world-tip");

    // カーソルを合わせた世界を、淡く光らせる
    let hoverKey = null;

    function setHover(key) {

        if (key === hoverKey) {
            return;
        }

        if (hoverKey) {
            space.querySelectorAll(`.node[data-world="${hoverKey}"]`)
                .forEach((n) => n.classList.remove("is-hover"));
        }

        hoverKey = key;

        if (key) {
            space.querySelectorAll(`.node[data-world="${key}"]`)
                .forEach((n) => n.classList.add("is-hover"));
        }

        syncLabels();

    }

    stage.addEventListener("pointermove", (event) => {

        if (event.pointerType === "mouse") {
            const over = pointerStart
                ? null
                : event.target.closest?.(".node[data-world]");
            setHover(over ? over.dataset.world : null);
        }

        if (!tip || event.pointerType !== "mouse") {
            return;
        }

        // 名前の見えている大きな世界には出さず、数の多い小さな世界にだけ添える
        const found = pointerStart
            ? null
            : event.target.closest?.(".node[data-world]");
        const hovered =
            found && ["soul", "other"].includes(found.dataset.world)
                ? found
                : null;

        if (hovered) {
            tip.textContent = WORLD_DATA[hovered.dataset.world]?.name || "";
            tip.style.transform =
                `translate(${event.clientX + 16}px, ${event.clientY + 14}px)`;
            tip.classList.add("is-shown");
        } else {
            tip.classList.remove("is-shown");
        }

    });

    stage.addEventListener("pointerleave", () => {

        tip?.classList.remove("is-shown");
        setHover(null);

        if (edenHovered) {
            edenHovered = false;
            updateEdenRadiance();
        }

    });

    const edenIndexButton = document.querySelector('#world-index [data-world="eden"]');

    edenIndexButton?.addEventListener("focus", () => {
        edenHovered = true;
        updateEdenRadiance();
    });

    edenIndexButton?.addEventListener("blur", () => {
        edenHovered = false;
        updateEdenRadiance();
    });

    stage.addEventListener("pointermove", (event) => {

        if (!pointerStart || event.pointerId !== pointerStart.id) {
            return;
        }

        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;

        if (!dragged && Math.hypot(dx, dy) > 6) {

            dragged = true;
            stopAuto();

            stage.classList.add("is-dragging");
            stage.setPointerCapture(event.pointerId);

        }

        if (!dragged) {
            return;
        }

        // 下へドラッグすると手前に起き上がり、真上からの視点へ近づく
        view.tiltTarget = clampTilt(pointerStart.tilt - dy * 0.22);
        view.spinTarget = pointerStart.spin + dx * 0.25;

        wake();

    });

    function endDrag(event) {

        if (!pointerStart || event.pointerId !== pointerStart.id) {
            return;
        }

        pointerStart = null;
        stage.classList.remove("is-dragging");

    }

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    /* ---------- ホイール ---------- */

    stage.addEventListener(
        "wheel",
        (event) => {

            event.preventDefault();
            stopAuto();

            view.tiltTarget = clampTilt(view.tiltTarget + event.deltaY * 0.04);

            wake();

        },
        { passive: false }
    );

    /* ---------- キーボード ---------- */

    window.addEventListener("keydown", (event) => {

        const step = {
            ArrowUp: [6, 0],
            ArrowDown: [-6, 0],
            ArrowLeft: [0, -10],
            ArrowRight: [0, 10]
        }[event.key];

        if (step) {

            event.preventDefault();
            stopAuto();

            view.tiltTarget = clampTilt(view.tiltTarget + step[0]);
            view.spinTarget += step[1];

            wake();

        }

        if (event.key === "Escape") {
            clearSelection();
        }

    });


    /*
     * ======================================================
     * 世界の選択
     * ======================================================
     *
     * 同じ世界 → 解除
     * 別の世界 → 切り替え（一度閉じてから開き直さない）
     * 何もない所 → 解除
     */

    const nodes = [...space.querySelectorAll(".node")];

    const worldPanel = document.getElementById("world-panel");
    const panelEyebrow = document.getElementById("panel-eyebrow");
    const panelName = document.getElementById("panel-name");
    const panelDesc = document.getElementById("panel-desc");
    const panelLink = document.getElementById("panel-link");
    const panelClose = document.getElementById("panel-close");
    const panelSoon = document.getElementById("panel-soon");

    let selectedWorld = null;

    /*
     * パネルを開いたら、地図をパネルの無い側へ少し寄せて、
     * 選んだ世界がパネルに隠れないようにする
     * （PC：左へ／スマホ：下からのパネルなので上へ）。
     */
    function makeRoomForPanel(open) {

        const narrow = window.innerWidth <= 700;

        view.offXTarget = open && !narrow ? -worldPanel.offsetWidth * 0.42 : 0;
        view.offYTarget = open && narrow ? -window.innerHeight * 0.16 : 0;

        wake();

    }

    function clearSelection() {

        selectedWorld = null;

        space.classList.remove("has-selection");
        page.classList.remove("is-alias", "is-eden-dim");
        updateEdenRadiance();

        nodes.forEach((n) => n.classList.remove("is-selected", "is-dimmed"));

        worldPanel.classList.remove("is-open");
        worldPanel.setAttribute("aria-hidden", "true");

        makeRoomForPanel(false);
        syncLabels();

    }

    function selectWorld(key) {

        const data = WORLD_DATA[key];

        if (!data) {
            return;
        }

        selectedWorld = key;

        space.classList.add("has-selection");
        page.classList.toggle("is-alias", key === "alias");
        page.classList.toggle("is-eden-dim", key !== "eden");
        updateEdenRadiance();

        nodes.forEach((n) => {
            const hit = n.dataset.world === key;
            n.classList.toggle("is-selected", hit);
            n.classList.toggle("is-dimmed", !hit);
        });

        panelEyebrow.textContent = data.title;
        panelName.textContent = data.name;
        panelDesc.textContent = data.description;
        panelLink.href = data.url;

        // まだページの無い世界は、リンクの代わりに「準備中」と添える
        const ready = true;
        panelLink.hidden = !ready;
        panelSoon.hidden = ready;

        worldPanel.classList.add("is-open");
        worldPanel.setAttribute("aria-hidden", "false");

        makeRoomForPanel(true);
        syncLabels();

    }

    function toggleWorld(key) {

        stopAuto();

        if (selectedWorld === key) {
            clearSelection();
        } else {
            selectWorld(key);
        }

    }

    stage.addEventListener("click", (event) => {

        // ドラッグの直後に発生するクリックは、選択として扱わない
        if (dragged) {
            dragged = false;
            return;
        }

        const hitNode = event.target.closest?.(".node[data-world]");

        if (hitNode) {
            toggleWorld(hitNode.dataset.world);
        } else if (selectedWorld) {
            clearSelection();
        }

    });

    document.querySelectorAll("#world-index button").forEach((btn) => {
        btn.addEventListener("click", () => toggleWorld(btn.dataset.world));
    });

    panelClose?.addEventListener("click", clearSelection);

});
