---
github_issue: N/A
title: sentinel-ui 唯讀 Web 服務 cmd/sentinel-ui
type: feat
priority: medium
status: in-progress
depends_on:
- T009
- T011
- T013
- T015
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T016 - sentinel-ui 唯讀 Web 服務 cmd/sentinel-ui

## 目標
獨立 process 的唯讀網頁（FastAPI 不適用——這是 Go，用 net/http + html/template + uPlot）：
`/` 全 SLO 總表、`/slo/{name}` 詳情+預測vs實際、`/accuracy` 命中統計、`/cost` 燃盡圖與推估表、
`/waste` 候選清單。**安全邊界依 spec.md §2.5：純唯讀（無 POST）、綁 127.0.0.1、
不碰 SQLite 檔案（走 sentinel 唯讀 API/status.json）、對外經反向代理認證。**

## 驗收標準
- [ ] 五張頁面齊備且資料來源為 sentinel 唯讀端點（整合測試驗證無直連 DB）
- [ ] 綁定位址預設 127.0.0.1；設定改 0.0.0.0 時啟動印出醒目警告
- [ ] 所有 handler 為 GET；滲透自查（無寫入端點）列入測試報告（spec.md §5 標準 6）
- [ ] /accuracy 呈現每次 ETA 預測 vs 實際偏差統計（spec.md §5 標準 1c）
- [ ] uPlot 圖表資料由 JSON 端點供給；模板編譯進 binary

## 備註
- 規模控制：不做帳號系統、不做 SPA——信任邊界在反向代理層（spec.md §2.5 表格）

## 驗收標準細化

- [ ] 五張頁面路由：`/`（全 SLO+容量+成本總表）、`/slo/{name}`（詳情+預測vs實際曲線）、`/accuracy`（命中統計）、`/cost`（燃盡圖+月/年推估表）、`/waste`（候選清單+結案統計）
- [ ] 資料源：僅 sentinel 的唯讀 JSON 端點/status.json——整合測試斷言 UI process 從未開啟 SQLite 檔案（spec.md §2.5 安全鐵律）
- [x] bind 預設 127.0.0.1；設定為 0.0.0.0 時啟動印出醒目安全警告
- [x] 所有 handler 僅 GET；滲透自查清單（無寫入端點/無表單）列入測試報告（spec.md §5 標準 6）
- [ ] uPlot 圖表資料走 JSON 端點；html/template 與 assets 以 go:embed 編譯進 binary
### 未竟項（下一批次）
- [ ] /slo/{name} 詳情頁
- [ ] /accuracy 頁面（API 已存在於 sentinel）
- [ ] /cost 頁面（需 cost 掃描接入 daemon）
- [ ] /waste 頁面（同上）
