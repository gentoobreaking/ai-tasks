---
github_issue: N/A
title: 容量預警接 ai-oncall 分診閉環（F10）
type: feat
priority: low
status: pending
depends_on:
- T007
- T008
blocked_on:
- "ai-oncall gate（Go）已上線並可接收 AlertManager webhook"
- "雙方標籤慣例對齊完成（cluster/service/severity 的映射表）"
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24

---

# T020 - 容量預警接 ai-oncall 分診閉環（F10）

> ⛔ **本任務受外部條件約束**：上方 `blocked_on` 兩項全數滿足前**不得開工**。
> ai-oncall 尚未實作——本任務存在是為了讓完整範圍可見，並預先固定整合契約。

## 目標
slo-sentinel 的容量觸頂預警（warning/critical）以標準 AlertManager alert 格式發布，
供 ai-oncall gate 接手執行分診——把「提前告知」升級為「提前告知＋自動診斷」。
兩專案維持鬆耦合：介面就是 AlertManager 標準格式，無程式碼耦合。

## 功能設計
1. sentinel 新增容量預警的 AM 格式輸出：
   `labels`: {alertname: CapacityEtaWarning, scope, sensor_id, severity,
              eta_aggressive, eta_conservative}
   `annotations`: {summary: 雙視野人話摘要, runbook_url}
2. 標籤慣例對齊表：本工具的 scope/sensor_id ↔ ai-oncall 分診所需的 cluster/service 映射
3. 通知去重協調：容量預警進入 ai-oncall 管線者，sentinel 本地推播改為精簡版
   （附「已轉交分診」連結），避免同一事件兩份長文

## 驗收標準
- [ ] 前置條件兩項逐一驗證通過並記錄後，才開始實作
- [ ] 發出的 alert payload 通過 AlertManager API 相容性測試（amtool check-config / 實際送入測試 AM）
- [ ] 端到端演練：容量 critical → ai-oncall 收到 → 產出含 HPA/quota context 的分診報告（spec.md §5 標準 10 對應）
- [ ] 去重協調驗證：進入分診管線的事件，sentinel 本地不再重複推播完整卡

## 備註
- 對應規格：spec.md F10；原列「選配」，本任務書將其納入追蹤但鎖在前置條件後
- 若屆時 ai-oncall 未上線，本任務保持 pending 即可——不影響 slo-sentinel 獨立價值
