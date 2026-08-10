---
github_issue: null
title: worker AIBreaker 熔斷時間窗語意修正（或改用 pybreaker 官方 async 語意）
type: fix
priority: low
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T057 - worker AIBreaker 熔斷時間窗語意修正

## 目標
2026-08-11 審查發現 worker.py:68-95 AIBreaker 包裝自行重實作熔斷判定：
`is_open` 只看 `fail_counter >= fail_max`（:83），不看 reset_timeout 時間窗
（pybreaker 本體以 timestamp 判定開路後何時半開/關閉）。
file 內註解自承「行為與 pybreaker 一致」但實作偏離——fail_counter 永不衰減時，
一旦連續失敗滿 fail_max 將永久視為開路，與 pybreaker 60s 後恢復的設計不符。

## 驗收標準
- [ ] 判定與 pybreaker 官方語意一致：開路後經過 reset_timeout 恢復（或半開重試），
  fail_counter 隨時間衰減／恢復重計
- [ ] 新增單元測試：連續失敗 fail_max 次 → 開路；模擬時間推進 reset_timeout → 恢復可呼叫
  （不觸網，不需 Redis/AI）
- [ ] worker 現有行為不變：熔斷後仍標記任務失敗並 notify 使用者
- [ ] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- 若 pybreaker 2.x 有 async 官方 API 可直接使用，優先改用（刪除自寫狀態）；否則以
  monotonic timestamp 修正 is_open 判定
- 保持 thread-safety：worker 池 4 並發共用 breaker