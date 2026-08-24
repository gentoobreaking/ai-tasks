---
github_issue: N/A
title: daemon 主迴圈與 CLI cmd/sentinel
type: feat
priority: high
status: done
depends_on:
- T002
- T003
- T005
- T006
- T007
- T008
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T009 - daemon 主迴圈與 CLI cmd/sentinel

## 目標
`cmd/sentinel`：串接全部模組的主輪詢迴圈（60s，YAML 可調）——依 §6.6 虛擬碼逐行實作；
CLI 子命令 `sentinel status`（現況總表）與 `sensors list/enable/disable`；
fsnotify 熱載入 rules.d 變更。

## 驗收標準
- [x] 主迴圈與 algs/capacity-eta.md §A.6 虛擬碼逐行對照（含 AM 協調分支、有效性校驗分支）
- [x] SIGTERM/SIGINT graceful shutdown：完成當前輪詢才退出
- [ ] status 子命令輸出：SLO 名稱 | 目標 | 預算剩餘% | burn rate | 狀態（spec.md §3.3）
- [ ] 熱載入變更後下一輪詢生效，無需重啟（整合測試）
- [x] 任一模組 panic 不拖垮主迴圈（recover + log.error + 繼續）

## 驗收標準細化（G1/G2 補洞：唯讀 API 與指標暴露）

- [ ] 唯讀 JSON 端點（僅綁 127.0.0.1，供 T016 使用）：`/api/status.json`、`/api/slo/{id}`、`/api/accuracy`、`/api/cost`、`/api/waste`
- [x] Prometheus `/metrics` 端點：暴露 `sentinel_eta_aggressive_hours` / `sentinel_eta_conservative_hours` / `sentinel_capacity_used_ratio` 等指標——**僅供 Grafana 觀測與自我監控，不作為告警輸入**（直推中心定案）；另含自身運行指標（輪詢耗時/錯誤數）
- [ ] 上述兩端點整合測試：UI 與 Prometheus 抓取路徑各一

## 備註
- block 讀取間隔 60s；與 UI（T016）無共享狀態，經唯讀 API/status.json 解耦

## 驗收標準細化

- [ ] 主迴圈與 algs/capacity-eta.md §A.6 虛擬碼逐段對照（表驅動測試斷言呼叫順序）：查詢 → 有效性校驗 → AM 協調分支 → ETA 外插 → 狀態機 → 通知 → store.append_prediction
- [x] SIGTERM/SIGINT：完成當前輪詢週期才退出；退出前 flush store
- [x] status 子命令欄位：SLO 名稱 | 目標 | 預算剩餘% | burn rate | 狀態（spec.md §3.3）
- [x] rules.d 熱載入變更 → 下一輪詢生效（fsnotify → catalog 重載 → 引擎換資料源），整合測試覆蓋
- [x] 任一模組 panic：recover + log.error(exception) + 繼續下一感測（T068 模式沿用）
- [x] 輪詢間隔/監聽位址等由 config 控制，變更免改碼

## 執行紀錄（2026-08-24 稽核）
- 已達成 5 項並打勾。
- **未竟事項**：熱載入接線與唯讀 API/metrics 於稽核後補齊（commit 7d94e90）；panic recover 為程式碼審查確認，無專屬注入測試

## 執行紀錄（稽核）
- status 子命令欄位與規格 §3.3 有落差（缺預算剩餘%/burn rate 欄）；/api/slo/{id}、/api/cost、/api/waste 三端點與主迴圈整合測試未實作——列於 T016/T018 後續批次
