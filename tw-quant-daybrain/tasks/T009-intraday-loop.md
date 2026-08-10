---
github_issue: N/A
title: 盤中監控循環（Phase 2 + Phase 3）
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-08-10
---

# T009 - 盤中監控循環

## 目標
整合 T003/T007/T008/T017/T018/T020 實作 §4 Phase 2（09:00–12:30 監控）與 Phase 3（尾盤收斂）：10s tick 輪詢、守門、Bias 白名單攔截、評分、Priority 調度、SignalAdvice 輸出、假突破回收。

## 驗收標準
- [x] 每 tick（10s）對觀察清單呼叫 `get_intraday_vwap` + `detect_volume_surge`（T002），資料一律先過 T003 守門（fetchVwap/fetchSurge：gate.check → 失敗寫 freshness_gate_fail）
- [x] 09:00–09:05 開盤緩衝：僅收集不進場（T008 時間限制連動；isOpenBuffer + canOpenNewPosition）
- [x] **Bias 白名單攔截（§4 Phase 2 步驟 4）：** 觸發時先檢查當日 Briefing 之 `trading_plan.allowed_actions`；`LONG_ONLY` 日空方高分訊號於 `blocked_actions` 第一關攔截（BriefingProvider 注入，T019 完成前以 stub）
- [x] 雙 tick 確認 → T007 評分 → `SignalAdvice`（§14.2）輸出（含 recommended_entry / target / stop / rr_ratio / position_size_shares / data_quality / expiry_ts）
- [x] **多標的資金調度（§4 Phase 2 步驟 5）：** 同 tick 多檔觸發 → PriorityEngine 依 Rank Score 排隊派單（T020 完成前以 stub 注入）
- [x] 假突破回收（§4 Phase 2 步驟 6）：確認後 3 分鐘內回落 VWAP 下方 → 取消訊號 + `failed_breakout` 事件
- [x] 分數 ≥75（NEUTRAL 日 ≥85）且價 ≥ 觸發價 → 移交 T008 狀態機（TRIGGERED；canOpenNewPosition 前哨）
- [x] Phase 3（§4 Phase 3）：11:30 停發空訊、12:30 警示、13:00 硬性停發、13:15 未平倉強制平倉提醒、13:20 全數平倉要求，皆寫事件（防重入）
- [x] 全循環在 LOCKOUT/DAILY_LOCKOUT 下停止新訊號但持續風控
- [x] 單元 + 整合測試：完整 tick 循環（mock mcp fixtures）、Bias 攔截、假突破回收、尾盤觸發點（14 個測試）

## 備註
- 每 tick 之 mcp 呼叫需節流：同 tick 內同一 symbol 不得重複呼叫同工具
- 訊號一律非同步建議（無自動下單），SignalAdvice 寫入事件日誌供 T010 統計
- v2.0 依賴：T019（Briefing 載入與 Action 白名單）、T020（Priority Engine）；兩者未完成前以測試 stub 注入
