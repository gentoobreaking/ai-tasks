---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/790
title: Product Landing Page 功能更新（T123-T137 彙整）
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-23
howto: Review T123-T137 實作內容，彙整後更新 product-landing-page
dependencies:
  - T123-prompt-layering-fulfillment.md
  - T124-semantic-routing-system.md
  - T125-error-handling-retry-mechanism.md
  - T126-agent-node-customization.md
  - T127-reviewgate-extension.md
  - T128-tool-recommendation-system.md
  - T129-dynamic-parallelism-management.md
  - T130-workflow-tracing-visualization.md
  - T131-agent-role-file-editor.md
  - T132-semantic-classifier-config-panel.md
  - T133-rule-based-routing-toggle.md
  - T134-error-handling-config-panel.md
  - T135-reviewgate-threshold-config-panel.md
  - T136-tool-recommendation-display-panel.md
  - T137-task-weights-config-panel.md
---

# T138 - Product Landing Page 功能更新

## 目標
Review T123-T137 共 15 個任務的實作內容，彙整後更新 `~/Projects/mindnav-codeagent/pages/src/pages/Features.jsx`，將新功能完整呈現於產品頁面。

## 背景
目前已完成 125 個任務（T001-T122 + T123-T130），並建立 7 個前端配置面板任務（T131-T137）。這些新功能需要在產品頁面中呈現：

### 後端優化任務（T123-T130）
| 任務 | 功能 |
|------|------|
| T123 | Prompt Layering 三層系統填充 |
| T124 | 語意感知路由（Semantic + Context + State） |
| T125 | 統一錯誤處理與重試機制 |
| T126 | Agent 節點客製化（PO/PM/QA/Security/Doc/DevOps） |
| T127 | ReviewGate 多類型審查擴展 |
| T128 | 工具推薦系統 |
| T129 | 動態並行度管理 |
| T130 | Workflow 執行追蹤與視覺化 |

### 前端配置面板任務（T131-T137）
| 任務 | 功能 |
|------|------|
| T131 | Agent 角色檔案內容前端編輯器 |
| T132 | 語意分類模型前端配置面板 |
| T133 | 路由規則跳過 LLM 前端開關 |
| T134 | 錯誤重試策略前端配置面板 |
| T135 | ReviewGate 審查閾值前端配置面板 |
| T136 | 工具推薦系統前端顯示面板 |
| T137 | 任務權重表前端配置面板 |

## 驗收標準
- [x] Review T123-T137 任務檔案，理解每個功能的實作細節
- [x] 彙整所有新功能，依類別分組
- [x] 更新 Features.jsx，新增「進階優化」與「前端配置」區塊
- [x] 維持多語系支援（zh/en/ja/ko/fr/de/es/ru/pl/uk/cs/ro/bg）
- [x] 更新 Product.jsx 的特色卡片（已新增 7 項 v2.0 功能）
- [x] 新增功能的技術說明與效益描述
- [x] 驗證前端頁面渲染正確
- [x] **新增：配置檔載入狀態檢視器（燈號呈現）**

## 實作細節

### 1. Features.jsx 新增區塊

