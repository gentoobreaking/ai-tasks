---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/630
type: Bug
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 修改 engine/security.py 中 SafeShell.run()
     - 將 subprocess.run(command, shell=True) 改為 shlex.split() + shell=False
     - 將命令字串解析為 list 後檢查 basename 是否在白名單
     - 補上 shell metacharacter 檢查（;, |, $(...), `, &&, ||）
  2. 修改 engine/tools/git_audit.py
     - git commit -m 改用 shlex.quote() 或傳入 list 避免 injection
     - git add . 也改為 list 形式
  3. 修改 engine/security.py 中的 is_safe_command()
     - 改寫 path 檢查邏輯：用 shlex.split() 解析後檢查 base command
     - ".." 改為 parsed path component 層級檢查
     - "/" in command 改為檢查 base command 的 basename
  4. 確認 verify_safety() 中的 rm -rf / 仍被正確擋住

# T115 - 修復 shell=True RCE 漏洞 + git commit message injection

## 目標
修復 SafeShell 的 `shell=True` 指令注入漏洞與 git commit message 注入，移除 shell metacharacter 攻擊面。

## 驗收標準
- [ ] SafeShell.run() 使用 `shell=False` + 命令 list
- [ ] shlex.split() 用於命令解析
- [ ] shell metacharacter（;, |, $, `, &&, ||）被攔截
- [ ] git_audit.py 使用 shlex.quote() 或 list 傳參
- [ ] `..` 路徑穿越檢查改為 parsed path component 層級
- [ ] verify_safety() 中 `rm -rf /` 測試案例被正確擋住
- [ ] 現有 whitelist 功能不受影響

## 備註
- shell=True 是最嚴重的攻擊面，LLM 可注入任意命令
- 需確保 shlex.split() 在 macOS 和 Linux 行為一致
