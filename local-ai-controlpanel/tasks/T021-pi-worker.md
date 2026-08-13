---
github_issue: N/A
title: Worker Interface + Pi Worker + llama.cpp 串接（Phase 1）
type: feature
priority: high
status: pending
depends_on: [T005, T008]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T021 - Worker Interface + Pi Worker

## 目標

依 spec §15（Worker Interface）/ §16（Pi Worker）：定義 `CodingWorker`（initialize / execute / interrupt / shutdown）與 `WorkerRequest`（task + evidence + plan + executionPolicy + workspace）；實作 Pi Worker adapter，經 OpenAI-compatible API 串接 llama.cpp 本地模型。

## 驗收標準

- [ ] `CodingWorker` / `WorkerRequest` / `WorkerResult` 型別（§15）實作
- [ ] Pi Worker 只收到 Evidence Bundle + plan，**無任何 web search capability**（§16 責任邊界）
- [ ] llama.cpp OpenAI-compatible endpoint（base URL + model 名稱設定化）可呼叫
- [ ] interrupt 可中止進行中的 execute
- [ ] evidence 內容以 `evidence` 欄位傳遞（§16 contract JSON 雛形）
- [ ] 以 stub/直撥快速路徑先讓 `Task → Worker → Patch` 最小 pipeline 跑通

## 備註

- 模型名稱不是 dependency（§16），由 config 指定（`policies/default.yaml` execution.model）。
- Pi 尚未安裝時，先用實作同一 interface 的 stub worker 讓 pipeline 可測（Q8 之後才需要真正 A/B）。
- llama.cpp 需提供 OpenAI-compatible server 模式（`llama-server`）。