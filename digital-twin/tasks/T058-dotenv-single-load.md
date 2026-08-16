---
github_issue: null
title: dotenv 選用載入收斂（9 處重複 → config 單次）
type: refactor
priority: low
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-12'
commit: dbfa18c
---
# T058 - dotenv 選用載入收斂

## 目標
審查統計 `try: from dotenv import load_dotenv; load_dotenv() except ImportError: pass`
模式重複 9 處（worker.py:35-36、doctor.py:33-34、auto_develop.py:55-56、
telegram_bot.py:31-32/100-101/193-194、embedding.py:34-35、config.py:28-29、
consensus_eval.py:22-23）。config.py 於 import 時已載入一次（:28-29），
其餘模組在「未 import config」時重複載入屬冗餘。

## 驗收標準
- [x] 各腳本保留「獨立執行不依賴 config」能力的前提下，移除重複載入；
  需 env 的腳本統一改為 import config（或 config 提供 ensure_dotenv() 供顯式呼叫）
- [x] `rg "load_dotenv"`（非 config.py / 非必要獨立腳本）無冗餘殘留
- [x] telegram_bot / worker / doctor 可獨立執行且 env（如 .env 中的 REDIS_URL）仍生效
  （以現有測試 + 手動 `--help`/離線執行確認）
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- 警惕 import 循環：config 不被討論串/worker 反向 import 時才可直接 import config
- telegram_bot 的三段選用載入（:31/100/193）與其 lazy import 結構有關，收斂時保留 lazy 語意

## 完成備註（2026-08-12）
- config.py 新增 ensure_dotenv()（冪等單次載入），import 時期呼叫即為唯一載入點
- 移除 worker/telegram_bot/auto_develop/doctor/embedding/consensus_eval 6 處重複
  try→load_dotenv 區塊（consensus_eval 經 multi_ai_discuss→config 連鎖載入）
- rg 驗證僅 config.py 殘留 load_dotenv；6 模組獨立 import 皆成功、.env 生效
- pytest 全量 192 passed + 1 skipped；ruff 全過