---
github_issue:
title: Go Module Scaffolding & CLI Entry Point
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T001 - Go Module Scaffolding & CLI Entry Point

## 目標
Initialize the Go module `github.com/freemodel/router` with Go 1.23, set up the `cmd/freemodel/main.go` CLI entry point with argument parsing and command dispatch, and create the `VERSION` file. Establish the basic directory structure (`internal/`, `data/`) per the architecture spec (§2).

## 驗收標準
- [x] `go.mod` created with module path `github.com/freemodel/router` and Go 1.23
- [x] `go.sum` with `golang.org/x/term v0.31.0` dependency
- [x] `VERSION` file with initial version string (e.g., `v0.1.0`)
- [x] `cmd/freemodel/main.go` with basic CLI dispatch (default TUI, `start`, `--best`, `--help`, `--version`)
- [x] Directory structure matches spec: `internal/{config,providers,models,ping,router,tui,targets,cli}/` and `data/`
- [x] `go build` compiles successfully

## 備註
- Only `golang.org/x/term` is the sole non-stdlib dependency (§2, Requirement #1)
- Follow spec §14.1 for module definition
