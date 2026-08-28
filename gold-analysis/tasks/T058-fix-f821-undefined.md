---
id: T058
github_issue: ""
title: 修復 F821 未定義名稱 (macd List 等)
project: gold-analysis
type: bug
priority: medium
status: pending
depends_on: []
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T058 - 修復 F821 未定義名稱 (macd List 等)

## 目標
`ruff --select F821` 報告若干未定義名稱，其中部分為真實 bug：
- `app/indicators/macd.py:196` 回傳型別標註 `-> List[MACDCrossSignal]`，但該檔僅匯入 `Optional, Sequence, Tuple`，未匯入 `List`（在 `from __future__ import annotations` 下為潛在 NameError）。
- `app/ml/model_monitor.py` 的 `latest`（已由 T053 處理）。
- `app/models/alert.py:36`、`app/models/decision.py:79` 的 `Mapped["User"]` 經確認為 ruff 誤報（`User` 已於 `app/models/__init__.py` 匯入，SQLAlchemy registry 可解析）。

## 驗收標準
- [ ] 修復 `macd.py` 缺失的 `List` 匯入（或改用內建 `list`）
- [ ] 確認 `model_monitor` 的 `latest` 由 T053 修復
- [ ] 驗證 `alert.py`/`decision.py` 的 `User` 前向參照在 `configure_mappers()` 時可正確解析（加/補 mapping 測試）
- [ ] `ruff check app --select F821` 僅剩經確認的誤報（或全清）

## 備註
- 優先處理真實 bug；誤報部分加註說明即可，勿為了過 lint 而破壞 ORM 前向參照。
