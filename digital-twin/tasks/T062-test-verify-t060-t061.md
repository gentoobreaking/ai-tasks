---
github_issue: null
title: 測試與驗證 T060/T061
type: test
priority: medium
status: done
depends_on:
- 60
- 61
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-17'
spec_version: v3
---
# T062 - 測試與驗證 T060/T061

## 目標
為 T060（PWD 自動判斷 project）與 T061（all-done friendly message）撰寫測試：
- 測試 `twin` 腳本 PWD 判斷邏輯
- 測試 all-done project 的 --list 行為
- 驗證現有測試不受影響

## 驗收標準
- [x] 新增 `tests/test_twin_auto_pwd.py`：測試 `_get_project()` 從 PWD 自動判斷（6 tests）
- [x] 新增 `tests/test_all_done_list.py`：測試 all-done project --list 顯示友善訊息（5 tests）
- [x] pytest 115 passed + 1 skipped（忽略有缺少依賴模組之測試檔）；ruff 全過
- [x] 手動驗證 `./twin auto --list` 在各種 PWD 下正確判斷
- [x] 手動驗證 `./twin auto --project tw-quant-daybrain --list` 顯示完成訊息

## 備註
- 測試可使用 `tmp_path` + `monkeypatch` 模擬 PWD 和 tasks 目錄
- `_get_project()` 位於 `twin` 腳本中，需要透過 `importlib` 載入或重構為可測試模組