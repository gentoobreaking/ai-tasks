---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/641
title: 錯誤重試策略前端配置面板
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作前端面板讓用戶可配置錯誤重試策略
---

# T134 - 錯誤重試策略前端配置面板

## 目標
實作前端配置面板，讓用戶可啟用/停用錯誤重試策略，並調整各項參數。

## 背景
錯誤處理（T125）包含多種重試策略：
```python
self.recovery_strategies = {
    "llm_timeout": "retry_with_smaller_model",
    "llm_rate_limit": "exponential_backoff_retry",
    "tool_execution_error": "retry_with_alternative_tool",
    "validation_error": "replan_task",
    "permission_denied": "request_permission",
}
```

用戶需要前端介面來：
- 啟用/停用重試功能
- 調整重試次數
- 選擇重試策略
- 設定退避參數

## 驗收標準
- [x] 在「設定」頁面新增「錯誤處理」區塊
- [x] 提供總開關：啟用/停用重試功能
- [x] 顯示各錯誤類型的重試策略配置
- [x] 可調整參數：最大重試次數、退避基數、最大等待時間
- [x] 提供策略下拉選單（指數退避、線性退避、固定間隔）
- [x] 新增 API endpoint `/api/config/error-handling`
- [x] 儲存後更新 error_handling.yaml 配置檔案

## 實作細節

### 1. 配置模型
```python
# engine/config/error_handling.py

from pydantic import BaseModel, Field
from typing import Dict, Literal, Optional
from enum import Enum

class BackoffStrategy(Enum):
    EXPONENTIAL = "exponential"
    LINEAR = "linear"
    FIXED = "fixed"

class ErrorTypeConfig(BaseModel):
    """單一錯誤類型的配置"""
    enabled: bool = Field(default=True)
    max_retries: int = Field(default=3, ge=0, le=10)
    backoff_strategy: BackoffStrategy = Field(default=BackoffStrategy.EXPONENTIAL)
    backoff_base: float = Field(default=2.0, description="退避基數（秒）")
    max_wait_seconds: float = Field(default=60.0, description="最大等待時間")
    recovery_strategy: str = Field(description="恢復策略")

class ErrorHandlingConfig(BaseModel):
    """錯誤處理總配置"""
    enabled: bool = Field(default=True, description="總開關")
    
    error_types: Dict[str, ErrorTypeConfig] = Field(default_factory=lambda: {
        "llm_timeout": ErrorTypeConfig(
            enabled=True,
            max_retries=3,
            backoff_strategy=BackoffStrategy.EXPONENTIAL,
            backoff_base=2.0,
            max_wait_seconds=60.0,
            recovery_strategy="retry_with_smaller_model"
        ),
        "llm_rate_limit": ErrorTypeConfig(
            enabled=True,
            max_retries=5,
            backoff_strategy=BackoffStrategy.EXPONENTIAL,
            backoff_base=3.0,
            max_wait_seconds=120.0,
            recovery_strategy="exponential_backoff_retry"
        ),
        "tool_execution_error": ErrorTypeConfig(
            enabled=True,
            max_retries=2,
            backoff_strategy=BackoffStrategy.LINEAR,
            backoff_base=1.0,
            max_wait_seconds=10.0,
            recovery_strategy="retry_with_alternative_tool"
        ),
        "validation_error": ErrorTypeConfig(
            enabled=True,
            max_retries=1,
            backoff_strategy=BackoffStrategy.FIXED,
            backoff_base=5.0,
            max_wait_seconds=5.0,
            recovery_strategy="replan_task"
        ),
        "permission_denied": ErrorTypeConfig(
            enabled=False,
            max_retries=0,
            backoff_strategy=BackoffStrategy.FIXED,
            backoff_base=0.0,
            max_wait_seconds=0.0,
            recovery_strategy="request_permission"
        ),
    })
    
    global_settings: Dict[str, any] = Field(default_factory=lambda: {
        "escalation_threshold": 3,  # 連續失敗 N 次後升級
        "escalation_target": "PM",  # 升級目標節點
        "log_errors": True,
        "notify_on_retry": False,
    })
```

