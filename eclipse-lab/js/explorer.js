/* ==========================================================
   ECLIPSE LAB
   EXPLORER SYSTEM
   explorer.js

   表示するデータは data.js（archiveData / lockedArchives）を
   参照する。新しいフォルダやファイルを増やしたいときは
   このファイルではなく data.js を編集する。
========================================================== */


/* ==========================================================
   DOM
========================================================== */

const fileList =
    document.getElementById("file-list");

const viewerTitle =
    document.getElementById("viewer-title");

const viewerContent =
    document.getElementById("viewer-content");

const sidebar =
    document.getElementById("sidebar");

const pathBar =
    document.getElementById("path");

const accessLevelBadge =
    document.querySelector("#status-bar span:nth-child(2)");


/* ==========================================================
   CURRENT STATE
========================================================== */

let currentFolder = "welcome";
let currentFile = null;


/* ==========================================================
   PERMISSION
========================================================== */

function checkPermission(file){

    if(!file.permission) return true;

    const level =
        getSystemUser().level;

    switch(file.permission){

        case "public":
            return true;

        case "archive":
            return level === "ARCHIVE" || level === "UNKNOWN" || level === "ADMIN";

        case "unknown":
            return level === "UNKNOWN" || level === "ADMIN";

        case "secret":
            return level === "ADMIN";

        default:
            return false;
    }

}

function isHiddenFile(file){
    return file.hidden === true;
}

function filterVisibleFiles(files){

    const level =
        getSystemUser().level;

    return files.filter(file=>{

        if(isHiddenFile(file)){
            return level === "UNKNOWN" || level === "ADMIN";
        }

        return true;

    });

}


/* ==========================================================
   FOLDER
========================================================== */

function openFolder(key){

    const data =
        archiveData[key];

    if(!data) return;

    currentFolder = key;

    play("folder");

    renderFiles(data.files);

}

function createArchiveFolder(key, def){

    if(document.querySelector(`[data-folder='${key}']`)) return;

    const folder =
        document.createElement("div");

    folder.className = "folder";
    folder.dataset.folder = key;
    folder.textContent = (def.icon || "📁") + " " + def.name;

    folder.addEventListener("mouseenter", ()=> play("hover"));
    folder.addEventListener("click", ()=> openFolder(key));

    sidebar.appendChild(folder);

}


/* ==========================================================
   FILE LIST
========================================================== */

function renderFiles(files){

    fileList.innerHTML = "";

    const visibleFiles =
        filterVisibleFiles(files);

    visibleFiles.forEach(file=>{

        const item =
            document.createElement("div");

        item.className = "file";
        item.textContent = (file.hidden ? "🔓 " : "📄 ") + file.name;

        item.addEventListener("mouseenter", ()=> play("hover"));

        item.addEventListener("click", ()=>{

            document.querySelectorAll(".file").forEach(el=> el.classList.remove("selected"));
            item.classList.add("selected");

            openFile(file);

        });

        fileList.appendChild(item);

    });

}


/* ==========================================================
   FILE STATUS BADGE
========================================================== */

function displayFileStatus(file){

    switch(file.status){

        case "damaged":
            return "[ WARNING ]\nFILE DAMAGE DETECTED.\nSome information may be lost.";

        case "locked":
            return "[ LOCKED ]\nACCESS PERMISSION REQUIRED.";

        case "recovered":
            return "[ RECOVERED ]\nRestored from damaged archive.";

        default:
            return "";
    }

}

function renderFileView(file){

    viewerContent.innerHTML = "";

    const status =
        displayFileStatus(file);

    if(status){

        const statusBox =
            document.createElement("div");

        statusBox.className = "file-status";
        statusBox.textContent = status;

        viewerContent.appendChild(statusBox);

    }

    const text =
        document.createElement("pre");

    text.textContent = file.content;

    viewerContent.appendChild(text);

}

function showPermissionError(file){

    play("error");

    viewerTitle.textContent = file.name;

    viewerContent.innerHTML = "";

    const box =
        document.createElement("div");

    box.className = "permission-error";
    box.innerHTML =
        `ACCESS DENIED<br><br>REQUIRED LEVEL:<br>${file.permission}<br><br>YOUR LEVEL:<br>${getSystemUser().level}`;

    viewerContent.appendChild(box);

}


/* ==========================================================
   OPEN FILE
========================================================== */

function openFile(file){

    currentFile = file;

    play("fileOpen");

    updatePath();

    if(!checkPermission(file)){
        showPermissionError(file);
        return;
    }

    viewerTitle.textContent = file.name;

    renderFileView(file);

    recordFileView(file);

    if(file.unlocksArchive){
        unlockArchive(file.unlocksArchive);
    }

}


/* ==========================================================
   PATH / STATUS DISPLAY
========================================================== */

function updatePath(){

    if(!pathBar) return;

    const folderName =
        archiveData[currentFolder] ? archiveData[currentFolder].name : "";

    pathBar.textContent =
        "Archive / " + folderName + (currentFile ? " / " + currentFile.name : "");

}

function updateAccessDisplay(){

    if(!accessLevelBadge) return;

    accessLevelBadge.textContent =
        "ACCESS LEVEL : " + getSystemUser().level;

}


/* ==========================================================
   LOCKED ARCHIVE UNLOCK SYSTEM
========================================================== */

function unlockArchive(key, options = {}){

    if(archiveData[key]) return;

    const def =
        lockedArchives[key];

    if(!def) return;

    archiveData[key] = {
        name: def.name,
        files: def.files
    };

    createArchiveFolder(key, def);

    if(!options.silent){
        play("secret");
        showNotification(def.name + " Unlocked");
    }

    recordUnlock(key);

}

function checkLevelUnlocks(){

    const level =
        getSystemUser().level;

    Object.keys(lockedArchives).forEach(key=>{

        const def = lockedArchives[key];

        if(def.trigger !== "level") return;
        if(archiveData[key]) return;

        if(level === def.requiredLevel){
            unlockArchive(key);
        }

    });

}


/* ==========================================================
   SAVE DATA（閲覧履歴・解除済みアーカイブ）
========================================================== */

let archiveSave = {
    unlocked: [],
    viewed: []
};

function loadArchiveSave(){

    const data =
        localStorage.getItem("eclipseArchiveSave");

    if(data){
        archiveSave = JSON.parse(data);
    }

}

function saveArchive(){

    localStorage.setItem(
        "eclipseArchiveSave",
        JSON.stringify(archiveSave)
    );

}

function recordFileView(file){

    if(!archiveSave.viewed.includes(file.name)){
        archiveSave.viewed.push(file.name);
    }

    saveArchive();

}

function recordUnlock(key){

    if(!archiveSave.unlocked.includes(key)){
        archiveSave.unlocked.push(key);
    }

    saveArchive();

}

function restorePreviousUnlocks(){

    archiveSave.unlocked.forEach(key=>{
        unlockArchive(key, { silent:true });
    });

}


/* ==========================================================
   STATIC FOLDER EVENTS（HTMLに最初から存在するフォルダ）
========================================================== */

document.querySelectorAll(".folder").forEach(folder=>{

    folder.addEventListener("mouseenter", ()=> play("hover"));

    folder.addEventListener("click", ()=>{
        openFolder(folder.dataset.folder);
    });

});


/* ==========================================================
   START EXPLORER
========================================================== */

function initializeExplorer(){

    loadArchiveSave();
    restorePreviousUnlocks();

    updateAccessDisplay();
    checkLevelUnlocks();

    openFolder("welcome");

}

window.addEventListener("load", ()=>{
    initializeExplorer();
});
