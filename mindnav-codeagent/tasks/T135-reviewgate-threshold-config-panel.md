---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/642
title: ReviewGate 審查閾值前端配置面板
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: 實作前端面板讓用戶可調整 ReviewGate 各類型審查的閾值
---

# T135 - ReviewGate 審查閾值前端配置面板

## 目標
實作前端配置面板，讓用戶可調整 ReviewGate 多類型審查的各項閾值（如測試覆蓋率、安全漏洞嚴重度等）。

## 背景
ReviewGate 擴展（T127）支援多種審查類型：
- TechSpec 審查
- 代碼品質審查
- 安全審查
- 測試覆蓋審查
- 文件完整性審查

每種審查都有自己的閾值參數，需要前端介面來配置。

## 驗收標準
- [x] 在「設定」頁面新增「審查門檻」區塊
- [x] 顯示各審查類型的閾值配置卡片
- [x] 測試覆蓋審查：可調整覆蓋率閾值（0-100%）
- [x] 安全審查：可選擇忽略的漏洞嚴重級別（critical/high/medium/low）
- [x] 代碼品質審查：可調整函數長度上限、圈複雜度上限
- [x] 文件審查：可勾選必要文件清單
- [x] 提供每種審查的啟用/停用開關
- [x] 新增 API endpoint `/api/config/review-gates`
- [x] 儲存後更新 review_gates.yaml 配置檔案

## 實作細節

### 1. 配置模型
```python
# engine/config/review_gates.py

from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class TechSpecReviewConfig(BaseModel):
    """TechSpec 審查配置"""
    enabled: bool = Field(default=True)
    require_stack: bool = Field(default=True, description="需定義技術棧")
    require_rationale: bool = Field(default=True, description="需說明選型理由")
    require_summary: bool = Field(default=True, description="需有開發摘要")
    require_risk_mitigation: bool = Field(default=True, description="風險需有緩解措施")

class CodeQualityReviewConfig(BaseModel):
    """代碼品質審查配置"""
    enabled: bool = Field(default=True)
    max_function_lines: int = Field(default=50, ge=10, le=200)
    max_cyclomatic_complexity: int = Field(default=10, ge=1, le=50)
    check_type_hints: bool = Field(default=True)
    check_docstrings: bool = Field(default=True)
    check_error_handling: bool = Field(default=True)
    forbidden_patterns: List[str] = Field(default_factory=lambda: [
        "hardcoded.*password",
        "hardcoded.*api_key",
        "hardcoded.*secret"
    ])

class SecurityReviewConfig(BaseModel):
    """安全審查配置"""
    enabled: bool = Field(default=True)
    ignore_severity_below: Literal["critical", "high", "medium", "low", "none"] = Field(
        default="medium",
        description="忽略此級別以下的漏洞"
    )
    check_owasp_top10: bool = Field(default=True)
    check_sql_injection: bool = Field(default=True)
    check_xss: bool = Field(default=True)
    check_command_injection: bool = Field(default=True)
    
    @property
    def severity_threshold(self) -> int:
        """嚴重級別閾值（數字越大越嚴格）"""
        severity_map = {
            "critical": 4,
            "high": 3,
            "medium": 2,
            "low": 1,
            "none": 0
        }
        return severity_map[self.ignore_severity_below]

class TestCoverageReviewConfig(BaseModel):
    """測試覆蓋審查配置"""
    enabled: bool = Field(default=True)
    coverage_threshold: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="測試覆蓋率閾值（0.0-1.0）"
    )
    allow_no_tests_for_prototype: bool = Field(
        default=True,
        description="原型代碼可豁免測試"
    )
    check_edge_cases: bool = Field(default=True)

class DocumentationReviewConfig(BaseModel):
    """文件完整性審查配置"""
    enabled: bool = Field(default=True)
    required_docs: List[str] = Field(default_factory=lambda: [
        "README.md",
        "API.md"
    ])
    check_readme_sections: bool = Field(default=True)
    required_readme_sections: List[str] = Field(default_factory=lambda: [
        "安裝",
        "使用"
    ])

class ReviewGatesConfig(BaseModel):
    """審查門總配置"""
    tech_spec: TechSpecReviewConfig = Field(default_factory=TechSpecReviewConfig)
    code_quality: CodeQualityReviewConfig = Field(default_factory=CodeQualityReviewConfig)
    security: SecurityReviewConfig = Field(default_factory=SecurityReviewConfig)
    test_coverage: TestCoverageReviewConfig = Field(default_factory=TestCoverageReviewConfig)
    documentation: DocumentationReviewConfig = Field(default_factory=DocumentationReviewConfig)
    
    # 全域設定
    fail_fast: bool = Field(
        default=False,
        description="第一個審查失敗即停止，或全部執行後回報"
    )
```

