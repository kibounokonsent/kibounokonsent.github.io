/* =========================================================
   龍の世界 / 世界地図（立体）
   ---------------------------------------------------------
   描画は <canvas> 1枚に、自前の3D投影で行う。
   （以前は CSS の3D変換で数百の要素を組んでいたが、
     スマホや性能の低いPCでは重く、カクつきの原因になっていた）
   見た目・配置・世界の設定は従来のものをそのまま引き継いでいる。
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
        description: "エイリアスのさらに底。すべての下に口を開ける、深い奈落。堕ちた者、背いた者、欲した者が行き着く場所。",
        url: "abyss/",
        lead: "エイリアスのさらに底。すべての下に口を開ける、深い奈落。",
        lore: [
            {
                heading: "刹那の奈落",
                text: [
                    "龍の世界の底の底。\nエイリアスのさらに下に、刹那の奈落は在る。",
                    "かつてそこへ、二人の天使が落ちた。\nヘレル・ベン・シャハルエル。\nアマイエル。",
                    "彼らは悠久の楽園に在り。\nされど満たされず。\nされど足りず。",
                    "一人は高きを望み。\n一人はすべてを望んだ。",
                    "やがて二人は堕ち。\n神へ背き。\nそして敗れた。",
                    "ゆえに奈落へ落ちた。\nゆえに名を失った。",
                    "ヘレル・ベン・シャハルエルはルシファーとなり。\nアマイエルはマモンとなった。",
                    "それより後。\n刹那の奈落には悪魔たちが集う。",
                    "堕ちた者。\n背いた者。\n欲した者。",
                    "されど奈落は彼らを拒まず。\nされど奈落は彼らを救わず。",
                    "ただ底に在り。\nただ堕ちた者を受け入れ続ける。"
                ]
            }
        ]
    },

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

/* 螺旋には、川の色の彩度を落として使う */
const HELIX_COLORS = ["#b3a27c", "#7f97b5", "#9787ad", "#7aa39a"];


