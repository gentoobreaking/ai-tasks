---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/796
title: ReviewGate 多類型審查擴展
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 將 ReviewGate 從只審查 TechSpec 擴展為多類型審查門
---

# T127 - ReviewGate 多類型審查擴展

## 目標
將 ReviewGate 從單一審查 TechSpec 擴展為多類型審查門，支援代碼品質、安全掃描、測試覆蓋、文件完整性等多維度審查。

## 背景
目前 ReviewGate 只審查 Architect 產出的 TechSpec：
```python
# engine/nodes/review_gate.py
async def review_gate_node(state):
    tech_spec = state.get("tech_spec")
    if not tech_spec:
        return {"sender": "ReviewGate", "messages": [...]}
    
    issues = _validate_tech_spec(tech_spec)
    # ...
```

缺少：
- Coder 產出的代碼品質審查
- Security 產出的安全報告審查
- QA 產出的測試結果審查
- Doc 產出的文件完整性審查

## 驗收標準
- [x] 實作 `ReviewType` 枚舉（tech_spec / code_quality / security / test_coverage / documentation）
- [x] 實作 `ReviewResult` 模型（passed、issues、feedback）
- [x] 實作 `TechSpecReviewer` 類別（現有邏輯重構）
- [x] 實作 `CodeQualityReviewer` 類別（檢查硬編碼、錯誤處理、測試）
- [x] 實作 `SecurityReviewer` 類別（檢查 OWASP 掃描結果）
- [x] 實作 `TestCoverageReviewer` 類別（檢查覆蓋率閾值）
- [x] 實作 `DocumentationReviewer` 類別（檢查必備文件）
- [x] 更新 `review_gate_node` 根據 sender 選擇審查類型
- [x] 新增審查門單元測試

## 實作細節

### 1. 審查類型枚舉
```python
# engine/nodes/review_gate.py

from enum import Enum

class ReviewType(Enum):
    TECH_SPEC = "tech_spec"
    CODE_QUALITY = "code_quality"
    SECURITY = "security"
    TEST_COVERAGE = "test_coverage"
    DOCUMENTATION = "documentation"

class ReviewResult(BaseModel):
    """審查結果"""
    review_type: ReviewType
    passed: bool
    issues: List[str] = Field(default_factory=list)
    feedback: str
    suggestions: List[str] = Field(default_factory=list)
```

### 2. 審查器基類
```python
# engine/nodes/reviewers/base.py

from abc import ABC, abstractmethod

class Reviewer(ABC):
    """審查器基類"""
    
    @abstractmethod
    async def review(self, state: dict) -> ReviewResult:
        """執行審查"""
        pass
    
    def _format_issues(self, issues: List[str]) -> str:
        """格式化問題清單"""
        return "\n".join(f"- {issue}" for issue in issues)
```

### 3. TechSpec 審查器（現有邏輯重構）
```python
# engine/nodes/reviewers/tech_spec_reviewer.py

class TechSpecReviewer(Reviewer):
    """TechSpec 審查器"""
    
    async def review(self, state: dict) -> ReviewResult:
        tech_spec = state.get("tech_spec")
        
        if not tech_spec:
            return ReviewResult(
                review_type=ReviewType.TECH_SPEC,
                passed=False,
                issues=["TechSpec 不存在"],
                feedback="請先提交 TechSpec"
            )
        
        issues = []
        
        # 檢查技術棧
        if not tech_spec.stack:
            issues.append("技術棧 (stack) 為空")
        
        # 檢查 rationale
        if not tech_spec.rationale.strip():
            issues.append("技術選型原則 (rationale) 為空")
        
        # 檢查 summary
        if not tech_spec.summary.strip():
            issues.append("開發摘要 (summary) 為空")
        
        # 檢查風險緩解措施
        for risk in tech_spec.risks:
            if not risk.mitigation.strip():
                issues.append(f"風險 '{risk.description[:50]}...' 缺少緩解措施")
        
        passed = len(issues) == 0
        
        return ReviewResult(
            review_type=ReviewType.TECH_SPEC,
            passed=passed,
            issues=issues,
            feedback=self._generate_feedback(tech_spec, passed, issues)
        )
    
    def _generate_feedback(self, tech_spec, passed, issues):
        if passed:
            return f"✅ TechSpec 審查通過\n技術棧: {', '.join(c.selected for c in tech_spec.stack)}"
        return f"❌ TechSpec 審查未通過\n發現問題:\n{self._format_issues(issues)}"
```