### 2. API Endpoint
```python
# frontend_api/routes/review_gates.py

from fastapi import APIRouter, HTTPException
from engine.config.review_gates import ReviewGatesConfig
import yaml
import os

router = APIRouter(prefix="/api/config/review-gates", tags=["config"])

CONFIG_PATH = os.path.expanduser(
    "~/Projects/mindnav-codeagent/config/review_gates.yaml"
)

@router.get("")
async def get_review_gates_config():
    """取得審查門配置"""
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return ReviewGatesConfig(**data).model_dump()
    else:
        return ReviewGatesConfig().model_dump()

@router.put("")
async def update_review_gates_config(config: ReviewGatesConfig):
    """更新審查門配置"""
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        yaml.dump(
            config.model_dump(),
            f,
            default_flow_style=False,
            allow_unicode=True
        )
    
    return {
        "message": "Review gates configuration updated",
        "config": config.model_dump()
    }

@router.get("/types")
async def list_review_types():
    """列出所有審查類型"""
    return {
        "review_types": [
            {
                "id": "tech_spec",
                "name": "TechSpec 審查",
                "description": "驗證技術規格書的完整性"
            },
            {
                "id": "code_quality",
                "name": "代碼品質審查",
                "description": "檢查代碼複雜度、風格等"
            },
            {
                "id": "security",
                "name": "安全審查",
                "description": "掃描安全漏洞"
            },
            {
                "id": "test_coverage",
                "name": "測試覆蓋審查",
                "description": "檢查測試覆蓋率"
            },
            {
                "id": "documentation",
                "name": "文件完整性審查",
                "description": "檢查必要文件"
            }
        ]
    }

@router.post("/test")
async def test_review_gate(review_type: str, code: str):
    """測試審查門"""
    from engine.nodes.review_gate import REVIEWER_MAP
    
    reviewer = REVIEWER_MAP.get(review_type)
    if not reviewer:
        raise HTTPException(status_code=404, detail="Review type not found")
    
    # 建立測試狀態
    test_state = {
        "tech_spec": {"stack": [], "rationale": "", "summary": "", "risks": []},
        "current_code": code,
        "security_report": {"vulnerabilities": []},
        "test_results": {"passed": 0, "failed": 0, "coverage": 0.0},
        "docs": ""
    }
    
    result = await reviewer.review(test_state)
    
    return result.model_dump()
```

