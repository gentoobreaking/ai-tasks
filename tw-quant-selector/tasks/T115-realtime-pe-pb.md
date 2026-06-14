---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/824
title: 盘中即时 PE/PB 计算实作
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-06-02
updated: 2026-06-04
howto: |
   1. 创建 data/realtime_valuation.py（含 RealtimeValuationResult + compute_realtime_valuation）
   2. 实现 TTM EPS、BVPS、年股息查询（含 Look-ahead bias 防护）
   3. 实现 PE/PB/殖利率计算（EPS < 0 → None, PE > 200 → ">200"）
   4. 更新 realtime_quotes.py → poll_realtime 写入 pe_realtime/pb_realtime/yield_realtime
   5. 更新 models.py → RealtimeQuoteModel 新增三栏
   6. 更新 app.py → stock_detail 回传 realtime_valuation 物件
   7. 新增 frontend RealtimeValuationBadge 组件（含颜色逻辑）
   8. 整合至 StockDetail.tsx 标头区
   9. 新增 color.ts: colorForPe / colorForDivergence
   10. 25 个后端测试 + 15 个前端测试
---

# T115 - 盘中即时 PE/PB 计算实作

## 目标
实现盘中即时 PE/PB 计算功能，使用 MIS API 取得的即时成交价计算估值指标，并在 React UI 动态显示。

## 验收标准
- [x] 创建 `data/realtime_valuation.py`
- [x] 实现 `RealtimeValuation` 类别：
  - 实现 `compute(stock_id, current_price, as_of_datetime)` 方法
  - 回传 `RealtimeValuationResult` 物件

- [x] 计算公式（参考 Streamlit.md §3.2）：
  - 即时 PE = 当前股价 / 近四季 EPS 合计（TTM）
  - 即时 PB = 当前股价 / 最新季每股净值
  - 即时殖利率 = 近 12 个月股息 / 当前股价

- [x] 实现 Look-ahead bias 防护：
  - `_get_eps_ttm(stock_id, as_of_date)`：只使用已公告的财报
  - `_get_bvps(stock_id, as_of_date)`：使用最新季财报
  - `_get_annual_dividend(stock_id, as_of_date)`：使用近 12 个月股息
  - 参考主规格书 §7.3 规范

- [x] 特殊处理：
  - EPS < 0（亏损股）：PE 应为 `None`（不显示负数）
  - PE > 200：显示「> 200」（避免亏转盈后的极端值）
  - PB = 0 或 None：显示为「—」

- [x] 更新 `data/realtime_quotes.py`：
  - 在 `fetch_all()` 之後，呼叫 `RealtimeValuation.compute()`
  - 将计算结果写入 `realtime_quotes` 表（pe_realtime, pb_realtime, yield_realtime）

- [x] **新增 Section 3.3 UI 整合呈现（React/TypeScript）**：
  - 在个股即时 K 线或五档报价旁，以小标签（Badge）动态显示 RT-PE 与 RT-PB
  - 若数值触及历史极值区间：
    - PB < 1.0：该组件文字颜色自动切换为绿色（低估亮点）
    - 高于同业平均 2 倍：切换为黄橘色（高估警讯）
  - 实现 React 组件 `RealtimeValuationBadge`：
    - Props: `stockId`, `currentPrice`, `peRt`, `pbRt`, `industryAvgPb`
    - 使用 TypeScript 定义 interface
    - 动态计算颜色样式（绿/黄橘/黑）
  - 在 `pages/StockDetail.tsx` 中整合该组件

- [x] 前端显示规则（参考 Streamlit.md §3.6）：
  - 盘中（09:00-13:30）：显示「即时值」，栏位标头显示「PE（即时）」
  - 盘後/非交易时段：显示收盘计算值，标头显示「PE（收盘）」
  - 即时值与昨收估值差异 > 5% 时，显示差异提示

- [x] 单元测试：
  - 测试 PE 计算正确性（股价 943, EPS TTM 42.80 → PE = 22.04）
  - 测试亏损股 PE = None
  - 测试 Look-ahead bias 防护（2024-05-01 查询，不应看到 2024-Q1 财报）
  - **新增**：测试 `RealtimeValuationBadge` 组件渲染正确性
  - **新增**：测试颜色切换逻辑（PB < 1.0 → 绿色）

## 备注
- 参考 Streamlit.md §3.2 盘中即时 PE/PB 计算规格
- 参考 realtime-1.txt Section 3.3 UI 整合呈现规格
- ⚠️ **依赖 T121（MIS API 即时报价轮询）**，需先完成
- 财报资料截止日（data_as_of）应在回传结果中注明
- 计算失败时（如财报缺失），PE/PB 应为 None，不应抛出异常
- 盘中刷新频率：每 5 分钟全市场扫描一次
- **新增功能**：React UI 动态显示提升使用者体验，颜色提示帮助快速判断估值高低
