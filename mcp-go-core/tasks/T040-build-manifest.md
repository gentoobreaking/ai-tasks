---
github_issue: N/A
title: P6 - Build Manifest Generation
type: feat
priority: high
status: pending
depends_on:
- T039
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T040 - P6: Build Manifest Generation

## 目標

產生 `dist/build-manifest.json` 包含 build metadata。

對應 spec §4.6, build_pipeline_spec §20, §53 Build Artifact Layout, algs/build-pipeline.md, agent_tasks TASK-088。

## 驗收標準

- [ ] `dist/build-manifest.json` 建立
- [ ] Manifest 包含: application name, version, profile, features, modules, go_version, framework_version, git_commit, feature_lock_hash, binary_size
- [ ] JSON 格式正確可 parse
- [ ] `dist/features.lock` 複製到 dist/
- [ ] `dist/checksums.txt` 建立 (sha256 of server binary)
- [ ] `BUILD-002` test: build-manifest.json exists
- [ ] `BUILD-003` test: features.lock in dist matches build input
- [ ] `BUILD-004` test: sha256sum dist/server matches checksums.txt
- [ ] `go test ./internal/manifest/...` 成功

## 備註

Production builds should record: Framework version, Go version, Git commit, Feature lock hash, Build timestamp, Build profile. Prefer deterministic timestamps.
