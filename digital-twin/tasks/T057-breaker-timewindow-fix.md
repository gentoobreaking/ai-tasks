---
github_issue: null
title: worker AIBreaker 熔斷時間窗語意修正（或改用 pybreaker 官方 async 語意）
type: fix
priority: low
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-12'
commit: d6cdfff
---
# T057 - worker AIBreaker 熔斷時間窗語意修正

## 目標
2026-08-11 審查發現 worker.py:68-95 AIBreaker 包裝自行重實作熔斷判定：
`is_open` 只看 `fail_counter >= fail_max`（:83），不看 reset_timeout 時間窗
（pybreaker 本體以 timestamp 判定開路後何時半開/關閉）。
file 內註解自承「行為與 pybreaker 一致」但實作偏離——fail_counter 永不衰減時，
一旦連續失敗滿 fail_max 將永久視為開路，與 pybreaker 60s 後恢復的設計不符。

## 驗收標準
- [x] 判定與 pybreaker 官方語意一致：開路後經過 reset_timeout 恢復（或半開重試），
  fail_counter 隨時間衰減／恢復重計
- [x] 新增單元測試：連續失敗 fail_max 次 → 開路；模擬時間推進 reset_timeout → 恢復可呼叫
  （不觸網，不需 Redis/AI）
- [x] worker 現有行為不變：熔斷後仍標記任務失敗並 notify 使用者
- [x] pytest 全量維持 151 passed + 1 skipped；ruff 全過

## 備註
- 若 pybreaker 2.x 有 async 官方 API 可直接使用，優先改用（刪除自寫狀態）；否則以
  monotonic timestamp 修正 is_open 判定
- 保持 thread-safety：worker 池 4 並發共用 breaker

## 完成備註（2026-08-12）
- 評估：pybreaker 2.x 官方 async API（call_async）需 tornado（未安裝），故採
  monotonic timestamp 修正路線；開路判定改為 current_state==OPEN 且未過 reset_timeout
- success/failure 改走 breaker.call() 官方狀態機（RLock，thread-safe）：成功重計、
  半開失敗重開路
- 新增 2 個單元測試（連敗開路＋時間推進恢復；半開失敗重新開路），不觸網
- pytest 全量 192 passed + 1 skipped（+1）；ruff 全過