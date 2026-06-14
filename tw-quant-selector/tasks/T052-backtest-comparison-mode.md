---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/695
title: Backtest Comparison Mode
type: feature
priority: medium
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號 + DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. 在回測歷史記錄列表加入 Checkbox 勾選，最多選擇 2 筆。✅ 已完成
  2. 勾選 2 筆後自動切換比較模式版面。✅ 已完成
  3. 比較模式：並排差異指標格 + 疊加淨值曲線圖 + 策略差異分析區段。✅ 已完成
  4. 差異標記規則：有利差異標綠 ▲、不利差異標紅 ▼、差異 < 5% 標灰 ─。✅ 已完成
  5. 比較模式 URL 參數：?compare=run_id_2。✅ 已完成
---

# T052 - Backtest Comparison Mode

## 目標
實作回測比較模式，允許使用者從歷史執行記錄中選取 2 筆回測進行並排比較，包含指標差異計算與視覺化。

## 驗收標準
- [x] 歷史記錄列表每行加入 Checkbox，最多勾選 2 筆
- [x] 勾選第 2 筆後自動切換到比較模式版面
- [x] 比較模式包含：
  - 並排標頭（各自執行時間 + 策略摘要）
  - 差異指標格（2×N Grid：指標 | A | B | 差異）
  - 疊加淨值曲線圖（兩條策略線：A 藍色、B 綠色）
- [x] 差異標記：有利標綠 ▲、不利標紅 ▼、< 5% 標灰 ─，符合 §8.3
- [x] 差異欄 tooltip 含差異百分比說明
- [x] URL 支援 `?compare=run_id_2`

## 實作進度

| 項目 | 狀態 | 備註 |
|------|------|------|
| Checkbox 勾選 | ✅ 完成 | 最多 2 筆 |
| 比較模式切換 | ✅ 完成 | isCompareMode 狀態 |
| 並排標頭 | ✅ 完成 | A/B 策略顏色區分 |
| 差異指標格 | ✅ 完成 | 4 欄 Grid |
| 疊加淨值曲線 | ✅ 完成 | A 藍 B 綠 |
| 差異計算 | ✅ 完成 | 百分比差異 + 符號標記 |
| URL 參數同步 | ✅ 完成 | ?compare=run_id_2 |

## Build 驗證

```bash
cd /Users/claw/Projects/tw-quant-selector/frontend && npm run build
```

✓ built in 408ms — 所有頁面編譯成功，無 TypeScript 錯誤

## 技術細節

### URL 參數同步

**初始載入**：
```typescript
const [compareIds, setCompareIds] = useState<string[]>(() => {
  const compareParam = searchParams.get('compare');
  return compareParam ? [compareParam] : [];
});
```

**同步到 URL**：
```typescript
useEffect(() => {
  if (compareIds.length === 2) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('compare', compareIds[1]);
    setSearchParams(newParams, { replace: true });
  } else {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('compare');
    setSearchParams(newParams, { replace: true });
  }
}, [compareIds]);
```

**行為**：
- 頁面載入時讀取 `?compare=run_id` 並預選第一筆
- 勾選第二筆後，更新 URL 為 `?compare=run_id_2`
- 取消比較時清除 URL 參數
- 分享連結可直接進入比較模式

### 新增狀態

- `compareIds: string[]` - 勾選的 run_id 列表
- `compareDataA/B: EquityPoint[]` - 兩筆回測的淨值資料

### CompareView 組件

- 並排標頭（A/B 策略）
- 差異指標格（總報酬、CAGR、Sharpe、最大回撤）
- 疊加淨值曲線圖

### 差異計算邏輯

```typescript
const diff = ((b - a) / Math.abs(a)) * 100;
// > 0: 有利（綠色 ▲）
// < 0: 不利（紅色 ▼）
// < 5%: 差異小（灰色 ─）
```

### 顏色規範

- A 策略：#38bdf8（藍色）
- B 策略：#22c55e（綠色）

## 備註
- 顏色區分：A = interactive (藍), B = positive (綠)
- 參考 spec §8.1–8.3
- URL 參數支援分享連結與狀態恢復
