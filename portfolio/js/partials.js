/* ==========================================================
   共通パーツ（ヘッダー / ☰メニュー / 背景の回路模様 / 目次）
   ----------------------------------------------------------
   ページを増やしたり、ナビの項目を変えたいときは
   このファイルの NAV_ITEMS だけ直せば、
   index.html / about.html / illustration.html / webworks.html
   すべてに反映される。

   ☰メニューの設定項目を増やしたいときは SETTINGS_ITEMS に追加し、
   settings.js の DEFAULTS と sf-theme.css の「SETTINGS」も合わせて直す。
========================================================== */

(function () {

    const NAV_ITEMS = [
        { href: "index.html", label: "ホーム", code: "HOME" },
        { href: "about.html", label: "私について", code: "PROFILE" },
        { href: "illustration.html", label: "イラスト", code: "ILLUST" },
        { href: "webworks.html", label: "Web作品", code: "WEB" },
    ];

    // ☰メニューの設定スイッチ
    //   key   : settings.js の項目名（"sound" だけは sound.js が管理）
    //   on    : スイッチがONのときの値
    const SETTINGS_ITEMS = [
        { key: "sound",  code: "SOUND",  label: "効果音" },
        { key: "motion", code: "MOTION", label: "背景アニメーション", on: "on",    off: "off" },
        { key: "glow",   code: "GLOW",   label: "光の演出",           on: "on",    off: "off" },
        { key: "text",   code: "TEXT",   label: "文字を大きくする",   on: "large", off: "normal" },
    ];

    const current = location.pathname.split("/").pop() || "index.html";


    /* ---------- 設定値の読み書き ---------- */

    function isOn(item) {
        if (item.key === "sound") {
            return !(window.portfolioSound && window.portfolioSound.isMuted());
        }
        const settings = window.portfolioSettings;
        return settings ? settings.get(item.key) === item.on : true;
    }

    function toggle(item) {
        const next = !isOn(item);
        if (item.key === "sound") {
            if (window.portfolioSound) window.portfolioSound.setMuted(!next);
        } else if (window.portfolioSettings) {
            window.portfolioSettings.set(item.key, next ? item.on : item.off);
        }
    }


    /* ---------- ヘッダー ---------- */

    function renderHeader() {

        const mount = document.getElementById("site-header");
        if (!mount) return;

        const navLinks = (extraClass) => NAV_ITEMS.map((item) => {
            const active = item.href === current;
            return (
                `<a href="${item.href}" class="${extraClass}${active ? " active" : ""}"` +
                `${active ? ' aria-current="page"' : ""}>` +
                `<span class="nav-code">${item.code}</span>` +
                `<span class="nav-label">${item.label}</span></a>`
            );
        }).join("");

        const switches = SETTINGS_ITEMS.map((item) => (
            `<div class="setting-row">` +
                `<span class="setting-name">` +
                    `<span class="setting-code">${item.code}</span>` +
                    `<span class="setting-label">${item.label}</span>` +
                `</span>` +
                `<button type="button" class="setting-switch" role="switch" data-key="${item.key}"` +
                ` aria-label="${item.label}"${item.key === "sound" ? " data-silent" : ""}>` +
                    `<span class="switch-state"></span>` +
                `</button>` +
            `</div>`
        )).join("");

        mount.innerHTML =
            '<div class="header-inner">' +
                '<a class="brand" href="index.html">' +
                    '<img class="brand-icon" src="images/konsento-icon.png" alt="" width="32" height="32">' +
                    '<span class="brand-text">コンセント</span>' +
                '</a>' +
                '<nav class="header-nav" aria-label="メインナビゲーション">' + navLinks("nav-link") + '</nav>' +
                '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="system-panel">' +
                    '<span class="menu-bars" aria-hidden="true"><i></i><i></i><i></i></span>' +
                    '<span class="menu-text">MENU</span>' +
                '</button>' +
            '</div>' +
            '<div class="system-panel" id="system-panel" hidden>' +
                '<nav class="panel-nav" aria-label="メニュー">' +
                    '<p class="panel-title">// NAVIGATION</p>' +
                    navLinks("panel-link") +
                '</nav>' +
                '<div class="panel-settings">' +
                    '<p class="panel-title">// SYSTEM SETTINGS</p>' +
                    switches +
                '</div>' +
            '</div>';

        setupMenu(mount);
    }


    function setupMenu(header) {

        const button = header.querySelector(".menu-toggle");
        const panel = header.querySelector(".system-panel");
        const switches = header.querySelectorAll(".setting-switch");

        function refreshSwitches() {
            switches.forEach((sw) => {
                const item = SETTINGS_ITEMS.find((i) => i.key === sw.dataset.key);
                const on = isOn(item);
                sw.setAttribute("aria-checked", String(on));
                sw.querySelector(".switch-state").textContent = on ? "ON" : "OFF";
            });
        }

        function open() {
            refreshSwitches();
            panel.hidden = false;
            // hidden を外した直後にクラスを付けて、表示アニメーションを効かせる
            requestAnimationFrame(() => panel.classList.add("is-open"));
            button.setAttribute("aria-expanded", "true");
            header.classList.add("menu-open");
        }

        function close() {
            panel.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
            header.classList.remove("menu-open");
            panel.hidden = true;
        }

        button.addEventListener("click", () => {
            if (panel.hidden) open(); else close();
        });

        switches.forEach((sw) => {
            sw.addEventListener("click", () => {
                const item = SETTINGS_ITEMS.find((i) => i.key === sw.dataset.key);
                toggle(item);
                refreshSwitches();
            });
        });

        // パネルの外をクリック / Escで閉じる
        document.addEventListener("click", (event) => {
            if (!panel.hidden && !header.contains(event.target)) close();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !panel.hidden) {
                close();
                button.focus();
            }
        });

        // スクロールしたらヘッダーに影を付ける
        const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }


    /* ---------- 背景：流れる回路模様 ----------
       1枚 240×240 のタイルを敷き詰めている。
       線がタイルの端から出たら、反対側の同じ位置から入るように描いてあるので、
       つなぎ目が見えない。
       ・.circuit-base  … 薄い回路の線（全体がゆっくり流れる）
       ・.circuit-pulse … 線の上をときどき走る光の線（まばらに配置）
    ------------------------------------------------------------ */

    const CIRCUIT_PATHS =
        // 横に走る配線（上）
        '<path d="M0 40 H70 L100 70 H170 L200 40 H240"/>' +
        // 縦に走る配線（左）
        '<path d="M30 0 V110 L55 135 V190 L30 215 V240"/>' +
        // 下の配線（右端から左端へつながる）
        '<path d="M90 228 H240 M0 228 H12"/>' +
        // 右の配線
        '<path d="M210 70 V160 L230 180 H240 M0 180 H18"/>' +
        // チップから出る配線
        '<path d="M135 70 V110 M165 150 V180 M120 130 H85 L70 145 V160"/>';

    const CIRCUIT_PARTS =
        // チップ
        '<rect x="110" y="110" width="70" height="40"/>' +
        '<path d="M120 110 V104 M130 110 V104 M150 110 V104 M160 110 V104 M170 110 V104' +
        ' M120 150 V156 M130 150 V156 M140 150 V156 M150 150 V156 M175 150 V156"/>' +
        '<rect x="118" y="118" width="14" height="8"/>' +
        // USBポートのような端子
        '<rect x="148" y="180" width="54" height="24" rx="2"/>' +
        '<rect x="154" y="186" width="42" height="8"/>' +
        '<rect x="160" y="196" width="6" height="4"/><rect x="184" y="196" width="6" height="4"/>' +
        // 配線の終点（ビア）
        '<circle cx="12" cy="228" r="3.5"/><circle cx="90" cy="228" r="3.5"/>' +
        '<circle cx="18" cy="180" r="3.5"/><circle cx="210" cy="70" r="3.5"/>' +
        '<circle cx="135" cy="70" r="3"/><circle cx="70" cy="160" r="3.5"/>' +
        // 小さな端子の列
        '<path d="M78 12 h6 M90 12 h6 M102 12 h6 M114 12 h6 M126 12 h6"/>' +
        '<path d="M222 110 v6 M222 122 v6 M222 134 v6"/>';

    function renderBackgroundLayer() {

        // すでに挿入済みなら何もしない
        if (document.querySelector(".bg-circuit")) return;

        const layer = document.createElement("div");
        layer.className = "bg-circuit";
        layer.setAttribute("aria-hidden", "true");

        layer.innerHTML =
            '<svg class="circuit-svg" xmlns="http://www.w3.org/2000/svg">' +
                '<defs>' +
                    '<pattern id="circuit-base" width="240" height="240" patternUnits="userSpaceOnUse">' +
                        '<g class="circuit-base">' + CIRCUIT_PATHS + CIRCUIT_PARTS + '</g>' +
                    '</pattern>' +
                    // 光の線は 720×720（タイル9枚分）に2か所だけ。毎タイルに出すと点が並んで見えるため
                    '<pattern id="circuit-pulse" width="720" height="720" patternUnits="userSpaceOnUse">' +
                        '<g class="circuit-pulse">' + CIRCUIT_PATHS + '</g>' +
                        '<g class="circuit-pulse pulse-late" transform="translate(480 480)">' + CIRCUIT_PATHS + '</g>' +
                    '</pattern>' +
                '</defs>' +
                '<rect width="100%" height="100%" fill="url(#circuit-base)"/>' +
                '<rect width="100%" height="100%" fill="url(#circuit-pulse)"/>' +
            '</svg>';

        document.body.insertBefore(layer, document.body.firstChild);
    }


    /* ---------- 目次（セクションが多いページだけ自動で作る） ---------- */

    function renderJumpList() {

        const sections = Array.from(document.querySelectorAll("main section.gallery"))
            .filter((section) => section.querySelector(":scope > h2"));

        if (sections.length < 3) return;

        const intro = document.querySelector(".page-intro");
        if (!intro) return;

        const nav = document.createElement("nav");
        nav.className = "jump-list";
        nav.setAttribute("aria-label", "このページの目次");

        nav.innerHTML = sections.map((section, index) => {
            if (!section.id) section.id = "section-" + (index + 1);
            const title = section.querySelector(":scope > h2").textContent.trim();
            const no = String(index + 1).padStart(2, "0");
            return `<a href="#${section.id}"><span class="jump-no">${no}</span>${title}</a>`;
        }).join("");

        intro.insertAdjacentElement("afterend", nav);
    }


    document.addEventListener("DOMContentLoaded", () => {
        document.body.dataset.page = current.replace(".html", "") || "index";
        renderHeader();
        renderBackgroundLayer();
        renderJumpList();
    });

})();