### 2. API Endpoint
```python
# frontend_api/routes/error_handling.py

from fastapi import APIRouter, HTTPException
from engine.config.error_handling import ErrorHandlingConfig, ErrorTypeConfig
import yaml
import os

router = APIRouter(prefix="/api/config/error-handling", tags=["config"])

CONFIG_PATH = os.path.expanduser(
    "~/Projects/mindnav-codeagent/config/error_handling.yaml"
)

@router.get("")
async def get_error_config():
    """取得錯誤處理配置"""
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return ErrorHandlingConfig(**data).model_dump()
    else:
        return ErrorHandlingConfig().model_dump()

@router.put("")
async def update_error_config(config: ErrorHandlingConfig):
    """更新錯誤處理配置"""
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        yaml.dump(
            config.model_dump(),
            f,
            default_flow_style=False,
            allow_unicode=True
        )
    
    return {
        "message": "Configuration updated",
        "config": config.model_dump()
    }

@router.get("/error-types")
async def list_error_types():
    """列出所有錯誤類型"""
    return {
        "error_types": [
            {
                "id": "llm_timeout",
                "name": "LLM 逾時",
                "description": "LLM 呼叫超過時間限制"
            },
            {
                "id": "llm_rate_limit",
                "name": "LLM 速率限制",
                "description": "達到 API 速率限制"
            },
            {
                "id": "tool_execution_error",
                "name": "工具執行錯誤",
                "description": "工具執行失敗"
            },
            {
                "id": "validation_error",
                "name": "驗證錯誤",
                "description": "輸出驗證失敗"
            },
            {
                "id": "permission_denied",
                "name": "權限拒絕",
                "description": "缺少執行權限"
            },
        ]
    }

@router.put("/error-types/{error_type}")
async def update_error_type(error_type: str, config: ErrorTypeConfig):
    """更新特定錯誤類型的配置"""
    full_config = await get_error_config()
    full_config_obj = ErrorHandlingConfig(**full_config)
    
    if error_type not in full_config_obj.error_types:
        raise HTTPException(status_code=404, detail="Error type not found")
    
    full_config_obj.error_types[error_type] = config
    await update_error_config(full_config_obj)
    
    return {"message": f"Error type '{error_type}' updated"}

@router.get("/recovery-strategies")
async def list_recovery_strategies():
    """列出所有恢復策略"""
    return {
        "strategies": [
            {
                "id": "retry_with_smaller_model",
                "name": "使用較小模型重試",
                "description": "切換至較小的模型重新執行"
            },
            {
                "id": "exponential_backoff_retry",
                "name": "指數退避重試",
                "description": "以指數增加等待時間重試"
            },
            {
                "id": "retry_with_alternative_tool",
                "name": "使用替代工具重試",
                "description": "使用功能相似的替代工具"
            },
            {
                "id": "replan_task",
                "name": "重新規劃任務",
                "description": "回到 PM 重新拆解任務"
            },
            {
                "id": "request_permission",
                "name": "請求權限",
                "description": "通知用戶請求必要權限"
            },
        ]
    }
```

