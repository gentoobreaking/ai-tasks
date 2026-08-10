# T015 壓測與發布 — 任務完成摘要

- 狀態：done（v2.0 tag 待 T016–T024 全數通過後打，依任務書備註）
- Commit：`cc9d4d7`；日期：2026-08-11
- 測試：222/222 unit pass + simulate 5/5 + stress ✅ + lint ✅ + build ✅

## 6 驗收項達成

1. **全交易日壓測**（`src/ops/stress_test.ts` + `stress_cli.ts`）
   - simulate 新增 `stressTicks`（10s tick 連續 09:00–13:30 = **1621 ticks**）+ `reuseFixtures`（fixture 資料重複使用）+ `tickDelayMs`
   - 結果：1621/1621 無遺漏、事件日誌完整（phase_end ≥ 6）、heap 穩定（成長 ~0.8MB、尾部無持續增長）
   - `npm run stress`；測試 `stress_test.test.ts`（2 tests）
   - 註記：live mcp 對照（`-tags=live`）待實際交易日

2. **參數實驗流程**（`src/ops/param_experiment.ts` + `experiment_cli.ts`）
   - simulate 新增 `scoringOverrides`（volumeSurgeThreshold/scoring_version 注入）
   - 同一 fixture 對 v2.0 基線（量能 3.0）與候選（2.5/3.5）對比勝率/PF/假突破率（computeJournalEntry）
   - 基線數據存 `testdata/param_experiment_result.json`；`npm run experiment`

3. **實驗結論 v2.1 參數建議**
   - 規格書 §0 新增「實驗註記（T015）」列：量能 2.5 為 Code Review 決策；統計性結論待實際交易日（模擬日 watchlist 僅 2 檔樣本不足）；正式凍結需 T022 Grid Search + T023 WFO

4. **附錄 A 對齊檢查表**（`src/ops/appendix_a.test.ts`，5/5 通過）
   - Envelope 解析 / 盤中 09:00–13:30（NO_ENTRY_AFTER=13:00、FORCE_CLOSE_AT=13:20）/ watchlist ≤15 / 未知 source 守門失敗（連續 3 次→LOCKOUT）/ 零直連官方 API

5. **README**：新增「交易日排程」Phase 時間表（§18.2）、「壓測與參數實驗」指令、免責聲明；T015 checkbox ✅

6. **交付**：v2.0 tag 延後（任務書備註：需 T016–T024 全數驗收）；契約相容性測試 `contract_compat.test.ts`（4/4：mock server 18 工具 = spec §2.2、contracts.ts 一致、version 1.3.0）+ `.github/workflows/ci.yml` 常駐 CI（build/lint/test/simulate/stress/appendix A/contract）

## 關鍵檔案
- 新增：`src/ops/{stress_test,stress_cli,stress_test.test,param_experiment,experiment_cli,appendix_a.test,contract_compat.test}.ts`、`.github/workflows/ci.yml`、`testdata/param_experiment_result.json`
- 修改：`src/simulate/simulate.ts`（stressTicks/reuseFixtures/tickDelayMs/scoringOverrides + ticksExecuted/startAt/endAt 回傳）、`package.json`（stress/experiment scripts）、`README.md`
- 文件：`~/tasks/tw-quant-daybrain/tw-quant-daybrain-v2_1.md`（§0 註記）、`T015-release.md`（frontmatter done + 6 勾）
