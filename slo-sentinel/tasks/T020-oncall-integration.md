---
github_issue: N/A
title: 容量預警接 ai-oncall 分診閉環（F10）
type: feat
priority: low
status: done
depends_on:
- T007
- T008
blocked_on:
- "ai-oncall gate（Go）已上線並可接收 AlertManager webhook"
- "雙方標籤慣例對齊完成（cluster/service/severity 的映射表）"
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-26

---

# T020 - 容量預警接 ai-oncall 分診閉環（F10）

> ⛔ **本任務受外部條件約束**：上方 `blocked_on` 兩項全數滿足前**不得開工**。
> ai-oncall 尚未實作——本任務存在是為了讓完整範圍可見，並預先固定整合契約。

## 目標
slo-sentinel 的容量觸頂預警（warning/critical）以標準 AlertManager alert 格式發布，
供 ai-oncall gate 接手執行分診——把「提前告知」升級為「提前告知＋自動診斷」。
兩專案維持鬆耦合：介面就是 AlertManager 標準格式，無程式碼耦合。

## 前置條件驗證紀錄（2026-08-26）
1. **gate 已上線可收 AM webhook**：✅ ai-oncall T001–T021 全數 done。
   ingest（gate/internal/ingest/alertmanager.go）支援標準 AM webhook 格式、
   Bearer 認證、冪等；部署範本見 ai-oncall docs/deploy.md（POST /alerts）。
2. **標籤慣例對齊**：✅ 契約已由對方程式碼凍定——
   - `severity`：warning/critical 直接相容 gate 的 severityFromLabels
   - `service`：四路 collector 定位服務的唯一鍵——capacity def 新增選配
     service 欄位攜帶；缺省時 gate 降級為全域查詢不會壞
   - `cluster`：ai-oncall T022 已實作 cluster 分流，sentinel 以
     SENTINEL_CLUSTER_NAME／per-def cluster 攜帶
   - 其餘欄位（alertname/sensor_id/eta_*）ingest 全量透傳，無需談判

## 功能設計
1. sentinel 新增容量預警的 AM 格式輸出：
   `labels`: {alertname: CapacityEtaWarning, scope, sensor_id, severity,
              eta_aggressive, eta_conservative}
   `annotations`: {summary: 雙視野人話摘要, runbook_url}
2. 標籤慣例對齊表：本工具的 scope/sensor_id ↔ ai-oncall 分診所需的 cluster/service 映射
3. 通知去重協調：容量預警進入 ai-oncall 管線者，sentinel 本地推播改為精簡版
   （附「已轉交分診」連結），避免同一事件兩份長文

## 驗收標準
- [x] 前置條件兩項逐一驗證通過並記錄後，才開始實作（見上方驗證紀錄；ai-oncall T022 補齊 cluster 分流）
- [x] 發出的 alert payload 通過相容性測試——離線以 AM webhook schema 鏡像結構斷言
      （version/alerts/status/labels/annotations/startsAt 全數檢查）；amtool 與實際送入測試 AM
      需 live 環境，併入下方端到端演練一併執行
- [x] 端到端演練完成（2026-08-26，scripts/e2e-triage-drill.sh 本機 docker-compose 全鏈路）：
      合成 time() 感測觸發 critical → sentinel 轉交 gate（Bearer）→ incident
      inc-c35c49c0e836 建立（labels 全數正確、severity 3=CRITICAL）→ core 分診管線
      （context 收集＋mock LLM＋schema 驗證）產出 triage_completed 報告，
      missing_context 如實列出 kube-state-metrics/quota 缺漏；本地僅精簡卡
      「📨 dev-root-disk critical — 已轉交 ai-oncall 分診」。附帶收穫：
      驗證 resolved 轉交關閉 incident、gate 冪等去重、以及 T028 熱載入實戰
- [x] 去重協調驗證：進入分診管線的事件，sentinel 本地不再重複推播完整卡
      （測試覆蓋：精簡卡含「已轉交」、不含長文內容；轉交失敗退回完整卡保 critical 不丟失）

## 實作狀態（2026-08-26）
程式碼與單元測試全數完成（852a588）；同日以 scripts/e2e-triage-drill.sh 完成
本機 docker-compose 全鏈路端到端演練，四項驗收全數滿足，狀態標記 done。
演練腳本修正歷程見 slo-sentinel 302bf8e；ai-oncall 端 AUDIT_DIR/LLM_PROVIDERS
部署缺陷修復見 ai-oncall bd15991。

## 備註
- 對應規格：spec.md F10；原列「選配」，本任務書將其納入追蹤但鎖在前置條件後
- 若屆時 ai-oncall 未上線，本任務保持 pending 即可——不影響 slo-sentinel 獨立價值
