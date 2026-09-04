---
github_issue: N/A
title: GitHub Adapter — keyword matrix 搜尋 + candidate 提取
type: feat
priority: high
status: pending
depends_on: [T005]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T006 - GitHub Adapter — keyword matrix 搜尋 + candidate 提取

## 目標

建立 `internal/sources/github/` 套件，實現 GitHub repository 搜尋與 candidate 提取。
對應 CRAWLER_AGENT_TASKS.md §8 TASK-006, §5 GitHub Adapter, §6 GitHub Search Query, §7 GitHub Candidate Extraction。

演算法參照: [algs/source-adapter.md](../algs/source-adapter.md) 第 GitHub 搜尋與提取章節

## 驗收標準

- [ ] `internal/sources/github/` 套件建立
- [ ] `GitHubAdapter` struct 實現 `SourceAdapter` interface
- [ ] `Name()` 回傳 `"github"`
- [ ] GitHub search query generator 支援 keyword matrix:
  - Taiwan keywords: Taiwan, Taiwanese, 台灣, 臺灣, TW, zh-TW, 繁體中文, 繁體
  - Government domains: data.gov.tw, gov.tw, moi.gov.tw, moea.gov.tw, mof.gov.tw, mohw.gov.tw, cwa.gov.tw, ly.gov.tw, judicial.gov.tw, law.moj.gov.tw
  - Finance: TWSE, TPEx, TAIFEX, TDCC, FinMind, Fugle, 台股, 上市, 上櫃
  - Real estate: 實價登錄, LVR, land.moi.gov.tw, 房價, 房地產, 土地, 預售屋
  - Payment: ECPay, NewebPay, 綠界, 藍新
  - Language: Taiwan Mandarin, Traditional Chinese, zh-TW, 注音, TOCFL
  - SHOPLINE
  - Example queries: `mcp Taiwan`, `mcp 台灣`, `mcp TWSE`, `mcp "data.gov.tw"`, `mcp "立法院"`, `topic:mcp Taiwan`
- [ ] GitHub repository search 使用 GitHub REST API Search API
- [ ] search → RawCandidate 轉換實現 (§7 Candidate Extraction)
- [ ] 每個 GitHub candidate 必須提取: repository_url, owner, name, description
- [ ] 每個 GitHub candidate 必須提取: stars, forks, watchers
- [ ] 每個 GitHub candidate 必須提取: created_at, updated_at, pushed_at (RFC3339)
- [ ] 每個 GitHub candidate 必須提取: license, language, topics, default_branch
- [ ] 每個 GitHub candidate 必須提取: open_issues, archived, fork, homepage
- [ ] Fetch repository README content (base64 decode)
- [ ] Fetch package.json, pyproject.toml, go.mod, Cargo.toml 內容 (如果存在)
- [ ] Fetch server.json, mcp.json, manifest.json 內容 (如果存在, §69)
- [ ] 所有提取資料保存到 RawRecord
- [ ] GitHub search 測試: mock HTTP server 回傳搜尋結果 → RawCandidate (§TST-006: recall >= 80% on 100 Taiwan + 100 non-Taiwan fixture)

## 備註

- 不得執行 npm install / pip install / docker run (§3. TASK-001 Rule 4 in CRAWLER_AGENT_TASKS)
- GitHub search 不該只有單一 query, 必須使用 keyword matrix (§51 Discovery Strategy)
- GitHub API token 來自環境變數 GITHUB_TOKEN
- 驗證: mock 伺服器回傳 100 Taiwan repos → 至少找到 80 個 (§TST-006)
