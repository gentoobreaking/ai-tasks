---
github_issue: N/A
title: Migration Pipeline — Load, normalize, classify, score, verify existing records
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T084", "T068", "T070", "T072", "T074", "T078", "T080", "T082"]
created: 2026-09-05
updated: 2026-09-05
---

# T085 - Migration Pipeline — Load, normalize, classify, score, verify existing records

## 目標

建立現有資料遷移管線，將舊 registry 記錄按新架構重新處理。對應規格書 §52, §61 Phase 11。

新檔案：`cmd/migrate/main.go`。

## 驗收標準

- [ ] `cmd/migrate/main.go` 新建 CLI：
  - [ ] `migrate --input-db=old.db --output-db=new.db [--dry-run] [--batch-size=N]`
  - [ ] 步驟：
    1. [ ] Load：讀取舊 `mcp_servers` 表
    2. [ ] Normalize：轉換為新 Entity 結構（補齊缺失欄位）
    3. [ ] Classify：執行 T072 分類器
    4. [ ] Taiwan Score：執行 T068 Taiwan relevance
    5. [ ] AI Score：執行 T070 AI relevance
    6. [ ] MCP Identity：執行 T074 靜態分析
    7. [ ] Runtime Verify：對 STATIC_VERIFIED 執行 T078 運行時驗證（可選，--verify-runtime）
    8. [ ] Security Scan：執行 T080 安全掃描
    9. [ ] Quality Score：執行 T082 品質評分
    10. [ ] Save：寫入新資料庫
- [ ] 進度報告：每 100 筆 log 一次、統計各分類分佈
- [ ] 錯誤處理：單筆失敗不中斷、記錄錯誤繼續、最終報告失敗清單
- [ ] Dry-run 模式：不寫入 DB，只輸出統計
- [ ] 斷點續傳：記錄已處理 ID，支援中斷恢復
- [ ] 遷移報告：JSON 輸出統計（總數、各分類數、各狀態數、錯誤數）
- [ ] 規格書 §52 要求：**不直接複製**舊 `taiwan_relevant: true`，必須重新計算
- [ ] 單元測試：Mock 管線各階段
- [ ] 整合測試：對現有資料集完整跑一次

## 備註

- 這是一次性腳本，但邏輯可復用於增量更新
- 現有 561 筆記錄預期會大幅減少 MCP_SERVER 數量（規格書 §59）
- 遷移後需驗收測試（T087, T088）

## 執行紀錄

- 待執行