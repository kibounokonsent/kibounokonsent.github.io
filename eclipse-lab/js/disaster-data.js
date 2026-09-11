/* ==========================================================
   ECLIPSE LAB
   DISASTER RECORDS DATA
   disaster-data.js

   2016/01/06に何が起きたか。時系列の概観資料（PLATINUM）、
   場所別CCTV音声ログ（PLATINUM）、個人別の最終記録
   （各人物の元々の権限階級を維持）で構成する。

   個人別の最終記録・CCTV音声ログには relatedStaff（staffRecords
   のemployeeIdまたは部門名）を持たせている。Staff Databaseの
   各職員詳細ページ（explorer.js findRelatedLogs）から逆引き
   できるようにするため。CCTV音声ログ内であえて話者を明記して
   いない箇所は、relatedStaffにも含めない（記録として本当に
   分からないものは分からないままにする）。

   読み込み順は data.js（staffRecords / entities-data.js concat後）
   より後であればよい。

   ---- STEP1 棚卸し（確定分） ----
   廃止: Initial_Alert_Log.txt（→各CCTVへ分散）
   廃止: Final_Transmission.txt（→CCTV_Audio_Archiveへ統合）
   廃止: Final_Office_Chatter.txt（→CCTV_Audio_Research_Bへ統合）
   廃止: Disaster_Chain_2016_01_06.txt（Incident_Chronologyと役割重複
         かつ「0000関連設備に異常」が核心情報の早期開示だったため、
         神の目線監査で完全削除。誰が書いたか不明な施設全体タイムライン
         は今後追加しない）
   維持: 個人別最終記録9本（うちFinal_Office_Chatterのみ廃止済み）
   追加: CCTV_Audio_* 全7本（現在①〜⑤確定、⑥検討中、⑦未着手）
   追加予定: Personnel_Status.txt / CCTV_AUDIO_INDEX.txt（未着手）

   ---- 神の目線監査ルール（記録を書く前に決める） ----
   1. 誰が書いた／記録した？（人物名 or システム名）
   2. その書き手・システムは何を知りうる立場か？
   3. その時点でその情報を知っていたか？
   4. なぜこの記録を残した／なぜ自動記録されたか？
   → これを超えて「施設で何が起きたか」を無人称の語り手が
     説明してしまう文章は書かない。ただしシステムが検知できる
     範囲の自動ログ（アラーム・通信断・ドア状態など）自体は
     Eclipse Labの世界に実在するシステムとして問題ない。
========================================================== */

