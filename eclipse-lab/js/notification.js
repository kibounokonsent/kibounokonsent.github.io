/* ==========================================================
   ECLIPSE LAB
   NOTIFICATION MANAGER
   notification.js

   2つの独立したレイヤーを持つ：

   1. トースト（画面下に一瞬出て消える演出。従来通り）
   2. 通知履歴（右上の「通知履歴」ボタンから開くパネル。
      localStorageに永続化され、既読/未読を個別に持つ。
      ファイルの既読状態（archiveSave.viewed）とは別物。
      通知を確認しただけでは、対応する記録は既読にならない）
========================================================== */


/* ==========================================================
   NOTIFICATION QUEUE（トースト用）
========================================================== */


const NotificationSystem = {

    queue:[],

    active:false

};


/* ==========================================================
   NOTIFICATION HISTORY（永続履歴）
========================================================== */

let notificationHistory = [];

function loadNotificationHistory(){

    try{

        const data =
            localStorage.getItem("eclipseNotificationHistory");

        if(data){
            notificationHistory = JSON.parse(data);
        }

    }
    catch(e){

        notificationHistory = [];

    }

}

function saveNotificationHistory(){

    localStorage.setItem(
        "eclipseNotificationHistory",
        JSON.stringify(notificationHistory)
    );

}

function addNotificationHistoryEntry(message, type, unlockKey){

    notificationHistory.unshift({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        message: message,
        type: type || "normal",
        timestamp: Date.now(),
        read: false,
        unlockKey: unlockKey || null
    });

    saveNotificationHistory();

    renderNotificationHistoryPanel();
    updateNotificationHistoryBadge();

}

function markNotificationRead(id){

    const entry =
        notificationHistory.find(n=> n.id === id);

    if(!entry || entry.read) return;

    entry.read = true;

    saveNotificationHistory();

    updateNotificationHistoryBadge();

}

function formatNotificationTime(timestamp){

    const date =
        new Date(timestamp);

    const hh =
        String(date.getHours()).padStart(2, "0");

    const mm =
        String(date.getMinutes()).padStart(2, "0");

    return hh + ":" + mm;

}

function renderNotificationHistoryPanel(){

    const list =
        document.getElementById("notification-history-list");

    if(!list) return;

    list.innerHTML = "";

    if(notificationHistory.length === 0){

        const empty =
            document.createElement("div");

        empty.className = "notification-history-empty";
        empty.textContent = "まだ通知はありません。";

        list.appendChild(empty);
        return;

    }

    notificationHistory.forEach(entry=>{

        const item =
            document.createElement("div");

        item.className =
            "notification-history-item" + (entry.read ? "" : " unread");

        item.innerHTML = `
            <div class="notification-history-text">${entry.message}</div>
            <div class="notification-history-time">${formatNotificationTime(entry.timestamp)}</div>
        `;

        item.addEventListener("click", ()=>{

            markNotificationRead(entry.id);
            item.classList.remove("unread");

            if(
                entry.unlockKey &&
                typeof archiveData !== "undefined" &&
                archiveData[entry.unlockKey] &&
                typeof openFolder === "function"
            ){

                setNotificationHistoryPanelVisible(false);
                openFolder(entry.unlockKey);

            }

        });

        list.appendChild(item);

    });

}

function updateNotificationHistoryBadge(){

    const badge =
        document.getElementById("notification-history-badge");

    if(!badge) return;

    const hasUnread =
        notificationHistory.some(n=> !n.read);

    badge.classList.toggle("visible", hasUnread);

}

function setNotificationHistoryPanelVisible(visible){

    const panel =
        document.getElementById("notification-history-panel");

    if(!panel) return;

    panel.classList.toggle("hidden", !visible);

    if(visible){
        renderNotificationHistoryPanel();
    }

}

function toggleNotificationHistoryPanel(){

    const panel =
        document.getElementById("notification-history-panel");

    if(!panel) return;

    setNotificationHistoryPanelVisible(panel.classList.contains("hidden"));

}


/* ==========================================================
   SHOW NOTIFICATION
========================================================== */


function showNotification(message, type = "normal", unlockKey = null){

    addNotificationHistoryEntry(message, type, unlockKey);

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


/* ==========================================================
   START
========================================================== */

window.addEventListener("load", ()=>{

    loadNotificationHistory();
    renderNotificationHistoryPanel();
    updateNotificationHistoryBadge();

    const toggleButton =
        document.getElementById("notification-history-toggle");

    if(toggleButton){
        toggleButton.addEventListener("click", toggleNotificationHistoryPanel);
    }

    const closeButton =
        document.getElementById("notification-history-close");

    if(closeButton){
        closeButton.addEventListener("click", ()=> setNotificationHistoryPanelVisible(false));
    }

});
