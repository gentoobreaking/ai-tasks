---
github_issue: N/A
title: Taiwan Domain Engine — official domains config + detection
type: feat
priority: high
^status: done
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T013 - Taiwan Domain Engine — official domains config + detection

## 目標

建立 Taiwan official domain detection engine。
對應 CRAWLER_AGENT_TASKS.md §15 TASK-015, §30 Official Source Detection, §29 Data Source Detection。

## 驗收標準

- [ ] `config/domains.yaml` 建立
- [ ] `config/domains.yaml` 至少包含 (§30):
  - twse.com.tw, tpex.org.tw, taifex.com.tw, cwa.gov.tw, moi.gov.tw,
    moea.gov.tw, moj.gov.tw, ly.gov.tw, judicial.gov.tw, data.gov.tw
- [ ] domains.yaml 支援 classification: official, government, financial
- [ ] `matchOfficialDomains(server MCPServer) []Evidence` 函數實現
- [ ] Domain matching 搜索範圍: repository URL, endpoint URLs, data source URLs, README 內容, source code
- [ ] 每個 domain 匹配產生 evidence: type=official_domain, value=匹配的 domain, weight=1.0, score=+40 (§17)
- [ ] domain matching 檢查 URL host (extract host from URL, compare against config)
- [ ] 單元測試: 每個 required domain 都能 recognized = true, classification = Taiwan-related (§TST-010)
  - twse.com.tw → recognized=true
  - tpex.org.tw → recognized=true
  - taifex.com.tw → recognized=true
  - cwa.gov.tw → recognized=true
  - moi.gov.tw → recognized=true
  - moea.gov.tw → recognized=true
  - moj.gov.tw → recognized=true
  - ly.gov.tw → recognized=true
  - judicial.gov.tw → recognized=true
  - data.gov.tw → recognized=true

## 備註

- official_domains 用於 T14 Taiwan Scoring 的 +40 分 (§17)
- 如果 MCP 直接使用官方 API → official_data_source = true (§30)
- domain detection 必須 deterministic
