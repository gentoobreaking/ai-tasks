---
github_issue: N/A
title: 第一個 E2E Test（Phase 4 收尾）：Python repo + 有/無 Research 對照（§40）
type: test
priority: high
status: pending
depends_on: [T021, T011, T012, T019, T020]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T023 - 第一個 E2E Test

## 目標

依 spec §40：第一個測試選 Python repository（不選 Kubernetes operator）：**Add a function and tests using an external library whose current API must be researched.** 預期路徑 `Task → Policy → Research Required → Official Docs → Evidence → Evidence Gate → Pi + 9B → Patch → Artifact Gate → pytest → PASS`；再跑同 task 但關掉 Research 的對照組。兩次差異即專案第一份真實數據。

## 驗收標準

- [ ] E2E 完整路徑跑通（§40 預期路徑，0 次 Cloud）
- [ ] 對照組（Research 關閉）執行並記錄結果
- [ ] 兩次皆存完整 event log（每次 attempt，§32/§36.4 要求）
- [ ] verification 以 pytest 實際結果為準（P6）
- [ ] 輸出比較記錄：success / 次數 / evidence 數 / 差異觀察

## 備註

- 這是 Phase 1–5 能力測試的門面用例；benchmark 正式化於 T024。
- 若 Pi 尚未可用，worker 以 stub 實作跑通 pipeline（T021 註記）。