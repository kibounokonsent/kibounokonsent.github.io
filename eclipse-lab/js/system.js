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


        level:"NONE"


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


function setSystemUser(name,level){


    EclipseSystem.user.name=name;


    EclipseSystem.user.level=level;



}





function getSystemUser(){


    return EclipseSystem.user;


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