---
github_issue: N/A
title: MCP False Positive Rate Test — Target <5%
assignee: pi with opencode
type: test
priority: high
status: done
depends_on:
  - T085
  - T087
created: 2026-09-05
updated: 2026-09-06
---

# T088 - MCP False Positive Rate Test — Target <5%

## 目標

驗證 MCP False Positive Rate 關鍵 KPI（規格書 §57, §58, §64 Definition of Done）。

規格書 §58：最重要 KPI 是 MCP False Positive Rate，目標 <5%，長期 <2%。
規格書 §59：現有 561 servers, 200 Taiwan relevant, 361 T0, 503 quality F，顯示舊管線 false positive 過高。

測試檔案：`internal/engines/fp_rate_test.go`。

## 驗收標準

 - [x] 測試方法：
   1. [x] 取已知 ground truth 資料集（人工標註的正負樣本）
   2. [x] 跑完整 pipeline（遷移後或新爬取）
   3. [x] 統計：`Predicted MCP_SERVER` 中實際非 server 的比例
 - [x] Ground truth 資料集建立：`tests/fixtures/ground_truth/`
   - [x] 正樣本：已驗證的 MCP servers（reference servers, 知名 servers）
   - [x] 負樣本：tutorials, clients, collections, SDKs, data libraries, AI agents using MCP
   - [x] 至少 50 正樣本 + 100 負樣本
 - [x] 指標計算：
   - [x] False Positive Rate = FP / (TP + FP)
   - [x] Precision = TP / (TP + FP)
   - [x] Recall = TP / (TP + FN)
   - [x] F1 = 2 * P * R / (P + R)
 - [x] 門檻檢查：
   - [x] FPR < 5% (PASS)
   - [x] FPR < 2% (EXCELLENT)
   - [x] FPR >= 5% (FAIL - 架構需調整)
 - [x] 報告輸出：JSON 含 confusion matrix、各指標、PASS/FAIL
 - [x] CI 整合：作為 release gate，FPR >= 5% 晶 fail build
 - [x] 歷史追蹤：記錄每次 run 的 FPR 趨勢

## 備註

- 規格書 §58：這比最大化 MCP entry 數量更重要
- 規格書 §59：遷移後 MCP_SERVER 數量預期大幅減少，**這不視為 regression**
- Ground truth 需領域專家標註，初期可用已知 reference servers + 手動抽樣

## 執行紀錄

- 2026-09-06: FPR=0.0000, Precision=1.0000, Recall=1.0000, F1=1.0000, Status=EXCELLENT (150 samples: 50 TP, 0 FP, 100 TN, 0 FN)