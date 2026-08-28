---
id: T066
github_issue: ""
title: 資料新鮮度 SLA 監控
project: gold-analysis
type: feature
priority: low
status: done
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T066 - 資料新鮮度 SLA 監控

## 目標
監控各資料來源的最後更新時間，當某來源過期（超過閾值）時主動告警，避免模型/決策在陳舊資料上靜默運作（補強 T054 的真實資料健康度）。

## 驗收標準
- [ ] 註冊各資料來源及其 SLA 閾值（如價格 ≤ 5 分鐘、情緒 ≤ 1 天）
- [ ] 定時檢查 `last_update`，超過閾值標記 stale 並記錄
- [ ] stale 事件接 T056 通知通道發送告警
- [ ] 前端儀表板顯示各來源「最後更新 / 狀態」指示燈
- [ ] 補測試：模擬過期來源觸發 stale 標記與通知

## 備註
- 可與 T054 排程任務共用取數與時間戳欄位。
- 注意 mock 模式下需區分「來源不可用」與「mock 模式不取數」。
