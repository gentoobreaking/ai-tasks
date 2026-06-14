---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/618
type: Refactor
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: 
---

  1. Type hints 補全
     - engine/graph.py: permission_wrapped_tool_node(state: ProjectState)
     - engine/nodes/base.py: create_simple_node(config: dict, llm: ChatOpenAI, sender: str) -> Callable
     - engine/nodes/coder_node.py: create_coder_node(config: dict, llm: ChatOpenAI, tools: Optional[List[Callable]])
     - engine/nodes/planner_node.py, verifier_node.py: 補 return type
  2. 抽離 message content 取值 helper
     - 建立 engine/helpers.py: get_message_content(msg) -> str
     - 替換 7 個檔案中 10+ 處的重複 pattern
  3. 建立 pyproject.toml
     - [project] metadata（name, version, python_requires）
     - [project.optional-dependencies] 分組（core, bot, worker, frontend, git-api, all）
     - [tool.pytest.ini_options]
     - [tool.ruff] lint rules
  4. 刪除死程式碼
     - engine/base.py（重複的 BaseSkill）
     - engine/manager.py（引用不存在路徑的 SkillManager）
     - README_v1.md

# T120 - Type hints 補全 + pattern 抽離 + pyproject.toml

## 目標
提升程式碼型別安全性、消除重複 pattern、建立現代 Python 專案設定，降低維護成本。

## 驗收標準
- [x] graph.py 中所有 node function 有完整 type hints
- [x] base.py / coder_node.py / researcher_node.py 參數+回傳有 type hint
- [x] planner_node / verifier_node 有 return type
- [x] engine/helpers.py 有 get_message_content() 函數
- [x] 7 個檔案中 10+ 處 content 取值 pattern 改為 helper（8 files, 12 patterns）
- [x] pyproject.toml 包含 project metadata + dependency groups
- [x] engine/base.py 已刪除
- [x] engine/manager.py 已刪除
- [x] README_v1.md 已刪除

## 備註
- Python 最低版本設為 3.10（專案已使用 `str \| None` syntax）
- Optional dependency groups 取代 5 個 requirements*.txt