### 4. 代碼品質審查器
```python
# engine/nodes/reviewers/code_quality_reviewer.py

class CodeQualityReviewer(Reviewer):
    """代碼品質審查器"""
    
    def __init__(self):
        self.checks = [
            self._check_hardcoded_secrets,
            self._check_error_handling,
            self._check_type_hints,
            self._check_docstrings,
            self._check_complexity,
        ]
    
    async def review(self, state: dict) -> ReviewResult:
        code = state.get("current_code", "")
        
        if not code:
            return ReviewResult(
                review_type=ReviewType.CODE_QUALITY,
                passed=True,
                feedback="無代碼需審查"
            )
        
        issues = []
        for check in self.checks:
            check_issues = check(code)
            issues.extend(check_issues)
        
        passed = len([i for i in issues if i.startswith("🔴")]) == 0
        
        return ReviewResult(
            review_type=ReviewType.CODE_QUALITY,
            passed=passed,
            issues=issues,
            feedback=self._format_result(issues, passed)
        )
    
    def _check_hardcoded_secrets(self, code: str) -> List[str]:
        issues = []
        patterns = [
            (r'password\s*=\s*["\'][^"\']+(["\'])', '硬編碼密碼'),
            (r'api_key\s*=\s*["\'][^"\']+(["\'])', '硬編碼 API Key'),
            (r'secret\s*=\s*["\'][^"\']+(["\'])', '硬編碼 Secret'),
        ]
        
        for pattern, desc in patterns:
            if re.search(pattern, code, re.I):
                issues.append(f"🔴 {desc}")
        
        return issues
    
    def _check_error_handling(self, code: str) -> List[str]:
        issues = []
        
        # 檢查是否有 try-except
        if 'def ' in code and 'try:' not in code:
            issues.append("🟡 缺少錯誤處理 (try-except)")
        
        # 檢查 bare except
        if re.search(r'except\s*:', code):
            issues.append("🔴 使用 bare except（應指定異常類型）")
        
        return issues
    
    def _check_type_hints(self, code: str) -> List[str]:
        issues = []
        
        # 檢查函數是否有 type hints
        func_defs = re.findall(r'def\s+(\w+)\s*\([^)]*\):', code)
        typed_funcs = re.findall(r'def\s+\w+\s*\([^)]*\)\s*->', code)
        
        if len(func_defs) > 0 and len(typed_funcs) < len(func_defs):
            issues.append(f"🟡 {len(func_defs) - len(typed_funcs)} 個函數缺少返回值型別註解")
        
        return issues
    
    def _check_complexity(self, code: str) -> List[str]:
        issues = []
        
        # 檢查過長函數
        lines = code.split('\n')
        in_function = False
        func_start = 0
        func_name = ""
        
        for i, line in enumerate(lines):
            if re.match(r'^def\s+(\w+)', line):
                if in_function and i - func_start > 50:
                    issues.append(f"🟡 函數 '{func_name}' 過長 ({i - func_start} 行)")
                in_function = True
                func_start = i
                func_name = re.match(r'^def\s+(\w+)', line).group(1)
            elif line and not line[0].isspace() and in_function:
                in_function = False
        
        return issues
```

### 5. 安全審查器
```python
# engine/nodes/reviewers/security_reviewer.py

class SecurityReviewer(Reviewer):
    """安全審查器"""
    
    async def review(self, state: dict) -> ReviewResult:
        security_report = state.get("security_report", {})
        
        if not security_report:
            return ReviewResult(
                review_type=ReviewType.SECURITY,
                passed=True,
                feedback="無安全報告需審查"
            )
        
        vulnerabilities = security_report.get("vulnerabilities", [])
        
        critical_high = [v for v in vulnerabilities 
                        if v.get("severity") in ("critical", "high")]
        
        passed = len(critical_high) == 0
        
        issues = []
        for v in vulnerabilities:
            icon = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}
            issues.append(f"{icon.get(v['severity'], '⚪')} {v['type']}: {v['description'][:50]}")
        
        return ReviewResult(
            review_type=ReviewType.SECURITY,
            passed=passed,
            issues=issues,
            feedback=f"{'✅' if passed else '❌'} 發現 {len(vulnerabilities)} 個漏洞（{len(critical_high)} 個嚴重）"
        )
```