### 3. 前端元件
```tsx
// frontend-react/src/pages/ReviewGatesConfig.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ReviewGatesConfig {
  tech_spec: any;
  code_quality: any;
  security: any;
  test_coverage: any;
  documentation: any;
  fail_fast: boolean;
}

export const ReviewGatesConfig: React.FC = () => {
  const [config, setConfig] = useState<ReviewGatesConfig | null>(null);
  
  useEffect(() => {
    axios.get('/api/config/review-gates')
      .then(res => setConfig(res.data));
  }, []);
  
  const handleToggleReview = (reviewType: string) => {
    if (!config) return;
    setConfig({
      ...config,
      [reviewType]: {
        ...config[reviewType as keyof ReviewGatesConfig],
        enabled: !config[reviewType as keyof ReviewGatesConfig].enabled
      }
    });
  };
  
  const handleUpdateReview = (reviewType: string, updates: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [reviewType]: {
        ...config[reviewType as keyof ReviewGatesConfig],
        ...updates
      }
    });
  };
  
  const handleSave = async () => {
    await axios.put('/api/config/review-gates', config);
    alert('配置已儲存');
  };
  
  if (!config) return <div>Loading...</div>;
  
  return (
    <div className="review-gates-config">
      <h1>審查門檻配置</h1>
      
      <div className="global-setting">
        <label>
          <input
            type="checkbox"
            checked={config.fail_fast}
            onChange={e => setConfig({...config, fail_fast: e.target.checked})}
          />
          Fail Fast（第一個審查失敗即停止）
        </label>
      </div>
      
      {/* 測試覆蓋審查 */}
      <div className="review-card">
        <div className="review-header">
          <label>
            <input
              type="checkbox"
              checked={config.test_coverage.enabled}
              onChange={() => handleToggleReview('test_coverage')}
            />
            <h3>測試覆蓋審查</h3>
          </label>
        </div>
        
        {config.test_coverage.enabled && (
          <div className="review-body">
            <div className="config-row">
              <label>覆蓋率閾值</label>
              <div className="slider-group">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.test_coverage.coverage_threshold * 100}
                  onChange={e => handleUpdateReview('test_coverage', {
                    coverage_threshold: parseInt(e.target.value) / 100
                  })}
                />
                <span className="slider-value">
                  {(config.test_coverage.coverage_threshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.test_coverage.allow_no_tests_for_prototype}
                onChange={e => handleUpdateReview('test_coverage', {
                  allow_no_tests_for_prototype: e.target.checked
                })}
              />
              允許原型代碼豁免測試
            </label>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.test_coverage.check_edge_cases}
                onChange={e => handleUpdateReview('test_coverage', {
                  check_edge_cases: e.target.checked
                })}
              />
              檢查邊界案例
            </label>
          </div>
        )}
      </div>
      
      {/* 安全審查 */}
      <div className="review-card">
        <div className="review-header">
          <label>
            <input
              type="checkbox"
              checked={config.security.enabled}
              onChange={() => handleToggleReview('security')}
            />
            <h3>安全審查</h3>
          </label>
        </div>
        
        {config.security.enabled && (
          <div className="review-body">
            <div className="config-row">
              <label>忽略漏洞級別</label>
              <select
                value={config.security.ignore_severity_below}
                onChange={e => handleUpdateReview('security', {
                  ignore_severity_below: e.target.value
                })}
              >
                <option value="critical">僅 Critical</option>
                <option value="high">Critical + High</option>
                <option value="medium">Critical + High + Medium</option>
                <option value="low">Critical + High + Medium + Low</option>
                <option value="none">全部嚴格</option>
              </select>
            </div>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.security.check_owasp_top10}
                onChange={e => handleUpdateReview('security', {
                  check_owasp_top10: e.target.checked
                })}
              />
              檢查 OWASP Top 10
            </label>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.security.check_sql_injection}
                onChange={e => handleUpdateReview('security', {
                  check_sql_injection: e.target.checked
                })}
              />
              SQL Injection 檢查
            </label>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.security.check_xss}
                onChange={e => handleUpdateReview('security', {
                  check_xss: e.target.checked
                })}
              />
              XSS 檢查
            </label>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.security.check_command_injection}
                onChange={e => handleUpdateReview('security', {
                  check_command_injection: e.target.checked
                })}
              />
              Command Injection 檢查
            </label>
          </div>
        )}
      </div>
      
      {/* 代碼品質審查 */}
      <div className="review-card">
        <div className="review-header">
          <label>
            <input
              type="checkbox"
              checked={config.code_quality.enabled}
              onChange={() => handleToggleReview('code_quality')}
            />
            <h3>代碼品質審查</h3>
          </label>
        </div>
        
        {config.code_quality.enabled && (
          <div className="review-body">
            <div className="config-row">
              <label>函數最大行數</label>
              <input
                type="number"
                min={10}
                max={200}
                value={config.code_quality.max_function_lines}
                onChange={e => handleUpdateReview('code_quality', {
                  max_function_lines: parseInt(e.target.value)
                })}
              />
            </div>
            
            <div className="config-row">
              <label>最大圈複雜度</label>
              <input
                type="number"
                min={1}
                max={50}
                value={config.code_quality.max_cyclomatic_complexity}
                onChange={e => handleUpdateReview('code_quality', {
                  max_cyclomatic_complexity: parseInt(e.target.value)
                })}
              />
            </div>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.code_quality.check_type_hints}
                onChange={e => handleUpdateReview('code_quality', {
                  check_type_hints: e.target.checked
                })}
              />
              檢查型別註解
            </label>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.code_quality.check_docstrings}
                onChange={e => handleUpdateReview('code_quality', {
                  check_docstrings: e.target.checked
                })}
              />
              檢查 Docstrings
            </label>
            
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={config.code_quality.check_error_handling}
                onChange={e => handleUpdateReview('code_quality', {
                  check_error_handling: e.target.checked
                })}
              />
              檢查錯誤處理
            </label>
          </div>
        )}
      </div>
      
      {/* 文件審查 */}
      <div className="review-card">
        <div className="review-header">
          <label>
            <input
              type="checkbox"
              checked={config.documentation.enabled}
              onChange={() => handleToggleReview('documentation')}
            />
            <h3>文件完整性審查</h3>
          </label>
        </div>
        
        {config.documentation.enabled && (
          <div className="review-body">
            <div className="config-row">
              <label>必要文件</label>
              <div className="tags-input">
                {config.documentation.required_docs.map((doc: string, i: number) => (
                  <span key={i} className="tag">
                    {doc}
                    <button onClick={() => {
                      const docs = [...config.documentation.required_docs];
                      docs.splice(i, 1);
                      handleUpdateReview('documentation', { required_docs: docs });
                    }}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ 新增"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      handleUpdateReview('documentation', {
                        required_docs: [...config.documentation.required_docs, e.currentTarget.value]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
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
- 閾值過嚴可能拖慢開發流程
- 閾值過鬆可能導致品質下降
- 可考慮分環境配置（dev/staging/prod）

## 風險
- 某些審查（如安全掃描）可能誤報
- 覆蓋率閾值應根據專案性質調整
