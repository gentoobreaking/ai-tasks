---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/637
title: Workflow 執行追蹤與視覺化
type: Feature
priority: P3
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 實作 WorkflowTracer + Mermaid 匯出 + 即時狀態面板
---

# T130 - Workflow 執行追蹤與視覺化

## 目標
為 MindNav CodeAgent 實作 workflow 執行追蹤系統，支援執行歷史記錄、Mermaid 流程圖匯出、即時狀態監控。

## 背景
目前缺少：
- 執行歷史追蹤（哪個節點何時被觸發、為什麼）
- 除錯工具（為什麼路由到這個節點）
- 視覺化呈現（流程圖）

## 驗收標準
- [x] 實作 `WorkflowTracer` 類別（記錄節點轉換、原因、狀態快照）
- [x] 實作 `TraceEntry` 模型（時間戳、來源、目標、原因、狀態）
- [x] 實作 `MermaidExporter` 類別（匯出執行流程圖）
- [x] 實作 `TraceDashboard` API endpoint（查詢執行歷史）
- [x] 整合至 `supervisor_node`（每次路由記錄一次）
- [ ] 整合至其他節點（執行開始/結束記錄）
- [ ] 新增前端追蹤面板（React 元件）
- [x] 新增追蹤單元測試

## 實作細節

### 1. 追蹤模型
```python
# engine/debug/trace_models.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List

class TraceEntry(BaseModel):
    """追蹤記錄項"""
    entry_id: str = Field(description="唯一 ID")
    timestamp: datetime = Field(default_factory=datetime.now)
    from_node: str = Field(description="來源節點")
    to_node: str = Field(description="目標節點")
    reason: str = Field(description="路由原因")
    intent: Optional[str] = Field(default=None, description="用戶意圖")
    
    # 狀態快照（精簡版）
    state_keys: List[str] = Field(default_factory=list)
    iteration: int = Field(default=0)
    message_preview: str = Field(default="", max_length=200)
    
    # 執行資訊
    duration_ms: Optional[float] = Field(default=None)
    success: bool = Field(default=True)
    error_message: Optional[str] = Field(default=None)

class WorkflowTrace(BaseModel):
    """完整工作流追蹤"""
    thread_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    entries: List[TraceEntry] = Field(default_factory=list)
    
    # 統計
    total_nodes: int = Field(default=0)
    total_duration_ms: float = Field(default=0)
    node_visits: Dict[str, int] = Field(default_factory=dict)
    
    def add_entry(self, entry: TraceEntry):
        self.entries.append(entry)
        self.total_nodes += 1
        self.node_visits[entry.to_node] = self.node_visits.get(entry.to_node, 0) + 1
```

### 2. Workflow 追蹤器
```python
# engine/debug/workflow_tracer.py

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from engine.debug.trace_models import TraceEntry, WorkflowTrace
from engine.helpers import get_message_content

class WorkflowTracer:
    """工作流追蹤器"""
    
    _instance = None
    _traces: Dict[str, WorkflowTrace] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def start_trace(self, thread_id: str) -> str:
        """開始新的追蹤"""
        trace = WorkflowTrace(
            thread_id=thread_id,
            start_time=datetime.now()
        )
        self._traces[thread_id] = trace
        return thread_id
    
    def log_transition(
        self,
        thread_id: str,
        from_node: str,
        to_node: str,
        reason: str,
        state: Dict[str, Any],
        intent: Optional[str] = None,
        duration_ms: Optional[float] = None
    ):
        """記錄節點轉換"""
        trace = self._traces.get(thread_id)
        if not trace:
            return
        
        entry = TraceEntry(
            entry_id=str(uuid.uuid4())[:8],
            timestamp=datetime.now(),
            from_node=from_node,
            to_node=to_node,
            reason=reason,
            intent=intent,
            state_keys=list(state.keys()),
            iteration=state.get("iteration_count", 0),
            message_preview=self._preview_message(state),
            duration_ms=duration_ms
        )
        
        trace.add_entry(entry)
    
    def log_node_start(self, thread_id: str, node_name: str, state: Dict[str, Any]):
        """記錄節點開始執行"""
        self.log_transition(
            thread_id=thread_id,
            from_node="Supervisor",
            to_node=node_name,
            reason=f"開始執行 {node_name}",
            state=state
        )
    
    def log_node_end(self, thread_id: str, node_name: str, state: Dict[str, Any], success: bool = True):
        """記錄節點執行結束"""
        self.log_transition(
            thread_id=thread_id,
            from_node=node_name,
            to_node="Supervisor",
            reason=f"執行{'成功' if success else '失敗'}",
            state=state,
            duration_ms=state.get("_node_duration_ms")
        )
    
    def end_trace(self, thread_id: str):
        """結束追蹤"""
        trace = self._traces.get(thread_id)
        if trace:
            trace.end_time = datetime.now()
            if trace.start_time:
                trace.total_duration_ms = (trace.end_time - trace.start_time).total_seconds() * 1000
    
    def get_trace(self, thread_id: str) -> Optional[WorkflowTrace]:
        """取得追蹤記錄"""
        return self._traces.get(thread_id)
    
    def get_recent_traces(self, limit: int = 10) -> List[WorkflowTrace]:
        """取得最近的追蹤記錄"""
        sorted_traces = sorted(
            self._traces.values(),
            key=lambda t: t.start_time,
            reverse=True
        )
        return sorted_traces[:limit]
    
    def _preview_message(self, state: Dict[str, Any]) -> str:
        """取得訊息預覽"""
        if state.get("messages"):
            content = get_message_content(state["messages"][-1])
            return content[:200] + "..." if len(content) > 200 else content
        return ""
```

