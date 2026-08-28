---
github_issue: ""
title: 人類可視化網頁儀表板（價格+走勢+健康）
type: feature
priority: high
status: pending
depends_on: ["T018"]
assignee: pi
created: 2026-08-28
updated: 2026-08-28
---

# T015 - 人類可視化網頁儀表板

## 目標
在 history_api.py 的 HTTP 伺服器上提供一個自帶的靜態 HTML 首頁（路徑 `/`），讓一般使用者在瀏覽器開啟後即可看到：四個監控物件的即時價格、相對基準的漲跌、近 7 天走勢圖，以及資料來源健康狀態。不需執行任何指令、不需依賴聊天機器人。

## 驗收標準
- [ ] `history_api.py` 在 `GET /` 回傳一個排版過的 HTML 頁面（含中文介面）。
- [ ] 頁面顯示：gold_local（買/賣）、gold_intl、silver_intl、platinum_intl 的最新價格、漲跌方向（↑/↓）、與基準的絕對/百分比變動、報價時間與來源。
- [ ] 四個金屬各有一張近 7 天走勢圖（line chart），資料來自現有 `/api/v1/history/{metal}?days=7`。
- [ ] 頁面含健康面板，顯示 taiwan_bank / esun_bank / yahoo_finance 狀態（來自 `/health` 或 T018 的 `/api/v1/latest`）。
- [ ] 圖表在檢視時不需額外網路請求（優先用內嵌 SVG / Canvas；若用 CDN 圖表庫，必須在離線時優雅降級為純表格）。
- [ ] 頁面為單一靜態檔（放 `src/dashboard.html` 或 `src/templates/`），無建置步驟、無前端框架；`make serve-history` 即可瀏覽。
- [ ] 手機/窄螢幕可讀（responsive）。

## 備註
- 沿用既有的 `BaseHTTPRequestHandler`，新增 `do_GET` 對 `/` 的靜態檔服務；不要引入 Flask/FastAPI 等額外依賴。
- 若同時想讓兩支 monitor 的 `--serve` 也提供儀表板，可在 T018 一併處理；本任務以 history_api 為主。
