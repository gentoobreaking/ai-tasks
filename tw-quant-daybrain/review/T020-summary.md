# T020 Summary — Priority Ranking Engine

- 完成日期：2026-08-11
- Commit：`ab1738d`
- 狀態：done（9/9 驗收全勾）

## 實作內容

`src/execution/priority_engine.ts`（9292 bytes）：
- **computeRankScore（§10.1）**：`R = 0.4×S_pre + 0.5×M_surge − 0.1×D_vwap`；爆量封頂 5 倍（×20 = 100 分）、VWAP 偏離 %×15 扣分；權重可經回測調參（§13）
- **tierCapitalForScore（§10.2）**：S_pre≥80 → 33%（200 萬）、60–80 → 20%（120 萬）、50–60 → 10%（60 萬）、<50 → Tier 4 拒絕
- **evaluateSignal（§10.3 三層流程）**：白名單（allowed_actions 不含 → 拒絕）→ MAX_POSITIONS 檔數 → 總曝光上限 → Rank Score → Tier 資金 → 族群集中度（同族群 ≤ 總曝光×SECTOR_LIMIT_PCT 40%）→ 1 張門檻（資金 < price×1000 → 拒絕）
- **registerPosition / releasePosition**：資金池動態管理（釋放後可再分配）
- **rank()（T009 PriorityEngine 接口）**：同 tick 多檔觸發依 Rank Score 排序回傳 signal_id 清單（§10.4 競爭搶單：廣達 74 > 台達電 64 → 優先派單）
- **決策寫 priority_ranked 事件**（T004：candidates 必填；含 rankScore/allocatedCapital/reason）
- **環境變數參數化（§17.1）**：TOTAL_MARGIN_POOL_NTD / MAX_LEVERAGE / SECTOR_LIMIT_PCT / MAX_POSITIONS

## 測試
18 tests：Rank 公式（§10.4 範例 64 vs 74）、爆量封頂、VWAP 扣分、權重調參、Tier 邊界（49/50/59/60/79/80）、白名單攔截、NO_TRADE、Tier 4 拒絕、族群 40% 滿額、跨族群不受影響、MAX_POSITIONS、1 張門檻、總曝光上限、register/release 資金回收、rank 排序、事件寫入（rank + decision 兩路徑）。

全套測試：**294/294 pass**（276 + 18）+ lint/type check 過。

## 備註
- T009 intraday_loop 的 `PriorityEngine.rank` 接口已由本引擎實作（`{signal_id, symbol, score, volumeSurgeRatio?, vwapDeviationPct?}` → `Promise<string[]>`）
- T022 回測模擬器可注入本引擎驗證競態（任務書備註）
