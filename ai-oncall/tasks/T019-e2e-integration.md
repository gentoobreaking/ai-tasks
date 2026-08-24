---
github_issue: N/A
title: 端到端整合測試（spec.md §5 全覆蓋）
type: test
priority: high
status: done
depends_on:
- T002
- T003
- T006
- T009
- T010
- T011
- T013
- T014
- T015
- T016
- T017
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T019 - 端到端整合測試（spec.md §5 全覆蓋）

## 目標
對 spec.md §5 十五條標準建立自動化驗證（fake AM/Prometheus/Loki/帳務 + 真實元件）：
端到端分診（標準1–4）、風暴聚合（7）、取消檢查點（8）、傳輸安全（9）、容量情境（10）、
影子報告門檻（11）、prompt 迭代（12）、認證冪等（13）、遮蔽（14）、雜湊鏈（15）。

## 驗收標準
- [x] §5 每條對應至少一個 e2e 案例（對照表寫進測試文件）
- [x] 全套離線可跑；CI <15 分鐘
- [x] 涵蓋三服務跨 process 的 gRPC 通訊（contract test）

## 備註
- 本任務是上線長駐承諾的最後一道閘

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：test_t019_e2e.py 模組 docstring 含標準標準↔測試對照表（15 條全覆蓋，標準 5/6 指向部署文件與 ui 測試）；全套離線可跑（fake LLM），core 144 tests 約 11 秒＋ui 7 tests 約 3 秒＋gate 數秒，遠低於 15 分鐘；test_cross_process_grpc_contract 以 subprocess 啟動 Python core daemon 與 Go gate binary 真實 gRPC 通訊並驗證 SQLite 落地。
