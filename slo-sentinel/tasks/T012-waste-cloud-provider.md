---
github_issue: N/A
title: 瘦身掃描器與雲端 provider internal/waste
type: feat
priority: medium
status: pending
depends_on:
- T004
- T010
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T012 - 瘦身掃描器與雲端 provider internal/waste

## 目標
`internal/waste`：scanner.go（每日一次批次掃描）、rightsizing.go（P95 使用率比判定 +
建議規格 + 月省估算）、zombies.go（ELB/TG/EIP/磁碟零流量判定）、cloud provider
（Tagging API 資源發現）。**實作依據：`algs/waste-detection.md` §E.1、§E.3、§E.4。**

## 驗收標準
- [ ] **殭屍判定**（§E.1-A）：`max{metric(t): t∈window} ≤ ε` 即 idle；ELB ε=10（健康檢查雜訊）；window 預設 14d
- [ ] **Right-sizing 判定**（§E.1-B）：P95(util_ratio) < threshold(15%) 連續 window——用 **P95 不用均值**（尖峰撐得住就不縮）
- [ ] **建議規格**：降到「降規後 P50 ≈ target_p50(40%)」的最小檔位；無法確定檔位價差時標注「估算」
- [ ] **浪費金額**：waste$ = unit_price_per_day × idle_days，每次重提累加更新——「拖越久越貴」具象化
- [ ] 月省估算：saving/mo = (price_current − price_suggested) × 730h（§E.1-B 最末）
- [ ] 掃描每日一次離線批次，與主輪詢迴圈隔離（§E.3）
- [ ] cloud provider：Tagging API / ELB List API 資源發現，fake 清單測試
- [ ] 資料源為 Prometheus（aws_elb_request_count_sum 等）——判定引擎不直接打雲 API 拉指標

## 備註
- 與原生服務差異化的理由（可視性問題）見 §E.4——v1 即自研引擎，不做 findings 轉發過渡方案
