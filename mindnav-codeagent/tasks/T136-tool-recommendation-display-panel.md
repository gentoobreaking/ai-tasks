---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/643
title: 工具推薦系統前端顯示面板
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作前端面板顯示工具推薦系統的建議
---

# T136 - 工具推薦系統前端顯示面板

## 目標
實作前端面板，顯示工具推薦系統（T128）的建議清單，讓用戶了解當前任務建議使用的工具。

## 背景
工具推薦系統會根據角色、任務類型、當前狀態推薦最適合的工具：
```python
result = {
    "defaults": ["file_tool", "search_tool", "shell_tool"],
    "task_specific": ["bash", "grep_file"],
    "context_specific": ["rag_sync"],
    "priority_order": ["file_tool", "search_tool", ...]
}
```

用戶需要前端介面來：
- 查看當前任務的推薦工具
- 了解推薦原因
- 看到工具的優先級排序

## 驗收標準
- [x] 在「工具管理」頁面新增「推薦工具」區塊
- [x] 顯示當前任務的推薦工具清單
- [x] 分組顯示：預設工具、任務相關工具、情境工具
- [x] 每個工具顯示推薦原因
- [x] 顯示優先級排序（可拖拽調整）
- [x] 點擊工具可查看詳細說明
- [x] 新增 API endpoint `/api/tools/recommendations`
- [x] 支援 WebSocket 即時更新推薦

## 實作細節

### 1. API Endpoint
```python
# frontend_api/routes/tool_recommendations.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from engine.tools.tool_recommendation import ToolRecommender
from engine.agent_registry import AgentRegistry
import json

router = APIRouter(prefix="/api/tools", tags=["tools"])

@router.get("/recommendations")
async def get_tool_recommendations(role: str = "Coder", task: str = ""):
    """取得工具推薦"""
    recommender = ToolRecommender()
    
    # 如果沒有提供任務，使用最後一則訊息
    state = {"messages": []}  # 實際應從 session 取得
    recommendations = recommender.recommend_tools(role, task, state)
    
    # 取得工具詳細資訊
    registry = AgentRegistry()
    all_tools = registry.list()
    
    tool_details = []
    for tool_name in recommendations["priority_order"]:
        if tool_name in all_tools:
            tool = all_tools[tool_name]
            priority = "high" if tool_name in recommendations["defaults"] else \
                       "medium" if tool_name in recommendations["task_specific"] else "low"
            
            tool_details.append({
                "name": tool_name,
                "description": tool.description,
                "priority": priority,
                "reason": _get_reason(tool_name, recommendations),
                "usage_example": getattr(tool, "usage_example", "")
            })
    
    return {
        "role": role,
        "task": task[:100] if task else "",
        "recommendations": recommendations,
        "tool_details": tool_details
    }

def _get_reason(tool_name: str, recommendations: dict) -> str:
    """取得推薦原因"""
    if tool_name in recommendations.get("defaults", []):
        return "預設工具（高頻使用）"
    if tool_name in recommendations.get("task_specific", []):
        return "任務相關（根據任務類型推薦）"
    if tool_name in recommendations.get("context_specific", []):
        return "情境工具（根據當前狀態推薦）"
    return "允許使用"

@router.websocket("/recommendations/ws")
async def websocket_recommendations(websocket: WebSocket):
    """WebSocket 即時推薦"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)
            
            role = request.get("role", "Coder")
            task = request.get("task", "")
            
            # 取得推薦
            response = await get_tool_recommendations(role, task)
            
            await websocket.send_json(response)
    except WebSocketDisconnect:
        pass
```

