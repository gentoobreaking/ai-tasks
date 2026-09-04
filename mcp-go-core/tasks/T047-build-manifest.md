---
github_issue: N/A
title: P7 - Build Manifest Generation
type: feat
priority: medium
status: done
updated: 2026-09-04
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

- [x] `dist/build-manifest.json` 包含: application, version, profile, features, modules, go_version, framework_version, git_commit, feature_lock_hash, binary_size
- [x] `dist/features.lock` copy 到 dist/
- [x] `dist/checksums.txt` 包含 sha256 of server binary
- [x] `BUILD-002` test: manifest exists
- [x] `BUILD-003` test: features.lock in dist 與 build input 一致
- [x] `BUILD-004` test: checksum matches
- [x] `go test ./internal/manifest/...` 成功

## 備註

Production builds should record framework version, Go version, git commit, feature lock hash, build timestamp, build profile. Prefer deterministic timestamps.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
