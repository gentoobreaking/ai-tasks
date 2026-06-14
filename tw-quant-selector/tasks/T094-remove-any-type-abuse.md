---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/807
title: 移除前端 any 型別濫用
type: refactor
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T094 - 移除前端 any 型別濫用

## 目標
前端程式碼中大量使用 `any` 型別，導致：
1. **TypeScript 型別檢查失效** → 無法在編譯時發現錯誤
2. **重構風險高** → 修改介面後，呼叫方不會收到警告
3. **程式碼提示缺失** → IDE 無法提供準確的自動補全

此任務要定義明確的 `interface` 或 `type` 替代 `any`，提升程式碼可維護性。

## 驗收標準
- [x] 定義通用 API 響應型別 `ApiResponse<T>`
- [x] 定義 Signal 相關型別 `SignalItem`
- [x] 定義 Strategy 相關型別 `ConfigHistoryEntry`
- [x] 定義 Backtest 相關型別 `BacktestRun`
- [x] 定義 Portfolio 相關型別 `AlertLogEntry`
- [x] `npm run build` 通過（0 錯誤）
- [x] 所有頁面功能正常（回歸測試通過）

## 變更摘要

### 新增檔案
- `frontend/src/types/index.ts` — 共享型別定義（ApiResponse, SignalItem, ConfigHistoryEntry, BacktestRun, AlertLogEntry）

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `api/client.ts` | `fetchLatestSignals`, `fetchSignalsByDate`, `fetchStockDetail` 回傳型別 `Promise<unknown>` |
| `pages/Strategy.tsx` | `configHistory` → `ConfigHistoryEntry[]`；`params` → `Record<string, Record<string, number \| boolean \| string>>`；`guruFilter` 獨立 state；移除 5 處 `any` |
| `pages/Backtest.tsx` | `catch(e: any)` → `catch(e: unknown)` + `instanceof Error` 守衛；`as any` → `as Time`；移除本機 `BacktestRun` |
| `pages/Portfolio.tsx` | `alertLog` → `AlertLogEntry[]`；`apiFetch<{items: any[]}>` → `AlertLogEntry[]`；null 安全比較 |
| `pages/Signals.tsx` | `catch(e: any)` → `unknown`；`SignalsResponse` 介面 |
| `pages/StockDetail.tsx` | `.then((d: any)` → `(d: unknown)`；`as any` → `as typeof` |
| `components/SignalRowDetail.tsx` | `useState<any>` → `StockDetailData`；`(p: any)` → `(p: PricePoint)` |
| `components/PortfolioPieCharts.tsx` | `PieLabelRenderProps` + 預設值（消除 optional undefined） |
| `pages/Dashboard.tsx` | `catch(e: any)` → `unknown`；`as SignalsData` → `as unknown as SignalsData` |
| `pages/Settings.tsx` | 3 處 `catch(e: any)` → `unknown` |
