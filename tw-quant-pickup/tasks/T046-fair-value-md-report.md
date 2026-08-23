---
github_issue:
title: 合理價 Markdown 報表匯出
type: feat
priority: low
status: done
depends_on: [T044, T045]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-24
updated: 2026-08-24
---

# T46 - 合理價 Markdown 報表匯出

## 目標
將 DB 內已算出的合理價（個股四法 + ETF 兩法）匯出成單一大表格 Markdown 報表，
附即時現價與燈號判斷，方便快速檢視全部標的的估值狀態。

## 驗收標準
- [x] 表格欄位：代號 | 名稱 | 狀態 | 方法 | 便宜價 | 合理價 | 昂貴價 | 基準日 | 現價 | 判斷
- [x] 現價自證交所 MIS 即時抓取（批次請求，50 檔/次；上市先查、上櫃補查）
- [x] 判斷欄五級燈號：💎 低於便宜價、🟢 便宜～合理、🟡 接近合理價(±3%)、🟠 合理～昂貴、🔴 高於昂貴價
- [x] 🟢/🔴 狀態標記 30 天新鮮度，與防呆邏輯一致
- [x] --etf-only / --stocks-only 可分別匯出；etf_valuations 表不存在時自動降級不中斷
- [x] 輸出至 reports/fair_value/<日期>.md，可用 -o 自訂路徑

## 備註
- commit 8aa2534
- 使用手冊見 tools/README.md（含 DATABASE_URL 本機應用 localhost、容器內才用 postgres 主機名的說明）
