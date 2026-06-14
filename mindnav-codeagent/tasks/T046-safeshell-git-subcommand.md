---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/550
title: T046 - SafeShell git 子指令過濾
type: Feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T046 - SafeShell git 子指令過濾

## 目標
`engine/security.py` 的白名單檢查僅比對 `cmd_base`（如 `git`），但 `git` 可接任意子指令（`commit`、`push`、`reset --hard`），攻擊者可繞過白名單執行危險操作。

## 驗收標準
- [x] 白名單支援子指令過濾：`git status`、`git diff`、`git log`、`git add` 允許；`git push`、`git reset`、`git commit` 禁止
- [x] 白名單改為 `Dict[str, List[str]]` 格式，每個指令對應允許的子指令列表（空列表 = 全部允許）
- [x] 若子指令不匹配，回傳 `git 子指令 'X' 不被允許。允許的子指令: Y` 安全警告
- [x] `__main__` 區塊涵蓋 git 子指令場景測試

## 備註
- 白名單格式可改為 `{"git": ["status", "diff", "log", "add"], "ls": []}`（空表＝全部允許）
- 需考慮跨平台相容性（`git.exe` 在 Windows）
