---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/671
title: 基礎策略架構與 DataProvider 介面
type: task
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-25
updated: 2026-05-25
howto: 依 spec 9.2
---

# T7 - 基礎策略架構與 DataProvider 介面

## 目標
實作 `BaseStrategy` 抽象類別（含 `compute_score()`, `get_required_data()`）、`DataProvider` Protocol，以及策略註冊與工廠機制。

## 驗收標準
- [x] `BaseStrategy` 定義 `compute_score(universe, as_of_date) -> dict[str, float]` 與 `get_required_data() -> list[str]`
- [x] `DataProvider` Protocol 定義 `get_daily_prices()` 與 `get_universe()`（spec 9.2）
- [x] 實作 `DuckDBDataProvider` 實作上述 Protocol
- [x] 策略註冊機制：可透過裝飾器或 dict 註冊策略類別
- [x] `StrategyFactory` 依名稱回傳策略實例
- [x] 資料缺失檢查：若策略所需資料不足，拋出明確錯誤

## 備註
所有策略繼承此基底，確保統一介面後才能被 Combiner 使用。
