/* ==========================================================
   ECLIPSE LAB
   STAFF DATABASE — ARCHIVE BRIDGE
   staff-records-data.js

   職員情報の本体は login.js の staffDatabase に統一する。

   このファイルでは staffDatabase の内容を
   Staff Database フォルダへ表示するための変換だけを行う。

   職員情報をここで再定義しない。
========================================================== */


/* ==========================================================
   ARCHIVE統合
========================================================== */

if(
    typeof archiveData !== "undefined" &&
    archiveData.staff &&
    typeof staffDatabase !== "undefined"
){

    const staffArchiveFiles =
        Object.entries(staffDatabase)

        .filter(([id, staff]) => {

            /*
                通常ログイン用の特殊アカウントや
                職員番号を持たないシステムアカウントは
                Staff Databaseの表示対象から除外。
            */

            return staff.employeeId;

        })

        .map(([id, staff]) => ({

            name: staff.name,

            label:
                "Staff_" +
                staff.name +
                ".rec",

            type:"staff",

            employeeId:
                staff.employeeId,

            department:
                staff.department || "",

            isDepartment:
                staff.isDepartment === true,

            level:
                staff.level,

            rank:
                staff.rank,

            permission:
                staff.permission,

            sections:
                staff.sections || [],

            personalPassword:
                staff.personalPassword || null,

            personalArchive:
                staff.personalArchive || []

        }));


    archiveData.staff.files =
        archiveData.staff.files.concat(
            staffArchiveFiles
        );

}