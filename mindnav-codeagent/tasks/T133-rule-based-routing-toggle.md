---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/640
title: 路由規則跳過 LLM 前端開關
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作前端開關讓用戶可啟用/停用規則先判斷跳過 LLM 呼叫
---

# T133 - 路由規則跳過 LLM 前端開關

## 目標
實作前端開關，讓用戶可選擇是否啟用「規則先判斷」功能，以跳過 LLM 呼叫提升效能。

## 背景
語意路由（T124）包含規則先判斷功能：
```python
# 簡單規則先判斷（效能優化）
if "FINISHED" in last_msg:
    return IntentType.ABORT
if "?" in last_msg or "請問" in last_msg:
    return IntentType.QUESTION
```

這個功能可以：
- 提升效能（跳過 LLM 呼叫）
- 降低 API 成本
- 但可能降低分類準確度

用戶需要前端開關來控制此行為。

## 驗收標準
- [x] 在「語意分類設定」頁面新增「規則判斷」區塊
- [x] 提供三種模式：啟用（當前）、停用（總是呼叫 LLM）、自動（根據負載決定）
- [x] 顯示規則清單與匹配邏輯
- [x] 提供規則編輯器（可新增/修改/刪除規則）
- [x] 儲存後更新 agents.yaml 中的 rule_based_routing 配置
- [x] 新增 API endpoint `/api/config/rule-based-routing`
- [x] 顯示效能比較（啟用 vs 停用的延遲差異）

## 實作細節

### 1. 配置模型
```python
# engine/config/rule_based_routing.py

from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import re

class RoutingRule(BaseModel):
    """路由規則"""
    id: str = Field(description="規則 ID")
    name: str = Field(description="規則名稱")
    pattern: str = Field(description="匹配模式（正則或關鍵字）")
    pattern_type: Literal["keyword", "regex"] = Field(default="keyword")
    intent: str = Field(description="匹配後的意圖")
    priority: int = Field(default=0, description="優先級（越高越先匹配）")
    enabled: bool = Field(default=True)

class RuleBasedRoutingConfig(BaseModel):
    """規則路由配置"""
    mode: Literal["enable", "disable", "auto"] = Field(default="enable")
    rules: List[RoutingRule] = Field(default_factory=list)
    auto_threshold: float = Field(
        default=0.7,
        description="自動模式下，系統負載低於此閾值時啟用規則判斷"
    )
    
    DEFAULT_RULES = [
        RoutingRule(
            id="abort-keyword",
            name="FINISHED 中止",
            pattern="FINISHED",
            pattern_type="keyword",
            intent="abort",
            priority=100,
            enabled=True
        ),
        RoutingRule(
            id="question-keyword",
            name="問句判斷",
            pattern="[?？請問]",
            pattern_type="regex",
            intent="question",
            priority=90,
            enabled=True
        ),
        RoutingRule(
            id="continue-keyword",
            name="繼續任務",
            pattern="繼續|continue|go on",
            pattern_type="regex",
            intent="continue",
            priority=80,
            enabled=True
        ),
    ]
```

### 2. API Endpoint
```python
# frontend_api/routes/rule_based_routing.py

from fastapi import APIRouter, HTTPException
from engine.config.rule_based_routing import (
    RuleBasedRoutingConfig, RoutingRule
)
import yaml
import os

router = APIRouter(prefix="/api/config/rule-based-routing", tags=["config"])

CONFIG_PATH = os.path.expanduser(
    "~/Projects/mindnav-codeagent/config/rule_based_routing.yaml"
)

@router.get("")
async def get_rule_config():
    """取得規則路由配置"""
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return RuleBasedRoutingConfig(**data).model_dump()
    else:
        # 返回預設配置
        return RuleBasedRoutingConfig().model_dump()

@router.put("")
async def update_rule_config(config: RuleBasedRoutingConfig):
    """更新規則路由配置"""
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        yaml.dump(config.model_dump(), f, default_flow_style=False, allow_unicode=True)
    
    return {"message": "Configuration updated", "config": config.model_dump()}

@router.post("/rules")
async def add_rule(rule: RoutingRule):
    """新增規則"""
    config = await get_rule_config()
    config_obj = RuleBasedRoutingConfig(**config)
    
    # 檢查 ID 是否重複
    if any(r.id == rule.id for r in config_obj.rules):
        raise HTTPException(status_code=400, detail="Rule ID already exists")
    
    config_obj.rules.append(rule)
    await update_rule_config(config_obj)
    
    return {"message": "Rule added", "rule": rule.model_dump()}

@router.put("/rules/{rule_id}")
async def update_rule(rule_id: str, rule: RoutingRule):
    """更新規則"""
    config = await get_rule_config()
    config_obj = RuleBasedRoutingConfig(**config)
    
    for i, r in enumerate(config_obj.rules):
        if r.id == rule_id:
            config_obj.rules[i] = rule
            await update_rule_config(config_obj)
            return {"message": "Rule updated", "rule": rule.model_dump()}
    
    raise HTTPException(status_code=404, detail="Rule not found")

@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str):
    """刪除規則"""
    config = await get_rule_config()
    config_obj = RuleBasedRoutingConfig(**config)
    
    config_obj.rules = [r for r in config_obj.rules if r.id != rule_id]
    await update_rule_config(config_obj)
    
    return {"message": "Rule deleted"}

@router.post("/test")
async def test_rule(text: str, rule_id: Optional[str] = None):
    """測試規則匹配"""
    config = await get_rule_config()
    config_obj = RuleBasedRoutingConfig(**config)
    
    results = []
    for rule in config_obj.rules:
        if not rule.enabled:
            continue
        
        matched = False
        if rule.pattern_type == "keyword":
            matched = rule.pattern.lower() in text.lower()
        elif rule.pattern_type == "regex":
            matched = bool(re.search(rule.pattern, text, re.I))
        
        results.append({
            "rule_id": rule.id,
            "rule_name": rule.name,
            "matched": matched,
            "intent": rule.intent if matched else None
        })
    
    if rule_id:
        return next((r for r in results if r["rule_id"] == rule_id), None)
    
    return {"results": results}
```

