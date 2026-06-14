---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/705
title: 各策略進階參數展開調整
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 前端 Strategy 頁面 + 後端策略建構參數傳遞
---

# T062 - 各策略進階參數展開調整

## 目標
每個策略在頂層權重下方新增可展開的進階參數區塊，讓進階用戶能微調各策略內部計算參數。

- 來源：spec §4.1

## 驗收標準
- [x] 動能策略進階參數：回顧期（120-504天，預設252）、排除近期（0-63天，預設22）、最少資料天數（固定252）
- [x] 價值策略進階參數：本淨比上限（5-50，預設30）、本益比上限（20-200，預設100）、殖利率下限（0-5%，預設0）
- [x] 品質策略進階參數：ROE 權重（0-100%）、槓桿權重（0-100%）、穩定性權重（0-100%）、回顧季數（2-8，預設4）
- [x] 成長策略進階參數：營收均值月數（1-6，預設3）、營收因子權重（0-100%）、EPS 因子權重（自動補足）
- [x] 展開/收起有 200ms ease 動畫（details element 原生動畫 + slider transition）
- [x] 進階參數變更後自動觸發影響預覽（debounce 500ms）
- [x] 參數透過 `get_strategy(name, params)` 傳遞給後端策略建構（後端已支援）
- [x] 進階參數狀態存入 localStorage 以跨 session 保留

## 備註
- 品質策略三個子因子權重需合計 100%，其中一個調整時自動聯動
- 成長策略營收/EPS 權重合計 100%，EPS 權重自動補足
- 後端 `BaseStrategy.__init__` 已接受 `params: dict`，此任務確保前端傳遞正確的參數結構
