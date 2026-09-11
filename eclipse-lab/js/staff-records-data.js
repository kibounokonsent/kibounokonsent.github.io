/* ==========================================================
   ECLIPSE LAB
   STAFF DATABASE — BASE PROFILES
   staff-records-data.js

   ここでは「箱」だけを作る。日常ログ・災害記録は含めない。
   後続のInternal Logs / Disaster Recordsが、ここで作った
   staffRecordsのemployeeIdやnameを参照して繋がっていく。

   個人：employeeId を持つ9名（0005/0006/0007は創設十席の
         番号帯だが、現役の一般職員として在籍している）。
   部門：employeeIdを持たない集団記録（経理担当・食堂スタッフ・
         技術部門）。isDepartment:true で区別する。

   permission未指定の項目は誰でも閲覧可。
========================================================== */

const staffRecords = [

    {
        employeeId:"3642",
        name:"佐伯",
        department:"研究部門",
        permission:"silver",
        personalPassword:"prin0417",
        personalArchive:[
            {
                name:"Diary_20151020.txt",
                isPersonal:true,
                content:
`
2015.10.20


観測データの整理、今日中に終わらせるつもりだったが終わらなかった。

明日に持ち越し。


高橋さんに先週貸した資料、まだ返ってきていない。

今度会ったら聞いてみる。
`
            },
            {
                name:"Diary_20151104.txt",
                isPersonal:true,
                content:
`
2015.11.04


食堂のプリンが今日も売り切れていた。

三浦さんが「11時には並ばないと無理」と言っていた。

今度試してみる。


午後、観測記録に少し引っかかる点があったので、

三浦さんに確認を頼んだ。返事はまだ。
`
            },
            {
                name:"Diary_20151215.txt",
                isPersonal:true,
                content:
`
2015.12.15


高橋さんから資料が返ってきた。

「前に返した」と本人は言っていたが、たぶん記憶違いだと思う。

まあ、それで済む話なのでもういい。


今日は特に変わったこともなし。
`
            }
        ],
        sections:[
            { heading:"配属", text:"研究部門所属。観測データの記録・整理を主な業務とする。" },
            { heading:"人物像", text:"落ち着いた状況判断に定評があり、報告書の正確さについて評価が高い。数値や記録を丁寧に積み上げるタイプ。" }
        ]
    },

    {
        employeeId:"3305",
        name:"神田",
        department:"管理部門",
        permission:"silver",
        personalPassword:"genba0621",
        personalArchive:[
            {
                name:"Diary_20151110.txt",
                isPersonal:true,
                content:
`
2015.11.10


高橋さんから、佐伯さん宛の資料を預かった。

今度会ったときに渡しておく。
`
            },
            {
                name:"Diary_20151128.txt",
                isPersonal:true,
                content:
`
2015.11.28


佐伯さんに渡す資料、まだ鞄に入れっぱなしだった。

今度こそ渡す。
`
            },
            {
                name:"Diary_20151214.txt",
                isPersonal:true,
                content:
`
2015.12.14


佐伯さんに資料を渡した。

遅くなって申し訳ないと伝えたが、本人はあまり気にしていない様子だった。


巡回の途中、小林さんに設備の件で少し相談された。

大したことではなかったので、その場で済ませた。
`
            }
        ],
        sections:[
            { heading:"配属", text:"管理部門所属。現場対応・巡回業務を担当。" },
            { heading:"人物像", text:"面倒見が良く、他部門からの相談を受けることも多い。自分の担当範囲を超えて動くことがある。" }
        ]
    },

    {
        employeeId:"5218",
        name:"高橋",
        department:"管理部門",
        permission:"silver",
        sections:[
            { heading:"配属", text:"管理部門所属。避難経路・設備点検を担当。" },
            { heading:"人物像", text:"細かい確認作業を苦にしないタイプ。甘いものを差し入れることが多く、休憩室で話題になることがある。" }
        ]
    },

    {
        employeeId:"2048",
        name:"西村",
        department:"管理部門",
        permission:"silver",
        sections:[
            { heading:"配属", text:"管理部門所属。職員間の調整・とりまとめを担当。" },
            { heading:"人物像", text:"職員をまとめる役回りを自然と引き受けることが多い。部門を横断した顔の広さがある。" }
        ]
    },

    {
        employeeId:"2210",
        name:"小林",
        department:"管理部門",
        permission:"silver",
        sections:[
            { heading:"配属", text:"管理部門所属。定期巡回・安全確認を担当。" },
            { heading:"人物像", text:"慎重な性格だが、気になることがあると確認せずにいられない。心配性、と同僚から言われることがある。" }
        ]
    },

    {
        employeeId:"1190",
        name:"三浦",
        department:"研究部門",
        permission:"silver",
        sections:[
            { heading:"配属", text:"研究部門所属。観測記録の分析を担当。" },
            { heading:"人物像", text:"データの中の小さな矛盾や偏りに気づきやすい。統計的な違和感を放置できない性格。" }
        ]
    },

    {
        employeeId:"0005",
        name:"0005",
        department:"技術部門",
        permission:"gold",
        sections:[
            { heading:"配属", text:"技術部門所属。設備保守を担当。創設十席の番号帯に属するが、現役の一般技術職員として勤務している。" },
            { heading:"人物像", text:"工具の扱いに慣れており、備品管理担当からたびたび注意を受けている。職員番号0002の担当にも関わっている。" }
        ]
    },

    {
        employeeId:"0006",
        name:"0006",
        department:"研究部門",
        permission:"gold",
        sections:[
            { heading:"配属", text:"研究部門所属、主に研究棟に常駐。創設十席の番号帯に属するが、現役の一般研究職員として勤務している。" },
            { heading:"人物像", text:"詳細な記録はまだ少ない。0007と組んで作業することが多い。" }
        ]
    },

    {
        employeeId:"0007",
        name:"0007",
        department:"研究部門",
        permission:"gold",
        sections:[
            { heading:"配属", text:"研究部門所属、主に研究棟に常駐。創設十席の番号帯に属するが、現役の一般研究職員として勤務している。" },
            { heading:"人物像", text:"詳細な記録はまだ少ない。0006と組んで作業することが多い。" }
        ]
    },

    {
        isDepartment:true,
        name:"経理担当",
        department:"経理部門",
        permission:"silver",
        sections:[
            { heading:"業務", text:"給与計算・請求書処理・避難者名簿の管理など、事務全般を担当する部門。" }
        ]
    },

    {
        isDepartment:true,
        name:"食堂スタッフ",
        department:"施設運営部門",
        permission:"silver",
        sections:[
            { heading:"業務", text:"職員食堂の運営を担当する部門。営業時間は11:00〜20:00。" }
        ]
    },

    {
        isDepartment:true,
        name:"技術部門",
        department:"技術部門",
        permission:"silver",
        sections:[
            { heading:"業務", text:"施設設備の保守・点検を担当する部門。職員番号0005もこの部門に所属している。" }
        ]
    }

];


/* ==========================================================
   ARCHIVE統合
   staffRecords を Staff Database フォルダ（archiveData.staff、
   最初から表示される）のファイル一覧に追加する。
   data.js側で定義済みの手動ファイル（Staff_List.txt等）は
   残したまま末尾に追加する。
========================================================== */

archiveData.staff.files = archiveData.staff.files.concat(

    staffRecords.map(staff=>({

        name: staff.name,
        label: "Staff_" + staff.name + ".rec",
        type:"staff",
        employeeId: staff.employeeId || null,
        department: staff.department,
        isDepartment: staff.isDepartment === true,
        permission: staff.permission,
        sections: staff.sections,
        personalPassword: staff.personalPassword || null,
        personalArchive: staff.personalArchive || []

    }))

);