### 2. 前端元件
```tsx
// frontend-react/src/pages/ToolRecommendations.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ToolDetail {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  usage_example: string;
}

export const ToolRecommendations: React.FC = () => {
  const [role, setRole] = useState('Coder');
  const [task, setTask] = useState('');
  const [recommendations, setRecommendations] = useState<any>(null);
  const [toolDetails, setToolDetails] = useState<ToolDetail[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolDetail | null>(null);
  
  useEffect(() => {
    fetchRecommendations();
  }, [role]);
  
  const fetchRecommendations = async () => {
    const res = await axios.get('/api/tools/recommendations', {
      params: { role, task }
    });
    setRecommendations(res.data.recommendations);
    setToolDetails(res.data.tool_details);
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(toolDetails);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setToolDetails(items);
  };
  
  const roles = ['Coder', 'Architect', 'PM', 'QA', 'Security', 'Researcher', 'DevOps', 'Doc'];
  
  return (
    <div className="tool-recommendations">
      <h1>工具推薦</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label>角色</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>任務描述</label>
          <input
            type="text"
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="輸入任務描述..."
          />
        </div>
        
        <button onClick={fetchRecommendations}>更新推薦</button>
      </div>
      
      {recommendations && (
        <div className="recommendation-summary">
          <h2>推薦摘要</h2>
          <div className="summary-stats">
            <div className="stat">
              <label>預設工具</label>
              <span>{recommendations.defaults.length}</span>
            </div>
            <div className="stat">
              <label>任務相關</label>
              <span>{recommendations.task_specific.length}</span>
            </div>
            <div className="stat">
              <label>情境工具</label>
              <span>{recommendations.context_specific.length}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="tool-list">
        <h2>推薦工具清單（可拖拽排序）</h2>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tools">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {toolDetails.map((tool, index) => (
                  <Draggable key={tool.name} draggableId={tool.name} index={index}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`tool-item priority-${tool.priority} ${snapshot.isDragging ? 'dragging' : ''}`}
                        onClick={() => setSelectedTool(tool)}
                      >
                        <div className="tool-header">
                          <span className="tool-name">{tool.name}</span>
                          <span className={`priority-badge ${tool.priority}`}>
                            {tool.priority}
                          </span>
                        </div>
                        <div className="tool-reason">{tool.reason}</div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      {selectedTool && (
        <div className="tool-detail-modal" onClick={() => setSelectedTool(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedTool.name}</h2>
            <div className="detail-section">
              <label>描述</label>
              <p>{selectedTool.description}</p>
            </div>
            <div className="detail-section">
              <label>推薦原因</label>
              <p>{selectedTool.reason}</p>
            </div>
            {selectedTool.usage_example && (
              <div className="detail-section">
                <label>使用範例</label>
                <pre><code>{selectedTool.usage_example}</code></pre>
              </div>
            )}
            <button onClick={() => setSelectedTool(null)}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. CSS 樣式
```css
/* frontend-react/src/pages/ToolRecommendations.css */

.tool-recommendations {
  padding: 24px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-summary {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-stats {
  display: flex;
  gap: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat span {
  font-size: 24px;
  font-weight: bold;
}

.tool-list ul {
  list-style: none;
  padding: 0;
}

.tool-item {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-item.dragging {
  opacity: 0.5;
  background: #f0f0f0;
}

.tool-item.priority-high {
  border-left: 4px solid #4caf50;
}

.tool-item.priority-medium {
  border-left: 4px solid #ff9800;
}

.tool-item.priority-low {
  border-left: 4px solid #9e9e9e;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-name {
  font-weight: bold;
  font-size: 16px;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.priority-badge.high {
  background: #e8f5e9;
  color: #2e7d32;
}

.priority-badge.medium {
  background: #fff3e0;
  color: #e65100;
}

.priority-badge.low {
  background: #f5f5f5;
  color: #616161;
}

.tool-reason {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.tool-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section label {
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.detail-section pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}
```

## 備註
- 使用 react-beautiful-dnd 實現拖拽排序
- WebSocket 支援即時更新
- 可考慮加入「固定工具」功能（優先級永遠最高）

## 風險
- 推薦邏輯可能不準確，需持續優化
- 過多推薦可能造成選擇困難
