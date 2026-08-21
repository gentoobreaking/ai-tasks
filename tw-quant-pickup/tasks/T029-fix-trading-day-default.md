---
github_issue: ""
title: 修正預設日期為最近交易日（避免週末誤跑）
type: feature
priority: low
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-22
updated: 2026-08-22
---

# T029: 修正預設日期為最近交易日（避免週末誤跑）

## 背景
- `auto_daily.py` 預設用 `date.today()` → 週六/週日會誤觸發 pipeline
- `cli/main.py` 的 `--date` 無預設值，且 `_market_date()` 不處理 None → 必須手動帶參數，帶週末也會跑
- 兩者皆未使用既有的 `_get_latest_market_date()`（跳過週末）

## 影響範圍
| 檔案 | 修改項目 |
|------|----------|
| `scripts/auto_daily.py` | 第 84 行：預設日期邏輯 |
| `cli/main.py` | 第 222-224 行：`--date` 加 default；第 55-56 行：`_market_date()` 處理 None |

---

## 1. `scripts/auto_daily.py` 修改

### 現況（第 78-91 行）
```python
def main() -> int:
    parser = argparse.ArgumentParser(description="Auto-run daily pipeline if missing")
    parser.add_argument("--date", help="Target date (YYYY-MM-DD), default: today")
    parser.add_argument("--dry-run", action="store_true", help="Dry run only")
    args = parser.parse_args()

    target_date = date.fromisoformat(args.date) if args.date else date.today()
    ...
```

### 修改後
```python
def _get_latest_market_date() -> date:
    """取最近一個交易日（簡易：跳過週末）。"""
    from datetime import timedelta
    d = date.today()
    while d.weekday() >= 5:  # 5=Sat, 6=Sun
        d -= timedelta(days=1)
    return d


def main() -> int:
    parser = argparse.ArgumentParser(description="Auto-run daily pipeline if missing")
    parser.add_argument("--date", help="Target date (YYYY-MM-DD), default: latest trading day")
    parser.add_argument("--dry-run", action="store_true", help="Dry run only")
    args = parser.parse_args()

    target_date = date.fromisoformat(args.date) if args.date else _get_latest_market_date()
    ...
```

**說明**：
- 抽出 `_get_latest_market_date()` 為模組層級函式（回傳 `date` 型別，避免字串轉換）
- help 文字同步更新

---

## 2. `cli/main.py` 修改

### 2.1 `--date` 參數加預設值（第 220-224 行）

**現況**：
```python
def _add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--date",
        help="市場日期（YYYY-MM-DD，預設：最近交易日）",
    )
```

**修改後**：
```python
def _add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--date",
        default=_get_latest_market_date(),
        help="市場日期（YYYY-MM-DD，預設：最近交易日）",
    )
```

> 注意：`_get_latest_market_date()` 回傳 `str` (ISO format)，argparse 會直接用字串當預設值，`_market_date()` 再轉 `date` 型別。

### 2.2 `_market_date()` 處理 None（第 55-56 行）

**現況**：
```python
def _market_date(args: argparse.Namespace) -> date:
    return date.fromisoformat(args.date)
```

**修改後**：
```python
def _market_date(args: argparse.Namespace) -> date:
    d = args.date
    if d is None:
        d = _get_latest_market_date()
    return date.fromisoformat(d)
```

> 雖然 argparse 有 default，但防禦性程式設計：仍處理 None，確保相容。

---

## 測試驗證

### 單元測試（建議新增/更新）
- `tests/test_auto_daily.py`：驗證 `main()` 在週六/週日預設回傳週五
- `tests/test_cli_main.py`：驗證 `_market_date()` 處理 None、`--date` 預設值

### 人工驗證
```bash
# 1. auto_daily.py 在週六預設跑週五
docker exec tw-quant-scheduler python scripts/auto_daily.py --dry-run 2>&1 | head -5
# 預期：market_date=2026-08-21 (Friday)

# 2. CLI 不帶 --date 使用預設
docker exec tw-quant-scheduler python -m cli daily --dry-run 2>&1 | head -5
# 預期：Starting daily pipeline for 2026-08-21

# 3. 各 subcommand 同樣生效
docker exec tw-quant-scheduler python -m cli collect --dry-run
docker exec tw-quant-scheduler python -m cli validate --dry-run
```

---

## 風險評估

| 風險 | 等級 | 緩解 |
|------|------|------|
| 現有腳本依賴 `date.today()` 行為 | 低 | 週一~週五行為不變，僅週末改為往前找 |
| `_get_latest_market_date()` 只跳過週末，未處理國定假日 | 中 | 現狀即如此，後續可擴充假日表（T030+） |
| 影響所有 subcommand（collect/validate/...） | 低 | 行為一致化，皆改為「預設最近交易日」 |

---

## 實作順序
1. 修改 `scripts/auto_daily.py`（獨立，無相依）
2. 修改 `cli/main.py` 兩處
3. 執行 `ruff check . --fix` 格式化
4. 執行 `pytest tests/` 驗證
5. 人工驗證上述指令

---

## 後續可擴充（T030+）
- 引入台灣交易日曆（`pandas_market_calendars` 或自訂 YAML）
- `_get_latest_market_date()` 整合假日表
- 考慮盤後資料時間（13:30 收盤後才算「當日資料就緒」）
