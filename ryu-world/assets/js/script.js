/* =========================================================
   龍の世界
   Creation / Script
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
     * ------------------------------------------------------
     * 要素取得
     * ------------------------------------------------------
     */

    const globalDragon = document.getElementById("global-dragon");
    const ambientLight = document.getElementById("ambient-light");

    const lightTear = document.getElementById("light-tear");

    const worldEntry = document.getElementById("world-entry");

    const chapterThree = document.getElementById("chapter-three");
    const chapterFour = document.getElementById("chapter-four");

    const crackTrigger = document.getElementById("crack-trigger");
    const crackLayer = document.getElementById("chapter-three-crack");

    const riverKeys = ["life", "knowledge", "creation", "soul"];

    const worldBirthTrigger = document.getElementById(
        "world-birth-trigger"
    );
    const worldSparks = document.getElementById("world-sparks");


    /*
     * ------------------------------------------------------
     * 龍：不透明度はスクロール位置から常時制御される
     * （updateCreationByScroll() 参照）
     * ------------------------------------------------------
     */


    /*
     * ------------------------------------------------------
     * 汎用ヘルパー
     * ------------------------------------------------------
     *
     * 「特定の一文が画面に現れたら、一度だけ何かする」
     * という一発トリガーを簡潔に書くための共通処理。
     * ------------------------------------------------------
     */

    /*
     * シーン（画面に留める重要場面）の中の文は常に画面内にあるため、
     * IntersectionObserverではなく「その文の番が来た瞬間」に発火する。
     * 速くスクロールして同時に複数の番が来た場合も、
     * 演出が重ならないよう少しずつ間隔を空けて順番に再生する。
     */

    const sceneTriggers = new Map(); // 文の要素 → callback

    const EFFECT_GAP = 280; // ms
    let effectQueueFreeAt = 0;

    function runQueued(callback) {

        const now = performance.now();
        const at = Math.max(now, effectQueueFreeAt);

        effectQueueFreeAt = at + EFFECT_GAP;

        window.setTimeout(callback, at - now);

    }

    function onLineVisible(id, callback, threshold = 0.6) {

        const el = document.getElementById(id);

        if (!el) {
            return;
        }

        if (el.closest(".scene")) {
            sceneTriggers.set(el, callback);
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    callback();

                    obs.unobserve(entry.target);

                });

            },
            {
                threshold
            }
        );

        observer.observe(el);

    }

    function pulseClass(el, className, duration) {

        if (!el) {
            return;
        }

        el.classList.add(className);

        window.setTimeout(() => {
            el.classList.remove(className);
        }, duration);

    }

    /*
     * 世界の明度・龍の再浮上・川の光は、
     * すべてスクロール位置から毎フレーム算出される
     * 絶対値として扱う（updateCreationByScroll()が呼ぶ）。
     */

    /*
     * 【軽量化】
     * 以前はbodyのCSS変数を書き換えていたが、それだと
     * ページ内の全要素のスタイル再計算と大きな面の再描画が
     * 毎フレーム起き、速いスクロールでカクついていた。
     * 今は各レイヤーのopacityだけを直接書く（GPU合成のみ）。
     * 値が前回と同じなら書き込み自体を省く。
     */

    const lastWritten = new Map();

    function writeStyle(el, prop, value) {

        if (!el) {
            return;
        }

        const key = el;
        let cache = lastWritten.get(key);

        if (!cache) {
            cache = {};
            lastWritten.set(key, cache);
        }

        if (cache[prop] === value) {
            return;
        }

        cache[prop] = value;

        if (prop.startsWith("--")) {
            el.style.setProperty(prop, value);
        } else {
            el.style[prop] = value;
        }

    }

    const worldToneEl = document.getElementById("world-tone");
    const creationDark = document.getElementById("creation-dark");

    /* 龍の画像そのものの基準opacity（CSSの #global-dragon img と一致） */
    const DRAGON_IMG_BASE = 0.55;

    function setWorldTone(value) {
        writeStyle(worldToneEl, "opacity", value.toFixed(3));
        // 世界が明るくなるほど闇が薄れる
        writeStyle(
            creationDark, "opacity", (1 - value * 0.55).toFixed(3)
        );
    }

    function setDragonReveal(value) {
        writeStyle(
            globalDragon,
            "opacity",
            Math.min(1, value / DRAGON_IMG_BASE).toFixed(4)
        );
    }

    const glowWashEls = {};

    document.querySelectorAll(".glow-wash").forEach((el) => {
        glowWashEls[el.dataset.river] = el;
    });

    function litRiverGlow(key, value) {
        writeStyle(glowWashEls[key], "opacity", value.toFixed(3));
    }


    /*
     * ------------------------------------------------------
     * 第一章：龍しか存在しない時代の、ごく僅かな変化
     * ------------------------------------------------------
     */

    onLineVisible("line-light", () => {
        pulseClass(ambientLight, "is-pulse", 2400);
        pulseClass(globalDragon, "is-pulsing", 2000);
    });

    onLineVisible("line-dark", () => {
        // 光が沈み、龍の存在感も再び曖昧に戻る（特別な処理は不要）
    });

    onLineVisible("line-god", () => {
        pulseClass(globalDragon, "is-pulsing", 2600);
    });

    onLineVisible("line-infinite", () => {
        pulseClass(ambientLight, "is-pulse", 3000);
    });


    /*
     * ------------------------------------------------------
     * 第二章：楽園 ― 中心であり、同時に外側でもある
     * ------------------------------------------------------
     */

    onLineVisible("line-center", () => {
        pulseClass(ambientLight, "is-pulse", 3000);
    });

    onLineVisible("line-outside", () => {
        ambientLight?.classList.add("is-wide");
        pulseClass(ambientLight, "is-pulse-strong", 3600);
    });

    onLineVisible("line-timeless", () => {
        // 「そこに時は流れず。」：一瞬、龍の浮遊をほぼ止める
        pulseClass(globalDragon, "is-paused", 2800);
    });

    onLineVisible("line-sleep", () => {
        // 龍と楽園を重ねる：龍の存在感をわずかに強める
        pulseClass(globalDragon, "is-pulsing", 3200);
    });


    /*
     * ------------------------------------------------------
     * スクロールによる章の出現（既存の仕組みを維持）
     * ------------------------------------------------------
     */

    /*
     * 以前は章(section)全体に is-visible を付けていたが、
     * 対応するCSSが無く何も起きていなかった。また第三・四章は
     * シーン化で縦に長くなり「章の18%が見えたら」が成立しなくなった。
     * そこで章タイトルと（シーン外の）一文ずつを個別に観察し、
     * 読む位置に来たものから静かに浮かび上がらせる。
     * JSが動かない環境では隠さない（has-revealクラスで保護）。
     */

    const revealTargets = document.querySelectorAll(
        ".creation-section > .chapter-title, " +
        ".creation-section > .chapter-text > p, " +
        "#world-entry .entry-text"
    );

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.3,
            rootMargin: "0px 0px -12% 0px"
        }
    );

    revealTargets.forEach((el) => {
        el.classList.add("reveal");
        revealObserver.observe(el);
    });

    document.documentElement.classList.add("has-reveal");


    /*
     * ------------------------------------------------------
     * 「世界は幾度も砕かれた」： 一瞬の画面のずれ
     * ------------------------------------------------------
     *
     * 専用画像は使わず、CSSアニメーションを一度だけ再生する。
     * ------------------------------------------------------
     */

    onLineVisible("crack-trigger", () => {

        // 持続していた不安定さをここで最大化し、断ち切る
        chapterThree?.classList.remove("is-unstable");

        crackLayer?.classList.add("is-cracking");
        window.RyuTuning?.cue("shatter");
        chapterThree?.classList.add("is-shattering");

        window.setTimeout(() => {
            chapterThree?.classList.remove("is-shattering");
        }, 1500);

    });


    /*
     * ------------------------------------------------------
     * 第三章：龍しか知らなかった世界に、初めて異変が起こる
     * ------------------------------------------------------
     */

    const chapterThreeText = chapterThree
        ? chapterThree.querySelector(".scene-lines")
        : null;

    const battleStage = chapterThree
        ? chapterThree.querySelector(".scene-stage")
        : null;

    onLineVisible("line-boundless", () => {
        pulseClass(ambientLight, "is-pulse", 3200);
    });

    onLineVisible("line-wander", () => {
        pulseClass(ambientLight, "is-pulse", 3600);
    });

    onLineVisible("line-conflict", () => {
        pulseClass(chapterThreeText, "is-trembling", 700);
        window.RyuTuning?.cue("tremble");
        // ここから「世界が砕かれた」までの間、光と闇が押し合い続ける
        chapterThree?.classList.add("is-unstable");
    });

    onLineVisible("line-fought", () => {
        pulseClass(globalDragon, "is-pulsing-strong", 1400);
        pulseClass(globalDragon, "is-crossing", 3600);
        window.RyuTuning?.cue("fought");
    });

    onLineVisible("line-light-tear", () => {

        window.RyuTuning?.cue("tear");

        // 一本だけでなく、時間差で複数の裂け目を走らせる
        const tearSpecs = [
            { top: "40%", rotate: -6, delay: 0 },
            { top: "58%", rotate: 4, delay: 180 },
            { top: "24%", rotate: -2, delay: 340 }
        ];

        tearSpecs.forEach((spec, index) => {

            window.setTimeout(() => {

                let el = lightTear;

                if (index > 0 && battleStage) {

                    el = document.createElement("div");
                    el.className = "light-tear";
                    el.setAttribute("aria-hidden", "true");
                    battleStage.appendChild(el);

                }

                if (!el) {
                    return;
                }

                el.style.top = spec.top;
                el.style.transform =
                    `translateY(0) rotate(${spec.rotate}deg) scaleX(0)`;

                pulseClass(el, "is-tearing", 1200);

                if (index > 0) {
                    window.setTimeout(() => {
                        el.remove();
                    }, 1400);
                }

            }, spec.delay);

        });

    });

    onLineVisible("line-dark-burn", () => {

        window.RyuTuning?.cue("smolder");
        pulseClass(chapterThree, "is-smoldering", 1900);
    });


    /*
     * ------------------------------------------------------
     * 四つの流れ：無 → 発生 → 形成 → 呼吸する流動 → 命名
     * ------------------------------------------------------
     *
     * 4本が同じタイミング・同じ速さで揃わないよう、
     * 川ごとに小さなランダムのずれを持たせる。
     * ------------------------------------------------------
     */

    function getRiverGroup(key) {

        return document.querySelector(
            `.river-group[data-river="${key}"]`
        );

    }

    /*
     * 段階①：無 → 発生
     * 「龍は四つの流れと三枚の羽根を残した。」で、
     * 4本それぞれがほんの少しだけ時間差で
     * 一瞬だけ光って消える。
     */

    function flickerRivers() {

        riverKeys.forEach((key) => {

            const group = getRiverGroup(key);

            if (!group) {
                return;
            }

            const jitter = Math.random() * 900;

            window.setTimeout(() => {

                group.classList.add("is-flicker");

                window.setTimeout(() => {
                    group.classList.remove("is-flicker");
                }, 1100);

            }, jitter);

        });

    }

    /*
     * 段階②以降（光の塊 → 形成 → 流動）は、
     * updateCreationByScroll() がスクロール位置から
     * 連続的に --progress を計算するため、ここでは扱わない。
     */

    /*
     * 段階⑤：命名
     * 「ラプラタ。ナイル。ドナウ。ガンジス。」の順で、
     * 対応する川がわずかに明るくなり、その後も定着する。
     */

    function nameRivers() {

        const nameOrder = ["life", "knowledge", "creation", "soul"];

        nameOrder.forEach((key, index) => {

            window.setTimeout(() => {

                const group = getRiverGroup(key);
                const nameEl = document.querySelector(
                    `.river-name[data-river="${key}"]`
                );

                window.RyuTuning?.cue(`river-${key}`);

                if (group) {

                    group.classList.add("is-named", "is-name-pulse");

                    window.setTimeout(() => {
                        group.classList.remove("is-name-pulse");
                    }, 1800);

                }

                if (nameEl) {
                    nameEl.classList.add("is-lit");
                }

            }, index * 500);

        });

    }

    onLineVisible("rivers-seed-trigger", () => {
        window.RyuTuning?.cue("flicker");
        flickerRivers();
    });

    onLineVisible("river-names-trigger", nameRivers);


    /*
     * ------------------------------------------------------
     * 「流れはやがて無数の世界を生み出した。」： 光の粒
     * ------------------------------------------------------
     *
     * 大量の星空にはせず、控えめな数の光を
     * 少しずつ時間差で浮かび上がらせる。
     * ------------------------------------------------------
     */

    const SPARK_COLORS = {
        life: "#c9a24a",
        knowledge: "#5f8fc9",
        creation: "#9a6fc9",
        soul: "#4fae9d"
    };

    /* 各川のおおよその通り道（SVGのpath座標から近似した帯） */
    const RIVER_BANDS = {
        life: { x: [5, 95], y: [10, 44] },
        knowledge: { x: [5, 95], y: [36, 64] },
        creation: { x: [5, 95], y: [36, 72] },
        soul: { x: [5, 95], y: [28, 90] }
    };

    function randomInRange([min, max]) {
        return min + Math.random() * (max - min);
    }

    const SPARK_VARIANTS = [
        "", "", "",
        "spark--flicker", "spark--flicker",
        "spark--fade",
        "spark--flash"
    ];

    /*
     * 粒子は最初からすべて生成しておき、
     * それぞれに revealAt（0〜1）を持たせる。
     * 実際に見えるかどうかは updateSparks() が
     * 世界の生成度合いとの比較で決めるため、
     * スクロールに応じて自然に現れたり消えたりする。
     *
     * reveal-atが小さいものは川のすぐ近くに、
     * 大きいものほど発生位置が画面全体へ広がる
     * （「川から世界が枝分かれするように広がる」）。
     */

    const sparkList = [];

    /* 出現の度合いから各粒子のopacityを決める（可逆） */
    function updateSparks(progress) {

        sparkList.forEach((s) => {

            const v = Math.max(
                0,
                Math.min(s.target, (progress - s.revealAt) * 30)
            );

            writeStyle(s.el, "opacity", v.toFixed(2));

        });

    }

    function spawnSpark(x, y, color, revealAt, size) {

        if (!worldSparks) {
            return;
        }

        const spark = document.createElement("span");

        const variant =
            SPARK_VARIANTS[
                Math.floor(Math.random() * SPARK_VARIANTS.length)
            ];

        spark.className = variant ? `spark ${variant}` : "spark";

        spark.style.left = `${x}%`;
        spark.style.top = `${y}%`;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        const sparkTarget = 0.5 + Math.random() * 0.35;

        spark.style.setProperty("--spark-color", color);

        worldSparks.appendChild(spark);

        sparkList.push({ el: spark, revealAt, target: sparkTarget });

    }

    function createAllSparks() {

        if (!worldSparks) {
            return;
        }

        const waves = [
            { count: 14, spread: 8, revealFrom: 0, revealTo: 0.25 },
            { count: 16, spread: 20, revealFrom: 0.2, revealTo: 0.55 },
            { count: 12, spread: 36, revealFrom: 0.5, revealTo: 0.9 }
        ];

        waves.forEach((wave) => {

            for (let i = 0; i < wave.count; i++) {

                const key =
                    riverKeys[
                        Math.floor(Math.random() * riverKeys.length)
                    ];

                const band = RIVER_BANDS[key];

                const baseX = randomInRange(band.x);
                const baseY = randomInRange(band.y);

                const x = Math.min(
                    96,
                    Math.max(
                        4,
                        baseX + (Math.random() - 0.5) * wave.spread
                    )
                );

                const y = Math.min(
                    96,
                    Math.max(
                        4,
                        baseY + (Math.random() - 0.5) * wave.spread
                    )
                );

                const revealAt =
                    wave.revealFrom +
                    Math.random() * (wave.revealTo - wave.revealFrom);

                const size = 2.5 + Math.random() * 3.5;

                spawnSpark(x, y, SPARK_COLORS[key], revealAt, size);

            }

        });

    }

    createAllSparks();


    /*
     * ------------------------------------------------------
     * 「世界を見る」
     * ------------------------------------------------------
     *
     * HTML側のhref="world/index.html"をそのまま使用する。
     *
     * JSでURLを書き換えない。
     * ------------------------------------------------------
     */

    const worldEnter = document.getElementById("world-enter");

    if (worldEnter) {

        worldEnter.addEventListener("click", (event) => {

            // 新しいタブで開く操作などはそのままブラウザに任せる
            if (
                event.button !== 0 ||
                event.metaKey || event.ctrlKey ||
                event.shiftKey || event.altKey
            ) {
                return;
            }

            event.preventDefault();

            const href = worldEnter.getAttribute("href");

            const reduce = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            // 世界の光が遠ざかり、闇に溶けてから世界地図へ
            document.body.classList.add("leaving");

            window.setTimeout(() => {
                window.location.href = href;
            }, reduce ? 150 : 1300);

        });

        // 戻るボタンでこのページに戻ったとき、暗転したままにしない
        window.addEventListener("pageshow", () => {
            document.body.classList.remove("leaving");
        });

    }


    /*
     * マウス移動による龍の微細な動きは、
     * 下の「スクロール連動する創世システム」の
     * なめらか追従ループ内で処理する。
     */


    /*
     * ------------------------------------------------------
     * スクロール連動する創世システム
     * ------------------------------------------------------
     *
     * 世界の明度・龍の再浮上・四つの川の形成・粒子の出現は、
     * 「一度だけ起こるイベント」ではなく、現在のスクロール
     * 位置から常に算出される値にする。下へ進めば世界が生まれ、
     * 上へ戻れば生まれる前の状態へ自然に戻る（可逆）。
     *
     * flicker・trembling・tearing・shatteringなど、
     * 一瞬だけ起こる演出は既存のonLineVisible方式のまま残す。
     * ------------------------------------------------------
     */

    const chapterOne = document.getElementById("chapter-one");
    const lineFought = document.getElementById("line-fought");

    const riverLineEls = {
        life: document.querySelector('.river-line[data-river="life"]'),
        knowledge: document.querySelector(
            '.river-line[data-river="knowledge"]'
        ),
        creation: document.querySelector(
            '.river-line[data-river="creation"]'
        ),
        soul: document.querySelector('.river-line[data-river="soul"]')
    };

    /*
     * ------------------------------------------------------
     * シーン（画面に留める重要場面）
     * ------------------------------------------------------
     */

    const scenes = [...document.querySelectorAll(".scene")].map((el) => {

        const lines = [...el.querySelectorAll(".scene-line")];

        el.style.setProperty("--steps", String(lines.length));

        return {
            el,
            lines,
            base: parseFloat(el.dataset.base || "0.85"),
            top: 0,
            stepPx: 1,
            lastStep: -Infinity
        };

    });

    function measureScenes() {

        const vh = window.innerHeight;

        scenes.forEach((scene) => {

            const rect = scene.el.getBoundingClientRect();

            scene.top = rect.top + window.scrollY;
            // CSSの --tail-len（70vh）を除いた分を文の数で割る
            scene.stepPx = Math.max(
                1,
                (scene.el.offsetHeight - vh - vh * 0.7) /
                    scene.lines.length
            );

        });

    }

    /* シーン内の文は「その文の番が始まる瞬間のpointer位置」を目印にする */
    function sceneLineMark(el) {

        for (const scene of scenes) {

            const index = scene.lines.indexOf(el);

            if (index !== -1) {
                return (
                    scene.top +
                    index * scene.stepPx +
                    window.innerHeight * 0.5
                );
            }

        }

        return null;

    }

    function updateScenes(pointer) {

        const vh = window.innerHeight;

        scenes.forEach((scene) => {

            // 0 = 1文目の番が始まる, 1 = 2文目 ...
            const stepPos =
                (pointer - vh * 0.5 - scene.top) / scene.stepPx;

            const last = scene.lines.length - 1;

            scene.lines.forEach((line, i) => {

                const u = stepPos - i;

                let vis;

                /*
                 * 前の文が消えきってから次の文が現れるように、
                 * 「去る」と「現れる」の区間を重ねない
                 * （去る: u 0.6〜0.84 / 次が現れる: 次のu -0.12〜0.12）。
                 */
                if (u < -0.12) {
                    vis = 0;
                } else if (u < 0.12) {
                    vis = (u + 0.12) / 0.24;               // 現れる
                } else if (u < 0.6 || i === last) {
                    vis = 1;                               // 読む時間
                } else if (u < 0.84) {
                    vis = 1 - (u - 0.6) / 0.24;            // 去る
                } else {
                    vis = 0;
                }

                vis = vis * vis * (3 - 2 * vis);           // なめらかに

                vis = Math.max(0, Math.min(1, vis));

                // 下からそっと浮かび、上へ静かに去る
                const drift =
                    i === last && u > 0
                        ? 0
                        : -Math.max(-0.12, Math.min(0.84, u)) * 26;

                writeStyle(line, "opacity", (vis * scene.base).toFixed(3));
                writeStyle(
                    line,
                    "transform",
                    `translate3d(0, ${drift.toFixed(1)}px, 0)`
                );

            });

            // 一度だけの演出：番が来た文の分を（前へ進んだときのみ）発火
            const currentStep = Math.floor(stepPos + 0.15);

            // ページを途中位置で開いた場合、通り過ぎた分は発火させない
            if (scene.lastStep === -Infinity) {
                scene.lastStep = currentStep;
            }

            if (currentStep > scene.lastStep) {

                for (
                    let i = Math.max(0, scene.lastStep + 1);
                    i <= Math.min(last, currentStep);
                    i++
                ) {

                    const cb = sceneTriggers.get(scene.lines[i]);

                    if (cb) {
                        sceneTriggers.delete(scene.lines[i]);
                        runQueued(cb);
                    }

                }

            }

            scene.lastStep = Math.max(scene.lastStep, currentStep);

        });

    }

    function docTop(el) {

        if (!el) {
            return 0;
        }

        const sceneMark = sceneLineMark(el);

        if (sceneMark !== null) {
            // docTop は「pointerがその位置に来たら」の比較に使うので、
            // シーン内ではその文の番が始まるpointer位置を返す
            return sceneMark;
        }

        return el.getBoundingClientRect().top + window.scrollY;

    }

    function lerpSpan(pointer, x0, x1, y0, y1) {

        if (x1 <= x0) {
            return y1;
        }

        const t = Math.max(0, Math.min(1, (pointer - x0) / (x1 - x0)));

        return y0 + (y1 - y0) * t;

    }

    /* 川が伸びきるまでの距離 = その川の一文の持ち時間とほぼ同じ */
    function riverSpan() {

        const scene = scenes.find((sc) =>
            sc.lines.includes(riverLineEls.life)
        );

        return scene ? scene.stepPx * 0.95 : 480;

    }

    let marks = {};

    function measureCreationMarks() {

        measureScenes();

        marks = {
            chapterOne: docTop(chapterOne),
            chapterThree: docTop(chapterThree),
            lineFought: docTop(lineFought),
            crack: docTop(crackTrigger),
            chapterFour: docTop(chapterFour),
            riverLife: docTop(riverLineEls.life),
            riverKnowledge: docTop(riverLineEls.knowledge),
            riverCreation: docTop(riverLineEls.creation),
            riverSoul: docTop(riverLineEls.soul),
            worldBirth: docTop(worldBirthTrigger),
            worldEntry: docTop(worldEntry),
            worldEntryMid:
                worldEntry
                    ? docTop(worldEntry) + worldEntry.offsetHeight * 0.3
                    : 0
        };

    }

    /*
     * 世界の明度。
     * 以前は「無数の世界」の一文や龍の世界の入口などの節目で
     * 傾きが変わり、明るさが段階的に跳ね上がって見えていた。
     * 今は第四章の冒頭から龍の世界が満ちきるまでを一本の
     * ゆるやかな曲線（はじめは遅く、終盤ほど加速する）でつなぐ。
     * 第一〜三章は夜明け前のような、ごく僅かな上昇のみ。
     */

    function easeInCubicSoft(t) {
        // 序盤はほとんど変わらず、気づけば明るくなっている
        return t * t * (0.35 + 0.65 * t);
    }

    function computeWorldTone(pointer) {

        if (pointer < marks.chapterThree) {
            return lerpSpan(
                pointer, marks.chapterOne, marks.chapterThree, 0, 0.03
            );
        }

        if (pointer < marks.lineFought) {
            return lerpSpan(
                pointer, marks.chapterThree, marks.lineFought, 0.03, 0.06
            );
        }

        // 原初の戦：光と闇がぶつかる一瞬の閃光（ここだけは急変させる）
        if (pointer < marks.crack) {
            return lerpSpan(
                pointer, marks.lineFought, marks.crack, 0.06, 0.32
            );
        }

        const settleEnd = marks.crack + 260;

        if (pointer < settleEnd) {
            return lerpSpan(pointer, marks.crack, settleEnd, 0.32, 0.015);
        }

        if (pointer < marks.chapterFour) {
            return 0.015;
        }

        const t = Math.max(
            0,
            Math.min(
                1,
                (pointer - marks.chapterFour) /
                    (marks.worldEntryMid - marks.chapterFour)
            )
        );

        return 0.015 + (1 - 0.015) * easeInCubicSoft(t);

    }

    function computeDragonReveal(pointer) {

        if (pointer < marks.lineFought) {
            return lerpSpan(
                pointer, marks.chapterOne, marks.lineFought, 0.035, 0.05
            );
        }

        if (pointer < marks.crack) {
            return lerpSpan(
                pointer, marks.lineFought, marks.crack, 0.05, 0.13
            );
        }

        const settleEnd = marks.crack + 260;

        if (pointer < settleEnd) {
            return lerpSpan(pointer, marks.crack, settleEnd, 0.13, 0.012);
        }

        if (pointer < marks.chapterFour) {
            return 0.012;
        }

        if (pointer < marks.worldBirth) {
            return lerpSpan(
                pointer, marks.chapterFour, marks.worldBirth, 0.012, 0.09
            );
        }

        return lerpSpan(
            pointer, marks.worldBirth, marks.worldEntry, 0.09, 0.12
        );

    }

    function riverStartMark(key) {

        return marks[
            "river" + key.charAt(0).toUpperCase() + key.slice(1)
        ];

    }

    /*
     * 明度だけは、なめらかな位置からさらにゆっくり追いかける。
     * 速くスクロールしても、世界は急には明るくならない。
     */
    const TONE_SMOOTH_TIME = 0.9; // 秒
    let toneCurrent = null;
    let toneTarget = 0;

    function updateCreationByScroll(pointer) {

        updateScenes(pointer);

        toneTarget = computeWorldTone(pointer);

        if (toneCurrent === null) {
            toneCurrent = toneTarget;
        }

        setWorldTone(toneCurrent);
        setDragonReveal(computeDragonReveal(pointer));

        riverKeys.forEach((key) => {

            const startY = riverStartMark(key);
            const group = getRiverGroup(key);

            if (!group || !startY) {
                return;
            }

            const progress = lerpSpan(
                pointer, startY, startY + riverSpan(), 0, 1
            );

            writeStyle(group, "--progress", progress.toFixed(3));
            litRiverGlow(key, progress);

        });

        if (marks.worldBirth && marks.worldEntry) {

            // 「無数の世界を生み出した」から、龍の世界が白く
            // 満ちきるまでの全区間をかけて世界が生まれていく
            const creationProgress = lerpSpan(
                pointer, marks.worldBirth - 120, marks.worldEntryMid, 0, 1
            );

            updateSparks(creationProgress);

        }

    }

    /*
     * 【なめらかさ】
     * マウスホイールは1ノッチで約100pxずつ飛ぶため、
     * スクロール位置をそのまま使うと明度・川・粒子が
     * 段々にカクついて見える。そこで「実際のスクロール位置」を
     * 少し遅れて追いかける「なめらかな位置」を毎フレーム作り、
     * すべての演出をそこから算出する（指数的な追従）。
     * 追いついたらループは止まるので、静止中の負荷はない。
     */

    const SMOOTH_TIME = 0.22; // 秒。大きいほどゆったり追いかける

    let smoothPointer = null;
    let loopRunning = false;
    let lastFrameTime = 0;

    // マウスに合わせた龍の微細な動きも同じループでなめらかにする
    const dragonDrift = { x: 0, y: 0, tx: 0, ty: 0 };

    function targetPointer() {
        return window.scrollY + window.innerHeight * 0.5;
    }

    function frame(now) {

        const dt = Math.min(0.1, (now - lastFrameTime) / 1000 || 0.016);
        lastFrameTime = now;

        const k = 1 - Math.exp(-dt / SMOOTH_TIME);

        const target = targetPointer();

        if (smoothPointer === null) {
            smoothPointer = target;
        }

        smoothPointer += (target - smoothPointer) * k;

        // 大きく離れすぎた（ページ内リンク等で一気に飛んだ）場合は詰める
        if (Math.abs(target - smoothPointer) > window.innerHeight * 3) {
            smoothPointer = target - Math.sign(target - smoothPointer) *
                window.innerHeight * 3;
        }

        const pointerSettled = Math.abs(target - smoothPointer) < 0.5;

        if (pointerSettled) {
            smoothPointer = target;
        }

        updateCreationByScroll(smoothPointer);

        const kTone = 1 - Math.exp(-dt / TONE_SMOOTH_TIME);
        toneCurrent += (toneTarget - toneCurrent) * kTone;

        const toneSettled = Math.abs(toneTarget - toneCurrent) < 0.0015;

        if (toneSettled) {
            toneCurrent = toneTarget;
        }

        setWorldTone(toneCurrent);

        dragonDrift.x += (dragonDrift.tx - dragonDrift.x) * k;
        dragonDrift.y += (dragonDrift.ty - dragonDrift.y) * k;

        const driftSettled =
            Math.abs(dragonDrift.tx - dragonDrift.x) < 0.02 &&
            Math.abs(dragonDrift.ty - dragonDrift.y) < 0.02;

        if (globalDragon) {
            writeStyle(
                globalDragon,
                "transform",
                `translate3d(${dragonDrift.x.toFixed(2)}px, ` +
                `${dragonDrift.y.toFixed(2)}px, 0)`
            );
        }

        if (pointerSettled && driftSettled && toneSettled) {
            loopRunning = false;
            return;
        }

        window.requestAnimationFrame(frame);

    }

    function requestCreationUpdate() {

        if (loopRunning) {
            return;
        }

        loopRunning = true;
        lastFrameTime = performance.now();

        window.requestAnimationFrame(frame);

    }

    if (globalDragon) {

        window.addEventListener("mousemove", (event) => {

            dragonDrift.tx =
                (event.clientX / window.innerWidth - 0.5) * 8;

            dragonDrift.ty =
                (event.clientY / window.innerHeight - 0.5) * 8;

            requestCreationUpdate();

        });

    }

    measureCreationMarks();
    updateCreationByScroll(targetPointer());

    window.addEventListener("scroll", requestCreationUpdate, {
        passive: true
    });

    function remeasure() {
        measureCreationMarks();
        // レイアウトが変わったときは追従を待たずに合わせる
        smoothPointer = targetPointer();
        updateCreationByScroll(smoothPointer);
        requestCreationUpdate();
    }

    window.addEventListener("resize", remeasure);

    // 画像・フォントの読み込みでレイアウトがずれた場合に備えて測り直す
    window.addEventListener("load", remeasure);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(remeasure);
    }

    /*
     * ------------------------------------------------------
     * 音：「無数の世界」が生まれる瞬間に、光の粒の音を降らせる
     * （音そのものは ryu-tuning.js。音を静めていれば鳴らない）
     * ------------------------------------------------------
     */

    const birthTrigger = document.getElementById("world-birth-trigger");

    if (birthTrigger && "IntersectionObserver" in window) {
        const birthObserver = new IntersectionObserver((entries) => {
            if (entries.some((en) => en.isIntersecting)) {
                window.RyuTuning?.cue("birth");
                birthObserver.disconnect();
            }
        }, { threshold: 0.6 });
        birthObserver.observe(birthTrigger);
    }

});
