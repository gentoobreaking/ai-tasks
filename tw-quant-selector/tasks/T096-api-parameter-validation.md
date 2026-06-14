---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/809
title: 加入 API 請求參數驗證
type: enhancement
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T096 - 加入 API 請求參數驗證

## 目標
部分 API 端點沒有驗證輸入參數，可能導致：
1. **異常錯誤**：傳入無效參數時，伺服器返回 500 錯誤
2. **SQL 錯誤**：日期格式錯誤導致 SQL 查詢失敗
3. **使用者體驗差**：錯誤訊息不明確，難以除錯

此任務要使用 FastAPI 的 Path/Query 驗證和 Pydantic 模型，加入輸入參數驗證。

### **受影响端点**
| 端点 | 参数 | 问题 |
|------|------|------|
| `/api/v1/signals/{signal_date}` | `signal_date: str` | 没有验证日期格式 |
| `/api/v1/stock-detail/{stock_id}` | `stock_id: str` | 没有验证股票代码格式 |
| `/api/v1/backtest` | `start_date, end_date` | 没有验证日期范围 |
| `/api/v1/portfolio` | `stock_id, shares, cost` | 没有验证数值范围 |

---

## 🎯 修复目标

1. **使用 FastAPI 的 Path/Query 验证**
2. **添加自定义验证器**（如日期格式、股票代码格式）
3. **返回明确的错误信息**（4xx 状态码 + 错误详情）

---

## 🔧 修复步骤

### **步骤 1：创建日期验证器**
**文件**：`src/tw_quant_selector/api/validators.py`（新建）

```python
from datetime import date, datetime
from fastapi import HTTPException, Query, Path
from typing import Optional


def validate_date_format(date_str: str, field_name: str = "date") -> date:
    """
    验证日期字符串格式（YYYY-MM-DD）
    Raises: HTTPException 400 if invalid
    """
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} format: '{date_str}'. Use YYYY-MM-DD"
        )


def validate_date_param(
    date_str: str = Query(..., description="Date in YYYY-MM-DD format")
) -> date:
    """FastAPI 参数验证器：日期格式"""
    return validate_date_format(date_str, "date")


def validate_stock_id(stock_id: str = Path(...)) -> str:
    """
    验证股票代码格式（4位数字 + .TW 或 .TWO）
    Examples: 2330.TW, 3008.TW, 6446.TWO
    """
    import re
    pattern = r'^\d{4}\.(TW|TWO)$'
    if not re.match(pattern, stock_id):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stock_id format: '{stock_id}'. Use: 2330.TW or 6446.TWO"
        )
    return stock_id


def validate_date_range(
    start_date: date,
    end_date: Optional[date] = None,
) -> tuple[date, date]:
    """
    验证日期范围
    - start_date 不能晚于 end_date
    - 日期范围不能超过 1 年
    """
    if end_date is None:
        end_date = date.today()

    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail=f"start_date ({start_date}) cannot be after end_date ({end_date})"
        )

    if (end_date - start_date).days > 365:
        raise HTTPException(
            status_code=400,
            detail=f"Date range too large: {(end_date - start_date).days} days. Maximum 365 days."
        )

    return start_date, end_date
```

---

### **步骤 2：修改 `signals_by_date()` 端点**
**文件**：`src/tw_quant_selector/api/app.py`

```python
from tw_quant_selector.api.validators import validate_date_param, validate_stock_id

# 修改前
@app.get("/api/v1/signals/{signal_date}")
def signals_by_date(
    signal_date: str,  # ← 没有验证
    strategy: str = "composite",
    top_n: int = Query(200, ge=1, le=500),
):
    # ...

# 修改后
@app.get("/api/v1/signals/{signal_date}")
def signals_by_date(
    signal_date: str = Path(..., regex=r'^\d{4}-\d{2}-\d{2}$'),  # ← 正则表达式验证
    strategy: str = "composite",
    top_n: int = Query(200, ge=1, le=500),
):
    # 验证日期格式
    parsed_date = validate_date_format(signal_date, "signal_date")

    # 查询数据库
    result = _get_signals(parsed_date, strategy, top_n)
    return api_response(result)
```

---

### **步骤 3：修改 `stock_detail()` 端点**
**文件**：`src/tw_quant_selector/api/app.py`

```python
# 修改前
@app.get("/api/v1/stock-detail/{stock_id}")
def stock_detail(stock_id: str):  # ← 没有验证
    # ...

# 修改后
@app.get("/api/v1/stock-detail/{stock_id}")
def stock_detail(
    stock_id: str = Path(..., regex=r'^\d{4}\.(TW|TWO)$')  # ← 验证股票代码格式
):
    # 查询数据库
    row = db.execute(
        "SELECT stock_id, stock_name, market, is_etf, industry FROM stocks WHERE stock_id = ?",
        [stock_id]
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Stock not found: {stock_id}")

    # ...
```

---

### **步骤 4：修改 `start_backtest()` 端点**
**文件**：`src/tw_quant_selector/api/app.py`

```python
from tw_quant_selector.api.validators import validate_date_range

class BacktestRequest(BaseModel):
    start_date: str
    end_date: Optional[str] = None
    strategy_weights: Optional[dict[str, float]] = None

    @validator('start_date', 'end_date')
    def validate_dates(cls, v, values):
        if v is None:
            return v
        parsed = validate_date_format(v, 'date')

        # 验证日期范围
        if 'start_date' in values and 'end_date' in values:
            validate_date_range(values['start_date'], parsed)

        return parsed

@app.post("/api/v1/backtest")
def start_backtest(req: BacktestRequest):
    # 验证日期范围
    start, end = validate_date_range(req.start_date, req.end_date)

    # 运行回测
    result = run_backtest(db, start, end, req.strategy_weights)
    return api_response(result)
```

