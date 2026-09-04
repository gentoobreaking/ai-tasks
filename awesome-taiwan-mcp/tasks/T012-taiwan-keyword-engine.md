---
github_issue: N/A
title: Taiwan Keyword Engine — config-driven keyword classification
type: feat
priority: high
status: pending
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T012 - Taiwan Keyword Engine — config-driven keyword classification

## 目標

建立 Taiwan keyword detection engine, 所有 keyword 來自 config。
對應 CRAWLER_AGENT_TASKS.md §14 TASK-012, §5.1 Taiwan keywords, §29 Data Source Detection。

演算法參考: [algs/taiwan-classification.md](../algs/taiwan-classification.md)

## 驗收標準

- [ ] `config/keywords.yaml` 建立
- [ ] `internal/classify/rules.go` 建立 (Taiwan rule engine)
- [ ] keyword engine 支援 config-driven 關鍵字分類:
  - government: Taiwan, Taiwanese, 台灣, 臺灣, TW, zh-TW, 繁體中文, 繁體
  - government domain: data.gov.tw, gov.tw, moi.gov.tw, moea.gov.tw, mof.gov.tw, mohw.gov.tw, cwa.gov.tw, ly.gov.tw, judicial.gov.tw, law.moj.gov.tw
  - finance: TWSE, TPEx, TAIFEX, TDCC, FinMind, Fugle, 台股, 上市, 上櫃
  - real-estate: 實價登錄, LVR, land.moi.gov.tw, 房價, 房地產, 土地, 預售屋
  - payment: ECPay, NewebPay, 綠界, 藍新
  - language: Taiwan Mandarin, Traditional Chinese, zh-TW, 注音, TOCFL
  - company/service: SHOPLINE
- [ ] 所有 keyword 都是 config-driven, 不 hard-code (§TASK-012: 所有 keyword 必須 config-driven)
- [ ] Keyword detection 搜索範圍: repository name, owner, description, README content, topics, source code, data source URLs
- [ ] `matchTaiwanKeywords(server MCPServer) []Evidence` 函數實現
- [ ] 每個 keyword 匹配產生 evidence 記錄 (type=repository_keyword, value=matched keyword, weight)
- [ ] 單元測試: 每一個 mandatory keyword 都能被 matched = true (§TST-009: 不得漏掉任何 mandatory keyword)

## 備註

- keywords.yaml 必須包含 §5.1 和 §29 的所有 keywords
- keyword matching 對大小寫不敏感
- 匹配必須保留 evidence (§16 Taiwan Evidence)
