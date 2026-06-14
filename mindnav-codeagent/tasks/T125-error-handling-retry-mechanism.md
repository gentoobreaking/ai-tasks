---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/794
title: 統一錯誤處理與重試機制
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 實作 ErrorState 模型 + ErrorHandler + 自動重試策略
---

# T125 - 統一錯誤處理與重試機制

## 目標
為 MindNav CodeAgent 實作統一的錯誤處理框架，支援錯誤分類、自動重試、恢復策略、錯誤升級機制。

## 背景
目前系統缺少：
- 明確的錯誤狀態追蹤
- 自動重試機制
- 恢復策略選擇
- 錯誤升級路徑

## 驗收標準
- [x] 實作 `ErrorState` Pydantic 模型（錯誤類型、訊息、重試計數、恢復策略）
- [x] 實作 `ErrorHandler` 類別，支援錯誤分類與恢復策略選擇
- [x] 為 `Coder` 節點加入 try-except 包裹
- [x] 為 `Architect` 節點加入 try-except 包裹
- [x] 為 `QA` 節點加入 try-except 包裹
- [x] 新增 `ErrorHandler` 節點至 graph.py
- [x] 新增錯誤狀態至 ProjectState
- [x] 新增單元測試覆蓋主要錯誤場景
- [x] 更新 README.md 說明錯誤處理流程

## 實作細節

### 1. ErrorState 模型
```python
# engine/core/error_handling.py

from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

class ErrorState(BaseModel):
    """錯誤狀態模型"""
    error_type: Literal[
        "llm_timeout",
        "llm_rate_limit",
        "llm_context_length",
        "tool_execution_error",
        "validation_error",
        "permission_denied",
        "file_not_found",
        "unknown"
    ] = Field(description="錯誤類型")
    
    error_message: str = Field(description="錯誤訊息")
    error_source: str = Field(description="錯誤來源節點")
    retry_count: int = Field(default=0, description="已重試次數")
    max_retries: int = Field(default=3, description="最大重試次數")
    last_retry_at: Optional[datetime] = Field(default=None)
    recovery_strategy: Optional[str] = Field(default=None)
    recovery_target: Optional[str] = Field(default=None)

class ErrorCategory(Enum):
    """錯誤類別"""
    TRANSIENT = "transient"      # 暫時性，可重試
    PERMANENT = "permanent"      # 永久性，需人工介入
    PERMISSION = "permission"     # 權限問題，需請求授權
    VALIDATION = "validation"    # 驗證失敗，需重新規劃
```

### 2. ErrorHandler 類別
```python
# engine/core/error_handling.py

class ErrorHandler:
    """統一錯誤處理器"""
    
    def __init__(self):
        self.recovery_strategies = {
            "llm_timeout": "retry_with_smaller_model",
            "llm_rate_limit": "exponential_backoff_retry",
            "llm_context_length": "truncate_and_retry",
            "tool_execution_error": "retry_with_alternative_tool",
            "validation_error": "replan_task",
            "permission_denied": "request_permission",
            "file_not_found": "create_file_or_skip",
        }
        
        self.max_retries_map = {
            "llm_timeout": 3,
            "llm_rate_limit": 5,
            "tool_execution_error": 2,
            "validation_error": 1,
            "permission_denied": 0,
            "unknown": 1,
        }
    
    def _classify_error(self, error: Exception) -> str:
        """分類錯誤類型"""
        error_str = str(error).lower()
        
        if "timeout" in error_str or "timed out" in error_str:
            return "llm_timeout"
        if "rate limit" in error_str or "429" in error_str:
            return "llm_rate_limit"
        if "context" in error_str and "length" in error_str:
            return "llm_context_length"
        if "permission" in error_str or "denied" in error_str:
            return "permission_denied"
        if "not found" in error_str:
            return "file_not_found"
        if "validation" in error_str:
            return "validation_error"
        
        return "unknown"
    
    async def handle_error(
        self, 
        state: dict, 
        error: Exception, 
        source_node: str
    ) -> dict:
        """處理錯誤並返回更新後的狀態"""
        
        error_type = self._classify_error(error)
        existing = state.get("error_state")
        
        if existing and existing.error_type == error_type:
            # 同類錯誤，增加計數
            existing.retry_count += 1
            existing.last_retry_at = datetime.now()
        else:
            # 新錯誤
            existing = ErrorState(
                error_type=error_type,
                error_message=str(error),
                error_source=source_node,
                max_retries=self.max_retries_map.get(error_type, 3),
                recovery_strategy=self.recovery_strategies.get(error_type),
                last_retry_at=datetime.now(),
            )
        
        # 檢查是否超過重試上限
        if existing.retry_count >= existing.max_retries:
            return await self._escalate(state, existing)
        
        # 設定恢復目標
        existing.recovery_target = self._get_recovery_target(error_type, source_node)
        
        return {
            "error_state": existing,
            "sender": "ErrorHandler",
            "messages": [AIMessage(content=f"⚠️ {error_type}: {str(error)[:100]}")]
        }
    
    async def _escalate(self, state: dict, error_state: ErrorState) -> dict:
        """錯誤升級"""
        return {
            "error_state": error_state,
            "sender": "ErrorHandler",
            "recovery_target": "PM",
            "messages": [AIMessage(content=f"🔴 錯誤升級至 PM: {error_state.error_type} 已達重試上限")]
        }
    
    def _get_recovery_target(self, error_type: str, source_node: str) -> str:
        """決定恢復目標節點"""
        if error_type in ("llm_timeout", "llm_rate_limit", "llm_context_length"):
            return source_node  # 重試同一節點
        
        if error_type == "validation_error":
            return "PM"  # 需重新規劃
        
        if error_type == "permission_denied":
            return "PM"  # 需請求權限
        
        return source_node
```

### 3. 節點整合
```python
# engine/nodes/coder_node.py

async def coder_node(state):
    error_handler = ErrorHandler()
    
    try:
        # 正常執行
        tech_spec = state.get("tech_spec")
        ac_items = state.get("ac_items", [])
        
        # ... 實作邏輯 ...
        
        return {
            "messages": [response],
            "sender": "Coder",
            "iteration_count": state.get("iteration_count", 0) + 1,
        }
        
    except Exception as e:
        logger.error(f"[Coder] Error: {e}")
        return await error_handler.handle_error(state, e, "Coder")
```

### 4. Graph 整合
```python
# engine/graph.py

class ProjectState(TypedDict):
    # ... 現有欄位 ...
    error_state: Optional[ErrorState]
    recovery_target: Optional[str]

def build_project_graph():
    # ... 現有節點 ...
    builder.add_node("ErrorHandler", create_error_handler_node())
    
    # 所有節點都可以路由到 ErrorHandler
    for node in ["Coder", "Architect", "QA", "Security"]:
        builder.add_conditional_edges(
            node,
            lambda s: "ErrorHandler" if s.get("error_state") else "Supervisor",
            {"ErrorHandler": "ErrorHandler", "Supervisor": "Supervisor"}
        )
    
    # ErrorHandler 路由到恢復目標
    builder.add_conditional_edges(
        "ErrorHandler",
        lambda s: s.get("recovery_target", "PM"),
        {n: n for n in all_nodes}
    )
```

## 備註
- 重試策略可擴充：指數退避、隨機抖動
- 錯誤日誌需持久化至 Redis
- 可考慮整合 Sentry 等錯誤追蹤服務

## 風險
- 過多重試可能導致 API 成本增加
- 某些錯誤（如 validation_error）重試無效，需謹慎設計策略
