---
id: T065
github_issue: ""
title: LLM 宏觀敘事每日摘要 (替換 mock 情緒)
project: gold-analysis
type: feature
priority: low
status: pending
depends_on: [T056]
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T065 - LLM 宏觀敘事每日摘要 (替換 mock 情緒)

## 目標
`tools/data_tools.get_sentiment_data()` 目前回傳假情緒。需接真實新聞/情緒來源，並由 LLM 生成每日宏觀敘事摘要（markdown/PDF），供 fundamental 分析與使用者在 `Summary` 頁閱讀。

## 驗收標準
- [ ] 接真實新聞/情緒資料源（參考 T056）
- [ ] LLM 生成每日黃金宏觀敘事（利率/美元/地緣/ETF 資金流），附資料來源與信心標註
- [ ] 產出 markdown（可選 PDF）並存檔/推送（接 T056 通知）
- [ ] 前端 `Summary` 頁展示最新摘要
- [ ] 補測試：mock LLM/資料源驗證管線可跑、失敗可優雅降級

## 備註
- 依賴 T056（真實資料與通知 sink）。
- 注意 LLM 輸出需標註「非投資建議」與資料時間。
