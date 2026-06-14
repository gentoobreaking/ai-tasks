---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/745
title: T010-文件補寫
type: Documentation
priority: high
status: done
assignee: 寶寶
created: 2026-05-13
updated: 2026-05-13
depends: T002
howto:
---

# T010 - howto/install-mnn-llm-model.md 文件補寫

## Description

補寫 MNN 模型下載與整合的完整文件，供日後參考。

## Acceptance Criteria

- [ ] `~/howto/install-mnn-llm-model.md` 完成
- [ ] 包含 HuggingFace 下載方式（含不走 token 的 public repo 方法）
- [ ] 包含 ModelScope 方式（記錄 404 的教訓）
- [ ] 包含路徑 bug（MNN.create() 需傳 config.json）和修復方法
- [ ] 包含常見錯誤排查（release_module、VL 模型等）

## Template

參考 `~/howto/build-mnn-metal.md` 格式
