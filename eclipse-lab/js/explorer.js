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

function openFolder(key, options = {}){

    const data =
        archiveData[key];

    if(!data) return;

    currentFolder = key;

    if(!options.silent){
        play("folder");
    }

    markActiveFolder(key);

    renderFiles(data.files);

    renderFileListHeader();

    updatePath();

    if(!options.keepViewer){
        showListOnMobile();
    }

    if(!options.fromHistory){
        pushNav({ folder:key, file:null });
    }

}

function markActiveFolder(key){

    document.querySelectorAll(".folder").forEach(el=>{

        const isActive = el.dataset.folder === key;

        el.classList.toggle("active", isActive);

        // スマホの横並びフォルダ帯では、開いたフォルダが見える位置まで寄せる
        if(isActive && window.matchMedia("(max-width: 820px)").matches){
            el.scrollIntoView({ block:"nearest", inline:"nearest" });
        }

    });

}

function renderFileListHeader(){

    const titleEl =
        document.getElementById("file-list-title");

    const metaEl =
        document.getElementById("file-list-meta");

    const data =
        archiveData[currentFolder];

    if(!data || !titleEl || !metaEl) return;

    titleEl.textContent = data.name;

    const files =
        filterVisibleFiles(data.files);

    const readable =
        files.filter(isFileOpenable);

    const unread =
        readable.filter(f=> !archiveSave.viewed.includes(f.name)).length;

    const locked =
        files.length - readable.length;

    const parts = [ `${files.length}件` ];

    if(unread > 0) parts.push(`未読 ${unread}`);
    if(locked > 0) parts.push(`閲覧不可 ${locked}`);

    metaEl.textContent = parts.join("　");

}

