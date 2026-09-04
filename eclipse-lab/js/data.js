/* ==========================================================
   ECLIPSE LAB
   ARCHIVE DATA
   data.js

   新しいフォルダ / ファイルを追加したいときは、通常は
   このファイルを編集すればOK（ロジック側のexplorer.jsには
   手を入れる必要がない）。

   ただし紛異体（Entity Database）だけは例外で、
   js/entities-data.js の entityRecords 配列で管理している。
   読み込み時に archiveData.entity.files へ自動反映される。

   ---- ファイルの書き方 ----
   {
       name: "表示名.txt",
       content: `本文`,

       // 省略可能なオプション
       permission: "bronze" | "silver" | "gold" | "platinum"  // 職員階級（rank）によるゲート
                  | "archive" | "unknown" | "secret"           // ログイン時のアクセスレベル（level）によるゲート
                  ,                                             // 未指定なら誰でも閲覧可
       hidden: true,                                   // 通常は一覧に出さない隠しファイル（現状未使用、将来用に予約）
       status: "damaged" | "locked" | "recovered",     // 本文は表示されるが、ビューア上部に状態バッジを追加する
       broken: { title:"...", sub:"..." },              // 本文の代わりに破損表示（ACCESS DENIEDとは別の、権限に関係ない読めなさ）
       unlocksArchive: "recovery"                       // このファイルを最後まで読むとlockedArchivesの
                                                          // 該当キーが解禁される
   }

   permission の2系統について：
   ・bronze/silver/gold/platinum は職員階級（rank）を見る。主にEntity DatabaseとInternal Logsで使用。
   ・archive/unknown/secret はログインレベル（level）を見る。0001のUNKNOWNレベルなど特殊ルート専用。
   両者は独立した軸であり、rankとlevelは別々にEclipseSystem.userへ保持される。
========================================================== */


/* ==========================================================
   通常フォルダ（サイドバーに最初から表示される）
========================================================== */

