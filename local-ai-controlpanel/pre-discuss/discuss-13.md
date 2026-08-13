整體架構思路是紮實的——尤其是「驗證期完全禁用 Cloud」這個紀律,比很多正式立項的 agent 專案都嚴謹。但你問有沒有建議,那我就講幾個我會認真看待、目前規格書裡還沒解決的地方,依照它們會在哪個 Phase 咬你來排:

- **Phase 1 之前**：Phase 1 要先搭好 repo scaffold、TypeScript CP、State Machine、Worker Interface、Pi 整合,才能跑出第一次「Task → Pi → Patch → Test」。但真正決定這專案值不值得做下去的問題——「把驗證過的 evidence 塞給 9B,成功率會不會真的跳一大截」——根本用不到這些東西就能測。我會建議先花一兩天寫個一次性腳本：手動準備 5-10 題的 evidence bundle,直接組 prompt 餵 llama.cpp,比較有/無 evidence 的答對率。訊號夠強再蓋完整架構,訊號很弱代表增益可能主要來自 Policy/Verification 而不是 Research,優先順序要調整。

- **Phase 3（Research + Evidence Gate）之前**：Evidence Gate 的 PASS/RESEARCH_AGAIN/BLOCK 全靠 `confidence` 這個數字,但規格書沒講它怎麼算。如果是讓 LLM 自己對證據打分,等於用同一個「不知道自己不知道」的模型去判斷證據可不可信——這正是專案一開始想解決的問題,繞了一圈繞回去。confidence 該來自可重現訊號（來源權威度、多來源交叉一致、retrieval ranking）,不然 `minimum_confidence: 0.85` 現在只是隨手寫的數字。

- **Phase 4（Reflection）之前**：Reflection 把失敗分成 coding_error/knowledge_error/model_limitation 等六類,直接決定 retry 還是 stop,但分類器本身多準沒交代。分類錯誤會被吃進最終 Success Rate,讓你分不清是「架構沒用」還是「分類器判斷錯」——這個分類器的準確率應該獨立驗證(找一小批失敗案例人工核對),不能只信任它的輸出。

- **Phase 5（Benchmark）之前，也是我覺得最值得注意的一個洞**：A–F 的 ablation 沒有真正測到專案的核心主張。discuss-1/2 起手的論點是「deterministic policy 強制查證」會贏過「讓 LLM 自己決定要不要查」,但現在 Group B「9B + Research」沒說清楚是「Research 永遠強制執行」還是「9B 自己決定要不要呼叫 research 工具」。不拆成兩組,就算 F 贏了 A,也答不出「贏的到底是有證據,還是證據被強制要求」——這正是整個專案要驗證的東西。建議在第 34 節明確加一組 LLM-discretionary 對照。

- **同樣在 Phase 5**：K8s/Helm/Ansible 佔 dataset 20%,但這三類的 verifier 強度跟 Python/Go/TS 不對等——`kubectl --dry-run`、`helm template`、`ansible-lint` 驗證的是語法/schema 合法,不是「這個 Deployment 真的做到要求的事」,跟 pytest 那種語意層級驗證不是同一回事。IaC 這桶的 Level 4-5 任務容易出現「verification 顯示 PASS 但其實沒做對」的偽陽性,拉高那個語言桶的成功率,污染跨語言比較——這剛好是你的強項領域,反而最容易被忽略。

要不要我把這幾點整理成新的一節(例如「45. Design Risks」)補進規格書,還是先留在討論階段就好?
