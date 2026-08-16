---
github_issue: N/A
title: 第一個 E2E Test（Phase 4 收尾）：Python repo + 有/無 Research 對照（§40）
type: test
priority: high
status: done
depends_on:
- T021
- T011
- T012
- T019
- T020
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: '2026-08-17'
completed: 2026-08-14
spec_version: v3
---
# T023 - 第一個 E2E Test

## 目標

依 spec §40：第一個測試選 Python repository（不選 Kubernetes operator）：**Add a function and tests using an external library whose current API must be researched.** 預期路徑 `Task → Policy → Research Required → Official Docs → Evidence → Evidence Gate → Pi + 9B → Patch → Artifact Gate → pytest → PASS`；再跑同 task 但關掉 Research 的對照組。兩次差異即專案第一份真實數據。

## 驗收標準

- [x] E2E 完整路徑跑通（§40 預期路徑，0 次 Cloud）
- [x] 對照組（Research 關閉）執行並記錄結果
- [x] 兩次皆存完整 event log（每次 attempt，§32/§36.4 要求）
- [x] verification 以 pytest 實際結果為準（P6）
- [x] 輸出比較記錄：success / 次數 / evidence 數 / 差異觀察

## 備註

- 這是 Phase 1–5 能力測試的門面用例；benchmark 正式化於 T024。
- 若 Pi 尚未可用，worker 以 stub 實作跑通 pipeline（T021 註記）。

## 完成摘要（2026-08-14）

- **Runner**：`benchmark/runners/e2e-runner.ts`（tsx 直接執行，支援 `--mode=stub|llama`、`--only=on|off|both`、`--keep`）
- **Pipeline 新增 `canonicalizeDiff`**（`apps/control-plane/src/artifact/controller.ts`）：把模型 raw diff 容忍式套到 scratch copy，再以 `git diff --no-index` 重產「真實內容變更」的最小 diff——解決模型整檔重 emit / hunk 錯 / 重複新增已存在內容等系統性噪音；policy 驗證與 apply 以 canonical diff 為準
- **Ground-truth tests 保護**：`tests/test_api_client.py` 設為 readonly；模型新增測試需開新檔（如 `tests/test_extra.py`）
- **Gate 拒絕走回饋重試**（與驗證失敗同 attempt 迴圈）
- **模型選擇**：`robit/ornith:9b`（spec §40 正列）；7B 在「不可改 tests」約束下 4/4 全滅
- **執行**：`LLAMA_BASE_URL=http://127.0.0.1:11434 LLAMA_MODEL=robit/ornith:9b npx tsx benchmark/runners/e2e-runner.ts --mode=llama --only=both --keep`
- **結果保留**：`results-keep/t023/{research-ON--Full-CP-,research-OFF--Raw-}/{workspace/,e2e.db,result.txt,result.json}`

| run | success | attempts | evidence | verification | finalStatus |
|---|---|---|---|---|---|
| ON（Full CP） | ✅ | 2 | 3 | unit_test=PASS, lint=FAIL | COMPLETE |
| OFF（Raw） | ❌ | 1 | 0 | — | ASK_USER |

**CP Gain（n=1）：+100pp**（統計見 T024）

詳細與關鍵發現見 `benchmark/results/t023-run1.md`。