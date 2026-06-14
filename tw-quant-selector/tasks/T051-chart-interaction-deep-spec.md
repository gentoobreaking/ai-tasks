---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/694
title: Chart Interaction Deep Spec
type: feature
priority: medium
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號 + DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. 實作 Crosshair（十字準線 + snap to data + 雙線圓圈）。✅ 已由 T036 完成
  2. 實作 Tooltip（內容規格 + 定位邏輯 + 動畫）。✅ 已由 T036 完成
  3. 實作 Zoom（滾輪縮放 + 以滑鼠為中心 + 最小22交易日）。✅ 已由 T036 完成
  4. 實作 Brush（拖拽選取 → 摘要 Popover → [設為回測期間]）。✅ 已完成
  5. 圖表快捷鍵（R/←→/Shift+←→/0/Home）。✅ 已完成
  6. 重設縮放按鈕始終可見。✅ 已完成
  7. 縮放狀態同步至 URL。✅ 已完成
---

# T051 - Chart Interaction Deep Spec

## 目標
強化圖表互動功能，實作 Crosshair 十字準線、資料點 Tooltip、Zoom 縮放、Brush 選取、以及圖表快捷鍵。

## 驗收標準
- [x] Crosshair：垂直+水平虛線、snap to data、多線圖各自顯示圓圈，符合 §6.1
- [x] Tooltip：日期+策略+基準+超額報酬，智慧定位（右側優先→左側），平滑跟隨，符合 §6.2
- [x] Zoom：滑鼠滾輪/trackpad/按鈕觸發，以滑鼠位置為中心，最小22日，Y軸自動調整，符合 §6.3
- [x] Brush：拖拽選取 → 摘要 Popover（期間報酬 + [設為回測期間]），符合 §6.4
- [x] 圖表快捷鍵：R/←→/Shift+←→/0/Home，符合 §6.5
- [x] 縮放範圍顯示在 X 軸下方，重設縮放按鈕始終可見
- [x] 縮放狀態同步至 URL（?from=YYYY-MM-DD&to=YYYY-MM-DD）

## 實作進度

| 項目 | 狀態 | 備註 |
|------|------|------|
| Crosshair | ✅ 完成 | T036 已實作 |
| Tooltip | ✅ 完成 | T036 已實作，含智慧定位 |
| Zoom 滾輪 | ✅ 完成 | T036 已實作，以滑鼠為中心 |
| Zoom 最小22日 | ✅ 完成 | T036 已實作 |
| 快捷鍵 R | ✅ 完成 | T051 新增 |
| 快捷鍵 ←→ | ✅ 完成 | T051 新增，支援 Shift 大幅移動 |
| 快捷鍵 0/Home | ✅ 完成 | T051 新增 |
| 重設縮放按鈕 | ✅ 完成 | T051 新增，右上角 ⟲ 按鈕 |
| Brush 選取 | ✅ 完成 | T051 新增，拖拽 + Popover + 回調 |
| URL 狀態同步 | ✅ 完成 | T051 新增，?from=&to= 參數 |

## Build 驗證

```bash
cd /Users/claw/Projects/tw-quant-selector/frontend && npm run build
```

✓ built in 306ms — 所有頁面編譯成功，無 TypeScript 錯誤

## 技術細節

### URL 狀態同步

**實作方式**：
- 使用 `useSearchParams` 存取 URL 參數
- 縮放變化時更新 `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- 頁面載入時讀取 URL 並套用縮放範圍

**同步流程**：
1. 初始化時讀取 `searchParams.get('from')` / `searchParams.get('to')`
2. 若存在則呼叫 `chart.timeScale().setVisibleRange()`
3. 監聽 `subscribeVisibleTimeRangeChange` 事件
4. 縮放變化時更新 URL 參數

### Brush 選取

**新增狀態**：
- `brushSelection`: 選取框位置
- `brushPopover`: Popover 內容
- `isDragging` / `dragStart`: 拖拽狀態

**事件處理**：
- `onMouseDown`: 開始拖拽
- `onMouseMove`: 更新選取範圍
- `onMouseUp`: 計算期間報酬，顯示 Popover

### 快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| R / 0 / Home | 重設縮放 |
| ← | 向左平移 20% |
| → | 向右平移 20% |
| Shift + ← | 向左平移 50% |
| Shift + → | 向右平移 50% |

## 備註
- 基於現有 lightweight-charts 實作
- T036 (equity-curve-interaction) 已完成大部分功能
- URL 參數格式：`?from=YYYY-MM-DD&to=YYYY-MM-DD`
