---
github_issue: ""
title: "[Phase 3] 結構變化偵測 — 模型/規則衰退監控"
type: feature
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
closed: 2026-07-30
---

# T012 - 結構變化偵測

## 目標
監控規則與模型是否隨時間逐漸失效，透過滾動勝率、報酬、觸發頻率等指標偵測績效衰退與分布偏移。

對應規格：`§3.3.2 結構變化偵測`、`§3.3.3 評估層`

## 驗收標準
- [x] 規則觸發頻率偏離歷史分布時告警 — `compute_trigger_drift()` (歷史 vs 近20日率對比, watch/warning/critical 三級)
- [x] 滾動勝率/報酬持續低於回測基準時告警 — `compute_win_rate_drift()` (以次日漲跌驗證, 方向衰退 30%+ 告警)
- [x] 特徵分布隨時間出現位移時偵測（可視化） — `compute_feature_drift()` (11 項數值特徵均值偏移, 含標準差對比)
- [x] 衰退偵測結果每日輸出報告 — `generate_structural_change_report()` → `data/reports/drift_{date}.md`
- [x] 支援通知推播（規則衰退、需重新評估） — pipeline 自動推送 critical/warning 到 Telegram/Discord
- [x] 衰退規則自動標記 (`drift_status` 欄位), 不自動停用（由人決定）

## 已交付檔案

| 檔案 | 說明 |
|------|------|
| `src/tw_quant_signal/structural_change.py` | 核心模組 (600+ 行) — 4 類偵測 + 報告 + 儲存 |
| `src/tw_quant_signal/db.py` | + `structural_drift` 表 + `get_structural_drift()` 查詢 |
| `src/tw_quant_signal/pipeline.py` | + 結構變化偵測步驟 (含通知推送) |
| `src/tw_quant_signal/api/app.py` | + `GET /api/structural-drift`, `GET /api/drift-report` |

## 偵測項目

| 偵測 | 方法 | 閾值 |
|------|------|------|
| 規則觸發頻率漂移 | 近 20 日觸發率 vs 歷史觸發率 | 偏移 50%+ → 偏移 |
| 規則滾動勝率衰退 | 次日漲跌驗證訊號方向 | 勝率下降 30%+ → 衰退 |
| 特徵分布偏移 | 11 項數值特徵均值變化率 | 均值變化 30%+ → 漂移 |
| 健診評分系統性偏移 | 整體評分均值對比 | 偏移分數標準化 |

## 警報機制

- **watch**(30%), **warning**(50%), **critical**(70%) 三級
- pipeline 自動推送 critical/warning 到 Telegram/Discord
- 每日 Markdown 報告寫入 `data/reports/drift_{date}.md`
- 衰退規則標記 `drift_status`，不自動停用

## 備註
- 研究環境與實戰環境分離後（T013），此模組主要作用於實戰環境
- 僅監控與通知，不自動停用規則
