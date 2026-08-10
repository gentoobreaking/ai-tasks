---
github_issue: null
title: Telegram 自動推播（auto 完成 / blocked / doctor 異常）
type: feature
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T056 - Telegram 自動推播（完成/blocked/doctor 異常）

## 目標
前次 design-review §三.3（P1）指出：auto 完成或 blocked 無 Telegram 通知
（bot 白名單無 handler）。2026-08-11 審查確認仍未做。本任務建立三事件的推播路徑。

## 驗收標準
- [ ] auto_develop.process_task 完成時（done + commit hash）推送：任務編號、PR summary 位置
- [ ] 任務進入 blocked 時推送：任務編號、blocked review 路徑、（可選）失敗 reason
- [ ] doctor 檢測到 FAIL 級異常時推送（可選開關，預設關閉或僅 WARN+）：異常項目清單
- [ ] 推播實作共用既有 Telegram 通道（參考 worker.py:189-205 notify 模式或 orchestor 之 sendMessage），
  收斂於共用函式（配合 T054 的 TELEGRAM_SEND_URL 常數）
- [ ] 無 TELEGRAM_BOT_TOKEN/chat_id 時靜默跳過，不影響 auto/doctor 主流程
- [ ] pytest 全量維持 151 passed + 1 skipped；新增推播函式單元測試（mock httpx，不觸網）

## 備註
- 通知對象：bot 管理員白名單（沿用 telegram_bot.py RBAC 的 admin chat_id 定義）
- 推播失敗（網路/逾時）不應使任務流程失敗——wrap try/except + log
- 與 T049 的一致性檢查輸出可作為 doctor 推播的內容來源之一