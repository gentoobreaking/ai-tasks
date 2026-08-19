---
github_issue: 
title: 避免手動中斷管線 - 改為背景執行與監控
type: pending
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-19
updated: 2026-08-19
---

# T027 - 避免手動中斷管線 - 改為背景執行與監控

## 目標
解決管線被手動 Ctrl+C 中斷導致資料不完整的問題，改為背景執行並加入監控機制。

## 驗收標準
- [x] `scheduler_cron.sh` 使用 `nohup` 或 `systemd` 背景執行管線
- [x] 加入 PID 檔案管理，防止重複執行
- [x] 加入執行狀態記錄檔 (start/end/status/error)
- [x] 加入執行時間超過預期的告警機制
- [x] 加入失敗重試機制 (可配置重試次數)
- [x] 更新 `docker-compose.yml` scheduler service 設定

## 備註
- 目前管線被手動 Ctrl+C 中斷導致資料不完整 (log 中多次出現 `KeyboardInterrupt`)
- 相關檔案：`scripts/scheduler_cron.sh`、`docker-compose.yml`、 `src/tw_quant_signal/pipeline.py`
- 風險：背景執行需確保 log 正確輸出、錯誤可追蹤
- 建議使用 `systemd` 或 `supervisor` 管理生產環境排程
- 相關任務：T001 (資料管線)
---