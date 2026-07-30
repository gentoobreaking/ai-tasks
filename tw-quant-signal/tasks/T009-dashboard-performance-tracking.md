---
github_issue: ""
title: "[Phase 2] 儀表板與績效追蹤系統"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
closed: 2026-07-30
---

# T009 - 儀表板與績效追蹤

## 目標
建置盤後總覽儀表板，展示四燈號健診結果、規則觸發狀態，建立訊號績效追蹤系統，並封裝為 Docker 容器化部署。

對應規格：`§3.2.1 基礎儀表板`、`§3.2.2 績效追蹤`、`§5 評估指標`

## 驗收標準
### 儀表板
- [x] 雙頁面儀表板：台股訊號觀察頁 + 規則與比重管理頁
- [x] 頁面 1 功能：標的切換 tab、K線圖 (lightweight-charts) + MA5/20/60、四燈號健診卡片、風險監控卡片、觸發規則表、法人買賣超、財務數據
- [x] 頁面 2 功能：config.json 編輯儲存、規則按偏多/中性/偏空/全部分 tab 瀏覽與編輯（名稱/描述/類型/標籤/失效條件）
- [x] 顯示即時四燈號健診結果（四面向分數 + 綜合總分 + 燈號）
- [x] 健診細項表含五欄：指標/權重/計分方式/計算公式/結果（計算公式讀取 YAML `formula` 欄位，結果顯示實際值 → 分數）
- [x] 規則管理頁面支援編輯四燈號配置（面向權重、子指標權重、計分方式、計算公式），存入 health_check.yaml
- [x] 顯示每日規則觸發狀態（依類型分類，含失效條件）
- [x] 顯示風險監控指標（波動率/ATR/最大回撤/多空衝突/停損參考）
- [x] 依市場狀態分類顯示（多頭/空頭/盤整）
- [x] 支援查詢歷史訊號紀錄（via pipeline_log）

### 後端 API
- [x] FastAPI 後端 (RESTful JSON)
- [x] `GET /api/stocks` — 標的列表（最新價、健診、風險）
- [x] `GET /api/stocks/{id}/detail` — 標的明細（K線/技術指標/法人/財報/健診/風險/規則）
- [x] `GET /api/rules` + `PUT /api/rules` — 規則 CRUD（讀寫 YAML）
- [x] `GET /api/config` + `PUT /api/config` — 設定編輯（watch_stocks）
- [x] `GET /api/health-check-config` + `PUT /api/health-check-config` — 讀寫 health_check.yaml（aspect_weights, 子指標權重/計分方式/formula）
- [x] Production 模式自動 serve 前端靜態檔

### 容器化
- [x] Multi-stage Dockerfile：Stage 1 node:20-alpine 編譯前端，Stage 2 python:3.12-slim 跑 API
- [x] docker-compose.yml：app service（production, port 8000）+ scheduler service（--profile scheduler, cron pipeline）
- [x] 容器內 API + 前端靜態檔皆正常運作（實測通過）
- [x] 資料目錄 `data/` 與設定檔 `config.json`、`configs/` 掛載 volume

### 待實作
- [ ] 績效追蹤：訊號出現後 1/3/5 日表現
- [ ] 統計報表：勝率、盈虧比、連續虧損次數
- [ ] 依市場狀態分類統計績效

## 備註
- 參考 tw-quant-selector 的 Dockerfile 與 docker-compose.yml 模式
- 儀表板僅供檢視，不提供下單功能
- pyproject.toml 新增 fastapi、uvicorn、yfinance 依賴
- 啟動方式：`docker compose up -d`（production）或 `bash scripts/dev.sh`（dev）

## 已知資料源限制（無法改善）
以下為資料源頻率或 API 可用性造成的先天限制，非計算邏輯錯誤：

### EPS 即時性（yfinance 落後 1 季）
- yfinance 季度財報約落後 1 季（目前最新 Q1'26，Q2'26 財報截止日 8/14）
- 與 winvest 等快訊網站差異約 1 季，待 yfinance 更新後自動跟上
- 暫無免費 API 可取得更即時的季EPS

### 融資融券餘額單位不一致
- 融資餘額單位為「張」，融券餘額單位為「股」（TWSE TWT93U 原始回傳）
- DB 儲存原始單位，前端顯示時已轉為同單位（張）再計算券資比
- 不影響券資比正確性
- 融資餘額單位為「張」，融券餘額單位為「股」（TWSE TWT93U 原始回傳）
- DB 儲存原始單位，前端顯示時已轉為同單位（張）再計算券資比
- 不影響券資比正確性

## 已知口徑差異（非錯誤）
以下為計算口徑或資料源定義不同造成的數值差異，非系統缺陷：

| 指標 | 系統數值 | 對照站數值 | 差異原因 |
|------|---------|-----------|---------|
| **殖利率** | 0.78%（TWSE BWIBBU_ALL，股息/即時股價） | 0.52%（winvest，股息/除息前收盤價） | 分母不同：即時股價 vs 除息前收盤價 |
| **本益比** | 47.58（TWSE BWIBBU_ALL） | — | TWSE 官方 PE 計算含最新 TTM EPS |
| **EPS 成長率基準** | 同季度跨年 YoY（如 Q1'26 vs Q1'25） | 同季度跨年 YoY | 資料源時間差導致數值不同（yfinance vs 快訊） |
| **營收成長率基準** | 月營收 YoY（MOPS TWSE 官方月營收） | 月營收 YoY（如 6月 vs 去年同月） | 已改用 MOPS ajax_t05st10_ifrs 月營收，口徑一致 |

