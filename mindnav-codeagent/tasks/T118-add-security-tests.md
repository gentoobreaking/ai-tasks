---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/633
type: Test
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 建立 tests/test_security.py 測試 SafeShell
     - 白名單指令正常執行
     - 黑名單指令被擋住（rm, mkfs, dd 等）
     - shell metacharacter 注入被擋住（;, |, $(), `）
     - path traversal（..）被擋住
     - 絕對路徑指令被擋住
  2. 建立 tests/test_file_tool.py 測試 file_tool
     - read_file 正常讀取 + offset/limit 分頁
     - write_file 建立/覆蓋檔案
     - edit_file 精確替換 + replaceAll
     - apply_patch 套用 diff
     - 禁止寫入 .git/、致敏檔案
     - 路徑穿越被擋住
  3. 建立 tests/test_permission.py 測試 PermissionChecker
     - allow/deny 正確路由
     - glob pattern 匹配
     - 無 permissions 時預設 allow
  4. 確認測試可使用 pytest 執行

# T118 - 補上 SafeShell / file_tool / permission 測試

## 目標
為最關鍵的安全元件（SafeShell）和新增工具（file_tool, permission）補上單元測試。

## 驗收標準
- [x] tests/test_security.py 覆蓋白名單/黑名單/注入/路徑穿越 (22 tests)
- [x] tests/test_file_tool.py 覆蓋 read/write/edit/patch + 安全檢查 (14 tests)
- [x] tests/test_permission.py 覆蓋 allow/deny/glob/預設 (9 tests)
- [x] pytest 可全部通過 (168 passed, 7 skipped, 0 failed, 0 errors)
- [x] 使用 TemporaryDirectory 避免汙染真實檔案系統

## 備註
- 不要執行 verify_safety() 中 `rm -rf /` 的測試案例
- 使用 mock 或 TemporaryDirectory 確保安全
