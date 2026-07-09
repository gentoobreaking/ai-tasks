---
github_issue:
title: "指標計算引擎"
type: feature
priority: high
status: done
assignee: "OpenCode with DeepSeek V4 Flash"
created: 2026-07-09
updated: 2026-07-09
---

# T141 - 指標計算引擎

## 目標
建立 `scripts/asset_class_analysis.py`，讀取 T140 產出的資產清單與含息價格，計算每檔資產的總報酬率、CAGR、年化波動度、Sharpe Ratio、最大回撤、每週/每月/每季平均漲跌率與波動度。

## 計算指標

| 指標 | 公式 |
|------|------|
| 最終淨值 | $10,000 × 最後AdjClose / 最初AdjClose |
| 總報酬率 | (最終淨值 / $10,000) - 1 |
| CAGR(年化) | (最終淨值/$10,000)^(1/年數) - 1 |
| 年化波動度 | 日報酬率 std × √252 |
| Sharpe Ratio | (年化報酬 - 1.5%Rf) / 年化波動度 |
| 最大回撤(MDD) | min((淨值-高峰)/高峰) |
| 每週/每月/每季平均漲跌率 | 對應週期報酬率 mean |
| 每週/每月/每季波動度 | 對應週期報酬率 std |

## 驗收標準
- [x] 台積電 5 年總報酬率落在合理範圍（>100%）
- [x] 0050 vs 0056 報酬率有顯著差異（市場型ETF 均值105.69% vs 配息型128.83%）
- [x] Sharpe/MDD/波動度數值符合金融常識
- [x] 輸出 metrics_all.json 格式正確，被 T142 成功讀取

## 更動檔案
- `scripts/asset_class_analysis.py`（新檔案）
