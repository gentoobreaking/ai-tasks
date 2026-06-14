---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/620
type: Feature
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 engine/permission.py — PermissionChecker 類別，支援 allow/ask/deny 三種動作
  2. 實作 glob pattern 匹配：支援 bash: { "git *": "ask", "grep *": "allow" } 等精細設定
  3. 在每個 node 執行前插入 permission check，攔截被 deny 的操作
  4. 支援 "ask" 模式：透過 Question tool 詢問使用者是否允許執行
  5. 在 config/agents.yaml 中為每個 agent 定義 permissions 區塊
  6. PermissionChecker 整合到 agent_node() 和 task_executor_node()
  7. 更新測試驗證權限攔截正確

# T105 - Permission Layer for Agent Tools

## 目標
實作 OpenCode 風格的權限系統（allow/ask/deny），支援 glob pattern 精細控制每個 agent 能使用的工具，避免 subagent 越權操作。

## 驗收標準
- [x] PermissionChecker 支援 allow/ask/deny 三種動作
- [x] glob pattern 匹配（如 bash: { "git *": "ask" }）
- [x] deny 時正確攔截操作並回傳錯誤
- [ ] ask 時透過 Question tool 詢問使用者（待前後端整合）
- [x] 整合到 agent_node() 和 task_executor_node()
- [x] 無 permissions 設定時預設 allow（向後相容）

## 備註
- 參考 OpenCode 的 permission 系統設計
- 權限設定：edit (write/edit/apply_patch), bash, read, glob, grep, webfetch 等
- "ask" 模式需要 Question tool 支援（已存在 engine 中）
