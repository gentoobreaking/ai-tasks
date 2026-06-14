---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/802
task_id: T089
title: "修正篩選結果預估：新增後端 API 查詢實際數量"
status: done
updated: 2026-05-30
assignee: 碼農1號
created: 2026-05-30
closer: 2026-06-01
parent: null
depends_on: []
tags: [frontend, backend, api, bug-fix]
---

# T089: 修正篩選結果預估 - 新增後端 API 查詢實際數量

## 📊 任務概述

**問題**：Strategy 頁面的「篩選條件」卡片底部顯示的 **「預估篩選結果」** 數字不正確。

**根因**：`estimateUniverseSize()` 函數是 **假估算**，並未真正查詢數據庫，只是用簡單的線性縮放公式算出不準確的預估值。

**解決方案**：
1. 新增後端 API `/api/v1/universe/count`，查詢符合篩選條件的 **實際股票數量**
2. 前端 `Strategy.tsx` 改為呼叫此 API，顯示 **真實數量**

---

## 🐛 問題詳情

### **當前狀況**

在 Strategy 頁面設定：
```
最低市值：200 億
日均成交額：5000 萬
```

系統顯示：
```
預估篩選結果：篩掉 ~527 檔，剩 773 檔
```

### **實際狀況**

根據常識判斷：
- 台股全市場約 **1300 檔**
- **市值 > 200 億** 的股票：約 **100-150 檔**（只有台積電、鴻海、聯發科等大型股）
- **成交額 > 5000 萬**：再過濾掉約 30-40%
- **預估剩餘**：應該是 **約 100 檔**，而不是 **773 檔**

**結論**：`剩 773 檔` **肯定是錯誤的**！

### **錯誤根因**

`estimateUniverseSize()` 的計算是 **假的**：

```typescript
function estimateUniverseSize(
  minMarketCap: number,
  minDailyVolume: number,
  excludeFinancial: boolean,
  excludeKY: boolean,
): number {
  let est = UNIVERSE_BASE;  // 1300 檔
  
  // 假估算：市值 > 200 億 → 只減少 0.4% (200/50000 * 0.6 = 0.0048)
  if (minMarketCap > 0) {
    const capFactor = Math.min(1, minMarketCap / 50_000_000_000);
    est = Math.round(est * (1 - capFactor * 0.6));
  }
  
  // 假估算：成交量 > 5000 萬 → 只減少 4% (5000/50000 * 0.4 = 0.04)
  if (minDailyVolume > 0) {
    const volFactor = Math.min(1, minDailyVolume / 50_000_000);
    est = Math.round(est * (1 - volFactor * 0.4));
  }
  
  if (excludeFinancial) est = Math.round(est * 0.85);
  if (excludeKY) est = Math.round(est * 0.92);
  return Math.max(est, 50);
}
```

**計算過程**：
```
1300 → 市值篩選 → 1294 → 成交量篩選 → 1242 → 剩 1242 檔
```

**實際應該是**：
```
1300 → 市值 > 200 億 → ~100 檔 → 成交量 > 5000 萬 → ~80 檔
```

---

## ✅ 解決方案

### **方案：新增後端 API，查詢實際數量**

不再用前端假估算，而是 **呼叫後端 API 查詢數據庫**，取得符合篩選條件的 **實際股票數量**。

---

## 🔧 實作步驟

### **步驟 1：後端新增 API `/api/v1/universe/count`**

**檔案**：`/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/api/app.py`

**新增以下程式碼**：

