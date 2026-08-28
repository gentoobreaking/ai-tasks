# Gold Monitor Pro v4 - 專案規格

**專案**: `gold-monitor-pro-v4`
**建立時間**: 2026-05-01 01:14
**更新時間**: 2026-05-01 01:36
**狀態**: 待確認後執行

---

## 問題分析

| # | 問題 | 維修方式 |
|---|------|---------|
| 1 | 黃金存摺 day page 價格有時錯誤 | 台銀 day page 為主，玉山銀行交叉驗證（差 > 5 元發警告不發 alert） |
| 2 | 銀/鉑金台銀不提供（永遠 N/A） | 移除 BOTAdapter，純 Yahoo Finance |
| 3 | 存摺 vs 國際報價混在同一物件，誤導人 | 分成 4 個獨立監控物件 |
| 4 | 變動監控依賴 SQLite（應完全獨立） | `/tmp/` 快取，不碰 SQLite |
| 5 | 週一特殊邏輯未實作 | 統一取上週五收盤比對 |

**year page 完全不用。**

---

## 新的監控物件

| 物件ID | 名稱 | 來源 | 比較基準 | 閾值 |
|--------|------|------|---------|------|
| `gold_local` | 📊台銀黃金存摺 | 台銀 day page（玉山交叉驗證） | 同日 intraday 前一筆 / 上週五 | 30 NTD |
| `gold_intl` | 🌐國際黃金現貨 | Yahoo Finance（AV 備用） | 同日上次報價 / 上週五 | 25 USD |
| `silver_intl` | 🌐國際白銀現貨 | Yahoo Finance（AV 備用） | 同日上次報價 / 上週五 | 20 USD |
| `platinum_intl` | 🌐國際鉑金現貨 | Yahoo Finance（AV 備用） | 同日上次報價 / 上週五 | 15 USD |

---

## 四種物件的比較基準（統一）

**同日 intraday 前一筆 / 上週五**

- `gold_local`：
  - 一般日：day page 倒數第二筆 vs 最後一筆
  - day page 只有 1 row：設定基準，不 alert（開盤初期）
  - 週一：day page 最後一筆（上週五收盤）vs 倒數第二筆
- `gold_intl / silver_intl / platinum_intl`：
  - 同日：快取中上一筆 vs 今日最新
  - 跨日（週一）：取 history 快取（/tmp/gold_monitor_history.json）中的上週五收盤
  - 國際金屬週末有報價（期貨市場），週五收盤後的快取以 history 快取為準

---

## 黃金存摺取值方式

```
主來源：台灣銀行 day page
驗證來源：玉山銀行（交叉驗證）
台銀失敗時：玉山銀行作為 spare（需交叉驗證後才能 alert）
```

---

## 國際報價資料來源

```
gold_intl / silver_intl / platinum_intl:
  優先 1：Yahoo Finance（GC=F / SI=F / PL=F）
  優先 2：Alpha Vantage（備用）
  匯率：Yahoo Finance（USDTWD=X）
```

---

## 閾值配置（config.json）

```json
{
  "thresholds": {
    "gold_local": 30,
    "gold_intl": 25,
    "silver_intl": 20,
    "platinum_intl": 15
  }
}
```

---

## 快取檔案設計

| 檔案 | 用途 |
|------|------|
| `/tmp/gold_monitor_local_baseline.json` | gold_local 的前一筆快取 |
| `/tmp/gold_monitor_intl_{metal}.json` | 國際報價上次報價快取 |
| `/tmp/gold_monitor_history.json` | 每週五寫入，供週一取上週五收盤 |

---

## 任務清單

| T# | 標題 | 依賴 | 優先 |
|----|------|------|------|
| T001 | 分離監控物件（存摺 vs 國際分開） | — | 🔴 |
| T002 | 重寫 gold_local 監控邏輯（含週一特殊處理） | T001 | 🔴 |
| T003 | 重寫國際報價監控邏輯（含 Yahoo→AV fallback） | T001 | 🔴 |
| T004 | 交叉驗證機制（台銀 vs 玉山銀行） | T002 | 🟡 |
| T005 | 更新 config.json schema + 閾值設定 | — | 🟡 |
| T006 | 銀/鉑金的 BOTAdapter 移除 | T001 | 🟡 |
| T007 | 每日快取清理（--daily 後執行） | T002,T003 | 🟢 |
| T008 | 整合測試（比對官網報價） | T002,T003,T004 | 🔴 |

---

## 程式架構（拆分為兩支獨立程式）

```
/Users/claw/Projects/gold-monitor-pro-v4/
├── gold_local_monitor.py     ← 📊黃金存摺（台銀 + 玉山交叉驗證）
└── gold_intl_monitor.py      ← 🌐國際金屬（gold/silver/platinum）
```

**拆分理由**：
- 不同市場、不同來源，應獨立運行
- 獨立排程（存摺 10 分鐘，國際可不同頻率）
- 故障不互影響
- 玉山銀行邏輯直接內嵌在 gold_local_monitor.py，不獨立 adapter

---

## 替換方式（由豪執行）

驗證通過後，由豪手動執行以下步驟：

```bash
# 1. 備份原檔
cp /Users/claw/scripts/gold_monitor_pro.py /Users/claw/scripts/gold_monitor_pro.py.bak

# 2. 複製兩支新程式
cp /Users/claw/Projects/gold-monitor-pro-v4/gold_local_monitor.py /Users/claw/scripts/
cp /Users/claw/Projects/gold-monitor-pro-v4/gold_intl_monitor.py /Users/claw/scripts/

# 3. 驗證
python3 /Users/claw/scripts/gold_local_monitor.py --check
python3 /Users/claw/scripts/gold_intl_monitor.py --check

# 4. 確認無誤後，刪除備份（可選）
# rm /Users/claw/scripts/gold_monitor_pro.py.bak
```

---

*更新：2026-05-01 02:29*