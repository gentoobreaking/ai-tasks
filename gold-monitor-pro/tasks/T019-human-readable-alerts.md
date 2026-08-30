---
github_issue: ""
title: 人類易讀的 alert 訊息
type: feature
priority: medium
status: done
depends_on:
  - T014
assignee: "pi with opencode"
created: 2026-08-28
updated: 2026-08-30
---

## 目標
重寫 `AlertManager` 發送給 Telegram / Discord / Email 的訊息格式，讓一般人在收到通知時能一眼看懂「哪個金屬、漲或跌、變動多少、現在價格、何時、來源」，並清楚區分「價格異常警告（非 alert）」與「超閾值 alert」。

## 驗收標準

- [x] 超閾值 alert 訊息含：金屬中文名、方向（↑/↓）、絕對值 + 百分比變動、閾值、現價、報價時間、資料來源
- [x] 交叉驗證「資料異常」警告明確標示「僅警告、未觸發 alert」，並給出雙方價差
- [x] 同一則訊息在 Telegram / Discord / Email 皆能正常呈現（Telegram 需正確跳脫 markdown，避免 `_`/`*` 被當作格式）
- [x] 訊息長度在頻道限制內（Telegram 4096、Discord 2000）；過長時摘要而非截斷
- [x] 現有 `tests/test_03_local_alert.py`、`test_07_intl_alert.py` 仍通過（訊息結構變動需同步更新斷言或改為只驗證關鍵欄位）

## 執行紀錄
- AlertManager.format_alert() 重寫為人類易讀格式
- 區分 content 模板與頻道傳送
- Telegram markdown 跳脫處理
- 現有測試同步更新斷言