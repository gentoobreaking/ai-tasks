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
- [ ] §5 每條對應至少一個 e2e 案例（對照表寫進測試文件）
- [ ] 全套離線可跑；CI <15 分鐘
- [ ] 涵蓋三服務跨 process 的 gRPC 通訊（contract test）

## 備註
- 本任務是上線長駐承諾的最後一道閘