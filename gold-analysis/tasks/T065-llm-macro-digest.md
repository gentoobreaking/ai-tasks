---
id: T065
github_issue: ""
title: LLM 宏觀敘事每日摘要 (替換 mock 情緒)
project: gold-analysis
type: feature
priority: low
status: done
depends_on: [T056]
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T065 - LLM 宏觀敘事每日摘要 (替換 mock 情緒)

## 目標
`tools/data_tools.get_sentiment_data()` 目前回傳假情緒。需接真實新聞/情緒來源，並由 LLM 生成每日宏觀敘事摘要（markdown/PDF），供 fundamental 分析與使用者在 `Summary` 頁閱讀。

## 驗收標準
- [x] 接真實新聞/情緒資料源（參考 T056）→ `get_sentiment_data()` 真實 alternative.me（T056 已改，本任務沿用）
- [x] LLM 生成每日黃金宏觀敘事（利率/美元/地緣/ETF 資金流），附資料來源與信心標註
- [x] 產出 markdown 並存檔（JSON+MD）/ 可推送（接 T056 notify_alert）
- [x] 前端 `Summary` 頁展示最新摘要（含重新生成按鈕）
- [x] 補測試：mock LLM/資料源驗證管線可跑、失敗可優雅降級（5 passed）

## 實作摘要 (commit 於 T065)
- `app/core/config.py`：CORE_LLM_ENABLED/API_KEY/BASE_URL/MODEL/TEMPERATURE 設定
- `app/services/llm_client.py`：OpenAI-compatible /v1/chat/completions 客戶端（httpx，無重依賴），env-gated，失敗轉 LLMUnavailableError
- `app/services/macro_digest.py`：管線 = 真實情緒 + 近期金價 -> prompt -> LLM markdown -> 存檔 + 推送；LLM 不可用時以真實資料降級；敘事必含「非投資建議」與「資料時間」
- `app/api/schemas/macro_digest.py` + `app/api/routes/macro_digest.py`：POST /api/macro/generate、GET /api/macro/latest（掛載於 main.py）
- `frontend/src/services/api.ts` + `Summary.tsx`：digest 取用與展示
- `tests/test_macro_digest.py`：5 passed（含優雅降級、免責聲明、sentiment 失效降級）

## 注意（非本次回歸，依指示不處理）
- pi-lens/ruff 持續報的 `could not be resolved` 為鏡像使用舊系統直譯器（非 .venv）之假陽性；T059 lint 債（model_monitor.py 的 Dict→dict、utcnow、blind except 等）為先前回合既有，非本次引入。

## 備註
- 依賴 T056（真實資料與通知 sink）。
- 注意 LLM 輸出需標註「非投資建議」與資料時間。
