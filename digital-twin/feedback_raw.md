# Potential Correction Points (Feedback Candidates)

## Session: 重新梳理 digital-twin.md 文件 (`ses_03e5d9a8...`)
**Time**: 2026-08-02T17:23:25.688000
**Assistant said**: 

幾個建議：

1. **檔案拆分**：AI 分身的 System Prompt 範本（約 120 行）應該獨立成 `.opencode/agents/my-clone.md`，這裡只留連結引用，避免規劃文件與設定檔混淆
2. **待辦事項過於抽象**：四項待辦都沒有明確的完成標準（Definition of Done），例如「確定核心 Prompt」建議改成「產出 `.opencode/agents/my-clone.md` 第一版」、「整合 Telegram」改成「Python 腳本能透過 Telegram Bot 接收訊息並呼叫 OpenCode」
3. **部署策略遺漏**：專案目標提到 Local LLM / OpenClaw，但兩條架構途徑都只圍繞 OpenCode，沒有 Local LLM（如 ollama + open-webui）的路徑規劃
4. **路徑表格可以順便定
**You corrected**: 先做 檔案拆分 版本歷程 「整合 Telegram」改成「Python 腳本能透過 Telegram Bot 接收訊息並呼叫 OpenCode」路徑表格可以定義
部署策略遺漏？但這是要使用opencode內建的agent機制，還需要local llm或openclaw?


---

## Session: 重新梳理 digital-twin.md 文件 (`ses_03e5d9a8...`)
**Time**: 2026-08-02T17:30:12.903000
**Assistant said**: 兩個路徑都不存在。這份文件是規劃階段，沒有對應的專案目錄，所以 System Prompt 範本應該拆到哪？有幾個選項：

1. 寫到 `~/.config/opencode/agents/my-clone.md`（全域，未來所有專案都能用）
2. 寫到 `/Users/david/tasks/digital-twin/.opencode/agents/my-clone.md`（跟規劃文件放一起）
3. 先建立目錄再寫入

另外 `.opencode/commands/auto-review.md` 是否也要一併拆出？
**You corrected**: 先寫到 /Users/david/tasks/digital-twin/.opencode/agents/my-clone.md（跟規劃文件放一起）
 .opencode/commands/auto-review.md 也要一併拆出

---

## Session: 台股量化MCP規格書優化（v1.3） (`ses_04875861...`)
**Time**: 2026-07-31T17:42:57.836000
**Assistant said**: 已產出 `~/tasks/tw-quant-mcp/tw-quant-mcp-spec-v1.3.md`。相較 v1.2 的核心優化：

1. **版本與結構**：修正標題 v2.0/檔名 v1.2 不一致，統一為 v1.3，重排章節
2. **資料來源鎖定**：§2 Source Registry 登錄 7 個官方來源（TWSE OpenAPI/Web/MIS、TPEx、MOPS、TAIFEX API/DL），只允許官方免費來源，禁止第三方抓取
3. **Data Lineage 貫徹**：定義處理管線（fetch→raw→validate→normalize→cache→response）、`_lineage` 完整結構（含 source_role/derived_from/sampling/cache_ttl）、統一 Response Envelope
4. **快取與 Rate L
**You corrected**: review ~/tasks/tw-quant-daybrain/tw-quant-daybrain-v1.0.md
並產生優化版本為 ~/tasks/tw-quant-daybrain/tw-quant-daybrain-v1.1.md

---

## Session: jarvis和taolive-ios未完成任务置为skip (`ses_04d7b9dd...`)
**Time**: 2026-07-30T18:17:46.024000
**Assistant said**: 已經全部修改完成：

- **jarvis** — 4 個未完成任務（T021, T022, T043, T044）已從 `in-progress`/`pending` 改為 `skip`
- **taolive-ios** — 48 個 pending 任務（T08~T67）已全部改為 `skip`
- 兩個專案的 README.md 的 Skip 項目區段、開發中/待實作區段、Task 列表狀態、以及統計摘要行都已同步更新
- 52 個 individual task markdown 檔案內的 frontmatter `status` 也已一併修改
**You corrected**: python3 ~/skills/clw-ideas2tasks/scripts/update_daily.py
python3 ~/skills/clw-ideas2tasks/scripts/update_projects.py
我重跑後，仍有許多任務顯示於“ 待處理高優先級任務”？

---

## Session: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
**Time**: 2026-07-30T16:58:49.460000
**Assistant said**: 已補充至規格文件 `3.2.2 新增功能` 下的 **「四燈號健診系統（新增 v1.1）」** 段落，包含：

