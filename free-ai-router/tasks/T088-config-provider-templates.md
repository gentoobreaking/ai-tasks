---
github_issue: ""
title: "Provider templates: freemodel config add-provider <name> --from-env"
type: pending
priority: medium
status: pending
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T088 - Provider templates: freemodel config add-provider <name> --from-env

## 目標
簡化 provider 新增流程，提供內建模板自動從環境變數讀取 key 並寫入配置。

## 驗收標準
- [ ] 新增子命令：`freemodel config add-provider <provider> [--from-env] [--base-url <url>] [--model <id>]`
- [ ] 內建模板涵蓋所有 `EnvOverrides` 列表的 provider（nvidia, groq, cerebras, openrouter, googleai, siliconflow, baidu, alibabacloud, tencent, kuaipao 等）
- [ ] `--from-env`：自動讀取對應環境變數（如 `GROQ_API_KEY`）寫入 `apiKeys` 並啟用 provider
- [ ] `--base-url`：支援自訂端點（如本地 vLLM、Ollama、自架 OpenAI 相容）
- [ ] `--model`：預設模型 ID（用於 openai-compatible 類型）
- [ ] 互動模式：不帶參數時顯示可用模板選單，引導填寫
- [ ] 寫入前顯示將修改的配置差異，要求確認

## 備註
- 修改位置：`internal/cli/config_cmd.go` 新增 `RunConfigAddProvider`
- 模板資料建議定義於 `internal/config/templates.go`，包含：provider key、名稱、預設 baseURL、env var 名稱、是否可發現、預設模型
- 現有 `config-add-key`、`config-set-keys` 保留相容，新命令是更高層的封裝
- 範例用法：
  ```
  freemodel config add-provider groq --from-env
  freemodel config add-provider openai-compatible --base-url http://localhost:8000/v1 --model qwen-coder
  freemodel config add-provider siliconflow --from-env
  ```