/* ==========================================================
   ECLIPSE LAB
   AUDIO MANAGER
   audio.js
========================================================== */


/* ==========================================================
   AUDIO DATABASE
========================================================== */


const EclipseAudio = {


    powerOn:
        "audio/power_click.mp3",


    shortBeep:
        "audio/short_beep.mp3",


    latch:
        "audio/latch.mp3",


    click:
        "audio/click.mp3",


    error:
        "audio/error.mp3",


    fileOpen:
        "audio/file_open.mp3",


    folder:
        "audio/folder_open.mp3",


    hover:
        "audio/hover.mp3",


    loginFail:
        "audio/login_fail.mp3",


    loginSuccess:
        "audio/login_success.mp3",


    notification:
        "audio/notification.mp3",


    popup:
        "audio/popup.mp3",


    recover:
        "audio/recover.mp3",


    secret:
        "audio/secret.mp3",


    shutdown:
        "audio/shutdown.mp3",


    type:
        "audio/type.mp3",


    warning:
        "audio/warning.mp3"


};





/* ==========================================================
   AUDIO OBJECT
========================================================== */


const audioCache={};





/* ==========================================================
   LOAD AUDIO
========================================================== */


function loadAudio(){


    Object.keys(EclipseAudio)

    .forEach(key=>{


        audioCache[key]=

            new Audio(

                EclipseAudio[key]

            );


    });


}





/* ==========================================================
   PLAY
========================================================== */


function play(name){


    const sound=

        audioCache[name];



    if(!sound)return;



    sound.currentTime=0;


    sound.play()

    .catch(()=>{});


}





/* ==========================================================
   VOLUME
========================================================== */


function setVolume(value){


    Object.values(audioCache)

    .forEach(audio=>{


        audio.volume=value;


    });


}





/* ==========================================================
   START
========================================================== */


window.addEventListener(

    "load",

    ()=>{


        loadAudio();


        setVolume(0.6);


    }

);