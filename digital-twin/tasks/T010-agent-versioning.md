---
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-07'
fail_count: 0
commit: 105f0bc
summary: Agent SemVer front-matter + Canary deploy/promote/rollback 完成，11 tests 通過
---
# T010: Agent System Prompt 強制 SemVer Front-matter + Canary Deploy + Rollback

## 背景
Agent `.md` 檔案無版本號、無 change log、無 rollback 機制。`apply_feedback.py` 直接覆寫，無 diff/review/dry-run 模式（DeepSeek 第 1 輪建議 6, SPEC-05, DEC-05, SPEC-09）。

## 需求
1. `.opencode/agents/*.md` 統一加入 YAML Front-matter：
   ```yaml
   agent_version: "1.2.0"
   last_updated: "2026-08-03"
   change_log:
     - "v1.2.0: 新增反饋規則自動套用段落"
     - "v1.1.0: 修正 SOP 4.3 路徑引用"
   rollback_to: "v1.1.0"
   ```
2. `apply_feedback.py` 新增：
   - `--dry-run`：預覽變更
   - `--generate-rc`：產生 `prompts/{agent}/v{ver}-rc.{n}.md`
   - `--promote`：`current` symlink 指向穩定版
   - `--rollback`：回退至 `rollback_to` 版本
3. CLI `twin canary <agent> <version> --action deploy|promote|rollback`

## 驗收標準
- [x] `apply_feedback.py --generate-rc` 產生 rc 版本（dry-run 預覽 v1.1.0-rc.2 + 既有 v1.1.0-rc.1）
- [x] `twin canary deploy/promote/rollback` 正常運作（實機走完整流程）
- [x] `current` symlink 正確指向穩定版（rollback 後回 v1.0.0.md）

## 備註
- 交付：`agent_versioning.py`（SemVer front-matter / prompts/{agent}/ 版本目錄 / canary action）、`apply_feedback.py` 整合 --generate-rc/--promote/--rollback、`twin` canary 子命令、4 個 agent 檔已初始化 v1.0.0。
- 測試：`tests/test_agent_versioning.py` 11 tests；全套 60 passed + 1 skipped。

## 參考
- v3 討論 DEC-05 / SPEC-05, SPEC-09 / DeepSeek 第 1 輪建議 6, 第 2 輪建議 2.8
