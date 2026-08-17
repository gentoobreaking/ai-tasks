---
github_issue: N/A
title: API Server（§53 / §53.1 / §54：FastAPI + Envelope + 前端整合對齊）
type: task
priority: P1
status: pending
depends_on: [T014, T015, T016, T018]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T019 - API Server（§53 / §53.1 / §54：FastAPI + Envelope + 前端整合對齊）

## 目標

實作 FastAPI：§53 全部端點、Response Envelope `{data, meta, error}`、§54 `/health`；並依 §53.1 前端整合原則（純 API 消費、慣例對齊、無 SSE、score_breakdown 內嵌）。這是「兩個 issues」之二（前端整合 §53.1）的落地。

## 驗收標準

- [ ] 端點齊全（§53）：`/api/v1/stocks`、`/stocks/{symbol}`、`/ranking/stocks?date=&limit=&min_score=`、`/ranking/stocks/{symbol}`、`/ranking/etfs`、`/ranking/dates`、`/valuation/{symbol}`、`/alerts?date=&type=`、`/snapshots/{date}`、`/reports/{date}`、`/backtest/{strategy}`（後者待 T021）
- [ ] Response Envelope 與 §53 範例一致（data / meta 含 snapshot_id + model/parameter/data version / error）
- [ ] `/api/v1/ranking/stocks` 每筆含 `score_breakdown`（§53 / §63）
- [ ] 日期慣例 `?date=YYYY-MM-DD` + `/ranking/dates` 日曆端點（§53.1 ② 對齊 selector）
- [ ] 無 SSE、無即時同步；純 REST GET（§53.1 ③）
- [ ] 404/400 error envelope 統一格式；查不到日期回空白而非 500（§53）
- [ ] `/health`（§54）回 DB / 上次 snapshot / MCP 連線狀態
- [ ] 前端只需吃 API 即可渲染（不需 DB schema、不 join pickup DB，§53.1 ①）
- [ ] API integration test：envelope schema、欄位齊全性（§78 DoD: API contract works）

## 備註

- 紅漲綠跌 由前端各自維護（§53.1 ②），API 不回顏色
- snapshot 對外唯讀（§53.1 ⑥）：稽核「當天誰排第幾名、為什麼」