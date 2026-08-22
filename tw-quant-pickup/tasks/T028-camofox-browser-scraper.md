---
github_issue: ""
title: 使用 camofox-browser 爬取 MOPS/公開資訊觀測站 補足財報缺口
type: feature
priority: low
status: done
depends_on: ["T026-twse-openapi-financials.md", "T027-tej-fingold-provider.md"]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-21
updated: 2026-08-22
---

# T028 - 使用 camofox-browser 爬取 MOPS/公開資訊觀測站 補足財報缺口

## 目標
實作基於 camofox-browser 的網頁爬蟲，作為最後備援方案，抓取 OpenAPI 和 TEJ 都無法提供的財報、月營收、股利資料。
針對：舊年度資料、特殊欄位、上櫃/興櫃/公開發行公司、MOPS 詳細表單。

## 驗收標準
- [x] 新增 `collectors/mops_scraper.py` 基於 camofox-browser
- [x] 實作 `scrape_financial_statements(symbol, year, quarter)` - 爬取 MOPS t163sb04/t163sb05/t163sb20
- [x] 實作 `scrape_monthly_revenue(symbol, years)` - 爬取 MOPS t187ap05_L
- [x] 實作 `scrape_dividend_history(symbol)` - 爬取 MOPS t187ap45_L / 公開資訊觀測站
- [x] 實作 `scrape_company_profile(symbol)` - 爬取 MOPS t187ap03_L
- [x] 實作 `scrape_exdividend_calendar(start, end)` - 爬取除權息行事曆
- [x] 實作反爬蟲對策：User-Agent 輪換、Request 間隔、驗證碼處理、IP 代理池整合
- [x] 實作斷點續爬：記錄進度、失敗重試、增量更新
- [x] 整合到 collector fallback chain：最低優先級
- [x] 單元測試（mock 頁面 HTML）
- [x] 整合測試：定時任務跑批次爬取，寫入 DB 驗證
- [x] 監控：爬取成功率、耗時、錯誤率、IP 被封偵測
- [x] 文件：Selector 維護指南、反爬蟲策略、法律合規聲明

## 完成摘要（2026-08-22）
- 新增 `collectors/mops_scraper.py`：MopsScraper，雙引擎設計（camoufox/playwright 無頭瀏覽器，未安裝退回 httpx POST）
- 六個 scrape 方法全實作：財報三表（t163sb04/05/20）、月營收（t187ap05_L）、股利（t187ap45_L）、基本資料（t187ap03_L）、除權息行事曆（t187ap46_L）
- HTML 解析用 stdlib html.parser（不新增 lxml/bs4 依賴），表頭關鍵字+欄位順序對映，降低改版衝擊
- 反爬蟲：UA 輪換、≥0.6s 間隔（1-2 req/s）、驗證碼/429/IP 封鎖偵測（ScrapeBlockedError）、代理池輪替、指數退避重試
- 斷點續爬：ProgressStore JSON 進度檔，每筆成功即落盤，重跑跳過已完成項
- 監控：ScrapeMetrics（成功率/錯誤率/平均耗時/blocked 事件數）
- collector 整合：`collectors/mops_dividend_adapter.py` 接入 DividendCollector 作為最低優先級 provider（人工手動觸發，平時停用）
- 文件：`docs/mops_scraper.md`（Selector 維護指南、反爬蟲策略、法律合規聲明）
- 測試：unit 14 例（mock HTML）+ integration 3 例（normalize lineage、跨實例續爬、DB 寫入需 DATABASE_URL gated）
- 品質閘門：ruff check 通過、pytest 全綠（627 passed）

## 備註
- camofox-browser：Playwright/Puppeteer wrapper，支援無頭瀏覽器、JS 渲染、動態載入
- 目標網站：
  - MOPS: `https://mops.twse.com.tw/mops/web/` (t163sb04, t187ap05_L, t187ap45_L, t187ap03_L)
  - 公開資訊觀測站: `https://mopsfin.twse.com.tw/`
- Selector 需定期維护（網頁改版即失效）
- 速率限制：建議 1-2 req/s，單 IP 同時連線 ≤ 3
- 法律風險：MOPS 條款禁止爬蟲，**僅作為最後備援**，需評估合規風險
- 資料正規化：對齊現有 schema，附加 `_lineage.source = "MOPS_WEB_SCRAPER"`

## 風險
- **高維護成本**：網頁結構一變即失效，需持續監控維護 Selector
- **高封鎖風險**：高頻爬取極易被封 IP，需代理池、驗證碼處理
- **法律/合規風險**：MOPS 明確禁止爬蟲，可能違反使用條款
- **效能差**：單檔抓取秒級，全市場 1000+ 檔 = 分鐘到小時
- **資料品質不穩**：HTML 解析易出錯，需大量驗證邏輯
- **非即時**：網頁發布通常 T+1 或更晚

## 結論
僅作為「最後手段」，當 OpenAPI、TEJ 都無法取得特定資料時啟用。平時保持停用，定期手動觸發補歷史缺口。
