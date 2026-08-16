---
github_issue: null
title: URL/環境變數常數收斂至 config（embedding/telegram/REDIS──消除硬編碼與重複）
type: refactor
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-17'
spec_version: v3
---
# T054 - URL/環境變數常數收斂至 config

## 目標
2026-08-11 審查發現硬編碼與常數重複：
- embedding.py:143-144 硬編 `OPENAI_API_KEY` + `https://api.openai.com/v1`（未走 config）
- embedding.py:180 硬編 ollama `http://localhost:11434`（config 已有 OLLAMA_URL）
- auto_develop.py:1230 硬編 openrouter chat URL；:1143/1185/1422-1423 `OPENROUTER_API_KEY` ×4
- `REDIS_URL = redis://localhost:6379/0` 預設重複 3 次（worker.py:41、telegram_bot.py:57、doctor.py:187）
- Telegram `sendMessage` URL 重複 2 次（worker.py:200、discussion_orchestrator/orchestrator.py:460）

## 驗收標準
- [x] config.py 新增：OPENAI_API_URL、TELEGRAM_SEND_URL 等常數（env 可覆寫，附預設）
- [x] embedding.py / auto_develop.py / worker.py / telegram_bot.py / doctor.py / orchestrator.py
  全改走 config 常數；`rg "api.openai.com|api.telegram.org|redis://localhost"`（非 config/測試）無殘留
- [x] 行為不變：env 值與現況預設一致時輸出相同；telegram_bot/worker/doctor 測試維持通過
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過；不引入新依賴

## 備註
- 只收斂常數位置，不改各檔讀取時機（getenv 於 module import 時讀取即可）
- api_base 在 models.yaml 已有定義（api_base 欄位），openrouter URL 可優先引自該處避免雙源

## 完成備註（2026-08-12）
- config.py 新增 TELEGRAM_SEND_URL（{token} 佔位符）/ OPENAI_API_URL / REDIS_URL /
  OPENROUTER_API_URL（預設由 models.yaml nemotron api_base 組合）
- 收斂對象：embedding.py（Embedding_BASE 退路 + Ollama）／worker.py（REDIS + sendMessage）／
  telegram_bot.py（REDIS）／doctor.py（check_redis）／orchestrator.py（sendMessage）／
  providers.py（openrouter chat URL，T051 拆分後原 auto_develop.py:1230 的位置）
- 殘留為文字說明（非 Python 常數重複）：docs/deployment/telegram-bot.md 預設值、
  scripts/*.sh 的 REDIS_URL shell 預設、docker-compose.prod.yml 的 setWebhook 註解範例
- pytest 全量：182 passed + 1 skipped；ruff 全過