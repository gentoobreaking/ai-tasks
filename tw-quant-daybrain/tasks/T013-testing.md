---
github_issue: N/A
title: 測試策略與模擬盤（Mock MCP Server）
type: testing
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T013 - 測試策略與模擬盤

## 目標
建立可離線、可重現之測試體系（§13 對應 daybrain 側）：Mock MCP Server 回放 fixtures、守門/評分/風控單元測試、全盤模擬日測試。

## 驗收標準
- [ ] Mock MCP Server：實作 mcp v1.3 工具契約之假實作，以錄製 fixtures（`testdata/mcp/{intraday,post_market,futures,calendar}.json`）回放；支援「逾時資料」「資料缺口」「連線中斷」三種故障注入
- [ ] 單元測試覆蓋：T003 守門（全狀態）、T007 評分（全權重/邊界/Veto）、T008 風控（狀態機/上限/時間）、T010 指標（合成事件）
- [ ] 全盤模擬日測試：以單日 fixture 序列（09:00–13:30，含爆量/假突破/停損/停利案例）跑完整 Phase 0→4，驗證事件日誌與預期決策序列一致
- [ ] 測試指令：`npm run test`（離線全綠）+ `npm run test:simulate`
- [ ] 故障注入測試：資料逾時→STALE、MCP 斷線→LOCKOUT、LLM 離線→fallback 報告

## 備註
- 模擬日 fixture 需標註 `scoring_version`，跨版本測試可驗證模型變更影響
- 與 mcp 專案 T019 之 fixtures 保持同源可參照（附錄 A 對齊）
