/* ==========================================================
   表示設定（☰メニューの「SYSTEM」パネルで切り替える項目）
   ----------------------------------------------------------
   ・<head> で defer なしで読み込むこと
     （ページが描画される前に設定を反映して、チラつきを防ぐため）
   ・設定は <html> の data-* 属性として反映される
       data-motion="off"  … 背景アニメーションを止める
       data-glow="off"    … ホバー時の発光を消す
       data-text="large"  … 文字を少し大きくする
   ・CSS 側は sf-theme.css の「SETTINGS」セクションで受け取る
   ・サウンドのON/OFFは sound.js が管理（保存キーも sound.js 側）
========================================================== */

(function () {

    const STORAGE_KEY = "portfolio-settings";

    // 初期値。OSで「視差効果を減らす」がオンなら、背景アニメーションは最初から止めておく
    const reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DEFAULTS = {
        motion: reduceMotion ? "off" : "on",
        glow: "on",
        text: "normal",
    };

    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) { /* 保存できない環境では毎回初期値 */ }

    const state = Object.assign({}, DEFAULTS, saved);

    function apply() {
        const root = document.documentElement;
        root.dataset.motion = state.motion;
        root.dataset.glow = state.glow;
        root.dataset.text = state.text;
    }

    function set(key, value) {
        state[key] = value;
        apply();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function get(key) {
        return state[key];
    }

    apply();

    window.portfolioSettings = { get, set };

})();