```jsx
// 在現有 groups 陣列後新增兩個區塊

{
  title: '進階優化（v2.0）',
  items: [
    {
      title: '三層 Prompt 系統',
      desc: 'Stable Layer（角色性格）+ Skill Layer（工具規範）+ Memory Layer（用戶偏好），每個 Agent 獨立配置 TOOLS.md、USER.md、BOOTSTRAP.md。'
    },
    {
      title: '語意感知路由',
      desc: '三層路由優先級：語意分類（new_task/continue/feedback/question/abort）→ 上下文感知（已測試過不需再測）→ 狀態感知（迭代上限/AC 驗證/錯誤升級）。'
    },
    {
      title: '統一錯誤處理',
      desc: 'ErrorState 追蹤 + ErrorHandler 分類（LLM timeout/rate limit/tool error/validation/permission）+ 指數退避重試 + 錯誤升級至 PM。'
    },
    {
      title: 'Agent 節點客製化',
      desc: 'PO（UserStory 結構化輸出）、PM（任務拆解 + FINISHED 標記）、QA（測試計畫生成）、Security（OWASP 掃描）、Doc（文件範本）、DevOps（部署流程）。'
    },
    {
      title: '多類型審查門',
      desc: 'TechSpec、代碼品質、安全掃描、測試覆蓋、文件完整性五種審查類型，支援可配置閾值（覆蓋率 %、漏洞嚴重級別、函數長度上限）。'
    },
    {
      title: '智慧工具推薦',
      desc: '根據角色（Coder 預設 file/search/shell）、任務類型（web_search 加 rag_sync）、當前狀態動態推薦工具，提供優先級排序與推薦原因說明。'
    },
    {
      title: '動態並行度',
      desc: '任務權重表（web_search: IO 0.8, code_generation: LLM 1.0）+ 系統負載監控 + 動態並行度計算，避免資源競爭與過載。'
    },
    {
      title: 'Workflow 追蹤',
      desc: 'WorkflowTracer 記錄每次路由決策（時間戳、來源、目標、原因、狀態快照），支援 Mermaid 流程圖匯出與即時狀態監控面板。'
    },
  ]
},
{
  title: '前端配置面板（v2.0）',
  items: [
    {
      title: '角色檔案編輯器',
      desc: 'Monaco Editor 編輯 config/{role}/ 目錄下的 SOUL.md、TOOLS.md、USER.md、BOOTSTRAP.md，支援 Markdown 語法高亮 + 儲存/重置/預覽功能。'
    },
    {
      title: '語意分類配置',
      desc: '選擇語意分類使用的小型模型（DeepSeek V4 Flash、Gemma 3N、Phi-3 Mini），顯示延遲、準確率、成本估算，提供測試按鈕驗證分類結果。'
    },
    {
      title: '規則路由開關',
      desc: '三種模式：啟用（規則先判斷跳過 LLM）、停用（總是呼叫 LLM）、自動（根據負載決定），可編輯匹配規則（keyword/regex）。'
    },
    {
      title: '錯誤重試配置',
      desc: '各錯誤類型的重試次數、退避策略（指數/線性/固定）、退避基數、最大等待時間，支援啟用/停用開關。'
    },
    {
      title: '審查閾值配置',
      desc: '測試覆蓋率滑桿（0-100%）、安全漏洞嚴重級別選擇（critical/high/medium/low）、代碼品質參數、必要文件勾選。'
    },
    {
      title: '工具推薦面板',
      desc: '顯示當前任務的推薦工具清單，分組顯示（預設/任務相關/情境），顯示推薦原因與優先級排序，支援拖拽調整。'
    },
    {
      title: '並行權重配置',
      desc: '任務類型權重滑桿（CPU/Memory/IO/LLM）、雷達圖視覺化、並行度預覽、匯入/匯出 YAML 配置。'
    },
  ]
}
```

### 2. 配置檔載入狀態檢視器（新增）

每個角色可查看其配置檔案的載入狀態，用燈號方式呈現：

```jsx
// frontend-react/src/components/ConfigStatusPanel.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ConfigFile {
  name: string;
  loaded: boolean;
  size: number;
  path: string;
}

interface RoleStatus {
  role: string;
  global_policy_loaded: boolean;
  files: ConfigFile[];
  total_files: number;
  loaded_files: number;
}

export const ConfigStatusPanel: React.FC = () => {
  const [roles, setRoles] = useState<RoleStatus[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  useEffect(() => {
    axios.get('/api/config/status').then(res => setRoles(res.data.roles));
  }, []);
  
  const getStatusIcon = (loaded: boolean) => loaded ? '🟢' : '🔴';
  
  const getOverallStatus = (role: RoleStatus) => {
    if (role.loaded_files === role.total_files && role.global_policy_loaded) return '🟢';
    if (role.loaded_files === 0) return '🔴';
    return '🟡';
  };
  
  return (
    <div className="config-status-panel">
      <h2>配置檔載入狀態</h2>
      
      {/* 角色總覽表格 */}
      <table className="status-table">
        <thead>
          <tr>
            <th>角色</th>
            <th>Global Policy</th>
            <th>SOUL.md</th>
            <th>TOOLS.md</th>
            <th>USER.md</th>
            <th>BOOTSTRAP.md</th>
            <th>AGENTS.md</th>
            <th>IDENTITY.md</th>
            <th>MEMORY.md</th>
            <th>HEARTBEAT.md</th>
            <th>總計</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.role} onClick={() => setSelectedRole(role.role)}>
              <td>{getOverallStatus(role)} {role.role.toUpperCase()}</td>
              <td>{getStatusIcon(role.global_policy_loaded)}</td>
              {role.files.map(file => (
                <td key={file.name}>
                  {getStatusIcon(file.loaded)}
                  {file.loaded && <span className="size">({file.size}B)</span>}
                </td>
              ))}
              <td>
                {role.loaded_files}/{role.total_files}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* 詳細檢視 */}
      {selectedRole && (
        <div className="detail-view">
          <h3>{selectedRole.toUpperCase()} 詳細狀態</h3>
          <pre>
            {JSON.stringify(roles.find(r => r.role === selectedRole), null, 2)}
          </pre>
        </div>
      )}
      
      {/* 圖例 */}
      <div className="legend">
        <span>🟢 已載入</span>
        <span>🔴 未載入</span>
        <span>🟡 部分載入</span>
      </div>
    </div>
  );
};
```

