---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/722
title: 整合 Ingestion Pipeline 與系統健康檢查 (Alerting)
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-29
updated: 2026-05-29
howto: 在 run_daily_pipeline.py 最後呼叫 AlertChecker(db).check_all()
---

# T081 - 整合 Ingestion Pipeline 與系統健康檢查 (Alerting)

## 目標
在每日資料抓取流程結束後自動觸發系統檢查，確保 Ingestion 狀態正常、資料庫連線無誤且選股結果不為空。

## 驗收標準
- [x] 在 run_daily_pipeline.py 中正確初始化 AlertChecker
- [x] 在 Pipeline 成功結束後執行 check_all()
- [x] 驗證當資料異常時能正確透過 Telegram/Email 發送通知

## 備註
- 需確保 .env 中已設定 Telegram Bot Token 與 Chat ID。
