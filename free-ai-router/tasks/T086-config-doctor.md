---
github_issue: ""
title: "Config doctor command: validate config, report missing keys, broken providers"
type: pending
priority: high
status: pending
depends_on: ["T082"]
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T086 - Config doctor command: validate config, report missing keys, broken providers

## 目標
實作 `freemodel config doctor` 子命令，提供配置健康檢查，自動偵測常見問題並給出修復建議。

## 驗收標準
- [ ] 檢查項目：
  - 配置檔 JSON 語法正確性
  - 每個啟用 provider 是否有對應 API key（env / config / auto-detect）
  - 環境變數名稱拼寫正確性（對照 `EnvOverrides`）
  - 被禁用但有 key 的 provider（提示可能遺忘啟用）
  - 重複/衝突的 model ID
  - 過期的 cache（`data/sources.json` 版本 vs 內建版本）
- [ ] 輸出格式：結構化表格 + 總結（✅ OK / ⚠️ Warning / ❌ Error）
- [ ] 提供 `--fix` 旗標：自動修復可安全修復的問題（如：有 key 卻 disabled → 啟用）
- [ ] 非零退出碼當有錯誤時，適合 CI/CD 管線使用
- [ ] 整合至 `freemodel doctor` 作為子檢查

## 備註
- 修改位置：`internal/cli/config_cmd.go` 新增 `RunConfigDoctor`、或新增 `internal/cli/doctor.go`
- 可複用 `config.Load()` 的錯誤處理邏輯、`config.ResolveAPIKey` 驗證 key
- 建議輸出範例：
  ```
  Provider Status Check:
  ┌─────────────┬────────┬──────────┬─────────────────────────────┐
  │ Provider    │ Key    │ Enabled  │ Issue                       │
  ├─────────────┼────────┼──────────┼─────────────────────────────┤
  │ nvidia      │ ✅ env │ ✅       │ OK                          │
  │ groq        │ ❌     │ ✅       │ Missing GROQ_API_KEY        │
  │ openrouter  │ ✅ cfg │ ❌       │ Disabled but has key (fix?) │
  └─────────────┴────────┴──────────┴─────────────────────────────┘
  ```