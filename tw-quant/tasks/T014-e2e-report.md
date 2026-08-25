---
github_issue: N/A
title: e2e 全流程整合與 markdown/CSV 報表輸出（F14）
type: test
priority: medium
status: done
depends_on:
- T007-moneydj-sector
- T009-factor13-fundamentals-chips
- T010-factor45-momentum-position
- T013-targets-grading
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T014 - e2e 整合與報表

## 目標
pipeline_screener.py 全流程跑通並產出正式報表。

## 驗收標準
- [x] `python3 pipeline_screener.py` 一鍵執行完整流程：
      universe（TTL 內免重建）→ 評分 → 加總 → 硬淘汰 → 目標價/分級 → 報表
- [x] 報表輸出 screening_results/pipeline_YYYYMMDD.md + .csv，章節結構：
      一、Top5 買點表
      二、表二：Top10 量化表
      三、表一：50檔全量量化表（附錄）
      四、淘汰名單（含規則編號）
      五、資料源統計（主路徑 vs FinMind 備援、N/A 清單）
      六、**欄位計算說明（稽核附錄，獨立章節不與表格混排）**：
         6-A 公式總表：每個量化欄位 → 計算公式 → 資料源 → 子項分組門檻
             （直接引用 algs/factor-scoring.md / entry-stop-target.md 的規則表）
         6-B 每檔計算數值：子項層級實際數值與得分
             （自 pipeline_YYYYMMDD_detail.csv 展開，例：
              2330｜rev_1m=+0.93%→9分｜rev_3m=+9.84%→6分｜up30d=28/down30d=0→6分…）
      CSV 同步兩份量化表＋一份 detail 稽核檔
- [x] 全程斷網測試：所有外部請求失敗時 exit code 非 0，且 log 明確指出失敗 stage
- [x] FinMind 備援演練：mock TWSE 失敗，確認報告資料源統計出現備援計數
- [x] 冪等性：同日二次執行走快取，耗時 <30 秒
- [x] README.md 增補「找買點管線」章節：用法、config 說明、資料源地圖

## 備註
首次全量執行約 10~20 分鐘（50 檔 × 多資料集＋rate limit）。報表日期以交易日歸檔。