### 3. Mermaid 匯出器
```python
# engine/debug/mermaid_exporter.py

class MermaidExporter:
    """Mermaid 流程圖匯出器"""
    
    @staticmethod
    def export_trace(trace: WorkflowTrace) -> str:
        """匯出追蹤記錄為 Mermaid 流程圖"""
        lines = ["graph LR"]
        
        # 定義節點樣式
        styles = {
            "PO": "fill:#f9f,stroke:#333",
            "PM": "fill:#9ff,stroke:#333",
            "Architect": "fill:#ff9,stroke:#333",
            "Coder": "fill:#9f9,stroke:#333",
            "Security": "fill:#f99,stroke:#333",
            "QA": "fill:#99f,stroke:#333",
            "Doc": "fill:#ccc,stroke:#333",
            "Researcher": "fill:#9cf,stroke:#333",
            "DevOps": "fill:#fc9,stroke:#333",
            "Supervisor": "fill:#fff,stroke:#000,stroke-width:2px",
            "END": "fill:#000,stroke:#333,color:#fff"
        }
        
        # 添加樣式定義
        for node, style in styles.items():
            lines.append(f"    style {node} {style}")
        
        # 添加轉換邊
        seen_edges = set()
        for entry in trace.entries:
            edge_key = (entry.from_node, entry.to_node)
            if edge_key not in seen_edges:
                # 截斷原因
                reason_short = entry.reason[:20] + "..." if len(entry.reason) > 20 else entry.reason
                lines.append(f"    {entry.from_node} -->|{reason_short}| {entry.to_node}")
                seen_edges.add(edge_key)
        
        # 添加統計資訊
        lines.append("")
        lines.append("%% Statistics")
        lines.append(f"%% Total nodes: {trace.total_nodes}")
        lines.append(f"%% Total duration: {trace.total_duration_ms:.0f}ms")
        lines.append(f"%% Node visits: {trace.node_visits}")
        
        return "\n".join(lines)
    
    @staticmethod
    def export_full_workflow() -> str:
        """匯出完整工作流圖"""
        return """graph TB
    User --> PO
    PO -->|需求結構化| PM
    PM -->|任務拆解| Architect
    PM -->|直接實作| Coder
    PM -->|需研究| Researcher
    PM -->|需文件| Doc
    
    Architect -->|TechSpec| ReviewGate
    ReviewGate -->|審查通過| Coder
    ReviewGate -->|審查失敗| Architect
    
    Coder -->|代碼產出| Security
    Security -->|安全通過| QA
    Security -->|有漏洞| Coder
    
    QA -->|測試通過| PM
    QA -->|測試失敗| Coder
    
    Researcher -->|研究報告| PM
    Doc -->|文件| PM
    DevOps -->|部署結果| PM
    
    PM -->|FINISHED| END
"""
```

