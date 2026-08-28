---
github_issue: ""
title: 人類易讀的 alert 訊息
type: feature
priority: medium
status: pending
depends_on: []
assignee: pi
created: 2026-08-28
updated: 2026-08-28
---

# T019 - 人類易讀的 alert 訊息

## 目標
重寫 `AlertManager` 發送給 Telegram / Discord / Email 的訊息格式，讓一般人在收到通知時能一眼看懂「哪個金屬、漲或跌、變動多少、現在價格、何時、來源」，並清楚區分「價格異常警告（非 alert）」與「超閾值 alert」。

## 驗收標準
- [ ] 超閾值 alert 訊息含：金屬中文名、方向（↑/↓）、絕對值 + 百分比變動、閾值、現價、報價時間、資料來源。
- [ ] 交叉驗證「資料異常」警告明確標示「僅警告、未觸發 alert」，並給出雙方價差。
- [ ] 同一則訊息在 Telegram / Discord / Email 皆能正常呈現（Telegram 需正確跳脫 markdown，避免 `_`/`*` 被當作格式）。
- [ ] 訊息長度在頻道限制內（Telegram 4096、Discord 2000）；過長時摘要而非截斷。
- [ ] 現有 `tests/test_03_local_alert.py`、`test_07_intl_alert.py` 仍通過（訊息結構變動需同步更新斷言或改為只驗證關鍵欄位）。

## 備註
- 區分「content 模板」與「頻道傳送」：模板產生純文字/通用結構，各頻道再轉譯（Telegram markdown、Discord embed、Email HTML/純文字）。
- 注意不把 secrets 帶入訊息（如 bot_token）。
