---
github_issue: N/A
title: 感測目錄載入器 internal/catalog
type: feat
priority: high
status: pending
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T005 - 感測目錄載入器 internal/catalog

## 目標
`internal/catalog`：載入 `rules.d/**/*.yaml`（Prometheus rules 標準格式）、
promtool 語法驗證、fsnotify 熱載入、失敗整檔隔離、community/ 上游同步工具。

## 驗收標準
- [ ] 載入前執行 promtool check rules；失敗整檔隔離並 log.warning，daemon 不受影響（algs/sensor-catalog.md §C.6 第一條）
- [ ] fsnotify 存檔觸發熱載入，免重啟即生效；變更記 diff 審計 log（§C.6 最末條）
- [ ] `sentinel_*` 前綴 label/annotation 被正確解析為內部結構；移除註解不影響標準告警語意（§C.1 兩段式設計）
- [ ] community/ 同步腳本記錄上游 repo commit hash，升級產生 diff 報告（§C.5 自動·上游同步列）
- [ ] 辨識三種感測 kind：budget(Sloth 生成) / capacity / waste（範例見 algs/sensor-catalog.md §C.3 與 algs/waste-detection.md §8.8）

## 備註
- 格式不自造——一切以標準 Prometheus rules 為基底（spec.md §6.8.0 決策）

## 驗收標準細化（algs/sensor-catalog.md）

- [ ] 載入流程：rules.d/**/*.yaml → promtool check rules（exec 或嵌入）→ 通過才解析；失敗整檔隔離 + log.warning，daemon 不受影響（§C.6 第一條）
- [ ] fsnotify 存檔熱載入免重啟；每次載入記錄 diff 審計 log（改了哪條/何時）（§C.6 最末條）
- [ ] `sentinel_*` 前綴 label/annotation 解析為內部結構：sentinel_kind / notify_every / sentinel_exclude_namespaces 等；AlertManager 忽略之——移除 sentinel 不影響標準告警語意（§C.1）
- [ ] 三種 kind 路由表：budget(Sloth 生成)→budget 引擎、capacity→capacity 引擎、waste→waste 掃描器（§C.3 範例＋algs/waste-detection.md §8.8）
- [ ] community/ 上游同步腳本：拉 awesome-prometheus-alerts 最新版，記錄 commit hash，產生 diff 報告供 PR 審查（§C.5 自動·上游同步列）
- [ ] 零碼基線規則（predict_linear 版 CapacityEtaWarningBaseline）與進階版（sentinel_eta_*）可共存於同一目錄（§C.1 兩段式）
