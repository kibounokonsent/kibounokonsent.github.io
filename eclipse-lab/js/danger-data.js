/* ==========================================================
   ECLIPSE LAB
   DANGER LEVEL DATA
   danger-data.js

   危険度アイコン画像は images/theos.png のように
   ファイル名を合わせて置くと自動で表示される。
   画像が無い間は代替のシンボル表示になる。
========================================================== */

/* ==========================================================
   ECLIPSE LAB
   DANGER LEVEL DATA
========================================================== */

const dangerLevels = {

    theos:{
        label:"テオス",
        symbol:"./images/T.svg",
        emoji:"./images/T.svg"
    },

    kindynos:{
        label:"キンディノス",
        symbol:"./images/K.svg",
        emoji:"./images/K.svg"
    },

    epimeleia:{
        label:"エピメレイア",
        symbol:"./images/E.svg",
        emoji:"./images/E.svg"
    },

    asphales:{
        label:"アスファレス",
        symbol:"./images/A.svg",
        emoji:"./images/A.svg"
    }

};


/* ==========================================================
   危険度アイコン
========================================================== */

function dangerIconHtml(dangerKey, size){

    const level = dangerLevels[dangerKey];

    if(!level) return "";

    const s = size || 24;

    return `
        <span
            class="danger-icon"
            style="
                width:${s}px;
                height:${s}px;
            "
        >
            <img
                src="${level.symbol}"
                alt="${level.label}"
                width="${s}"
                height="${s}"
            >
        </span>
    `;
}


/* ==========================================================
   職員階級（クリアランス）
========================================================== */

const rankOrder = {
    BRONZE:1,
    SILVER:2,
    GOLD:3,
    PLATINUM:4
};


/* ==========================================================
   危険度ごとの必要クリアランス
========================================================== */

const requiredRankByDanger = {

    asphales:"BRONZE",

    epimeleia:"SILVER",

    kindynos:"GOLD",

    theos:"PLATINUM"

};


function getRankValue(rank){

    return rankOrder[rank] || 0;

}

