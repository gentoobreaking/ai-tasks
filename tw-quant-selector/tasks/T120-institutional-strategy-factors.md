---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/829
title: 法人策略因子計算（Pandas 向量化重構）
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-06-02
updated: 2026-06-05
howto: |
  1. 在 strategies/institutional_factor.py 重構為 Pandas 向量化架構
  2. 實作 calc_institutional_concurrence() - 法人同買因子 (Vectorized)
  3. 實作 calc_sitca_share_ratio() - 投信鎖碼佔比 (Vectorized)
  4. 重構 compute_score()：將 N 次 SQL 查詢合併為 1 次 Batch Query
  5. 確保全市場計算效能 < 50ms
  6. 更新單元測試以符合新的 DataFrame 介面
---

# T120 - 法人策略因子計算（Pandas 向量化重構）

## 目標
實作 realtime-1.txt Section 2.2 的法人策略因子，並將 `InstitutionalFactor` 策略從「逐股循環 (Loop-based)」重構為「Pandas 向量化 (Vectorized)」運算，以達成全市場秒級監控效能。

## 重構原因與方式

### 為什麼要重構？ (Why)
- **效能瓶頸**：原有的逐股循環模式會產生「N+1 查詢問題」，每計算一檔股票都要發送一次 SQL，導致全市場 1,100 檔股票計算耗時數秒，無法滿足即時監控需求。
- **效能目標**：根據規格書要求，全市場計算必須在 **50ms** 內完成，僅能透過向量化運算達成。

### 如何重構？ (How)
1. **Batch SQL**：使用單一 SQL 語句（搭配 `ROW_NUMBER()` 窗口函數）一次取回全市場 universe 中所有股票的籌碼資料，取代原有的 1,100 次查詢。
2. **Matrix Operations**：利用 Pandas 的矩陣運算處理加權分數、Z-score 以及新增的策略因子。
3. **Column Mapping**：將資料庫原始欄位映射為規格書要求的 `ForeignNetShares` 與 `TrustNetShares`。

## 驗收標準
- [x] **重構後的 `strategies/institutional_factor.py` 核心函數**：

  **1. 法人同買因子（Institutional Concurrence）**：
  ```python
  def calc_institutional_concurrence(df: pd.DataFrame) -> pd.Series:
      """
      計算外資與投信同時買超的布林值序列
      公式：ForeignNetShares > 0 AND TrustNetShares > 0
      """
      return (df['ForeignNetShares'] > 0) & (df['TrustNetShares'] > 0)
  ```

  **2. 投信鎖碼佔比（SITCA Share Ownership Ratio）**：
  ```python
  def calc_sitca_share_ratio(df: pd.DataFrame, shares_outstanding: pd.DataFrame) -> pd.Series:
      """
      計算投信單日淨買張數佔發行張數比例
      """
      merged = df.merge(shares_outstanding, left_index=True, right_index=True)
      return merged['TrustNetShares'] / merged['SharesOutstanding']
  ```

- [x] **權重分配更新**（總和 1.0）：
  - 外資流向 (Foreign Flow)：0.4
  - 投信流向 (Trust Flow)：0.2
  - 連續買賣超 (Consec Days)：0.2
  - **法人同買加成 (Concurrence)**：0.1
  - **投信鎖碼佔比加成 (SITCA Ratio)**：0.1

- [x] **效能驗收**：
  - 確保 `compute_score()` 在處理 1,100 檔股票時，包含資料庫讀取與計算的總耗時 < 50ms。

- [x] **單元測試更新**：
  - 測試向量化函數的正確性。
  - 測試效能指標是否達標。

## 備註
- ⚠️ **重構重點**：嚴禁使用 Python `for` 迴圈處理 DataFrame 資料。
- ⚠️ **依賴項**：需確保 PostgreSQL 索引 `ix_institutional_flows_date` 已建立以優化 Batch Query。
