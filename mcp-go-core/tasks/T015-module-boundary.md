---
github_issue: N/A
title: P2 - Module Boundary Definition
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T001
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T015 - P2: Module Boundary Definition

## 目標

定義 `modules/` 套件邊界，確保每個 module 可獨立 import，明確依賴，不依賴 umbrella modules。

對應 spec §7 Module System, architecture §34 Dependency Architecture, agent_tasks TASK-020。

## 驗收標準

- [ ] `modules/` 子目錄結構建立: `transport/{stdio,http,sse}`, `security/{api_key,jwt,oauth,mtls}`, `middleware/{logging,recovery,metrics,tracing}`
- [ ] 每個 module 套件可獨立 import (無 circular dependency)
- [ ] Module 不依賴 umbrella package (`modules/all`)
- [ ] Module 只能依賴 Core，不能依賴其他 Module (除非明確需要)
- [ ] 驗證: `go list -deps ./modules/...` 不顯示 inter-module cycles
- [ ] `go build ./modules/...` 成功

## 備註

Core → Module 方向 forbidden。Module → Core 方向 valid。每個 module 必須明確聲明 dependency。
