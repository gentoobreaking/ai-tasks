---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/537
title: T033 - 修復 README.md 檔名尾隨空格
type: Bug
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: fix
---

# T033 - 修復 README.md 檔名尾隨空格

## 目標
專案根目錄的 `README.md `（注意檔名尾端有一個空格）會導致：
- Git diff 難以辨識
- 部分工具/腳本可能找不到該檔案
- 與 Tasks 目錄的標準命名不一致

需將檔名正名為 `README.md`（無尾隨空格）。

## 驗收標準
- [x] 確認 `README.md`（無空格）存在於專案根目錄
- [x] 確認原 `README.md `（有空格）已移除
- [x] 確認 `.gitignore` 或其他配置無殘留對舊檔名的引用
- [x] 確認 `README.md` 內容完整無損

## 備註
- 使用 `mv` 或 `git mv` 重新命名
- 若 git 已追蹤舊檔名，需同時更新 git index
