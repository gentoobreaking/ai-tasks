# T060 任務完成摘要

## 目標
`twin auto --list` 預設 `--project digital-twin`，增加 `$PWD` 自動判斷：
- 若 `$PWD` = `~/Projects/<project folder>`，自動帶入該 project 名稱
- 若無對應 `<project folder>`，才套用 config.py 動態載入的第一順位專案

## 完成內容
- `twin` 腳本新增 `_detect_project_from_pwd()`：檢查 `$PWD` 是否位於 `config.py PROJECT_PATHS` 中任一 project 的 `code_dir` 目錄下（包含子目錄）
- `_get_project()` 重構：`--project` 未指定時，順序為 PWD 偵測 → default（digital-twin）

## 驗收結果
| 驗收項目 | 結果 |
|---|---|
| `./twin auto --list` 在 `~/Projects/tw-quant-signal/` 自動列出 tw-quant-signal 任務 | ✅ |
| `./twin auto --list` 在 `~/Projects/digital-twin/` 自動列出 digital-twin 任務 | ✅ |
| `./twin auto --list` 在其他路徑 退回 config.py 第一順位專案 | ✅ |
| `--project` 明確指定者正常運作 | ✅ |
| `ruff check auto_develop.py` 通過 | ✅ |
| pytest 126 passed, 2 skipped | ✅ |

## 備註
- PWD 判斷僅對 config.py `PROJECT_PATHS` 中的 project 有效
- `--project` 明確指定者不受 PWD 影響
