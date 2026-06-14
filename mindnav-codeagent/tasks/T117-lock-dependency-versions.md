---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/632
type: Chore
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. 審查所有 requirements*.txt（5 個檔案）
  2. 為每個套件加上 major.minor 或 major.minor.patch 範圍
     - langchain >=0.3.0,<0.4.0
     - langgraph >=0.2.0,<0.3.0
     - pydantic >=2.0.0,<3.0.0
     - 其他比照處理
  3. 移除未使用的 langchain-ollama
  4. 移除 Linux-only pyinotify（或標註平台）
  5. 補上 aiohttp（MCP client 需要）
  6. 建立 requirements-core.txt 共享核心依賴
     - worker/bot/frontend/git-api 繼承 core
  7. 確認所有 requirements 檔案中的套件實際在程式碼中被使用

# T117 - 鎖定所有 dependency 版本

## 目標
為所有 requirements*.txt 加上版本鎖定，避免非確定性建置失敗，移除未使用/錯誤套件。

## 驗收標準
- [ ] 每個套件都有 version range（>=X.Y,<X.Y+1）
- [ ] langchain-ollama 已移除（未使用）
- [ ] pyinotify 已處理（Linux-only 問題）
- [ ] aiohttp 已補上（MCP client）
- [ ] requirements-core.txt 建立，其他檔案繼承
- [ ] redisvl 已補上
- [ ] pip install 可重現

## 備註
- LangChain/LangGraph 頻繁 breaking change，鎖版至關重要
- 使用 `pip freeze` 確認當前環境版本作為 baseline
