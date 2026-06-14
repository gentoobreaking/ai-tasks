---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/706
title: 套用影響預覽與再平衡成本
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 前端 ImpactPreview 面板 + 後端 preview API endpoint
---

# T063 - 套用影響預覽與再平衡成本

## 目標
每次策略參數變更後，即時計算新設定會選出哪些股票、與當前持倉的差異、以及預估交易成本。

- 來源：spec §6

## 驗收標準
- [x] 前端 debounce 500ms 觸發影響計算
- [x] 顯示買入清單（to_buy）、賣出清單（to_sell）、維持不變（unchanged）
- [x] 換手比例（turnover_pct）顯示為百分比
- [x] 預估交易成本以金額顯示
- [x] 成本包含：手續費（0.1425%）、證交稅（0.3% 股票/0.1% ETF）、滑價（0.1% 單向）
- [x] 後端新增 `POST /api/v1/strategy/preview` endpoint，接受 params + 持倉清單
- [x] 後端實作 `preview_impact()` 與 `estimate_rebalance_cost()` 函數
- [x] 再平衡面板視覺設計

## 備註
- 交易成本參照 spec §6.3 公式實作
- 持倉清單從前端 localStorage（tw_quant_lots）取得傳入
- 精確計算需跑一次完整評分，可能需快取 signals，避免每次 preview 都重算
