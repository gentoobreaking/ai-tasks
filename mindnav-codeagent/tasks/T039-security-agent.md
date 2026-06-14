---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/543
title: T039 - 安全審計代理 (Security Agent)
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T039 - 安全審計代理 (Security Agent)

## 目標
新增 Security Agent 專職負責漏洞掃描、OWASP 安全檢查與憑證/金鑰合規審計，補足 QA 只測功能不測安全的缺口。

## 驗收標準
- [x] 在 `config/agents.yaml` 定義 `security` 角色，包含安全審計參數
- [x] 升級 Supervisor 工作流，加入 Security 位置：Coder → Security → QA
- [x] 在 `engine/graph.py` 新增 `security_node` 節點
- [x] 賦予 Security Agent 安全審計技能（OWASP 檢查規則、敏感資訊掃描）

## 備註
- Security Agent 產出應包含漏洞清單與修復建議，供 Coder 修正
- 可復用 `SafeShell` 執行靜態分析工具
