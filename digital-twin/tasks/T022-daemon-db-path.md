---
title: setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定
type: fix
priority: low
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T022 - setup_daemon 路徑驗證 + extract_feedback DB 路徑可設定

## 目標
兩處環境耦合問題：
1. `setup_daemon.py` 的 launchd plist `ProgramArguments` 使用 `sys.executable`（可能是 venv/pyenv 動態路徑）。若該 Python 被刪除或更新，開機服務直接失敗。應驗證路徑存在並記錄實際值；`telegram_bot.py` 目前不存在（T006 失敗），安裝前應檢查目標腳本存在。
2. `extract_feedback.py` 硬編碼 `DB_PATH = ~/.local/share/opencode/opencode.db`，無法覆寫。

## 驗收標準
- [ ] setup_daemon：`install` 前驗證 `BOT_SCRIPT` 存在，不存在時明確報錯（「telegram_bot.py 未實作，依賴 T006」）並退出
- [ ] setup_daemon：plist 寫入前驗證 `sys.executable` 路徑存在；可選改用專案 venv（`venv/bin/python`）並檢查其存在
- [ ] setup_daemon：uninstall 時若 plist 不存在但 launchctl 有殘留，也執行 unload（冪等）
- [ ] extract_feedback：`DB_PATH` 支援環境變數覆寫（如 `OPENCODE_DB_PATH`），預設值不變
- [ ] `python3 extract_feedback.py --days 1 --only-corrections` 正常執行（DB 存在時）

## 備註
- setup_daemon 相關功能因 telegram_bot.py 缺失目前不可用，本任務確保「錯誤訊息正確」即可，不重新實作 bot
- 測試方式：`python3 setup_daemon.py install` 應印出明確錯誤而非產出失效 plist
