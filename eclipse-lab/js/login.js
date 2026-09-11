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
                isPersonal: true,
                content:
`
PERSONAL DIRECTORY

OWNER: 6110

メモ：ID 7225 / password lantern214
`
            }
        ]
    },

    "7225":{
        name:"Archive Analyst",
        key:"lantern214",
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
    },

        "3642":{
        name:"佐伯",
        key:"prin0417",
        status:"active",

        level:"ARCHIVE",
        rank:"SILVER",
        permission:"silver",

        employeeId:"3642",
        department:"研究部門",

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
            {
                heading:"配属",
                text:"研究部門所属。観測データの記録・整理を主な業務とする。"
            },
            {
                heading:"人物像",
                text:"落ち着いた状況判断に定評があり、報告書の正確さについて評価が高い。数値や記録を丁寧に積み上げるタイプ。"
            }
        ]
    },


    "3305":{
        name:"神田",
        key:"genba0621",
        status:"active",

        level:"ARCHIVE",
        rank:"SILVER",
        permission:"silver",

        employeeId:"3305",
        department:"管理部門",

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
            {
                heading:"配属",
                text:"管理部門所属。現場対応・巡回業務を担当。"
            },
            {
                heading:"人物像",
                text:"面倒見が良く、他部門からの相談を受けることも多い。自分の担当範囲を超えて動くことがある。"
            }
        ]
    },


    "5218":{
        name:"高橋",
        key:"ama0826",
        status:"active",

        level:"ARCHIVE",
        rank:"SILVER",
        permission:"silver",

        employeeId:"5218",
        department:"管理部門",

        personalPassword:"ama0826",

        personalArchive:[
            {
                name:"Diary_20151012.txt",
                isPersonal:true,
                content:
`
2015.10.12


避難経路の確認。

思ったより確認する場所が多い。


午後、佐伯さんに資料を借りた。

来週までには返す。
`
            },
            {
                name:"Diary_20151121.txt",
                isPersonal:true,
                content:
`
2015.11.21


休憩室に差し入れを置いておいた。

誰か食べるだろう。


神田さんに、佐伯さんから借りた資料を渡しておいてほしいと頼んだ。

自分で渡せるタイミングがなかなかない。
`
            },
            {
                name:"Diary_20151215.txt",
                isPersonal:true,
                content:
`
2015.12.15


佐伯さんから資料のことを聞かれた。

神田さんに渡したはずなので、そのことを伝えた。


神田さんがまだ持っていたらしい。

結果的には返ったので問題なし。


帰る前に避難経路をもう一度確認した。
`
            }
        ],

        sections:[
            {
                heading:"配属",
                text:"管理部門所属。避難経路・設備点検を担当。"
            },
            {
                heading:"人物像",
                text:"細かい確認作業を苦にしないタイプ。甘いものを差し入れることが多く、休憩室で話題になることがある。"
            }
        ]
    },


    "2048":{
        name:"西村",
        key:"nishi0319",
        status:"active",

        level:"ARCHIVE",
        rank:"SILVER",
        permission:"silver",

        employeeId:"2048",
        department:"管理部門",

        personalPassword:"nishi0319",

        personalArchive:[
            {
                name:"Diary_20151018.txt",
                isPersonal:true,
                content:
`
2015.10.18


朝から会議が多かった。

昼休みに神田さんから巡回表について確認があった。

記入漏れが一箇所あったので、その場で直した。
`
            },
            {
                name:"Diary_20151109.txt",
                isPersonal:true,
                content:
`
2015.11.09


食堂の新しいメニューを見た。

高橋さんが甘いものを頼んでいた。

午後は各部門の予定をまとめる作業。

特に問題なし。
`
            },
            {
                name:"Diary_20151222.txt",
                isPersonal:true,
                content:
`
2015.12.22


年末なので提出物の確認。

小林さんから巡回の時間を少しずらせないか相談された。

調整しておいた。

こういう細かい連絡が多い時期。
`
            }
        ],

        sections:[
            {
                heading:"配属",
                text:"管理部門所属。職員間の調整・とりまとめを担当。"
            },
            {
                heading:"人物像",
                text:"職員をまとめる役回りを自然と引き受けることが多い。部門を横断した顔の広さがある。"
            }
        ]
    },


    "2210":{
        name:"小林",
        key:"koba0724",
        status:"active",

        level:"ARCHIVE",
        rank:"GOLD",
        permission:"gold",

        employeeId:"2210",
        department:"管理部門",

        personalPassword:"koba0724",

        personalArchive:[
            {
                name:"Diary_20151025.txt",
                isPersonal:true,
                content:
`
2015.10.25


定期巡回。

いつも通り確認していたら、廊下の照明が一つ切れていた。

神田さんに連絡。

夕方には交換されていた。
`
            },
            {
                name:"Diary_20151116.txt",
                isPersonal:true,
                content:
`
2015.11.16


職員証を一度どこに置いたか分からなくなった。

結局、自分の机の引き出しに入っていた。

西村さんに「ちゃんとしてください」と言われた。

その通りだと思う。
`
            },
            {
                name:"Diary_20151227.txt",
                isPersonal:true,
                content:
`
2015.12.27


年末の設備確認。

特に異常なし。

0005さんが先に確認していた箇所もあったので、二重に見てしまった。

まあ、問題がないならそれでいい。
`
            }
        ],

        sections:[
            {
                heading:"配属",
                text:"管理部門所属。定期巡回・安全確認を担当。"
            },
            {
                heading:"人物像",
                text:"慎重な性格だが、気になることがあると確認せずにいられない。心配性、と同僚から言われることがある。"
            }
        ]
    },


    "1190":{
        name:"三浦",
        key:"miura1103",
        status:"active",

        level:"ARCHIVE",
        rank:"SILVER",
        permission:"silver",

        employeeId:"1190",
        department:"研究部門",

        personalPassword:"miura1103",

        personalArchive:[
            {
                name:"Diary_20151007.txt",
                isPersonal:true,
                content:
`
2015.10.07


佐伯さんから観測記録について確認を頼まれた。

数字を見直したが、単純な記入ミスだった。

本人にも伝えた。
`
            },
            {
                name:"Diary_20151103.txt",
                isPersonal:true,
                content:
`
2015.11.03


食堂のプリンを狙っている人が多い。

佐伯さんには11時には並んだ方がいいと言っておいた。

自分は今日は買えなかった。
`
            },
            {
                name:"Diary_20151218.txt",
                isPersonal:true,
                content:
`
2015.12.18


最近、同じ種類の観測データを何度も見直している気がする。

数値そのものに問題はない。

念のため佐伯さんにも共有しておいた。

今日はもう帰る。
`
            }
        ],

        sections:[
            {
                heading:"配属",
                text:"研究部門所属。観測記録の分析を担当。"
            },
            {
                heading:"人物像",
                text:"データの中の小さな矛盾や偏りに気づきやすい。統計的な違和感を放置できない性格。"
            }
        ]
    },


    "0005":{
        name:"0005",
        key:"tool0505",
        status:"active",

        level:"ARCHIVE",
        rank:"PLATINUM",
        permission:"platinum",

        employeeId:"0005",
        department:"技術部門",

        personalPassword:"tool0505",

        personalArchive:[
            {
                name:"Diary_20151005.txt",
                isPersonal:true,
                content:
`
2015.10.05


設備点検。

工具を一本持っていったまま戻すのを忘れていた。

技術部門のアイツから連絡が来たから、昼休みに返した。

また怒られた。

あんな怒らなくてもいいじゃん。
`
            },
            {
                name:"Diary_20151113.txt",
                isPersonal:true,
                content:
`
2015.11.13


0002の設備を少し見た。

動作は問題なし。

戻る途中で0006と0007が何か相談していた。

声をかけたら、あとでいいと言われた。
`
            },
            {
                name:"Diary_20151229.txt",
                isPersonal:true,
                content:
`
2015.12.29


年末の設備確認。

交換部品の在庫を確認した。

0006から研究棟側の工具について聞かれた。

どこにやったか忘れて、技術部門のアイツにチクられちゃった。あーあ、明日サボろっかな。
`
            },

                        {
                name:"Diary_20151231.txt",
                isPersonal:true,
                content:
`
2015.12.31

あーあ、今年も終わっちまうなー。

そういえばあの工具あそこに置いてたまんまだ、アイツに怒られたくないなー。
`
            }
        ],

        sections:[
            {
                heading:"配属",
                text:"技術部門所属。設備保守を担当。創設十席の番号帯に属するが、現役の一般技術職員として勤務している。"
            },
            {
                heading:"人物像",
                text:"工具の扱いに慣れており、備品管理担当からたびたび注意を受けている。職員番号0002の担当にも関わっている。"
            }
        ]
    },


    "0006":{
        name:"0006",
        key:"lab0616",
        status:"active",

        level:"ARCHIVE",
        rank:"PLATINUM",
        permission:"platinum",

        employeeId:"0006",
        department:"研究部門",

        personalPassword:"lab0616",

        personalArchive:[
            {
                name:"Diary_20151016.txt",
                isPersonal:true,
                content:
`
2015.10.16


研究棟の整理。

0007と一緒に古い記録を移動した。

箱が思ったより重かった。

明日も続き。
`
            },
            {
                name:"Diary_20151119.txt",
                isPersonal:true,
                content:
`
2015.11.19


昼過ぎに0005さんが来た。

設備のことで少し確認してもらった。

作業は予定通り進んでいる。
`
            },
            {
                name:"Diary_20151230.txt",
                isPersonal:true,
                content:
`
2015.12.30


年末なので研究棟も人が少ない。

0007と残っていた作業を終わらせた。

帰りに食堂へ寄ったが、もう閉まっていた。

明日は早めに帰る。
`
            },
            
        ],

        sections:[
            {
                heading:"配属",
                text:"研究部門所属、主に研究棟に常駐。創設十席の番号帯に属するが、現役の一般研究職員として勤務している。"
            },
            {
                heading:"人物像",
                text:"詳細な記録はまだ少ない。0007と組んで作業することが多い。"
            }
        ]
    },


    "0007":{
        name:"0007",
        key:"note0712",
        status:"active",

        level:"ARCHIVE",
        rank:"PLATINUM",
        permission:"platinum",

        employeeId:"0007",
        department:"研究部門",

        personalPassword:"note0712",

        personalArchive:[
            {
                name:"Diary_20151022.txt",
                isPersonal:true,
                content:
`
2015.10.22


0006と研究棟の記録を整理。

古い資料が多い。

必要なものと不要なものの区別がつきにくいので、いったん全部残すことにした。
`
            },
            {
                name:"Diary_20151125.txt",
                isPersonal:true,
                content:
`
2015.11.25


今日は作業が早く終わった。

0006と休憩室で少し話した。

特に用事はない。

こういう日もある。
`
            },
            {
                name:"Diary_20151231.txt",
                isPersonal:true,
                content:
`
2015.12.31


今年最後の確認。

研究棟は静かだった。

0006と一通り見て回って、問題がないことを確認。

来年も同じように続けばいいと思う。
`
            }
        ],

        sections:[
            {
                heading:"配属",
                text:"研究部門所属、主に研究棟に常駐。創設十席の番号帯に属するが、現役の一般研究職員として勤務している。"
            },
            {
                heading:"人物像",
                text:"詳細な記録はまだ少ない。0006と組んで作業することが多い。"
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
    loginComplete(staff.name, staff.level, staff.rank, employeeId);
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
