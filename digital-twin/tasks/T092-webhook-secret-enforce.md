---
github_issue: N/A
title: Telegram webhook secret 強制化（生產模式 fail-fast）
type: security
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T092 - Telegram webhook secret 強制化

## 目標
telegram_bot.py:385 目前的 webhook secret 校驗是「有設才驗」：未設定
TELEGRAM_WEBHOOK_SECRET 時維持原行為（T070 向後相容）。但 RBAC 判定依據的是
Update body 內的 from.id（telegram_bot.py:69-76），secret 未設定時任何人 POST
偽造 JSON、填入 admin ID 即可繞過 RBAC 下達 /discuss。這不是相容模式，
是認證旁路。

實作：
1. bot 啟動（lifespan/startup）偵測：webhook 模式下 TELEGRAM_WEBHOOK_SECRET
   未設定 → log.critical + raise 中止啟動（fail-fast）
   - 逃生門：明確設 ALLOW_INSECURE_WEBHOOK=1 才允許降級啟動
     （降級時每筆請求 log.warning，方便本地開發）
2. docs/deployment/telegram-bot.md：secret 標注為必要部署變數；
   .env.example 同步加註解說明
3. 測試：未設 secret 啟動應失敗；ALLOW_INSECURE_WEBHOOK=1 可啟動；
   secret 不符回 401（既有測試補強）

## 驗收標準
- [ ] webhook 模式無 secret 無法啟動（有 CRITICAL log 說明原因）
- [ ] 明確逃生門 env flag 存在且有文件
- [ ] tests/test_telegram_bot.py 涵蓋上述行為
- [ ] docs/deployment/telegram-bot.md 與 .env.example 更新

## 備註
- 破壞性變更：自架用戶升級後未設 secret 會啟動失敗 —— release note 需顯著標注
- RBAC 白名單仍是第二層防護（viewer 只能看），但 admin ID 屬可猜測目標，
  不可作為唯一防線
## 備註（2026-08-24 執行進度）
- 程式碼/測試/部署文件已完成並 commit（ee07084）
- **待辦**：`.env.example` 更新被沙箱 denyWrite(.env.*) 阻擋，待使用者放行後補上：
  在 TELEGRAM_WEBHOOK_SECRET 加註「T092 必要、未設定拒絕啟動」，並新增 ALLOW_INSECURE_WEBHOOK= 說明


- 2026-08-24 補完：.env.example 已由使用者手動套用並 commit，任務完成
