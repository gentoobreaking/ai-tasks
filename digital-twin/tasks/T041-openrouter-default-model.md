---
github_issue: 
title: '--model/Scheduler 預設不再硬編，整條鏈由 impl_providers.yaml 決定'
type: refactor
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-09'
---

# T041 - Auto-Develop OpenRouter 預設模型統一由 impl_providers.yaml 決定

## 目標
T039 之後 `.opencode/impl_providers.yaml` 已是備援鏈唯一事實來源，但 OpenRouter
預設模型仍有三個來源互相獨立：

1. `config.py DEFAULT_IMPL_MODEL`（env fallback 到 nemotron-3-ultra）——僅剩
   `auto_develop._tier_model()` 的 openrouter 最後 fallback 使用
2. `AutoDevelopScheduler.__init__` 的 `model` 參數預設硬編 `"nvidia/nemotron-3-ultra-550b-a55b:free"`
3. `main()` 的 `--model` argparse `default=` 同字串硬編

若使用者透過 YAML 換掉 openrouter 模型，CLI/Scheduler 預設不會跟著變（主因：
`main()` 的硬編預設會在每次 CLI 執行時覆寫 YAML 的 openrouter tier model，
YAML 換模型在 CLI 路徑下形同無效）。改為 Scheduler/CLI 不解析預設、
整條鏈與各 tier 模型完全由 impl_providers.yaml 決定。

## 驗收標準
- [x] `AutoDevelopScheduler.__init__` `model: str | None = None`、`self.model = model`
      直通（不自行解析預設），顯式傳入仍優先
- [x] `main()` `--model` default 改 `None`、help 更新（僅作 OpenRouter tier 逃生覆蓋）
- [x] `DEFAULT_IMPL_MODEL` 退位為 openrouter tier 最後 fallback（無 YAML / YAML 缺 model 時）
- [x] 離線測試 `tests/test_impl_defaults.py`：Scheduler 預設 None／顯式 model 直通／
      YAML 順位與模型不受預設覆寫
- [x] 全量 pytest 134 passed + 1 skipped（+新增後 137）→ 137 passed + 1 skipped；ruff 全過
- [x] README §6 補「未指定 --model 時排程器/CLI 不自行解析預設，整條鏈由 YAML 決定」
- [x] 任務完成摘要

## 備註
- 實作過程依使用者意見修正設計：原案「抽出 `_openrouter_default_model()`」被否決——
  那是單點概念，與 YAML「整條鏈」精神不合；Scheduler/CLI 根本不需要解析預設
- 此任務檔原內容曾因簡報失誤被覆寫（git 741b510 有完整原始），已於本版還原
  並統一為 template 格式
---

## 驗證結果（2026-08-09）
- AutoDevelopScheduler model 預設 None（顯式傳入優先）；main() --model default=None
- tests/test_impl_defaults.py 3 項離線測試全過；全量 137 passed + 1 skipped（134 → 137）
- README §6 更新；程式碼 commit：`990855d`