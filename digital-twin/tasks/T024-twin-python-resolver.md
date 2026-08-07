---
title: twin CLI 智慧選擇 Python 直譯器（解決無 Key 假象）
type: fix
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-05
updated: 2026-08-05
---

# T024 - twin CLI 智慧選擇 Python 直譯器

## 目標
修復 `./twin status` 顯示「無 Key」假象：`twin` 的 `PYTHON_BIN = sys.executable` 指向 QClaw python（無 dotenv），導致子腳本讀不到 .env，即使 GEMINI/DEEPSEEK/OPENROUTER Key 已設定也顯示 ❌。

## 驗收標準
- [x] `twin` 新增 `_resolve_python()`：優先使用已有依賴的直譯器，否則依序嘗試 `/opt/homebrew/bin/python3`、`/usr/local/bin/python3`、`/usr/bin/python3`（以能 import dotenv,yaml 為準）
- [x] `./twin status` 正確顯示 nemotron/gemini/deepseek ✅（三把 Key）、grok ⚠️ 手動
- [x] 保持對無依賴環境的相容（全部失敗時退回 sys.executable）

## 備註
- 同時修正 `spec_auto_merge.py` 的 version 前綴 bug（`f"v{version}"` 造成 `vv2`），現接受 `v2` 或 `2`
- 修正 `spec_auto_merge.py` review 表頭硬編碼「Claude」→「Nemotron」（配合 T011 改名）
