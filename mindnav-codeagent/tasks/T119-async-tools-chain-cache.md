---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/617
type: Refactor
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. Tools async 化（blocking event loop 問題）
     - engine/tools/search_tool.py: grep_file / glob_file 改為 async def + asyncio.to_thread()
     - engine/tools/file_tool.py: read_file / write_file 改為 aiofiles 或 asyncio.to_thread()
     - engine/tools/github_tool.py: github_browse_repo 改為 async（用 httpx 取代 PyGithub sync API）
     - engine/tools/web_scraper.py: scrape_web_page 改為 httpx.AsyncClient
  2. Chain/Prompt 快取
     - engine/nodes/coder_node.py: ChatPromptTemplate + chain 建立後 cache
     - engine/nodes/base.py: create_simple_node 的 chain 快取
     - engine/nodes/researcher_node.py: chain 快取
  3. grep_file 結果 early-exit 優化
     - 累積到 200 行就停止 walk

# T119 - 工具 async 化 + chain 快取

## 目標
解決 sync I/O 工具阻塞 async event loop 的問題，並快取重複建立的 LLM chain 以提升效能。

## 驗收標準
- [x] grep_file / glob_file 改為 async（asyncio.to_thread 包裹 IO）
- [x] read_file / write_file / edit_file / apply_patch 改為 async
- [x] github_browse_repo 改為 async（httpx）
- [x] scrape_web_page 改為 async（httpx）
- [x] coder_node chain 只建立一次並快取
- [x] base.py simple_node chain 只建立一次並快取
- [x] researcher_node chain 只建立一次並快取
- [x] grep_file 累積滿 200 行 early-exit

## 備註
- asyncio.to_thread() 適用於 CPU-bound 檔案操作
- httpx 已存在於依賴中（用於 LLMFactory）
- chain 快取注意 thread safety（LLM 調用可能跨 thread）