function createArchiveFolder(key, def){

    if(document.querySelector(`[data-folder='${key}']`)) return;

    const folder =
        document.createElement("div");

    folder.className = "folder";
    folder.dataset.folder = key;

    const nameEl =
        document.createElement("span");

    nameEl.className = "folder-name";
    nameEl.textContent = def.name;

    folder.appendChild(nameEl);

    folder.addEventListener("mouseenter", ()=> play("hover"));
    folder.addEventListener("click", ()=> openFolder(key));

    const group =
        document.getElementById(
            key.startsWith("personal") ? "sidebar-personal" : "sidebar-found"
        ) || sidebar;

    group.appendChild(folder);

    if(key === currentFolder){
        folder.classList.add("active");
    }

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

    renderFileListHeader();

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
            name:"PERSONAL（" + user.employeeId + "）"
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
        <div class="personal-login-owner">OWNER: ${staff.employeeId}　${staff.name}</div>
        <p class="personal-login-help">この職員の個人フォルダを開くには、本人のパスワードが必要です。</p>
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
            status.textContent = "AUTHENTICATION FAILED — パスワードが一致しません";
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

            // 件名の行があれば、見出しが無いときの補足に使う
            const subject =
                (file.content.slice(0, 300).match(/件名[：:]\s*([^\n]{1,30})/) || [])[1];

            if(subtitle && subtitle.length > 6){
                label = subtitle;
            }
            else if(subtitle){
                // 「0001」のような短すぎる見出しは種類名と組み合わせる
                label = category + "：" + subtitle;
            }
            else if(subject){
                label = category + "：" + subject.trim();
            }
            else{
                label = category;
            }

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

/* 一覧で同じ表示名が並ぶ場合（例：アカウント再発行記録が複数）、
   ファイル名に含まれる日付・番号を添えて見分けられるようにする */
function disambiguateLabel(file, label, siblings){

    const same =
        siblings.filter(f=> f !== file && getDisplayLabel(f) === label);

    if(same.length === 0) return label;

    const m = file.name.match(/(\d{6,8}(?:_\d{4})?)/);

    let suffix = m ? m[1] : file.name.replace(/\.[^.]+$/, "");

    // 20151118 → 2015/11/18 のように読みやすくする
    suffix = suffix.replace(/^(\d{4})(\d{2})(\d{2})/, "$1/$2/$3");

    const ext = (label.match(/\.[a-zA-Z0-9]{2,5}$/) || [""])[0];

    return label.slice(0, label.length - ext.length) + "（" + suffix + "）" + ext;

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


/* ==========================================================
   記録の種類（一覧のスタンプ・ビューア見出し・本文の体裁に使う）

   本文の体裁は「誰が作ったデータか」で分ける：
   ・人が書いた記録 → 紙面（明朝）
   ・システムが自動で残した記録 → 端末表示（等幅）
========================================================== */

const CHAT_HEAD = /^【(チャット|内部チャット|施設内チャット|社内掲示板|食堂掲示板|社内メール|社員旅行|内部メール)】/;

function isSystemRecord(file){

    if(typeof file.content !== "string") return false;

    if(file.isPersonal) return false;

    const text = file.content.trim();

    if(text.startsWith("[")) return true;
    if(text.startsWith("【")) return false;

    const visible = text.replace(/\s/g, "");

    if(!visible.length) return false;

    const ascii = (visible.match(/[\x21-\x7E]/g) || []).length;

    return ascii / visible.length > 0.5;

}

function getFileKind(file){

    if(file.type === "entity") return { key:"entity",  glyph:"体", label:"紛異体記録" };
    if(file.type === "staff"){
        return file.isDepartment
            ? { key:"staff", glyph:"部", label:"部門記録" }
            : { key:"staff", glyph:"人", label:"職員記録" };
    }
    if(file.type === "photo") return { key:"photo",   glyph:"写", label:"写真記録" };
    if(file.broken)           return { key:"broken",  glyph:"欠", label:"破損データ" };
    if(file.isPersonal)       return { key:"diary",   glyph:"日", label:"個人の記録" };

    const text =
        typeof file.content === "string" ? file.content.trim() : "";

    if(/^\[CCTV/.test(text))       return { key:"system", glyph:"録", label:"監視音声記録" };
    if(isSystemRecord(file))       return { key:"system", glyph:"録", label:"システム記録" };
    if(CHAT_HEAD.test(text))       return { key:"chat",   glyph:"話", label:"職員間のやりとり" };
    if(/^【(個人記録|個人ログ|日誌|最終記録|最終ログ|観察記録・最終|避難記録|集合記録|最終確認|夜勤ログ|0001|0000)/.test(text)){
        return { key:"diary", glyph:"日", label:"個人の記録" };
    }

    return { key:"doc", glyph:"文", label:"文書" };

}

function requiredClearanceLabel(file){

    if(file.type === "entity"){
        return requiredRankByDanger[file.danger] || "BRONZE";
    }

    if(!file.permission) return "";

    const rankTiers = ["bronze", "silver", "gold", "platinum", "0001"];

    if(rankTiers.includes(file.permission)) return file.permission.toUpperCase();

    return "LEVEL " + file.permission.toUpperCase();

}

function folderDisplayName(key){

    return archiveData[key] ? archiveData[key].name : "";

}

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
            document.createElement("button");

        item.type = "button";
        item.className = "file";
        item.dataset.fileName = file.name;

        if(file.type === "entity" && !isDangerUnlocked(file.danger)){

            const level =
                dangerLevels[file.danger];

            item.classList.add("locked");
            item.innerHTML =
                `<span class="file-glyph">錠</span>` +
                `<span class="file-name">未開示（${level ? level.label : ""}）</span>` +
                `<span class="file-state">${requiredRankByDanger[file.danger] || ""}</span>`;

            item.addEventListener("click", ()=>{
                document.querySelectorAll(".file").forEach(el=> el.classList.remove("selected"));
                item.classList.add("selected");
                showLockedEntity(file);
            });

            fileList.appendChild(item);
            return;

        }

        const kind =
            getFileKind(file);

        const openable =
            isFileOpenable(file);

        const label =
            disambiguateLabel(file, getDisplayLabel(file), visibleFiles);

        item.classList.add("kind-" + kind.key);

        if(file.type === "entity"){
            item.classList.add("danger-" + file.danger);
        }

        if(!openable){
            item.classList.add("locked");
        }
        else if(archiveSave.viewed.includes(file.name)){
            item.classList.add("is-read");
        }
        else{
            item.classList.add("has-unread");
        }

        const glyph =
            openable ? kind.glyph : "錠";

        const state =
            openable ? "" : requiredClearanceLabel(file);

        item.title = label;

        item.innerHTML =
            `<span class="file-glyph"></span>` +
            `<span class="file-name"></span>` +
            `<span class="file-state"></span>`;

        item.querySelector(".file-glyph").textContent = glyph;
        item.querySelector(".file-name").textContent = label;
        item.querySelector(".file-state").textContent = state;

        if(currentFile && currentFile.name === file.name){
            item.classList.add("selected");
        }

        item.addEventListener("mouseenter", ()=> play("hover"));

        item.addEventListener("click", ()=>{

            document.querySelectorAll(".file").forEach(el=> el.classList.remove("selected"));
            item.classList.add("selected");

            if(item.classList.contains("has-unread")){
                item.classList.remove("has-unread");
                item.classList.add("is-read");
            }

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

    viewerContent.className = "";

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

    const sheet =
        document.createElement("article");

    sheet.className =
        "sheet " + (isSystemRecord(file) ? "sheet-terminal" : "sheet-paper");

    const text =
        document.createElement("pre");

    text.textContent = file.content.replace(/^\n+/, "").replace(/\s+$/, "");

    sheet.appendChild(text);

    viewerContent.appendChild(sheet);

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

    let html = `<article class="sheet sheet-paper dossier danger-${entity.danger}">`;

    html += `<div class="dossier-band">${level ? level.label : ""}</div>`;

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

    html += `</article>`;

    viewerContent.innerHTML = html;

}


/* ==========================================================
   STAFF VIEW（職員データベースの表示レイアウト）
========================================================== */

function renderStaffView(staff){

    let html = `<article class="sheet sheet-paper dossier staff-dossier">`;

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
                    <button type="button" class="entity-meta-value personal-folder-hint" id="personal-folder-hint">ACCESS UNKNOWN（パスワードを入力）</button>
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
                            `<button type="button" class="related-log-item ${isFileOpenable(log) ? "" : "locked"}" data-log-name="${log.name}"><span class="file-glyph">${isFileOpenable(log) ? getFileKind(log).glyph : "錠"}</span>${getDisplayLabel(log)}</button>`
                        ).join("")}
                    </div>
                 </div>`;

    }

    html += `</article>`;

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

/* 逆引き対象のフォルダ。サイドバーに出ている（＝発見済みの）
   フォルダだけを探すので、未解禁フォルダの記録名がネタバレとして
   職員ページに出てしまうことはない。 */
const RELATED_LOG_FOLDERS = ["logs", "documents", "disaster"];

function findRelatedLogEntries(staff){

    const key =
        staff.employeeId || staff.name;

    const entries = [];

    RELATED_LOG_FOLDERS.forEach(folderKey=>{

        const folder =
            archiveData[folderKey];

        if(!folder) return;

        if(!document.querySelector(`[data-folder='${folderKey}']`)) return;

        filterVisibleFiles(folder.files).forEach(file=>{
            if(Array.isArray(file.relatedStaff) && file.relatedStaff.includes(key)){
                entries.push({ folderKey, file });
            }
        });

    });

    return entries;

}

function findRelatedLogs(staff){

    return findRelatedLogEntries(staff).map(entry=> entry.file);

}

function openRelatedLog(logName){

    let folderKey = null;
    let file = null;

    RELATED_LOG_FOLDERS.some(key=>{

        const folder = archiveData[key];

        if(!folder) return false;

        const found = folder.files.find(f=> f.name === logName);

        if(found){
            folderKey = key;
            file = found;
            return true;
        }

        return false;

    });

    if(!file) return;

    openFolder(folderKey);

    const item =
        Array.from(fileList.children).find(el=> el.dataset.fileName === file.name);

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

    viewerTitle.textContent = "未開示の紛異体";

    renderViewerHeader(file, { lockedEntity:true });

    viewer.scrollTop = 0;

    showViewerOnMobile();

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

function openFile(file, options = {}){

    currentFile = file;

    if(!options.silent){
        play("fileOpen");
    }

    updatePath();

    viewerTitle.textContent = getDisplayLabel(file);

    renderViewerHeader(file);

    viewer.scrollTop = 0;

    showViewerOnMobile();

    if(!options.fromHistory){
        pushNav({ folder:currentFolder, file:file.name });
    }

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
   VIEWER HEADER（いま何を開いているか）
========================================================== */

function renderViewerHeader(file, options = {}){

    const kicker =
        document.getElementById("viewer-kicker");

    const meta =
        document.getElementById("file-id");

    if(!kicker || !meta) return;

    const kind =
        getFileKind(file);

    const readable =
        !options.lockedEntity && !file.broken && (file.type === "entity" ? isDangerUnlocked(file.danger) : checkPermission(file));

    kicker.innerHTML = "";

    const stamp =
        document.createElement("span");

    stamp.className = "kicker-stamp kind-" + (readable ? kind.key : "locked");
    stamp.textContent = readable ? kind.glyph : "錠";

    const where =
        document.createElement("span");

    where.className = "kicker-where";
    where.textContent = folderDisplayName(currentFolder) + "　/　" + (readable ? kind.label : "閲覧不可");

    kicker.appendChild(stamp);
    kicker.appendChild(where);

    const parts = [];

    if(file.type === "entity"){
        parts.push(`識別番号 ${file.id}`);
    }
    else if(file.type === "staff"){
        if(file.employeeId) parts.push(`職員番号 ${file.employeeId}`);
    }
    else{
        parts.push(file.name);
    }

    const clearance =
        requiredClearanceLabel(file);

    parts.push(clearance ? `必要クリアランス ${clearance}` : "閲覧制限なし");

    meta.textContent = parts.join("　｜　");

}


/* ==========================================================
   NAVIGATION HISTORY（戻る／進む）
========================================================== */

let navStack = [];
let navIndex = -1;

function pushNav(state){

    const current =
        navStack[navIndex];

    if(current && current.folder === state.folder && current.file === state.file) return;

    // フォルダを開いた直後にそのフォルダのファイルを開いた場合は、
    // 1つの履歴にまとめる（戻る1回で前のファイルへ戻れるように）
    if(current && current.file === null && state.file && current.folder === state.folder){
        navStack[navIndex] = state;
    }
    else{
        navStack = navStack.slice(0, navIndex + 1);
        navStack.push(state);
        navIndex = navStack.length - 1;
    }

    updateNavButtons();

}

function goNav(step){

    const target =
        navIndex + step;

    if(target < 0 || target >= navStack.length) return;

    const state =
        navStack[target];

    if(!archiveData[state.folder]) return;

    navIndex = target;

    play("click");

    openFolder(state.folder, { fromHistory:true, silent:true, keepViewer:!!state.file });

    if(state.file){

        const file =
            archiveData[state.folder].files.find(f=> f.name === state.file);

        if(file){

            if(file.type === "entity" && !isDangerUnlocked(file.danger)){
                showLockedEntity(file);
            }
            else{
                openFile(file, { fromHistory:true, silent:true });
            }

            document.querySelectorAll(".file").forEach(el=>{
                el.classList.toggle("selected", el.dataset.fileName === file.name);
            });

        }

    }

    updateNavButtons();

}

function updateNavButtons(){

    const back = document.getElementById("nav-back");
    const forward = document.getElementById("nav-forward");

    if(back) back.disabled = navIndex <= 0;
    if(forward) forward.disabled = navIndex >= navStack.length - 1;

}

(function bindNavButtons(){

    const back = document.getElementById("nav-back");
    const forward = document.getElementById("nav-forward");

    if(back) back.addEventListener("click", ()=> goNav(-1));
    if(forward) forward.addEventListener("click", ()=> goNav(1));

})();


/* ==========================================================
   MOBILE（狭い画面では一覧と本文を切り替えて表示）
========================================================== */

function showViewerOnMobile(){

    const ws = document.getElementById("workspace");

    if(ws) ws.classList.add("show-viewer");

}

function showListOnMobile(){

    const ws = document.getElementById("workspace");

    if(ws) ws.classList.remove("show-viewer");

}

(function bindViewerBack(){

    const btn = document.getElementById("viewer-back");

    if(btn) btn.addEventListener("click", ()=>{
        play("click");
        showListOnMobile();
    });

})();


/* ==========================================================
   CLOCK
========================================================== */

(function startClock(){

    const el = document.getElementById("system-time");

    if(!el) return;

    function tick(){
        const d = new Date();
        el.textContent =
            String(d.getHours()).padStart(2, "0") + ":" +
            String(d.getMinutes()).padStart(2, "0") + ":" +
            String(d.getSeconds()).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);

})();


/* ==========================================================
   PATH / STATUS DISPLAY
========================================================== */

function updatePath(){

    if(!pathBar) return;

    const folderName =
        archiveData[currentFolder] ? archiveData[currentFolder].name : "";

    const fileInFolder =
        currentFile &&
        archiveData[currentFolder] &&
        archiveData[currentFolder].files.includes(currentFile);

    pathBar.textContent =
        "Archive / " + folderName + (fileInFolder ? " / " + getDisplayLabel(currentFile) : "");

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

    // 別のアカウントでログインし直したときに、前のセッションで
    // 出ていたフォルダが残らないようにする
    ["sidebar-found", "sidebar-personal"].forEach(id=>{
        const group = document.getElementById(id);
        if(group) group.innerHTML = "";
    });

    navStack = [];
    navIndex = -1;
    currentFile = null;

    loadArchiveSave();
    restorePreviousUnlocks();

    updateAccessDisplay();
    checkLevelUnlocks();
    checkClearanceUpgrade();

    revealOwnPersonalFolder();

    updateFolderBadges();

    openFolder("welcome", { silent:true });

    const welcome =
        archiveData.welcome.files[0];

    if(welcome){
        openFile(welcome, { silent:true });
        const first = fileList.querySelector(".file");
        if(first) first.classList.add("selected");
    }

}

window.addEventListener("load", ()=>{
    initializeExplorer();
});


/* ==========================================================
   PHOTO VIEW（集合写真。実画像は無いので人型シルエットで代用。
   カーソルを合わせると個々の状態が見える）
========================================================== */

function renderPhotoView(file){

    let html = `<article class="sheet sheet-paper photo-sheet">`;

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

    html += `</div></article>`;

    viewerContent.innerHTML = html;

}
