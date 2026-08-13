---
github_issue: N/A
title: Artifact Controller（Phase 2）：patch 驗證 / apply / rollback
type: feature
priority: high
status: pending
depends_on: [T010, T021]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T011 - Artifact Controller

## 目標

依 spec §20：Patch 不能直接寫 filesystem——`Worker → Proposed Patch → Artifact Controller → Policy Validation → Git Diff Validation → Filesystem Apply`；實作 `validate / apply / rollback` 並記錄 patches 表。Worker 無法繞過（Rule 2）。

## 驗收標準

- [ ] `validate(patch, policy)`：forbidden 檔（.git/**、.env、secrets/**）一律 ArtifactViolation
- [ ] 非 allowed 路徑的修改被阻擋（UnauthorizedModification）
- [ ] readonly 檔（package-lock.json 等）拒絕修改
- [ ] `apply` 以 git diff 格式套用並記錄（patches 表，§27 慣例）
- [ ] `rollback(patchId)` 可回復
- [ ] tests：三種違規（forbidden / 未授權 / readonly）全被阻擋

## 備註

- validate 規則即 §20 python 範例的 TS 版：`if file in policy.forbidden: raise`。
- Cloud Worker（Phase 9+）需通過同一套 Artifact Policy（Rule 2 延伸，§20 v0.4 註記）——此任務只留介面，Cloud 無涉。