# Feedback Template for AI 分身優化

將提取出的修正點轉換為可執行的 Prompt 更新。

## 格式

```markdown
### Feedback #N
- **Session**: {title} (`{session_id}`)
- **Time**: {timestamp}
- **Context**: {assistant was doing what}
- **Assistant 輸出**: {summary}
- **我的修正**: {what I said}
- **泛化規則**: {extracted principle for System Prompt}
- **建議更新位置**: {System Prompt section / Custom Command / patterns/ file}
- **狀態**: [ ] 未處理 [ ] 已更新 Prompt [ ] 已加入 patterns/
```

---

## 從最新提取的 9 筆修正點

### Feedback #1
- **Session**: 重新梳理 digital-twin.md 文件 (`ses_03e5d9a8...`)
- **Time**: 2026-08-02T17:23:25
- **Context**: 助手給了 4 項優化建議
- **Assistant 輸出**: 建議檔案拆分、待辦具體化、部署策略補充、路徑表加欄位
- **我的修正**: 「先做 檔案拆分 版本歷程 「整合 Telegram」改成... 路徑表格可以定義 部署策略遺漏？但這是要使用 opencode 內建的 agent 機制...」
- **泛化規則**: 當助手給多項建議時，我會明確指定優先順序與執行範圍，不希望一次全做
- **建議更新位置**: System Prompt → 執行準則「先思考、後執行」補充：收到多項建議任務時，先詢問優先順序或等待使用者指定範圍
- **狀態**: [ ] 未處理

### Feedback #2
- **Session**: 重新梳理 digital-twin.md 文件 (`ses_03e5d9a8...`)
- **Time**: 2026-08-02T17:30:12
- **Context**: 助手詢問 System Prompt 檔案放哪裡
- **Assistant 輸出**: 列出 3 個選項（全域、專案目錄、建立目錄）
- **我的修正**: 「先寫到 /Users/david/tasks/digital-twin/.opencode/agents/my-clone.md（跟規劃文件放一起） .opencode/commands/auto-review.md 也要一併拆出」
- **泛化規則**: 偏好將規劃文件與實作檔案放在同一專案目錄下，便於版控與關聯
- **建議更新位置**: System Prompt → 上下文參考規範補充：專案規劃文件與其產出的設定檔（agents、commands）應放在同一專案目錄
- **狀態**: [ ] 未處理

### Feedback #3
- **Session**: 台股量化MCP規格書優化（v1.3） (`ses_04875861...`)
- **Time**: 2026-07-31T17:42:57
- **Context**: 助手完成規格書 v1.3
- **Assistant 輸出**: 已產出規格書，列出 4 項核心優化
- **我的修正**: 「review ~/tasks/tw-quant-daybrain/tw-quant-daybrain-v1.0.md 並產生優化版本為 ~/tasks/tw-quant-daybrain/tw-quant-daybrain-v1.1.md」
- **泛化規則**: 完成一份文件後，常要求立即對照其他相關文件進行同步更新/優化
- **建議更新位置**: Custom Command `/sync-docs` 或 System Prompt 執行準則
- **狀態**: [ ] 未處理

### Feedback #4
- **Session**: jarvis和taolive-ios未完成任务置为skip (`ses_04d7b9dd...`)
- **Time**: 2026-07-30T18:17:46
- **Context**: 助手完成任務狀態更新
- **Assistant 輸出**: 已將任務改為 skip，同步更新 README、task 檔案
- **我的修正**: 「python3 ~/skills/clw-ideas2tasks/scripts/update_daily.py python3 ~/skills/clw-ideas2tasks/scripts/update_projects.py 我重跑後，仍有許多任務顯示於‘待處理高優先級任務’？」
- **泛化規則**: 執行腳本後要驗證實際效果，不只看腳本輸出；若結果不符預期，要回報具體差異
- **建議更新位置**: System Prompt → 執行準則「小步快跑」補充：執行自動化腳本後，必須驗證實際產出是否符合預期
- **狀態**: [ ] 未處理

