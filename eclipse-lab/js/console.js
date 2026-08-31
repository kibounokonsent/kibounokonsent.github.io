/* ==========================================================
   ECLIPSE LAB
   AUTHENTICATION SEQUENCE
   console.js

   AUTHORIZE後に流れる高速ログ演出。
   ・大量の断片的なログを高速表示（20〜40行/秒目安）
   ・古い行は消えていく（読み切れなくてよい）
   ・まれに赤い「本物のロア」が紛れ込む
   ・最後だけ一呼吸おいて、はっきり読める結果メッセージを出す
========================================================== */


/* ==========================================================
   LOG CONTENT POOLS
========================================================== */

const authFillerNormal = [
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

const authFillerSuccess = [
    "SECTOR {n} OK",
    "NODE {n} SYNCHRONIZED",
    "CHECKSUM VALID",
    "RECORD VERIFIED",
    "ARCHIVE LINK STABLE"
];

const authFillerWarning = [
    "SIGNAL DEGRADED",
    "RETRYING CONNECTION",
    "LATENCY HIGH",
    "PARTIAL DATA LOSS"
];

// レア表示：本物のロア（世界観の欠片）
const authLoreCritical = [
    "FACILITY STATUS : OFFLINE",
    "PERSONNEL DATABASE CORRUPTED",
    "ARCHIVE NODE 07 LOST",
    "RECOVERY FAILED",
    "ENTITY DATABASE INCOMPLETE",
    "SPECIMEN FILE MISSING",
    "COMMUNICATION LINK DEAD",
    "POWER GRID FAILURE",
    "UNKNOWN SIGNAL RECEIVED",
    "CLASSIFICATION DATA MISSING"
];


/* ==========================================================
   LINE BUILDERS
========================================================== */

function fillNumberToken(template){
    return template.replace("{n}", String(Math.floor(Math.random()*90)+10));
}

function pickFillerLine(){

    const roll = Math.random();

    if(roll < 0.08){
        return {
            type:"success",
            text:fillNumberToken(authFillerSuccess[Math.floor(Math.random()*authFillerSuccess.length)])
        };
    }

    if(roll < 0.11){
        return {
            type:"warning",
            text:authFillerWarning[Math.floor(Math.random()*authFillerWarning.length)]
        };
    }

    return {
        type:"normal",
        text:fillNumberToken(authFillerNormal[Math.floor(Math.random()*authFillerNormal.length)])
    };

}

function buildOutcomeLines(outcome){

    if(outcome.type === "staff"){

        const staff = outcome.staff;

        const lines = [
            {type:"success", text:`STAFF ID : ${outcome.id} — MATCH FOUND`},
            {type:"success", text:"ACCESS KEY VERIFIED"},
            {type:"normal",  text:"LOADING STAFF RECORD..."},
            {type:"normal",  text:`NAME : ${staff.name}`},
            {type:"normal",  text:`STATUS : ${staff.status.toUpperCase()}`},
            {type:"success", text:`CLEARANCE : ${staff.level}`}
        ];

        if(staff.level === "ADMIN"){
            lines.push({type:"success", text:"ALL SECTORS UNLOCKED"});
        }

        return lines;
    }

    if(outcome.type === "guest_empty"){
        return [
            {type:"warning", text:"CREDENTIAL CHECK FAILED"},
            {type:"normal",  text:"STANDARD AUTHENTICATION UNAVAILABLE"},
            {type:"warning", text:"ACTIVATING LEGACY RECOVERY SYSTEM"},
            {type:"normal",  text:"GUEST ARCHIVE SESSION CREATED"}
        ];
    }

    // guest_unknown
    return [
        {type:"normal",  text:`STAFF ID "${outcome.id}" — NO MATCH`},
        {type:"normal",  text:"NO MATCHING PERSONNEL RECORD"},
        {type:"warning", text:"ATTEMPTING DATABASE RECONSTRUCTION"},
        {type:"normal",  text:"GUEST ARCHIVE SESSION CREATED"}
    ];

}

function buildAuthLines(outcome){

    const lines = [];

    const fillerCount = 60;

    for(let n=0; n<fillerCount; n++){
        lines.push(pickFillerLine());
    }

    // レアなロアを1〜2個だけ、ランダムな位置に紛れ込ませる
    const loreCount =
        Math.random() < 0.5 ? 1 : 2;

    for(let n=0; n<loreCount; n++){

        const line = {
            type:"critical",
            text:authLoreCritical[Math.floor(Math.random()*authLoreCritical.length)]
        };

        const pos =
            Math.floor(Math.random() * lines.length);

        lines.splice(pos, 0, line);

    }

    // 結果に応じたログを末尾に追加（速度は変えない）
    lines.push(...buildOutcomeLines(outcome));

    return lines;

}


/* ==========================================================
   FINAL MESSAGE
========================================================== */

function buildFinalMessage(outcome){

    if(outcome.type === "staff"){
        return { text:"AUTHENTICATION SUCCESSFUL", className:"auth-final-success" };
    }

    return { text:"LEGACY RECOVERY COMPLETE", className:"auth-final-recovery" };

}


/* ==========================================================
   RUN SEQUENCE
========================================================== */

function runAuthSequence(outcome, onComplete){

    showScreen("console-screen");

    const consoleLog =
        document.getElementById("console-log");

    if(!consoleLog){
        if(onComplete) onComplete();
        return;
    }

    consoleLog.innerHTML = "";
    consoleLog.classList.remove("auth-final-mode");

    const lines =
        buildAuthLines(outcome);

    const maxVisible = 16;
    const lineSpeed = 30;

    let i = 0;

    function nextLine(){

        if(i >= lines.length){
            setTimeout(()=> showAuthFinal(outcome, onComplete), 500);
            return;
        }

        const entry = lines[i];

        const div =
            document.createElement("div");

        div.className = "console-line log-" + entry.type;
        div.textContent = entry.text;

        consoleLog.appendChild(div);

        if(consoleLog.children.length > maxVisible){
            consoleLog.removeChild(consoleLog.firstChild);
        }

        i++;

        setTimeout(nextLine, lineSpeed);

    }

    nextLine();

}

function showAuthFinal(outcome, onComplete){

    const consoleLog =
        document.getElementById("console-log");

    const final =
        buildFinalMessage(outcome);

    consoleLog.innerHTML = "";
    consoleLog.classList.add("auth-final-mode");

    const main =
        document.createElement("div");

    main.className = "auth-final " + final.className;
    main.textContent = final.text;

    consoleLog.appendChild(main);

    play(outcome.type === "staff" ? "loginSuccess" : "notification");

    setTimeout(()=>{

        const sub =
            document.createElement("div");

        sub.className = "auth-sub";
        sub.textContent = "Launching Archive Mode...";

        consoleLog.appendChild(sub);

        setTimeout(()=>{
            if(onComplete) onComplete();
        },900);

    },700);

}