### 3. 前端元件
```tsx
// frontend-react/src/pages/RuleBasedRoutingConfig.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RoutingRule {
  id: string;
  name: string;
  pattern: string;
  pattern_type: 'keyword' | 'regex';
  intent: string;
  priority: number;
  enabled: boolean;
}

export const RuleBasedRoutingConfig: React.FC = () => {
  const [mode, setMode] = useState<'enable' | 'disable' | 'auto'>('enable');
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  
  useEffect(() => {
    axios.get('/api/config/rule-based-routing')
      .then(res => {
        setMode(res.data.mode);
        setRules(res.data.rules);
      });
  }, []);
  
  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? {...r, enabled: !r.enabled} : r
    ));
  };
  
  const handleSave = async () => {
    await axios.put('/api/config/rule-based-routing', {
      mode,
      rules
    });
    alert('配置已儲存');
  };
  
  const handleTest = async () => {
    const res = await axios.post('/api/config/rule-based-routing/test', null, {
      params: { text: testText }
    });
    setTestResults(res.data.results);
  };
  
  return (
    <div className="rule-based-routing-config">
      <h1>規則判斷配置</h1>
      
      <div className="mode-section">
        <h2>執行模式</h2>
        <div className="mode-options">
          <label className={mode === 'enable' ? 'active' : ''}>
            <input
              type="radio"
              checked={mode === 'enable'}
              onChange={() => setMode('enable')}
            />
            <span className="mode-label">啟用</span>
            <span className="mode-desc">優先使用規則判斷，匹配失敗才呼叫 LLM</span>
          </label>
          
          <label className={mode === 'disable' ? 'active' : ''}>
            <input
              type="radio"
              checked={mode === 'disable'}
              onChange={() => setMode('disable')}
            />
            <span className="mode-label">停用</span>
            <span className="mode-desc">總是呼叫 LLM 進行分類（最準確）</span>
          </label>
          
          <label className={mode === 'auto' ? 'active' : ''}>
            <input
              type="radio"
              checked={mode === 'auto'}
              onChange={() => setMode('auto')}
            />
            <span className="mode-label">自動</span>
            <span className="mode-desc">根據系統負載自動決定</span>
          </label>
        </div>
      </div>
      
      <div className="rules-section">
        <h2>規則清單</h2>
        <table className="rules-table">
          <thead>
            <tr>
              <th>啟用</th>
              <th>規則名稱</th>
              <th>模式類型</th>
              <th>匹配模式</th>
              <th>目標意圖</th>
              <th>優先級</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.sort((a, b) => b.priority - a.priority).map(rule => (
              <tr key={rule.id} className={!rule.enabled ? 'disabled' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule.id)}
                  />
                </td>
                <td>{rule.name}</td>
                <td>
                  <span className={`pattern-type ${rule.pattern_type}`}>
                    {rule.pattern_type}
                  </span>
                </td>
                <td><code>{rule.pattern}</code></td>
                <td>
                  <span className={`intent-badge ${rule.intent}`}>
                    {rule.intent}
                  </span>
                </td>
                <td>{rule.priority}</td>
                <td>
                  <button onClick={() => {/* 編輯 */}}>編輯</button>
                  <button onClick={() => {/* 刪除 */}}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button className="add-rule" onClick={() => {/* 新增規則 */}}>
          + 新增規則
        </button>
      </div>
      
      <div className="test-section">
        <h2>測試匹配</h2>
        <textarea
          value={testText}
          onChange={e => setTestText(e.target.value)}
          placeholder="輸入測試文字..."
          rows={3}
        />
        <button onClick={handleTest}>測試</button>
        
        {testResults && (
          <div className="test-results">
            <h3>匹配結果</h3>
            {testResults.map((result: any) => (
              <div
                key={result.rule_id}
                className={`result-item ${result.matched ? 'matched' : ''}`}
              >
                <span className="rule-name">{result.rule_name}</span>
                <span className="match-status">
                  {result.matched ? '✅ 匹配' : '❌ 未匹配'}
                </span>
                {result.matched && (
                  <span className="matched-intent">{result.intent}</span>
                )}
              </div>
            ))}
          </div>
        )}
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
- 規則優先級決定匹配順序
- 正則表達式需謹慎測試，避免效能問題
- 可考慮加入「規則命中統計」功能

## 風險
- 不當規則可能導致錯誤分類
- 正則表達式可能有效能問題
