---
id: T064
github_issue: ""
title: 投資組合級風險 — 相關性矩陣與因子曝險
project: gold-analysis
type: feature
priority: low
status: done
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T064 - 投資組合級風險 — 相關性矩陣與因子曝險

## 目標
現有 `risk/metrics.py` 多為單一標的/單一部位風險。需擴展到投資組合層級：黃金與 DXY / 實質利率 / BTC 等跨資產相關性矩陣，以及因子曝險分析，提供組合級 VaR/CVaR。

## 驗收標準
- [x] 計算並快取跨資產相關性矩陣（gold vs DXY/real-yield/BTC 等）
- [x] 提供組合級 VaR/CVaR（考慮相關性，非簡單加總）
- [x] 因子曝險分解（利率/美元/避險情緒等）
- [x] 前端風險儀表板呈現相關性熱圖與因子條
- [x] 補測試：相關性矩陣對稱、對角為 1、數值落在 [-1,1]

## 實作摘要 (commit ee47e9a)
- `app/risk/portfolio.py`：correlation_matrix / portfolio_var / portfolio_var_from_returns / factor_exposure（純 numpy/scipy）
- `app/api/schemas/portfolio_risk.py` + `app/api/routes/portfolio_risk.py`：POST /api/risk/portfolio、GET /api/risk/sample
- `frontend/src/components/pages/RiskDashboard.tsx`：相關性熱圖 + 因子曝險條；api.ts 型別/helper；App + Sidebar 路由
- `tests/test_portfolio_risk.py`：5 passed（對角=1/對稱/[-1,1]/相關性影響 VaR/因子 beta 復原）
- 附帶修復：main.py 原先未 include_router(app.api.routes.*)，導致回測(T063)與風險(T064)路由執行期 404；現掛載 backtest(prefix=/api/backtest) 與 portfolio_risk 路由

## 注意（非本次回歸，依指示不處理）
- pi-lens / ruff 持續報的 `could not be resolved` 為鏡像使用舊系統直譯器（非 .venv）之環境假陽性；T059 lint 債（Dict→dict、utcnow、blind except）為先前回合既有債務，非本次引入。

## 備註
- 可擴充 `risk/metrics.py`，新增 `portfolio_*` 函式，保持純 numpy/scipy 實作。
- 與 T063 回測共用績效/風險指標輸出。
