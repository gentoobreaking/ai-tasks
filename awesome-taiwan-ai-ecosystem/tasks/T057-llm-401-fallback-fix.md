---
github_issue: N/A
title: 修復 LLM API 401 — 模型名 typo 與 Docker 環境錯配
type: fix
priority: high
status: done
depends_on: [T035]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T057 - 修復 LLM API 401 — 模型名 typo 與 Docker 環境錯配

## 目標

修復 `./crawler crawl --source github --workers 1 --max-per-source 100` 產生大量 `classify_error API error 401: Model ... is not supported` 的系統性故障：`opencode/` 前綴錯誤、`opencopen` 筆誤、Docker 未透傳 `OPENAI_BASE_URL/MODEL`、401 無分流與無熔斷導致日誌刷屏與線性放大。

對應 `local://audit-llm.md`。

## 驗收標準

- [x] `internal/classify/llm.go:llmModels` 修正為無前綴 `["muse-spark-1.2-contributor-free","nemotron-3-ultra-free"]`（保留註解：opencode.ai/zen/v1 需 bare ID）
- [x] `NewLLMClassifier` 支援 `OPENAI_MODEL` 覆蓋（trim 後覆蓋 `llmModels`），`baseURL` 冪等處理（已含 `/chat/completions` 則不重複拼接），預設 `https://api.openai.com/v1` 保持
- [x] 定義 `type AuthError struct` 與 `IsAuthError`，`callLLM` 對 `401/403` Body 嗅探 `AuthError/invalid_api_key/Invalid API key` 回 `AuthError` 哨兵，`ModelError` 回普通 error，僅 `429/5xx` 視為可重試
- [x] `Classify` 對 `AuthError` 直接 `break` 不試第二模型；`llmModels` fallback 僅對 `ModelError` 生效
- [x] `internal/crawler/coordinator.go` 對 `AuthError` 改 `Warn`（`auth_failure, consecutive`），連續 3 次同類 401 熔斷 `circuit_open` 跳過剩餘 LLM 候選（`fallback T2`），結尾 `Warn circuit_open_summary`
- [x] `docker-compose.yaml` 補齊透傳 `OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://opencode.ai/zen/v1}` 與 `OPENAI_MODEL=${OPENAI_MODEL:-}`（現含 3 OPENAI_* + GITHUB_TOKEN）
- [x] `README.md`/`README.zh-TW.md` 更新 `OPENAI_MODEL` 說明為正確 bare fallback 鏈
- [x] httptest 驗證：`AuthError` 僅 1 請求（不 fallback）、`ModelError` 2 請求且第二模型成功、`OPENAI_MODEL` 覆蓋生效、`baseURL` 冪等；`go vet` 與 `go test ./internal/classify ./internal/crawler ./...` 全量 23 包 PASS

## 備註

- 實測 `GET /models` 71 個模型，僅 bare ID 200，`opencode/...` 全 401；`muse-spark` 偶發 500 需 fallback
- 100 候選中約 40-70% 落入 `20≤score≤55` → 50-120 HTTP，已由熔斷限流
- `maxRetries=3` 欄位原未讀，現保留註解說明僅 429/5xx 重試
