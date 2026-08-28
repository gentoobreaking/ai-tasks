---
id: T052
project: gold-analysis
source_project: gold-analysis-improve
title: gold-monitor-issue 歷史任務彙整（已完成/歸檔）
assignee: "pi with opencode/x-preview-f-free"
priority: low
type: documentation
status: done
created: 2026-04-12
updated: 2026-08-28
estimate: 1小時
depends_on: []
github_issue: ""
---

## 目標
將 `gold-monitor-issue/tasks/` 原有 8 個任務（T001-T008）彙整歸檔到 `gold-analysis` 任務體系，建立對應對照表，保留關鍵修復歷程，避免重複追蹤。

## 驗收標準
- [x] 建立 8 個原始任務對應現有核心任務的對照表
- [x] 記錄關鍵修復歷程（根因、修復內容、cron 更新、驗證結果）
- [x] 列出已完成的相關核心任務對應關係
- [x] 標明重複任務已標記 skip，無需重複執行
- [x] 列出後續追蹤項目
## 背景
`~/tasks/gold-monitor-issue/tasks/` 原有 8 個任務（T001-T008），屬於早期 `gold-analysis-improve` 專案的獨立追蹤。這些任務內容已被 `gold-analysis` 核心任務（T001-T051）吸收或完成，現彙整歸檔，避免重複追蹤。

## 任務對應對照表

| 原任務 | 標題 | 狀態 | 對應現有任務 | 說明 |
|--------|------|------|-------------|------|
| T001 | 修復歷史資料與固定基準比較邏輯（state file → history["daily"]） | done | T038 / T001 | 已合併至核心 T001 環境建置 + T038 重構 |
| T002 | 三日觀察驗證（Day1-Day3 比對線上價位） | done | — | 驗證記錄，已完成可歸檔 |
| T003 | 更新 TASK 格式及 HOWTO 文件 | done | T001-T051 格式化 | 已完成全專案格式化 |
| T004 | 實時顯示黃金存摺買入/賣出雙價格 | done | T004 / T019 | 已在核心交易接口實作 |
| T005 | 檢查及修正黃金存摺價格監控 | skip | T001 | 內容與 T001 重複，已標記 skip |
| T006 | 更新為同時抓取及顯示 賣出 買入 價格 | skip | T004 | 內容與 T004 重複，已標記 skip |
| T007 | 檢查及修正 黃金存摺價格監控（歷史資料有誤） | done | T038 / T001 | 同 T001，已歸檔 |
| T008 | 更新為同時抓取及顯示 賣出 買入 價格 | done | T004 / T019 | 同 T004，已歸檔 |

## 關鍵修復歷程摘要（來自 T001）

**根因**：daily cron 在 15:30 執行，銀行晚上才更新最終掛牌 → 收盤價紀錄比瀏覽器看到的低 9 元

**修復內容**（2026-04-16 完成）：
- `--check` 改從 `history["daily"]` 取最近營業日當基準，不再依賴 state file
- 廢除 `~/.qclaw/gold_monitor_state.json`（已刪除）
- `gold_monitor.py` 重構，`--check` 改用 `history["daily"]` 作為唯一事實來源
- cron 更新：`--check` 擴展到 9-21 點，`--daily` 改 22:00 執行
- 驗證：sell=4,914 / buy=4,857 vs 昨天收盤 4,923/4,866，變動 -9 元

**cron 更新**：
- `--check` 擴展到 9-21 點（每小時）
- `--daily` 改 22:00 執行（確保銀行已更新最終掛牌）

**驗證結果**（2026-04-16）：
- sell=4,914 / buy=4,857 vs 昨天收盤 4,923/4,866，變動 -9 元
- 符合預期，邏輯修正完成

## 相關核心任務（已完成）

| 任務 | 狀態 | 說明 |
|------|------|------|
| T001 | done | 環境建置、依賴安裝 |
| T038 | done | gold_monitor_pro 架構重構（移除 SQLite、tmp file、URL 模式整合） |
| T001 (core) | done | 環境建置、依賴安裝 |
| T004 (core) | done | 核心頁面開發（含雙價格顯示） |
| T019 | done | 交易接口設計（含雙價格） |
| T020 | done | 交易對接（含雙價格） |

## 歸檔說明

本任務僅作為歷史脈絡保存，不產生新代碼。原 `gold-monitor-issue/tasks/` 8 個任務已全部對應至核心任務完成，無需重複執行。原資料夾 `~/tasks/gold-monitor-issue/` 可歸檔備份。

## 相關提交
- `clw-gold-monitor` v2.0.1 已發布至 ClawHub
- `clw-gold-monitor-pro` 同步更新（SQLite is_daily_close 欄位）
- T038 相關提交：`gold_monitor_pro` 重構

## 後續追蹤
- T048：RestExchangeClient 實盤冒煙測試（pending，需沙箱帳號）
- T043：A/B 分流入口與週期排程（pending）
- T044：前端接線 ML 運維頁面（done）

---

_建立日期: 2026-04-12_
_彙整日期: 2026-08-28_

📂 原始 GitHub Issues: #28, #29, #30, #31, #57, #58, #60, #61