---
github_issue: N/A
title: 壓測、參數實驗與 v2.0 發布
type: release
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-01
---

# T015 - 壓測與發布

## 目標
§19 Roadmap Phase 4 收尾：10s tick 全交易日壓測、評分參數實驗（scoring v2.0→v2.1 驗證流程）、附錄 A 對齊檢查與 v2.0 發布。

## 驗收標準
- [ ] 全交易日壓測：模擬盤（T013）以 10s tick 連續 09:00–13:30 運行，驗證無 tick 遺漏、事件日誌完整、記憶體穩定（無持續增長）
- [ ] 參數實驗流程：以 T012 回放工具對 `scoring_v2.0` 與候選參數（如量能 3.0→2.5）跑同一模擬日，輸出指標對比表（勝率/PF/假突破率）；回測參數實驗另以 T022 Grid Search + T023 WFO 驗證
- [ ] 實驗結論形成 v2.1 參數建議（於規格書 §0 版本變更記錄註記），預設仍以 v2.0 發行
- [ ] 附錄 A 對齊檢查表全數完成：Envelope 解析、盤中工具僅於 09:00–13:30、Watchlist ≤15、未知 source 守門失敗、零直連官方 API
- [ ] README：安裝、設定（§17.1 環境變數）、排程說明、免責聲明
- [ ] 交付：v2.0 tag + 發布說明；確認與 `tw-quant-mcp` v1.3 工具契約之相容性測試於 CI 常駐

## 備註
- 壓測需於實際交易日以 live mcp 跑一次對照（可標 `-tags=live`），其餘以模擬盤
- 參數實驗數據須留存（事件日誌 + 對比表），作為日後 v2.1 之依據
- v2.0 發布需確認 T016–T024 全數驗收通過（Roadmap Phase 1–4）
