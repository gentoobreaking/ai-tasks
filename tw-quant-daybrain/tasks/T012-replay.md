---
github_issue: N/A
title: 回放工具與滑價驗證
type: tooling
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T012 - 回放工具與滑價驗證

## 目標
實作 §1 原則 5「所有決策可回放」之工具：以事件日誌重演單日決策、追溯每筆訊號之判定輸入，並驗證滑價（T010 依賴）。

## 驗收標準
- [ ] CLI 工具 `replay --date YYYY-MM-DD`：重演當日事件序列（訊號→觸發→進場→出場），輸出時間軸
- [ ] 決策追溯：每筆 `signal_issued` 可展開其輸入（當時之 VWAP/surge/分數 breakdown/data_quality）與守門結果
- [ ] 重演不呼叫 MCP：純讀取事件日誌（T004）與必要之 `_chart_meta` 快照，離線可用
- [ ] 滑價驗證模式：讀取 T010 滑價結果，標註異常滑價（> 0.3%）之訊號
- [ ] 輸出支援 JSON（供自動化比對）與人類可讀摘要
- [ ] 測試：以合成事件序列驗證重演輸出與原始事件一致

## 備註
- 回放工具是參數實驗（T015）之驗證基礎，Signals 快照需含 `scoring_version`
- 事件日誌缺欄位時需明確警示，不得靜默填補
