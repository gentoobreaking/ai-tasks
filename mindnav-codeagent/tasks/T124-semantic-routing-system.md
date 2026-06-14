---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/793
title: 語意感知路由系統實作
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 實作語意分類 + 上下文感知 + 狀態感知三層路由
---

# T124 - 語意感知路由系統實作

## 目標
為 MindNav CodeAgent 實作語意感知路由系統，取代目前只看 `sender` 的靜態路由，實現基於任務語意、執行上下文、狀態追蹤的智慧路由。

## 背景
目前 Supervisor 的路由邏輯：
```python
def supervisor_router(state: ProjectState):
    return state.get("sender", "PO")  # 只看 sender，不考慮語意
```

問題：
1. 沒有考慮任務語意（new_task vs continue vs feedback）
2. 沒有考慮上下文（已經測試過了，不需要再測）
3. 沒有考慮任務狀態（錯誤重試、上限檢查）

## 驗收標準
- [x] 實作 `SemanticRouter` 類別，支援意圖分類（new_task / continue / feedback / question / abort）
- [x] 實作 `ContextAwareRouter` 類別，根據執行歷史決定下一步
- [x] 實作 `StateAwareRouter` 類別，處理迭代上限、AC 驗證、錯誤狀態
- [x] 整合三層路由至 `supervisor_node`
- [x] 新增單元測試覆蓋主要路由場景
- [x] 更新 README.md 的架構圖，標註路由優先級

## 實作細節

### 1. 語意路由（SemanticRouter）
```python
# engine/core/semantic_router.py

class IntentType(Enum):
    NEW_TASK = "new_task"
    CONTINUE = "continue"
    FEEDBACK = "feedback"
    QUESTION = "question"
    ABORT = "abort"

class SemanticRouter:
    """基於 LLM 的意圖分類路由器"""
    
    def __init__(self):
        self.classifier = LLMFactory.get_llm(role="pm", temperature=0)
    
    async def classify_intent(self, state: dict) -> IntentType:
        """分類用戶意圖"""
        last_msg = state["messages"][-1].content
        
        # 簡單規則先判斷（效能優化）
        if "FINISHED" in last_msg:
            return IntentType.ABORT
        if "?" in last_msg or "請問" in last_msg:
            return IntentType.QUESTION
        
        # LLM 分類
        prompt = f"""分析以下訊息的意圖：
        
訊息：{last_msg[:500]}

意圖類型：
- new_task: 新任務請求
- continue: 繼續現有任務
- feedback: 對結果的反饋
- question: 提問
- abort: 中止任務

輸出 JSON: {{"intent": "...", "confidence": 0.0-1.0}}
"""
        result = await self.classifier.ainvoke(prompt)
        return IntentType(result["intent"])
```

### 2. 上下文路由（ContextAwareRouter）
```python
# engine/core/context_router.py

class ContextAwareRouter:
    """基於執行歷史的上下文路由"""
    
    async def route_with_context(self, state: dict, intent: IntentType) -> str:
        """根據上下文決定下一步"""
        
        if intent == IntentType.NEW_TASK:
            return "PO"
        
        if intent == IntentType.CONTINUE:
            sender = state.get("sender", "")
            current_code = state.get("current_code")
            security_report = state.get("security_report")
            test_results = state.get("test_results")
            
            # Coder 完成後
            if sender == "Coder":
                if current_code:
                    return "Security"  # 有新代碼 → 安全檢查
                return "PM"  # 只是回答 → PM
            
            # Security 完成後
            if sender == "Security":
                if security_report and security_report.get("vulnerabilities"):
                    return "Coder"  # 有漏洞 → 修復
                return "QA"  # 安全通過 → 測試
            
            # QA 完成後
            if sender == "QA":
                if test_results and test_results.get("failed", 0) > 0:
                    return "Coder"  # 測試失敗 → 修復
                return "PM"  # 測試通過 → PM
        
        if intent == IntentType.FEEDBACK:
            # 分析反饋內容決定路由
            return await self._route_feedback(state)
        
        return "PM"
    
    async def _route_feedback(self, state: dict) -> str:
        """分析反饋應該給誰"""
        last_msg = state["messages"][-1].content.lower()
        
        if any(kw in last_msg for kw in ["代碼", "code", "實作", "bug"]):
            return "Coder"
        if any(kw in last_msg for kw in ["安全", "security", "漏洞"]):
            return "Security"
        if any(kw in last_msg for kw in ["測試", "test", "qa"]):
            return "QA"
        if any(kw in last_msg for kw in ["設計", "架構", "architecture"]):
            return "Architect"
        
        return "PM"
```

### 3. 狀態路由（StateAwareRouter）
```python
# engine/core/state_router.py

class StateAwareRouter:
    """基於狀態的路由決策"""
    
    def route(self, state: dict) -> str:
        sender = state.get("sender", "")
        iteration = state.get("iteration_count", 0)
        max_iter = state.get("max_iterations", 10)
        
        # 1. 迭代上限檢查
        if iteration >= max_iter:
            return "END"
        
        # 2. AC 驗證狀態檢查
        verified_acs = state.get("verified_acs", {})
        ac_items = state.get("ac_items", [])
        
        if ac_items:
            all_verified = all(
                verified_acs.get(ac.get("id")) == "covered"
                for ac in ac_items
            )
            if all_verified:
                return "Verifier"
        
        # 3. 錯誤狀態檢查
        error_state = state.get("error_state")
        if error_state:
            if error_state.retry_count >= error_state.max_retries:
                return "PM"  # 升級給 PM
            return error_state.recovery_target
        
        # 4. 正常流程
        return self._default_route(sender)
    
    def _default_route(self, sender: str) -> str:
        defaults = {
            "": "PO",
            "PO": "PM",
            "PM": "Architect",
            "Architect": "Coder",
            "Coder": "Security",
            "Security": "QA",
            "QA": "PM",
            "Doc": "PM",
            "Researcher": "PM",
            "DevOps": "PM",
        }
        return defaults.get(sender, "PM")
```

### 4. 整合至 Supervisor
```python
# engine/nodes/supervisor_node.py

async def supervisor_node(state, config=None):
    # 三層路由
    semantic_router = SemanticRouter()
    context_router = ContextAwareRouter()
    state_router = StateAwareRouter()
    
    # 1. 語意分類
    intent = await semantic_router.classify_intent(state)
    
    # 2. 上下文路由
    next_node = await context_router.route_with_context(state, intent)
    
    # 3. 狀態路由（可覆蓋）
    next_node = state_router.route({**state, "next_node": next_node})
    
    return {
        "sender": "Supervisor",
        "next_node": next_node,
        "intent": intent.value,
    }
```

## 備註
- 語意分類使用小型模型（如 deepseek-v4-flash）以降低延遲
- 規則先判斷可跳過 LLM 呼叫，提升效能
- 三層路由可逐步部署，先啟用狀態路由，再啟用上下文路由

## 風險
- LLM 分類可能不準確，需 fallback 機制
- 路由邏輯複雜化後，除錯難度增加
