---
github_issue: 
title: Routing Rules Keywords 微調與其他分身同步引用 Registry
type: fix
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T034 - Routing Rules Keywords 微調與其他分身同步引用 Registry

## 目標
T008 完成了 Agent Registry，但需根據實際任務分佈微調 routing_rules keywords，並讓其他分身也同步引用 Registry 進行委派。

## 驗收標準
- [ ] `.opencode/agent_registry.yaml`：根據近期任務分佈微調 keywords（如 T002 `summary` 觸發 docs-sync，縮小關鍵字範圍避免誤判）
- [ ] `.opencode/agents/cloud-arch-clone.md` SOP 4.1：新增步驟查詢 Registry 決定委派對象
- [ ] `.opencode/agents/docs-sync-clone.md` SOP 4.1：同步引用 Registry
- [ ] `.opencode/agents/quant-dev-clone.md` SOP 4.1：同步引用 Registry
- [ ] 驗證：各類任務（dockerfile→cloud-arch、spec/docs→docs-sync、quant→quant-dev、其他→my）路由正確

## 備註
- T008 summary 後續建議第 5、6 點
- 可先分析現有任務標題/內容分佈，統計關鍵字頻率再調整
- 各分身 SOP 4.1 修改參考 `my-clone.md` 的模式