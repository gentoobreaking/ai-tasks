---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/639
title: 語意分類模型前端配置面板
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作前端面板讓用戶可選擇語意分類使用的小型模型
---

# T132 - 語意分類模型前端配置面板

## 目標
實作前端配置面板，讓用戶可選擇語意分類（Semantic Routing）使用的小型模型，並提供效能與成本指標。

## 背景
語意分類是 T124 語意感知路由的一部分，需要一個小型模型來分類用戶意圖：
- new_task: 新任務請求
- continue: 繼續現有任務
- feedback: 對結果的反饋
- question: 提問
- abort: 中止任務

目前沒有前端介面來配置這個模型。

## 驗收標準
- [x] 在「設定」頁面新增「語意分類模型」區塊（獨立頁面 /semantic，已在 App.tsx 路由）
- [x] 提供模型下拉選單（列出可用的小型模型）
- [x] 顯示每個模型的效能指標（延遲、準確率）
- [x] 顯示成本估算（每次分類的 API 成本）
- [x] 提供「測試」按鈕，可輸入文字測試分類結果
- [x] 儲存後更新 agents.yaml 中的 semantic_classifier 配置
- [x] 新增 API endpoint `/api/config/semantic-classifier`
- [x] 新增 API endpoint `/api/config/semantic-classifier/test`

## 實作細節

### 1. 可用模型清單
```python
# frontend_api/routes/semantic_classifier.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/config/semantic-classifier", tags=["config"])

class ModelOption(BaseModel):
    id: str
    name: str
    provider: str
    latency_ms: float  # 平均延遲
    accuracy: float   # 準確率（基準測試）
    cost_per_1k: float  # 每 1k tokens 成本（美元）
    context_window: int

AVAILABLE_MODELS = [
    ModelOption(
        id="nvidia:deepseek-ai/deepseek-v4-flash",
        name="DeepSeek V4 Flash",
        provider="NVIDIA",
        latency_ms=150,
        accuracy=0.92,
        cost_per_1k=0.0001,
        context_window=32000
    ),
    ModelOption(
        id="nvidia:google/gemma-3n-e4b-it",
        name="Gemma 3N E4B",
        provider="NVIDIA",
        latency_ms=80,
        accuracy=0.88,
        cost_per_1k=0.00005,
        context_window=8192
    ),
    ModelOption(
        id="nvidia:google/gemma-2-2b-it",
        name="Gemma 2 2B",
        provider="NVIDIA",
        latency_ms=50,
        accuracy=0.85,
        cost_per_1k=0.00003,
        context_window=8192
    ),
    ModelOption(
        id="hf:microsoft/Phi-3-mini-4k-instruct",
        name="Phi-3 Mini",
        provider="HuggingFace",
        latency_ms=100,
        accuracy=0.90,
        cost_per_1k=0.00002,
        context_window=4096
    ),
    ModelOption(
        id="hf:Qwen/Qwen2.5-Coder-1.5B-Instruct",
        name="Qwen 2.5 Coder 1.5B",
        provider="HuggingFace",
        latency_ms=60,
        accuracy=0.82,
        cost_per_1k=0.00001,
        context_window=4096
    ),
]

@router.get("/models")
async def list_available_models():
    """列出可用的小型模型"""
    return {"models": [m.model_dump() for m in AVAILABLE_MODELS]}

@router.get("/current")
async def get_current_config():
    """取得當前配置"""
    from engine.config_loader import ConfigLoader
    config = ConfigLoader.load_config("agents.yaml")
    
    semantic_config = config.get("semantic_classifier", {})
    current_model = semantic_config.get("model", "nvidia:deepseek-ai/deepseek-v4-flash")
    
    # 找到對應的模型資訊
    model_info = next(
        (m for m in AVAILABLE_MODELS if m.id == current_model),
        AVAILABLE_MODELS[0]
    )
    
    return {
        "current_model": model_info.model_dump(),
        "fallback_enabled": semantic_config.get("fallback_enabled", True),
        "cache_enabled": semantic_config.get("cache_enabled", True)
    }

class ClassifierConfig(BaseModel):
    model_id: str
    fallback_enabled: bool = True
    cache_enabled: bool = True
    cache_ttl_seconds: int = 3600

@router.put("")
async def update_classifier_config(config: ClassifierConfig):
    """更新語意分類器配置"""
    from engine.config_loader import ConfigLoader
    import yaml
    
    # 載入現有配置
    full_config = ConfigLoader.load_config("agents.yaml")
    
    # 更新 semantic_classifier 區塊
    full_config["semantic_classifier"] = {
        "model": config.model_id,
        "fallback_enabled": config.fallback_enabled,
        "cache_enabled": config.cache_enabled,
        "cache_ttl_seconds": config.cache_ttl_seconds
    }
    
    # 寫回檔案
    config_path = ConfigLoader.get_config_path("agents.yaml")
    with open(config_path, "w", encoding="utf-8") as f:
        yaml.dump(full_config, f, default_flow_style=False, allow_unicode=True)
    
    return {"message": "Configuration updated", "config": full_config["semantic_classifier"]}

class TestRequest(BaseModel):
    text: str
    model_id: Optional[str] = None

class TestResult(BaseModel):
    intent: str
    confidence: float
    latency_ms: float
    model_used: str

@router.post("/test", response_model=TestResult)
async def test_classifier(request: TestRequest):
    """測試語意分類"""
    import time
    from engine.llm_factory import LLMFactory
    
    model_id = request.model_id or "nvidia:deepseek-ai/deepseek-v4-flash"
    
    start = time.time()
    
    llm = LLMFactory.get_llm(model_id=model_id, temperature=0)
    
    prompt = f"""分析以下訊息的意圖：

訊息：{request.text}

意圖類型：
- new_task: 新任務請求
- continue: 繼續現有任務
- feedback: 對結果的反饋
- question: 提問
- abort: 中止任務

輸出 JSON: {{"intent": "...", "confidence": 0.0-1.0}}
"""
    
    result = await llm.ainvoke(prompt)
    
    latency_ms = (time.time() - start) * 1000
    
    # 解析結果
    import json
    try:
        parsed = json.loads(result.content)
        intent = parsed.get("intent", "unknown")
        confidence = parsed.get("confidence", 0.5)
    except:
        intent = "unknown"
        confidence = 0.0
    
    return TestResult(
        intent=intent,
        confidence=confidence,
        latency_ms=latency_ms,
        model_used=model_id
    )
```

