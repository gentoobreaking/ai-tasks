---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/789
title: 工具推薦系統實作
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 實作基於角色與任務的工具推薦 + 優先級排序
---

# T128 - 工具推薦系統實作

## 目標
為 MindNav CodeAgent 實作智慧工具推薦系統，根據角色、任務類型、當前狀態推薦最適合的工具，並提供優先級排序。

## 背景
目前工具層的問題：
1. 所有 agent 共用同一組 tools（由 PermissionChecker 過濾）
2. 沒有工具推薦機制
3. 大量工具可能造成 LLM 選擇困難

## 驗收標準
- [x] 實作 `ToolRecommender` 類別
- [x] 實作基於角色的預設工具清單
- [x] 實作基於任務類型的動態推薦
- [x] 實作基於狀態的情境推薦
- [x] 整合至 `PermissionChecker.filter_and_recommend()`
- [x] 新增 `recommended_tools` 欄位至 agent state
- [x] 新增工具推薦單元測試
- [x] 更新 README.md 說明工具推薦機制

## 實作細節

### 1. 工具推薦器
```python
# engine/tools/tool_recommendation.py

from typing import List, Dict
from engine.agent_registry import AgentRegistry

class ToolRecommender:
    """智慧工具推薦系統"""
    
    def __init__(self):
        self.registry = AgentRegistry()
        
        # 基於角色的預設工具（高頻使用）
        self.role_defaults = {
            "Coder": ["file_tool", "search_tool", "shell_tool", "git_audit"],
            "Architect": ["file_tool", "search_tool", "grep_file"],
            "PM": ["todo_create", "todo_update", "todo_list", "file_tool"],
            "QA": ["bash", "grep_file", "glob_file"],
            "Security": ["git_audit", "grep_file", "glob_file"],
            "Researcher": ["search_web_templates", "scrape_web_page", "github_browse_repo"],
            "DevOps": ["bash", "git_audit", "rollback_skill"],
            "Doc": ["file_tool", "glob_file"],
            "PO": [],  # PO 不需要工具
        }
        
        # 基於任務類型的推薦
        self.task_recommendations = {
            "code_generation": ["file_tool", "apply_patch", "bash"],
            "code_review": ["grep_file", "glob_file", "file_tool"],
            "testing": ["bash", "grep_file", "file_tool"],
            "deployment": ["bash", "git_audit", "rollback_skill"],
            "documentation": ["file_tool", "glob_file"],
            "research": ["search_web_templates", "scrape_web_page", "github_browse_repo"],
            "security_audit": ["grep_file", "git_audit", "glob_file"],
        }
        
        # 基於狀態的情境推薦
        self.state_triggers = {
            "needs_rag_sync": ["rag_sync"],
            "needs_rollback": ["rollback_skill"],
            "needs_testing": ["bash"],
            "needs_documentation": ["file_tool"],
        }
    
    def recommend_tools(
        self, 
        role: str, 
        task: str, 
        state: dict
    ) -> Dict[str, List[str]]:
        """推薦工具清單"""
        
        result = {
            "defaults": [],
            "task_specific": [],
            "context_specific": [],
            "priority_order": []
        }
        
        # 1. 角色預設工具
        result["defaults"] = self.role_defaults.get(role, [])
        
        # 2. 任務類型推薦
        task_type = self._classify_task(task)
        result["task_specific"] = self.task_recommendations.get(task_type, [])
        
        # 3. 狀態情境推薦
        for trigger, tools in self.state_triggers.items():
            if state.get(trigger):
                result["context_specific"].extend(tools)
        
        # 4. 合併並排序（defaults > task_specific > context_specific）
        all_tools = []
        all_tools.extend(result["defaults"])
        all_tools.extend([t for t in result["task_specific"] if t not in all_tools])
        all_tools.extend([t for t in result["context_specific"] if t not in all_tools])
        
        result["priority_order"] = all_tools
        
        return result
    
    def _classify_task(self, task: str) -> str:
        """分類任務類型"""
        task_lower = task.lower()
        
        if any(kw in task_lower for kw in ["實作", "開發", "create", "implement", "code"]):
            return "code_generation"
        if any(kw in task_lower for kw in ["review", "審查", "檢查"]):
            return "code_review"
        if any(kw in task_lower for kw in ["test", "測試"]):
            return "testing"
        if any(kw in task_lower for kw in ["deploy", "部署"]):
            return "deployment"
        if any(kw in task_lower for kw in ["doc", "文件", "readme"]):
            return "documentation"
        if any(kw in task_lower for kw in ["research", "調研", "研究", "search"]):
            return "research"
        if any(kw in task_lower for kw in ["security", "安全", "audit"]):
            return "security_audit"
        
        return "code_generation"  # 預設
```

