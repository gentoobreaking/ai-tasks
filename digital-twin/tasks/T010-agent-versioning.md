---
status: in-progress
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-04'
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
- `apply_feedback.py --generate-rc` 產生 rc 版本
- `twin canary deploy/promote/rollback` 正常運作
- `current` symlink 正確指向穩定版

## 參考
- v3 討論 DEC-05 / SPEC-05, SPEC-09 / DeepSeek 第 1 輪建議 6, 第 2 輪建議 2.8