---
github_issue: ""
title: Statistics Engine
type: task
status: done
depends_on: ["T013"]
assignee: pi
created: 2026-09-03
updated: 2026-09-04
---

# T014 - Statistics Engine

## 目標
實作統計計算引擎，提供 Comparable 交易的完整統計指標。

## 驗收標準
- [ ] 實作統計指標：count, min, P10, P25, median, mean, P75, P90, max
- [ ] 土地單價統一：price_per_ping (1 坪 = 3.305785 平方公尺)
- [ ] 實作 Outlier Handling：IQR (Q1, Q3, IQR = Q3-Q1, lower=Q1-1.5*IQR, upper=Q3+1.5*IQR)、P10/P90、MAD
- [ ] 建立 regression tests 確保統計計算 deterministic
- [ ] 統計結果包含於 Comparable/MCP tool 回傳中

## 備註
- 所有 Comparable 必須提供完整統計指標
- 第一版建議採用 IQR 作為 outlier handling
- 統計計算必須 deterministic，相同輸入產生相同結果