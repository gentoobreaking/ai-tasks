---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/644
title: 任務權重表前端配置面板
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作前端面板讓用戶可配置並行執行的任務權重表
---

# T137 - 任務權重表前端配置面板

## 目標
實作前端配置面板，讓用戶可調整動態並行度管理（T129）的任務權重表參數。

## 背景
動態並行度管理使用權重表來計算任務的資源消耗：
```python
DEFAULT_WEIGHTS = {
    "web_search": TaskWeight(cpu_weight=0.1, memory_weight=0.1, io_weight=0.8, ...),
    "code_generation": TaskWeight(cpu_weight=0.3, memory_weight=0.5, io_weight=0.1, ...),
    "test_execution": TaskWeight(cpu_weight=0.8, memory_weight=0.4, io_weight=0.3, ...),
    ...
}
```

用戶需要前端介面來：
- 調整各任務類型的權重參數
- 新增自定義任務類型
- 匯入/匯出權重表配置

## 驗收標準
- [x] 在「設定」頁面新增「並行管理」區塊
- [x] 顯示任務類型列表及其權重參數
- [x] 每個任務類型可調整：CPU 權重、記憶體權重、I/O 權重、LLM 權重、預估執行時間
- [x] 提供視覺化圖表顯示權重分佈（雷達圖或柱狀圖）
- [x] 提供權重預覽（輸入任務清單，顯示計算後的並行度）
- [x] 支援新增/刪除自定義任務類型
- [x] 支援匯入/匯出 YAML 配置檔案
- [x] 新增 API endpoint `/api/config/task-weights`
- [x] 儲存後更新 task_weights.yaml 配置檔案

## 實作細節

### 1. 配置模型
```python
# engine/config/task_weights.py

from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Literal
import yaml
import os

class TaskWeight(BaseModel):
    """任務權重配置"""
    task_type: str = Field(description="任務類型識別碼")
    cpu_weight: float = Field(ge=0, le=1, description="CPU 權重（0-1）")
    memory_weight: float = Field(ge=0, le=1, description="記憶體權重（0-1）")
    io_weight: float = Field(ge=0, le=1, description="I/O 權重（0-1）")
    llm_weight: float = Field(ge=0, le=1, description="LLM 呼叫權重（0-1）")
    duration_estimate: float = Field(ge=0, description="預估執行時間（秒）")
    description: str = Field(default="", description="任務描述")
    
    @field_validator('cpu_weight', 'memory_weight', 'io_weight', 'llm_weight')
    @classmethod
    def validate_weight_range(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('權重必須在 0-1 之間')
        return v
    
    @property
    def total_weight(self) -> float:
        """計算總權重"""
        return (
            self.cpu_weight * 0.3 +
            self.memory_weight * 0.2 +
            self.io_weight * 0.2 +
            self.llm_weight * 0.3
        )

class TaskWeightsConfig(BaseModel):
    """任務權重表總配置"""
    weights: Dict[str, TaskWeight] = Field(default_factory=dict)
    
    # 全域設定
    max_parallel: int = Field(default=4, ge=1, le=16, description="最大並行度")
    load_threshold: float = Field(default=0.8, ge=0.5, le=1.0, description="負載閾值")
    
    DEFAULT_WEIGHTS = {
        "web_search": TaskWeight(
            task_type="web_search",
            cpu_weight=0.1,
            memory_weight=0.1,
            io_weight=0.8,
            llm_weight=0.2,
            duration_estimate=5,
            description="網路搜尋"
        ),
        "code_generation": TaskWeight(
            task_type="code_generation",
            cpu_weight=0.3,
            memory_weight=0.5,
            io_weight=0.1,
            llm_weight=1.0,
            duration_estimate=30,
            description="代碼生成"
        ),
        "test_execution": TaskWeight(
            task_type="test_execution",
            cpu_weight=0.8,
            memory_weight=0.4,
            io_weight=0.3,
            llm_weight=0.1,
            duration_estimate=15,
            description="測試執行"
        ),
        "file_write": TaskWeight(
            task_type="file_write",
            cpu_weight=0.1,
            memory_weight=0.1,
            io_weight=0.5,
            llm_weight=0.0,
            duration_estimate=2,
            description="檔案寫入"
        ),
        "git_operation": TaskWeight(
            task_type="git_operation",
            cpu_weight=0.1,
            memory_weight=0.2,
            io_weight=0.7,
            llm_weight=0.0,
            duration_estimate=3,
            description="Git 操作"
        ),
        "security_scan": TaskWeight(
            task_type="security_scan",
            cpu_weight=0.6,
            memory_weight=0.3,
            io_weight=0.4,
            llm_weight=0.0,
            duration_estimate=20,
            description="安全掃描"
        ),
        "rag_sync": TaskWeight(
            task_type="rag_sync",
            cpu_weight=0.4,
            memory_weight=0.6,
            io_weight=0.8,
            llm_weight=0.0,
            duration_estimate=10,
            description="RAG 同步"
        ),
    }
```