---

### **步骤 5：修改 `add_portfolio_lot()` 端点**
**文件**：`src/tw_quant_selector/api/app.py`

```python
from pydantic import Field

class PortfolioLotRequest(BaseModel):
    stock_id: str = Field(..., regex=r'^\d{4}\.(TW|TWO)$')
    shares: int = Field(..., ge=1, description="Number of shares, must be >= 1")
    cost: float = Field(..., ge=0.01, description="Cost per share, must be >= 0.01")

    @validator('shares')
    def validate_shares(cls, v):
        if v <= 0:
            raise ValueError('shares must be positive')
        if v > 1000000:
            raise ValueError('shares too large (max 1,000,000)')
        return v

    @validator('cost')
    def validate_cost(cls, v):
        if v <= 0:
            raise ValueError('cost must be positive')
        if v > 100000:
            raise ValueError('cost too large (max 100,000)')
        return v

@app.post("/api/v1/portfolio")
def add_portfolio_lot(lot: PortfolioLotRequest):  # ← 使用 Pydantic 模型自动验证
    # 直接可用，已经过验证
    db.execute(
        "INSERT INTO portfolio (stock_id, shares, avg_cost) VALUES (?, ?, ?)",
        [lot.stock_id, lot.shares, lot.cost]
    )
    return api_response({"status": "success"})
```

---

## 🧪 测试计划

### **测试案例 1：日期格式验证**
```python
# 测试 validate_date_format()
assert validate_date_format("2026-05-30") == date(2026, 5, 30)

# 无效格式
with pytest.raises(HTTPException) as exc:
    validate_date_format("2026/05/30")
assert exc.value.status_code == 400

with pytest.raises(HTTPException) as exc:
    validate_date_format("abc")
assert "Invalid date format" in exc.value.detail
```

### **测试案例 2：股票代码验证**
```python
# 有效代码
assert validate_stock_id("2330.TW") == "2330.TW"
assert validate_stock_id("3008.TW") == "3008.TW"
assert validate_stock_id("6446.TWO") == "6446.TWO"

# 无效代码
with pytest.raises(HTTPException) as exc:
    validate_stock_id("2330")  # 缺少 .TW
assert exc.value.status_code == 400

with pytest.raises(HTTPException) as exc:
    validate_stock_id("abc.TW")  # 不是数字
assert exc.value.status_code == 400
```

### **测试案例 3：日期范围验证**
```python
# 有效范围
start, end = validate_date_range(date(2026, 1, 1), date(2026, 12, 31))
assert (end - start).days <= 365

# 无效范围
with pytest.raises(HTTPException) as exc:
    validate_date_range(date(2026, 12, 31), date(2026, 1, 1))
assert "cannot be after" in exc.value.detail

with pytest.raises(HTTPException) as exc:
    validate_date_range(date(2020, 1, 1), date(2026, 1, 1))
assert "too large" in exc.value.detail
```

### **测试案例 4：端到端测试**
```python
# 测试 /api/v1/signals/abc
response = client.get("/api/v1/signals/abc")
assert response.status_code == 400
assert "Invalid date format" in response.json()["error"]["message"]

# 测试 /api/v1/stock-detail/2330（缺少 .TW）
response = client.get("/api/v1/stock-detail/2330")
assert response.status_code == 400
assert "Invalid stock_id format" in response.json()["error"]["message"]

# 测试 /api/v1/backtest with invalid date range
response = client.post("/api/v1/backtest", json={
    "start_date": "2026-01-01",
    "end_date": "2020-01-01"
})
assert response.status_code == 400
assert "cannot be after" in response.json()["error"]["message"]
```

---

## 📊 工时估计

| 步骤 | 工时 | 说明 |
|------|------|------|
| 创建 `validators.py` | 1 小时 | 日期、股票代码、范围验证 |
| 修改 `signals_by_date()` | 30 分钟 | 加入日期验证 |
| 修改 `stock_detail()` | 30 分钟 | 加入股票代码验证 |
| 修改 `start_backtest()` | 30 分钟 | 加入日期范围验证 |
| 修改 `add_portfolio_lot()` | 30 分钟 | 使用 Pydantic 验证 |
| 测试验证 | 1 小时 | 单元测试 + 端到端测试 |

---

## 驗收標準
- [x] 建立 `src/tw_quant_selector/api/validators.py`（日期、股票代碼、範圍驗證函數）
- [x] `signals_by_date()` 端點：已使用 `date` 型別（FastAPI 自動驗證格式），無須變更
- [x] 修改 `stock_detail()` 端點：加入 Path pattern 驗證（`^\d{4}\.(TW|TWO)$`）
- [x] 修改 `start_backtest()` 端點：Pydantic `Field(pattern=...)` + endpoint `validate_date_format`/`validate_date_range`
- [x] 修改 `add_portfolio_lot()` 端點：改用 `PortfolioLotRequest` Pydantic 模型（shares >= 1、cost >= 0.01）
- [x] 同步修改 `add_lot()` 端點：改用 `LotRequest` Pydantic 模型
- [x] 測試案例通過（日期格式、股票代碼、日期範圍、數值範圍）27/27
- [x] 錯誤時返回 400（語義驗證）或 422（格式驗證）

## 備註
- **為什麼不用正則表達式中 `regex` 參數？** FastAPI 的 `Path(..., regex=...)` 只驗證格式，不驗證語義（如 2026-02-30 是無效日期）
- 需要自定义验证器做完整的日期解析
- **未來擴展**：可以加入 API Key 驗證（防止未授權存取）、Rate Limiting（防止 API 濫用）
- **參考**：CODE_REVIEW_REPORT.md 問題 9（🟡 中等）

