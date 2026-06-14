---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/711
title: 大師策略評分因子（第五因子）+ 每日快照
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: 後端大師評分引擎 + guru_scores 表 + 五因子權重 API
---

# T068 - 大師策略評分因子（第五因子）+ 每日快照

## 目標
實作大師策略做為第五評分因子的模式（spec §3.2），將大師策略各條件的達成程度轉換為 0-100 分，納入綜合評分。同時建立 `guru_scores` 表儲存每日評分快照。

- 來源：spec §3.2、§9.3

## 驗收標準
- [x] 實作 `compute_guru_score()` 將條件達成度轉換為 0-100 分
- [x] 支援 6 位大師的策略評分
- [x] 建立 `guru_scores` 資料表
- [x] 新增 `run_guru_scoring()` 排程計算函數
- [x] 組合器支援五因子權重（momentum + value + quality + growth + guru）
- [x] 五因子預設權重配置：momentum 0.25、value 0.20、quality 0.20、growth 0.15、guru 0.20
- [x] 大師因子可透過 API 啟用/停用、選擇大師、設定權重
- [x] 新增 `GET/PUT /api/v1/strategy/guru-config` endpoint
- [x] 向後相容：未啟用大師因子時，維持原有四因子權重運作

## 備註
- 此任務依賴 T066（衍生欄位）+ T067（篩選器）的實作
- 0-100 分的計算需先 Z-score 正規化全市場後轉換（參考 spec §3.2 擬碼）
- 每日快照支援回測比較（T052）
- 此為架構調整較大的任務，需要修改 combiner.py
