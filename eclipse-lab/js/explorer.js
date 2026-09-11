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

const exportButton =
    document.getElementById("export-file");

const popup =
    document.getElementById("popup");

const popupTitle =
    document.getElementById("popup-title");

const popupContent =
    document.getElementById("popup-content");

const popupClose =
    document.getElementById("popup-close");

if(popupClose){
    popupClose.addEventListener("click", closePopup);
}

function closePopup(){
    if(popup){
        popup.classList.add("hidden");
    }
}


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
            return getRankValue(getSystemUser().rank) >= rankOrder.PLATINUM;

        case "0001":
            return getSystemUser().rank === "0001";

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

        // 通常はpermission不足でも一覧には出してACCESS DENIEDを見せるが、
        // hideUntilUnlocked:true のファイルだけは権限を満たすまで一覧にも出さない
        // （存在自体が伏線・ネタバレになってしまうファイル専用）
        if(file.hideUntilUnlocked && !checkPermission(file)){
            return false;
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

    updateFolderBadges();

}


/* ==========================================================
   未読バッジ（フォルダに未読ファイルがあることだけを示す。
   中身やタイトルは一切表示しない）
========================================================== */

function folderHasUnread(key){

    const data =
        archiveData[key];

    if(!data) return false;

    return filterVisibleFiles(data.files).some(file=>
        isFileOpenable(file) &&
        !archiveSave.viewed.includes(file.name)
    );

}

function updateFolderBadges(){

    document.querySelectorAll(".folder").forEach(folderEl=>{

        const key =
            folderEl.dataset.folder;

        folderEl.classList.toggle("has-unread", folderHasUnread(key));

    });

}


/* ==========================================================
   PERSONAL DIRECTORY

   施設ログインとは別の、職員ID単位の個人領域。
   ・ログイン中の本人自身の領域は無条件で見える（自分だから）
   ・他職員の領域は、Staff Databaseのページからパスワードを
     推理して個別に認証する必要がある
========================================================== */

function revealOwnPersonalFolder(){

    const user =
        getSystemUser();

    if(!user.employeeId) return;

    const staffEntry =
        typeof staffDatabase !== "undefined"
            ? staffDatabase[user.employeeId]
            : null;

    if(!staffEntry || !staffEntry.personalArchive) return;

    const key = "personal_self";

    archiveData[key] = {
        name:"PERSONAL",
        files: staffEntry.personalArchive
    };

    createArchiveFolder(
        key,
        {
            name:"PERSONAL",
            icon:"🗂"
        }
    );

}

function openPersonalArchive(employeeId, ownerName, files){

    const key =
        "personal_" + employeeId;

    archiveData[key] = {
        name: ownerName + " — PERSONAL ARCHIVE",
        files: files
    };

    closePopup();

    openFolder(key);

}

function openPersonalLoginPopup(staff){

    if(!popup || !popupTitle || !popupContent) return;

    popupTitle.textContent = "PERSONAL DIRECTORY";

    popupContent.innerHTML = `
        <div class="personal-login-owner">OWNER: ${staff.employeeId}</div>
        <div class="personal-login-field">
            <label for="personal-login-password">PASSWORD</label>
            <input type="password" id="personal-login-password" autocomplete="off">
        </div>
        <button id="personal-login-submit">AUTHORIZE</button>
        <div id="personal-login-status"></div>
    `;

    popup.classList.remove("hidden");

    const input =
        document.getElementById("personal-login-password");

    const submit =
        document.getElementById("personal-login-submit");

    const status =
        document.getElementById("personal-login-status");

    function attempt(){

        play("click");

        const entered =
            input.value;

        const correct =
            typeof staff.personalPassword === "string" &&
            entered === staff.personalPassword;

        if(correct){

            play("loginSuccess");
            openPersonalArchive(staff.employeeId, staff.name, staff.personalArchive || []);

        }
        else{

            play("loginFail");
            status.textContent = "AUTHENTICATION FAILED";
            input.value = "";

        }

    }

    if(submit){
        submit.addEventListener("click", attempt);
    }

    if(input){

        input.focus();

        input.addEventListener("keydown", e=>{
            if(e.key === "Enter") attempt();
        });

    }

}


/* ==========================================================
   FILE LIST
========================================================== */

/* ==========================================================
   ファイルの表示名
   （ファイル名は英語の内部識別子のまま、
   　一覧・タイトルにはできるだけ日本語の見出しを出す）
========================================================== */

function fileExtensionFor(file){

    if(file.type === "photo") return ".jpg";

    return ".txt";

}

