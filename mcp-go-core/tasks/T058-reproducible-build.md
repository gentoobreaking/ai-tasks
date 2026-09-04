---
github_issue: N/A
title: P8 - Reproducible Build Verification
type: test
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T057
- T038
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T058 - P8: Reproducible Build Verification

## 目標

驗證 reproducible build: 相同 source + Go version + framework version + feature lock + build config → 相同 output。

## 驗收標準

- [ ] `REP-001` test: 同一 git commit build A/B → features.lock, generated source, build manifest, binary checksum 相同
- [ ] `REP-002` test: 相同 mcp.yaml/profile/dependency lock → same feature graph, same generated composition
- [ ] Build metadata: source, config, commit, feature lock 作為 reproducibility identity
- [ ] Prefer deterministic timestamps (exclude build timestamp from hash)
- [ ] `go test ./tests/reproducibility/...` 成功

## 備註

對應 build_pipeline_spec §37 Reproducible Build, §38 Cache, §39 Incremental Build, §40 Build Cache Key。