```python
@app.get("/api/v1/universe/count")
def get_universe_count(
    min_market_cap: float = Query(0, ge=0),
    min_daily_volume: float = Query(0, ge=0),
    exclude_financial: bool = Query(False),
    exclude_ky: bool = Query(False),
    include_etf: bool = Query(False),
):
    """
    查詢符合篩選條件的股票數量（實際查詢數據庫）
    """
    # 建立動態 SQL（根據參數組裝 WHERE 條件）
    where_clauses = []
    params = []
    
    # 1. 最低市值
    if min_market_cap > 0:
        where_clauses.append("market_cap >= ?")
        params.append(min_market_cap)
    
    # 2. 日均成交額（需要計算 avg(volume * close)）
    volume_filter = ""
    if min_daily_volume > 0:
        volume_filter = """ AND s.stock_id IN (
            SELECT stock_id FROM daily_prices 
            WHERE trade_date >= (SELECT MAX(trade_date) FROM daily_prices) - 20
            GROUP BY stock_id 
            HAVING AVG(volume * close) >= ?
        )"""
        params.append(min_daily_volume * 10000)  # 萬元轉元
    
    # 3. 排除金融股
    if exclude_financial:
        where_clauses.append("industry NOT LIKE '%金融%'")
        where_clauses.append("industry NOT LIKE '%保險%'")
    
    # 4. 排除 KY 股
    if exclude_ky:
        where_clauses.append("stock_id NOT LIKE '%KY%'")
    
    # 5. 包含 ETF
    if not include_etf:
        where_clauses.append("is_etf = 0")
    
    # 組裝 SQL
    where_sql = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    query = f"""
        SELECT COUNT(DISTINCT s.stock_id) as cnt
        FROM stocks s
        {where_sql}
        {volume_filter}
    """
    
    row = db.execute(query, params).fetchone()
    count = row[0] if row else 0
    
    return api_response({
        "count": count,
        "filters": {
            "min_market_cap": min_market_cap,
            "min_daily_volume": min_daily_volume,
            "exclude_financial": exclude_financial,
            "exclude_ky": exclude_ky,
            "include_etf": include_etf,
        }
    })
```

**API 使用範例**：
```bash
# 查詢：市值 > 200 億，成交額 > 5000 萬
curl "http://localhost:8000/api/v1/universe/count?min_market_cap=20000000000&min_daily_volume=50000000"

# 回傳：
{
  "success": true,
  "data": {
    "count": 87,
    "filters": {
      "min_market_cap": 20000000000,
      "min_daily_volume": 50000000,
      "exclude_financial": false,
      "exclude_ky": false,
      "include_etf": false
    }
  }
}
```

---

### **步驟 2：前端修改 `Strategy.tsx`**

**檔案**：`/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Strategy.tsx`

#### **2.1 新增狀態**

在元件頂部新增：

```typescript
const [universeCount, setUniverseCount] = useState<number | null>(null);
const [universeLoading, setUniverseLoading] = useState(false);
```

#### **2.2 新增查詢函數**

```typescript
const fetchUniverseCount = useCallback(async () => {
  setUniverseLoading(true);
  try {
    const params = new URLSearchParams();
    if (minMarketCap > 0) params.append('min_market_cap', minMarketCap.toString());
    if (minDailyVolume > 0) params.append('min_daily_volume', (minDailyVolume * 10000).toString());
    if (excludeFinancial) params.append('exclude_financial', 'true');
    if (excludeKY) params.append('exclude_ky', 'true');
    if (includeEft) params.append('include_etf', 'true');
    
    const data = await apiFetch<{ count: number }>(`/api/v1/universe/count?${params.toString()}`);
    setUniverseCount(data.count);
  } catch (error) {
    console.error('Failed to fetch universe count:', error);
    setUniverseCount(null);
  } finally {
    setUniverseLoading(false);
  }
}, [minMarketCap, minDailyVolume, excludeFinancial, excludeKY, includeEft]);
```

#### **2.3 在篩選條件變更時觸發查詢**

在 `useEffect` 中新增：

```typescript
useEffect(() => {
  fetchUniverseCount();
}, [fetchUniverseCount]);
```

#### **2.4 修改渲染邏輯**

找到 **「預估篩選結果」** 那一行，修改為：

```typescript
<p className={styles.filterEstimate}>
  {universeLoading ? (
    <>計算中<span className={styles.loadingDots}>...</span></>
  ) : universeCount !== null ? (
    <>
      篩選結果：<strong className={styles.highlight}>{universeCount}</strong> 檔
      <span className={styles.muted}>（全市場 {UNIVERSE_BASE} 檔中篩選）</span>
    </>
  ) : (
    <>預估篩選結果：篩掉 <strong>~{UNIVERSE_BASE - estimateUniverseSize(minMarketCap, minDailyVolume, excludeFinancial, excludeKY)}</strong> 檔，剩 <strong className={styles.highlight}>{estimateUniverseSize(minMarketCap, minDailyVolume, excludeFinancial, excludeKY)}</strong> 檔</>
  )}
</p>
```

**顯示效果**：
- **載入中**：`計算中...`
- **查詢成功**：`篩選結果：87 檔（全市場 1300 檔中篩選）`
- **查詢失敗**：顯示舊的假估算（降級處理）

---

