---
github_issue: 
title: router 429 冷卻尊重上游 Retry-After
type: feature
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T113 - Retry-After 支援

## 目標
429 冷卻原本固定 60 秒，忽略上游的 Retry-After hint。

## 驗收標準
- [x] forward() 回傳值新增 retryAfter duration
- [x] ParseRetryAfter() 支援 delay-seconds 與 HTTP-date 兩種格式，非法/過去時間回 0
- [x] 429 時 cooldown 取 max(RateLimitCooldown, retryAfter)
- [x] MaxRateLimitCooldown = 5 分鐘上限，防敵意 upstream 無限冷卻
- [x] forwardPollinationsText 簽名同步更新
- [x] TestParseRetryAfter / TestRateLimitCooldownCap 通過

## 備註
commit 8615502。
