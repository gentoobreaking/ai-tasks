---
github_issue: N/A
title: 盤前流程（Phase 0 + Phase 1 選股）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-10
---

# T006 - 盤前流程

## 目標
實作 Phase 0 資料就緒檢查與 Phase 1 盤前戰術規劃（§4 Phase 0/1）：多路徑選股、過濾、生成候選清單並設定 mcp Watchlist。Bias 鎖定與 Tactical Briefing 產出由 T016/T019 承接，本任務僅產出候選清單。

## 驗收標準
- [x] Phase 0：MCP 連線驗證（tools/list）、前一日盤後資料預熱（`freshness == POST_MARKET_TODAY` 檢查）、缺口於盤前報告註明
- [x] Phase 1 選股三路徑去重：`get_institutional_investors`（投信+外資同步買超前 20）、`get_abnormal_trading`（量能異常）、`get_major_announcements`（重大訊息個股）
- [x] 過濾：`scan_daytrade_eligibility` 剔除禁止當沖/處置/注意/停資停券；剔除無觸發價者
- [x] 候選清單生成（3–5 檔）：每檔含做多觸發價（昨日高點 + 站穩 VWAP 條件）、硬停損（-1.5% 或 VWAP，先觸發）、catalyst、risk_status
- [x] 呼叫 `set_active_watchlist`（≤15 檔）啟動 mcp 8s 採樣；失敗 → §3.2 降級並記錄
- [x] 盤前報告輸出（結構化：watchlist + 每檔依據 + 資料缺口清單）
- [x] 單元測試：三路徑去重、過濾規則、觸發價/停損價計算、無候選股之空清單處理

## 備註
- 選股數量不足 3 檔時需降低門檻（如買超前 30）或註明低訊號日，不可硬湊
- v2.0：候選清單為 §5 Bias 決策樹（T016）之輸入，每檔需保留 bias 評估所需之昨日收盤/法人籌碼/量能欄位
- 此階段觸發價等硬數字為規則計算，LLM 只負責 catalyst 敘事（§16）
