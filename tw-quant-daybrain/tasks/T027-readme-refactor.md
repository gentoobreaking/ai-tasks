---
github_issue: ""
title: "README 重構——CLI 優先 + 功能總覽 + 流程圖 + 應用情境"
type: task
priority: medium
status: done
depends_on: [T025]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-12
updated: 2026-08-12
---

# T027 - README 重構（CLI 優先 + 功能總覽 + 流程圖 + 應用情境）

## 目標

原 README 以 9 個「使用方式」TS API 片段為主（給庫開發者而非使用者），且示例引用未定義變數（`env`）無法編譯。重構為 **CLI 優先** 的使用者導向文件，並補齊功能描述、程序流程圖、應用情境。

## 驗收標準

- [x] **CLI 優先**：新增「你有哪些 CLI 可用」表格（9 命令 × 做什麼 × 何時用），每命令一行 + 一句人話說明；標註只有 `npm run start` 會真實下單，其餘皆離線工具
- [x] **TS API 拆分**：9 個「使用方式」段落移至 `docs/api.md`（給庫開發者）；修正原示例引用未定義 `env` 的 bug；補 `mcp.close()`；12 個引用 API 逐一驗證存在
- [x] **三種使用情境流程說明**：情境 A 生產（start + 時間軸表）、情境 B 模擬盤（test:simulate，註明「驗證引擎按設計運作」非「策略賺錢」）、情境 C 回測（grid-search → wfo → experiment 三階段落差）
- [x] **任務狀態 → 功能總覽**：26 行 checkbox 任務清單改為 15 行能力表格（能力 × 說明 × 對應模組），任務編號不再出現
- [x] **程序流程圖**：mermaid flowchart TD 完整生命周期（啟動 → 交易日判定 → Phase 0-4 → 強平時間點 → LLM 檢討 → 優雅關閉），含非交易日休眠分支；語法驗證通過
- [x] **應用情境與可整合方向**：9 個範例（實盤券商 API / 模擬競賽 / Telegram 通知 / LLM 投顧 / 回測管線 / BI 分析 / 教學 / 雲部署 / 參數實驗），每例標註「要自己做什麼」，誠實標註無內建推送
- [x] 保留：目錄結構、環境變數、免責聲明；README 221 → 約 250 行

## 備註

- 對應 commit：`T027 README 重構`（README.md + docs/api.md）
- 目錄結構新增 `docs/api.md` 條目，與規格書（`~/tasks/tw-quant-daybrain/tw-quant-daybrain-v2_1.md`）對齊
- mermaid 圖在無外掛的 Markdown 檢視器不顯示，已附文字版排程表兜底
- 應用情境範例基於實際模組能力撰寫（LLM 報告/paper trader/priority ranking 皆已實作）；「接券商下單」「接通知推送」屬需自行實作之整合，未誇大為內建功能
