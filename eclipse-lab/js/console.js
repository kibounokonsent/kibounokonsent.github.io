/* ==========================================================
   ECLIPSE LAB
   AUTHENTICATION SEQUENCE
   console.js

   AUTHORIZE後に流れる高速ログ演出。
   ログの素材（通常/成功/警告/施設ロア）は log-pool.js を使う。

   ・大量の断片的なログを高速表示
   ・古い行は消えていく（読み切れなくてよい）
   ・まれに赤い「本物のロア」が紛れ込む
   ・最後だけ一呼吸おいて、はっきり読める結果メッセージを出す
========================================================== */


/* ==========================================================
   OUTCOME別ログ
========================================================== */

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

        if(staff.rank){
            lines.push({type:"success", text:`RANK : ${staff.rank}`});
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

    const lines =
        buildFastLog(60);

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

    play(outcome.type === "staff" ? "loginSuccess" : "recover");

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
