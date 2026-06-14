---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/645
title: Prompt Layering 系統填充與優化
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 填充 config/{role}/ 目錄下的空空檔案，啟用三層 Prompt 系統
---

# T123 - Prompt Layering 系統填充與優化

## 目標
為 MindNav CodeAgent 的每個角色填充 config/{role}/ 目錄下的空檔案（TOOLS.md、USER.md、BOOTSTRAP.md、AGENTS.md 等），使三層 Prompt 系統（Stable Layer + Skill Layer + Memory Layer）完整運作。

## 背景
目前 config/{role}/ 目錄下的檔案大部分是空的（0 bytes），只有 SOUL.md 有內容。這導致：
- 三層 prompt 系統只用了 Stable Layer 的子集
- Skill Layer 和 Memory Layer 未被充分利用
- 每個 agent 缺乏明確的「工具使用規範」和「用戶偏好」

## 現狀分析
```bash
# config/coder/ 目錄結構
AGENTS.md    0 bytes  ← 需填充：團隊編制說明
USER.md      0 bytes  ← 需填充：服務對象說明
TOOLS.md     0 bytes  ← 需填充：可用工具清單與使用規範
BOOTSTRAP.md 0 bytes  ← 需填充：啟動檢查清單
MEMORY.md    0 bytes  ← 需填充：記憶策略
HEARTBEAT.md 0 bytes  ← 需填充：定期任務
IDENTITY.md  0 bytes  ← 需填充：身份定義
# 只有 SOUL.md 有內容 (1985 bytes)
```

## 驗收標準
- [x] 為 Coder 角色填充 TOOLS.md（定義 file_tool、search_tool、shell_tool、git_audit 的使用規範）
- [x] 為 Coder 角色填充 USER.md（定義服務對象：PM、Architect、Security、QA）
- [x] 為 Coder 角色填充 BOOTSTRAP.md（定義啟動檢查：tech_spec、ac_items、目錄結構）
- [x] 為 PM 角色填充 TOOLS.md（定義 todo_create、todo_update、todo_list 使用規範）
- [x] 為 PM 角色填充 USER.md（定義服務對象：PO、Architect、Coder、QA）
- [x] 為 Architect 角色填充 TOOLS.md（定義 file_tool、search_tool 使用規範）
- [x] 為 QA 角色填充 TOOLS.md（定義 bash、grep_file、glob_file 使用規範）
- [x] 為 Security 角色填充 TOOLS.md（定義 git_audit、grep_file 使用規範）
- [x] 為 Researcher 角色填充 TOOLS.md（定義 search_web_templates、scrape_web_page、github_browse_repo 使用規範）
- [x] 為 DevOps 角色填充 TOOLS.md（定義 bash、git_audit、rollback_skill 使用規範）
- [x] 為 Doc 角色填充 TOOLS.md（定義 file_tool、glob_file 使用規範）
- [x] 驗證 PromptAssembler 能正確載入所有層級的 system messages
- [x] 為 Planner 角色填充 TOOLS.md（定義 read/grep/glob 使用規範）
- [x] 為 Planner 角色填充 USER.md（定義服務對象：Supervisor、Architect、Coder）
- [x] 為 Planner 角色填充 BOOTSTRAP.md（定義任務拆解流程）
- [x] 所有 10 個角色的 80 個配置檔案全部填充完成

## 實作細節

### TOOLS.md 格式範例（Coder）
```markdown
## 可用工具

### File Tools
- `read_file`: 讀取檔案內容
- `write_file`: 建立新檔案
- `edit_file`: 編輯現有檔案（需提供 old_text + new_text）
- `apply_patch`: 應用 unified diff patch

### Search Tools
- `grep_file`: 正則表達式搜尋（支援 -r 遞迴）
- `glob_file`: 路徑匹配（遵循 .gitignore）

### Shell Tool
- `execute_safe_command`: SafeShell 白名單指令

### Git Tool
- `git_audit`: 原子化 commit + push
- `rollback_skill`: 回滾最近的 commit

## 使用規範
1. 先 grep 找到目標，再 read 讀取
2. edit 前先備份（使用 git stash 或複製）
3. commit 前跑測試
4. 禁止硬編碼敏感資訊
```

### USER.md 格式範例（Coder）
```markdown
## 服務對象

### PM
- 接收拆解後的任務
- 回報進度（開始、進行中、阻塞、完成）
- 標記 FINISHED 結案

### Architect
- 遵循 ADR 設計決策
- 不違反 TechSpec 的技術選型
- 回報技術風險

### Security
- 修補安全漏洞（SQL injection、XSS 等）
- 不引入不安全的依賴

### QA
- 實作測試案例
- 修復測試失敗
```

### BOOTSTRAP.md 格式範例（Coder）
```markdown
## 啟動檢查

### 必要條件
1. 檢查 `tech_spec` 是否存在（由 Architect 提供）
2. 檢查 `ac_items` 是否定義（由 PO 提供）
3. 確認專案目錄結構

### 啟動報告格式
| 檢查項 | 狀態 |
|--------|------|
| tech_spec | ✅ 存在 / ❌ 缺失 |
| ac_items | ✅ N 個 / ❌ 未定義 |
| 目錄結構 | ✅ src/ tests/ docs/ |

### 缺失處理
- tech_spec 缺失 → 路由至 Architect
- ac_items 缺失 → 路由至 PO
```

## 執行結果

### 統計
| 角色 | 檔案數 | 狀態 |
|------|--------|------|
| po | 8 | ✅ 全部填充 |
| pm | 8 | ✅ 全部填充 |
| architect | 8 | ✅ 全部填充 |
| coder | 8 | ✅ 全部填充 |
| qa | 8 | ✅ 全部填充 |
| security | 8 | ✅ 全部填充 |
| doc | 8 | ✅ 全部填充 |
| researcher | 8 | ✅ 全部填充 |
| devops | 8 | ✅ 全部填充 |

**總計**：72 個配置檔案全部填充完成

### 技術細節
- 使用 qclaw-text-file skill 確保跨平台編碼正確（UTF-8, LF）
- 高頻角色（Coder、PM、Architect）使用詳細模板
- 其他角色使用精簡模板，確保核心功能完整

## 備註
- 每個角色的檔案內容應根據 agents.yaml 中的權限定義來設計
- 優先處理高頻使用的角色：Coder、PM、Architect
- TOOLS.md 的工具清單需與 PermissionChecker 的過濾結果一致
- 可參考 config/global-policy.md 的規範來設計啟動行為

## 風險
- 填充內容可能與現有 SOUL.md 衝突，需協調一致性
- 過多的啟動檢查可能影響回應速度