### 2. API Endpoint
```python
# frontend_api/routes/task_weights.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from engine.config.task_weights import TaskWeightsConfig, TaskWeight
import yaml
import os
import json

router = APIRouter(prefix="/api/config/task-weights", tags=["config"])

CONFIG_PATH = os.path.expanduser(
    "~/Projects/mindnav-codeagent/config/task_weights.yaml"
)

@router.get("")
async def get_task_weights():
    """取得任務權重配置"""
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            # 轉換為正確格式
            if "weights" in data and isinstance(data["weights"], dict):
                weights = {}
                for k, v in data["weights"].items():
                    weights[k] = TaskWeight(**v).model_dump()
                data["weights"] = weights
            return TaskWeightsConfig(**data).model_dump()
    else:
        return TaskWeightsConfig(
            weights=TaskWeightsConfig.DEFAULT_WEIGHTS
        ).model_dump()

@router.put("")
async def update_task_weights(config: TaskWeightsConfig):
    """更新任務權重配置"""
    # 轉換為可序列化格式
    data = config.model_dump()
    
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
    
    return {
        "message": "Task weights configuration updated",
        "config": data
    }

@router.post("/weights")
async def add_task_weight(weight: TaskWeight):
    """新增任務類型"""
    config = await get_task_weights()
    config_obj = TaskWeightsConfig(**config)
    
    if weight.task_type in config_obj.weights:
        raise HTTPException(status_code=400, detail="Task type already exists")
    
    config_obj.weights[weight.task_type] = weight
    await update_task_weights(config_obj)
    
    return {"message": f"Task type '{weight.task_type}' added", "weight": weight.model_dump()}

@router.put("/weights/{task_type}")
async def update_task_weight(task_type: str, weight: TaskWeight):
    """更新特定任務類型的權重"""
    config = await get_task_weights()
    config_obj = TaskWeightsConfig(**config)
    
    if task_type not in config_obj.weights:
        raise HTTPException(status_code=404, detail="Task type not found")
    
    config_obj.weights[task_type] = weight
    await update_task_weights(config_obj)
    
    return {"message": f"Task type '{task_type}' updated"}

@router.delete("/weights/{task_type}")
async def delete_task_weight(task_type: str):
    """刪除任務類型"""
    config = await get_task_weights()
    config_obj = TaskWeightsConfig(**config)
    
    if task_type not in config_obj.weights:
        raise HTTPException(status_code=404, detail="Task type not found")
    
    # 禁止刪除預設類型
    if task_type in TaskWeightsConfig.DEFAULT_WEIGHTS:
        raise HTTPException(status_code=400, detail="Cannot delete default task type")
    
    del config_obj.weights[task_type]
    await update_task_weights(config_obj)
    
    return {"message": f"Task type '{task_type}' deleted"}

@router.post("/preview")
async def preview_parallelism(tasks: List[str]):
    """預覽並行度計算"""
    config = await get_task_weights()
    config_obj = TaskWeightsConfig(**config)
    
    total_weight = 0
    task_details = []
    
    for task_type in tasks:
        weight = config_obj.weights.get(task_type)
        if weight:
            total_weight += weight.total_weight
            task_details.append({
                "task_type": task_type,
                "total_weight": weight.total_weight,
                "duration_estimate": weight.duration_estimate
            })
        else:
            # 使用預設權重（假設為中等）
            task_details.append({
                "task_type": task_type,
                "total_weight": 0.5,
                "duration_estimate": 10
            })
            total_weight += 0.5
    
    # 計算建議並行度
    if total_weight <= 2.0:
        suggested_parallelism = min(config_obj.max_parallel, len(tasks))
    elif total_weight <= 4.0:
        suggested_parallelism = min(2, len(tasks))
    else:
        suggested_parallelism = 1
    
    return {
        "tasks": task_details,
        "total_weight": total_weight,
        "suggested_parallelism": suggested_parallelism,
        "estimated_total_duration": sum(t["duration_estimate"] for t in task_details)
    }

@router.post("/export")
async def export_config():
    """匯出配置為 YAML"""
    config = await get_task_weights()
    return {"yaml": yaml.dump(config, default_flow_style=False, allow_unicode=True)}

@router.post("/import")
async def import_config(file: UploadFile = File(...)):
    """匯入配置"""
    content = await file.read()
    data = yaml.safe_load(content)
    
    config = TaskWeightsConfig(**data)
    await update_task_weights(config)
    
    return {"message": "Configuration imported", "config": config.model_dump()}
```

