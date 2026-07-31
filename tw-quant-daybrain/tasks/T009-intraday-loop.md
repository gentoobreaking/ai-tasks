---
github_issue: N/A
title: 盤中監控循環（Phase 2 + Phase 3）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T009 - 盤中監控循環

## 目標
整合 T003/T007/T008 實作 §4 Phase 2（09:00–12:30 監控）與 Phase 3（尾盤收斂）：10s tick 輪詢、守門、評分、SignalAdvice 輸出、假突破回收。

## 驗收標準
- [ ] 每 tick（10s）對觀察清單呼叫 `get_intraday_vwap` + `detect_volume_surge`（T002），資料一律先過 T003 守門
- [ ] 09:00–09:05 開盤緩衝：僅收集不進場（T008 時間限制連動）
- [ ] 雙 tick 確認 → T007 評分 → `SignalAdvice`（§7.2）輸出（含 recommended_entry / target / stop / rr_ratio / position_size / data_quality / expiry_ts）
- [ ] 假突破回收（§4 Phase 2）：確認後 3 分鐘內回落 VWAP 下方 → 取消訊號 + `failed_breakout` 事件
- [ ] 分數 ≥80 且價 ≥ 觸發價 → 移交 T008 狀態機（TRIGGERED）
- [ ] Phase 3（§4 Phase 3）：12:30 警示、13:00 硬性停發、13:15 未平倉強制平倉提醒、13:20 全數平倉要求，皆寫事件
- [ ] 全循環在 LOCKOUT/DAILY_LOCKOUT 下停止新訊號但持續風控
- [ ] 單元 + 整合測試：完整 tick 循環（mock mcp fixtures）、假突破回收、尾盤觸發點

## 備註
- 每 tick 之 mcp 呼叫需節流：同 tick 內同一 symbol 不得重複呼叫同工具
- 訊號一律非同步建議（無自動下單），SignalAdvice 寫入事件日誌供 T010 統計
