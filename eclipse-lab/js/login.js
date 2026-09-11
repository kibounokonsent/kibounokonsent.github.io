/* ==========================================================
   ECLIPSE LAB
   AUTHENTICATION SYSTEM
   login.js

   認証は「完全ではない」という設定：
   - 0001 の正しいID/キー → 正規スタッフとして認証成功
   - 未入力              → Legacy Recovery が作動しGuestセッション
   - 未登録ID            → データベース再構成を試みGuestセッション
   - 無効化されたアカウント → 認証拒否、セッションは作られない
========================================================== */


/* ==========================================================
   STAFF DATABASE
   ここはログイン認証用の職員IDテーブル。
   物語上の実名スタッフ（staff-records-data.jsのemployeeId：
   3642佐伯/3305神田/5218高橋/2048西村/2210小林/1190三浦/0005-0007）
   とは別の採番。番号が重ならないよう管理すること。
========================================================== */

let loginProcessing = false;

const staffDatabase = {

    "0001":{
        name:"Unknown Staff 0001",
        key:"ECLIPSE-0001",
        status:"missing",
        level:"UNKNOWN",
        rank:"0001"   // 創設十席の一人。到達すると全クリアランス（PLATINUMの先）が開放される
    },

    "0002":{
        name:"Staff 0002",
        key:"ARCHIVE-0002",
        status:"deceased",
        level:"NONE",
        rank:null
    },

    "6110":{
        name:"Field Technician",
        key:"BRONZE-6110",
        status:"active",
        level:"ARCHIVE",
        rank:"BRONZE",
        personalArchive:[
            {
                name:"personal_readme.txt",
                isPersonal:true,
                content:
`
PERSONAL DIRECTORY

OWNER: 6110

保存されているデータはありません。
`
            }
        ]
    },

    "7225":{
        name:"Archive Analyst",
        key:"SILVER-7225",
        status:"active",
        level:"ARCHIVE",
        rank:"SILVER",
        personalArchive:[
            {
                name:"personal_readme.txt",
                isPersonal:true,
                content:
`
PERSONAL DIRECTORY

OWNER: 7225

保存されているデータはありません。
`
            }
        ]
    },

    "4090":{
        name:"Senior Researcher",
        key:"GOLD-4090",
        status:"active",
        level:"ARCHIVE",
        rank:"GOLD",
        personalArchive:[
            {
                name:"personal_readme.txt",
                isPersonal:true,
                content:
`
PERSONAL DIRECTORY

OWNER: 4090

保存されているデータはありません。
`
            }
        ]
    },

    "admin":{
        name:"System Administrator",
        key:"ROOT-ADMIN",
        status:"active",
        level:"ADMIN",
        rank:"PLATINUM",
        personalArchive:[
            {
                name:"personal_readme.txt",
                isPersonal:true,
                content:
`
PERSONAL DIRECTORY

OWNER: admin

保存されているデータはありません。
`
            }
        ]
    }

};


/* ==========================================================
   LOGIN
========================================================== */

function authorize(){

    if(loginProcessing) return;

    play("click");

    const id =
        document.getElementById("staff-id").value.trim();

    const key =
        document.getElementById("access-key").value.trim();

    /*
        未入力 → Legacy Recovery が作動し、Guestセッションを作成
    */
    if(id === "" && key === ""){

        loginProcessing = true;

        runAuthSequence(
            { type:"guest_empty" },
            ()=> finalizeLogin({ name:"Guest User", level:"ARCHIVE" })
        );

        return;
    }

    const staff =
        staffDatabase[id];

    /*
        未登録ID → データベース再構成を試み、Guestセッションを作成
    */
    if(!staff){

        loginProcessing = true;

        runAuthSequence(
            { type:"guest_unknown", id:id },
            ()=> finalizeLogin({ name:"Guest User", level:"ARCHIVE" })
        );

        return;
    }

    /*
        無効化されたアカウント → 認証拒否、セッションは作られない
    */
    if(staff.status === "deceased"){
        loginError("AUTHENTICATION DENIED");
        return;
    }

    if(key !== staff.key){
        loginError("INVALID ACCESS KEY");
        return;
    }

    /*
        正規スタッフの認証成功
    */
    loginProcessing = true;

    runAuthSequence(
        { type:"staff", id:id, staff:staff },
        ()=> finalizeLogin(staff, id)
    );

}


/* ==========================================================
   FINALIZE LOGIN（認証シーケンス完了後に呼ばれる）
========================================================== */

function finalizeLogin(staff, employeeId){

    if(typeof setSystemUser === "function"){
        setSystemUser(staff.name, staff.level, staff.rank, employeeId || null);
    }

    if(typeof saveUserSession === "function"){
        saveUserSession();
    }

    if(typeof loginComplete === "function"){
        loginComplete(staff.name, staff.level, staff.rank);
    }
    else if(typeof showScreen === "function"){
        showScreen("explorer-screen");
    }

}


/* ==========================================================
   LOGIN ERROR（キー不一致・アカウント無効時。認証シーケンスには進まない）
========================================================== */

function loginError(message){

    play("loginFail");

    if(typeof showNotification === "function"){
        showNotification(message, "warning");
    }

}


/* ==========================================================
   BUTTON
========================================================== */

window.addEventListener("load", ()=>{

    const button =
        document.getElementById("authorize");

    if(!button){
        console.error("AUTHORIZE BUTTON NOT FOUND");
        return;
    }

    button.addEventListener("click", authorize);

});
