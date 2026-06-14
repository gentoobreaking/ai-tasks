---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/565
title: Analytics Dashboard
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T075 - Analytics Dashboard

## 目標
在 Dashboard 中實現使用量和成本的統計分析介面。

## 驗收標準
- [x] 時間範圍選擇（7 / 30 / 90 天按鈕切換）
- [x] 摘要卡片：total sessions、input/output tokens、est. cost、avg daily
- [x] 每日 token 柱狀圖（Bar chart，input/output 分色、hover 顯示 tooltip）
- [x] 每日明細表格（date / sessions / input tokens / output tokens / cost / success）
- [x] Per-model 統計表（model name / sessions / input / output / cost）
- [x] 使用 Chart.js（react-chartjs-2，既存依賴）

## 備註
- 資料從 session history 計算
- 成本估算需要 provider 定價資訊
- 考慮快取計算結果避免每次重新計算

## T075 完成。以下是交付摘要：

**新增檔案**

| 檔案 | 說明 |
|------|------|
| `frontend_api/analytics_engine.py` | Session analytics 計算引擎 + 9 個 provider model 定價表（USD/1K tokens） |

**後端** — `GET /api/v1/analytics/sessions?days=30`
- 從 `data/outcomes/*.jsonl` 讀取 session 記錄
- 按 iteration_count 估算 token 用量（~750 input + ~250 output per iteration）
- 依 model 定價表計算成本，按日彙總 + per-model 分群

**前端** — `AnalyticsPage.tsx` 完整改寫
| 元件 | 功能 |
|------|------|
| Time range selector | 7 / 30 / 90 天按鈕切換 |
| Summary cards | Total Sessions / Input Tokens / Est. Cost / Avg Daily |
| Daily Token Bar Chart | Chart.js Bar，input（藍）output（綠）分色、hover tooltip |
| Daily Sessions Line Chart | 每日 session 趨勢線 |
| Daily Breakdown Table | date / sessions / input / output / cost / success |
| Per-Model Table | model name / sessions / input / output / cost |

**修改檔案**
- `frontend_api/router_v1.py` — 新增 `analytics_router`
- `frontend_api/app.py` — 註冊 `analytics_router`

