---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/542
title: T038 - 架構師代理 (Architect Agent)
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T038 - 架構師代理 (Architect Agent)

## 目標
新增 Architect Agent 專職負責技術選型、系統高層設計與設計評審，填補 PM 直接指派給 Coder 時缺少的架構把關環節。

## 驗收標準
- [x] 在 `config/agents.yaml` 定義 `architect` 角色，包含技術選型參數
- [x] 升級 Supervisor 工作流，加入 Architect 位置：PM → Architect → Coder
- [x] 在 `engine/graph.py` 新增 `architect_node` 節點
- [x] 賦予 Architect 產出 ADR (Architecture Decision Record) 的能力

## 備註
- Architect 應採用強推理模型（gpt-4o）
- 產出格式應結構化，方便 Coder 接手實作
