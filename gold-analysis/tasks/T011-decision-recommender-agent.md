---
id: T011
project: gold-analysis
source_project: gold-analysis-core
title: 開發決策推薦 Agent
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-07
updated: 2026-04-09
estimate: 4天
depends_on:
  - T007
  - T009
  - T010
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/217
---

## 目標
綜合技術面、基本面、風險評估的分析結果，生成最終投資建議。

## 驗收標準
- [ ] 決策規則引擎設計完成
- [ ] 多維度加權計算完成
- [ ] 買入/持有/賣出建議生成
- [ ] 置信度計算完成
- [ ] 目標價位計算完成
- [ ] 止損位建議完成
- [ ] 建議倉位計算完成
- [ ] 決策理由生成完成

## 產出
| 檔案 | 路徑 | 說明 |
|------|------|------|
| 決策推薦 Agent | `backend/app/agents/decision_recommender.py` | 完整決策推薦邏輯 |
| 單元測試 | `tests/test_decision_recommender.py` | 15 個測試用例 |
| Agent 入口更新 | `backend/app/agents/__init__.py` | 新增導出 |

## 功能說明
- 三維度加權：技術分析 (35%)、基本面分析 (30%)、風險評估 (35%)
- 5 種決策類型：STRONG_BUY / BUY / HOLD / SELL / STRONG_SELL
- 6 種倉位建議：MAXIMUM / LARGE / MEDIUM / SMALL / MINIMUM / NONE
- ATR 止損止盈計算
- 中英文理由生成
- 風險提示

## 備註
Phase 2 決策層核心。三維度加權：技術分析 (35%)、基本面分析 (30%)、風險評估 (35%)。5 種決策類型、6 種倉位建議、ATR 止損止盈、中英文理由生成。