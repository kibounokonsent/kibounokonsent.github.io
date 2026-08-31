/* ==========================================================
   ECLIPSE LAB
   BOOT SEQUENCE
   boot.js

   フェーズ1: 電源投入（カーソル点滅 → タイトル表示）
   フェーズ2: 高速ログ（大量の断片ログ、下から積み上がる）
   フェーズ3: 静止（0.5〜1秒）
   フェーズ4: 重要ログだけをゆっくり表示 → 余韻 → WELCOMEへ
========================================================== */


/* ==========================================================
   PHASE 4: 最終ログ（施設が最低限のアーカイブに接続した、という着地）
========================================================== */

const bootFinalLines = [
    { text:"[ SYSTEM ] Finalizing recovery...",             type:"normal" },
    { text:"[ SYSTEM ] Legacy archive detected.",            type:"normal" },
    { text:"[ SYSTEM ] Personnel database unavailable.",     type:"normal" },
    { text:"[ SYSTEM ] Some archive sectors unreachable.",   type:"warning" },
    { text:"[ SYSTEM ] Public archive available.",           type:"normal" },
    { text:"[ SYSTEM ] Launching Archive Mode...",           type:"normal" }
];

const BOOT_FAST_LOG_COUNT = 55;
const BOOT_FAST_LOG_SPEED = 30;
const BOOT_FAST_LOG_MAX_VISIBLE = 14;
const BOOT_BAR_WIDTH = 20;


/* ==========================================================
   0000閲覧済みフラグ
   （プレイヤーだけが違和感を覚える、わずかな変化用）
========================================================== */

const bootGhostLines = [
    { text:"BOOT...",         type:"normal" },
    { text:"......",          type:"normal" },
    { text:"Recovering...",   type:"normal" },
    { text:"Unknown User...", type:"warning" },
    { text:"Loading...",      type:"normal" }
];

function hasSeenZero(){

    try{

        const data =
            localStorage.getItem("eclipseArchiveSave");

        if(!data) return false;

        const parsed =
            JSON.parse(data);

        return (parsed.viewed || []).includes("0000.dat");

    }
    catch(e){

        return false;

    }

}

function runBootGhostSequence(){

    if(bootBarLine){
        bootBarLine.classList.add("faded");
    }

    let i = 0;

    function next(){

        if(i >= bootGhostLines.length){
            setTimeout(finishBootSequence, 900);
            return;
        }

        const entry = bootGhostLines[i];

        const line =
            document.createElement("div");

        line.className = "boot-final-line log-" + entry.type;
        line.textContent = entry.text;

        bootLog.appendChild(line);

        i++;

        setTimeout(next, 500 + Math.random() * 400);

    }

    next();

}


/* ==========================================================
   DOM
========================================================== */

const bootScreen = document.getElementById("boot-screen");
const bootCursorLine = document.getElementById("boot-cursor-line");
const bootTitle = document.getElementById("boot-title");
const bootScanline = document.getElementById("boot-scanline");
const bootLog = document.getElementById("boot-log");
const bootBarLine = document.getElementById("boot-bar-line");
const bootBarAscii = document.getElementById("boot-bar-ascii");
const bootPercent = document.getElementById("boot-percent");

const welcomeScreen = document.getElementById("welcome-screen");
const authScreen = document.getElementById("auth-screen");
const welcomeTitle = document.getElementById("welcome-title");
const welcomeSubtitle = document.getElementById("welcome-subtitle");
const launchMessage = document.getElementById("launch-message");


/* ==========================================================
   PROGRESS BAR（高速ログの進行に連動するだけの添え物）
========================================================== */

function renderBootBar(ratio){

    if(!bootBarAscii || !bootPercent) return;

    const filled =
        Math.round(ratio * BOOT_BAR_WIDTH);

    bootBarAscii.textContent =
        "█".repeat(filled) + "░".repeat(BOOT_BAR_WIDTH - filled);

    bootPercent.textContent =
        Math.round(ratio * 100) + "%";

}


/* ==========================================================
   PHASE 2: 高速ログ
   新しい行は一番下に追加され、上限を超えたら
   一番古い行（一番上）から消えていく。
========================================================== */

function runBootFastLog(){

    const lines =
        buildFastLog(BOOT_FAST_LOG_COUNT);

    let i = 0;

    function next(){

        if(i >= lines.length){
            renderBootBar(1);
            setTimeout(runBootPause, 250);
            return;
        }

        const entry = lines[i];

        const line =
            document.createElement("div");

        line.className = "boot-fast-line log-" + entry.type;
        line.textContent = entry.text;

        bootLog.appendChild(line);

        if(bootLog.children.length > BOOT_FAST_LOG_MAX_VISIBLE){
            bootLog.removeChild(bootLog.firstChild);
        }

        renderBootBar(i / lines.length);

        i++;

        setTimeout(next, BOOT_FAST_LOG_SPEED);

    }

    next();

}


