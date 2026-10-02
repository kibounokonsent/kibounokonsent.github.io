/* =========================================================
   龍の世界 / 悠久の楽園 ― 軽量プレイヤー
   =========================================================

   元はScratchで作られた「悠久の楽園」を、見た目を変えずに
   軽く再生するための専用プレイヤー。

   ・Scratch本体（数MBのエンジン）は使わず、このプロジェクトで
     使われているブロックだけを解釈する小さな実行器を持つ
   ・描画は WebGL。明るさ・幽霊・渦巻き・魚眼・ピクセル化の効果は
     Scratch と同じ計算式で再現する
   ・画像は SVG（約50MB）を、必要な解像度の WebP（約4MB）に変換済み
   ・Scratch と同じく 1秒30回 の速さで動く

   使い方：
     const player = new EdenPlayer(canvas, EDEN_PROJECT, "assets/");
     await player.load();
     player.start();
   ========================================================= */

(function () {

    "use strict";

    const STAGE_W = 480;
    const STAGE_H = 360;
    const FPS = 30;

    /* ---------------------------------------------------------
       Scratch の値の扱い（数値・文字列・真偽の変換）
       --------------------------------------------------------- */

    function num(v) {
        if (typeof v === "number") return isNaN(v) ? 0 : v;
        const n = Number(v);
        if (typeof v === "string" && v.trim() === "") return 0;
        return isNaN(n) ? 0 : n;
    }

    function str(v) {
        return String(v);
    }

    function bool(v) {
        if (typeof v === "boolean") return v;
        if (typeof v === "number") return v !== 0 && !isNaN(v);
        const s = String(v).toLowerCase();
        return !(s === "" || s === "0" || s === "false");
    }

    function compare(a, b) {
        const na = Number(a);
        const nb = Number(b);
        const blankA = typeof a === "string" && a.trim() === "";
        const blankB = typeof b === "string" && b.trim() === "";
        if (isNaN(na) || isNaN(nb) || blankA || blankB) {
            const sa = String(a).toLowerCase();
            const sb = String(b).toLowerCase();
            return sa < sb ? -1 : sa > sb ? 1 : 0;
        }
        return na - nb;
    }

    function isInt(v) {
        if (typeof v === "number") return Number.isInteger(v);
        return typeof v === "string" && /^-?\d+$/.test(v.trim());
    }

    const round10 = (x) => parseFloat(x.toFixed(10));

    function wrapDirection(d) {
        d = d % 360;
        if (d > 180) d -= 360;
        if (d <= -180) d += 360;
        return d;
    }

    const EFFECT_LIMITS = {
        ghost: [0, 100],
        brightness: [-100, 100]
    };

    function clampEffect(name, v) {
        const lim = EFFECT_LIMITS[name];
        return lim ? Math.min(lim[1], Math.max(lim[0], v)) : v;
    }


    /* ---------------------------------------------------------
       WebGL：Scratch の sprite.frag と同じ効果のシェーダー
       --------------------------------------------------------- */

    const VERT = `
        attribute vec2 a_pos;
        attribute vec2 a_uv;
        uniform mat3 u_matrix;
        varying vec2 v_uv;
        void main() {
            vec3 p = u_matrix * vec3(a_pos, 1.0);
            gl_Position = vec4(p.xy, 0.0, 1.0);
            v_uv = a_uv;
        }`;

    const FRAG = `
        precision mediump float;
        uniform sampler2D u_tex;
        uniform vec2 u_skinSize;
        uniform float u_pixelate;
        uniform float u_whirl;
        uniform float u_fisheye;
        uniform float u_useFisheye;
        uniform float u_brightness;
        uniform float u_ghost;
        varying vec2 v_uv;
        const vec2 kCenter = vec2(0.5, 0.5);
        void main() {
            vec2 uv = v_uv;
            if (u_pixelate > 0.0) {
                vec2 texelSize = u_skinSize / u_pixelate;
                uv = (floor(uv * texelSize) + kCenter) / texelSize;
            }
            if (u_whirl != 0.0) {
                const float kRadius = 0.5;
                vec2 offset = uv - kCenter;
                float mag = length(offset);
                float factor = max(1.0 - (mag / kRadius), 0.0);
                float actual = u_whirl * factor * factor;
                float s = sin(actual);
                float c = cos(actual);
                uv = mat2(c, -s, s, c) * offset + kCenter;
            }
            if (u_useFisheye > 0.5) {
                vec2 v = (uv - kCenter) / kCenter;
                float len = length(v);
                float r = pow(min(len, 1.0), u_fisheye) * max(1.0, len);
                vec2 unit = len > 0.0 ? v / len : vec2(0.0);
                uv = kCenter + r * unit * kCenter;
            }
            vec4 col = texture2D(u_tex, uv);
            if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
                col = vec4(0.0);
            }
            if (u_brightness != 0.0) {
                col.rgb /= col.a + 0.0001;
                col.rgb = clamp(col.rgb + vec3(u_brightness), vec3(0.0), vec3(1.0));
                col.rgb *= col.a;
            }
            gl_FragColor = col * u_ghost;
        }`;


    /* =========================================================
       プレイヤー本体
       ========================================================= */

    class EdenPlayer {

        constructor(canvas, project, assetBase) {

            this.canvas = canvas;
            this.project = project;
            this.base = assetBase;

            this.mouse = { x: 0, y: 0 };      // ステージ座標（Scratchと同じ）
            this.targets = [];                // 描画順（奥→手前）。0番はステージ
            this.threads = [];
            this.timerStart = 0;
            this.running = false;

            this.sounds = {};                 // 名前 → 再生ハンドラ
            this.onBroadcast = null;          // 外部から「来たらん」を知るため

            /* 外部から加える効果（龍が見てくる演出などで使う） */
            this.extra = {
                gaze: { x: 0, y: 0 },         // 龍の視線（ステージ座標のずれ）
                gazeTargets: new Set(),       // 視線に合わせて動く層の名前
                tone: 0                        // 画面全体の明るさの上乗せ
            };

        }


        /* ---------- 読み込み ---------- */

        async load(onProgress) {

            const gl = this.canvas.getContext("webgl", {
                premultipliedAlpha: true,
                alpha: false,
                antialias: false
            });

            if (!gl) {
                throw new Error("WebGL が使えません");
            }

            this.gl = gl;
            this.initGL();

            const files = new Set();
            this.project.targets.forEach((t) =>
                t.costumes.forEach((c) => files.add(c.file))
            );

            this.textures = {};
            let done = 0;

            /*
             * ローカル（file://）で開くと、ブラウザの制限で画像をWebGLに
             * 渡せない。そのときは画像を埋め込んだ images.js を読み込んで使う。
             */
            const useEmbedded = location.protocol === "file:";

            if (useEmbedded && !window.EDEN_IMAGES) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement("script");
                    s.src = this.base + "images.js";
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }

            await Promise.all([...files].map(async (file) => {

                const img = new Image();
                img.decoding = "async";
                img.src = useEmbedded ? window.EDEN_IMAGES[file] : this.base + file;
                await img.decode();

                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

                this.textures[file] = tex;

                done++;
                if (onProgress) onProgress(done / files.size);

            }));

            this.buildTargets();

        }

        initGL() {

            const gl = this.gl;

            const compile = (type, src) => {
                const s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    throw new Error(gl.getShaderInfoLog(s));
                }
                return s;
            };

            const prog = gl.createProgram();
            gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
            gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
            gl.linkProgram(prog);
            gl.useProgram(prog);

            this.prog = prog;
            this.loc = {};
            ["u_matrix", "u_tex", "u_skinSize", "u_pixelate", "u_whirl",
                "u_fisheye", "u_useFisheye", "u_brightness", "u_ghost"].forEach((n) => {
                this.loc[n] = gl.getUniformLocation(prog, n);
            });

            // 1枚の四角形（位置は0〜1。行列で各スプライトに合わせる）
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0, 0, 0, 0,  1, 0, 1, 0,  0, 1, 0, 1,
                0, 1, 0, 1,  1, 0, 1, 0,  1, 1, 1, 1
            ]), gl.STATIC_DRAW);

            const aPos = gl.getAttribLocation(prog, "a_pos");
            const aUv = gl.getAttribLocation(prog, "a_uv");
            gl.enableVertexAttribArray(aPos);
            gl.enableVertexAttribArray(aUv);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
            gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.uniform1i(this.loc.u_tex, 0);

        }


        /* ---------- スプライトの準備 ---------- */

        buildTargets() {

            const defs = this.project.targets;
            const stageDef = defs.find((t) => t.stage);

            // 変数：ステージ（共通）とスプライトごと
            this.globals = {};
            Object.entries(stageDef.vars).forEach(([id, v]) => {
                this.globals[id] = { name: v[0], value: v[1] };
            });

            const sprites = defs
                .filter((t) => !t.stage)
                .sort((a, b) => a.layer - b.layer);

            this.stage = this.makeTarget(stageDef, null);
            this.targets = [this.stage, ...sprites.map((d) => this.makeTarget(d, null))];

        }

        makeTarget(def, parent) {

            const t = {
                def,
                isStage: def.stage,
                isClone: Boolean(parent),
                x: parent ? parent.x : def.x,
                y: parent ? parent.y : def.y,
                dir: parent ? parent.dir : def.dir,
                size: parent ? parent.size : def.size,
                visible: parent ? parent.visible : def.visible,
                costume: parent ? parent.costume : def.costume,
                effects: parent ? { ...parent.effects } : {},
                vars: {}
            };

            if (!def.stage) {
                Object.entries(def.vars).forEach(([id, v]) => {
                    t.vars[id] = {
                        name: v[0],
                        value: parent ? parent.vars[id].value : v[1]
                    };
                });
            }

            return t;

        }


        /* ---------- 実行の開始 ---------- */

        start() {

            this.timerStart = performance.now();
            this.running = true;
            this.frameTime = 1000 / FPS;
            this.lastStep = performance.now();

            // 緑の旗
            this.targets.forEach((t) => this.startHats(t, "event_whenflagclicked"));

            const loop = (now) => {

                if (!this.running) return;

                // Scratchと同じく1秒30回だけ進める（画面の更新もそれに合わせる）
                if (now - this.lastStep >= this.frameTime - 1) {
                    this.lastStep = now;
                    this.step();
                    this.render();
                }

                requestAnimationFrame(loop);

            };

            requestAnimationFrame(loop);

        }

        stop() {
            this.running = false;
        }

        hats(t, opcode, broadcastName) {

            const out = [];

            Object.entries(t.def.blocks).forEach(([id, b]) => {
                if (!b.top || b.o !== opcode) return;
                if (broadcastName != null && b.f.BROADCAST_OPTION !== broadcastName) return;
                out.push(id);
            });

            return out;

        }

        startHats(t, opcode, broadcastName) {

            this.hats(t, opcode, broadcastName).forEach((hatId) => {

                // 同じ帽子ブロックのスクリプトが動いていれば、やり直す
                this.threads.forEach((th) => {
                    if (th.target === t && th.hat === hatId) th.done = true;
                });

                const next = t.def.blocks[hatId].n;

                if (next) {
                    this.threads.push({
                        target: t,
                        hat: hatId,
                        gen: this.runStack(next, t),
                        done: false
                    });
                }

            });

        }

        broadcast(name) {

            if (this.onBroadcast) this.onBroadcast(name);

            [...this.targets].forEach((t) =>
                this.startHats(t, "event_whenbroadcastreceived", name)
            );

        }

        step() {

            // 実行中に増えたスレッドも、同じフレームの中で動かす
            for (let i = 0; i < this.threads.length; i++) {

                const th = this.threads[i];

                if (th.done || th.target.deleted) {
                    th.done = true;
                    continue;
                }

                const r = th.gen.next();

                if (r.done) th.done = true;

            }

            this.threads = this.threads.filter((th) => !th.done);

        }


        /* ---------- 値の取り出し ---------- */

        input(b, name, t) {

            const inp = b.i && b.i[name];

            if (!inp) return "";

            let v = inp[1];

            if (v === null && inp.length > 2) v = inp[2];

            if (typeof v === "string") {
                return this.evaluate(v, t);
            }

            if (Array.isArray(v)) {

                if (v[0] === 12) return this.lookupVar(t, v[2], v[1]).value;

                return v[1];

            }

            return "";

        }

        lookupVar(t, id, name) {

            if (t.vars[id]) return t.vars[id];
            if (this.globals[id]) return this.globals[id];

            // 名前で探す（念のため）
            const byName = Object.values(t.vars).find((v) => v.name === name) ||
                Object.values(this.globals).find((v) => v.name === name);

            if (byName) return byName;

            const created = { name, value: 0 };
            this.globals[id] = created;
            return created;

        }

        field(b, name) {
            return b.f ? b.f[name] : undefined;
        }

        evaluate(id, t) {

            const b = t.def.blocks[id];

            if (!b) return "";

            switch (b.o) {

                case "operator_add": return num(this.input(b, "NUM1", t)) + num(this.input(b, "NUM2", t));
                case "operator_subtract": return num(this.input(b, "NUM1", t)) - num(this.input(b, "NUM2", t));
                case "operator_multiply": return num(this.input(b, "NUM1", t)) * num(this.input(b, "NUM2", t));
                case "operator_divide": return num(this.input(b, "NUM1", t)) / num(this.input(b, "NUM2", t));

                case "operator_random": {
                    const a = this.input(b, "FROM", t);
                    const c = this.input(b, "TO", t);
                    let lo = num(a), hi = num(c);
                    if (lo > hi) [lo, hi] = [hi, lo];
                    if (isInt(a) && isInt(c)) {
                        return lo + Math.floor(Math.random() * (hi - lo + 1));
                    }
                    return lo + Math.random() * (hi - lo);
                }

                case "operator_mathop": {
                    const n = num(this.input(b, "NUM", t));
                    switch (this.field(b, "OPERATOR")) {
                        case "abs": return Math.abs(n);
                        case "sin": return round10(Math.sin((Math.PI * n) / 180));
                        case "cos": return round10(Math.cos((Math.PI * n) / 180));
                        case "sqrt": return Math.sqrt(n);
                        case "floor": return Math.floor(n);
                        case "ceiling": return Math.ceil(n);
                        case "round": return Math.round(n);
                        default: return 0;
                    }
                }

                case "operator_join": return str(this.input(b, "STRING1", t)) + str(this.input(b, "STRING2", t));
                case "operator_contains":
                    return str(this.input(b, "STRING1", t)).toLowerCase()
                        .includes(str(this.input(b, "STRING2", t)).toLowerCase());
                case "operator_equals": return compare(this.input(b, "OPERAND1", t), this.input(b, "OPERAND2", t)) === 0;
                case "operator_lt": return compare(this.input(b, "OPERAND1", t), this.input(b, "OPERAND2", t)) < 0;
                case "operator_gt": return compare(this.input(b, "OPERAND1", t), this.input(b, "OPERAND2", t)) > 0;
                case "operator_not": return !bool(this.input(b, "OPERAND", t));
                case "operator_and": return bool(this.input(b, "OPERAND1", t)) && bool(this.input(b, "OPERAND2", t));
                case "operator_or": return bool(this.input(b, "OPERAND1", t)) || bool(this.input(b, "OPERAND2", t));

                case "sensing_mousex": return this.mouse.x;
                case "sensing_mousey": return this.mouse.y;
                case "sensing_timer": return (performance.now() - this.timerStart) / 1000;

                case "looks_costume": return this.field(b, "COSTUME");
                case "motion_goto_menu": return this.field(b, "TO");
                case "control_create_clone_of_menu": return this.field(b, "CLONE_OPTION");
                case "sound_sounds_menu": return this.field(b, "SOUND_MENU");

                default: return "";

            }

        }


        /* ---------- 命令の実行（ジェネレーターで、1フレームずつ進む） ---------- */

        *runStack(id, t) {

            while (id) {

                if (t.deleted) return;

                const b = t.def.blocks[id];

                if (!b) return;

                const stop = yield* this.exec(b, t);

                if (stop === "stop") return "stop";

                id = b.n;

            }

        }

        substack(b, name) {
            const inp = b.i && b.i[name];
            return inp ? inp[1] : null;
        }

        *exec(b, t) {

            switch (b.o) {

                /* ----- 制御 ----- */

                case "control_forever": {
                    const sub = this.substack(b, "SUBSTACK");
                    for (;;) {
                        if (sub) {
                            if ((yield* this.runStack(sub, t)) === "stop") return "stop";
                        }
                        yield;
                    }
                }

                case "control_repeat": {
                    const n = Math.round(num(this.input(b, "TIMES", t)));
                    const sub = this.substack(b, "SUBSTACK");
                    for (let i = 0; i < n; i++) {
                        if (sub) {
                            if ((yield* this.runStack(sub, t)) === "stop") return "stop";
                        }
                        yield;
                    }
                    return;
                }

                case "control_repeat_until": {
                    const sub = this.substack(b, "SUBSTACK");
                    while (!bool(this.input(b, "CONDITION", t))) {
                        if (sub) {
                            if ((yield* this.runStack(sub, t)) === "stop") return "stop";
                        }
                        yield;
                    }
                    return;
                }

                case "control_if": {
                    if (bool(this.input(b, "CONDITION", t))) {
                        const sub = this.substack(b, "SUBSTACK");
                        if (sub) return yield* this.runStack(sub, t);
                    }
                    return;
                }

                case "control_if_else": {
                    const sub = bool(this.input(b, "CONDITION", t))
                        ? this.substack(b, "SUBSTACK")
                        : this.substack(b, "SUBSTACK2");
                    if (sub) return yield* this.runStack(sub, t);
                    return;
                }

                case "control_wait": {
                    const ms = Math.max(0, num(this.input(b, "DURATION", t))) * 1000;
                    const start = performance.now();
                    yield;
                    while (performance.now() - start < ms) yield;
                    return;
                }

                case "control_create_clone_of": {
                    const opt = this.input(b, "CLONE_OPTION", t);
                    let src = t;
                    if (opt !== "_myself_") {
                        src = this.targets.find((x) => !x.isClone && x.def.name === opt);
                    }
                    if (src && !src.isStage) this.makeClone(src);
                    return;
                }

                case "control_delete_this_clone": {
                    if (t.isClone) {
                        t.deleted = true;
                        this.targets = this.targets.filter((x) => x !== t);
                        return "stop";
                    }
                    return;
                }

                case "event_broadcast":
                    this.broadcast(str(this.input(b, "BROADCAST_INPUT", t)));
                    return;

                /* ----- 動き ----- */

                case "motion_gotoxy":
                    t.x = num(this.input(b, "X", t));
                    t.y = num(this.input(b, "Y", t));
                    return;

                case "motion_changeyby":
                    t.y += num(this.input(b, "DY", t));
                    return;

                case "motion_changexby":
                    t.x += num(this.input(b, "DX", t));
                    return;

                case "motion_movesteps": {
                    const s = num(this.input(b, "STEPS", t));
                    const r = (Math.PI * (90 - t.dir)) / 180;
                    t.x += s * Math.cos(r);
                    t.y += s * Math.sin(r);
                    return;
                }

                case "motion_goto": {
                    const to = this.input(b, "TO", t);
                    if (to === "_random_") {
                        t.x = Math.round(STAGE_W * (Math.random() - 0.5));
                        t.y = Math.round(STAGE_H * (Math.random() - 0.5));
                    } else if (to === "_mouse_") {
                        t.x = this.mouse.x;
                        t.y = this.mouse.y;
                    }
                    return;
                }

                case "motion_pointindirection":
                    t.dir = wrapDirection(num(this.input(b, "DIRECTION", t)));
                    return;

                case "motion_turnright":
                    t.dir = wrapDirection(t.dir + num(this.input(b, "DEGREES", t)));
                    return;

                case "motion_turnleft":
                    t.dir = wrapDirection(t.dir - num(this.input(b, "DEGREES", t)));
                    return;

                /* ----- 見た目 ----- */

                case "looks_seteffectto": {
                    const e = String(this.field(b, "EFFECT")).toLowerCase();
                    t.effects[e] = clampEffect(e, num(this.input(b, "VALUE", t)));
                    return;
                }

                case "looks_changeeffectby": {
                    const e = String(this.field(b, "EFFECT")).toLowerCase();
                    t.effects[e] = clampEffect(e, (t.effects[e] || 0) + num(this.input(b, "CHANGE", t)));
                    return;
                }

                case "looks_cleargraphiceffects":
                    t.effects = {};
                    return;

                case "looks_show": t.visible = true; return;
                case "looks_hide": t.visible = false; return;

                case "looks_setsizeto":
                    t.size = num(this.input(b, "SIZE", t));
                    return;

                case "looks_changesizeby":
                    t.size += num(this.input(b, "CHANGE", t));
                    return;

                case "looks_switchcostumeto": {
                    const v = this.input(b, "COSTUME", t);
                    const list = t.def.costumes;
                    const idx = list.findIndex((c) => c.name === v);
                    if (idx >= 0) {
                        t.costume = idx;
                    } else if (!isNaN(Number(v)) && String(v).trim() !== "") {
                        const n = Math.round(Number(v)) - 1;
                        t.costume = ((n % list.length) + list.length) % list.length;
                    }
                    return;
                }

                case "looks_nextcostume":
                    t.costume = (t.costume + 1) % t.def.costumes.length;
                    return;

                case "looks_gotofrontback": {
                    if (t.isStage) return;
                    this.targets = this.targets.filter((x) => x !== t);
                    if (this.field(b, "FRONT_BACK") === "front") {
                        this.targets.push(t);
                    } else {
                        this.targets.splice(1, 0, t);
                    }
                    return;
                }

                /* ----- 変数 ----- */

                case "data_setvariableto": {
                    const v = this.lookupVar(t, b.vid, b.f.VARIABLE);
                    v.value = this.input(b, "VALUE", t);
                    return;
                }

                case "data_changevariableby": {
                    const v = this.lookupVar(t, b.vid, b.f.VARIABLE);
                    v.value = num(v.value) + num(this.input(b, "VALUE", t));
                    return;
                }

                /* ----- 音 ----- */

                case "sound_playuntildone": {
                    const name = str(this.input(b, "SOUND_MENU", t));
                    const handler = this.sounds[name];
                    if (!handler) { yield; return; }
                    const until = handler(t);
                    yield;
                    while (until && !until()) yield;
                    return;
                }

                case "sound_play": {
                    const handler = this.sounds[str(this.input(b, "SOUND_MENU", t))];
                    if (handler) handler(t);
                    return;
                }

                // 音の左右の揺れ（PAN）は、曲にあらかじめ焼き込み済み
                case "sound_changeeffectby":
                case "sound_seteffectto":
                    return;

                default:
                    return;

            }

        }

        makeClone(src) {

            const clone = this.makeTarget(src.def, src);
            clone.isClone = true;

            // Scratchと同じく、元のスプライトのすぐ後ろに置く
            const idx = this.targets.indexOf(src);
            this.targets.splice(Math.max(1, idx), 0, clone);

            this.startHats(clone, "control_start_as_clone");

        }


        /* ---------- 描画 ---------- */

        resize(cssW, cssH, dpr) {

            /*
             * 60枚近い層を重ねて描くため、描く画素の数がそのまま重さになる。
             * 絵は柔らかい筆致なので、内部の解像度に上限を設けても見た目は
             * ほとんど変わらない（表示はCSSで画面いっぱいに引き伸ばす）。
             */
            const MAX_PIXELS = 1280 * 900;
            let k = Math.min(dpr, 1.5);
            if (cssW * cssH * k * k > MAX_PIXELS) {
                k = Math.sqrt(MAX_PIXELS / (cssW * cssH));
            }

            const w = Math.max(1, Math.round(cssW * k));
            const h = Math.max(1, Math.round(cssH * k));

            this.canvas.width = w;
            this.canvas.height = h;

            // ステージ全体が必ず見え、余った方向には絵の続きを見せる
            const scale = Math.min(w / STAGE_W, h / STAGE_H);

            this.view = { w: w / scale, h: h / scale };
            this.gl.viewport(0, 0, w, h);

        }

        render() {

            const gl = this.gl;

            if (!this.view) return;

            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const sx = 2 / this.view.w;
            const sy = 2 / this.view.h;

            this.targets.forEach((t) => {

                if (!t.isStage && !t.visible) return;

                // 完全に透明な層は、描いても見えないので描かない（負荷の節約）
                if ((t.effects.ghost || 0) >= 100) return;

                const c = t.def.costumes[t.costume];

                if (!c) return;

                const tex = this.textures[c.file];

                // 外部からの「視線」：指定された層だけ、わずかにずらす
                let ox = 0, oy = 0;
                if (this.extra.gazeTargets.has(t.def.name)) {
                    ox = this.extra.gaze.x;
                    oy = this.extra.gaze.y;
                }

                const scale = t.isStage ? 1 : t.size / 100;
                const rot = t.isStage ? 0 : (Math.PI * (90 - t.dir)) / 180;
                const cos = Math.cos(rot), sin = Math.sin(rot);

                // 四角形(0..1) → コスチューム座標（回転中心が原点、y上向き）
                const w = c.w * scale;
                const h = c.h * scale;
                const ax = -c.rx * scale;
                const ay = c.ry * scale;

                // local = (ax + u*w, ay - v*h) を回転→平行移動→画面へ
                const px = (t.isStage ? 0 : t.x) + ox;
                const py = (t.isStage ? 0 : t.y) + oy;

                const m00 = cos * w, m01 = sin * w;           // u 方向
                const m10 = sin * h, m11 = -cos * h;          // v 方向（下向き）
                const tx = cos * ax - sin * ay + px;
                const ty = sin * ax + cos * ay + py;

                // 列優先の mat3（clip = M * [u, v, 1]）
                gl.uniformMatrix3fv(this.loc.u_matrix, false, new Float32Array([
                    m00 * sx, m01 * sy, 0,
                    m10 * sx, m11 * sy, 0,
                    tx * sx, ty * sy, 1
                ]));

                const e = t.effects;
                const bright = clampEffect("brightness", (e.brightness || 0)) / 100 + this.extra.tone;

                gl.uniform2f(this.loc.u_skinSize, c.w, c.h);
                gl.uniform1f(this.loc.u_pixelate, Math.abs(e.pixelate || 0) / 10);
                gl.uniform1f(this.loc.u_whirl, (-(e.whirl || 0) * Math.PI) / 180);
                gl.uniform1f(this.loc.u_useFisheye, e.fisheye ? 1 : 0);
                gl.uniform1f(this.loc.u_fisheye, Math.max(0, ((e.fisheye || 0) + 100) / 100));
                gl.uniform1f(this.loc.u_brightness, Math.max(-1, Math.min(1, bright)));
                gl.uniform1f(this.loc.u_ghost, 1 - clampEffect("ghost", e.ghost || 0) / 100);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.drawArrays(gl.TRIANGLES, 0, 6);

            });

        }


        /* ---------- ステージ座標 → 画面上の割合（0〜1） ---------- */

        stageToUnit(x, y) {
            if (!this.view) return { x: 0.5, y: 0.5 };
            return {
                x: 0.5 + x / this.view.w,
                y: 0.5 - y / this.view.h
            };
        }


        /* ---------- マウス（画面座標 → ステージ座標） ---------- */

        setMouseFromClient(clientX, clientY, rect) {

            if (!this.view) return;

            const x = ((clientX - rect.left) / rect.width - 0.5) * this.view.w;
            const y = (0.5 - (clientY - rect.top) / rect.height) * this.view.h;

            // Scratch と同じく、ステージの範囲に収めて整数にする
            this.mouse.x = Math.round(Math.max(-STAGE_W / 2, Math.min(STAGE_W / 2, x)));
            this.mouse.y = Math.round(Math.max(-STAGE_H / 2, Math.min(STAGE_H / 2, y)));

        }

    }

    window.EdenPlayer = EdenPlayer;

})();
