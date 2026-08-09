---
num: 041
name: Auto-Develop OpenRouter 預設模型統一由 impl_providers.yaml 決定
priority: high
created: '2026-08-09'
updated: '2026-08-09'
status: pending
depends_on: []
tags: [auto-develop, config, yaml]
---

# T041 — OpenRouter 預設模型統一由 impl_providers.yaml 決定

## 背景
T039 之後 `.opencode/impl_providers.yaml` 已是備援鏈唯一事實來源，但 OpenRouter
預設模型仍有三個來源互相獨立：

1. `config.py DEFAULT_IMPL_MODEL`（env fallback 到 nemotron-3-ultra）——僅剩
   `auto_develop._tier_model()` 的 openrouter 最後 fallback 使用
2. `AutoDevelopScheduler.__init__` 的 `model` 參數預設硬編 `"nvidia/nemotron-3-ultra-550b-a55b:free"`
3. `main()` 的 `--model` argparse `default=` 同字串硬編

若使用者透過 YAML 換掉 openrouter 模型，CLI/Scheduler 預設不會跟著變。

## 驗收準則
- [ ] 新增 `_openrouter_default_model()`：依序為 impl_providers.yaml 的 openrouter tier model →
      DEFAULT_IMPL_MODEL（env）→ 內建
- [ ] `AutoDevelopScheduler.__init__` `model` 參數預設改 `None`，`self.model =
      model or _openrouter_default_model()`（顯式傳入仍優先）
- [ ] `main()` `--model` default 改 `None`（help 更新），Scheduler 建構不變
- [ ] 離線測試：YAML openrouter model 生效／YAML 無 openrouter 或檔案缺失 → DEFAULT_IMPL_MODEL／
      Scheduler 顯式 model 優先／Scheduler 預設跟 YAML
- [ ] 全量 pytest 維持 134 passed、ruff 全過
- [ ] README §6 補「--model／排程器預設由 impl_providers.yaml openrouter tier 決定」
- [ ] 任務完成摘要

## 驗證結果（完成後填）