/* ==========================================================
   PHASE 3: 静止
========================================================== */

function runBootPause(){

    if(bootBarLine){
        bootBarLine.classList.add("faded");
    }

    setTimeout(runBootFinalReveal, 700);

}


/* ==========================================================
   PHASE 4: 重要ログをゆっくり表示
========================================================== */

function runBootFinalReveal(){

    bootLog.innerHTML = "";

    let i = 0;

    function next(){

        if(i >= bootFinalLines.length){
            setTimeout(finishBootSequence, 1300);
            return;
        }

        const entry = bootFinalLines[i];

        const line =
            document.createElement("div");

        line.className = "boot-final-line log-" + entry.type;
        line.textContent = entry.text;

        bootLog.appendChild(line);

        i++;

        setTimeout(next, 400 + Math.random() * 400);

    }

    next();

}


/* ==========================================================
   フェードアウト → WELCOMEへ
========================================================== */

function finishBootSequence(){

    play("latch");

    setTimeout(()=>{

        if(bootScreen){
            bootScreen.classList.add("fade-out");
        }

        setTimeout(showWelcome, 1200);

    },500);

}


/* ==========================================================
   PHASE 1: 電源投入
========================================================== */

function startBoot(){

    if(!bootScreen) return;

    play("powerOn");

    if(bootCursorLine){
        bootCursorLine.classList.add("visible");
    }

    setTimeout(()=>{

        if(bootCursorLine){
            bootCursorLine.classList.remove("visible");
        }

        if(bootTitle){
            bootTitle.classList.add("visible");
        }

        if(bootScanline){
            bootScanline.classList.add("sweep");
        }

        setTimeout(()=>{

            play("shortBeep");

            if(hasSeenZero()){
                runBootGhostSequence();
            }
            else{
                runBootFastLog();
            }

        },400);

    },500);

}


/* ==========================================================
   SHOW WELCOME
========================================================== */

function showWelcome(){

    if(
        !welcomeScreen ||
        !welcomeTitle ||
        !welcomeSubtitle ||
        !launchMessage
    ){
        return;
    }

    showScreen("welcome-screen");

    welcomeTitle.style.opacity = 0;
    welcomeSubtitle.style.opacity = 0;
    launchMessage.style.opacity = 0;

    setTimeout(()=>{ welcomeTitle.style.opacity = 1; },300);
    setTimeout(()=>{ welcomeSubtitle.style.opacity = 1; },1000);

    setTimeout(()=>{

        launchMessage.style.opacity = 1;
        enableWelcomeStart();

    },1800);

}


/* ==========================================================
   WELCOME START INPUT
========================================================== */

function enableWelcomeStart(){

    let started = false;

    function proceed(){

        if(started) return;

        started = true;

        document.removeEventListener("keydown", keyHandler);
        document.removeEventListener("click", proceed);

        startLogin();

    }

    function keyHandler(e){
        if(e.key === "Enter"){
            proceed();
        }
    }

    document.addEventListener("keydown", keyHandler);
    document.addEventListener("click", proceed);

}


/* ==========================================================
   START LOGIN
========================================================== */

function startLogin(){

    play("click");

    if(!authScreen) return;

    showScreen("auth-screen");

    setTimeout(()=>{

        const input =
            document.getElementById("staff-id");

        if(input){
            input.focus();
        }

    },100);

    if(hasSeenZero()){

        const welcomeBack =
            document.getElementById("welcome-back");

        if(welcomeBack){

            setTimeout(()=>{ welcomeBack.classList.add("show"); },300);
            setTimeout(()=>{ welcomeBack.classList.remove("show"); },1800);

        }

    }

}


/* ==========================================================
   WELCOME EFFECT（点滅する開始メッセージ）
========================================================== */

function startWelcomeEffect(){

    if(!welcomeScreen || !launchMessage) return;

    let visible = true;

    setInterval(()=>{

        if(welcomeScreen.classList.contains("hidden")) return;

        launchMessage.style.opacity = visible ? "1" : ".25";
        visible = !visible;

    },700);

}


/* ==========================================================
   START
========================================================== */

window.addEventListener("load", ()=>{
    startBoot();
    startWelcomeEffect();
});
