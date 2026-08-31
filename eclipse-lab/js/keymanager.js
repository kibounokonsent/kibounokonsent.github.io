/* ==========================================================
   ECLIPSE LAB
   ACCESS KEY MANAGER
   keymanager.js
========================================================== */


/* ==========================================================
   KEY DATA
========================================================== */


let discoveredKeys = [];





/* ==========================================================
   LOAD KEYS
========================================================== */


function loadKeys(){


    const data =

        localStorage.getItem(

            "eclipseKeys"

        );



    if(data){


        discoveredKeys=

            JSON.parse(data);


    }


}





/* ==========================================================
   SAVE KEYS
========================================================== */


function saveKeys(){


    localStorage.setItem(

        "eclipseKeys",

        JSON.stringify(

            discoveredKeys

        )

    );


}





/* ==========================================================
   DISCOVER KEY
========================================================== */


function discoverKey(id,key){



    const exists=

        discoveredKeys.some(

            item=>

                item.id===id

        );



    if(exists)return;



    discoveredKeys.push({


        id:id,


        key:key


    });



    saveKeys();



    play("secret");



    showNotification(

        "ACCESS KEY RECOVERED : "

        +

        id

    );


}





/* ==========================================================
   CHECK KEY
========================================================== */


function checkRecoveredKey(id,key){



    return discoveredKeys.some(

        item=>


            item.id===id

            &&

            item.key===key



    );


}





/* ==========================================================
   START
========================================================== */


window.addEventListener(

    "load",

    ()=>{


        loadKeys();


    }

);

