---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/487
title: T017 - 安全沙盒工具整合 (Security Sandbox Tool Integration)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T017 - 安全沙盒與網頁抓取工具整合 (Security & Web Scraping Tools)

## Description
將 `engine/utils/security.py` 中的 `SafeShell` 封裝為安全 Shell Tool，並實作 `WebScraper` 工具，整合至 `Coder` Agent 工作流。確保 Agent 能在沙盒環境下操作系統，並能解析完整網頁內容。

## Acceptance Criteria
- [x] 實作 `engine/tools/shell_tool.py`，將 `SafeShell` 包裝為 `@tool`。
- [x] 實作 `engine/tools/web_scraper.py`，封裝 `BeautifulSoup` + `Readability`。
- [x] 將 `execute_safe_command` 與 `scrape_web_page` 加入 `engine/graph.py` 中的工具清單。
- [x] 更新 `src/README.md`，說明 Agent 如何透過這些工具進行編碼輔助與文件研讀。
- [x] 驗證 Agent 能否自主決定使用這些工具進行編碼修正與技術調研。

## Notes
- 必須嚴格限制白名單與工作目錄，防止 Agent 執行未經授權的指令。
- 該工具應作為 Coder Agent 的核心能力之一，以便進行自我修正 (Self-Correction)。