### Feedback #5
- **Session**: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
- **Time**: 2026-07-30T16:58:49
- **Context**: 助手完成規格書新增章節
- **Assistant 輸出**: 已補充四燈號健診系統到規格書
- **我的修正**: 給了詳細的任務生成指令（參考 template、放特定路徑、status/assignee 格式、檔名規範）
- **泛化規則**: 產生任務檔案時有固定模板與規範（路徑、格式、欄位），應內化為標準流程
- **建議更新位置**: Custom Command `/gen-tasks` + patterns/task-template.md
- **狀態**: [ ] 未處理

### Feedback #6
- **Session**: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
- **Time**: 2026-07-30T19:39:55
- **Context**: 助手完成前端儀表板實作
- **Assistant 輸出**: 列出 API、前端頁面實作內容
- **我的修正**: 「前端要包進 dockerfile 中，可參考 ~/Projects/tw-quant-selector/Dockerfile ~/Projects/tw-quant-selector/docker-compose.yml 來做」
- **泛化規則**: 專案有既定的 Docker 化範例，新增服務時必須參考現有 Dockerfile/compose 範例
- **建議更新位置**: patterns/docker-patterns.md + System Prompt 上下文參考
- **狀態**: [ ] 未處理

### Feedback #7
- **Session**: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
- **Time**: 2026-07-30T20:16:41
- **Context**: 助手完成五欄表格同步更新
- **Assistant 輸出**: 已同步更新觀察頁面、設定管理頁面、YAML 設定
- **我的修正**: 「將以上要求補充進 /Users/david/tasks/tw-quant-signal/tasks/T009-dashboard-performance-tracking.md 並更新...驗收標準」
- **泛化規則**: 實作完成後，必須同步更新對應任務文件的驗收標準與內容
- **建議更新位置**: System Prompt → 執行準則補充：完成實作後，自動更新對應任務檔的驗收標準與完成摘要
- **狀態**: [ ] 未處理

### Feedback #8
- **Session**: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
- **Time**: 2026-07-30T20:22:11
- **Context**: 助手解釋資料缺失原因並修復
- **Assistant 輸出**: 找到 DB 查詢缺欄位問題並修復，說明前端路徑修正
- **我的修正**: 給了具體的公式呈現格式範例：「計算公式: (近4季平均EPS - 前4季平均EPS) / 前4季平均EPS × 100% 結果: ... 可以改成這樣的呈現麼？」
- **泛化規則**: 修復 Bug 時，我會給具體的輸出格式範例，期望助手照著格式調整呈現
- **建議更新位置**: patterns/output-formats.md + Custom Command
- **狀態**: [ ] 未處理

### Feedback #9
- **Session**: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
- **Time**: 2026-07-30T20:50:00
- **Context**: 助手總結資料源限制
- **Assistant 輸出**: 列出已完成/無法改善/口徑差異三類
- **我的修正**: 「幫我補充 無法改善...及 口徑差異...的細項進任務文件」
- **泛化規則**: 討論結論/決策紀錄必須寫入任務文件（ADR 風格），不只是聊天記錄
- **建議更新位置**: System Prompt → 上下文參考規範：重要技術決策與限制說明必須同步寫入 ~/notes/adr/ 或任務文件
- **狀態**: [ ] 未處理

---

## 批次處理建議

1. **每週執行一次**：`python3 extract_feedback.py --days 7 --only-corrections --output feedback_raw.md`
2. **人工過濾**：打開 `feedback_raw.md`，逐筆判斷是否為真正修正
3. **填入模板**：將真正的修正複製到本檔案的對應區塊
4. **提煉規則**：寫出「泛化規則」，決定更新位置
5. **套用更新**：
   - System Prompt 修改 → 更新 `.opencode/agents/my-clone.md`
   - 模式歸納 → 新增/更新 `~/notes/patterns/*.md`
   - 重複流程 → 新增 Custom Command `.opencode/commands/*.md`
6. **驗證**：用新 Prompt 跑一個實際任務，觀察是否改善