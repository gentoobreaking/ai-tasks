---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/674
title: 策略合成器（Score Combiner）
type: task
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-25
updated: 2026-05-25
howto: 依 spec 5.6
---

# T10 - 策略合成器（Score Combiner）

## 目標
實作分數加權合成器，將 Momentum / Value / Quality / Growth 四策略分數依權重合併為最終分數，排序取前 N 名。

## 驗收標準
- [x] 預設權重：momentum=0.30, value=0.25, quality=0.25, growth=0.20（可從設定檔調整）
- [x] 加權加總 → 再次 Z-score 正規化 → 依分數由高到低排序
- [x] 所有因子缺失的股票從當日選股中排除
- [x] 信號衝突依 spec 5.6 處理（各策略獨立計算，加權後居中）
- [x] 支援 `top_n` 參數（預設 20 檔個股、3 檔 ETF）
- [x] 輸出寫入 `signals` 表格（含 `strategy='composite'` 以及各子策略分數）
- [x] 提供 `get_top_signals(date, top_n)` 查詢函式

## 備註
Combiner 的 Z-score 再次正規化確保整體分數分布穩定。ETF 與個股策略分開執行、不混合排名。
