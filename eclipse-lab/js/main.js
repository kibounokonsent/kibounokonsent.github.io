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



    EclipseMain.state="BOOTING";



    showScreen(

        "boot-screen"

    );



}


/* ==========================================================
   LOGIN COMPLETE
========================================================== */


function loginComplete(user,level){


    console.log(
        "LOGIN COMPLETE:",
        user,
        level
    );



    if(
        typeof setSystemUser === "function"
    ){

        setSystemUser(
            user,
            level
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