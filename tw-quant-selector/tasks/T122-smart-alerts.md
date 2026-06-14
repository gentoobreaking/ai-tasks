---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/831
title: 10 种智慧警示条件实作（Pandas 筛选）
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-06
howto: |
  1. 在 monitoring/alerting.py 新增 10 个警示检查函数
  2. 全部使用 Pandas 向量化运算（禁止 for loop）
  3. 实现 check_volume_spike(), check_high_vol_no_move(), ... 等
  4. 在 AlertChecker.check_all() 中呼叫所有新函数
  5. 确保每个警示都有冷却机制（alert_cooldowns 表）
---

# T122 - 10 种智慧警示条件实作（Pandas 筛选）

## 目标
实作 realtime-1.txt Section 4 的 10 种智慧警示条件，全部使用 Pandas 向量化运算。

## 验收标准
- [x] 在 `monitoring/alerting.py` 中新增以下函数（全部使用向量化运算）：

  **【一、量价与动能异常类】**

  **1. ⚡ 绝对爆量突破（Volume Spike）**：
  ```python
  def check_volume_spike(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：当前成交量 > 同类别（股票/ETF）当日成交量中位数的 10 倍
      返回：触发警示的股票 DataFrame
      """
      median_vol = df.groupby('Category')['TradeVolume'].transform('median')
      alert_mask = df['TradeVolume'] > (median_vol * 10)
      return df[alert_mask]
  ```

  **2. 📉 有量无力/出货警讯（High Volume, No Move）**：
  ```python
  def check_high_vol_no_move(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：成交张数排名全市场前 50 名，但今日振幅（涨跌幅）压缩在 ±0.5% 之间
      """
      top_50_vol = df['TradeVolume'].nlargest(50).index
      alert_mask = df.index.isin(top_50_vol) & (df['Return_Pct'].abs() <= 0.5)
      return df[alert_mask]
  ```

  **3. 🚀 瞬间资金吸金怪兽（Turnover Monster）**：
  ```python
  def check_turnover_monster(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：单一个的当日成交金额（TradeValue）占整个上市市场当日总成交金额的 2% 以上（排除台积电）
      """
      market_total_value = df['TradeValue'].sum()
      alert_mask = (df['TradeValue'] / market_total_value >= 0.02) & (df['Code'] != '2330')
      return df[alert_mask]
  ```

  **4. 📈 异常高低价差（Intraday Volatility）**：
  ```python
  def check_intraday_volatility(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：(HighestPrice - LowestPrice) / PrevClose > 8%，且 P_current 收在全日振幅最低的前 10% 区间（长上影线黑K）
      """
      volatility = (df['HighestPrice'] - df['LowestPrice']) / df['PrevClose']
      price_position = (df['CurrentPrice'] - df['LowestPrice']) / (df['HighestPrice'] - df['LowestPrice'])
      
      alert_mask = (volatility > 0.08) & (price_position <= 0.1)
      return df[alert_mask]
  ```

  **【二、大盘共识与族群类】**

  **5. 🌊 族群集体高潮（Industry Momentum）**：
  ```python
  def check_industry_momentum(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：相同产业分组（Industry）中，有超过 30% 的个股同时达到「涨幅 > 4%」
      """
      df['Is_Strong'] = df['Return_Pct'] > 4.0
      industry_strong_ratio = df.groupby('Industry')['Is_Strong'].transform('mean')
      alert_mask = industry_strong_ratio > 0.30
      return df[alert_mask]
  ```

  **6. 🛡️ 逆市英雄（Against the Trend）**：
  ```python
  def check_against_trend(df: pd.DataFrame, market_weak: bool) -> pd.DataFrame:
      """
      逻辑：大盘惨跌（全市场有 70% 以上个股收黑），但该个股却逆势上涨 > 2% 且成交量大於其 5 日均量
      """
      if not market_weak:
          return pd.DataFrame()  # 大盘不弱时不触发
      
      alert_mask = (
          (df['Close'] < 0) &  # 全市场 70% 收黑（由呼叫者判断）
          (df['Return_Pct'] > 2.0) &
          (df['TradeVolume'] > df['Volume_5d_avg'] * 1.2)
      )
      return df[alert_mask]
  ```

  **7. 🚨 鸡犬升天/末跌段警讯（Low Price Junk Rally）**：
  ```python
  def check_low_price_junk_rally(df: pd.DataFrame, market_high: bool) -> pd.DataFrame:
      """
      逻辑：大盘处于高档，但当日涨停（涨幅 > 9.5%）的个股中，股价 < 30 元的低价投机股占比超过 60%。此為系统全域警示（Global System Alert）
      """
      if not market_high:
          return pd.DataFrame()
      
      limit_up_stocks = df[df['Return_Pct'] > 9.5]
      if len(limit_up_stocks) == 0:
          return pd.DataFrame()
      
      low_price_ratio = (limit_up_stocks['Price'] < 30).sum() / len(limit_up_stocks)
      if low_price_ratio > 0.6:
          return pd.DataFrame([{'Alert': 'LOW_PRICE_JUNK_RALLY', 'Ratio': low_price_ratio}])
      else:
          return pd.DataFrame()
  ```

  **【三、ETF 与衍生性特殊类】**

  **8. 💰 ETF 异常套利空间（Premium/Discount Alarm）**：
  ```python
  def check_etf_premium_discount(df: pd.DataFrame, nav_df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：规模前 20 大的 ETF，其市价与预估净值（由 MIS API 取得或初级市场估算）之折溢价率 > 0.5% 或 < -0.5%
      """
      merged = df.merge(nav_df, on='Code')
      merged['Premium_Discount'] = (merged['Price'] - merged['Estimated_NAV']) / merged['Estimated_NAV']
      
      alert_mask = (merged['Premium_Discount'].abs() > 0.005) & (merged['Size_Rank'] <= 20)
      return merged[alert_mask]
  ```

  **9. 🐋 巨人的移动（Whale Move Alert）**：
  ```python
  def check_whale_move(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：三大权重股（2330 台积电、2454 联发科、2317 鸿海）单日涨跌幅波动超过 ±3%。一旦触发，触发 React 前端全萤幕侧边栏闪烁，提示大盘指数即将剧烈波动
      """
      whale_stocks = ['2330', '2454', '2317']
      alert_mask = df['Code'].isin(whale_stocks) & (df['Return_Pct'].abs() > 3.0)
      return df[alert_mask]
  ```

  **10. 🔄 主动式/新制 ETF 异常活络（New Product Hype）**：
  ```python
  def check_active_etf_hype(df: pd.DataFrame) -> pd.DataFrame:
      """
      逻辑：代码字尾为 A、D、T 的新制主动式 ETF，其今日成交张数进入所有 ETF 类别的前 10%
      """
      etf_only = df[df['Category'] == 'ETF']
      if len(etf_only) == 0:
          return pd.DataFrame()
      
      vol_cutoff = etf_only['TradeVolume'].quantile(0.90)
      alert_mask = (
          etf_only['Code'].str.endswith(('A', 'D', 'T')) &
          (etf_only['TradeVolume'] >= vol_cutoff)
      )
      return etf_only[alert_mask]
  ```

