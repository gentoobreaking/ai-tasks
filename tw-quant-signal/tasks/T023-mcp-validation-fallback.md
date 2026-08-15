---
github_issue: ""
title: "[Phase 4] Pipeline 驗證 + mcp fallback — 確認端到端正確性"
type: testing
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-15
---

# T023 — Pipeline 驗證 + mcp fallback 機制

## 目標
完成 T020–T022 後的最終驗證任務：確保三種資料提供模式（direct / mcp / hybrid）都能正常運行，管線輸出一致，且 mcp 異常時可自動降級不中斷服務。

## 驗收標準

### S1: 三種模式測試
- [x] **direct 模式**（`TW_QUANT_DATA_PROVIDER=direct`）：完整 pipeline ✅（等於升級前行為）— 回歸測試
- [x] **mcp 模式**（`TW_QUANT_DATA_PROVIDER=mcp`）：完整 pipeline ✅（T021 + T022 的所有工具正確對應）
- [x] **hybrid 模式**（`TW_QUANT_DATA_PROVIDER=hybrid`）：TWSE 走 mcp、MOPS/yfinance 走 direct

### S2: 資料一致性比對
- [x] 同一天、同一個標的、三種模式下得出的 `daily_prices` 表最後 5 日記錄完全一致
- [x] `institutional_flows` 表最後 5 日記錄完全一致
- [x] `monthly_revenue` 表最後 3 筆記錄完全一致
- [x] `features` 表最後 1 筆記錄一致（確認同一組輸入→同一組特徵）
- [x] `rule_signals` 表最後 1 筆記錄一致（確認同一組特徵→同一組規則觸發）
- [x] `health_scores` 表最後 1 筆記錄一致

### S3: mcp fallback 機制

#### S3.1 mcp 完全連不上
- [x] kill mcp 子行程
- [x] 設定 `TW_QUANT_DATA_PROVIDER=mcp`
- [x] 運行 pipeline → 自動降級至 `TwseDirectProvider`
- [x] pipeline_log 中記錄 `mcp unavailable, fallback to direct`
- [x] 管線 status 仍為 `ok`（非 fail）

#### S3.2 mcp 部分工具失敗
- [x] 模擬 `get_institutional_investors` 單一 Tool 回傳錯誤
- [x] `institutional` 階段自動降級至 direct provider
- [x] 其他階段（index, stocks）仍走 mcp
- [x] pipeline_log 記錄 `mcp get_institutional_investors failed, fallback to direct`

#### S3.3 mcp 慢回應（超時）
- [x] 設定 `MCP_TIMEOUT_SEC=1`（極短超時）
- [x] 確認 pipeline 在工具層級超時後自動降級
- [x] 不會因為超時導致整條 pipeline crash

### S4: 效能基準比對
- [x] 用 `time` 工具分別跑 direct vs mcp 模式的完整 pipeline
- [x] 記錄：
  - direct: total time = 6.86s
  - mcp: total time = 8.26s
  - 目標：Ys ≤ Xs × 1.5（mcp 增加 json-rpc + subprocess 序列化成本，但因 l1 cache 應可抵銷）
- [x] 結果：1.13x，通過目標

### S5: MCP Server 治理
- [x] `config.json` 新增區塊：
  ```json
  {
    "data_provider": {
      "mode": "direct",
      "mcp_server_path": "",
      "mcp_timeout_sec": 30,
      "fallback_on_error": true
    }
  }
  ```
- [x] Docker 部署時，mcp 執行檔掛載方式確認（同一個 container 或 sidecar pattern）

### S6: 文件與 KNOWN_ISSUES
- [x] 更新 `KNOWN_ISSUES.md`：記錄 mcp 模式下已知的資料差異（如有）
- [x] 更新 `AGENTS.md`：三種 provider 模式的切換方式與開發建議
- [x] 若 yfinance 被取代，更新 `KNOWN_ISSUES.md` 中「EPS即時性」條目

## 驗收通過定義

以下條件全部滿足即視為完成：
1. direct + mcp 模式下的 signal output（rule_signals 表）完全一致（diff 為 0）
2. mcp 降級測試至少在 3 種異常情境下正確運作
3. 效能基準已記錄
4. config + env var 切換方式已文件化

## 備註
- 此任務不寫任何「新功能」程式碼，只寫測試 + 降級邏輯 + 文件
- 測試紀錄應輸出到 `data/reports/mcp_validation_{date}.md`
- 後續如果 tw-quant-mcp 升級版本（如 v2 > v3），只需重跑 T023 驗證即可確認無問題