archiveData.disaster = {

    name:"災害記録",

    files:[

        /* ---------- 時系列・概観（PLATINUM） ---------- */

        {
            name:"Incident_Chronology.txt",
            permission:"platinum",
            content:
`
【インシデント記録】INCIDENT LOG — 2016/01/06

02:14:07　警報発生。

02:14:19　第3区画封鎖を確認。

02:14:31　原因：不明。

02:15:02　研究棟Bとの通信断。

02:16:44　――応答なし。

02:19:55　複数区画で同時異常を確認。

02:24:10　収容設備の一部機能停止。

02:31:27　避難指示、館内放送に切り替え。

03:02:18　通信ステータス：断続的。

03:02:19　NO DATA

03:02:20　NO DATA

03:02:21　―――――――――――
`
        },

        /* ---------- 場所別 CCTV音声ログ ---------- */

        {
            name:"CCTV_Audio_Research_B.txt",
            permission:"platinum",
            relatedStaff:["0006","0007"],
            content:
`
[CCTV AUDIO LOG]
LOCATION: RESEARCH-B
DATE: 2016/01/06

02:03:11

0006
「この数値、昨日から少し変じゃない？」

0007
「どれ？」

0006
「ここ。……まあ、誤差か。」

0007
「じゃあ、また後で。」

0006
「うん。」

[DOOR CLOSE]

―――――――――――

02:14:07

[ALARM]

0006
「……警報？」

0007
「何の？」

[DOOR LOCK]

0006
「ちょっと待って。これ、開かない。」

0007
「え？」

02:14:52

0006
「管理部、聞こえますか？」

[NO RESPONSE]

0006
「……管理部？」

02:15:31

0007
「別の回線は？」

0006
「今、確認する。」

[NOISE]

02:16:44

0006
「……返事、ないね。」

[FOOTSTEPS]

[DOOR OPEN]

[RECORDING INTERRUPTED]
`
        },

        {
            name:"CCTV_Audio_Administration.txt",
            permission:"platinum",
            relatedStaff:["3305","5218"],
            content:
`
[CCTV AUDIO LOG]
LOCATION: ADMINISTRATION
DATE: 2016/01/06

02:14:31

3305
「状況、分かる人？」

5218
「まだ確認中です」

[ALARM]

3305
「研究棟B、応答ありますか？」

[NO RESPONSE]

3305
「……0006、聞こえてる？」

[NO RESPONSE]

―――――――――――

02:18:20

3305
「技術部門、誰かお願いします」

[NO RESPONSE]

5218
「こちら管理部、応答願います」

[NOISE]

―――――――――――

02:22:10

5218
「3305さん、避難経路の確認を」

3305
「分かりました。……そちらは？」

5218
「こちらは大丈夫です」

3305
「そうですか」

[短い沈黙]

5218
「……大丈夫ですよね」

3305
「……はい」

―――――――――――

02:27:08

[電話の呼び出し音]

3305
「……誰か、出てください」

[NO RESPONSE]

[RECORDING INTERRUPTED]
`
        },

        {
            name:"CCTV_Audio_Technical.txt",
            permission:"platinum",
            relatedStaff:["0005"],
            content:
`
[CCTV AUDIO LOG]
LOCATION: TECHNICAL
DATE: 2016/01/06

02:15:04

0005
「……この配線、さっきから反応がおかしい」

「どっちの系統？」

0005
「収容区画側」

[NOISE]

―――――――――――

02:19:40

[ALARM]

0005
「切り替える。ちょっと待って」

「間に合う？」

0005
「今やってる」

[NOISE]

―――――――――――

02:24:10

0005
「……止まった」

「直った？」

0005
「いや、止まっただけ」

[NOISE]

0005
「管理部、こちら技術部門。応答願います」

[NO RESPONSE]

―――――――――――

02:29:55

0005
「……もう一回だけ」

[NOISE]

02:31:52

[FOOTSTEPS]

[RECORDING INTERRUPTED]
`
        },

        {
            name:"CCTV_Audio_Cafeteria.txt",
            permission:"platinum",
            relatedStaff:["食堂スタッフ"],
            content:
`
[CCTV AUDIO LOG]
LOCATION: CAFETERIA
DATE: 2016/01/06

02:31:27

[館内放送]
「全職員は、現在の作業を中断し――」

[放送停止]

「……避難、ですか？」

―――――――――――

02:33:05

[FOOTSTEPS]

「こっちです。座れるところ、空いてます」

「水、ありますか」

「あります。少し待ってください」

「何人くらい？」

「今、数えます」

―――――――――――

02:37:44

「まだ来ますか？」

「たぶん、あと少し」

[NOISE]

「そっち、詰めてもらえますか」

「はい」

―――――――――――

02:41:18

「……あと何人ですか？」

「分かりません」

「さっきまで、もっといたよね」

「……」

02:43:10

[NO RESPONSE]

[RECORDING INTERRUPTED]
`
        },

        {
            name:"CCTV_Audio_Corridor_03.txt",
            permission:"platinum",
            content:
`
[CCTV AUDIO LOG]
LOCATION: CORRIDOR-03
DATE: 2016/01/06

02:36:19

[FOOTSTEPS]

「……誰かいる？」

[NO RESPONSE]

「……」

[FOOTSTEPS]

[DOOR OPEN]

―――――――――――

02:41:52

[FOOTSTEPS]

「こっち」

「……」

[遠くの声]

「まだ？」

「もう少し」

[NOISE]

―――――――――――

02:47:08

[複数の足音]

「大丈夫ですか」

「……はい」

[短い沈黙]

「行きましょう」

[FOOTSTEPS]

[DOOR CLOSE]

―――――――――――

02:51:04

[NOISE]

[RECORDING INTERRUPTED]
`
        },

        {
            name:"CCTV_Audio_Archive.txt",
            permission:"platinum",
            content:
`
[CCTV AUDIO LOG]
LOCATION: ARCHIVE
DATE: 2016/01/06

02:03:40

[NOISE]

0001
「本日分、バックアップ完了。」

―――――――――――

02:14:07

[ALARM]

0001
「……これは。」

02:15:22

0001
「研究棟B、応答願います。」

[NO RESPONSE]

0001
「……もう一度。研究棟B。」

[NO RESPONSE]

―――――――――――

02:31:40

0001
「食堂、聞こえますか。」

[NO RESPONSE]

0001
「こちらアーカイブ室、0001。応答願います。」

[NO RESPONSE]

―――――――――――

02:46:15

0001
「技術部、状況を。」

[NOISE]

[NO RESPONSE]

0001
「……もう一度だけ。」

[NO RESPONSE]

―――――――――――

03:04:29

0001
「誰か、いないか。」

[NO RESPONSE]

―――――――――――

03:12:03

[NOISE]

0001
「……記録は、続ける。」
`
        },

        /* ---------- CCTV_Audio_0001周辺 は検討中のため未収録 ---------- */

        /* ---------- 個人別 最終記録 ---------- */

        {
            name:"Sakei_Final_Observation.txt",
            permission:"silver",
            relatedStaff:["3642"],
            content:
`
【観察記録・最終】担当：佐伯

どの紛異体が異常を起こしたか。
どこの区画が破壊されたか。
今までにこんな行動をしたことがあるか。
設備はどの程度破損しているか。

――――――――――――――――

……こんなはずではなかった。

何が起きているんだ。
`
        },

        {
            name:"Kanda_Final_Log.txt",
            permission:"silver",
            relatedStaff:["3305"],
            content:
`
【最終ログ】神田

まだ誰か残っている。

そちらの区画は確認したか。
まだ動ける人はいないか。

自分のことより先に、
それを確認していた。
`
        },

        {
            name:"Takahashi_Evacuation_Notes.txt",
            permission:"gold",
            relatedStaff:["5218"],
            content:
`
【避難記録】高橋

避難経路、まだ通れます。

誰かまだ残っていませんか。

0001さん、
そちらは、
早く逃げてください。
`
        },

        {
            name:"Nishimura_Assembly_Log.txt",
            permission:"gold",
            relatedStaff:["2048"],
            content:
`
【集合記録】西村

食堂に残っている職員、
こちらへ。

一人ずつでいい。
まとめて連れて行く。

はぐれるな。
`
        },

        {
            name:"Kobayashi_Final_Entry.txt",
            permission:"gold",
            relatedStaff:["2210"],
            content:
`
【最終記録】小林

まだ、誰かいるかもしれない。

怖いが、
確認しに行く。

放っておけない。
`
        },

        {
            name:"NightShift_0005_Message.txt",
            permission:"silver",
            relatedStaff:["0005","技術部門"],
            content:
`
【夜勤ログ】0005→技術部門

0005
「技術部門、聞こえますか」

技術部門
「聞こえてます。どうしました？」

0005
「ゲート、閉めてください。
このままだとまずいです」

技術部門
「……了解しました。
ゲートを閉鎖します」

技術部門
「そちらは大丈夫ですか？」

0005
「まだ大丈夫です」

技術部門
「まだ、って何ですか」

0005
「……あとで話します」

技術部門
「分かりました。
そちらも早く戻ってください」

0005
「はい」

[通信終了]

―――――――――――

0005
「技術部門、聞こえてますか？」

応答なし

0005
「聞こえてますか？」

応答なし

0005
「そうか……」

0005
「謝れなかったな」
`
        },

        {
            name:"Accounting_Staff_Personal_Log.txt",
            permission:"silver",
            relatedStaff:["経理担当"],
            content:
`
【個人記録】経理担当

避難者名簿、確認中。

給与関連の書類、
一旦保留とする。

未処理の申請、
まだ残っている。

――――――――――――――――

母は元気でしょうか。
`
        },

        {
            name:"Cafeteria_Staff_Last_Check.txt",
            permission:"silver",
            relatedStaff:["食堂スタッフ"],
            content:
`
【最終確認】食堂スタッフ

厨房の電気、
まだ点いている。

食材、
まだ残っている。

戻ってくる職員のために、
何か置いておこうか。

――――――――――――――――

冷蔵庫にプリンが残っている。

誰か食べてくれるかな。
`
        }

    ]

};
