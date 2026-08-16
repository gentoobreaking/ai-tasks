---
github_issue: null
title: diff _normalize_path 加入路徑穿越 containment 檢查（防議外寫入）
type: fix
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T066 - diff _normalize_path 路徑穿越 containment 防護

## 目標
`diff.py:31-50` `_normalize_path` 無 containment 檢查；`../` 穿越路徑可寫入 project 目錄以外
（`scheduler.py:778-781/853-856` 直接 `code_dir / rel_path` → `.write_text`）。模型輸出屬不可信，
必須限制寫入範圍於 `code_dir`。

## 驗收標準
- [x] `_normalize_path` 加入 resolve + `is_relative_to(code_dir.resolve())` 檢查；逃逸路徑回傳空字串
- [x] scheduler 兩處 dict-write 迴路加入「空路徑跳過」防護，不中斷任務
- [x] apply_diff 路徑透過 `git apply`（worktree 內限制）無變更、越界 → apply 失敗→task failure
- [x] 新增 `tests/test_diff_path_containment.py`（9 tests）覆蓋絕對路徑、`../` 穿越、內部合法路徑、scheduler write 迴路
- [x] pytest 全量 246 passed + 1 skipped（+9）；ruff check/format 全過

## 備註
- 安全修正（模型輸出為不可信輸入），優先級高
- 純前導 `..`/`/etc/...` 會 strip 為寫入 code_dir 內的相對路徑（安全，不逃逸）；真正逃逸的是 mid-path `..`
- 僅寫入迴路防護；讀取/索引路徑不受影響