- 四面向（基本面/籌碼面/技術面/估值面）各 25% 權重
- 12 項子指標的細部權重、燈號門檻、數據來源
- 綜合評分計算公式
- 綜合總分對應燈號與意義表（5 級距）
**You corrected**: 依照這份開發規格書及，以新增任務來產生每個步驟的任務檔。
拆分多個任務皆可。
參考~/Projects/ai-skills/clw-ideas2tasks/templates/task-template.md範本來建立任務。
任務應放於~/tasks/tw-quant-signal/tasks/中

status: 確實更新狀況(pending,done,in-progress)
assignee: assignee: OpenCode with DeepSeek V4 Flash
任務檔名要符合規範： T001-testing.md (example)

---

## Session: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
**Time**: 2026-07-30T19:39:55.131000
**Assistant said**: T009 完成。總結實作內容：

**後端** (`src/tw_quant_signal/api/app.py`)
- `GET /api/stocks` — 標的列表（最新價、健診、風險）
- `GET /api/stocks/{id}/detail` — 完整明細（120日K線/技術指標/法人/財報/健診/風險/規則）
- `GET /api/rules` + `PUT /api/rules` — 規則 CRUD（讀寫 YAML）
- `GET /api/config` + `PUT /api/config` — 設定編輯
- `GET /api/market-state`, `/api/health`, `/api/dashboard`
- Production 模式自動 serve 前端靜態檔

**前端** (`frontend/`)
- **頁面 1：台股訊號觀察** — 標
**You corrected**: 前端要包進dockerfile中，可參考
~/Projects/tw-quant-selector/Dockerfile
~/Projects/tw-quant-selector/docker-compose.yml
來做

---

## Session: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
**Time**: 2026-07-30T20:16:41.141000
**Assistant said**: 完成。五欄表格 (指標/權重/計分方式/計算公式/結果) 已同步更新到：

- **觀察頁面** (`HealthAspectDetail.tsx`): 顯示各子指標的公式 (from YAML `formula`) 與即時結果值 (`value → score分`)
- **設定管理頁面** (`RulesManagement.tsx`): 計算公式為可編輯文字欄位，結果欄顯示 `—` (無即時資料)
- **YAML 設定** (`health_check.yaml`): 12 個子指標皆新增 `formula` 欄位
**You corrected**: 將以上要求補充進/Users/david/tasks/tw-quant-signal/tasks/T009-dashboard-performance-tracking.md
並更新/Users/david/tasks/tw-quant-signal/tasks/T009-dashboard-performance-tracking.md的的驗收標準

---

## Session: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
**Time**: 2026-07-30T20:22:11.805000
**Assistant said**: 找到問題了。`db.get_health_scores()` 之前沒有 SELECT `details` 欄位，所以前端收到的 health 物件沒有 `details` → 查不到子指標資料 → 結果全部顯示 `- → -`。已修正：

- `db.py:get_health_scores` — 加入 `details` 欄位選取並做 `json.loads` 還原
- 前端 `HealthAspectDetail.tsx` 中 `health.details[aspectKey].sub[key].value` 路徑正確 (`sub` 是 dict 不是 array)
**You corrected**: 四面向健診細項 舉例
計算公式 :  (近4季平均EPS - 前4季平均EPS) / 前4季平均EPS × 100%
結果: 近4季平均EPS數值 - 前4季平均EPS數值 / 前4季平均EPS數值  × 100% = 結果數值

可以改成這樣的呈現麼？

---

## Session: 股票AI信號規格邏輯數據與結論 (`ses_04dcab2b...`)
**Time**: 2026-07-30T20:50:00.382000
**Assistant said**: 針對資料源限制，目前實際可行的改善方向：

**已完成：**
- EPS 成長率改 yfinance 季度實際 EPS（Q1'26 7.9 vs Q1'25 3.93 = +101%）
- 營收成長率改季度 YoY（Q4'25 1,616億 vs Q4'24 1,142億 = +42%）
- 毛利率趨勢改前後期變化（34.59% vs 35.51% = -0.92%）

**無法改善（目前無穩定 API）：**
- **月營收**: TWSE `StkMonthRev` 已失效，MOPS 無穩定 JSON API，只能靠 yfinance 季度資料
- **EPS 即時性**: yfinance 約落後 1 季（Q2'26 財報截止 8/14），屆時會自動更新

**口徑差異（非錯誤）：**
- 殖利率 0.52%（winvest 用除息前收盤價）vs 0.78%（TWSE 用即時股價）

**You corrected**: 幫我補充 無法改善（目前無穩定 API）及 口徑差異（非錯誤）的細項進/Users/david/tasks/tw-quant-signal/tasks/T009-dashboard-performance-tracking.md

---