### 3. API Endpoint

```python
# frontend_api/routes/config_status.py

from fastapi import APIRouter
import os
from pathlib import Path

router = APIRouter(prefix="/api/config", tags=["config"])

CONFIG_DIR = Path.home() / "Projects/mindnav-codeagent/config"

FILES_TO_CHECK = [
    "SOUL.md", "TOOLS.md", "USER.md", "BOOTSTRAP.md",
    "AGENTS.md", "IDENTITY.md", "MEMORY.md", "HEARTBEAT.md"
]

ROLES = ["po", "pm", "architect", "coder", "qa", "security", "doc", "researcher", "devops", "planner"]

@router.get("/status")
async def get_config_status():
    """檢查所有角色的配置檔案載入狀態"""
    roles_status = []
    
    # 檢查 global-policy.md
    global_policy_path = CONFIG_DIR / "global" / "global-policy.md"
    global_policy_loaded = global_policy_path.exists() and global_policy_path.stat().st_size > 0
    
    for role in ROLES:
        role_dir = CONFIG_DIR / role
        files_status = []
        
        for filename in FILES_TO_CHECK:
            file_path = role_dir / filename
            loaded = False
            size = 0
            
            if file_path.exists():
                size = file_path.stat().st_size
                loaded = size > 0
            
            files_status.append({
                "name": filename,
                "loaded": loaded,
                "size": size,
                "path": str(file_path)
            })
        
        loaded_count = sum(1 for f in files_status if f["loaded"])
        
        roles_status.append({
            "role": role,
            "global_policy_loaded": global_policy_loaded,
            "files": files_status,
            "total_files": len(FILES_TO_CHECK),
            "loaded_files": loaded_count
        })
    
    return {
        "roles": roles_status,
        "global_policy_path": str(global_policy_path),
        "global_policy_loaded": global_policy_loaded
    }

@router.get("/status/{role}")
async def get_role_config_status(role: str):
    """檢查單一角色的配置檔案載入狀態"""
    if role not in ROLES:
        return {"error": f"Unknown role: {role}"}
    
    # 回傳該角色的詳細狀態
    # ...
```

### 4. 呈現效果

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 配置檔載入狀態                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ 角色     │ GP │ SOUL │ TOOLS │ USER │ BOOT │ AGT │ ID │ MEM │ HB │ 總計 │
├──────────┼────┼──────┼───────┼──────┼──────┼─────┼────┼─────┼────┼──────┤
│ 🟢 PO    │ 🟢 │ 🟢   │ 🟢    │ 🟢   │ 🟢   │ 🟢  │ 🟢 │ 🟢  │ 🟢 │ 8/8  │
│ 🟢 PM    │ 🟢 │ 🟢   │ 🟢    │ 🟢   │ 🟢   │ 🟢  │ 🟢 │ 🟢  │ 🟢 │ 8/8  │
│ 🟢 ARCH  │ 🟢 │ 🟢   │ 🟢    │ 🟢   │ 🟢   │ 🟢  │ 🟢 │ 🟢  │ 🟢 │ 8/8  │
│ 🟡 PLAN  │ 🟢 │ 🟢   │ 🔴    │ 🟢   │ 🔴   │ 🟢  │ 🟢 │ 🟢  │ 🟢 │ 6/8  │
│ 🔴 CUST  │ 🔴 │ 🔴   │ 🔴    │ 🔴   │ 🔴   │ 🔴  │ 🔴 │ 🔴  │ 🔴 │ 0/8  │
└─────────────────────────────────────────────────────────────────────────┘

圖例：🟢 已載入  🔴 未載入  🟡 部分載入
GP = global-policy.md（全局策略）
```

### 5. 路由配置

```tsx
// frontend-react/src/App.tsx