### 6. 測試覆蓋審查器
```python
# engine/nodes/reviewers/test_coverage_reviewer.py

class TestCoverageReviewer(Reviewer):
    """測試覆蓋審查器"""
    
    def __init__(self, coverage_threshold: float = 0.8):
        self.coverage_threshold = coverage_threshold
    
    async def review(self, state: dict) -> ReviewResult:
        test_results = state.get("test_results", {})
        test_plan = state.get("test_plan", {})
        
        if not test_results:
            return ReviewResult(
                review_type=ReviewType.TEST_COVERAGE,
                passed=False,
                issues=["無測試結果"],
                feedback="請先執行測試"
            )
        
        issues = []
        
        # 檢查失敗測試
        failed = test_results.get("failed", 0)
        if failed > 0:
            issues.append(f"🔴 {failed} 個測試失敗")
        
        # 檢查覆蓋率
        coverage = test_results.get("coverage", 0)
        if coverage < self.coverage_threshold:
            issues.append(f"🟡 測試覆蓋率過低: {coverage:.1%}（需 > {self.coverage_threshold:.0%}）")
        
        passed = failed == 0 and coverage >= self.coverage_threshold
        
        return ReviewResult(
            review_type=ReviewType.TEST_COVERAGE,
            passed=passed,
            issues=issues,
            feedback=f"{'✅' if passed else '❌'} 測試結果: {test_results.get('passed', 0)} passed, {failed} failed, {coverage:.1%} coverage"
        )
```

### 7. 文件審查器
```python
# engine/nodes/reviewers/documentation_reviewer.py

class DocumentationReviewer(Reviewer):
    """文件完整性審查器"""
    
    def __init__(self):
        self.required_docs = ["README.md", "API.md", "CHANGELOG.md"]
    
    async def review(self, state: dict) -> ReviewResult:
        docs = state.get("docs", "")
        tech_spec = state.get("tech_spec")
        
        issues = []
        
        # 檢查必要文件
        for doc_name in self.required_docs:
            if doc_name.replace(".md", "") not in docs:
                issues.append(f"🟡 缺少 {doc_name}")
        
        # 檢查 README 是否包含必要段落
        if "README" in docs:
            required_sections = ["安裝", "使用", "API"]
            for section in required_sections:
                if section not in docs and section.lower() not in docs:
                    issues.append(f"🟡 README 缺少 '{section}' 段落")
        
        passed = len([i for i in issues if i.startswith("🔴")]) == 0
        
        return ReviewResult(
            review_type=ReviewType.DOCUMENTATION,
            passed=passed,
            issues=issues,
            feedback=f"{'✅' if passed else '⚠️'} 文件審查完成，發現 {len(issues)} 個建議"
        )
```

### 8. 整合至 ReviewGate
```python
# engine/nodes/review_gate.py

REVIEWER_MAP = {
    "Architect": TechSpecReviewer(),
    "Coder": CodeQualityReviewer(),
    "Security": SecurityReviewer(),
    "QA": TestCoverageReviewer(),
    "Doc": DocumentationReviewer(),
}

async def review_gate_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """通用審查門"""
    sender = state.get("sender", "")
    
    reviewer = REVIEWER_MAP.get(sender)
    
    if not reviewer:
        return {
            "sender": "ReviewGate",
            "messages": [AIMessage(content="[ReviewGate] 無需審查")]
        }
    
    result = await reviewer.review(state)
    
    if not result.passed:
        return {
            "sender": "ReviewGate",
            "review_passed": False,
            "review_issues": result.issues,
            "messages": [AIMessage(content=f"## ReviewGate: {result.review_type.value} 審查未通過\n\n{result.feedback}")]
        }
    
    return {
        "sender": "ReviewGate",
        "review_passed": True,
        "messages": [AIMessage(content=f"## ReviewGate: {result.review_type.value} 審查通過 ✅\n\n{result.feedback}")]
    }
```

## 備註
- 每個審查器可獨立測試
- 可透過環境變數調整閾值（如測試覆蓋率）
- 審查結果可記錄至 state 供後續分析

## 風險
- 過嚴格的審查可能拖慢流程
- 某些審查（如複雜度）可能過於主觀
