---
github_issue: N/A
title: Composite Score 與 Risk Adjustment（§25–26）
type: task
priority: P0
status: pending
depends_on: [T010, T011]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T013 - Composite Score 與 Risk Adjustment（§25–26）

## 目標

實作 §25 Composite Score（因子加權與正規化）與 §26 Risk Adjustment（風險校正），輸出最終 Stock Score，供 Ranking 使用。全程確定性、可拆解（score_breakdown）。

## 驗收標準

- [ ] Composite Score 權重依 §25 自 `config/scoring.yaml` 讀取，不硬編碼；config 含 `asset_class` / `strategy` / `version` 結構（§47 Asset Class Model）
- [ ] 因子正規化方法（分位數/標準化）與 spec 一致；缺源因子剔除後權重重正規化並記 warnings（同 §30 精神、§8.1 傳播）
- [ ] Risk Adjustment（§26）實作完成：風險因子輸入皆為 PIT 資料
- [ ] 每檔股票最終可拆解出 `score_breakdown`（因子層 + 權重 + 原始值），入庫於 factor_scores / rankings（§5.9、§63）
- [ ] 確定性測試：同 snapshot 輸入重跑輸出完全一致（§2.3 / §33）
- [ ] 手算對照 ≥5 檔（Sprint 4 前置）

## 備註

- score_breakdown 是 §53 API 的關鍵 payload——此任務的輸出 schema 需與 T019 對齊
- risk 調整不得引入市場情緒（VIX 等 FALLBACK 資料只進 Risk Context summary，不進個股 score，§75）