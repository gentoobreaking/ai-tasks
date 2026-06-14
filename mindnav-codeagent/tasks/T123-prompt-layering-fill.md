---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/646
title: Prompt Layering 系統配置填充
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 填充 config/{role}/ 目錄下的空檔案（TOOLS.md、USER.md、BOOTSTRAP.md 等）
---

# T123 - Prompt Layering 系統配置填充

## 目標
填充 MindNav CodeAgent 的三層 Prompt 系統配置，讓每個角色都有完整的工具定義、服務對象說明和啟動檢查清單。

## 背景
目前有 9 個角色目錄：
- config/po/
- config/pm/
- config/architect/
- config/coder/
- config/security/
- config/qa/
- config/doc/
- config/researcher/
- config/devops/

每個目錄包含 8 個 .md 檔案，但只有 SOUL.md 有內容，其他（TOOLS.md、USER.md、BOOTSTRAP.md、AGENTS.md、IDENTITY.md、MEMORY.md、HEARTBEAT.md）都是 0 bytes。

## 驗收標準
- [x] 每個角色都有 TOOLS.md（可用工具與使用規範）
- [x] 每個角色都有 USER.md（服務對象與互動方式）
- [x] 每個角色都有 BOOTSTRAP.md（啟動檢查清單）
- [x] 每個角色都有 AGENTS.md（團隊編制與協作關係）
- [x] 每個角色都有 IDENTITY.md（身份定義）
- [x] 每個角色都有 MEMORY.md（記憶策略）
- [x] 每個角色都有 HEARTBEAT.md（定期任務）
- [x] 內容與 agents.yaml 的權限定義一致
- [x] 優先處理高頻角色：Coder > PM > Architect

## 實作細節

### 執行順序
1. **Coder**（最高頻）- 完整的 7 個檔案
2. **PM**（次高頻）- 完整的 7 個檔案
3. **Architect** - 完整的 7 個檔案
4. **其他 6 個角色** - 使用批量腳本統一填充

### 檔案說明

#### TOOLS.md
定義角色可用的工具（依據 agents.yaml 的 permissions），以及：
- 使用規範
- 安全紅線
- 權限對照表

#### USER.md
定義服務對象：
- 上游（誰給任務）
- 下游（交付給誰）
- 互動協作範例

#### BOOTSTRAP.md
啟動檢查清單：
- 必要條件檢查
- 啟動報告格式
- 快速啟動指令

#### AGENTS.md
團隊編制說明：
- 組織架構圖
- 上游/下游協作關係
- 權責邊界

#### IDENTITY.md
身份定義：
- 角色定位
- 核心能力
- 工作風格

#### MEMORY.md
記憶策略：
- Token 預算（依據 memory_policy.token_budgets）
- 記憶內容分類
- 自動觸發條件

#### HEARTBEAT.md
定期任務：
- 檢查頻率
- 主動通知格式
- 維護排程

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

## 後續建議
1. 可以進一步優化每個角色的 MEMORY.md，加入更精確的 Token 配額
2. HEARTBEAT.md 可以結合 maintenance_cron 配置實現自動化
3. 考慮為每個角色加入特定領域的 TOOLS.md 擴充（例如 Security 的漏洞掃描工具）
