/* ==========================================================
   ECLIPSE LAB
   NOTIFICATION MANAGER
   notification.js
========================================================== */


/* ==========================================================
   NOTIFICATION QUEUE
========================================================== */

const NotificationSystem = {
    queue: [],
    active: false,
    panelVisible: true,
    panelList: null,
    toggleButton: null,
    reopenButton: null
};

function focusNotificationItem(item){
    if (!item) return;

    setNotificationPanelVisible(true);
    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
    item.classList.add("notification-focused");
    setTimeout(() => {
        item.classList.remove("notification-focused");
    }, 1200);
}

function ensureNotificationPanel(){
    const panel = document.getElementById("notification");
    if (!panel) return null;

    if (!NotificationSystem.panelList) {
        NotificationSystem.panelList = document.getElementById("notification-list");
    }

    if (!NotificationSystem.toggleButton) {
        NotificationSystem.toggleButton = document.getElementById("notification-toggle");
        if (NotificationSystem.toggleButton) {
            NotificationSystem.toggleButton.addEventListener("click", () => {
                toggleNotificationPanel();
            });
        }
    }

    if (!NotificationSystem.reopenButton) {
        NotificationSystem.reopenButton = document.getElementById("notification-reopen");
        if (NotificationSystem.reopenButton) {
            NotificationSystem.reopenButton.addEventListener("click", () => {
                setNotificationPanelVisible(true);
            });
        }
    }

    return panel;
}

function setNotificationPanelVisible(visible){
    const panel = ensureNotificationPanel();
    if (!panel) return;

    NotificationSystem.panelVisible = visible;
    panel.classList.toggle("collapsed", !visible);

    if (NotificationSystem.toggleButton) {
        NotificationSystem.toggleButton.textContent = visible ? "HIDE" : "SHOW";
    }

    if (NotificationSystem.reopenButton) {
        NotificationSystem.reopenButton.style.display = visible ? "none" : "flex";
    }
}

function toggleNotificationPanel(){
    setNotificationPanelVisible(!NotificationSystem.panelVisible);
}

function addNotificationToPanel(message, type = "normal"){
    const panel = ensureNotificationPanel();
    if (!panel || !NotificationSystem.panelList) return;

    const item = document.createElement("button");
    item.type = "button";
    item.className = `notification-item ${type}`;
    item.textContent = message;
    item.addEventListener("click", () => {
        focusNotificationItem(item);
    });

    NotificationSystem.panelList.prepend(item);
}

/* ==========================================================
   SHOW NOTIFICATION
========================================================== */

function showNotification(message, type = "normal"){
    addNotificationToPanel(message, type);
    NotificationSystem.queue.push({ text: message, type: type });
    processNotification();
}

if (document.readyState !== "loading") {
    ensureNotificationPanel();
    setNotificationPanelVisible(true);
} else {
    document.addEventListener("DOMContentLoaded", () => {
        ensureNotificationPanel();
        setNotificationPanelVisible(true);
    });
}

/* ==========================================================
   PROCESS
========================================================== */

function processNotification(){
    if (NotificationSystem.active) return;
    if (NotificationSystem.queue.length === 0) return;

    const data = NotificationSystem.queue.shift();
    NotificationSystem.active = true;
    createNotification(data);
}

/* ==========================================================
   CREATE
========================================================== */

function createNotification(data){
    const box = document.createElement("div");
    box.className = "system-notification";

    box.innerHTML = `
<div class="notification-title">SYSTEM NOTIFICATION</div>
<div class="notification-text">${data.text}</div>
`;

    document.body.appendChild(box);
    play("notification");

    setTimeout(() => {
        box.classList.add("hide");
    }, 3000);

    setTimeout(() => {
        box.remove();
        NotificationSystem.active = false;
        processNotification();
    }, 3500);
}
