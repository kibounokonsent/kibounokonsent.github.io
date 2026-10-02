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
        "audio/powerOn.mp3",


    shortBeep:
        "audio/shortBeep.mp3",


    latch:
        "audio/latch.mp3",


    click:
        "audio/click.mp3",


    error:
        "audio/error.mp3",


    fileOpen:
        "audio/fileOpen.mp3",


    folder:
        "audio/folder.mp3",


    hover:
        "audio/hover.mp3",


    loginFail:
        "audio/loginFail.mp3",


    loginSuccess:
        "audio/loginSuccess.mp3",


    notification:
        "audio/notification.mp3",


    recover:
        "audio/recover.wav",


    secret:
        "audio/secret.mp3"


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
   MUTE TOGGLE
========================================================== */


let isMuted = false;
const savedVolume = 0.6;


function toggleMute(){

    isMuted = !isMuted;

    setVolume(isMuted ? 0 : savedVolume);

    const button =
        document.getElementById("mute-toggle");

    if(button){
        button.textContent = isMuted ? "🔇" : "🔊";
    }

}


/* ==========================================================
   START
========================================================== */


window.addEventListener(

    "load",

    ()=>{


        loadAudio();


        setVolume(savedVolume);


        const muteButton =
            document.getElementById("mute-toggle");

        if(muteButton){
            muteButton.addEventListener("click", toggleMute);
        }


    }

);