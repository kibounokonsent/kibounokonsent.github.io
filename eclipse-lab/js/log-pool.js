/* ==========================================================
   ECLIPSE LAB
   LOG POOL
   log-pool.js

   BOOT / AUTHENTICATION SEQUENCE の両方で使う
   「高速ログ」の素材と生成ロジックをここに集約する。
   施設のロア（赤いログ）はどちらの画面で見ても同じ内容になる
   ＝世界に実在する事実、という前提を保つため共有している。
========================================================== */


/* ==========================================================
   通常ログ（白/グレー）
========================================================== */

const logPoolNormal = [
    "CHECKING SECTOR {n}...",
    "READING NODE {n}...",
    "SYNCING TABLE {n}...",
    "SCANNING BLOCK {n}...",
    "MOUNTING INDEX {n}...",
    "QUERY THREAD {n} ACTIVE",
    "VALIDATING RECORD {n}",
    "BUFFER FLUSH {n}",
    "INDEX REPAIR PASS {n}",
    "REQUESTING NODE {n}",
    "PARSING HEADER {n}",
    "TRACE ROUTE {n}"
];


/* ==========================================================
   成功ログ（緑）
========================================================== */

const logPoolSuccess = [
    "SECTOR {n} OK",
    "NODE {n} SYNCHRONIZED",
    "CHECKSUM VALID",
    "RECORD VERIFIED",
    "ARCHIVE LINK STABLE"
];


/* ==========================================================
   警告ログ（黄）
========================================================== */

const logPoolWarning = [
    "SIGNAL DEGRADED",
    "RETRYING CONNECTION",
    "LATENCY HIGH",
    "PARTIAL DATA LOSS"
];


/* ==========================================================
   施設のロア（赤）
   ここだけは演出ではなく「施設の実際の状態」を表す。
   新しい状態を増やしたい場合はここに追加するだけでよい。
========================================================== */

const facilityLore = [
    "FACILITY STATUS : OFFLINE",
    "PERSONNEL DATABASE CORRUPTED",
    "ARCHIVE NODE LOST",
    "ENTITY DATABASE INCOMPLETE",
    "SPECIMEN FILE MISSING",
    "COMMUNICATION LINK DEAD",
    "POWER GRID FAILURE",
    "UNKNOWN SIGNAL RECEIVED",
    "CLASSIFICATION DATA MISSING",
    "RECOVERY FAILED"
];


/* ==========================================================
   HELPERS
========================================================== */

function pickFromPool(pool){
    return pool[Math.floor(Math.random() * pool.length)];
}

function fillNumberToken(template){
    return template.replace("{n}", String(Math.floor(Math.random() * 90) + 10));
}

function pickPoolLine(){

    const roll = Math.random();

    if(roll < 0.08){
        return { type:"success", text:fillNumberToken(pickFromPool(logPoolSuccess)) };
    }

    if(roll < 0.11){
        return { type:"warning", text:pickFromPool(logPoolWarning) };
    }

    return { type:"normal", text:fillNumberToken(pickFromPool(logPoolNormal)) };

}


/* ==========================================================
   高速ログ列を生成
   count      : 生成する行数
   loreChance : 2個目のロアが混ざる確率（0〜1）
========================================================== */

function buildFastLog(count, loreChance = 0.5){

    const lines = [];

    for(let n = 0; n < count; n++){
        lines.push(pickPoolLine());
    }

    const loreCount =
        Math.random() < loreChance ? 2 : 1;

    for(let n = 0; n < loreCount; n++){

        const line = {
            type:"critical",
            text:pickFromPool(facilityLore)
        };

        const pos =
            Math.floor(Math.random() * lines.length);

        lines.splice(pos, 0, line);

    }

    return lines;

}
