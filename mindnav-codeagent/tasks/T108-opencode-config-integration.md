---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/623
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 在 engine/config_loader.py 新增 load_opencode_config()：自動讀取 ~/.config/opencode/opencode.json
  2. 若 opencode.json 存在，匯入其中的 agent 設定（model, temperature, permissions）
  3. 保留 mindnav-codeagent 的 config/agents.yaml 優先權（可覆蓋 OpenCode 設定）
  4. 支援讀取 .opencode/agents/*.md（專案級 agent 定義）
  5. 整合 per-agent model 覆蓋：OpenCode 的 model 設定可映射到 LLMFactory
  6. 整合 temperature 設定：每個 agent 可自訂 temperature
  7. 衝突解決策略：agents.yaml > opencode.json > 預設值
  8. 更新測試與文件說明設定來源優先順序

# T108 - OpenCode Config Integration + Setting Sync

## 目標
讓 mindnav-codeagent 可直接讀取桌機 OpenCode 的設定檔（opencode.json、.opencode/agents/*.md），沿用已調好的 agent 參數。

## 驗收標準
- [x] load_opencode_config() 讀取 ~/.config/opencode/opencode.json
- [x] 支援 .opencode/agents/*.md 讀取（frontmatter 解析）
- [x] per-agent model 覆蓋映射到 LLMFactory（含 provider 名稱轉換）
- [x] per-agent temperature 設定生效
- [x] 衝突解決：model_override > agents.yaml > opencode.json > 預設值
- [x] 無 OpenCode 設定時不影響現有行為

## 備註
- 這是最後一層整合，依賴前 4 個 Phase 完成
- model 映射需處理 provider 名稱轉換（opencode 的 anthropic/claude-sonnet → LLMFactory 格式）
- 不強制要求有 OpenCode 設定，專案可獨立運作
