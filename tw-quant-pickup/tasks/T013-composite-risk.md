---
github_issue: N/A
title: Composite Score 與 Risk Adjustment（§25–26）
type: task
priority: P0
status: done
depends_on: [T010, T011]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T013 - Composite Score 與 Risk Adjustment（§25–26）

## 目標

實作 §25 Composite Score（因子加權與正規化）與 §26 Risk Adjustment（風險校正），輸出最終 Stock Score，供 Ranking 使用。全程確定性、可拆解（score_breakdown）。

## 驗收標準

- [x] Composite Score 權重依 §25 自 `config/scoring.yaml` 讀取，不硬編碼；config 含 `asset_class` / `strategy` / `version` 結構（§47 Asset Class Model）
- [x] 因子正規化方法（分位數/標準化）與 spec 一致；缺源因子剔除後權重重正規化並記 warnings（同 §30 精神、§8.1 傳播）
- [x] Risk Adjustment（§26）實作完成：風險因子輸入皆為 PIT 資料
- [x] 每檔股票最終可拆解出 `score_breakdown`（因子層 + 權重 + 原始值），入庫於 factor_scores / rankings（§5.9、§63）
- [x] 確定性測試：同 snapshot 輸入重跑輸出完全一致（§2.3 / §33）
- [x] 手算對照 ≥5 檔（Sprint 4 前置）

## 完成記錄

- 交付：`scoring/`（config.py / composite.py / risk.py / risk_metrics.py / engine.py）+ config/scoring.yaml（§25 composite_weights + §47 asset_class/strategy/model_version）+ config/risk.yaml（§26 multipliers/weights/thresholds）
- 測試：46 個新增（30 composite/risk unit + 13 risk-metrics PIT unit + 3 e2e live-PG PIT 串接）；完整套件 496 passed, 29 skipped；ruff clean
- Composite（§25）：八因子權重自 YAML 讀取；缺源剔除 + 重正規化 Σ=1；全缺源 → None 不猜測
- Risk（§26）：0-100 風險分（高負債/EPS&營收波動/股價波動/流動性/PE 極端/財報異常/產業循環/資料不足），門檻表 1.00/0.95/0.85/0.70 全在 risk.yaml；Adjusted = Composite × Multiplier
- PIT：risk_metrics 經 PitRepository 收集（reported_at/availability_date 守門，§9 look-ahead 防護）
- score_breakdown（§63）：每因子 {score, weight, normalized_weight, raw_metrics, explanation} + risk breakdown；to_db_row → factor_scores
- §75 防護：VIX/USDTWD 等 FALLBACK 市場情緒不進個股 score（unit test 驗證）
- 確定性：test_determinism 同輸入重跑一致
- 手算對照：5 檔（2330/2317/1101/2412/3008）＋ weighted-sum 手算驗證

## 備註

- score_breakdown 是 §53 API 的關鍵 payload——此任務的輸出 schema 需與 T019 對齊
- risk 調整不得引入市場情緒（VIX 等 FALLBACK 資料只進 Risk Context summary，不進個股 score，§75）