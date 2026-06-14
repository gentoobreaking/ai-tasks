---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/544
title: T040 - 產品負責人代理 (Product Owner Agent)
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T040 - 產品負責人代理 (Product Owner Agent)

## 目標
新增 Product Owner Agent 專職負責需求澄清、驗收標準確認與優先級裁決，將用戶原始輸入結構化後再交給 PM，避免需求模糊直接流入開發流程。

## 驗收標準
- [x] 在 `config/agents.yaml` 定義 `po` 角色，包含需求管理參數
- [x] 升級 Supervisor 工作流，加入 PO 位置：User → PO → PM
- [x] 在 `engine/graph.py` 新增 `po_node` 節點
- [x] 賦予 PO Agent 需求澄清與 AC 產出能力

## 備註
- PO 應採用強推理模型（gpt-4o）
- 輸出格式應包含結構化的需求描述與初步驗收標準