function getDisplayLabel(file){

    let label;

    if(file.label){

        label = file.label;

    }
    else if(!isFileReadable(file)){

        label = file.name;

    }
    else if(typeof file.content === "string"){

        /* 【カテゴリ】サブタイトル 形式の場合、カテゴリだけでなく
           同じ行に続くサブタイトルまで拾う。サブタイトルが無い
           場合はカテゴリのみにフォールバックする（従来通り）。
           これをやらないと、同じカテゴリの文書が並んだとき
           サイドバー上で全部同じラベルに見えてしまう。 */

        const match =
            file.content.match(/【([^】]{1,40})】[ \t]*([^\n]{0,40})/);

        if(match){

            const category = match[1];
            const subtitle = (match[2] || "").trim();

            label = subtitle ? subtitle : category;

        }
        else{

            label = file.name;

        }

    }
    else{

        label = file.name;

    }

    /* エクスプローラーという体裁なので、拡張子の付いていない
       ラベルには拡張子を補う（ただし紛異体の詩的な固有名と、
       破損表示・システム識別子そのままの名前はそのまま残す）。 */

    const alreadyLooksLikeFilename =
        /\.[a-zA-Z0-9]{2,5}$/.test(label);

    const skipExtension =
        alreadyLooksLikeFilename ||
        file.type === "entity" ||
        file.broken ||
        !isFileReadable(file);

    if(!skipExtension){

        label += fileExtensionFor(file);

    }

    return label;

}

function isDangerUnlocked(dangerKey){

    const required =
        requiredRankByDanger[dangerKey] || "BRONZE";

    return getRankValue(getSystemUser().rank) >= getRankValue(required);

}

/* ==========================================================
   ファイルが「今読める状態か」の統一判定
   （entityは危険度、それ以外は permission で判定が分かれるため）
========================================================== */

function isFileReadable(file){

    if(file.broken) return false;

    if(file.type === "entity"){
        return isDangerUnlocked(file.danger);
    }

    return checkPermission(file);

}

/* ==========================================================
   ファイルが「今クリックして開ける状態か」の判定（未読バッジ専用）

   isFileReadable() は「本文の中身が読めるか」を聞く関数なので
   brokenファイルは常にfalseになる。だが実際にはbrokenファイルも
   クリックして開ける（破損表示を見て既読になる）ため、未読バッジの
   判定にisFileReadable()をそのまま使うと、中身がbrokenファイルだけの
   フォルダ（例：インシデント記録）が新規解禁されても緑の点が
   一切出ない、という不具合になる。バッジ用にはこちらを使う。
========================================================== */

