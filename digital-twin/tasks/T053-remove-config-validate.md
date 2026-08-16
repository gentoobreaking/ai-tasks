---
github_issue: null
title: 移除/重寫 config/validate.py 死碼（Pydantic 層無人引用、key 必填與離線測衝突、模型名過時）
type: refactor
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-12'
commit: c9cbf4e
---
# T053 - 移除/重寫 config/validate.py 死碼

## 目標
2026-08-11 審查發現 config/validate.py（118 行）為死碼：
- 全 repo 無任何模組 import（get_settings/validate_config/validate_config_silent 皆無引用）
- 要求 openrouter/gemini key「必填」（:26-27），與「離線可測、key 可缺」的現況設計矛盾
- 內含過時模型名（grok-2、claude_model），與 .opencode/models.yaml（grok-4.5）不同步
- 與 doctor.py 的 env 檢查、models.yaml 的模型來源職責重疊

## 驗收標準
- [x] 決定並執行：a) 刪除 config/validate.py + `rg validate` 確認零引用；或
  b) 若需保留 .env schema 驗證，改以 doctor.py 的現有檢查為準、同步 models.yaml 模型名
- [x] README / docs 若有引用 config/validate 的地方同步移除
- [x] 不引入新依賴（刪除 pydantic_settings 若因此無使用點，從 pyproject dev 依賴一併移除）
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- 傾向方案 a（刪除）：key 檢查由 doctor.py 承接，模型由 models.yaml 承接，此檔兩者皆非
- 移除前確認 pydantic-settings 是否仍被其他模組使用（若有，pyproject 保留）

## 完成備註（2026-08-12）
- 執行方案 a：`git rm config/validate.py`（118 行全刪）
- rg `validate_config`/`get_settings`/`TwinSettings`/`config.validate` 於碼/測試零引用；
  README 與 docs/ 亦無相關引用
- pydantic-settings 未直接列於 pyproject（僅 chromadb 傳遞依賴），pyproject/uv.lock 不動
- specs/ai-consultations/v3（歷史決策線）與 full_sessions.md 保留原文
- pytest 全量：182 passed + 1 skipped（基線未劣化）；ruff 全過