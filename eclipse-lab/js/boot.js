/* ==========================================================
   ECLIPSE LAB
   BOOT SEQUENCE
   boot.js

   フェーズ1: 電源投入（カーソル点滅 → タイトル表示）
   フェーズ2: システム起動ログ（1文字ずつタイプ）
   フェーズ3: 進捗バー（ASCII、ログと連動）
   フェーズ4: ARCHIVE MODE READY → フェードアウト
========================================================== */


/* ==========================================================
   BOOT LOG DATA
========================================================== */

const bootLogLines = [
    "[ SYSTEM ] Power restored.",
    "[ OK ] Core initialized.",
    "Recovering archive...",
    "Reading encrypted sectors...",
    "[ WARNING ] Unstable sector detected.",
    "[ OK ] Memory check.",
    "Synchronizing node...",
    "Checking personnel records...",
    "[ OK ] Archive interface loaded.",
    "[ INFO ] Establishing secure session..."
];

const BOOT_BAR_WIDTH = 20;


/* ==========================================================
   DOM
========================================================== */

const bootScreen = document.getElementById("boot-screen");
const bootCursorLine = document.getElementById("boot-cursor-line");
const bootTitle = document.getElementById("boot-title");
const bootScanline = document.getElementById("boot-scanline");
const bootLog = document.getElementById("boot-log");
const bootBarAscii = document.getElementById("boot-bar-ascii");
const bootPercent = document.getElementById("boot-percent");
const bootReady = document.getElementById("boot-ready");

const welcomeScreen = document.getElementById("welcome-screen");
const authScreen = document.getElementById("auth-screen");
const welcomeTitle = document.getElementById("welcome-title");
const welcomeSubtitle = document.getElementById("welcome-subtitle");
const launchMessage = document.getElementById("launch-message");


/* ==========================================================
   PHASE 3: ASCII PROGRESS BAR
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
   PHASE 2: LOG TYPING
========================================================== */

function typeBootLine(text, onDone){

    const line =
        document.createElement("div");

    line.className =
        "boot-line" + (text.indexOf("[ WARNING ]") === 0 ? " boot-line-warning" : "");

    bootLog.appendChild(line);

    let i = 0;

    function step(){

        if(i < text.length){

            line.textContent += text[i];
            i++;
            setTimeout(step, 9);

        }
        else if(onDone){

            onDone();

        }

    }

    step();

}

function runBootLog(index){

    if(index >= bootLogLines.length){
        finishBootSequence();
        return;
    }

    typeBootLine(bootLogLines[index], ()=>{

        renderBootBar((index + 1) / bootLogLines.length);

        setTimeout(()=> runBootLog(index + 1), 70);

    });

}


/* ==========================================================
   PHASE 4: READY → FADE OUT
========================================================== */

function finishBootSequence(){

    setTimeout(()=>{

        if(bootReady){
            bootReady.classList.add("visible");
        }

        play("latch");

        setTimeout(()=>{

            if(bootScreen){
                bootScreen.classList.add("fade-out");
            }

            setTimeout(showWelcome, 1200);

        },500);

    },300);

}


/* ==========================================================
   PHASE 1: POWER ON
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
            runBootLog(0);

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