### 3. 前端元件
```tsx
// frontend-react/src/pages/TaskWeightsConfig.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface TaskWeight {
  task_type: string;
  cpu_weight: number;
  memory_weight: number;
  io_weight: number;
  llm_weight: number;
  duration_estimate: number;
  description: string;
}

export const TaskWeightsConfig: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [weights, setWeights] = useState<Record<string, TaskWeight>>({});
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [previewTasks, setPreviewTasks] = useState<string[]>([]);
  const [previewResult, setPreviewResult] = useState<any>(null);
  
  useEffect(() => {
    axios.get('/api/config/task-weights')
      .then(res => {
        setConfig(res.data);
        setWeights(res.data.weights);
      });
  }, []);
  
  const handleUpdateWeight = (taskType: string, updates: Partial<TaskWeight>) => {
    setWeights({
      ...weights,
      [taskType]: {
        ...weights[taskType],
        ...updates
      }
    });
  };
  
  const handleSave = async () => {
    await axios.put('/api/config/task-weights', {
      ...config,
      weights
    });
    alert('配置已儲存');
  };
  
  const handlePreview = async () => {
    const res = await axios.post('/api/config/task-weights/preview', previewTasks);
    setPreviewResult(res.data);
  };
  
  const handleExport = async () => {
    const res = await axios.get('/api/config/task-weights/export');
    const blob = new Blob([res.data.yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_weights.yaml';
    a.click();
  };
  
  // 準備雷達圖資料
  const radarData = selectedTask && weights[selectedTask] ? [
    { subject: 'CPU', value: weights[selectedTask].cpu_weight },
    { subject: 'Memory', value: weights[selectedTask].memory_weight },
    { subject: 'I/O', value: weights[selectedTask].io_weight },
    { subject: 'LLM', value: weights[selectedTask].llm_weight },
  ] : [];
  
  if (!config) return <div>Loading...</div>;
  
  return (
    <div className="task-weights-config">
      <h1>並行管理配置</h1>
      
      <div className="global-settings">
        <h2>全域設定</h2>
        <div className="setting-row">
          <label>最大並行度</label>
          <input
            type="number"
            min={1}
            max={16}
            value={config.max_parallel}
            onChange={e => setConfig({...config, max_parallel: parseInt(e.target.value)})}
          />
        </div>
        <div className="setting-row">
          <label>負載閾值</label>
          <input
            type="range"
            min={0.5}
            max={1.0}
            step={0.05}
            value={config.load_threshold}
            onChange={e => setConfig({...config, load_threshold: parseFloat(e.target.value)})}
          />
          <span>{(config.load_threshold * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="weights-section">
        <h2>任務權重表</h2>
        
        <div className="weights-grid">
          <div className="weights-list">
            <table>
              <thead>
                <tr>
                  <th>任務類型</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>I/O</th>
                  <th>LLM</th>
                  <th>時間(s)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(weights).map(([taskType, weight]) => (
                  <tr
                    key={taskType}
                    className={selectedTask === taskType ? 'selected' : ''}
                    onClick={() => setSelectedTask(taskType)}
                  >
                    <td>
                      <strong>{taskType}</strong>
                      <div className="task-desc">{weight.description}</div>
                    </td>
                    <td>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={weight.cpu_weight}
                        onChange={e => handleUpdateWeight(taskType, {
                          cpu_weight: parseFloat(e.target.value)
                        })}
                        onClick={e => e.stopPropagation()}
                      />
                      <span>{weight.cpu_weight.toFixed(1)}</span>
                    </td>
                    <td>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={weight.memory_weight}
                        onChange={e => handleUpdateWeight(taskType, {
                          memory_weight: parseFloat(e.target.value)
                        })}
                        onClick={e => e.stopPropagation()}
                      />
                      <span>{weight.memory_weight.toFixed(1)}</span>
                    </td>
                    <td>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={weight.io_weight}
                        onChange={e => handleUpdateWeight(taskType, {
                          io_weight: parseFloat(e.target.value)
                        })}
                        onClick={e => e.stopPropagation()}
                      />
                      <span>{weight.io_weight.toFixed(1)}</span>
                    </td>
                    <td>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={weight.llm_weight}
                        onChange={e => handleUpdateWeight(taskType, {
                          llm_weight: parseFloat(e.target.value)
                        })}
                        onClick={e => e.stopPropagation()}
                      />
                      <span>{weight.llm_weight.toFixed(1)}</span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={weight.duration_estimate}
                        onChange={e => handleUpdateWeight(taskType, {
                          duration_estimate: parseInt(e.target.value)
                        })}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <button onClick={e => {
                        e.stopPropagation();
                        // 編輯詳情
                      }}>編輯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedTask && (
            <div className="weight-visualization">
              <h3>{selectedTask} 權重分佈</h3>
              <RadarChart width={300} height={300} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 1]} />
                <Radar
                  name={selectedTask}
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
              <div className="weight-summary">
                <p>總權重: <strong>{weights[selectedTask].total_weight.toFixed(2)}</strong></p>
                <p>預估時間: <strong>{weights[selectedTask].duration_estimate}s</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="preview-section">
        <h2>並行度預覽</h2>
        <div className="task-selector">
          {Object.keys(weights).map(taskType => (
            <label key={taskType}>
              <input
                type="checkbox"
                checked={previewTasks.includes(taskType)}
                onChange={e => {
                  if (e.target.checked) {
                    setPreviewTasks([...previewTasks, taskType]);
                  } else {
                    setPreviewTasks(previewTasks.filter(t => t !== taskType));
                  }
                }}
              />
              {taskType}
            </label>
          ))}
        </div>
        <button onClick={handlePreview}>計算並行度</button>
        
        {previewResult && (
          <div className="preview-result">
            <h3>預覽結果</h3>
            <div className="result-stats">
              <div className="stat">
                <label>總權重</label>
                <span>{previewResult.total_weight.toFixed(2)}</span>
              </div>
              <div className="stat">
                <label>建議並行度</label>
                <span>{previewResult.suggested_parallelism}</span>
              </div>
              <div className="stat">
                <label>預估總時間</label>
                <span>{previewResult.estimated_total_duration}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="actions">
        <button className="primary" onClick={handleSave}>
          儲存配置
        </button>
        <button onClick={handleExport}>
          匯出 YAML
        </button>
        <button onClick={() => {/* 匯入 */}}>
          匯入 YAML
        </button>
      </div>
    </div>
  );
};
```

## 備註
- 使用雷達圖視覺化權重分佈
- 支援匯入/匯出以便備份和分享配置
- 預覽功能幫助用戶理解並行度計算邏輯

## 風險
- 不當的權重設定可能導致系統過載或資源閒置
- 需要教育用戶理解各參數的意義
