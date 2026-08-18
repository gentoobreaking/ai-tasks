---
github_issue: N/A
title: ETF Data Availability & Adapter Spec（TWSE/MOPS 官方資料盤點 + Data Adapter）
type: task
priority: P1
status: done
depends_on: [T003, T006]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T012a - ETF Data Availability & Adapter Spec（TWSE/MOPS 官方資料盤點 + Data Adapter）

## 目標

依 review-v0.4（ETF 官方資料其實可得）與 review-v0.3 #17（先鎖定設計契約再寫 code）：產出 **ETF Data Availability & Adapter Specification**（4 張設計契約表），盤點 TWSE / MOPS / 投信 / 基金資訊觀測站 / tw-quant-mcp 各能提供什麼，再實作 `etf/data_adapter.py`（L1-L2 官方資料正規化）。這是 T012（ETF Engine）的前置任務，未通過前不得開工 Engine。

## 驗收標準

### 設計契約（4 張表，產出文件鎖定）

- [x] **ETF Factor Definition**：8 因子（distribution / yield_stability / tracking_difference / liquidity / volatility / price_position / nav_discount / underlying_valuation）各自的 exact formula、資料來源層級（§30.6）
- [x] **Data Availability Matrix**（§30.1 L1-L4）：逐項列出——market price / volume / turnover / NAV / 預估 NAV / Premium-Discount / units outstanding / tracking difference / fund size / holdings / distribution / expense ratio——各標 TWSE / MOPS / 投信 / tw-quant-mcp 來源與可得性
- [x] **Weight Renormalization Matrix**（§30.2）：全部齊時、缺 tracking、缺 nav、只剩 2 因子、< 下限等情境對應 active weight 或 INVALID
- [x] **ETF State Machine**（§30.3-30.5）：factor status 轉移（AVAILABLE / NOT_YET_AVAILABLE / DATA_UNAVAILABLE / STALE / INVALID / INSUFFICIENT_HISTORY）

### Adapter 實作（§30.1）

- [x] `etf/data_adapter.py` 可抓 TWSE ETF 即時淨值揭露（NAV / 預估 NAV / 折溢價，L1）並正規化為內部 schema
- [x] L2：tracking difference / fund size（官方定期揭露），頻率感知（非每日）
- [x] `premium_discount = (market_price - nav) / nav` 計算公式 unit test（含正負值、NAV 為 0 防呆）
- [x] lineage 標註：官方設 CANONICAL，自算設 `derived`（L3 不偽裝 official，§30.1）
- [x] Expense ratio / inception date 走 fund metadata（L4 仍 NOT_YET_AVAILABLE 不猜）
- [x] Adapter 可行性驗證：至少 5 檔 ETF（含 0050 / 0056 / 006208 等）實抓或錄製 fixture

## 完成記錄（2026-08-18）

- **設計契約**：`docs/etf-data-availability.md` 4 張表鎖定（Factor Definition / Data Availability Matrix / Weight Renormalization Matrix / State Machine）
- **Adapter**：`etf/data_adapter.py`（EtfDataAdapter）——`get_nav_history()` 經 tw-quant-mcp `get_etf_nav`（TWSE e添富平台）取得逐日 NAV/市價/折溢價；`premium_discount` 公式防呆；自算標 `derived`；L2 頻率感知（NOT_YET_AVAILABLE 不猜）；mcp 失敗 graceful degrade
- **mcp_provider.py**：`get_etf_nav(symbol, start?, end?)` 工具對映；**mcp_normalize.py**：`normalize_etf_nav` 註冊進 _NORMALIZERS
- **fixtures**：6 檔 live 錄製（0050/0056/006208/00636/00878 成功 + 00679B 上櫃 NOT_YET_AVAILABLE）
- **驗證**：17 unit（premium 公式含正負/NAV=0）+ 4 integration + 2 live best-effort；live 實抓 0050 nav=105.06 premium=-0.15%；完整套件 376 passed, 29 skipped, ruff clean
- commit：`16b750a`（實作）、`a338394`（README）

## 備註

- 此任務回應 review-v0.4 的「tw-quant-mcp 沒有 ≠ 台灣官方沒有」——先盤點再決定 ranking factor
- 設計契約 4 表必須先鎖定，T012 才允許編寫 scoring/ranking 邏輯（review-v0.3 #17）
- 抓取遵守官方合理使用，低頻（每日一次盤後）