const archiveData = {

    archive:{
        name:"ECLIPSE LAB ARCHIVE",
        files:[
            {
                name:"Archive_Overview.txt",
                content:
`
ECLIPSE LAB ARCHIVE

設計方針：

1. 紛異体を知る
2. 職員の日常を知る
3. 0000と0001の関係を知る
4. 災害の真相を知る
5. 記憶として残す

本Archiveは、単なる資料の集積ではない。
何が起きたのかではなく、
誰がここで暮らし、研究し、最後の日を迎えたのかを記憶するための場所である。
`
            },
            {
                name:"Observation_Index.txt",
                content:
`
【観測資料目録】

0000 / 0001 / 紛異体 / 職員 / 災害記録

主要記録は、日常に潜む違和感から始まり、
災害資料へと接続する。

対象の読解順:

1. Entity Database
2. Staff Database
3. Internal Logs
4. 0000 Diary
5. 0001 Records
6. Disaster Records

最後に見えるものは、
施設そのものではなく、
ここにいた人々の存在である。
`
            },
            {
                name:"Access_Protocol.txt",
                permission:"gold",
                content:
`
【アクセス規定】

一般職員は通常資料のみ閲覧可能。
職員の内情や個人記録は、
必要な階級と承認を得た場合のみアクセスできる。

0000と0001の記録は、
通常の研究資料とは異なる分類を持つ。

本Archiveは、記録を読む行為自体が
追悼と確認の行為である。
`
            },
            {
                name:"Narrative_Sequence.txt",
                content:
`
【Archiveの読み順】

1. 紛異体を知る
2. 職員の日常を知る
3. 0000の存在を知る
4. 0001の痕跡を知る
5. 0000と0001の関係を知る
6. 2016/01/06の災害を知る
7. 最後に人々の記録を読む
8. その後に、Archive自体が記憶の器になる

本Archiveは、
単なる発見の記録集ではなく、
かつてここで生きていた誰かの痕跡を残すための場所である。
`
            }
        ]
    },

    entity:{
        name:"Entity Database",
        files:[]
    },

    staff:{
        name:"Staff Database",
        files:[
            {
                name:"Staff_Registry_Index.txt",
                content:
`
【職員名簿・閲覧索引】

- 0001 : 創設十席 / 研究記録の保管者
- 0005 : 技術部門 / 最後まで設備と通信を維持
- 佐伯 : 研究部門 / 手順と記録を残す
- 神田 : 監視と避難に奔走
- 高橋 : 脱出経路に尽力
- 西村 : 職員の避難を統率
- 小林 : 誰かを見失わない人物
- 経理担当 : 業務を最後まで守る
- 食堂スタッフ : 日常の痕跡を最後まで残す
`
            },
            {
                name:"Staff_Communication_Log.txt",
                permission:"silver",
                content:
`
【職員コミュニケーション記録】

職員間の会話は日常の雑談と同じように見えるが、
災害資料を読むと、
その一言ひとつが最後の会話として映る。

発話は小さくても、
それが人間の存在証明である。
`
            },
            {
                name:"Sakei_Final_Observation.txt",
                permission:"silver",
                content:
`
【佐伯・最終観測メモ】

2016/01/06 03:14

異常の範囲は予測より広い。

扉が勝手に閉まる。通信が断続的に切れる。
人が一人また一人、事情もなく席を外す。

最初は「会議のため」と言っていた。
そのあと、誰も帰ってこない。

私は依然として、
“原因を特定したい”と考えていた。

だが、
その考えはもう、
何かを理解するためではなく、
自分の足を止めるためのものだった。

最後に残した言葉は、
「こんなはずではなかった」
だった。
`
            },
            {
                name:"Kanda_Final_Log.txt",
                permission:"gold",
                content:
`
【神田・最終記録】

まだ誰か残っているかもしれない。

そう思って、
何度も廊下を見た。

逃げた人も、逃げ遅れた人も、
どこかにいる気がした。

私は、自分の足が止まるまで、
誰かのことを探していた。

あと一人なら、
もう少しで助けられたかもしれない。

その後悔は、
実際の事象よりもずっと長く残った。
`
            },
            {
                name:"Takahashi_Evacuation_Notes.txt",
                permission:"gold",
                content:
`
【高橋・避難経路メモ】

北側の階段は破損している。
東側の通路は潰れている。
南の出口に行ける可能性はある。

ただし、
そこに誰かが残っているなら、
その人はもうかなり前から待っている。

「逃げてほしい」

これだけは、
最後に書き残したかった。

あとで、
誰かがその文面を見て、
“またすぐ会える”と思ってしまうことを知っていた。
`
            },
            {
                name:"Nishimura_Assembly_Log.txt",
                permission:"silver",
                content:
`
【西村・避難指示メモ】

食堂にはまだ人がいる。

その人たちを、
一人でも多く連れて行きたい。

声をかけたのは、
治安のためではなく、
“すぐに戻ってくる”という言い方が、
全員にとって一番怖かったからだ。

人を集める時、
口に出してはいけないことがある。

それは、
もう誰も帰ってこないかもしれない、
という事実だった。
`
            },
            {
                name:"Kobayashi_Final_Entry.txt",
                permission:"gold",
                content:
`
【小林・最終記録】

まだ誰かいるのかを確かめに行こうとした。

違和感があって、
何も言えなかった。

怖いと感じたのは、
よく知っている人の顔が、
その場にいないことだった。

人は、最後の一人の前で、
ようやく自分が一人だったことを知る。

その瞬間、
私はもう、
誰かを見つける前に、
自分の名前を呼ばれなくなっていた。
`
            },
            {
                name:"Accounting_Staff_Personal_Log.txt",
                permission:"silver",
                content:
`
【経理担当・個人メモ】

未処理の書類が残っている。

給与明細。
門扉の点検予定。
備品補充一覧。

仕事をしないと、
人間はその場に居ることを忘れてしまう。

だから、
私は書類を整理し続けた。

母のことを思い出した。

病気のとき、
いつもまとめていたのは、
仕事の書類だった。

彼女はそれを見て、
「ちゃんとやってるね」と言っていた。

それだけが、
私は最後まで残せたものだった。
`
            },
            {
                name:"Cafeteria_Staff_Last_Check.txt",
                permission:"silver",
                content:
`
【食堂スタッフ・最後の確認】

冷蔵庫はまだ動いている。

プリンは残っている。

食べられるものは、
まだ少しだけあった。

最後に、
誰かが戻ってくるかもしれないと考えた。

だから、
すぐ食べてしまうのは、
気が引けた。

冷蔵庫に残っているプリンを見て、
私は、
一人の人間として、
“あとで食べる”という言い方を、
いちばん大事にしていた。
`
            }
        ]
    },

    incident:{
        name:"Incident Reports",
        files:[]
    },

    facility:{
        name:"Facility",
        files:[]
    },

    system:{
        name:"System",
        files:[]
    },

    observation:{
        name:"Observation Records",
        files:[
            {
                name:"Observation_Record_001.txt",
                content:
`
【観測記録 001】

対象の違和感は、最初は単なる施設内の異常として分類された。
だが、観測を重ねるうちに、
対象が「何かを探している」のではないかと推測される。

複数の紛異体が、同じ方向を向いている。

それは、単なる狂気ではなく、
何かを求める動きである。
`
            },
            {
                name:"Observation_Record_002.txt",
                permission:"gold",
                content:
`
【観測記録 002】

0000の接触が、ただの異常増幅ではなく、
紛異体の境界を揺らしていた可能性が高い。

はじめて行動に連鎖が生じたのは、
研究棟の南側区画からであった。

発生直後、各区画のログは誰もが "何が起きたのか分からない" で埋め尽くされた。
`
            }
        ]
    },

    zero:{
        name:"0000",
        files:[
            {
                name:"0000_Diary_Excerpt.txt",
                permission:"gold",
                content:
`
【0000 日誌抜粋】

今日は、思い出した。

人間としては、もうすぐ消えるのかもしれない。

だから、誰かに残したいものがある。

知識だけでは足りない。

人間が何を求めていたのか、
何を失ったのかも、
同じくらい大事だ。
`
            },
            {
                name:"0000_Research_Notes.txt",
                permission:"platinum",
                content:
`
【0000 研究ノート】

ここにある記録は、
“怪物の研究”ではなく、
“自分自身の欠落を確かめる行為”に近い。

記録に残るのは、
理解できなかったことだけである。

それでも、残しておくことが重要だった。
`
            },
            {
                name:"0000_Observation_01.txt",
                permission:"gold",
                content:
`
【0000 観測記録 01】

研究棟の南側区画で、
やけに静かな時間があった。

いつもと違うのは、
何も起きていないのに、
人の足音だけが一段大きく聞こえることだ。

紛異体はたしかに異常だ。
でも、
それと同じくらい不自然なのは、
人の気配が消えることだ。

誰かがいなくなるとき、
最初に失われるのは声ではなく、
その人が“ここにいた”と感じていた痕跡だ。
`
            },
            {
                name:"0000_One_Year_Later.txt",
                permission:"platinum",
                content:
`
【0000 断片】

たぶん、
これは最初の“接触”ではない。

何かに触ったあと、
人間はそれを忘れたふりをする。

でも、
忘れているのはただの記憶ではない。

一部の感情だけが、
正確に残る。

それを私は、
過去の自分のように見ていた。
`
            }
        ]
    },

    one:{
        name:"0001",
        files:[
            {
                name:"0001_Archive_Log.txt",
                permission:"platinum",
                content:
`
【0001 最終記録の断片】

「……0000」

返事はない。

返事がないこと自体が、
今の状態を説明している。

昔の話をしても、
もうそれは誰のものでもない。

ただ、ここに残っている。
`
            },
            {
                name:"0001_Conversation_00.txt",
                permission:"platinum",
                content:
`
【0001 対話記録】

「聞こえてるなら、返事をしてくれ」

返事はない。

「お前、何してるんだよ」

まだ返事はない。

「……ごめん」

それが一番長く残った言葉だ。

たぶん、
昔の私が、
やけに大きな言葉を使っていたからだ。

今の私は、
あまり大きくない声でよく喋っていた。

それも、
もうどこにも届かない。
`
            },
            {
                name:"0001_Last_Statement.txt",
                permission:"platinum",
                content:
`
【0001 最後の独白】

私はいつも、
人を残すことを恐れていた。

失うことを知っていたから。

でも、
ここに残るのは、
人間と施設と、消えた名前だけだ。

人は、最後に何を残すかじゃない。

誰を覚えているかで決まる。

だから、
私はこの記録を残す。

たぶん、
それで少しだけ、
誰かの中に残る。
`
            },
            {
                name:"0001_Final_Conversation.txt",
                permission:"platinum",
                content:
`
【0001 最終会話】

「……0000」

返事はない。

「聞こえているなら、返事をしてくれ」

返事はない。

「お前、何してるんだよ」

返事はない。

「……お前は、もう誰のものでもないんだろう」

返事はない。

それでも、
0001はなお、
昔の呼び方で話しかけていた。

それは、
“異常存在”としての0000ではなく、
かつて一緒に研究室で夜を過ごした、
もう一人の人間への呼びかけだったからだ。

「帰る場所、まだあったんだぞ」

そう言ったあと、
記録は途切れた。
`
            }
        ]
    },

    disaster:{
        name:"Disaster Records",
        files:[
            {
                name:"Incident_Chronology.txt",
                permission:"platinum",
                content:
`
【災害時系列】

2016/01/05
最後の通常ログ。

2016/01/06
異常発生。施設内の通信に乱れが生じる。

中盤
複数区画で同時多発。

終盤
職員の避難と孤立が始まる。

最終
0001が残る。
0000と紛異体の反応は消失。

残されたのは、
人間の最後の記録と、
誰にも言えなかった時間である。
`
            },
            {
                name:"Initial_Alert_Log.txt",
                permission:"platinum",
                content:
`
【異常発生初報】

2016/01/06 02:14

警報が一度鳴った。

だが、
誰もその音を「異常」と認識しなかった。

最初に確認されたのは、
収容区画の扉が勝手に施錠されたこと。

そのあとで、
同時にいくつもの区画で、
同じような異常が報告された。

「何が起きている」
という問いが、
実際の異常より先に届いた。
`
            },
            {
                name:"Survivor_Chronicle.txt",
                permission:"platinum",
                content:
`
【生存者の断片記録】

最後に残った時間は、
人が一人ずつ消える時間だった。

そのたび、
誰もが「まだ話し足りない」と言っていた。

話し足りないが、
たいていはもう遅かった。

記録に残るのは、
逃げた話ではなく、
誰が誰を待っていたかだ。
`
            },
            {
                name:"Final_Transmission.txt",
                permission:"platinum",
                content:
`
【最終通信】

受信終了。

施設の異常は静まり、
残るものはただ、
最後に残した声だけだった。

「忘れないでほしい」
`
            },
            {
                name:"Disaster_Chain_2016_01_06.txt",
                permission:"platinum",
                content:
`
【2016/01/06 災害連鎖】

0000の接触
↓
紛異体の過反応
↓
複数区画で同時異常発生
↓
収容設備の破綻
↓
通信の断絶
↓
職員の避難と孤立
↓
施設内の崩壊
↓
0001のみが残る

この連鎖は、
単純な事故や偶発的発火ではない。

記録のほとんどは、
「何が起きたか」ではなく、
「誰が最後まで残っていたか」
を証明するためのものだった。
`
            }
        ]
    },

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
            },
            {
                name:"Orientation_Schedule.txt",
                content:
`
【新人研修】オリエンテーション日程

第1日
・入館証発行
・施設案内
・安全講習

第2日
・部門紹介
・業務説明
・端末アカウント発行

第3日
・配属先決定
・OJT開始

不明点は人事担当までご連絡ください。
`
            },
            {
                name:"Facility_Guide_For_New_Staff.txt",
                content:
`
【新人研修】施設案内

Eclipse Labへようこそ。

以下、施設利用にあたっての基本情報です。


食堂

営業時間：11:00〜20:00


売店

日用品・軽食を取り扱っています。


職員寮

希望者は総務窓口へ申請してください。


収容区域

許可された職員以外の立ち入りはできません。

ID未登録の状態での接近も推奨されません。
`
            },
            {
                name:"Safety_Handbook_01.txt",
                content:
`
【新人研修】安全の手引き（1/2）

施設内で異常事態が発生した場合は、以下の対応に従ってください。


一、

最寄りの避難経路へ速やかに移動する。


一、

館内放送・警報に従う。


一、

自己判断で収容区画へ近づかない。


一、

異常を発見した場合は、必ず担当部門へ報告する。
`
            },
            {
                name:"Safety_Handbook_02.txt",
                content:
`
【新人研修】安全の手引き（2/2）

紛異体との接触が想定される部署に配属された場合、

以下の質問は禁止されています。


・「自由になりたいか」

・「外へ出たいか」

・「人間をどう思うか」

・「研究内容を知っているか」

・「職員個人について」


理由は追って研修内で説明されます。

現時点では、規則として遵守してください。
`
            },
            {
                name:"Employee_Code_of_Conduct.txt",
                content:
`
【新人研修】職員行動規範

Eclipse Lab職員は、以下を遵守するものとします。


一、管理規則を最優先すること。

一、紛異体へ不要な私情を持ち込まないこと。

一、許可なく管理区画へ立ち入らないこと。

一、異常を確認した場合は即時報告すること。

一、機密情報を外部へ漏洩しないこと。


なお、これらの規範は紛異体だけでなく、

職員自身にも適用されます。


職員もまた、管理対象です。
`
            },
            {
                name:"FAQ_For_New_Staff.txt",
                content:
`
【新人研修】よくある質問

Q. 給与の締め日はいつですか？

A. 毎月末締め、翌月15日払いです。


Q. 端末アカウントの初期パスワードがわかりません。

A. 職員証発行時のパスワードは「階級-職員番号」形式で自動生成されます。

（例：ブロンズ職員、職員番号1234の場合 → BRONZE-1234）

初回ログイン後、必ず変更してください。

※管理者アカウント（システム管理部門）は例外です。命名規則が異なります。


Q. 制服のサイズ交換はできますか？

A. 総務窓口で承っています。


Q. 有給休暇はいつから使えますか？

A. 入職6か月後からです。


Q. 前任者の私物が机に残っているのですが。

A. こちらで回収いたします。そのままお使いいただいて構いません。


Q. 配属先の前任担当者について教えてください。

A. この質問にはお答えできません。
`
            },
            {
                name:"Orientation_Notes.txt",
                content:
`
【新人研修】本資料について


本資料は定期的に改訂されています。


改訂履歴

第1版　人事部門
第2版　人事部門
第3版　人事部門
第4版　－
第5版　－
第6版　－


最終改訂者：不明

最終改訂日：不明
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
                status:"damaged"
            },
            {
                name:"Research_Log_Cross_Reference.txt",
                content:
`
CROSS-REFERENCE NOTICE


登録済み紛異体の管理番号・発生記録を統計処理した結果、

看過できない偏りが確認された。


全登録個体の発生時期・記録経路が、

特定の一人物の記録と高い相関を示している。


詳細は個体関連性分析アーカイブを参照。
`,
                // このファイルを最後まで読むと Cross-Reference Archive が解禁される
                unlocksArchive:"crossref"
            }
        ]
    },

    entity:{
        name:"Entity Database",
        // 中身は js/entities-data.js が読み込み時に差し替える
        files:[]
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
            },
            {
                name:"Founder_Numbering_Note.txt",
                permission:"gold",
                content:
`
【人事部門】内部メモ


職員番号0000〜0009について、問い合わせが複数寄せられているため周知します。


この番号帯は、創設十席と呼ばれる10名の創設者に割り当てられたものであり、

現在も一部の方が現役の職員として在籍しています。

新規採用者への番号割り当てには使用されません。


なお、各対象者の詳細な経歴については、本メモの対象外とします。
`
            },
            {
                name:"Staff_007.rec",
                broken:{
                    title:"UNKNOWN FORMAT",
                    sub:"THIS FILE CANNOT BE PARSED"
                }
            }
        ]
    },

    incident:{
        name:"Incident Reports",
        files:[
            {
                name:"Incident_001.log",
                broken:{
                    title:"DATA LOST",
                    sub:"NO RECOVERABLE FRAGMENTS"
                }
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

    crossref:{
        name:"Cross-Reference Archive",
        icon:"🔗",
        trigger:"event",
        unlockMessage:"[ARCHIVE NOTICE]\nNEW RECORD RECOVERED\n\nCATEGORY:\nCROSS-REFERENCE\nACCESS:\nCLEARANCE 04",
        files:[
            {
                name:"Cross_UN-R-276-RL.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
UN-R-276-RL『深い深い闇の中へ』


一致率：
91%


内面傾向：

自己認識への疑念。
孤独。
自己の内側に存在する未知への恐怖。


対象は、対象者自身の内面を
「外側から観測する」ことを強く促す傾向を持つ。


関連日誌照合：

断片的な記録との類似性を確認。

「自分が何者なのかを考えていた」

類似度：
HIGH


備考：

対象そのものよりも、
対象を見た後に現れる心理反応に
高い一致傾向が確認される。
`
            },

            {
                name:"Cross_UN-S-041-CF.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
UN-S-041-CF『溶けないロウソク』


一致率：
88%


内面傾向：

時間への意識。
過去への後悔。
取り戻せないものへの執着。


対象は観測者に対し、
「まだ間に合うのか」という感覚を残す。


関連日誌照合：

過去に記録された文章との
意味的類似性を確認。


「時間は、戻らない。」

類似度：
HIGH


備考：

対象の異常性は時間そのものではなく、
時間を意識した人間の心理にある可能性が高い。
`
            },

            {
                name:"Cross_AQ-S-118-CF.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
AQ-S-118-CF『夢魚』


一致率：
94%


内面傾向：

失われた夢。
忘却。
叶わなかった未来。


対象は「忘れたもの」を奪うのではなく、
どこかへ保存しているような挙動を示す。


関連日誌照合：

以下の記述との強い類似性を確認。


「忘れたと思っていた。
でも、本当に消えたのだろうか。」


類似度：
VERY HIGH


備考：

登録個体中、0000関連記録との
意味的整合性が特に高い個体。
`
            },

            {
                name:"Cross_HN-S-204-CF.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
HN-S-204-CF『拒絶する赤子』


一致率：
90%


内面傾向：

他者への接触願望。
拒絶への恐怖。
愛情を求めながら、
同時にそれを拒んでしまう矛盾。


対象の行動には、
「近づいてほしい」と「近づかないでほしい」
という相反する傾向が同時に存在する。


関連日誌照合：

複数の断片記録との類似性を確認。


「誰かに触れてほしかった。
でも、怖かった。」


類似度：
VERY HIGH


備考：

対象の身体的特徴よりも、
行動原理との一致が顕著。
`
            },

            {
                name:"Cross_UN-E-067-SC.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
UN-E-067-SC『儚い夕暮れ』


一致率：
89%


内面傾向：

喪失。
記憶。
誰かを待ち続ける感覚。
忘れたはずの存在への未練。


対象は具体的な人物を想起させない。

それでも観測者には、
「誰かを待っていた」という感覚だけが残る。


関連日誌照合：

以下の断片との意味的類似性を確認。


「誰を待っていたのか、
今ではもう思い出せない。」


類似度：
HIGH


備考：

対象は記憶そのものではなく、
記憶が失われた後に残る感情を
再現している可能性がある。
`
            },

            {
                name:"Cross_UN-E-132-SC.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
UN-E-132-SC
『いざなみに飲まれ、うたたねる望郷』


一致率：
93%


内面傾向：

喪失したものへの執着。
繰り返される別れ。
忘れられることへの恐怖。


対象内では、
「失われるたびに同じものを求める」
という現象が確認されている。


関連日誌照合：

過去記録との極めて高い
意味的類似性を確認。


「また会えるなら、
何度でも最初からでいい。」


類似度：
VERY HIGH


備考：

対象の「望郷」という性質と、
0000関連記録に残された感情との間に
強い一致が確認されている。
`
            },

            {
                name:"Cross_PS-E-089-SC.dat",
                content:
`
INDIVIDUAL RELEVANCE ANALYSIS


対象：
PS-E-089-SC『ミスター』


一致率：
92%


内面傾向：

自己否定。
理想の自分への執着。
「本当の自分」への疑念。


対象は宿主を変えるのではなく、
宿主が望んでいた別の可能性を
表面化させる。


関連日誌照合：

以下の記録との類似性を確認。


「もし違う自分だったなら、
何か変わっていたのだろうか。」


類似度：
VERY HIGH


備考：

他個体と比較して、
自己認識に関する一致率が特に高い。
`
            },

            {
                name:"Cross_Summary_Report.txt",
                content:
`
CROSS-REFERENCE SUMMARY


全登録個体、平均一致率：
91.0%


単純な偶然によって説明することは困難。


しかし、
「一致しているもの」が何なのかは
未だ確定していない。


身体構造。
異常性。
行動原理。
心理的影響。


いずれも完全な一致ではない。


むしろ共通しているのは、
各個体が示す「内面」である。


孤独。
喪失。
後悔。
恐怖。
忘却。
執着。
自己否定。


それぞれ異なる個体でありながら、
一人の人間が抱え得る感情として
非常に高い整合性を示している。


さらに、一部の研究員によって
過去の日誌記録との意味的類似性が指摘された。


日誌そのものは現存していない。

ただし、断片的に残された文章と
各個体の性質には明確な関連性が存在する。


現時点での仮説：

これらは「同じもの」なのではない。


「同じ人間が抱えていたもの」を
それぞれ別の形で表している。


関連記録番号：

0000
`,
                unlocksArchive:"zero"
            }
        ]
    },

    zero:{
        name:".0000",
        icon:"🔒",
        trigger:"event",
        unlockMessage:"[ARCHIVE NOTICE]\nPERSONNEL FILE RECOVERED\n\nCATEGORY:\nPERSONAL RECORD\nACCESS:\nCLEARANCE 05",
        files:[
            {
                name:"0000.dat",
                permission:"platinum",
                content:
`
PERSONNEL FILE


ID:

0000


DESIGNATION:

創設十席


STATUS:

不明


備考：

最初に、ある未知の領域へ到達したとされる人類。

その後の消息は記録されていない。


補足：

各紛異体資料に記載されていた「一致率」について。

これは個体そのものの一致率ではない。


一致率 ＝ 0000人格残滓との適合率


登録された紛異体は、

すべて0000という一人の人間に由来する。
`,
                unlocksArchive:"recovery"
            }
        ]
    },

    recovery:{
        name:"Recovery Archive",
        icon:"📁",
        trigger:"event",
        unlockMessage:"[ARCHIVE NOTICE]\nRECOVERY ARCHIVE ONLINE\n\nCATEGORY:\nRESEARCH RECOVERY\nACCESS:\nCLEARANCE 04",
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
    },

    secret:{
        name:"Secret Archive",
        icon:"🔒",
        trigger:"level",
        requiredLevel:"UNKNOWN",
        unlockMessage:"[ARCHIVE NOTICE]\nSECRET RECORDS UNSEALED\n\nCATEGORY:\nPERSONNEL FILE\nACCESS:\nUNKNOWN CLEARANCE",
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
    }

};