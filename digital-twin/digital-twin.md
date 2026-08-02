# AI 分身開發規劃

## 專案概述

### 專案目標
開發與個人技能、背景高度匹配的 AI 數位分身，協助處理日常自動化任務與技術諮詢。

### 核心功能與屬性
- **專業背景**：Cloud Engineer（雲端架構、Kubernetes、Linux 低階網路優化、Python）
- **應用場景**：自動化監控與通知（如 Telegram Bot）、系統除錯、技術文件整理
- **部署環境**：本機端大語言模型（Local LLM）/ OpenCode 架構

---

## 架構選擇

### 途徑一：OpenCode 原生 Custom Agent（推薦）

OpenCode 支援自訂 Agent，可設定具備特定風格、能力與權限的 AI 分身。

#### 步驟 1：使用 CLI 快速建立 Agent

互動式指令：

```bash
opencode agent create
```

或使用非互動式 CLI 直接生成：

```bash
opencode agent create \
  --path .opencode/agents/my-clone.md \
  --description "我的全棧開發 AI 分身" \
  --mode primary \
  --permissions bash,read,edit,glob,grep,lsp \
  --model anthropic/claude-3-5-sonnet-20241022
```

#### 步驟 2：寫入 System Prompt（人設與行為準則）

建立 `.opencode/agents/my-clone.md`（專案專用）或 `~/.config/opencode/agents/my-clone.md`（全域通用）。
> **完整範本已獨立為檔案**：`./.opencode/agents/my-clone.md`

#### 步驟 3：設定客製化快捷指令（Custom Commands）

在 `.opencode/commands/` 建立快捷範本。
> **範本已獨立為檔案**：`./.opencode/commands/auto-review.md`

在 OpenCode TUI 中輸入 `/auto-review` 即可觸發此指令。

---

### 途徑二：外部 API / 自動化腳本封裝

如果希望從 **Telegram、Discord、Web 介面**或背景 Cron Job 觸發，可將 OpenCode 作為背景 Engine 執行。

#### 1. 啟動 OpenCode 後端服務

```bash
opencode web --port 4096 --hostname 0.0.0.0
```

#### 2. Python 腳本封裝（CLI / Headless 呼叫）

```python
import subprocess
import json

def run_opencode_agent(prompt: str, agent_name: str = "my-clone"):
    """驅動指定 OpenCode Agent 執行任務"""
    cmd = [
        "opencode",
        "--agent", agent_name,
        "--auto",
        "--prompt", prompt
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

# 範例
output = run_opencode_agent("請修正 auth.py 中的 JWT 權限驗證邏輯，並確保 pytest 通過")
print("AI 分身執行結果:\n", output)
```

---

## 設定路徑整理

| 需求場景 | 配置路徑 / 工具 | 說明 | 建立時機 |
|---|---|---|---|
| **全域分身（Global）** | `~/.config/opencode/agents/` | 所有專案都能切換使用 | 專案初始化前 / 全域需求時 |
| **專案專用分身** | `.opencode/agents/` | 針對該專案特定架構與規範客製 | 專案建立時（首要） |
| **自動化指令（Macro）** | `.opencode/commands/` | 設定常用 Prompt 範本，用 `/` 指令快速呼叫 | 開發中逐步補上（依需求） |
| **全域習慣指引** | `AGENTS.md` | 專案架構規則與程式碼風格 | 專案建立時 / 架構調整時 |

---

## 待辦事項

- [ ] 確定 AI 分身的核心 Prompt 與 Persona 設定 → 產出 `.opencode/agents/my-clone.md` 第一版
- [ ] 規劃本機模型 / API 串接架構
- [ ] 整合 Telegram Bot → Python 腳本能透過 Telegram Bot 接收訊息並呼叫 OpenCode 執行任務
- [ ] 設定 Knowledge Base（RAG）增強專業領域問答

---

## Changelog

| 日期 | 版本 | 變更摘要 |
|---|---|---|
| 2026-08-02 | 1.0 | 初版：專案目標、兩條架構途徑、設定路徑表、完整 System Prompt、Custom Commands |
| 2026-08-02 | 1.1 | 重整結構、拆分範本至獨立檔案、路徑表加「建立時機」、待辦事項具體化、新增 Changelog |