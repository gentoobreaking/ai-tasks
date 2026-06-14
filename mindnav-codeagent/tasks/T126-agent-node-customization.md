---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/795
title: Agent 節點客製化實作
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 為 PO/PM/QA/Security/Doc/DevOps 加入客製化邏輯
---

# T126 - Agent 節點客製化實作

## 目標
為 MindNav CodeAgent 的六個簡單封裝節點（PO、PM、QA、Security、Doc、DevOps）加入客製化邏輯，使其具備專業化的輸出結構與行為。

## 背景
目前實作：
```python
# 簡單封裝節點（133-145 bytes）
def create_po_node(config, llm):
    return create_simple_node(config, llm, "PO")

# 缺少：
# - 結構化輸出（UserStory、TaskPlan、SecurityReport 等）
# - 專業領域邏輯
# - 狀態追蹤
```

## 驗收標準
- [x] 實作 `PO` 節點客製化（需求結構化輸出 UserStory）
- [x] 實作 `PM` 節點客製化（任務拆解、進度追蹤、FINISHED 標記）
- [x] 實作 `QA` 節點客製化（測試計畫生成、覆蓋率檢查）
- [x] 實作 `Security` 節點客製化（OWASP 掃描、漏洞報告）
- [x] 實作 `Doc` 節點客製化（文件範本生成、格式規範）
- [x] 實作 `DevOps` 節點客製化（部署流程、監控告警）
- [x] 更新 `graph.py` 使用新節點函數
- [x] 新增節點單元測試

## 實作細節

### 1. PO 節點 - 需求結構化
```python
# engine/nodes/po_node.py

from pydantic import BaseModel, Field
from typing import List, Literal

class UserStory(BaseModel):
    """用戶故事結構"""
    as_a: str = Field(description="作為一個...")
    i_want: str = Field(description="我想要...")
    so_that: str = Field(description="以便...")
    ac_items: List[str] = Field(description="驗收標準清單")
    priority: Literal["P0", "P1", "P2", "P3"] = Field(description="優先級")
    story_points: int = Field(description="故事點數（1-13）", ge=1, le=13)

class POOutput(BaseModel):
    """PO 節點輸出"""
    user_stories: List[UserStory]
    clarifications_needed: List[str] = Field(default_factory=list)

async def po_node(state: dict) -> dict:
    """PO 節點 - 需求分析與結構化"""
    llm = LLMFactory.get_llm(role="po", temperature=0)
    structured_llm = llm.with_structured_output(POOutput)
    
    # 提取用戶需求
    user_input = get_message_content(state["messages"][-1])
    
    result = await structured_llm.ainvoke([
        SystemMessage(content=PO_SYSTEM_PROMPT),
        HumanMessage(content=f"請分析以下需求並產出結構化用戶故事：\n{user_input}")
    ])
    
    # 轉換 ac_items 為標準格式
    ac_items = []
    for story in result.user_stories:
        for i, ac in enumerate(story.ac_items):
            ac_items.append({
                "id": f"AC-{len(ac_items)+1}",
                "description": ac,
                "source": "PO",
                "priority": story.priority,
                "story_id": f"US-{len(state.get('user_stories', [])) + 1}"
            })
    
    return {
        "user_stories": [s.model_dump() for s in result.user_stories],
        "ac_items": ac_items,
        "sender": "PO",
        "messages": [AIMessage(content=format_po_output(result))]
    }
```

### 2. PM 節點 - 任務管理
```python
# engine/nodes/pm_node.py

class TaskPlan(BaseModel):
    """任務計畫"""
    tasks: List[Task]
    dependencies: Dict[str, List[str]]  # task_id -> depends_on
    estimated_hours: float
    risks: List[str]

async def pm_node(state: dict) -> dict:
    """PM 節點 - 任務拆解與進度管理"""
    llm = LLMFactory.get_llm(role="pm", temperature=0)
    structured_llm = llm.with_structured_output(TaskPlan)
    
    # 獲取用戶故事
    user_stories = state.get("user_stories", [])
    
    result = await structured_llm.ainvoke([
        SystemMessage(content=PM_SYSTEM_PROMPT),
        HumanMessage(content=f"請將以下用戶故事拆解為任務：\n{format_stories(user_stories)}")
    ])
    
    # 計算最大迭代次數
    max_iterations = compute_max_iterations(result)
    
    # 判斷是否完成
    is_finished = check_completion(state, result)
    
    return {
        "task_plan": result.model_dump(),
        "max_iterations": max_iterations,
        "sender": "PM",
        "messages": [AIMessage(
            content=format_pm_output(result) + (" FINISHED" if is_finished else "")
        )]
    }
```

