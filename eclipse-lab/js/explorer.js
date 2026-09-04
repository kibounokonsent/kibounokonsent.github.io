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

const viewer =
    document.getElementById("viewer");

const sidebar =
    document.getElementById("sidebar");

const pathBar =
    document.getElementById("path");

const accessLevelBadge =
    document.querySelector("#status-bar span:nth-child(2)");

const clearanceBadge =
    document.getElementById("clearance-badge");

const clearanceTopbar =
    document.getElementById("clearance-topbar");


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

        case "bronze":
            return getRankValue(getSystemUser().rank) >= rankOrder.BRONZE;

        case "silver":
            return getRankValue(getSystemUser().rank) >= rankOrder.SILVER;

        case "gold":
            return getRankValue(getSystemUser().rank) >= rankOrder.GOLD;

        case "platinum":
            return getSystemUser().rank === "PLATINUM";

        default:
            return false;
    }

}

function isHiddenFile(file){
    return file.hidden === true;
}

function filterVisibleFiles(files){

    return files.filter(file=>{

        if(file.hidden === true){

            if(!file.permission){
                return false;
            }

            return checkPermission(file);

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

function isDangerUnlocked(dangerKey){

    const required =
        requiredRankByDanger[dangerKey] || "BRONZE";

    return getRankValue(getSystemUser().rank) >= getRankValue(required);

}

const dangerSortOrder = ["asphales", "epimeleia", "kindynos", "theos"];

function renderFiles(files){

    fileList.innerHTML = "";

    let visibleFiles =
        filterVisibleFiles(files);

    const isEntityFolder =
        visibleFiles.length > 0 && visibleFiles[0].type === "entity";

    if(isEntityFolder){

        visibleFiles = [...visibleFiles].sort((a, b)=>
            dangerSortOrder.indexOf(a.danger) - dangerSortOrder.indexOf(b.danger)
        );

    }

    visibleFiles.forEach(file=>{

        const item =
            document.createElement("div");

        item.className = "file";

        if(file.type === "entity" && !isDangerUnlocked(file.danger)){

            const level =
                dangerLevels[file.danger];

            item.classList.add("locked");
            item.textContent = "🔒 [ LOCKED ] " + (level ? level.label : "");

            item.addEventListener("click", ()=>{
                showLockedEntity(file);
            });

            fileList.appendChild(item);
            return;

        }

        const prefix =
            file.type === "entity"
                ? (dangerLevels[file.danger] ? dangerLevels[file.danger].emoji : "📄") + " "
                : (file.hidden ? "🔓 " : "📄 ");

        item.textContent = prefix + file.name;

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

    if(file.type === "entity"){
        renderEntityView(file);
        return;
    }

    if(file.type === "photo"){
        renderPhotoView(file);
        return;
    }

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


/* ==========================================================
   ENTITY VIEW（紛異体の研究記録レイアウト）
========================================================== */

function entityThumbHtml(entity){

    if(entity.image){
        return `
        <div class="entity-thumb">
            <img src="${entity.image}" alt="${entity.name}"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="entity-thumb-fallback">NO VISUAL<br>RECORD</div>
        </div>`;
    }

    return `<div class="entity-thumb"><div class="entity-thumb-fallback">NO VISUAL<br>RECORD</div></div>`;

}

function renderEntityView(entity){

    const level =
        dangerLevels[entity.danger];

    const requiredRank =
        requiredRankByDanger[entity.danger] || "BRONZE";

    let html = "";

    html += `<div class="entity-id">${entity.id}</div>`;

    html += `<div class="entity-meta">`;

    html += `<div class="entity-meta-block">
                <span class="entity-meta-label">危険度</span>
                <span class="entity-meta-value">${dangerIconHtml(entity.danger, 26)} ${level ? level.label : ""}</span>
             </div>`;

    html += `<div class="entity-meta-block">
                <span class="entity-meta-label">管理区分</span>
                <span class="entity-meta-value">${entity.containment || ""}</span>
             </div>`;

    html += `<div class="entity-meta-block">
                <span class="entity-meta-label">必要クリアランス</span>
                <span class="entity-meta-value">${requiredRank}</span>
             </div>`;

    html += `</div>`;

    html += entityThumbHtml(entity);

    const sections =
        entity.sections || [];

    sections.forEach(section=>{

        html += `<div class="entity-section">
                    <h3>${section.heading}</h3>
                    ${section.text.split(/\n\n+/).map(block=>`<p>${block.replace(/\n/g,"<br>")}</p>`).join("")}
                 </div>`;

    });

    viewerContent.innerHTML = html;

}


/* ==========================================================
   LOCKED ENTITY（一覧で[ LOCKED ]をクリックした場合）
========================================================== */

function showLockedEntity(file){

    play("error");

    currentFile = null;

    updatePath();

    const level =
        dangerLevels[file.danger];

    const requiredRank =
        requiredRankByDanger[file.danger] || "BRONZE";

    viewerTitle.textContent = "[ LOCKED ]";

    viewerContent.innerHTML =
        `<div class="permission-error">
            ACCESS DENIED<br><br>
            危険度：<br>${level ? level.label : ""}<br><br>
            必要クリアランス：<br>${requiredRank}<br><br>
            現在のクリアランス：<br>${getSystemUser().rank || "なし"}
         </div>`;

}

function showPermissionError(file){

    play("error");

    viewerTitle.textContent = file.name;

    viewerContent.innerHTML = "";

    const box =
        document.createElement("div");

    box.className = "permission-error";

    const rankTiers = ["bronze", "silver", "gold", "platinum"];

    if(rankTiers.includes(file.permission)){

        box.innerHTML =
            `ACCESS DENIED<br><br>必要クリアランス：<br>${file.permission.toUpperCase()}<br><br>現在のクリアランス：<br>${getSystemUser().rank || "なし"}`;

    }
    else{

        box.innerHTML =
            `ACCESS DENIED<br><br>必要レベル：<br>${file.permission}<br><br>現在のレベル：<br>${getSystemUser().level}`;

    }

    viewerContent.appendChild(box);

}


/* ==========================================================
   OPEN FILE
========================================================== */

function openFile(file){

    currentFile = file;

    play("fileOpen");

    updatePath();

    viewerTitle.textContent = file.name;

    if(file.broken){
        showBrokenFile(file);
        recordFileView(file);
        return;
    }

    if(!checkPermission(file)){
        showPermissionError(file);
        return;
    }

    renderFileView(file);

    recordFileView(file);

    if(file.unlocksArchive){
        watchReadCompletion(file);
    }

}


/* ==========================================================
   BROKEN FILE（権限ではなく、データ破損で読めないファイル）
========================================================== */

function showBrokenFile(file){

    play("error");

    viewerContent.innerHTML = "";

    const box =
        document.createElement("div");

    box.className = "file-corrupted";
    box.innerHTML =
        `${file.broken.title}` +
        (file.broken.sub ? `<br><br>${file.broken.sub}` : "");

    viewerContent.appendChild(box);

}


/* ==========================================================
   READ COMPLETION（最後まで読んだら解禁）

   スクロールしきる必要のない短い資料は、開いた時点で
   「読了」とみなす。スクロールが必要な資料は、
   ビューアの一番下まで到達した時点で解禁する。
========================================================== */

let readCompletionHandler = null;

function watchReadCompletion(file){

    if(readCompletionHandler){
        viewer.removeEventListener("scroll", readCompletionHandler);
        readCompletionHandler = null;
    }

    const isScrollable =
        viewer.scrollHeight > viewer.clientHeight + 4;

    if(!isScrollable){
        unlockArchive(file.unlocksArchive);
        return;
    }

    readCompletionHandler = ()=>{

        const reachedBottom =
            viewer.scrollTop + viewer.clientHeight >= viewer.scrollHeight - 280;

        if(reachedBottom){
            unlockArchive(file.unlocksArchive);
            viewer.removeEventListener("scroll", readCompletionHandler);
            readCompletionHandler = null;
        }

    };

    viewer.addEventListener("scroll", readCompletionHandler);

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

    if(accessLevelBadge){
        accessLevelBadge.textContent =
            "ACCESS LEVEL : " + getSystemUser().level;
    }

    if(clearanceBadge){
        clearanceBadge.textContent =
            "CLEARANCE : " + (getSystemUser().rank || "NONE");
    }

    if(clearanceTopbar){

        const rank =
            getSystemUser().rank || "NONE";

        clearanceTopbar.textContent =
            "CLEARANCE : " + rank;

        clearanceTopbar.className =
            "clearance-" + rank.toLowerCase();

    }

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
        showNotification(def.unlockMessage || (def.name + " Unlocked"), "notice");
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
    viewed: [],
    highestRank: null
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
   CLEARANCE UPDATED（前回より高い階級でログインした時だけ）
========================================================== */

function canViewFileWithRank(file, rank){
    if(!file.permission) return true;
    if(!["bronze","silver","gold","platinum"].includes(file.permission)) return true;
    return getRankValue(rank) >= getRankValue(file.permission);
}

function detectNewlyVisibleData(previousRank, currentRank){
    
    const newlyVisible = {
        folders: [],
        files: []
    };

    // スキャン対象：archiveData のすべてのフォルダ
    Object.entries(archiveData).forEach(([folderKey, folder])=>{
        
        if(!folder.files) return;

        folder.files.forEach(file=>{
            
            const wasVisible = canViewFileWithRank(file, previousRank);
            const isVisible = canViewFileWithRank(file, currentRank);

            if(!wasVisible && isVisible){
                newlyVisible.files.push({
                    folderKey: folderKey,
                    folderName: folder.name,
                    fileName: file.name
                });
            }

        });

    });

    return newlyVisible;
}

function generateClearanceNotification(previousRank, currentRank, newlyVisible){

    if(newlyVisible.files.length === 0) return null;

    // ファイルをフォルダごとに集計
    const byFolder = {};
    newlyVisible.files.forEach(item=>{
        if(!byFolder[item.folderKey]){
            byFolder[item.folderKey] = {
                folderName: item.folderName,
                count: 0,
                files: []
            };
        }
        byFolder[item.folderKey].count++;
        byFolder[item.folderKey].files.push(item.fileName);
    });

    // 通知を組み立てる
    let message = `[ARCHIVE NOTICE]\n\nCLEARANCE UPDATED\n\n${currentRank}\n\nNEW DATA AVAILABLE\n\n`;

    Object.values(byFolder).forEach(folder=>{
        message += `[${folder.folderName.toUpperCase()}]\n${folder.count} new record(s)\n\n`;
    });

    return message;
}

function checkClearanceUpgrade(){

    const currentRank =
        getSystemUser().rank;

    const currentValue =
        getRankValue(currentRank);

    const previousValue =
        getRankValue(archiveSave.highestRank);

    if(currentValue <= previousValue) return;

    // 前回のクリアランスを保存しておく
const previousRank = archiveSave.highestRank;

// 新しく見えるようになったデータを検出
const newlyVisible =
    detectNewlyVisibleData(
        previousRank,
        currentRank
    );

// 今回のクリアランスを保存
archiveSave.highestRank =
    currentRank;

saveArchive();

function checkClearanceUpgrade(){

    const currentRank =
        getSystemUser().rank;

    const currentValue =
        getRankValue(currentRank);

    const previousRank =
        archiveSave.highestRank;

    const previousValue =
        getRankValue(previousRank);

    if(currentValue <= previousValue) return;


    // 新しく見えるようになったデータを検出
    const newlyVisible =
        detectNewlyVisibleData(
            previousRank,
            currentRank
        );


    // 今回のクリアランスを保存
    archiveSave.highestRank =
        currentRank;

    saveArchive();


    // 通知を生成・表示
    const message =
        generateClearanceNotification(
            previousRank,
            currentRank,
            newlyVisible
        );

    if(message){
        showNotification(message);
    }

}

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
    checkClearanceUpgrade();

    openFolder("welcome");

}

window.addEventListener("load", ()=>{
    initializeExplorer();
});


/* ==========================================================
   PHOTO VIEW（集合写真。実画像は無いので人型シルエットで代用。
   カーソルを合わせると個々の状態が見える）
========================================================== */

function renderPhotoView(file){

    let html = "";

    if(file.caption){
        html += `<div class="photo-caption">${file.caption}</div>`;
    }

    html += `<div class="photo-grid">`;

    (file.people || []).forEach(person=>{

        html += `
        <div class="photo-person">
            <div class="photo-avatar">🧑</div>
            <div class="photo-id">${person.label}</div>
            <div class="photo-status">${person.status}</div>
        </div>`;

    });

    html += `</div>`;

    viewerContent.innerHTML = html;

}
