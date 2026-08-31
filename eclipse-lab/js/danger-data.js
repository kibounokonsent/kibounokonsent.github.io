/* ==========================================================
   ECLIPSE LAB
   DANGER LEVEL DATA
   danger-data.js

   危険度アイコン画像は images/theos.png のように
   ファイル名を合わせて置くと自動で表示される。
   画像が無い間は代替のシンボル表示になる。
========================================================== */

const dangerLevels = {

    theos:{
        label:"テオス",
        symbol:"Θ",
        emoji:"⚫"
    },

    kindynos:{
        label:"キンディノス",
        symbol:"▲",
        emoji:"🔴"
    },

    epimeleia:{
        label:"エピメレイア",
        symbol:"⬡",
        emoji:"🟡"
    },

    asphales:{
        label:"アスファレス",
        symbol:"❖",
        emoji:"🟢"
    }

};


/* ==========================================================
   危険度アイコン（imgタグ。読み込めない間はシンボルで代替）
========================================================== */

function dangerIconHtml(dangerKey, size){

    const level =
        dangerLevels[dangerKey];

    if(!level) return "";

    const s = size || 24;

    return `
    <span class="danger-icon" style="width:${s}px;height:${s}px;">
        <img src="images/${dangerKey}.png" alt="${level.label}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span class="danger-icon-fallback">${level.symbol}</span>
    </span>`;

}


/* ==========================================================
   職員階級（クリアランス）

   ブロンズ < シルバー < ゴールド < プラチナ
   各紛異体は、危険度に応じた最低階級以上でのみ
   全文閲覧できる。
========================================================== */

const rankOrder = {
    BRONZE:1,
    SILVER:2,
    GOLD:3,
    PLATINUM:4
};

const requiredRankByDanger = {
    asphales:"BRONZE",
    epimeleia:"SILVER",
    kindynos:"GOLD",
    theos:"PLATINUM"
};

function getRankValue(rank){
    return rankOrder[rank] || 0;
}