function isFileOpenable(file){

    if(file.type === "entity"){
        return isDangerUnlocked(file.danger);
    }

    if(file.broken) return true;

    return checkPermission(file);

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
                : file.type === "staff"
                ? (file.isDepartment ? "🏢 " : "◇ ")
                : (file.hidden ? "🔓 " : "📄 ");

        item.textContent = prefix + getDisplayLabel(file);

        if(isFileOpenable(file) && !archiveSave.viewed.includes(file.name)){
            item.classList.add("has-unread");
        }

        item.addEventListener("mouseenter", ()=> play("hover"));

        item.addEventListener("click", ()=>{

            document.querySelectorAll(".file").forEach(el=> el.classList.remove("selected"));
            item.classList.add("selected");
            item.classList.remove("has-unread");

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

    if(file.type === "staff"){
        renderStaffView(file);
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
   STAFF VIEW（職員データベースの表示レイアウト）
========================================================== */

function renderStaffView(staff){

    let html = "";

    html += `<div class="entity-id">${staff.employeeId || staff.name}</div>`;

    html += `<div class="entity-meta">`;

    if(!staff.isDepartment){
        html += `<div class="entity-meta-block">
                    <span class="entity-meta-label">職員番号</span>
                    <span class="entity-meta-value">${staff.employeeId || "―"}</span>
                 </div>`;
    }

    html += `<div class="entity-meta-block">
                <span class="entity-meta-label">配属</span>
                <span class="entity-meta-value">${staff.department || ""}</span>
             </div>`;

    const showPersonalHint =
        !staff.isDepartment && archiveSave.personalConceptDiscovered;

    if(showPersonalHint){
        html += `<div class="entity-meta-block">
                    <span class="entity-meta-label">個人フォルダ</span>
                    <span class="entity-meta-value personal-folder-hint" id="personal-folder-hint">ACCESS UNKNOWN</span>
                 </div>`;
    }

    html += `</div>`;

    const staffSections =
        staff.sections || [];

    staffSections.forEach(section=>{

        html += `<div class="entity-section">
                    <h3>${section.heading}</h3>
                    ${section.text.split(/\n\n+/).map(block=>`<p>${block.replace(/\n/g,"<br>")}</p>`).join("")}
                 </div>`;

    });

    const relatedLogs =
        findRelatedLogs(staff);

    if(relatedLogs.length > 0){

        html += `<div class="entity-section related-logs-section">
                    <h3>関連ログ</h3>
                    <div class="related-log-list">
                        ${relatedLogs.map(log=>
                            `<div class="related-log-item" data-log-name="${log.name}">📄 ${getDisplayLabel(log)}</div>`
                        ).join("")}
                    </div>
                 </div>`;

    }

    viewerContent.innerHTML = html;

    if(showPersonalHint){

        const hint =
            document.getElementById("personal-folder-hint");

        if(hint){

            hint.addEventListener("mouseenter", ()=> play("hover"));

            hint.addEventListener("click", ()=>{
                openPersonalLoginPopup(staff);
            });

        }

    }

    if(relatedLogs.length > 0){

        viewerContent.querySelectorAll(".related-log-item").forEach(item=>{

            item.addEventListener("mouseenter", ()=> play("hover"));

            item.addEventListener("click", ()=>{
                openRelatedLog(item.dataset.logName);
            });

        });

    }

}


/* ==========================================================
   RELATED LOGS（Staff Database ⇄ Internal Logs の相互リンク）

   Internal Logsの各ファイルは relatedStaff:[...] に
   employeeId（個人）または name（部門）を持つ場合がある。
   職員詳細を開いたとき、それを参照して逆引きする。
========================================================== */

function findRelatedLogs(staff){

    const logsFolder =
        archiveData.logs;

    if(!logsFolder) return [];

    const key =
        staff.employeeId || staff.name;

    return logsFolder.files.filter(file=>
        Array.isArray(file.relatedStaff) && file.relatedStaff.includes(key)
    );

}

function openRelatedLog(logName){

    const logsFolder =
        archiveData.logs;

    if(!logsFolder) return;

    const file =
        logsFolder.files.find(f=> f.name === logName);

    if(!file) return;

    openFolder("logs");

    const item =
        Array.from(fileList.children).find(el=> el.textContent.includes(logName));

    if(item){
        document.querySelectorAll(".file").forEach(el=> el.classList.remove("selected"));
        item.classList.add("selected");
    }

    openFile(file);

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

    viewerTitle.textContent = getDisplayLabel(file);

    viewerContent.innerHTML = "";

    const box =
        document.createElement("div");

    box.className = "permission-error";

    const rankTiers = ["bronze", "silver", "gold", "platinum", "0001"];

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

    viewerTitle.textContent = getDisplayLabel(file);

    if(exportButton){
        exportButton.style.display = "none";
    }

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

    if(exportButton && typeof file.content === "string"){
        exportButton.style.display = "inline-block";
    }

    if(file.unlocksArchive){
        watchReadCompletion(file);
    }

}


/* ==========================================================
   持ち帰り機能（開いている記録をテキストで書き出す）
========================================================== */

function downloadCurrentFile(){

    if(!currentFile || typeof currentFile.content !== "string") return;

    const blob =
        new Blob([currentFile.content], { type:"text/plain;charset=utf-8" });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = currentFile.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    play("click");

}

if(exportButton){
    exportButton.addEventListener("click", downloadCurrentFile);
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
        "Archive / " + folderName + (currentFile ? " / " + getDisplayLabel(currentFile) : "");

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

    // archiveData[key] の有無ではなく、サイドバーに既にフォルダが
    // 出ているかどうかで「解禁済みか」を判定する。
    // documents/logs/incident/observation/disaster のように
    // archiveDataの実体は他スクリプトから既に存在しているが
    // フォルダ表示だけをここで遅らせているケースに対応するため。
    if(document.querySelector(`[data-folder='${key}']`)) return;

    const def =
        lockedArchives[key];

    if(!def) return;

    if(!archiveData[key]){
        archiveData[key] = {
            name: def.name,
            files: def.files
        };
    }

    createArchiveFolder(key, def);

    if(!options.silent){
        play("secret");
        showNotification(def.unlockMessage || "新たな記録が解禁されました。", "normal", key);
    }

    recordUnlock(key);

}

function checkLevelUnlocks(){

    const level =
        getSystemUser().level;

    const rank =
        getSystemUser().rank;

    Object.keys(lockedArchives).forEach(key=>{

        const def = lockedArchives[key];

        if(document.querySelector(`[data-folder='${key}']`)) return;

        if(def.trigger === "level" && level === def.requiredLevel){
            unlockArchive(key);
        }
        else if(def.trigger === "rank" && getRankValue(rank) >= getRankValue(def.requiredRank)){
            unlockArchive(key);
        }

    });

    checkReadAllUnlocks();

}


/* ==========================================================
   READ-ALL UNLOCK SYSTEM

   trigger:"readAll" のアーカイブは、requiredFiles に列挙した
   ファイル名を全て読了した時点で解禁される（requiredLevel /
   requiredRank を指定すれば、その条件も同時に満たす必要がある）。

   例：Old Records全4本を読了 かつ 0001としてログイン中
       → lockedArchives.one（0001フォルダ）が解禁される
========================================================== */

function checkReadAllUnlocks(){

    Object.keys(lockedArchives).forEach(key=>{

        const def = lockedArchives[key];

        if(def.trigger !== "readAll") return;
        if(document.querySelector(`[data-folder='${key}']`)) return;

        if(def.requiredLevel && getSystemUser().level !== def.requiredLevel) return;
        if(def.requiredRank && getSystemUser().rank !== def.requiredRank) return;

        const requiredFiles =
            def.requiredFiles || [];

        const allRead =
            requiredFiles.length > 0 &&
            requiredFiles.every(name => archiveSave.viewed.includes(name));

        if(allRead){
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

    if(file.name === "0001_Final_Conversation.txt"){
        archiveSave.trueEndingSeen = true;
    }

    if(file.isPersonal){
        archiveSave.personalConceptDiscovered = true;
    }

    saveArchive();

    checkReadAllUnlocks();
    updateFolderBadges();

}

function recordUnlock(key){

    if(!archiveSave.unlocked.includes(key)){
        archiveSave.unlocked.push(key);
    }

    saveArchive();

}

function canRestoreArchive(key){

    const def =
        lockedArchives[key];

    if(!def) return false;

    const user =
        getSystemUser();

    if(def.trigger === "rank"){
        return getRankValue(user.rank) >=
               getRankValue(def.requiredRank);
    }

    if(def.trigger === "level"){
        return user.level === def.requiredLevel;
    }

    if(def.trigger === "event"){
        // 特定のファイルを読んだことによる恒久的な進行度。
        // 現在のランク・レベルに関わらず、一度読んだ事実は消えない。
        return archiveSave.unlocked.includes(key);
    }

    if(def.trigger === "readAll"){

        if(def.requiredLevel && user.level !== def.requiredLevel){
            return false;
        }

        if(def.requiredRank && user.rank !== def.requiredRank){
            return false;
        }

        return (def.requiredFiles || []).every(
            name => archiveSave.viewed.includes(name)
        );

    }

    return false;

}

function restorePreviousUnlocks(){

    archiveSave.unlocked.forEach(key=>{

        // 過去に解禁したという記録だけでなく、「今のログイン状態でも
        // 解禁条件を満たしているか」を毎回チェックする。
        // 例：PLATINUMで災害記録を解禁 → ログアウトしてGuest(NONE)で
        // 入り直した場合は、災害記録が再びサイドバーから消える。
        if(!canRestoreArchive(key)) return;

        unlockArchive(key, { silent:true });

    });

}


/* ==========================================================
   CLEARANCE UPDATED（前回より高い階級でログインした時だけ）
========================================================== */

function checkClearanceUpgrade(){

    const currentRank =
        getSystemUser().rank;

    const currentValue =
        getRankValue(currentRank);

    const previousValue =
        getRankValue(archiveSave.highestRank);

    if(currentValue <= previousValue) return;

    const newlyUnlockedDanger =
        dangerSortOrder.find(dangerKey=>{

            const required =
                getRankValue(requiredRankByDanger[dangerKey]);

            return required > previousValue && required <= currentValue;

        });

    archiveSave.highestRank = currentRank;
    saveArchive();

    if(newlyUnlockedDanger){

        const count =
            (archiveData.entity.files || []).filter(f=>
                f.type === "entity" && f.danger === newlyUnlockedDanger
            ).length;

        const label =
            dangerLevels[newlyUnlockedDanger] ? dangerLevels[newlyUnlockedDanger].label : newlyUnlockedDanger;

        const message =
`CLEARANCE UPDATED

${currentRank}

New archive access granted.

> ${label.toUpperCase()} ARCHIVE
${count} new record(s) available.`;

        showNotification(message);

    }
    else if(currentRank === "0001"){

        const message =
`CLEARANCE UPDATED

0001

Unrecognized access level accepted.

Archive index has been restructured.`;

        showNotification(message);

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

    revealOwnPersonalFolder();

    updateFolderBadges();

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
            <div class="photo-avatar">▓</div>
            <div class="photo-id">${person.label}</div>
            <div class="photo-status">${person.status}</div>
        </div>`;

    });

    html += `</div>`;

    viewerContent.innerHTML = html;

}
