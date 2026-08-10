# T061 任務完成摘要

## 目標
`twin auto --project <all-done> --list` 當所有 task 皆為 `done` 時，不應直接錯誤。

## 完成內容
- `auto_develop.py` `--list` handler 加入 `ValueError` 捕捉：當 project 不在 `PROJECT_PATHS`（因 `discover_projects()` 跳過全 done 專案），改為直接掃描 `~/tasks/<project>/tasks/T*.md`
- 若 tasks 目錄不存在 → 顯示 `❌ 找不到專案: <name>` 錯誤碼 1
- 若 tasks 皆完成 → 顯示 `📋 該專案 <name> 中的任務目前皆已完成！` 並列出所有任務

## 驗收結果
| 驗收項目 | 結果 |
|---|---|
| `./twin auto --project tw-quant-daybrain --list` 不報 `ValueError` | ✅ |
| 顯示友善訊息 `該專案 tw-quant-daybrain 中的任務目前皆已完成！` | ✅ |
| 顯示已完成任務清單（✅ 標記） | ✅ |
| digital-twin 等有 active task 的專案不受影響 | ✅ |
| `ruff check auto_develop.py` 通過 | ✅ |
| pytest 126 passed, 2 skipped | ✅ |

## 備註
- 解決 `tw-quant-daybrain`（T001-T024 皆 done）無法 `--list` 的問題
- 直接掃描路徑：`~/tasks/<project>/tasks/`，不依賴 config.py 動態發現
