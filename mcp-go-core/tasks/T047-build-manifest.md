---
github_issue: N/A
title: P7 - Build Manifest Generation
type: feat
priority: medium
status: pending
depends_on:
- T040
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T047 - P7: Build Manifest Generation

## 目標

產生 `dist/build-manifest.json` 與 `checksums.txt`。

## 驗收標準

- [ ] `dist/build-manifest.json` 包含: application, version, profile, features, modules, go_version, framework_version, git_commit, feature_lock_hash, binary_size
- [ ] `dist/features.lock` copy 到 dist/
- [ ] `dist/checksums.txt` 包含 sha256 of server binary
- [ ] `BUILD-002` test: manifest exists
- [ ] `BUILD-003` test: features.lock in dist 與 build input 一致
- [ ] `BUILD-004` test: checksum matches
- [ ] `go test ./internal/manifest/...` 成功

## 備註

Production builds should record framework version, Go version, git commit, feature lock hash, build timestamp, build profile. Prefer deterministic timestamps.
