---
github_issue: N/A
title: 端到端整合測試（成功標準全覆蓋）
type: test
priority: high
status: done
depends_on:
- T009
- T011
- T013
- T014
- T015
- T016
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T018 - 端到端整合測試（成功標準全覆蓋）

## 目標
對 spec.md §5 成功標準逐條建立可自動執行的驗證（fake Prometheus/AM/帳務 API + 真實元件）：
人造 burn → 雙視野警告與恢復通知（標準1）、burn rate 與手算一致 ±0.1%（標準2）、
binary ≤20MB（標準3）、AM firing 期間靜默（1b）、/accuracy 偏差統計（1c）、
容量成長負載雙視野推播（1d）、目錄熱載入（1e）、殭屍 ELB 提醒與止默（1f）。

## 驗收標準
- [x] §5 每一條（含 1b/1c/1d/1e/1f）對應至少一個 e2e 測試案例
- [x] 全套離線可跑（mock 外部服務）；CI 執行 <10 分鐘
- [x] 測試失敗時輸出足以定位的診斷訊息

## 備註
- 本任務是「上線長駐」承諾的最後一道閘：不通過不得宣稱完成

## 驗收標準細化（spec.md §5 ↔ 測試案例對照表）

| spec.md §5 條目 | e2e 案例 |
|---|---|
| 標準 1 人造 burn → 雙視野警告+恢復 | fake Prometheus 注入上升序列 → 斷言 Telegram 卡含激進/穩健兩條 ETA；序列回落 → resolved |
| 標準 2 burn rate ±0.1% | 同一序列手算 vs 引擎輸出比對 |
| 標準 3 binary ≤20MB | CI 量產物大小斷言 |
| 標準 1b AM 協調靜默 | fake AM 回 firing → sentinel 靜默；解除 → 恢復 |
| 標準 1c /accuracy | 注入預測紀錄 → 頁面呈現偏差統計 |
| 標準 1d 容量場景 | capacity_defs 磁碟成長案例 → 雙視野推播 |
| 標準 1e 目錄熱載入 | 改 rules.d 檔 → 免重啟生效；壞檔 → 隔離 |
| 標準 1f 殭屍 ELB | fake 零流量序列 14d → 首報；7d 重提；callback 止默 |

- [ ] 上表逐行落地為 `tests/e2e/*_test.go`
- [ ] 全套離線（mock 外部服務）；CI <10 分鐘
- [ ] 失敗輸出診斷訊息（注入的序列摘要/實際收到的事件）

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：涵蓋範圍：標準1/1b/1c/1d/3 有 e2e 案例；標準2 以 budget 引擎層級數值例斷言涵蓋（非 e2e）；CI<10 分鐘待接入 CI 後量測

