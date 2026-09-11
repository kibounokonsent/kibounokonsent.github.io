/* ==========================================================
   共通ヘッダー / ナビゲーション
   ----------------------------------------------------------
   ページを増やしたり、ナビの項目を変えたいときは
   このファイルの NAV_ITEMS だけ直せば、
   index.html / about.html / illustration.html / webworks.html
   すべてに反映される。
========================================================== */

(function () {

    const NAV_ITEMS = [
        { href: "index.html", label: "ホーム" },
        { href: "about.html", label: "私について" },
        { href: "illustration.html", label: "イラスト" },
        { href: "webworks.html", label: "Web作品" },
    ];

    function renderHeader() {

        const mount = document.getElementById("site-header");
        if (!mount) return;

        // 現在のページのファイル名を取得（例: about.html）
        const current = location.pathname.split("/").pop() || "index.html";

        const links = NAV_ITEMS.map((item) => {
            const activeClass = item.href === current ? ' class="active"' : "";
            return `<a href="${item.href}"${activeClass}>${item.label}</a>`;
        }).join("\n");

        mount.innerHTML =
            '<div class="brand">コンセント</div>\n' +
            '<nav aria-label="メインナビゲーション">\n' + links + '\n</nav>';
    }

    function renderBackgroundLayer() {

        // すでに挿入済みなら何もしない
        if (document.querySelector(".bg-layer")) return;

        const layer = document.createElement("div");
        layer.className = "bg-layer";
        layer.setAttribute("aria-hidden", "true");

        document.body.insertBefore(layer, document.body.firstChild);
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderHeader();
        renderBackgroundLayer();
    });

})();
