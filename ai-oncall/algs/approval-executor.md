# 批准閘門與執行器——安全邏輯規格

> **本檔為全系統唯一碰生產環境路徑的唯一實作依據。**
> 任務拆解鐵律：凡實作 `runbook/{parse,approval}`、`executor/`、`schedule/` 的任務書，
> 驗收標準必須逐條引用本檔小節。
>
> 對應功能：F6 執行器、F5 批准互動、F18 輸出遮蔽、F20 升級鏈
> 對應模組：`core/src/oncall_core/{runbook,executor,schedule,interact}`

## B.1 風險分級與批准閘門

| 風險等級 | 定義 | 執行路徑 |
|---|---|---|
| read-only | 查 log/指標/describe，不改變系統狀態 | 自動執行，無需批准 |
| mutating | 重啟 pod / rollback / 擴縮容 / 改配置 | **必須人類批准** |

mutating 流程（三段式鐵律）：

```
建議 → dry-run（k8s --dry-run=server；shell 類無法 dry-run 者標注「無法預演」並提高門檻）
     → Telegram inline 按鈕：✅批准 ❌拒絕（附一句話原因） ⏳逾時
     → 實際執行（逐步回報）
```

## B.2 批准逾時與升級鏈（F20）

- 逾時（預設 5 分鐘）→ **升級而非棄單**：再提醒一次 + 依排班表換渠道推播
  （primary → secondary → manager，排班來源 ICS/API 匯入，`schedule/` 模組）
- 再逾時才棄單；但 Incident 仍 open 時不得默默消失——時間線必須記錄完整嘗試軌跡
- v1 若排班表未設定：固定通知 admin，升級鏈為空操作

## B.3 executor 安全規則

| 規則 | 內容 |
|---|---|
| 冪等 | 同一動作對同一 Incident 只執行一次；併發鎖防止重複批准競態 |
| 已緩解檢查 | 執行前再確認 Incident 未被人工標記 mitigated——已緩解則跳過並記錄 |
| 逐步回報 | 每一步的輸出即時回報時間線；失敗即停（不盲目續跑後續步驟） |
| 輸入契約 | **只接受通過 schema 驗證的 brain 輸出**（algs/schema-validation.md）；畸形輸入硬拒絕 |
| 隔離 | executor 是唯一允許碰生產環境的套件；lint 規則禁止其他模組 import 它 |

## B.4 輸出遮蔽（F18 redaction）

1. 推送前掃描金鑰樣式：API token、Bearer、connection string、私鑰區塊、
   AWS/GCP/Alicloud 憑證樣式——命中即以 `[REDACTED]` 打碼
2. 原始未遮蔽輸出僅存本地加密檔（`audit/`），保留期 YAML 可調（預設 90 天）
3. 遮蔽層是 executor 的出口過濾器：任何離開 executor 的文字（Telegram/時間線/UI API）都過同一層

## B.5 拒絕捕獲（F9 聯動）

- 拒絕時強制（或一鍵）填一句話：「實際做法／原因」
- 該紀錄**即時**寫入 RAG（memory/indexer），不等 postmortem——飛輪最貴的養分