### 3. QA 節點 - 測試策略
```python
# engine/nodes/qa_node.py

class TestPlan(BaseModel):
    """測試計畫"""
    unit_tests: List[str]
    integration_tests: List[str]
    edge_cases: List[str]
    coverage_estimate: float = Field(ge=0, le=1)
    
async def qa_node(state: dict) -> dict:
    """QA 節點 - 測試計畫生成與執行"""
    tech_spec = state.get("tech_spec")
    ac_items = state.get("ac_items", [])
    
    # 根據 AC 生成測試計畫
    result = await structured_llm.ainvoke([
        SystemMessage(content=QA_SYSTEM_PROMPT),
        HumanMessage(content=f"技術規格：{tech_spec}\n驗收標準：{format_ac(ac_items)}")
    ])
    
    # 執行測試（如果有 bash 工具）
    test_results = await execute_tests(state, result)
    
    return {
        "test_plan": result.model_dump(),
        "test_results": test_results,
        "sender": "QA",
        "messages": [AIMessage(content=format_qa_output(result, test_results))]
    }
```

### 4. Security 節點 - 安全掃描
```python
# engine/nodes/security_node.py

class Vulnerability(BaseModel):
    type: str
    severity: Literal["critical", "high", "medium", "low"]
    location: str
    description: str
    recommendation: str

class SecurityReport(BaseModel):
    """安全報告"""
    vulnerabilities: List[Vulnerability]
    scan_timestamp: datetime
    passed: bool

async def security_node(state: dict) -> dict:
    """Security 節點 - 安全掃描"""
    current_code = state.get("current_code", "")
    
    # OWASP Top 10 檢查
    vulnerabilities = []
    
    # SQL Injection
    if re.search(r'execute\s*\(\s*["\'].*\+.*["\']', current_code):
        vulnerabilities.append(Vulnerability(
            type="SQL Injection",
            severity="critical",
            location="execute() call",
            description="可能的 SQL 注入漏洞",
            recommendation="使用參數化查詢"
        ))
    
    # XSS
    if re.search(r'innerHTML\s*=', current_code) or re.search(r'dangerouslySetInnerHTML', current_code):
        vulnerabilities.append(Vulnerability(
            type="XSS",
            severity="high",
            location="HTML injection",
            description="可能的 XSS 漏洞",
            recommendation="使用 textContent 或 sanitize"
        ))
    
    # Command Injection
    if re.search(r'subprocess\..*\(', current_code) and not re.search(r'shell=False', current_code):
        vulnerabilities.append(Vulnerability(
            type="Command Injection",
            severity="critical",
            location="subprocess call",
            description="可能的命令注入漏洞",
            recommendation="使用 shell=False 並傳遞列表"
        ))
    
    report = SecurityReport(
        vulnerabilities=vulnerabilities,
        scan_timestamp=datetime.now(),
        passed=len([v for v in vulnerabilities if v.severity in ("critical", "high")]) == 0
    )
    
    return {
        "security_report": report.model_dump(),
        "sender": "Security",
        "messages": [AIMessage(content=format_security_report(report))]
    }
```

### 5. Doc 節點 - 文件生成
```python
# engine/nodes/doc_node.py

class DocumentationType(Enum):
    README = "readme"
    API = "api"
    CHANGELOG = "changelog"
    ARCHITECTURE = "architecture"

async def doc_node(state: dict) -> dict:
    """Doc 節點 - 文件生成"""
    tech_spec = state.get("tech_spec")
    doc_type = state.get("doc_type", DocumentationType.README)
    
    if doc_type == DocumentationType.README:
        content = generate_readme(tech_spec)
    elif doc_type == DocumentationType.API:
        content = generate_api_docs(state.get("current_code"))
    elif doc_type == DocumentationType.CHANGELOG:
        content = generate_changelog(state.get("adr_log", []))
    
    return {
        "docs": state.get("docs", "") + "\n\n" + content,
        "sender": "Doc",
        "messages": [AIMessage(content=f"📄 已生成 {doc_type.value} 文件")]
    }
```

### 6. DevOps 節點 - 部署管理
```python
# engine/nodes/devops_node.py

class DeploymentStatus(BaseModel):
    stage: str
    status: Literal["pending", "running", "success", "failed"]
    logs: List[str]
    rollback_available: bool

async def devops_node(state: dict) -> dict:
    """DevOps 節點 - 部署與監控"""
    # 檢查系統負載
    load_status = await check_system_load()
    
    if load_status.load > load_status.threshold:
        return {
            "sender": "DevOps",
            "messages": [AIMessage(content=f"⚠️ 系統負載過高: {load_status.load:.2%}，暫停部署")]
        }
    
    # 執行部署
    deployment_result = await execute_deployment(state)
    
    return {
        "deployment_status": deployment_result.model_dump(),
        "sender": "DevOps",
        "messages": [AIMessage(content=format_deployment_result(deployment_result))]
    }
```

## 備註
- 每個節點的 Pydantic 模型需與 SOUL.md 中的框架一致
- 輸出格式需考慮 Telegram 訊息長度限制
- 結構化輸出使用 `llm.with_structured_output()` 確保可解析

## 風險
- 過多結構化輸出可能增加 LLM 呼叫失敗率
- 需設計 fallback 機制（當結構化失敗時）
