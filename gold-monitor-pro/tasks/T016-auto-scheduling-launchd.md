---
github_issue: ""
title: macOS launchd 自動排程安裝
type: feature
priority: high
status: pending
depends_on: []
assignee: pi
created: 2026-08-28
updated: 2026-08-28
---

# T016 - macOS launchd 自動排程安裝

## 目標
提供一行指令（`make install-scheduler` 或 `scripts/install_scheduler.sh`）產生 macOS LaunchAgent plist，讓兩支監控程式與 History API 在背景按建議頻率自動執行，使用者只需安裝一次即可長期運作，不必手動排 cron。

## 驗收標準
- [ ] `scripts/install_scheduler.sh` 產生三個 plist：`~/Library/LaunchAgents/com.goldmonitor.local.plist`、`...intl.plist`、`...history.plist`。
- [ ] gold_local 排程：交易時段每 10 分鐘（`StartCalendarInterval` 模擬 `*/10 9-15 * * 1-5`）；gold_intl：每小時；history_api：開機後常駐（RunAtLoad + KeepAlive）。
- [ ] plist 使用絕對路徑呼叫 `python3`（取自 `which python3`）與專案絕對路徑，不因 cwd 或 PATH 而失敗；使用 `${HOME}` 而非硬編碼家目錄。
- [ ] `make uninstall-scheduler` 可移除三個 plist 並 unload。
- [ ] README「排程」章節說明 `make install-scheduler` / `make uninstall-scheduler` 與如何看 log。
- [ ] 實機驗證：install 後 monitor 實際產出 `/tmp/gold_monitor_*.json` 快取（launchctl load 成功）。

## 備註
- 僅支援 macOS（目前 workstation 為 darwin）；若未來需 Linux cron，可另開任務。
- plist 的 StandardOut/StandardError 導向 `~/.gold_monitor_pro/logs/` 以便排錯。
