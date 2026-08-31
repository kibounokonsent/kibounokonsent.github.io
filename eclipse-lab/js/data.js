/* ==========================================================
   ECLIPSE LAB
   ARCHIVE DATA
   data.js

   新しいフォルダ / ファイル / Entity を追加したいときは
   このファイルだけを編集すればOK。ロジック側（explorer.js）
   には一切手を入れる必要がない。

   ---- ファイルの書き方 ----
   {
       name: "表示名.txt",
       content: `本文`,

       // 省略可能なオプション
       permission: "archive" | "unknown" | "secret",  // 未指定なら誰でも閲覧可
       hidden: true,                                   // 通常は一覧に出さない隠しファイル
       status: "damaged" | "locked" | "recovered",     // ビューアに状態バッジを出す
       unlocksArchive: "recovery"                       // このファイルを開くとlockedArchivesの
                                                          // 該当キーが解禁される
   }
========================================================== */


/* ==========================================================
   通常フォルダ（サイドバーに最初から表示される）
========================================================== */

const archiveData = {

    welcome:{
        name:"Welcome",
        files:[
            {
                name:"Welcome.txt",
                content:
`
Eclipse Lab Archiveへようこそ。

現在、通常システムは停止しています。

Archive Modeで起動しています。

左側のフォルダから閲覧を開始してください。
`
            }
        ]
    },

    archive:{
        name:"Archive",
        files:[
            {
                name:"Archive_Info.txt",
                content:
`
Archive Database

Recovered files:
Unknown

Status:
Partial Recovery
`
            },
            {
                name:"System_Log.txt",
                content:
`
System logs are damaged.

Some records were lost.
`,
                status:"damaged",
                // このファイルを開くと Recovery Archive が解禁される
                unlocksArchive:"recovery"
            }
        ]
    },

    entity:{
        name:"Entity Database",
        files:[
            {
                name:"Entity_0001.dat",
                content:
`
ENTITY DATA

ID:
0001

STATUS:
UNKNOWN

DATA:
Unavailable.
`
            },
            {
                name:"Entity_0002.dat",
                content:
`
ENTITY DATA

ID:
0002

STATUS:
ARCHIVED
`
            }
        ]
    },

    staff:{
        name:"Staff Database",
        files:[
            {
                name:"Staff_List.txt",
                content:
`
Staff Database

Most records are missing.
`
            }
        ]
    },

    incident:{
        name:"Incident Reports",
        files:[
            {
                name:"Incident_001.log",
                content:
`
Incident Report

DATA CORRUPTED.
`
            }
        ]
    },

    facility:{
        name:"Facility",
        files:[
            {
                name:"Facility_Map.txt",
                content:
`
Facility information unavailable.
`
            }
        ]
    },

    system:{
        name:"System",
        files:[
            {
                name:"System_Status.txt",
                content:
`
Archive System

STATUS:
ONLINE
`
            }
        ]
    }

};


/* ==========================================================
   隠しアーカイブ（条件を満たすまでサイドバーに出ない）

   trigger:"level"  → ログイン時のアクセスレベルが requiredLevel と
                       一致したら自動的に解禁される
   trigger:"event"  → archiveData 内のいずれかのファイルが
                       unlocksArchive:"このキー" を持ち、それが
                       開かれたときに解禁される
========================================================== */

const lockedArchives = {

    secret:{
        name:"Secret Archive",
        icon:"🔒",
        trigger:"level",
        requiredLevel:"UNKNOWN",
        files:[
            {
                name:"Staff_0001.log",
                content:
`
RECOVERY STAFF DATA

ID:
0001


STATUS:
MISSING


Last Record:

[DATA CORRUPTED]


Access granted by recovery key.
`
            },
            {
                name:"Lost_Report.dat",
                content:
`
WARNING

This file was recovered from
a damaged archive sector.


Some records are permanently lost.
`
            },
            {
                name:"Last_Message_0001.log",
                permission:"unknown",
                content:
`
ECLIPSE LAB

STAFF RECORD : 0001


--------------------------------


FINAL MESSAGE


The archive must survive.


If this data is recovered...

someone reached this place.


--------------------------------


STATUS:

MISSING


DATA END.
`
            },
            {
                name:"Experiment_Record_0001.dat",
                permission:"unknown",
                content:
`
PROJECT:

UNKNOWN


STAFF:

0001


RESULT:

CLASSIFIED


ACCESS:

LIMITED
`
            }
        ]
    },

    recovery:{
        name:"Recovery Archive",
        icon:"📁",
        trigger:"event",
        files:[
            {
                name:"Recovered_Log_0001.txt",
                permission:"unknown",
                content:
`
RECOVERY COMPLETE


STAFF ID:

0001


STATUS:

MISSING


LAST CONNECTION:

UNKNOWN
`
            }
        ]
    }

};
