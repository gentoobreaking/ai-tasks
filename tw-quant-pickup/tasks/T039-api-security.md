---
github_issue: 
title: API 安全強化（認證 / 限流 / 指標端點）
type: feat
priority: high
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-24
---

# T39 - API 安全強化（認證 / 限流 / 指標端點）

## 目標
新增選用 API Key 認證（TWQUANT_API_KEY，未設定則開放）與 IP 滑動視窗限流（TWQUANT_RATE_LIMIT，預設 120/min）；掛上 /metrics Prometheus 端點讓既有 monitoring.Monitoring 發揮作用。

## 驗收標準
- [x] api/middleware.py：認證 + 限流 middleware，豁免 /health*、/metrics、/docs
- [x] 限流超額回 429 + Retry-After
- [x] /metrics 回傳 exposition 格式
- [x] 6 個 middleware 單元測試

## 備註
單程序記憶體限流；多 replica 部署建議改 Redis 或 ingress 層限流。