document.addEventListener("DOMContentLoaded", () => {

    const page = document.getElementById("world-page");
    const stage = document.getElementById("world-stage");
    const canvas = document.getElementById("world-canvas");
    const ctx = canvas.getContext("2d");
    const hint = document.getElementById("world-hint");
    const tip = document.getElementById("world-tip");
    const resetButton = document.getElementById("view-reset");

    const Tuning = window.RyuTuning || null;

    // 「揺らぎ」を止めているときは、動きを静止させる（調律：ryu-tuning.js）
    let reduceMotion = Tuning
        ? Tuning.get("motion") === "off"
        : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 「眺め」：立体（3d）か、真上からの平面（flat）か
    let flatMode = Tuning ? Tuning.get("view") === "flat" : false;

    const sound = {
        select: (k) => Tuning?.select(k),
        cue: (n) => Tuning?.cue(n),
        mood: (m) => Tuning?.mood(m)
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const L = LAYOUT;
    const R = L.aliasRadius;
    const TAU = Math.PI * 2;
    const rad = (d) => (d * Math.PI) / 180;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));


    /*
     * ======================================================
     * 小さな道具
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

    const hexRgb = (hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
    ];

    /* 色。br は明るさ（CSS の filter: brightness と同じ考え方） */
    function rgba(r, g, b, a, br = 1) {
        return (
            `rgba(${Math.min(255, (r * br) | 0)},${Math.min(255, (g * br) | 0)},` +
            `${Math.min(255, (b * br) | 0)},${a < 0 ? 0 : a > 1 ? 1 : a.toFixed(3)})`
        );
    }

    function hslToRgb(h, s, l) {
        const f = (n) => {
            const k = (n + h * 12) % 12;
            const a = s * Math.min(l, 1 - l);
            return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
        };
        return [f(0), f(8), f(4)];
    }

    const rhombus = (a, b) => [[a, 0], [0, b], [-a, 0], [0, -b]];

    /* 水平な円（3D点の列） */
    function ring(cx, cy, z, r, n, offset = 0) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const t = offset + (TAU * i) / n;
            pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r, z]);
        }
        return pts;
    }

    /* 放射状グラデーションの小さな絵（光・魂の灯に使い回す） */
    function radialSprite(stops, size = 128) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");
        const h = size / 2;
        // CSS の radial-gradient(circle, …) は「一番遠い角」までが 100%
        const grad = g.createRadialGradient(h, h, 0, h, h, h * Math.SQRT2);
        stops.forEach(([o, col]) => grad.addColorStop(o, col));
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        return c;
    }

    const EDEN_GLOW = radialSprite([
        [0, "rgba(255,255,255,0.58)"],
        [0.14, "rgba(255,255,255,0.2)"],
        [0.34, "rgba(255,255,255,0.06)"],
        [0.62, "rgba(255,255,255,0)"]
    ], 256);

    const ABYSS_GLOW = radialSprite([
        [0, "rgba(160,26,26,0.6)"],
        [0.35, "rgba(100,12,12,0.22)"],
        [0.68, "rgba(100,12,12,0)"]
    ]);

    const WISP = (() => {
        const c = radialSprite([
            [0, "#f2ffff"],
            [0.22, "rgba(170,232,245,0.75)"],
            [0.5, "rgba(110,200,225,0.22)"],
            [0.72, "rgba(110,200,225,0)"]
        ], 64);
        // 丸く切り抜く
        const g = c.getContext("2d");
        g.globalCompositeOperation = "destination-in";
        g.beginPath();
        g.arc(32, 32, 32, 0, TAU);
        g.fill();
        return c;
    })();


    /*
     * ======================================================
     * 世界の組み立て（3Dの形はここで一度だけ計算する）
     * ======================================================
     */

    // 光は「斜め上・手前」から
    const LIGHT = norm([-0.35, 0.45, 0.82]);

    /* 上下に尖った結晶（双角錐）。面ごとの陰影は最初に決めておく */
    const crystals = [];

    function makeCrystal(world, pos, base, up, down, look) {

        const T = [0, 0, up];
        const D = [0, 0, -down];
        const center = [0, 0, (up - down) / 4];
        const faces = [];

        const face = (P0, P1, P2, color, ambient) => {
            let n = norm(cross(sub(P1, P0), sub(P2, P0)));
            const c = mul(add(add(P0, P1), P2), 1 / 3);
            if (dot(n, sub(c, center)) < 0) n = mul(n, -1);
            const lit = ambient + (1 - ambient) * Math.max(0, dot(n, LIGHT));
            faces.push({
                pts: [P0, P1, P2],
                rgb: color.map((v) => v * lit)
            });
        };

        base.forEach((p, i) => {
            const q = base[(i + 1) % base.length];
            const A = [p[0], p[1], 0];
            const B = [q[0], q[1], 0];
            const colorOf = (isTop) =>
                typeof look.color === "function" ? look.color(i, isTop) : look.color;
            face(A, B, T, colorOf(true), look.ambient);
            face(B, A, D, colorOf(false), look.ambient * 0.8);
        });

        crystals.push({
            world,
            pos,
            faces,
            alpha: look.alpha,
            edge: look.edge,
            hull: [...base.map((p) => [p[0], p[1], 0]), T, D]
        });

    }

    makeCrystal(
        "abyss", [0, 0, L.abyssZ], rhombus(46, 46), 30, 120,
        { color: [130, 24, 28], alpha: 0.85, edge: 0.32, ambient: 0.35 }
    );

    {
        // 創世の四色を、ごく淡く面ごとに映す
        const tints = [
            [120, 150, 190], [150, 130, 185], [185, 165, 120], [110, 165, 155]
        ];
        makeCrystal(
            "misseo", [0, 0, L.misseoZ], rhombus(150, 88), 46, 64,
            {
                color: (i, isTop) => (isTop ? tints[i] : tints[(i + 2) % 4]),
                alpha: 0.5, edge: 0.6, ambient: 0.4
            }
        );
    }

    makeCrystal(
        "fronz", [0, 0, L.fronzZ], rhombus(140, 82), 44, 56,
        { color: [150, 212, 186], alpha: 0.46, edge: 0.7, ambient: 0.45 }
    );

    // 悠久の楽園：光と闇が混じり合う（白い面と黒い面を市松に組む）
    makeCrystal(
        "eden", [0, 0, L.edenZ], rhombus(32, 32), 82, 56,
        {
            color: (i, isTop) =>
                (i + (isTop ? 0 : 1)) % 2 === 0 ? [252, 252, 250] : [14, 14, 16],
            alpha: 0.82, edge: 0.9, ambient: 0.72
        }
    );

    /* 小さな結晶（常に正面を向く絵） */
    const sprites = [];

    /* 十二使徒：大地の縁に立ち、すべての世界を見守る（十二色の色相環） */
    const apostles = [];

    for (let i = 0; i < 12; i++) {
        const t = (TAU * i) / 12;
        const r = R - 16;
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        const H = 74;
        apostles.push({ x, y, H, rgb: hslToRgb(i / 12, 0.42, 0.62) });
        sprites.push({
            world: "alias", pos: [x, y, L.aliasZ + H + 12], w: 16, h: 24,
            rgb: hslToRgb(i / 12, 0.42, 0.66), alpha: 0.9, edge: 0.7
        });
    }

    /* その他の世界：フロンズ・ミスセオの周りに浮かぶ */
    const otherPos = OTHER_WORLDS.map((s) => {
        const t = rad(s.a);
        return [Math.cos(t) * s.r, Math.sin(t) * s.r, s.z];
    });

    otherPos.forEach((p) => {
        sprites.push({
            world: "other", pos: p, w: 28, h: 40,
            rgb: [176, 196, 230], alpha: 0.55, edge: 0.8
        });
    });

    /* 魂界：大地の輪をゆっくり巡る、青白い魂の灯 */
    const SOUL_R = 400;
    const SOUL_Z = L.aliasZ + 30;
    const wisps = Array.from({ length: 18 }, (_, i) => ({
        a: (TAU * i) / 18 + (i % 3) * 0.06,
        z: (i * 7) % 16,
        size: 26 + ((i * 5) % 12),
        delay: (i * 0.37) % 3
    }));

    /* 名前のない無数の世界：龍の世界の外に漂う */
    const nameless = Array.from({ length: 16 }, (_, i) => {
        const a = (TAU * i) / 16 + (i % 2 ? 0.12 : -0.08);
        const r = 545 + ((i * 37) % 90);
        return {
            pos: [Math.cos(a) * r, Math.sin(a) * r, L.aliasZ + ((i * 53) % 300)],
            w: 30 + ((i * 13) % 24),
            a: 0.18 + ((i * 7) % 10) / 40
        };
    });

    /* 礎の根：すべての世界は、エイリアスから伸びた光に支えられている */
    const roots = [
        ...otherPos.map((p) => [p[0], p[1], p[2] - 18]),
        // 大いなる世界は、二本ずつ
        [150, 0, L.misseoZ], [-150, 0, L.misseoZ],
        [0, 82, L.fronzZ], [0, -82, L.fronzZ]
    ];

    /* 四つの川 */
    const rivers = RIVERS.map((river, i) => {
        const t = rad(river.angle);
        return {
            ...river,
            rgb: hexRgb(river.color),
            d: [Math.cos(t), Math.sin(t), 0],
            p: [-Math.sin(t), Math.cos(t), 0],
            flow: 1.6 + i * 0.25,
            fall: 2.2 + i * 0.3,
            // 砂粒の位置（毎回同じになるよう、決まった並びで散らす）
            sand: Array.from({ length: 34 }, (_, k) => ({
                u: (((k * 37) % 29) / 29 - 0.5) * 24,
                s: ((k * 53) % 97) / 97,
                white: k % 3 === 0
            }))
        };
    });

    /* 螺旋：世界同士・外の世界をつなぐもの */
    const helixH = HELIX_COLORS.map((color, k) => {
        const phase = (Math.PI / 2) * k;
        const pts = [];
        for (let x = 0; x <= 1240; x += 4) {
            pts.push([x - 620, Math.sin((x / 30) * TAU + phase) * 6, L.misseoZ - 4]);
        }
        return { rgb: hexRgb(color), pts };
    });

    const helixV = [];
    HELIX_COLORS.forEach((color, k) => {
        const phase = (Math.PI / 2) * k;
        const span = L.fronzZ - L.misseoZ;
        [0, 1].forEach((axis) => {
            const pts = [];
            for (let z = 0; z <= span; z += 3) {
                const o = Math.sin((z / 26) * TAU + phase) * 6;
                pts.push(axis ? [o, 0, L.misseoZ + z] : [0, o, L.misseoZ + z]);
            }
            helixV.push({ rgb: hexRgb(color), pts });
        });
    });

    /* 楽園の光輪 */
    const haloFlat = ring(0, 0, 0, 95, 48);
    const haloTilted = ring(0, 0, 0, 125, 48).map(([x, y]) => {
        // rotateX(72deg) rotateY(14deg)
        const b = rad(14);
        const a = rad(72);
        const x1 = x * Math.cos(b);
        const z1 = -x * Math.sin(b);
        return [x1, y * Math.cos(a) - z1 * Math.sin(a), y * Math.sin(a) + z1 * Math.cos(a)];
    });

    /* 楽園の放射する光（48本） */
    const rays = Array.from({ length: 48 }, (_, i) => ({
        t: (TAU * i) / 48,
        long: i % 4 === 0,
        r2: i % 4 === 0 ? 300 : 150 + ((i * 37) % 90)
    }));


    /*
     * ======================================================
     * 視点と投影
     * ======================================================
     */

    const TILT_MIN = 0;
    const TILT_MAX = 76;
    const TILT_REST = 60;
    const ZOOM_MIN = 0.7;
    const ZOOM_MAX = 2.6;
    const PERSPECTIVE = 1600;
    const PERSPECTIVE_ORIGIN_Y = 0.45;

    /*
     * 傾けるほど縦の軸（楽園〜奈落）が画面に現れるので、
     * その中ほど（Z_CENTER）が画面の中央に来るよう上下にずらす。
     */
    const Z_CENTER = -40;

    const view = {
        tilt: 0, tiltTarget: 0,
        spin: -24, spinTarget: -24,
        zoom: 1, zoomTarget: 1,
        // 指でずらした量
        panX: 0, panY: 0, panXTarget: 0, panYTarget: 0,
        // 情報パネルを開いたとき、地図をパネルの無い側へ寄せる量
        offX: 0, offY: 0, offXTarget: 0, offYTarget: 0,
        // 0 = 立体（遠近あり）、1 = 平面（真上から、遠近なし）
        flat: 0, flatTarget: 0
    };

    const clampTilt = (t) => (flatMode ? 0 : clamp(t, TILT_MIN, TILT_MAX));
    const restTilt = () => (flatMode ? 0 : TILT_REST);

    let W = 0;
    let H = 0;
    let dpr = 1;
    let fitScale = 1;
    let narrow = false;

    // 投影の係数（毎フレーム更新）
    const cam = { cs: 1, ss: 0, ct: 1, st: 0, S: 1, tx: 0, ty: 0, ox: 0, oy: 0, invP: 1 / PERSPECTIVE };

    function setupCamera() {
        const t = rad(view.tilt);
        const s = rad(view.spin);
        cam.cs = Math.cos(s);
        cam.ss = Math.sin(s);
        cam.ct = Math.cos(t);
        cam.st = Math.sin(t);
        cam.S = fitScale * view.zoom;
        cam.tx = W / 2 + view.offX + view.panX;
        cam.ty = H / 2 + Z_CENTER * cam.st * cam.S + view.offY + view.panY;
        cam.ox = W / 2;
        cam.oy = H * PERSPECTIVE_ORIGIN_Y;
        cam.invP = (1 - view.flat) / PERSPECTIVE;
    }

    /* 3Dの点 → 画面上の点 [x, y, 手前ほど大きい奥行き, 遠近の倍率] */
    function P(x, y, z) {
        const x1 = x * cam.cs - y * cam.ss;
        const y1 = x * cam.ss + y * cam.cs;
        const y2 = y1 * cam.ct - z * cam.st;
        const z2 = y1 * cam.st + z * cam.ct;
        const X = x1 * cam.S + cam.tx;
        const Y = y2 * cam.S + cam.ty;
        const Z = z2 * cam.S;
        const f = 1 / (1 - Z * cam.invP);
        return [cam.ox + (X - cam.ox) * f, cam.oy + (Y - cam.oy) * f, Z, f];
    }

    const lw = (w, f) => Math.max(0.5, w * cam.S * f);


    /*
     * ======================================================
     * 状態（選択・明るさ・浮上）
     * ======================================================
     */

    const WORLD_KEYS = Object.keys(WORLD_DATA);

    // 各世界と、世界に属さない装飾（"_"）の明るさ・浮上
    const tone = {};
    [...WORLD_KEYS, "_"].forEach((k) => {
        tone[k] = { br: 1, lift: 0 };
    });

    const brOf = (k) => tone[k || "_"].br;
    const liftOf = (k) => (k ? tone[k].lift : 0);

    /*
     * 平面の眺めでは、真上から見ると重なってしまう大いなる世界を
     * 上下に離して並べる（上：フロンズ、中：楽園、下：ミスセオ）。
     */
    const FLAT_SPREAD = { fronz: -140, misseo: 140 };
    const spreadOf = (k) => (FLAT_SPREAD[k] || 0) * view.flat;

    let selectedWorld = null;
    let hoverKey = null;
    let edenHovered = false;

    const aura = { op: 0.42, scale: 0.68, rays: 0.25, dim: 1 };

    function targetBr(k) {
        if (k === "eden" && (edenHovered || selectedWorld === "eden")) return 1.45;
        if (k !== "_" && k === hoverKey) return 1.55;
        if (!selectedWorld) return 1;
        return k === selectedWorld ? 1.35 : 0.28;
    }


    /*
     * ======================================================
     * 描画
     * ======================================================
     */

    let lite = false;
    let time = 0;
    const prims = [];   // 奥行きで並べ替えて描くもの
    const hits = [];    // 当たり判定（最後に描いたフレームのもの）

    function push(d, fn) {
        prims.push({ d, fn });
    }

    function pathPoly(pts, close = true) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        if (close) ctx.closePath();
    }

    /*
     * 3Dの線を短い区間に分けて、それぞれを奥行きで並べる
     * （輪や柱が、世界の前後を正しく回り込むように）
     */
    const NO_DASH = [];

    function pushPolyline(pts3, closed, seg, style) {

        const pp = pts3.map((p) => P(p[0], p[1], p[2]));
        const n = pp.length;
        const count = closed ? n : n - 1;

        for (let i = 0; i < count; i += seg) {

            const end = Math.min(i + seg, count);
            let d = 0;
            let f = 0;

            for (let j = i; j <= end; j++) {
                d += pp[j % n][2];
                f += pp[j % n][3];
            }

            d /= end - i + 1;
            f /= end - i + 1;

            const mid = (i + end) / 2 / count;

            push(d, () => {
                ctx.beginPath();
                ctx.moveTo(pp[i][0], pp[i][1]);
                for (let j = i + 1; j <= end; j++) {
                    const q = pp[j % n];
                    ctx.lineTo(q[0], q[1]);
                }
                style(f, mid);
                ctx.stroke();
                ctx.setLineDash(NO_DASH);
            });
        }
    }

    /* 柔らかい光の線（太さのある光を、細い線の重ね描きで表す） */
    function glowLine(a, b, alphaA, alphaB, rgb, layers, br) {

        const f = (a[3] + b[3]) / 2;

        layers.forEach((layer) => {
            const grad = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
            grad.addColorStop(0, rgba(rgb[0], rgb[1], rgb[2], alphaA * layer.a, br));
            grad.addColorStop(1, rgba(rgb[0], rgb[1], rgb[2], alphaB * layer.a, br));
            ctx.strokeStyle = grad;
            ctx.lineWidth = Math.max(0.6, layer.w * cam.S * f);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
        });

    }

    /* 縦に伸びる光を区間に分けて並べる。alphaAt(0..1) は下→上の濃さ */
    function pushBeam(x, y, zBottom, zTop, segs, alphaAt, rgb, layers, worldKey) {

        for (let i = 0; i < segs; i++) {
            const k0 = i / segs;
            const k1 = (i + 1) / segs;
            const a = P(x, y, zBottom + (zTop - zBottom) * k0);
            const b = P(x, y, zBottom + (zTop - zBottom) * k1);
            push((a[2] + b[2]) / 2, () =>
                glowLine(a, b, alphaAt(k0), alphaAt(k1), rgb, layers, brOf(worldKey))
            );
        }

    }

    function convexHull(points) {
        const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const crossZ = (o, a, b) =>
            (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lower = [];
        for (const p of pts) {
            while (lower.length >= 2 && crossZ(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
            lower.push(p);
        }
        const upper = [];
        for (let i = pts.length - 1; i >= 0; i--) {
            const p = pts[i];
            while (upper.length >= 2 && crossZ(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
            upper.push(p);
        }
        upper.pop();
        lower.pop();
        return lower.concat(upper);
    }

    /* ---------- 結晶 ---------- */

    function drawCrystal(c, sorted) {

        const lift = liftOf(c.world);
        const [bx, by0, bz] = c.pos;
        const by = by0 + spreadOf(c.world);
        const br = () => brOf(c.world);

        c.faces.forEach((face) => {

            const pp = face.pts.map((p) => P(bx + p[0], by + p[1], bz + p[2] + lift));
            const d = (pp[0][2] + pp[1][2] + pp[2][2]) / 3;
            const f = (pp[0][3] + pp[1][3] + pp[2][3]) / 3;

            const draw = () => {
                const b = br();
                pathPoly(pp);
                ctx.fillStyle = rgba(face.rgb[0], face.rgb[1], face.rgb[2], c.alpha, b);
                ctx.fill();
                ctx.strokeStyle = rgba(255, 255, 255, c.edge, b);
                ctx.lineWidth = lw(1, f);
                ctx.stroke();
            };

            if (sorted) push(d, draw);
            else draw();

        });

        const hull = convexHull(c.hull.map((p) => P(bx + p[0], by + p[1], bz + p[2] + lift)));
        const center = P(bx, by, bz + lift);

        hits.push({ world: c.world, kind: "poly", pts: hull, d: center[2] });

    }

    /* ---------- 小さな結晶（正面を向く絵） ---------- */

    function drawSprite(s) {

        const lift = liftOf(s.world);
        const q = P(s.pos[0], s.pos[1], s.pos[2] + lift);
        const k = cam.S * q[3];
        const hw = (s.w / 2) * k;
        const hh = (s.h / 2) * k;
        const mid = s.h * 0.08 * k;

        push(q[2], () => {

            const b = brOf(s.world);
            const [r, g, bl] = s.rgb;
            const x = q[0];
            const y = q[1];

            ctx.lineWidth = Math.max(0.5, k);
            ctx.strokeStyle = rgba(255, 255, 255, s.edge, b);
            ctx.lineJoin = "round";

            [
                [[0, -hh], [-hw, 0], [0, mid], 1],
                [[0, -hh], [hw, 0], [0, mid], 0.78],
                [[-hw, 0], [0, mid], [0, hh], 0.55],
                [[hw, 0], [0, mid], [0, hh], 0.4]
            ].forEach(([p0, p1, p2, kk]) => {
                ctx.beginPath();
                ctx.moveTo(x + p0[0], y + p0[1]);
                ctx.lineTo(x + p1[0], y + p1[1]);
                ctx.lineTo(x + p2[0], y + p2[1]);
                ctx.closePath();
                ctx.fillStyle = rgba(r * kk, g * kk, bl * kk, s.alpha, b);
                ctx.fill();
                ctx.stroke();
            });

        });

        hits.push({
            world: s.world, kind: "circle",
            x: q[0], y: q[1], r: Math.max(9, Math.max(hw, hh) * 1.05), d: q[2]
        });

    }

    /* ---------- 刹那の奈落（大地の下：常に最初に描く） ---------- */

    function drawAbyss() {

        const lift = liftOf("abyss");
        const br = brOf("abyss");
        const z0 = L.abyssZ + lift;
        const c = P(0, 0, z0);

        // 赤い光
        const pulse = 0.6 + 0.4 * (0.5 - 0.5 * Math.cos((TAU * time) / 11));
        const size = 440 * cam.S * c[3];
        ctx.globalAlpha = clamp(pulse * Math.min(br, 1.3), 0, 1);
        ctx.drawImage(ABYSS_GLOW, c[0] - size / 2, c[1] - size / 2, size, size);
        ctx.globalAlpha = 1;

        // 大地の底から奈落へ、渦を巻きながら狭まっていく
        const aliasBottom = L.aliasZ - L.aliasThickness - L.abyssZ;
        const turn = reduceMotion ? 0 : -(TAU * time) / 70;

        [
            { z: aliasBottom - 16, r: 290, a: 0.42 },
            { z: aliasBottom - 62, r: 190, a: 0.34 },
            { z: aliasBottom - 105, r: 105, a: 0.28 }
        ].forEach((v) => {
            const pts = ring(0, 0, z0 + v.z, v.r - 2, 64, turn).map((p) => P(p[0], p[1], p[2]));
            pathPoly(pts);
            ctx.setLineDash([3 * cam.S * c[3], 9 * cam.S * c[3]]);
            ctx.strokeStyle = rgba(150, 50, 50, v.a, br);
            ctx.lineWidth = lw(1.2, c[3]);
            ctx.stroke();
        });

        ctx.setLineDash([]);

        // 結晶（奈落の中だけで前後を並べる）
        const before = prims.length;
        drawCrystal(crystals[0], true);
        const own = prims.splice(before).sort((a, b) => a.d - b.d);
        own.forEach((p) => p.fn());

    }

    /* ---------- エイリアスワールド（大地）と、その上を流れる川 ---------- */

    function drawGround() {

        const lift = liftOf("alias");
        const br = brOf("alias");
        const z0 = L.aliasZ + lift;
        const c = P(0, 0, z0);
        const f = c[3];

        // 厚み：縁の輪を何枚か重ねて、横から見たときの側面にする
        [-26, -21, -14, -7].forEach((dz, idx) => {
            const k = 3 - idx;
            const pts = ring(0, 0, z0 + dz, R, 96).map((p) => P(p[0], p[1], p[2]));
            pathPoly(pts);
            if (k === 3) {
                ctx.fillStyle = rgba(6, 6, 7, 1, br);
                ctx.fill();
            }
            ctx.strokeStyle = rgba(150, 150, 158, 0.42 - k * 0.09, br);
            ctx.lineWidth = lw(k === 3 ? 1.2 : 1, f);
            ctx.stroke();
        });

        // 表面
        const outer = ring(0, 0, z0, R, 96).map((p) => P(p[0], p[1], p[2]));
        const ax = P(R, 0, z0);
        const axn = P(-R, 0, z0);
        const ay = P(0, R, z0);
        const ayn = P(0, -R, z0);

        pathPoly(outer);
        ctx.save();
        ctx.setTransform(
            dpr * (ax[0] - axn[0]) / 2, dpr * (ax[1] - axn[1]) / 2,
            dpr * (ay[0] - ayn[0]) / 2, dpr * (ay[1] - ayn[1]) / 2,
            dpr * (ax[0] + axn[0] + ay[0] + ayn[0]) / 4,
            dpr * (ax[1] + axn[1] + ay[1] + ayn[1]) / 4
        );
        const floor = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        floor.addColorStop(0, rgba(28, 28, 32, 0.42, br));
        floor.addColorStop(0.6, rgba(13, 13, 16, 0.92, br));
        floor.addColorStop(1, rgba(10, 10, 12, 0.97, br));
        ctx.fillStyle = floor;
        ctx.fill();
        ctx.restore();

        const strokeRing = (r, a, w) => {
            pathPoly(ring(0, 0, z0, r, 96).map((p) => P(p[0], p[1], p[2])));
            ctx.strokeStyle = rgba(255, 255, 255, a, br);
            ctx.lineWidth = lw(w, f);
            ctx.stroke();
        };

        strokeRing(R - 4, 0.38, 1.4);
        strokeRing(R - 30, 0.14, 1.4);
        strokeRing(168, 0.14, 1.4);

        // 紋様
        for (let i = 0; i < 12; i++) {
            const size = i % 3 === 0 ? 560 : 500;
            const h = size / 2;
            const t = rad(7.5 * i);
            const cs = Math.cos(t);
            const sn = Math.sin(t);
            const corners = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) =>
                P(x * cs - y * sn, x * sn + y * cs, z0)
            );
            pathPoly(corners);
            ctx.strokeStyle = rgba(255, 255, 255, i % 3 === 0 ? 0.34 : 0.16, br);
            ctx.lineWidth = lw(i % 3 === 0 ? 1.6 : 1.2, f);
            ctx.stroke();
        }

        // 触れる範囲：外側の輪（内側は上の世界・下の奈落に譲る）
        hits.push({
            world: "alias", kind: "annulus",
            outer: ring(0, 0, z0, R, 48).map((p) => P(p[0], p[1], p[2])),
            inner: ring(0, 0, z0, 330, 48).map((p) => P(p[0], p[1], p[2])),
            d: -Infinity
        });

        // 四つの川：中心から流れ、縁を越えてこぼれ落ちる
        const rbr = brOf("_");
        const zr = L.aliasZ + 1;

        rivers.forEach((rv) => {

            const [r, g, b] = rv.rgb;
            const quadAt = (from, to, w0, w1) => [
                P(rv.d[0] * from + rv.p[0] * w0, rv.d[1] * from + rv.p[1] * w0, zr),
                P(rv.d[0] * to + rv.p[0] * w0, rv.d[1] * to + rv.p[1] * w0, zr),
                P(rv.d[0] * to + rv.p[0] * w1, rv.d[1] * to + rv.p[1] * w1, zr),
                P(rv.d[0] * from + rv.p[0] * w1, rv.d[1] * from + rv.p[1] * w1, zr)
            ];

            const s0 = P(0, 0, zr);
            const s1 = P(rv.d[0] * (R - 2), rv.d[1] * (R - 2), zr);
            const grad = ctx.createLinearGradient(s0[0], s0[1], s1[0], s1[1]);
            grad.addColorStop(0, rgba(r, g, b, 0, rbr));
            grad.addColorStop(0.22, rgba(r, g, b, 1, rbr));
            grad.addColorStop(1, rgba(r, g, b, 1, rbr));
            ctx.fillStyle = grad;

            // 縁はぼかし、芯は濃く
            ctx.globalAlpha = 0.32;
            pathPoly(quadAt(0, R - 2, -6, 6));
            ctx.fill();
            ctx.globalAlpha = 0.78;
            pathPoly(quadAt(0, R - 2, -2.2, 2.2));
            ctx.fill();

            // 流れる光
            if (!lite || !coarse) {
                const phase = reduceMotion ? 0 : ((time / rv.flow) * 40) % 40;
                const total = R - 2 + 40;
                ctx.strokeStyle = rgba(255, 255, 255, 1, rbr);
                for (let s = phase - 40 + 21; s < R - 6; s += 40) {
                    if (s < 6) continue;
                    const k = (s + 40 - 21) / total;
                    const m = k < 0.08 ? 0 : k < 0.3 ? (k - 0.08) / 0.22 : 1;
                    if (m <= 0) continue;
                    const a = P(rv.d[0] * (s - 4), rv.d[1] * (s - 4), zr);
                    const e = P(rv.d[0] * (s + 4), rv.d[1] * (s + 4), zr);
                    ctx.globalAlpha = 0.42 * m;
                    ctx.lineWidth = Math.max(0.8, 4 * cam.S * a[3]);
                    ctx.beginPath();
                    ctx.moveTo(a[0], a[1]);
                    ctx.lineTo(e[0], e[1]);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;

            // 縁からこぼれ、砂のように崩れて消えていく
            const rim = [rv.d[0] * (R + 1), rv.d[1] * (R + 1)];
            const fallAt = (u, dz) =>
                P(rim[0] + rv.p[0] * u, rim[1] + rv.p[1] * u, zr + dz);

            const top = fallAt(0, 0);
            const bottom = fallAt(0, -210);
            const fg = ctx.createLinearGradient(top[0], top[1], bottom[0], bottom[1]);
            fg.addColorStop(0, rgba(r, g, b, 0.33, rbr));
            fg.addColorStop(0.35, rgba(r, g, b, 0.12, rbr));
            fg.addColorStop(0.7, rgba(r, g, b, 0, rbr));
            ctx.fillStyle = fg;

            [[16, 0.45], [8, 0.7]].forEach(([w, a]) => {
                ctx.globalAlpha = a;
                pathPoly([fallAt(-w, 0), fallAt(w, 0), fallAt(w, -210), fallAt(-w, -210)]);
                ctx.fill();
            });

            if (!lite) {
                const speed = 90 / rv.fall;
                rv.sand.forEach((grain) => {
                    const k = (grain.s + (reduceMotion ? 0 : (time * speed * (grain.white ? 0.75 : 1)) / 210)) % 1;
                    const vm = k < 0.35 ? 1 - (k / 0.35) * 0.45 : 0.55 * (1 - (k - 0.35) / 0.65);
                    const hm = 1 - Math.abs(grain.u) / 13;
                    if (hm <= 0) return;
                    const q = fallAt(grain.u, -k * 210);
                    const sz = Math.max(0.8, (grain.white ? 1.6 : 2.2) * cam.S * q[3]);
                    ctx.globalAlpha = vm * hm * (grain.white ? 0.8 : 1);
                    ctx.fillStyle = grain.white ? "#fff" : rv.color;
                    ctx.fillRect(q[0] - sz / 2, q[1] - sz / 2, sz, sz);
                });
            }

            ctx.globalAlpha = 1;

        });

    }

    /* ---------- 大地より上の、奥行きで並べて描くもの ---------- */

    function collectScene() {

        const L_ = L;

        // 十二使徒の光の柱
        apostles.forEach((ap) => {
            const lift = liftOf("alias");
            const a = P(ap.x, ap.y, L_.aliasZ + lift);
            const b = P(ap.x, ap.y, L_.aliasZ + lift + ap.H);
            const m = P(ap.x, ap.y, L_.aliasZ + lift + ap.H * 0.6);
            push((a[2] + b[2]) / 2, () => {
                const br = brOf("alias");
                const [r, g, bl] = ap.rgb;
                const grad = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
                grad.addColorStop(0, rgba(r, g, bl, 0.55, br));
                grad.addColorStop(0.6, rgba(r, g, bl, 0.27, br));
                grad.addColorStop(1, rgba(r, g, bl, 0, br));
                ctx.strokeStyle = grad;
                ctx.lineWidth = Math.max(0.8, 3.2 * cam.S * m[3]);
                ctx.beginPath();
                ctx.moveTo(a[0], a[1]);
                ctx.lineTo(b[0], b[1]);
                ctx.stroke();
            });
        });

        // 龍の世界の境界：十二使徒の立つ縁から、淡い光の天蓋が架かる
        const domeHeight = L_.edenZ - L_.aliasZ - 40;
        const aliasLift = liftOf("alias");

        [12, 30, 48, 64, 78].forEach((deg, k) => {
            const t = rad(deg);
            const r = R * Math.cos(t) - 2;
            const z = L_.aliasZ + aliasLift + domeHeight * Math.sin(t);
            pushPolyline(ring(0, 0, z, r, 64), true, 4, (f) => {
                ctx.strokeStyle = rgba(225, 228, 240, 0.2 - k * 0.025, brOf("alias"));
                ctx.lineWidth = lw(1.2, f);
            });
        });

        // 魂界
        const soulLift = liftOf("soul");
        const orbit = reduceMotion ? 0 : (TAU * time) / 180;

        pushPolyline(
            ring(0, 0, SOUL_Z - 10 + soulLift, SOUL_R, 96, orbit), true, 6,
            (f) => {
                ctx.setLineDash([2 * cam.S * f, 10 * cam.S * f]);
                ctx.strokeStyle = rgba(140, 210, 230, 0.22, brOf("soul"));
                ctx.lineWidth = lw(1.2, f);
                return f;
            }
        );

        wisps.forEach((w) => {
            const t = w.a + orbit;
            const q = P(Math.cos(t) * SOUL_R, Math.sin(t) * SOUL_R, SOUL_Z + w.z + soulLift);
            const size = w.size * cam.S * q[3];
            const fl = reduceMotion ? 0.35 : 0.5 - 0.5 * Math.cos((TAU * (time + w.delay)) / 3.2);
            push(q[2], () => {
                const br = brOf("soul");
                ctx.globalAlpha = clamp(br, 0, 1);
                ctx.drawImage(WISP, q[0] - size / 2, q[1] - size / 2, size, size);
                ctx.globalAlpha = clamp(fl * 0.7 * br, 0, 1);
                ctx.drawImage(WISP, q[0] - size / 2, q[1] - size / 2, size, size);
                ctx.globalAlpha = 1;
            });
            hits.push({ world: "soul", kind: "circle", x: q[0], y: q[1], r: Math.max(10, size * 0.45), d: q[2] });
        });

        // 名前のない無数の世界
        if (!lite) {
            nameless.forEach((nm) => {
                const q = P(nm.pos[0], nm.pos[1], nm.pos[2]);
                const k = (nm.w / 100) * cam.S * q[3];
                push(q[2], () => {
                    const br = brOf("_");
                    ctx.beginPath();
                    ctx.moveTo(q[0], q[1] - 26 * k);
                    ctx.lineTo(q[0] + 48 * k, q[1]);
                    ctx.lineTo(q[0], q[1] + 26 * k);
                    ctx.lineTo(q[0] - 48 * k, q[1]);
                    ctx.closePath();
                    ctx.fillStyle = rgba(90, 90, 95, 0.06, br);
                    ctx.fill();
                    ctx.strokeStyle = rgba(120, 120, 126, nm.a * 0.75, br);
                    ctx.lineWidth = Math.max(0.5, 1.2 * k);
                    ctx.stroke();
                });
            });
        }

        // 礎の根
        const ground = L_.aliasZ + 1;
        roots.forEach(([x, y, top]) => {
            const a = P(x, y, ground);
            const b = P(x, y, top);
            push((a[2] + b[2]) / 2, () => {
                const br = brOf("_");
                const grad = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
                grad.addColorStop(0, rgba(190, 190, 205, 0.4, br));
                grad.addColorStop(0.6, rgba(190, 190, 205, 0.12, br));
                grad.addColorStop(1, rgba(190, 190, 205, 0, br));
                ctx.strokeStyle = grad;
                ctx.lineWidth = Math.max(0.6, 2 * cam.S * a[3]);
                ctx.beginPath();
                ctx.moveTo(a[0], a[1]);
                ctx.lineTo(b[0], b[1]);
                ctx.stroke();
            });
        });

        // 光の柱：楽園から大地まで貫く（上は濃く、下へ消える）
        pushBeam(
            0, 0, L_.aliasZ, L_.edenZ - 20, 8,
            (k) => (k > 0.45 ? 1 : k / 0.45),
            [255, 255, 255],
            [{ w: 14, a: 0.06 }, { w: 6, a: 0.14 }, { w: 1.6, a: 0.5 }],
            null
        );

        // 天へ伸びる光
        const edenLift = liftOf("eden");
        pushBeam(
            0, 0, L_.edenZ + 90 + edenLift, L_.edenZ + 420 + edenLift, 4,
            (k) => 1 - k,
            [255, 255, 255],
            [{ w: 16, a: 0.08 }, { w: 6, a: 0.2 }, { w: 1.8, a: 0.7 }],
            "eden"
        );

        // 螺旋：横（ミスセオの高さで、世界の外まで伸びる）
        helixH.forEach((h) => {
            pushPolyline(h.pts, false, 16, (f, mid) => {
                const fade = mid < 0.18 ? mid / 0.18 : mid > 0.82 ? (1 - mid) / 0.18 : 1;
                ctx.strokeStyle = rgba(h.rgb[0], h.rgb[1], h.rgb[2], 0.55 * fade, brOf("_"));
                ctx.lineWidth = lw(1.3, f);
            });
        });

        // 螺旋：縦（フロンズとミスセオをつなぐ）
        helixV.forEach((h) => {
            pushPolyline(h.pts, false, 10, (f) => {
                ctx.strokeStyle = rgba(h.rgb[0], h.rgb[1], h.rgb[2], 0.55, brOf("_"));
                ctx.lineWidth = lw(1.3, f);
            });
        });

        // 悠久の楽園の光輪
        const ez = L_.edenZ + edenLift;
        pushPolyline(haloFlat.map((p) => [p[0], p[1], p[2] + ez]), true, 4, (f) => {
            ctx.strokeStyle = rgba(255, 255, 255, 0.6, brOf("eden"));
            ctx.lineWidth = lw(1, f);
        });

        const tilted = haloTilted.map((p) => [p[0], p[1], p[2] + ez]);
        pushPolyline(tilted, true, 4, (f) => {
            ctx.strokeStyle = rgba(6, 6, 8, 0.95, brOf("eden"));
            ctx.lineWidth = lw(3, f);
        });
        pushPolyline(tilted, true, 4, (f) => {
            ctx.strokeStyle = rgba(255, 255, 255, 0.22, brOf("eden"));
            ctx.lineWidth = lw(0.6, f);
        });

        // 結晶たち
        crystals.slice(1).forEach((c) => drawCrystal(c, true));
        sprites.forEach(drawSprite);

        // 楽園は、光の中心にも当たり判定を置く（触れやすく）
        const e = P(0, 0, ez);
        hits.push({ world: "eden", kind: "circle", x: e[0], y: e[1], r: 55 * cam.S * e[3], d: e[2] });

    }

    /* ---------- 楽園の光（最後に「足す」ように重ねる） ---------- */

    function drawEdenLight() {

        const e = P(0, 0, L.edenZ + liftOf("eden"));
        const k = cam.S * e[3] * aura.scale;
        const breathe = reduceMotion ? 0.9 : 0.9 - 0.1 * Math.cos((TAU * time) / 7);
        const base = aura.op * aura.dim;

        ctx.globalCompositeOperation = "screen";

        const size = 640 * k;
        ctx.globalAlpha = clamp(base * breathe, 0, 1);
        ctx.drawImage(EDEN_GLOW, e[0] - size / 2, e[1] - size / 2, size, size);

        const turn = reduceMotion ? 0 : (TAU * time) / 90;
        const rayAlpha = base * aura.rays;

        if (rayAlpha > 0.01) {
            ctx.lineWidth = Math.max(0.5, k);
            [false, true].forEach((longOnes) => {
                ctx.beginPath();
                rays.forEach((ray) => {
                    if (ray.long !== longOnes) return;
                    const t = ray.t + turn;
                    const c = Math.cos(t);
                    const s = Math.sin(t);
                    ctx.moveTo(e[0] + c * 46 * k, e[1] + s * 46 * k);
                    ctx.lineTo(e[0] + c * ray.r2 * k, e[1] + s * ray.r2 * k);
                });
                ctx.globalAlpha = clamp(rayAlpha * (longOnes ? 0.32 : 0.16), 0, 1);
                ctx.strokeStyle = "#fff";
                ctx.stroke();
            });
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

    }


    /*
     * ======================================================
     * 世界の名前
     * ======================================================
     *
     * 文字は最初に小さな絵として描いておき、毎フレームはそれを貼るだけ
     * （文字の影は描くのが重いため）。
     * 3Dの前後関係の影響を受けず、常に一番手前に出る。
     */

    const LABEL_STYLE = {
        base: { size: 13, ls: 0.26, color: "rgba(244,242,236,0.9)" },
        small: { size: 12, ls: 0.2, color: "rgba(244,242,236,0.9)" },
        river: { size: 11, ls: 0.35, color: "rgba(240,238,232,0.55)", narrow: { size: 10, ls: 0.2, alpha: 0.7 } },
        eden: { size: 15, ls: 0.4, color: "#fdfdfb", glow: true, narrow: { size: 13, ls: 0.3 } },
        alias: { size: 13, ls: 0.4, color: "rgba(228,228,234,0.8)" },
        soul: { size: 12, ls: 0.2, color: "rgba(196,238,248,0.9)" },
        outside: { size: 11, ls: 0.45, color: "rgba(185,185,195,0.55)", narrow: { size: 10, ls: 0.2, alpha: 0.7 } }
    };

    const labels = [];

    function addLabel(world, text, styleKey, pos, opts = {}) {
        labels.push({
            world, text, styleKey, pos,
            dx: opts.dx || 0, dy: opts.dy || 0,
            side: opts.side || "c",
            alpha: 1,
            img: null, lit: null
        });
    }

    addLabel("alias", "エイリアスワールド", "alias", [0, 330, L.aliasZ + 4]);

    rivers.forEach((rv) => {
        addLabel(null, rv.name, "river", [
            rv.d[0] * 300 + rv.p[0] * 22,
            rv.d[1] * 300 + rv.p[1] * 22,
            L.aliasZ + 7
        ]);
    });

    addLabel("soul", "魂界", "soul", [
        Math.cos(rad(140)) * SOUL_R, Math.sin(rad(140)) * SOUL_R, SOUL_Z + 20
    ], { dy: -16 });

    addLabel(null, "龍の世界の外", "outside", [-560, 420, L.aliasZ + 40]);

    // 名前は結晶の横に添える（真上に置くと、上のフロンズの結晶に隠れてしまう）
    addLabel("misseo", "ミスセオワールド", "base", [0, 0, L.misseoZ + 30], { side: "r", dx: 170 });
    addLabel("fronz", "フロンズワールド", "base", [0, 0, L.fronzZ + 30], { side: "l", dx: -170 });

    addLabel("other", "その他の世界", "small", [
        otherPos[0][0], otherPos[0][1], otherPos[0][2] + 22
    ], { dy: -12 });

    addLabel("eden", "悠久の楽園", "eden", [0, 0, L.edenZ + 96], { dy: -18 });

    const FONT_FAMILY = '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", serif';

    function renderLabelImage(lb, lit) {

        let st = { ...LABEL_STYLE[lb.styleKey] };

        if (narrow) {
            st = { ...st, size: Math.min(st.size, 12), ls: Math.min(st.ls, 0.14), ...(st.narrow || {}) };
        }

        const color = lit ? "#ffffff" : st.color;
        const font = `400 ${st.size}px ${FONT_FAMILY}`;
        const measure = document.createElement("canvas").getContext("2d");
        measure.font = font;

        const chars = [...lb.text];
        const spacing = st.size * st.ls;
        const widths = chars.map((ch) => measure.measureText(ch).width);
        const textW = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);

        // 横に添える名前は、結晶へ向かう細い線を引く
        const lineW = lb.side === "c" ? 0 : narrow ? 12 : 22;
        const gap = lb.side === "l" ? st.size * 0.6 : lb.side === "r" ? st.size * 0.8 : 0;
        const pad = 18;
        const w = Math.ceil(textW + lineW + gap + pad * 2);
        const h = Math.ceil(st.size * 1.6 + pad * 2);

        const c = document.createElement("canvas");
        c.width = Math.ceil(w * dpr);
        c.height = Math.ceil(h * dpr);

        const g = c.getContext("2d");
        g.scale(dpr, dpr);
        g.font = font;
        g.textBaseline = "middle";

        const textX = pad + (lb.side === "r" ? lineW + gap : 0);
        const y = h / 2;

        const drawText = (fill) => {
            g.fillStyle = fill;
            let x = textX;
            chars.forEach((ch, i) => {
                g.fillText(ch, x, y);
                x += widths[i] + spacing;
            });
        };

        // 影（画面外に描いた文字の影だけを、ずらして持ってくる）
        const OFF = 4000;
        g.save();
        g.translate(-OFF, 0);
        g.shadowOffsetX = OFF * dpr;
        [[3, "#000"], [8, "#000"], [16, "rgba(0,0,0,0.9)"]].forEach(([blur, col]) => {
            g.shadowBlur = blur * dpr;
            g.shadowColor = col;
            drawText("#000");
        });
        if (st.glow) {
            g.shadowBlur = 12 * dpr;
            g.shadowColor = "rgba(255,255,255,0.45)";
            drawText("#000");
        }
        g.restore();

        drawText(color);

        if (lineW) {
            g.fillStyle = "rgba(240,238,232,0.45)";
            const lx = lb.side === "l" ? textX + textW + gap : pad;
            g.fillRect(lx, Math.round(y), lineW, 1);
        }

        return {
            canvas: c, w, h, pad, lineW,
            // 横に添える名前の「結晶側の端」が、画像のどこにあるか
            anchorX: lb.side === "l" ? w - pad : lb.side === "r" ? pad : w / 2,
            alpha: st.alpha || 1
        };

    }

    function buildLabels() {
        labels.forEach((lb) => {
            lb.img = renderLabelImage(lb, false);
            lb.lit = renderLabelImage(lb, true);
        });
    }

    function drawLabels() {

        labels.forEach((lb) => {

            if (!lb.img) return;

            const lift = liftOf(lb.world);
            const q = P(lb.pos[0], lb.pos[1] + spreadOf(lb.world), lb.pos[2] + lift);
            const k = cam.S * q[3];
            // 平面では、楽園の名前を結晶の少し上へ
            const dy = lb.world === "eden" ? lb.dy - 30 * view.flat : lb.dy;
            const isLit = lb.world && (lb.world === selectedWorld || lb.world === hoverKey);
            const img = isLit ? lb.lit : lb.img;

            let x = q[0] + lb.dx * k;
            const y = q[1] + dy * k;

            // 画面の端からはみ出さないように寄せる（スマホの縦長画面向け）
            const textW = img.w - img.pad * 2;
            if (lb.side === "l") x = Math.max(x, textW + 6);
            if (lb.side === "r") x = Math.min(x, W - textW - 6);

            ctx.globalAlpha = lb.alpha * img.alpha;
            ctx.drawImage(
                img.canvas,
                Math.round(x - img.anchorX), Math.round(y - img.h / 2),
                img.w, img.h
            );

        });

        ctx.globalAlpha = 1;

    }


    /* ---------- 1フレーム ---------- */

    function render() {

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        setupCamera();

        hits.length = 0;
        prims.length = 0;

        drawAbyss();
        drawGround();

        collectScene();
        prims.sort((a, b) => a.d - b.d);
        for (let i = 0; i < prims.length; i++) prims[i].fn();
        ctx.setLineDash([]);

        drawEdenLight();
        drawLabels();

    }


    /*
     * ======================================================
     * 時間の進行
     * ======================================================
     */

    let autoSpin = !reduceMotion;
    let running = false;
    let lastTime = 0;
    let lastDraw = -Infinity;
    let interacting = false;
    let ambientFps = coarse ? 30 : 60;

    // 端末の性能を見て、重ければ自動で軽くする（形・配置・操作はそのまま）
    const perf = { cost: [], gaps: [], decided: false };

    function watchPerformance(cost, gap) {

        if (perf.decided) return;

        perf.cost.push(cost);
        if (gap < 1000) perf.gaps.push(gap);

        if (perf.cost.length < 45) return;

        perf.decided = true;

        const median = (arr) => arr.slice().sort((a, b) => a - b)[arr.length >> 1];

        if (median(perf.cost) > 11 || median(perf.gaps) > 48) {
            lite = true;
            ambientFps = 24;
            page.classList.add("is-lite");
            resize();
        }

    }

    function approach(cur, target, k, eps) {
        const next = cur + (target - cur) * k;
        return Math.abs(target - next) < eps ? target : next;
    }

    function step(dt) {

        const k = 1 - Math.exp(-dt / 0.35);

        if (autoSpin) view.spinTarget += dt * 1.6;

        view.tilt = approach(view.tilt, view.tiltTarget, k, 0.01);
        view.spin = approach(view.spin, view.spinTarget, k, 0.01);
        view.zoom = approach(view.zoom, view.zoomTarget, 1 - Math.exp(-dt / 0.12), 0.0005);
        view.panX = approach(view.panX, view.panXTarget, 1 - Math.exp(-dt / 0.12), 0.3);
        view.panY = approach(view.panY, view.panYTarget, 1 - Math.exp(-dt / 0.12), 0.3);
        view.offX = approach(view.offX, view.offXTarget, k, 0.3);
        view.offY = approach(view.offY, view.offYTarget, k, 0.3);
        view.flat = approach(view.flat, view.flatTarget, k, 0.001);

        // エイリアス選択時だけ、世界全体がゆっくり沈む
        const slow = selectedWorld === "alias";
        const kb = 1 - Math.exp(-dt / (slow ? 0.6 : 0.33));
        const kl = 1 - Math.exp(-dt / (slow ? 0.6 : 0.3));

        let changing = false;

        Object.keys(tone).forEach((key) => {
            const t = tone[key];
            const br = targetBr(key);
            const lift = key === selectedWorld ? 22 : 0;
            t.br = approach(t.br, br, kb, 0.003);
            t.lift = approach(t.lift, lift, kl, 0.05);
            if (t.br !== br || t.lift !== lift) changing = true;
        });

        const radiant = edenHovered || selectedWorld === "eden";
        const ka = 1 - Math.exp(-dt / (radiant ? 0.3 : 0.5));
        aura.op = approach(aura.op, radiant ? 1 : 0.42, ka, 0.002);
        aura.scale = approach(aura.scale, radiant ? 1.08 : 0.68, ka, 0.001);
        aura.rays = approach(aura.rays, radiant ? 1 : 0.25, ka, 0.002);
        aura.dim = approach(aura.dim, selectedWorld && selectedWorld !== "eden" ? 0.3 : 1, kb, 0.002);

        if (aura.op !== (radiant ? 1 : 0.42) || aura.scale !== (radiant ? 1.08 : 0.68)) changing = true;

        labels.forEach((lb) => {
            const target = selectedWorld && lb.world !== selectedWorld ? 0.32 : 1;
            lb.alpha = approach(lb.alpha, target, kb, 0.003);
            if (lb.alpha !== target) changing = true;
        });

        const settled =
            view.tilt === view.tiltTarget &&
            view.spin === view.spinTarget &&
            view.zoom === view.zoomTarget &&
            view.panX === view.panXTarget &&
            view.panY === view.panYTarget &&
            view.offX === view.offXTarget &&
            view.offY === view.offYTarget &&
            view.flat === view.flatTarget;

        // 自動回転だけなら、ゆっくりなので毎秒30コマで十分
        return changing || !(settled || (autoSpin && view.tilt === view.tiltTarget));

    }

    function loop(now) {

        const dt = Math.min(0.1, (now - lastTime) / 1000 || 0.016);
        lastTime = now;

        if (!reduceMotion) time += dt;

        const moving = step(dt);
        const fast = moving || interacting;
        const interval = fast ? 0 : 1000 / ambientFps;

        if (now - lastDraw >= interval - 2) {
            const t0 = performance.now();
            render();
            watchPerformance(performance.now() - t0, now - lastDraw);
            lastDraw = now;
        }

        if (fast || !reduceMotion || autoSpin) {
            window.requestAnimationFrame(loop);
        } else {
            running = false;
        }

    }

    function wake() {
        if (running) return;
        running = true;
        lastTime = performance.now();
        window.requestAnimationFrame(loop);
    }


    /*
     * ======================================================
     * 画面の大きさ
     * ======================================================
     */

    function resize() {

        const rect = stage.getBoundingClientRect();
        const wasNarrow = narrow;

        W = Math.max(1, rect.width);
        H = Math.max(1, rect.height);
        narrow = W <= 700;

        // 高解像度の画面でも、描く量は控えめに（見た目はほぼ変わらない）
        const maxDpr = lite ? 1.5 : 2;
        const nextDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
        const dprChanged = nextDpr !== dpr;
        dpr = nextDpr;

        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;

        // スマホの縦長画面では、外周の漂う結晶が少し切れても地図を大きく見せる
        const fitWidth = narrow ? 820 : 1180;
        fitScale = Math.min(W / fitWidth, H / 1120);

        if (dprChanged || wasNarrow !== narrow || !labels[0].img) buildLabels();

        if (selectedWorld) makeRoomForPanel(true);

        lastDraw = -Infinity;
        wake();

    }

    // resize() は下の makeRoomForPanel を使うため、関数の定義後に呼ぶ


    /*
     * ======================================================
     * 当たり判定
     * ======================================================
     */

    function inPoly(pts, x, y) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const xi = pts[i][0];
            const yi = pts[i][1];
            const xj = pts[j][0];
            const yj = pts[j][1];
            if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    function distToSeg(px, py, a, b) {
        const vx = b[0] - a[0];
        const vy = b[1] - a[1];
        const t = clamp(((px - a[0]) * vx + (py - a[1]) * vy) / (vx * vx + vy * vy || 1), 0, 1);
        return Math.hypot(px - (a[0] + vx * t), py - (a[1] + vy * t));
    }

    function distTo(h, x, y) {
        if (h.kind === "circle") return Math.max(0, Math.hypot(x - h.x, y - h.y) - h.r);
        if (inPoly(h.pts, x, y)) return 0;
        let d = Infinity;
        for (let i = 0; i < h.pts.length; i++) {
            d = Math.min(d, distToSeg(x, y, h.pts[i], h.pts[(i + 1) % h.pts.length]));
        }
        return d;
    }

    /*
     * 触れた点の世界を探す。
     *   1. 形の中に入っている世界のうち、一番手前のもの
     *   2. （指の場合）少し外れていても、近くにある世界
     *   3. 大地（エイリアス）の外側の輪
     */
    function hitTest(x, y, tolerance) {

        let best = null;

        hits.forEach((h) => {
            if (h.kind === "annulus") return;
            if (distTo(h, x, y) === 0 && (!best || h.d > best.d)) best = h;
        });

        if (best) return best.world;

        if (tolerance > 0) {
            let near = null;
            let nearD = tolerance;
            hits.forEach((h) => {
                if (h.kind === "annulus") return;
                const d = distTo(h, x, y);
                if (d < nearD) {
                    nearD = d;
                    near = h;
                }
            });
            if (near) return near.world;
        }

        const ground = hits.find((h) => h.kind === "annulus");

        if (ground && inPoly(ground.outer, x, y) && !inPoly(ground.inner, x, y)) {
            return "alias";
        }

        return null;

    }


    /*
     * ======================================================
     * 世界の選択
     * ======================================================
     *
     * 同じ世界 → 解除
     * 別の世界 → 切り替え（一度閉じてから開き直さない）
     * 何もない所 → 解除
     */

    const worldPanel = document.getElementById("world-panel");
    const panelEyebrow = document.getElementById("panel-eyebrow");
    const panelName = document.getElementById("panel-name");
    const panelDesc = document.getElementById("panel-desc");
    const panelLink = document.getElementById("panel-link");
    const panelClose = document.getElementById("panel-close");
    const panelSoon = document.getElementById("panel-soon");

    function updateEdenRadiance() {
        page.classList.toggle("is-eden-radiant", edenHovered || selectedWorld === "eden");
        wake();
    }

    /*
     * パネルを開いたら、地図をパネルの無い側へ少し寄せて、
     * 選んだ世界がパネルに隠れないようにする
     * （PC：左へ／スマホ：下からのパネルなので上へ）。
     */
    function makeRoomForPanel(open) {
        view.offXTarget = open && !narrow ? -worldPanel.offsetWidth * 0.42 : 0;
        view.offYTarget = open && narrow ? -H * 0.16 : 0;
        wake();
    }

    function stopAuto() {
        autoSpin = false;
        hint?.classList.add("is-gone");
    }

    function clearSelection() {

        if (selectedWorld) {
            sound.cue("close");
            sound.mood("base");
        }

        selectedWorld = null;

        page.classList.remove("is-alias", "is-eden-dim");
        updateEdenRadiance();

        worldPanel.classList.remove("is-open");
        worldPanel.setAttribute("aria-hidden", "true");

        makeRoomForPanel(false);

    }

    function selectWorld(key) {

        const data = WORLD_DATA[key];

        if (!data) return;

        selectedWorld = key;

        sound.select(key);
        sound.mood(["eden", "alias", "abyss", "soul"].includes(key) ? key : "base");

        page.classList.toggle("is-alias", key === "alias");
        page.classList.toggle("is-eden-dim", key !== "eden");
        updateEdenRadiance();

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

    }

    function toggleWorld(key) {

        stopAuto();

        if (selectedWorld === key) clearSelection();
        else selectWorld(key);

    }

    function setHover(key) {
        if (key === hoverKey) return;
        if (key) sound.cue("tick");
        hoverKey = key;
        stage.classList.toggle("is-pointing", Boolean(key));
        wake();
    }

    resize();

    if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(stage);
    } else {
        window.addEventListener("resize", resize);
    }

    // 明朝体の読み込みが終わったら、文字を描き直す
    document.fonts?.load(`13px ${FONT_FAMILY}`).then(() => {
        buildLabels();
        lastDraw = -Infinity;
        wake();
    }).catch(() => {});


    /*
     * ======================================================
     * 操作
     * ======================================================
     *
     * ドラッグ（1本指）        … 回す・傾ける
     * ピンチ（2本指）／ホイール … 拡大・縮小（2本指で動かすと、ずらせる）
     * タップ／クリック          … 世界を選ぶ
     */

    function updateHint() {
        if (!hint) return;
        hint.textContent = coarse
            ? (flatMode ? "ドラッグで動かす・ピンチで拡大・タップで選ぶ" : "ドラッグで回す・ピンチで拡大・タップで選ぶ")
            : flatMode
                ? "ドラッグで動かす ／ ホイールで拡大"
                : "ドラッグで回す・傾ける ／ ホイールで拡大";
    }

    updateHint();

    // 到着：真上からの同心円 → ゆっくり傾いて、縦の軸が見えてくる
    if (flatMode) {
        view.flat = view.flatTarget = 1;
        view.spin = view.spinTarget = 0;
        autoSpin = false;
    }

    if (reduceMotion) {
        view.tilt = view.tiltTarget = restTilt();
        view.spin = view.spinTarget = 0;
    } else {
        window.setTimeout(() => {
            view.tiltTarget = restTilt();
            view.spinTarget = flatMode ? view.spinTarget : 0;
            wake();
        }, 1200);
    }

    wake();

    const pointers = new Map();
    let gesture = null;

    const local = (e) => {
        const r = stage.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    };

    function clampPan() {
        const mx = W * 0.5 * view.zoomTarget;
        const my = H * 0.5 * view.zoomTarget;
        view.panXTarget = clamp(view.panXTarget, -mx, mx);
        view.panYTarget = clamp(view.panYTarget, -my, my);
    }

    /* 指定した点を中心に拡大・縮小する（指の下の世界がずれないように） */
    function zoomAround(nextZoom, x, y, base = null) {

        const from = base || { zoom: view.zoomTarget, panX: view.panXTarget, panY: view.panYTarget, x, y };
        const z = clamp(nextZoom, ZOOM_MIN, ZOOM_MAX);
        const r = z / from.zoom;

        view.zoomTarget = z;
        view.panXTarget = x - W / 2 - (from.x - W / 2 - from.panX) * r;
        view.panYTarget = y - H / 2 - (from.y - H / 2 - from.panY) * r;

        clampPan();
        updateResetButton();
        wake();

    }

    function startDrag(id, x, y, moved) {
        gesture = {
            type: "drag", id, x, y, moved,
            tilt: view.tiltTarget, spin: view.spinTarget,
            panX: view.panXTarget, panY: view.panYTarget
        };
    }

    function startPinch() {
        const [a, b] = [...pointers.values()];
        gesture = {
            type: "pinch",
            dist: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1,
            x: (a[0] + b[0]) / 2,
            y: (a[1] + b[1]) / 2,
            zoom: view.zoomTarget,
            panX: view.panXTarget,
            panY: view.panYTarget
        };
    }

    stage.addEventListener("pointerdown", (event) => {

        if (event.pointerType === "mouse" && event.button !== 0) return;

        const p = local(event);
        pointers.set(event.pointerId, p);

        try { stage.setPointerCapture(event.pointerId); } catch (e) { /* 無視 */ }

        interacting = true;

        if (pointers.size === 1) {
            startDrag(event.pointerId, p[0], p[1], false);
        } else if (pointers.size === 2) {
            stopAuto();
            startPinch();
        }

        wake();

    });

    stage.addEventListener("pointermove", (event) => {

        const p = local(event);

        if (pointers.has(event.pointerId)) {

            pointers.set(event.pointerId, p);

            if (gesture?.type === "pinch" && pointers.size >= 2) {

                const [a, b] = [...pointers.values()];
                const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
                const mx = (a[0] + b[0]) / 2;
                const my = (a[1] + b[1]) / 2;

                zoomAround(gesture.zoom * (dist / gesture.dist), mx, my, gesture);

            } else if (gesture?.type === "drag" && gesture.id === event.pointerId) {

                const dx = p[0] - gesture.x;
                const dy = p[1] - gesture.y;

                if (!gesture.moved && Math.hypot(dx, dy) > (event.pointerType === "mouse" ? 5 : 10)) {
                    gesture.moved = true;
                    gesture.x = p[0];
                    gesture.y = p[1];
                    stopAuto();
                    stage.classList.add("is-dragging");
                    setHover(null);
                    tip?.classList.remove("is-shown");
                }

                if (gesture.moved) {
                    // 下へドラッグすると手前に起き上がり、真上からの視点へ近づく
                    const ddx = p[0] - gesture.x;
                    const ddy = p[1] - gesture.y;
                    if (flatMode) {
                        // 平面の眺め：地図そのものをずらす
                        view.panXTarget = gesture.panX + ddx;
                        view.panYTarget = gesture.panY + ddy;
                        clampPan();
                    } else {
                        const touchK = event.pointerType === "mouse" ? 1 : 0.85;
                        view.tiltTarget = clampTilt(gesture.tilt - ddy * 0.22 * touchK);
                        view.spinTarget = gesture.spin + ddx * 0.28 * touchK;
                    }
                    wake();
                }

            }

            return;

        }

        // マウスを合わせているだけのとき：世界を淡く光らせ、名前を添える
        if (event.pointerType !== "mouse") return;

        const key = hitTest(p[0], p[1], 4);

        setHover(key);

        const overEden = key === "eden";
        if (overEden !== edenHovered) {
            edenHovered = overEden;
            updateEdenRadiance();
        }

        // 名前の見えている大きな世界には出さず、数の多い小さな世界にだけ添える
        if (tip) {
            if (key === "soul" || key === "other") {
                tip.textContent = WORLD_DATA[key].name;
                tip.style.transform = `translate(${event.clientX + 16}px, ${event.clientY + 14}px)`;
                tip.classList.add("is-shown");
            } else {
                tip.classList.remove("is-shown");
            }
        }

    });

    function endPointer(event) {

        if (!pointers.has(event.pointerId)) return;

        const p = local(event);
        const wasTap =
            event.type === "pointerup" &&
            gesture?.type === "drag" &&
            gesture.id === event.pointerId &&
            !gesture.moved;

        pointers.delete(event.pointerId);

        if (wasTap) {
            const key = hitTest(p[0], p[1], event.pointerType === "mouse" ? 4 : 26);
            if (key) toggleWorld(key);
            else if (selectedWorld) clearSelection();
        }

        if (pointers.size === 1) {
            // ピンチの後に残った指で、そのまま回し続けられるように
            const [id, q] = [...pointers.entries()][0];
            startDrag(id, q[0], q[1], true);
        } else if (pointers.size === 0) {
            gesture = null;
            interacting = false;
            stage.classList.remove("is-dragging");
        }

        wake();

    }

    stage.addEventListener("pointerup", endPointer);
    stage.addEventListener("pointercancel", endPointer);

    stage.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "mouse") return;
        tip?.classList.remove("is-shown");
        setHover(null);
        if (edenHovered) {
            edenHovered = false;
            updateEdenRadiance();
        }
    });

    /* ---------- ホイール（トラックパッドのピンチも含む） ---------- */

    stage.addEventListener(
        "wheel",
        (event) => {
            event.preventDefault();
            stopAuto();
            const [x, y] = local(event);
            const k = event.ctrlKey ? 0.01 : 0.0015;
            zoomAround(view.zoomTarget * Math.exp(-event.deltaY * k), x, y);
        },
        { passive: false }
    );

    /* ---------- 視点を戻す ---------- */

    function updateResetButton() {
        if (!resetButton) return;
        const changed =
            Math.abs(view.zoomTarget - 1) > 0.02 ||
            Math.abs(view.panXTarget) > 4 ||
            Math.abs(view.panYTarget) > 4 ||
            Math.abs(view.tiltTarget - restTilt()) > 3;
        resetButton.classList.toggle("is-shown", changed);
    }

    resetButton?.addEventListener("click", () => {
        stopAuto();
        view.zoomTarget = 1;
        view.panXTarget = 0;
        view.panYTarget = 0;
        view.tiltTarget = restTilt();
        updateResetButton();
        sound.cue("close");
        wake();
    });

    stage.addEventListener("pointerup", updateResetButton);

    /* ---------- キーボード ---------- */

    window.addEventListener("keydown", (event) => {

        const step = {
            ArrowUp: [6, 0],
            ArrowDown: [-6, 0],
            ArrowLeft: [0, -10],
            ArrowRight: [0, 10]
        }[event.key];

        if (step && flatMode) {
            event.preventDefault();
            view.panXTarget -= step[1] * 4;
            view.panYTarget += step[0] * 6;
            clampPan();
            updateResetButton();
            wake();
        } else if (step) {
            event.preventDefault();
            stopAuto();
            view.tiltTarget = clampTilt(view.tiltTarget + step[0]);
            view.spinTarget += step[1];
            updateResetButton();
            wake();
        }

        if (event.key === "+" || event.key === "=") zoomAround(view.zoomTarget * 1.15, W / 2, H / 2);
        if (event.key === "-") zoomAround(view.zoomTarget / 1.15, W / 2, H / 2);

        if (event.key === "Escape") clearSelection();

    });

    /* ---------- キーボード・読み上げ用の一覧 ---------- */

    document.querySelectorAll("#world-index button").forEach((btn) => {
        btn.addEventListener("click", () => toggleWorld(btn.dataset.world));
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

    panelClose?.addEventListener("click", clearSelection);

    /* ---------- 調律が変わったとき ---------- */

    window.addEventListener("ryu-tuning", (event) => {

        const { key, value } = event.detail;

        if (key === "motion") {
            reduceMotion = value === "off";
            if (reduceMotion) autoSpin = false;
        }

        if (key === "view") {
            flatMode = value === "flat";
            view.flatTarget = flatMode ? 1 : 0;
            view.tiltTarget = restTilt();
            // 平面は北を上に固定する（回さない）
            if (flatMode) view.spinTarget = Math.round(view.spinTarget / 360) * 360;
            stopAuto();
            updateHint();
            updateResetButton();
        }

        lastDraw = -Infinity;
        wake();

    });

    // 別のタブに移っている間は描かない（電池の節約）
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            lastTime = performance.now();
            wake();
        }
    });

    // 確認用（開発時のみ使う）
    window.__worldMap = { view, hitTest: (x, y) => hitTest(x, y, 26), selectWorld, get lite() { return lite; } };

});