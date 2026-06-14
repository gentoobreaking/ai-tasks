---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/709
title: 衍生財務欄位計算
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 後端新增計算函數 + 資料欄位擴充
---

# T066 - 衍生財務欄位計算

## 目標
新增神奇公式與彼得林區策略所需的衍生財務欄位計算：EBIT、企業價值（EV）、ROIC、PEG 比率、流動比率。

- 來源：spec §2.2.4、§2.2.3、§9.2

## 驗收標準
- [x] 實作 `compute_ebit()`：使用 `operating_income`（營業利益）
- [x] 實作 `compute_ev()`：市值 + 總負債 - 現金（亦支援 debt_to_equity 估計）
- [x] 實作 `compute_roic()`：EBIT / (淨營運資金 + 固定資產淨值)
- [x] 實作 `compute_peg()`：PE / (EPS年增率 × 100)，負值 EPS 回傳 None
- [x] 實作 `compute_current_ratio()`：流動資產 / 流動負債
- [x] 以上欄位寫入 `financials` 表
- [x] 新增 `update_derived_financials(db)` 排程更新函數
- [x] PEG 計算注意 EPS 負值（虧損股）的邊界處理

## 備註
- EBIT/EV/ROIC 是神奇公式核心；PEG 是彼得林區核心
- 流動比率是葛拉漢策略所需
- 金融股（銀行、保險、證券）不計算 EV/ROIC，自動排除
- 參考 spec §9.2、§2.2.3、§2.2.4 的計算公式
