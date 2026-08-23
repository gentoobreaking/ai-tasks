---
github_issue: N/A
title: Redis Stream 可靠度 — pending 救援、maxlen 上限與 graceful shutdown
type: fix
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T093 - Redis Stream 可靠度補強

## 目標
worker.py 的消費迴圈目前只有 XREADGROUP + XACK，缺三塊生產級可靠度機制：

1. **pending 救援（PEL recovery）**：worker 若在「handler 完成、xack 之前」崩潰，
   訊息永久卡在 PEL —— 不重送也不清理。實作週期性 XAUTOCLAIM（或 XPENDING +
   XCLAIM）：idle 超過門檻（如 60s）的訊息認領重送，並記錄 delivery count，
   超過上限（如 5 次）轉入死信處理（log.error + Telegram 推播 + XACK 丟棄或
   移入 twin:tasks:dead stream）
2. **Stream 長度上限**：telegram_bot.py:114 的 xadd 未設 maxlen —— Stream 無限
   成長。加上 maxlen（如 10000，近似精簡修剪）或 MAXLEN~ 估算
3. **graceful shutdown**：worker.py:166 的 while True 無 signal 處理，SIGTERM 直接
   砍掉進行中任務。註冊 signal handler：停止 xreadgroup → 等待當前 handler 完成
   （含逾時保護）→ 正常離開；docker-compose.prod.yml 確認 stop_grace_period 配合

## 驗收標準
- [ ] 模擬 worker 崩潰後遺留的 pending 訊息，會被存活 worker 自動認領重跑
- [ ] delivery count 超限的訊息有明確死信路徑（不無限重試）
- [ ] xadd 有 maxlen；長時間運行 Stream 不無限成長
- [ ] docker stop / SIGTERM 後 worker 完成手邊任務才退出（有測試或手動驗證紀錄）
- [ ] tests/test_telegram_bot.py 或新增 worker 測試涵蓋 claim/dead-letter 邏輯

## 備註
- redis-py asyncio 版有 xautoclaim API；block=5000 的讀取迴圈與 shutdown 訊號
  共存時注意最長 5 秒延遲可接受
- 死信策略建議先做「通知 + 保留在 dead stream」而非直接丟棄，方便人工排查
