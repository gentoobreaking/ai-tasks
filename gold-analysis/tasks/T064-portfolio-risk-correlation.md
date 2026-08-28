---
id: T064
github_issue: ""
title: 投資組合級風險 — 相關性矩陣與因子曝險
project: gold-analysis
type: feature
priority: low
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T064 - 投資組合級風險 — 相關性矩陣與因子曝險

## 目標
現有 `risk/metrics.py` 多為單一標的/單一部位風險。需擴展到投資組合層級：黃金與 DXY / 實質利率 / BTC 等跨資產相關性矩陣，以及因子曝險分析，提供組合級 VaR/CVaR。

## 驗收標準
- [ ] 計算並快取跨資產相關性矩陣（gold vs DXY/real-yield/BTC 等）
- [ ] 提供組合級 VaR/CVaR（考慮相關性，非簡單加總）
- [ ] 因子曝險分解（利率/美元/避險情緒等）
- [ ] 前端風險儀表板呈現相關性熱圖與因子條
- [ ] 補測試：相關性矩陣對稱、對角為 1、數值落在 [-1,1]

## 備註
- 可擴充 `risk/metrics.py`，新增 `portfolio_*` 函式，保持純 numpy/scipy 實作。
- 與 T063 回測共用績效/風險指標輸出。
