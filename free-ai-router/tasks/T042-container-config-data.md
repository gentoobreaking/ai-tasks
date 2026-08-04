---
github_issue:
title: 'Fix: container config volume + data dir resolution'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T042 - Fix: docker-compose volume mismatch + broken Docker image

## 目標
Two container bugs:
1. `docker-compose.yml` mounts `/root/.config/freemodel-router` but the config now lives at `~/.freemodel-router.json` (T028 change) — config persistence silently broken.
2. The Dockerfile only copies the binary; `providers.DataDir()` resolves the data dir from compile-time `runtime.Caller` path which doesn't exist in the container → `LoadSources`/`LoadScores` fail at startup → image broken.

## 驗收標準
- [ ] `providers.DataDir()` falls back to `<executable-dir>/data` when the source path doesn't exist (so `/usr/local/bin/data` works in the image)
- [ ] Dockerfile copies `data/` into the image (`/usr/local/bin/data`)
- [ ] docker-compose mounts the config file: `./freemodel-config.json:/root/.freemodel-router.json`
- [ ] Unit test: DataDir() returns an existing dir when called (source path exists in dev); env override `FREEMODEL_DATA_DIR` honored
- [ ] `go build`, `go test ./...` pass

## 備註
- 若需在容器建 image：`docker build -t freemodel-router .` 後 `docker run --rm freemodel-router --version` 可驗證啟動
