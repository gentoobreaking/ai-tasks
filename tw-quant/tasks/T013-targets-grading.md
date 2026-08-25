---
github_issue: N/A
title: 進場區/停損/目標價/風報比＋S/A/B 分級 → Top5（F11/F12）
type: feat
priority: high
status: done
depends_on:
- T012-hard-reject
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T013 - 目標價計算與 S/A/B 訊號分級

## 目標
依 algs/entry-stop-target.md 與 algs/signal-grading.md 實作，產出最終 Top5 表。

## 驗收標準
- [x] 進場區/停損/目標價/R/R 欄位由 T011 已算好，本任務**消費不重算**；
      僅對資格不符者（架構轉弱/待黃金交叉）在分級時排除 S/A 資格
- [x] 技術停損 = min(中值×0.93, 發動K棒最低×0.995)；發動K棒=進場日前10日內最大量紅K
- [x] 邏輯停損欄位輸出：「收盤<60MA 且 日KD(9,3,3)死亡交叉」（重用 common/kd.py）
- [x] 目標價 = min(近60日高, 分析師mean) 取離現價較近者；其漲幅<8% 改用較遠者＋備註
- [x] R/R = (目標價−中值)/(中值−技術停損)；門檻 2.0/1.5 來自 config rr_thresholds
- [x] S 級必要：R/R≥2.0 且 f2≥24 且 f3≥14 且 2027成長>0
      A 級：f2≥18 且 2027成長>0 且 R/R≥1.5 且 f3<14
      B 級：未達A但 total≥60（含 H5 降分後）
- [x] 最終 Top5 Markdown 表含全部欄位（見 signal-grading.md 輸出格式）＋結論語一行
- [x] 單元測試：用台積電數值例（algs/entry-stop-target.md §數值例）斷言：
      進場區=[2330,2400]、R/R≈0.51、等級=B；另建 R/R=2.4/f2=27/f3=15 合成案例斷言 S 級

## 備註
結論語為模板拼接（S/A/B 三選一），非自由文本生成。