### 2. 前端元件
```tsx
// frontend-react/src/pages/SemanticClassifierConfig.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface Model {
  id: string;
  name: string;
  provider: string;
  latency_ms: number;
  accuracy: number;
  cost_per_1k: number;
  context_window: number;
}

export const SemanticClassifierConfig: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [config, setConfig] = useState({
    fallback_enabled: true,
    cache_enabled: true,
    cache_ttl_seconds: 3600
  });
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  useEffect(() => {
    axios.get('/api/config/semantic-classifier/models')
      .then(res => setModels(res.data.models));
    
    axios.get('/api/config/semantic-classifier/current')
      .then(res => {
        setCurrentModel(res.data.current_model);
        setConfig({
          fallback_enabled: res.data.fallback_enabled,
          cache_enabled: res.data.cache_enabled,
          cache_ttl_seconds: res.data.cache_ttl_seconds || 3600
        });
      });
  }, []);
  
  const handleSave = async () => {
    if (!currentModel) return;
    
    await axios.put('/api/config/semantic-classifier', {
      model_id: currentModel.id,
      ...config
    });
    
    alert('配置已儲存');
  };
  
  const handleTest = async () => {
    if (!testText.trim()) return;
    
    setIsTesting(true);
    try {
      const res = await axios.post('/api/config/semantic-classifier/test', {
        text: testText,
        model_id: currentModel?.id
      });
      setTestResult(res.data);
    } catch (err) {
      alert('測試失敗');
    }
    setIsTesting(false);
  };
  
  // 準備圖表資料
  const chartData = models.map(m => ({
    name: m.name,
    latency: m.latency_ms,
    accuracy: m.accuracy * 100,
    cost: m.cost_per_1k * 10000  // 放大以便視覺化
  }));
  
  return (
    <div className="semantic-classifier-config">
      <h1>語意分類模型配置</h1>
      
      <div className="config-section">
        <h2>選擇模型</h2>
        <div className="model-grid">
          {models.map(model => (
            <div
              key={model.id}
              className={`model-card ${currentModel?.id === model.id ? 'selected' : ''}`}
              onClick={() => setCurrentModel(model)}
            >
              <div className="model-header">
                <h3>{model.name}</h3>
                <span className="model-provider">{model.provider}</span>
              </div>
              <div className="model-stats">
                <div className="stat">
                  <label>延遲</label>
                  <span>{model.latency_ms} ms</span>
                </div>
                <div className="stat">
                  <label>準確率</label>
                  <span>{(model.accuracy * 100).toFixed(0)}%</span>
                </div>
                <div className="stat">
                  <label>成本</label>
                  <span>${model.cost_per_1k.toFixed(5)}/1k</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="config-section">
        <h2>效能比較</h2>
        <LineChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="latency" stroke="#8884d8" name="延遲 (ms)" />
          <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="準確率 (%)" />
        </LineChart>
      </div>
      
      <div className="config-section">
        <h2>進階設定</h2>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={config.fallback_enabled}
              onChange={e => setConfig({...config, fallback_enabled: e.target.checked})}
            />
            啟用 Fallback（分類失敗時使用預設路由）
          </label>
        </div>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={config.cache_enabled}
              onChange={e => setConfig({...config, cache_enabled: e.target.checked})}
            />
            啟用快取（相同輸入直接返回結果）
          </label>
        </div>
        <div className="input-group">
          <label>快取 TTL（秒）</label>
          <input
            type="number"
            value={config.cache_ttl_seconds}
            onChange={e => setConfig({...config, cache_ttl_seconds: parseInt(e.target.value)})}
          />
        </div>
      </div>
      
      <div className="config-section">
        <h2>測試分類</h2>
        <textarea
          value={testText}
          onChange={e => setTestText(e.target.value)}
          placeholder="輸入測試文字..."
          rows={4}
        />
        <button onClick={handleTest} disabled={isTesting}>
          {isTesting ? '測試中...' : '測試'}
        </button>
        
        {testResult && (
          <div className="test-result">
            <h3>測試結果</h3>
            <div className="result-item">
              <label>意圖</label>
              <span className={`intent-badge ${testResult.intent}`}>
                {testResult.intent}
              </span>
            </div>
            <div className="result-item">
              <label>信心度</label>
              <span>{(testResult.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="result-item">
              <label>延遲</label>
              <span>{testResult.latency_ms.toFixed(0)} ms</span>
            </div>
            <div className="result-item">
              <label>使用模型</label>
              <span>{testResult.model_used}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="config-actions">
        <button className="primary" onClick={handleSave}>
          儲存配置
        </button>
      </div>
    </div>
  );
};
```

## 備註
- 模型清單應從配置檔案載入，而非硬編碼
- 測試功能可幫助用戶選擇適合的模型
- 成本估算應考慮實際使用量

## 風險
- 部分模型可能需要 API Key，需提示用戶配置
- 快取機制可能導致分類結果過時

---

## 實作記錄（2026-05-23）

### 已實作內容
| 項目 | 說明 |
|------|------|
| Backend API | `frontend_api/routers/semantic_classifier.py`（已存在，GET /models, GET /current, PUT, POST /test） |
| Frontend 元件 | `frontend-react/src/components/SemanticClassifierPanel.tsx` |
| 路由 | App.tsx 已有 `/semantic` 路由 |

### SemanticClassifierPanel.tsx 實作差異（相較於 task SKILL.md）
- 圖表改用 `chart.js` + `react-chartjs-2`（現有專案有此 dependency，不另裝 recharts）
- 圖表為 Grouped Bar Chart，雙 Y 軸：左軸 Latency(ms)，右軸 Accuracy(%)；每個模型一組柱子
- 模型選擇：dropdown 而非 radio button，更簡潔
- 模型 stats：grid card 佈局（Latency / Accuracy / Cost / Context）
- Cache Settings / Test 功能與原 spec 一致