- [x] 在 `AlertChecker` 类别中新增方法：
  - `check_all_smart_alerts()`：呼叫上述 10 个函数
  - `_build_smart_alert_df()`：从 DB 构建 DataFrame
  - `_get_market_context()`：判定市场强弱

- [x] 在 `AlertChecker.check_all()` 中整合：
  - 最後呼叫 `check_all_smart_alerts()`
  - 触发警示时，写入 `alert_history` 表
  - 遵守冷却机制（`alert_cooldowns` 表）

- [x] 效能要求：
  - **严格禁止 for loop 迭代 DataFrame**
  - 全部使用 Pandas 向量化运算（Boolean Indexing, Vectorized Operations）

- [x] 单元测试：
  - 测试每个警示条件的触发逻辑（26 个测试全部通过）
  - 测试冷却机制整合
  - 测试非盘中时段/周末自动跳过

## 备注
- 参考 realtime-1.txt Section 4 完整警示条件清单
- ✅ **T121（MIS API 即时报价）** — 已完成，提供 realtime_quotes 資料源
- ⚠️ **严格禁止 for loop**，必须使用 Pandas 向量化运算
- 10 种警示条件分为三类：量价与动能异常（4 种）、大盘共识与族群（3 种）、ETF 与衍生性（3 种）
- 触发频率：盘中每 5 分钟检查一次（与 T121 轮询同步）
- 系统全域警示（如 LOW_PRICE_JUNK_RALLY）需特别标记，在 React 前端全萤幕闪烁
