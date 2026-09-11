/* ==========================================================
   ECLIPSE LAB
   SYSTEM MANAGER
   system.js
========================================================== */


/* ==========================================================
   SYSTEM DATA
========================================================== */


const EclipseSystem = {


    version:"1.0.0",


    mode:"ARCHIVE",


    user:{


        name:null,


        level:"NONE",


        rank:null,


        employeeId:null,


    },


    status:{


        online:true,


        recovery:false,


        damaged:false


    }


};





/* ==========================================================
   USER
========================================================== */


function setSystemUser(name,level,rank,employeeId){


    EclipseSystem.user.name=name;


    EclipseSystem.user.level=level;


    EclipseSystem.user.rank=rank||null;


    EclipseSystem.user.employeeId=employeeId||null;



}





function getSystemUser(){


    return EclipseSystem.user;


}


/* ==========================================================
   SESSION PERSISTENCE
   ページ再読み込み（F5）ではログイン状態を維持する。
   LOG OUTが押されたときだけセッションを消去する。
========================================================== */

function saveUserSession(){

    localStorage.setItem(
        "eclipseUserSession",
        JSON.stringify(EclipseSystem.user)
    );

}

function restoreUserSession(){

    try{

        const raw =
            localStorage.getItem("eclipseUserSession");

        if(!raw) return null;

        const saved = JSON.parse(raw);

        if(!saved || !saved.name) return null;

        return saved;

    }
    catch(e){

        return null;

    }

}

function clearUserSession(){

    localStorage.removeItem("eclipseUserSession");

    EclipseSystem.user = {
        name:null,
        level:"NONE",
        rank:null,
        employeeId:null
    };

}





/* ==========================================================
   MODE
========================================================== */


function setSystemMode(mode){


    EclipseSystem.mode=mode;


}





function getSystemMode(){


    return EclipseSystem.mode;


}





/* ==========================================================
   STATUS
========================================================== */


function setSystemStatus(type,value){


    EclipseSystem.status[type]=value;


}





function getSystemStatus(){


    return EclipseSystem.status;


}





/* ==========================================================
   DEBUG
========================================================== */


function systemDebug(){


    console.log(

        "=== Eclipse Lab System ==="

    );


    console.log(

        EclipseSystem

    );


}