### 3. 前端元件
```tsx
// frontend-react/src/pages/ErrorHandlingConfig.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ErrorTypeConfig {
  enabled: boolean;
  max_retries: number;
  backoff_strategy: 'exponential' | 'linear' | 'fixed';
  backoff_base: number;
  max_wait_seconds: number;
  recovery_strategy: string;
}

export const ErrorHandlingConfig: React.FC = () => {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [errorConfigs, setErrorConfigs] = useState<Record<string, ErrorTypeConfig>>({});
  const [strategies, setStrategies] = useState<any[]>([]);
  
  useEffect(() => {
    axios.get('/api/config/error-handling')
      .then(res => {
        setGlobalEnabled(res.data.enabled);
        setErrorConfigs(res.data.error_types);
      });
    
    axios.get('/api/config/error-handling/recovery-strategies')
      .then(res => setStrategies(res.data.strategies));
  }, []);
  
  const handleToggleGlobal = () => {
    setGlobalEnabled(!globalEnabled);
  };
  
  const handleToggleErrorType = (errorType: string) => {
    setErrorConfigs({
      ...errorConfigs,
      [errorType]: {
        ...errorConfigs[errorType],
        enabled: !errorConfigs[errorType].enabled
      }
    });
  };
  
  const handleUpdateErrorType = (errorType: string, updates: Partial<ErrorTypeConfig>) => {
    setErrorConfigs({
      ...errorConfigs,
      [errorType]: {
        ...errorConfigs[errorType],
        ...updates
      }
    });
  };
  
  const handleSave = async () => {
    await axios.put('/api/config/error-handling', {
      enabled: globalEnabled,
      error_types: errorConfigs
    });
    alert('配置已儲存');
  };
  
  const errorTypeNames: Record<string, string> = {
    'llm_timeout': 'LLM 逾時',
    'llm_rate_limit': 'LLM 速率限制',
    'tool_execution_error': '工具執行錯誤',
    'validation_error': '驗證錯誤',
    'permission_denied': '權限拒絕'
  };
  
  return (
    <div className="error-handling-config">
      <h1>錯誤處理配置</h1>
      
      <div className="global-toggle">
        <label>
          <input
            type="checkbox"
            checked={globalEnabled}
            onChange={handleToggleGlobal}
          />
          啟用錯誤處理與重試功能
        </label>
      </div>
      
      <div className="error-types-config">
        <h2>錯誤類型配置</h2>
        
        {Object.entries(errorConfigs).map(([errorType, config]) => (
          <div key={errorType} className={`error-type-card ${!config.enabled ? 'disabled' : ''}`}>
            <div className="error-type-header">
              <label>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={() => handleToggleErrorType(errorType)}
                />
                <h3>{errorTypeNames[errorType] || errorType}</h3>
              </label>
            </div>
            
            {config.enabled && (
              <div className="error-type-body">
                <div className="config-row">
                  <label>最大重試次數</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={config.max_retries}
                    onChange={e => handleUpdateErrorType(errorType, {
                      max_retries: parseInt(e.target.value)
                    })}
                  />
                </div>
                
                <div className="config-row">
                  <label>退避策略</label>
                  <select
                    value={config.backoff_strategy}
                    onChange={e => handleUpdateErrorType(errorType, {
                      backoff_strategy: e.target.value as any
                    })}
                  >
                    <option value="exponential">指數退避</option>
                    <option value="linear">線性退避</option>
                    <option value="fixed">固定間隔</option>
                  </select>
                </div>
                
                <div className="config-row">
                  <label>退避基數（秒）</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={config.backoff_base}
                    onChange={e => handleUpdateErrorType(errorType, {
                      backoff_base: parseFloat(e.target.value)
                    })}
                  />
                </div>
                
                <div className="config-row">
                  <label>最大等待時間（秒）</label>
                  <input
                    type="number"
                    step={1}
                    min={1}
                    value={config.max_wait_seconds}
                    onChange={e => handleUpdateErrorType(errorType, {
                      max_wait_seconds: parseFloat(e.target.value)
                    })}
                  />
                </div>
                
                <div className="config-row">
                  <label>恢復策略</label>
                  <select
                    value={config.recovery_strategy}
                    onChange={e => handleUpdateErrorType(errorType, {
                      recovery_strategy: e.target.value
                    })}
                  >
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button className="primary" onClick={handleSave}>
          儲存配置
        </button>
      </div>
    </div>
  );
};
```

## 備註
- 重試次數過多可能增加延遲
- 指數退避可避免對 API 造成壓力
- 可考慮加入「重試統計」功能

## 風險
- 不當配置可能導致無限重試
- 某些錯誤（如 validation_error）重試無效
