---
github_issue: N/A
title: waste Tracker daemon 接線——定期掃描與候選生命週期
type: feat
priority: high
status: done
depends_on:
- T015
- T009
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-26

---

# T024 - waste Tracker daemon 接線

## 背景（功能孤兒）
`internal/waste/tracker.go` 已實作完整生命週期（observe 去重、renotify、
dismiss 暫緩、resolve 累積節省金額），但 `cmd/sentinel` 完全未使用：
waste 掃描僅在有人手動打 `/api/waste` 時執行，daemon 迴圈無定期掃描，
候選永遠不會主動通知，dismiss/resolve 無入口。

## 目標
daemon 主迴圈納入 waste 定期掃描，接上 Tracker 生命週期與直推通知。

## 實作要點
1. daemon 新增 waste 掃描週期（獨立 ticker 或每 N 輪詢一次；建議 6h～1d）
2. 掃描結果餵 `Tracker.Observe` → shouldNotify 才直推 Telegram
3. Tracker 持久化：entries 存 SQLite（重啟不丟 dismiss/resolve 狀態）；
   需 store 新增表＋migration
4. 提供 CLI/API 入口：dismiss（暫緩至期限）、resolve、list
   （可掛在 sentinel-ui GET-only 之外的後續擴充；v1 先 CLI）

## 驗收標準
- [x] daemon 每 N 小時自動掃描並對新候選推播（同資源去重）
- [x] 重啟 daemon 後已 dismiss 的候選不再通知、到期自動復活
- [x] resolve 後累積節省金額可查詢（CLI 輸出）
- [x] 單一規則 expr 查詢失敗不拖垮整輪掃描（逐項 best-effort）
- [x] 掃描週期可用環境變數／config 覆寫；設 off 完全停用

## 備註
- 浪費金額計算（恆為 0 的問題）另見 T027，本任務不含