<Route path="/config/status" element={<ConfigStatusPanel />} />
```

```jsx
// 在 features.items 新增或更新

{
  title: '進階路由系統',
  desc: '語意分類 + 上下文感知 + 狀態追蹤三層路由，1-route bypass 將每輪 LLM 呼叫從 9 次降至約 4 次，規則先判斷可跳過 LLM 呼叫'
},
{
  title: '可配置審查門',
  desc: 'TechSpec、代碼品質、安全、測試、文件五種審查類型，支援閾值配置（覆蓋率、漏洞級別、複雜度上限）'
},
{
  title: '前端配置中心',
  desc: '角色檔案編輯器、語意分類配置、錯誤重試策略、審查閾值、並行權重等 7 個配置面板，全部可透過 Web UI 調整'
},
```

### 3. 多語系更新範例

```jsx
// Features.jsx 的 zh 區塊

zh: {
  heading: '所有實作功能',
  desc: '從核心框架到進階擴展，共 140 項任務（T001-T137）',
  groups: [
    // ... 現有區塊 ...
    {
      title: '進階優化（v2.0）',
      items: [
        { title: '三層 Prompt 系統', desc: 'Stable Layer（角色性格）+ Skill Layer（工具規範）+ Memory Layer（用戶偏好）' },
        { title: '語意感知路由', desc: '語意分類 → 上下文感知 → 狀態追蹤三層路由優先級' },
        // ... 其他項目 ...
      ]
    },
    {
      title: '前端配置面板（v2.0）',
      items: [
        { title: '角色檔案編輯器', desc: 'Monaco Editor 編輯 SOUL.md、TOOLS.md、USER.md、BOOTSTRAP.md' },
        { title: '語意分類配置', desc: '選擇小型模型，顯示延遲、準確率、成本估算' },
        // ... 其他項目 ...
      ]
    }
  ]
}
```

### 4. 檔案修改清單

| 檔案 | 修改內容 |
|------|---------|
| `~/Projects/mindnav-codeagent/pages/src/pages/Features.jsx` | 新增「進階優化」與「前端配置面板」區塊 |
| `~/Projects/mindnav-codeagent/pages/src/pages/Product.jsx` | 更新特色卡片描述 |
| `~/Projects/mindnav-codeagent/pages/src/App.css` | 新增配置面板相關樣式（如有必要） |

## 功能對照表

### 後端優化功能
| 功能 | 對應任務 | 前端呈現 |
|------|---------|---------|
| Prompt Layering | T123 | 角色檔案編輯器（T131） |
| 語意路由 | T124 | 語意分類配置（T132）、規則開關（T133） |
| 錯誤處理 | T125 | 錯誤重試配置（T134） |
| Agent 客製化 | T126 | 角色檔案編輯器（T131） |
| ReviewGate | T127 | 審查閾值配置（T135） |
| 工具推薦 | T128 | 工具推薦面板（T136） |
| 動態並行 | T129 | 並行權重配置（T137） |
| Workflow 追蹤 | T130 | 追蹤面板（整合至 Dashboard） |

### 前端配置面板
| 面板 | 功能 | API Endpoint |
|------|------|-------------|
| T131 | 編輯角色檔案 | `/api/roles/{role}/files/{filename}` |
| **新增** | **配置檔載入狀態** | **`/api/config/status`** |
| T132 | 配置語意分類模型 | `/api/config/semantic-classifier` |
| T133 | 規則路由開關 | `/api/config/rule-based-routing` |
| T134 | 錯誤重試策略 | `/api/config/error-handling` |
| T135 | 審查閾值 | `/api/config/review-gates` |
| T136 | 工具推薦顯示 | `/api/tools/recommendations` |
| T137 | 並行權重表 | `/api/config/task-weights` |

## 備註
- 維持現有多語系結構（15 種語言）
- 新增功能描述應簡潔明瞭，避免技術細節過多
- 考慮新增「版本歷史」區塊，呈現 v1.0 vs v2.0 功能差異
- **配置檔載入狀態檢視器**可獨立為新頁面或整合至角色管理頁面（T131）

## 風險
- 功能描述過於技術化可能影響用戶理解
- 多語系翻譯需確保一致性
- 頁面內容過多可能影響載入效能
- 配置檔狀態檢視器需確保即時性（考慮 WebSocket 或定期輪詢）
