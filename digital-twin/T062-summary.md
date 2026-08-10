# T062 任務完成摘要

## 目標
為 T060（PWD 自動判斷 project）與 T061（all-done 友善訊息）撰寫測試。

## 完成內容
- `tests/test_twin_auto_pwd.py`（6 tests）：
  - `test_explicit_project_overrides_pwd`：--project 明確指定不受 PWD 影響
  - `test_pwd_auto_detect`：PWD 在 project code_dir 下 → 自動選 project
  - `test_pwd_exact_match`：PWD 剛好是 code_dir → 自動選 project
  - `test_pwd_no_match_falls_back_to_default`：PWD 無匹配 → 退回 default
  - `test_detect_project_from_pwd_subdir`：處理子目錄向上查找
  - `test_detect_project_no_match_returns_none`：無匹配 → 回 None
- `tests/test_all_done_list.py`（5 tests）：
  - `test_load_tasks_raises_for_unknown_project`：PROJECT_PATHS 不含 project → ValueError
  - `test_list_all_done_shows_friendly_message`：all-done project --list 顯示友善訊息 + 任務清單
  - `test_list_all_done_includes_completion_message`：驗證完成訊息格式
  - `test_list_pending_project_no_friendly_message`：有 pending task → 不顯示完成訊息
  - `test_list_nonexistent_project_error`：不存在 project → 顯示錯誤

## 驗收結果
| 驗收項目 | 結果 |
|---|---|
| `tests/test_twin_auto_pwd.py` 測試 `_get_project()` 從 PWD 自動判斷 | ✅ 6 passed |
| `tests/test_all_done_list.py` 測試 all-done project --list 顯示友善訊息 | ✅ 5 passed |
| pytest 115 passed + 1 skipped ✅；ruff 全通過 | ✅ |
| 手動驗證 `./twin auto --list` 在各種 PWD 下正確判斷 | ✅ |
| 手動驗證 `./twin auto --project tw-quant-daybrain --list` 顯示完成訊息 | ✅ |

## 備註
- `twin` 腳本透過 `SourceFileLoader` 載入為測試模組
- all-done 測試使用 `tmp_path` + `monkeypatch` 模擬環境，確保與真實系統無依賴
- 忽略有 pre-existing 缺少依賴模組（tenacity/lancedb/redis）的測試檔
