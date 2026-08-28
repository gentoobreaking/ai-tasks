---
id: T062
github_issue: ""
title: 決策可解釋性 — SHAP 特徵貢獻
project: gold-analysis
type: feature
priority: low
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T062 - 決策可解釋性 — SHAP 特徵貢獻

## 目標
目前決策僅給出 BUY/SELL/信心度，無法解釋「為什麼」。需在決策輸出中加入特徵貢獻（SHAP 或模型內建 feature_importances），並於 `DecisionDetail` 頁展示 top 貢獻因子。

## 驗收標準
- [ ] 決策 API 回傳 top-N 貢獻特徵與方向（正向/負向）
- [ ] 後端對 ML 決策計算 SHAP 值（或 feature_importance），對規則決策給出觸發規則說明
- [ ] `frontend/src/components/pages/DecisionDetail.tsx` 新增「決策依據」區塊視覺化
- [ ] 補單元測試驗證可解釋性欄位存在且為合理數值

## 備註
- SHAP 計算成本較高，建議快取或僅對最終決策取樣計算。
- 與 T056（告警帶理由）、T065（LLM 敘事）形成「為什麼」敘事鏈。