### **步驟 3：新增 CSS 樣式**

**檔案**：`/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Strategy.module.css`

新增：

```css
.loadingDots {
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

.muted {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  margin-left: 8px;
}
```

---

### **步驟 4：測試驗證**

#### **4.1 後端 API 測試**

```bash
# 測試 1：無篩選條件
curl "http://localhost:8000/api/v1/universe/count"
# 預期：{"count": 1300}

# 測試 2：市值 > 200 億
curl "http://localhost:8000/api/v1/universe/count?min_market_cap=20000000000"
# 預期：{"count": ~100}

# 測試 3：市值 > 200 億 + 成交額 > 5000 萬
curl "http://localhost:8000/api/v1/universe/count?min_market_cap=20000000000&min_daily_volume=50000000"
# 預期：{"count": ~80}

# 測試 4：排除金融股
curl "http://localhost:8000/api/v1/universe/count?exclude_financial=true"
# 預期：{"count": ~1100}
```

#### **4.2 前端測試**

1. 開啟 `http://localhost:5173/strategy`
2. 修改「最低市值」→ 觀察「篩選結果」數字是否正確更新
3. 修改「日均成交額」→ 觀察數字是否正確更新
4. 勾選「排除金融股」→ 觀察數字是否正確減少
5. 打開瀏覽器控制台（F12）→ 檢查是否有 API 請求 `/api/v1/universe/count`

---

## 📋 實作檢查清單

- [x] 後端新增 API `/api/v1/universe/count`
- [x] 前端 `Strategy.tsx` 新增狀態 `universeCount`
- [x] 前端新增函數 `fetchUniverseCount()`
- [x] 前端修改 `useEffect` 觸發查詢
- [x] 前端修改渲染邏輯（顯示實際數量）
- [x] 前端新增 CSS 樣式（loading 動畫）
- [x] 測試：後端 API 測試（4 個測試案例）
- [x] 測試：前端 UI 測試（修改篩選條件，觀察數字更新）
- [x] 測試：錯誤處理（API 失敗時，降級顯示假估算）
- [x] 文件更新：更新 `STRATEGY_GUIDE.md`，說明「篩選結果」現在是 **實際數量**

> **注意**：後端實作因應 schema 差異，SQL 使用 `valuations` JOIN 取得最新 `market_cap`，使用 `daily_prices` JOIN 計算日均成交額，而非原 task 設計的 `stocks.market_cap` 直查。`min_daily_volume` 參數前端傳入億元為單位（e.g., 0.5 = 5000 萬），後端換算為元。

---

## 🎯 預期效益

### **1. 正確性**
- 顯示的「篩選結果」是 **實際查詢數據庫** 的結果
- 不再出現明顯錯誤的數字（例如：773 檔）

### **2. 使用者體驗**
- 修改篩選條件後，數字會 **即時更新**
- 顯示 **「計算中...」** 載入狀態，讓使用者知道系統正在計算

### **3. 可維護性**
- 後端 API 可以重複使用（其他頁面也可以呼叫）
- 前端不再需要維護複雜的估算公式

---

## 📝 備註

### **效能考量**

- **查詢時間**：`COUNT(DISTINCT stock_id)` 應該在 **100ms 內** 完成（DuckDB 很快）
- **快取**：如果需要，可以在後端加入簡單的記憶體快取（5 秒內重複請求不重查）
- **Debounce**：前端應該 debounce 查詢（避免每次滑桿移動都觸發 API）

### **Debounce 實作**

在前端加入 debounce：

```typescript
import { useDebouncedCallback } from 'use-debounce';

const fetchUniverseCountDebounced = useDebouncedCallback(fetchUniverseCount, 500);

useEffect(() => {
  fetchUniverseCountDebounced();
}, [minMarketCap, minDailyVolume, excludeFinancial, excludeKY, includeEft]);
```

---

## 🔗 相關連結

- **問題來源**：`/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Strategy.tsx` 的 `estimateUniverseSize()` 函數
- **後端修改**：`/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/api/app.py`
- **前端修改**：`/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Strategy.tsx`
- **使用手冊**：`/Users/claw/Projects/tw-quant-selector/STRATEGY_GUIDE.md`（需要更新）

---

**建立者**：碼農1號  
**建立時間**：2026-05-30 22:40  
**預估工時**：2 小時  
**優先級**：🔥 高（錯誤資訊會誤導使用者）
