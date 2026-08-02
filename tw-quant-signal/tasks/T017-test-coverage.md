---
github_issue: ""
title: "[Phase 3] 測試覆蓋 — 單元測試 + 整合測試"
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-02
---

# T017 — 測試覆蓋（單元測試 + 整合測試）

## 目標
導入 pytest 測試框架，為核心模組提供單元測試與整合測試覆蓋。目標覆蓋核心邏輯模組（rules、backtest、indicators、scorecard）達到 70% 以上關鍵路徑。

## 驗收標準

### S1: 測試基礎設施
- [ ] 在 `[project.optional-dependencies]` 增加 `pytest>=7.0` 和 `pytest-cov>=4.0`
- [ ] 創建 `tests/` 目錄結構：
  ```
  tests/
  ├── __init__.py
  ├── conftest.py          # fixture: in-memory SQLite DB + sample data
  ├── test_rules.py        # 規則引擎測試
  ├── test_backtest.py     # 回測框架測試
  ├── test_indicators.py   # 技術指標計算測試
  ├── test_features.py     # 特徵計算測試
  ├── test_scorecard.py    # 11大指標計分測試 (T015 相關)
  └── test_integration.py  # 管線端到端集成測試
  ```
- [ ] `uv run pytest` 可正常執行
- [ ] `uv run pytest --cov=src/tw_quant_signal --cov-report=term` 輸出覆蓋率報告

### S2: 規則引擎 (test_rules.py) — 高優先度
- [ ] `_eval_condition()` 測試各運算子: eq / neq / gt / gte / lt / lte / in / not_in
- [ ] `evaluate_rule()` 測試：單一規則 AND/OR/any 組合
- [ ] `_load_rules()` 測試：規則檔案有無聚合機會
- [ ] `_the facts() test`：依 STATEFさ權重測定正確計算對

### S3: 回測框架 (test_backtest.py) — 高優先度
- [ ] `CostModel.round_trip_cost()` 交成本計算正確性
  - 非當沖 = 0.3% 稅 + 0.1425% * 0.6 買 + 0.1425% * 0.6 賣
  - 當沖 = 0.15% 稅 + 0.1425% * 0.6 雙邊買賣
- [ ] `_forward_return()` 測試：前後期間資料存在性
- [ ] `run_backtest()` 整合測試：使用 in-memory DB 進行小樣本回測
- [ ] 回測結果的統計量：win_rate / avg_return / max_drawdown / profit_ratio

### S3: 技術指標 (test_indicators.py) — 中優先度
- [ ] `compute_indicators()` 正確性：已知訂單資料的 MA5/MA20/BB 計算值
- [ ] RSI 在極端值下的正確運作
- [ ] BB 通道三個地帶點正確分類 (95% CI, 2-stdev band)
- [ ] 空資料或不足資料的預期處理

### S4: 特徵計算 (test_features.py) — 中優先度
- [ ] `_signal_ma()` 三個特值傾向輸出
- [ ] `_signal_rsi()` 輸出正確
- [ ] `_signal_pe()`/`_signal_pb()`/`_signal_dy()` ゼ值邊界

### S5: Scorecard (test_scorecard.py) — 中
- [ ] 多方 11 11指標完整計算 test（對應 T015）
- [ ] 空方 11 11指標計算
- [ ] 記多布林 frontier test

### S6: 整合測試 (test_integration.py) — 中優先度
- [ ] 用 in-memory SQLite 建立 60+ 日模擬資料
- [ ] `rule_compute_and_store` → pipeline 產生一筆一日交易完整流程
- [ ] 檢查 `rule_signals` 表輸出

### 不納入測試範圍
- [ ] twse_client.py (外部 API call，mock test 暫不需要)
- [ ] alerter.py (I/O test 太難 mock)
- [ ] pipeline.py 的全體管線行程 (太慢)

## 測試他範

```python
# test_rules.py 示例
def test_evaluate_rule_bullish_basic(sample_rule):
    result = evaluate_rule(sample_rule, features, all_stock_feats, index_feats, breadth_feats)
    assert result is True

def test_eval_condition_gt(sample_condition):
    assert _eval_condition({"feature": "volume", "operator": "gt", "value": 1.0}, {"volume": 2.0}) is True
    assert _eval_condition({"feature": "volume", "operator": "gt", "value": 1.0}, {"volume": 0.5}) is False
```

## 備註
- 這是品質控制計劃，不是特色功能 — 這是保證已實現功能可靠性的基礎
- 優先完成 S2 + S3（核心計算模組），然後再投入 S4/S5
- 整合測試需 in-memory DB 和歷史資料 fixture