### 2. 整合至 PermissionChecker
```python
# engine/permission.py

class PermissionChecker:
    """權限檢查 + 工具推薦"""
    
    def __init__(self):
        self.recommender = ToolRecommender()
    
    def filter_and_recommend(
        self, 
        role: str, 
        all_tools: list,
        state: dict
    ) -> dict:
        """過濾 + 推薦"""
        
        # 1. 過濾（現有邏輯）
        allowed = self.filter_tools(role, all_tools)
        
        # 2. 推薦
        last_msg = ""
        if state.get("messages"):
            last_msg = get_message_content(state["messages"][-1])
        
        recommendations = self.recommender.recommend_tools(role, last_msg, state)
        
        # 3. 標註優先級
        tool_map = {t.name: t for t in all_tools}
        prioritized = []
        for tool_name in recommendations["priority_order"]:
            if tool_name in tool_map and tool_map[tool_name] in allowed:
                prioritized.append({
                    "tool": tool_map[tool_name],
                    "priority": "high" if tool_name in recommendations["defaults"] else "medium"
                })
        
        # 4. 其餘允許的工具（低優先級）
        remaining = [t for t in allowed if t not in [p["tool"] for p in prioritized]]
        for tool in remaining:
            prioritized.append({"tool": tool, "priority": "low"})
        
        return {
            "allowed": allowed,
            "recommended": recommendations["priority_order"],
            "prioritized": prioritized,
            "reasons": {
                "defaults": recommendations["defaults"],
                "task_specific": recommendations["task_specific"],
                "context_specific": recommendations["context_specific"]
            }
        }
```

### 3. 節點整合
```python
# engine/nodes/coder_node.py

async def coder_node(state):
    perm_checker = PermissionChecker()
    all_tools = registry.list().values()
    
    # 取得過濾 + 推薦結果
    result = perm_checker.filter_and_recommend("Coder", all_tools, state)
    
    # 使用推薦的工具綁定 LLM
    high_priority_tools = [p["tool"] for p in result["prioritized"] if p["priority"] == "high"]
    coder_llm = llm.bind_tools(high_priority_tools)
    
    # 執行時可選擇是否降級到全部允許的工具
    # ...
    
    return {
        "messages": [response],
        "sender": "Coder",
        "recommended_tools": result["recommended"],
        "tool_filter_reasons": result["reasons"],
    }
```

### 4. Prompt 注入
```python
# 在 system prompt 中加入工具推薦資訊

def build_tool_context(recommendations: dict) -> str:
    """建構工具推薦上下文"""
    lines = ["## 推薦工具"]
    
    if recommendations["defaults"]:
        lines.append(f"**預設工具**: {', '.join(recommendations['defaults'])}")
    
    if recommendations["task_specific"]:
        lines.append(f"**任務相關**: {', '.join(recommendations['task_specific'])}")
    
    if recommendations["context_specific"]:
        lines.append(f"**情境工具**: {', '.join(recommendations['context_specific'])}")
    
    lines.append("\n建議優先使用推薦工具，以提高執行效率。")
    
    return "\n".join(lines)
```

## 備註
- 工具推薦可減少 LLM 的選擇負擔
- 優先級排序可加快執行速度
- 推薦邏輯可基於使用統計動態調整

## 風險
- 過度推薦可能限制 LLM 的靈活性
- 某些情境可能需要非推薦工具
