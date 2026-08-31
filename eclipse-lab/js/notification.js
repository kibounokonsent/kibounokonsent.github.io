/* ==========================================================
   ECLIPSE LAB
   NOTIFICATION MANAGER
   notification.js
========================================================== */


/* ==========================================================
   NOTIFICATION QUEUE
========================================================== */


const NotificationSystem = {


    queue:[],


    active:false


};





/* ==========================================================
   SHOW NOTIFICATION
========================================================== */


function showNotification(message,type="normal"){


    NotificationSystem.queue.push({


        text:message,


        type:type


    });



    processNotification();


}





/* ==========================================================
   PROCESS
========================================================== */


function processNotification(){


    if(NotificationSystem.active)return;


    if(NotificationSystem.queue.length===0)return;



    const data=

        NotificationSystem.queue.shift();



    NotificationSystem.active=true;



    createNotification(data);



}





/* ==========================================================
   CREATE
========================================================== */


function createNotification(data){


    const box=

        document.createElement("div");



    box.className=

        "system-notification";



    box.innerHTML=

`

<div class="notification-title">

SYSTEM NOTIFICATION

</div>


<div class="notification-text">

${data.text}

</div>

`;



    document.body.appendChild(box);



    play("notification");



    setTimeout(()=>{


        box.classList.add(

            "hide"

        );



    },3000);



    setTimeout(()=>{


        box.remove();



        NotificationSystem.active=false;



        processNotification();



    },3500);



}