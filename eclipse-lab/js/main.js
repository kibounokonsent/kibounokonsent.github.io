/* ==========================================================
   ECLIPSE LAB
   MAIN CONTROLLER
   main.js
========================================================== */


/* ==========================================================
   SYSTEM INITIALIZE
========================================================== */


const EclipseMain = {


    state:"STARTING",


    screen:"boot"


};





/* ==========================================================
   SCREEN CONTROL
========================================================== */


function showScreen(id){


    document

    .querySelectorAll("section[id$='-screen']")

    .forEach(section=>{


        section.classList.add(

            "hidden"

        );


    });



    const target=

        document.getElementById(id);



    if(target){


        target.classList.remove(

            "hidden"

        );


    }


    if(typeof EclipseMain !== "undefined"){

        EclipseMain.screen = id;

    }


}





/* ==========================================================
   SYSTEM START
========================================================== */


function startEclipseSystem(){


    console.log(

        "ECLIPSE LAB SYSTEM START"

    );


    const savedUser =
        (typeof restoreUserSession === "function")
            ? restoreUserSession()
            : null;

    if(savedUser){

        if(typeof setSystemUser === "function"){
            setSystemUser(
                savedUser.name,
                savedUser.level,
                savedUser.rank,
                savedUser.employeeId
            );
        }

        EclipseMain.state = "AUTHENTICATED";

        showScreen("explorer-screen");

        if(typeof initializeExplorer === "function"){
            initializeExplorer();
        }

        console.log("SESSION RESTORED:", savedUser.name);

        return;

    }


    EclipseMain.state="BOOTING";



    showScreen(

        "boot-screen"

    );



}


/* ==========================================================
   LOGIN COMPLETE
========================================================== */


function loginComplete(user,level,rank){


    console.log(
        "LOGIN COMPLETE:",
        user,
        level,
        rank
    );



    if(
        typeof setSystemUser === "function"
    ){

        setSystemUser(
            user,
            level,
            rank
        );

    }



    if(
        typeof EclipseMain !== "undefined"
    ){

        EclipseMain.state =
            "AUTHENTICATED";

    }



    const authScreen =
        document.getElementById(
            "auth-screen"
        );


    if(authScreen){

        authScreen.classList.add(
            "hidden"
        );

    }



    if(typeof showScreen === "function"){

        showScreen("explorer-screen");

        console.log(
            "EXPLORER SCREEN ACTIVE"
        );

    }
    else{

        console.error(
            "showScreen NOT FOUND"
        );

    }












    /*
        Explorer初期化
    */


    if(
        typeof initializeExplorer === "function"
    ){

        initializeExplorer();

    }
    else{

        console.warn(
            "initializeExplorer missing"
        );

    }



}








/* ==========================================================
   SHUTDOWN
========================================================== */


function shutdownSystem(){


    play(
        "shutdown"
    );



    if(
        typeof EclipseMain !== "undefined"
    ){

        EclipseMain.state =
            "OFFLINE";

    }



    document.body.innerHTML =

`

<div class="shutdown-screen">


ECLIPSE LAB SYSTEM OFFLINE


</div>


`;



}








/* ==========================================================
   START
========================================================== */


window.addEventListener(

    "load",

    ()=>{


        if(
            typeof startEclipseSystem === "function"
        ){

            startEclipseSystem();

        }
        else{

            console.error(
                "startEclipseSystem missing"
            );

        }


    }

);

/* ==========================================================
   LOG OUT
   セッションを消去し、ログイン画面へ戻る（起動アニメーションは
   再生しない）。
========================================================== */

function showLogoutOverlay(message){

    let overlay =
        document.getElementById("logout-overlay");

    if(!overlay){

        overlay = document.createElement("div");
        overlay.id = "logout-overlay";

        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "9999";
        overlay.style.background = "#000";
        overlay.style.color = "#8fd7a8";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontFamily = "Consolas, monospace";
        overlay.style.fontSize = "18px";
        overlay.style.letterSpacing = "2px";
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .3s";

        document.body.appendChild(overlay);

        requestAnimationFrame(()=>{
            overlay.style.opacity = "1";
        });

    }

    overlay.textContent = message;

    return overlay;

}

function removeLogoutOverlay(){

    const overlay =
        document.getElementById("logout-overlay");

    if(!overlay) return;

    overlay.style.opacity = "0";

    setTimeout(()=>{
        if(overlay.parentNode){
            overlay.parentNode.removeChild(overlay);
        }
    }, 300);

}

function logoutUser(){

    showLogoutOverlay("ログアウトしています…");

    setTimeout(()=>{

        showLogoutOverlay("セッションを終了しました");

        setTimeout(()=>{

            showLogoutOverlay("再起動…");

            setTimeout(()=>{

                if(typeof clearUserSession === "function"){
                    clearUserSession();
                }

                EclipseMain.state = "LOGGED_OUT";

                showScreen("auth-screen");

                removeLogoutOverlay();

            }, 900);

        }, 900);

    }, 900);

}

window.addEventListener("load", ()=>{

    const logoutButton =
        document.getElementById("switch-user");

    if(logoutButton){

        logoutButton.addEventListener("click", logoutUser);

    }

});
