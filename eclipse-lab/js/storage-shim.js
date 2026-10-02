/* ==========================================================
   ECLIPSE LAB
   STORAGE SHIM
   storage-shim.js

   プライベートウィンドウや埋め込み表示などで localStorage が
   使えない（読むだけで例外が出る）環境でも動くように、
   その場合だけメモリ上の代わりを用意する。
   この場合、閲覧履歴はページを閉じると消える。
   いちばん最初に読み込むこと。
========================================================== */

(function(){

    let usable = false;

    try{
        const probe = "__eclipse_probe__";
        window.localStorage.setItem(probe, "1");
        window.localStorage.removeItem(probe);
        usable = true;
    }
    catch(e){
        usable = false;
    }

    if(usable) return;

    const memory = {};

    const fallback = {
        getItem(key){ return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null; },
        setItem(key, value){ memory[key] = String(value); },
        removeItem(key){ delete memory[key]; },
        clear(){ Object.keys(memory).forEach(k=> delete memory[k]); },
        key(i){ return Object.keys(memory)[i] || null; },
        get length(){ return Object.keys(memory).length; }
    };

    try{
        Object.defineProperty(window, "localStorage", { value:fallback, configurable:true });
    }
    catch(e){
        /* 置き換えもできない環境では何もしない */
    }

})();