### 4. API Endpoint
```python
# frontend_api/routes/tracing.py

from fastapi import APIRouter, HTTPException
from engine.debug.workflow_tracer import WorkflowTracer
from engine.debug.mermaid_exporter import MermaidExporter

router = APIRouter(prefix="/api/tracing", tags=["tracing"])

tracer = WorkflowTracer()

@router.get("/recent")
async def get_recent_traces(limit: int = 10):
    """取得最近的追蹤記錄"""
    traces = tracer.get_recent_traces(limit)
    return {
        "traces": [
            {
                "thread_id": t.thread_id,
                "start_time": t.start_time.isoformat(),
                "end_time": t.end_time.isoformat() if t.end_time else None,
                "total_nodes": t.total_nodes,
                "total_duration_ms": t.total_duration_ms,
                "node_visits": t.node_visits
            }
            for t in traces
        ]
    }

@router.get("/{thread_id}")
async def get_trace(thread_id: str):
    """取得特定追蹤記錄"""
    trace = tracer.get_trace(thread_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    
    return {
        "thread_id": trace.thread_id,
        "start_time": trace.start_time.isoformat(),
        "end_time": trace.end_time.isoformat() if trace.end_time else None,
        "entries": [
            {
                "entry_id": e.entry_id,
                "timestamp": e.timestamp.isoformat(),
                "from_node": e.from_node,
                "to_node": e.to_node,
                "reason": e.reason,
                "intent": e.intent,
                "iteration": e.iteration,
                "message_preview": e.message_preview,
                "duration_ms": e.duration_ms,
                "success": e.success
            }
            for e in trace.entries
        ],
        "total_nodes": trace.total_nodes,
        "total_duration_ms": trace.total_duration_ms,
        "node_visits": trace.node_visits
    }

@router.get("/{thread_id}/mermaid")
async def get_mermaid(thread_id: str):
    """取得 Mermaid 流程圖"""
    trace = tracer.get_trace(thread_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    
    mermaid_code = MermaidExporter.export_trace(trace)
    return {"mermaid": mermaid_code}

@router.get("/workflow/full")
async def get_full_workflow():
    """取得完整工作流圖"""
    mermaid_code = MermaidExporter.export_full_workflow()
    return {"mermaid": mermaid_code}
```

### 5. 整合至 Supervisor
```python
# engine/nodes/supervisor_node.py

from engine.debug.workflow_tracer import WorkflowTracer

async def supervisor_node(state, config=None):
    tracer = WorkflowTracer()
    thread_id = (config or {}).get("configurable", {}).get("thread_id", "unknown")
    
    # 確保追蹤已啟動
    if not tracer.get_trace(thread_id):
        tracer.start_trace(thread_id)
    
    # 記錄路由決策
    decision = await supervisor.route(state)
    
    tracer.log_transition(
        thread_id=thread_id,
        from_node=state.get("sender", "User"),
        to_node=decision.next_node,
        reason=decision.reason,
        state=state,
        intent=state.get("intent")
    )
    
    # 如果結束，關閉追蹤
    if decision.next_node == END:
        tracer.end_trace(thread_id)
    
    return {
        "sender": "Supervisor",
        "next_node": decision.next_node,
    }
```

### 6. 前端元件
```tsx
// frontend-react/src/pages/TraceDashboard.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactFlow from 'reactflow';

interface TraceEntry {
  entry_id: string;
  timestamp: string;
  from_node: string;
  to_node: string;
  reason: string;
  iteration: number;
}

export const TraceDashboard: React.FC = () => {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null);
  const [mermaidCode, setMermaidCode] = useState('');
  
  useEffect(() => {
    axios.get('/api/tracing/recent')
      .then(res => setTraces(res.data.traces));
  }, []);
  
  useEffect(() => {
    if (selectedTrace) {
      axios.get(`/api/tracing/${selectedTrace}/mermaid`)
        .then(res => setMermaidCode(res.data.mermaid));
    }
  }, [selectedTrace]);
  
  return (
    <div className="trace-dashboard">
      <div className="trace-list">
        <h2>執行歷史</h2>
        {traces.map((t: any) => (
          <div
            key={t.thread_id}
            className={`trace-item ${selectedTrace === t.thread_id ? 'active' : ''}`}
            onClick={() => setSelectedTrace(t.thread_id)}
          >
            <div className="trace-time">
              {new Date(t.start_time).toLocaleString()}
            </div>
            <div className="trace-stats">
              節點: {t.total_nodes} | 耗時: {t.total_duration_ms}ms
            </div>
          </div>
        ))}
      </div>
      
      <div className="trace-visualization">
        <h2>流程圖</h2>
        {mermaidCode && (
          <div className="mermaid" dangerouslySetInnerHTML={{
            __html: mermaid.render('mermaid-svg', mermaidCode)
          }} />
        )}
      </div>
    </div>
  );
};
```

## 備註
- 追蹤記錄可持久化至 Redis
- Mermaid 可透過前端庫（如 mermaid.js）渲染
- 未來可整合至 LangSmith 或 Phoenix

## 風險
- 大量追蹤記錄可能佔用記憶體
- Mermaid 渲染可能影響前端效能
