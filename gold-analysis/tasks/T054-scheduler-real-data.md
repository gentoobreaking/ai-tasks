---
id: T054
github_issue: ""
title: 排程監控/重訓改用真實資料來源
project: gold-analysis
type: bug
priority: high
status: done
depends_on: [T053]
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T054 - 排程監控/重訓改用真實資料來源

## 目標
`backend/app/main.py` 的 `run_monitor_job()` / `run_retrain_job()` 目前用 `np.random.normal` 合成價格並餵入監控/重訓管線，還印出看似真實的結果。這使排程監控與重訓實質上為 no-op，且會在 T053 修復前靜默通過。需改為從真實資料管線（DataCollector / 資料庫）取數。

## 驗收標準
- [ ] `run_monitor_job()` 從真實資料來源（DataCollector 或 DB）取得近期樣本，而非隨機合成
- [ ] `run_retrain_job()` 若有新版標註資料才觸發重訓，否則明確 skip 並記 log
- [ ] 移除 `np.random.normal` 偽資料產生碼；監控結果欄位標註資料來源與時間戳
- [ ] 當真實資料不足/缺失時，任務記錄 warning 並不拋未處理例外
- [ ] 補測試：mock 資料來源驗證排程任務真的呼叫真實取數路徑

## 備註
- 依賴 T053（health_check 正常工作後，真實資料才有意義）。
- 注意 `main.py` 目前為 sqlite-mock 模式（`DB_FILE = ~/.qclaw/gold_monitor_pro.db`），需確認取數路徑在 mock 模式下也能拿到合理資料或明確標示。
