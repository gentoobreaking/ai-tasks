---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/833
title: AlertHistory 多頁籤擴充（原 Streamlit，已移植到 React）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-06
howto: |
  1. 擴展現有 React AlertHistory.tsx（因方案 C 已刪除 Streamlit）
  2. 新增後端端點 GET /api/v1/market/screen + GET /api/v1/smart-alerts/history
  3. 實現 4 個頁籤：全市場篩選、法人交叉、即時牆、警示歷史
  4. 使用 Recharts ScatterChart 替代 Plotly（因前端無 plotly 依賴）
  5. CSV 匯出使用 Blob 下載（無需 xlsx 等額外套件）
---

# T124 - AlertHistory 多頁籤擴充（原 Streamlit，已移植到 React）

## 目標
將實時警示相關功能（全市場篩選、法人籌碼交叉分析、即時牆）整合到現有 React AlertHistory 頁面。

## 驗收標準
- [x] **後端：GET /api/v1/market/screen**
  - 參數：include_stocks, include_etf, volume_spike, against_trend, limit
  - 返回：stock_id, name, industry, is_etf, close, change_pct, volume
  - 支持爆量突破（change_pct > 3%）與逆市英雄（change_pct < -1%）過濾

- [x] **後端：GET /api/v1/smart-alerts/history**
  - AlertWebSocketManager 新增 _history 記憶體存儲（最多 200 條）
  - 參數：limit（預設 50，最大 200）
  - 返回最近 N 條已廣播的智慧警示

- [x] **Tab 1：全市場數據篩選**
  - 複選框：僅看一般股票、僅看 ETF、爆量突破、逆市英雄
  - 查詢按鈕 + 匯出 CSV 按鈕
  - 表格條件格式：漲跌停紅/綠背景（#FFE6E6 / #E6FFE6）

- [x] **Tab 2：法人籌碼交叉比對**
  - 使用現有 GET /api/v1/institutional/top 獲取前 50 大標的
  - Recharts ScatterChart：X = 外資買賣超，Y = 投信買賣超
  - 法人同買（foreign_net > 0 && sity_net > 0）過濾表
  - CSV 匯出按鈕

- [x] **Tab 3：智慧警示即時牆**
  - 每 10 秒定時輪詢 GET /api/v1/smart-alerts/history
  - 合併 AlertContext（WebSocket 即時推送）資料源
  - 顯示最近 50 條：時間、股票、警示 icon、severity badge
  - 點擊展開 details JSON

- [x] **Tab 4：警示歷史（原有內容保留）**
  - Severity 篩選 / 日期區間 / 未解決過濾
  - 每日/每週堆疊長條圖
  - 警示列表 + 解決警示功能

- [ ] 單元測試
  - 測試側邊欄篩選邏輯
  - 測試條件格式渲染
  - 測試 CSV 匯出功能

## 備註
- **Streamlit → React 移植原因**：方案 C 已刪除所有 streamlit/ 內容，改以 React 實作
- ✅ **T121（MIS API 即时报价）** — 已完成，為 market/screen 提供數據源
- ✅ **T122（10 种智慧警示条件实作）** — 已完成，為 smart-alerts/history 提供資料源
- 散點圖使用 Recharts 而非 Plotly（前端依賴中無 plotly）
- CSV 匯出使用 Blob + DataURL，無需額外套件
