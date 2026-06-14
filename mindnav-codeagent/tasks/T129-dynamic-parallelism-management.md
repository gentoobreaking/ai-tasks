---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/648
title: 動態並行度管理
type: Feature
priority: P2
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 實作任務權重計算 + 動態並行度調整
---

# T129 - 動態並行度管理

## 目標
為 MindNav CodeAgent 的並行執行器實作動態並行度管理，根據任務權重、系統負載、資源競爭動態調整並行度。

## 背景
目前並行執行的問題：
```python
# engine/skills/task_executor.py
# 固定並行度
max_parallel = 4  # 硬編碼

# 沒有考慮：
# 1. 任務類型的資源消耗
# 2. 系統當前負載
# 3. 任務間的資源競爭
```

## 驗收標準
- [x] 實作 `TaskWeight` 模型（定義任務資源消耗權重）
- [x] 實作 `DynamicParallelism` 類別（計算動態並行度）
- [x] 實作 `SystemLoadMonitor` 類別（監控系統負載）
- [x] 整合至 `task_executor.py`
- [x] 新增並行度調整單元測試
- [x] 更新 README.md 說明並行策略

## 實作細節

### 1. 任務權重模型
```python
# engine/skills/task_weight.py

from pydantic import BaseModel, Field
from typing import Literal

class TaskWeight(BaseModel):
    """任務資源消耗權重"""
    
    task_type: str = Field(description="任務類型")
    cpu_weight: float = Field(description="CPU 權重", ge=0, le=1)
    memory_weight: float = Field(description="記憶體權重", ge=0, le=1)
    io_weight: float = Field(description="I/O 權重", ge=0, le=1)
    llm_weight: float = Field(description="LLM 呼叫權重", ge=0, le=1)
    duration_estimate: float = Field(description="預估執行時間（秒）", ge=0)
    
    @property
    def total_weight(self) -> float:
        """總權重（用於並行度計算）"""
        return (
            self.cpu_weight * 0.3 +
            self.memory_weight * 0.2 +
            self.io_weight * 0.2 +
            self.llm_weight * 0.3
        )

# 預設權重表
DEFAULT_WEIGHTS = {
    "web_search": TaskWeight(
        task_type="web_search",
        cpu_weight=0.1,
        memory_weight=0.1,
        io_weight=0.8,  # 網路 I/O
        llm_weight=0.2,
        duration_estimate=5
    ),
    "code_generation": TaskWeight(
        task_type="code_generation",
        cpu_weight=0.3,
        memory_weight=0.5,
        io_weight=0.1,
        llm_weight=1.0,  # 重量級 LLM 呼叫
        duration_estimate=30
    ),
    "test_execution": TaskWeight(
        task_type="test_execution",
        cpu_weight=0.8,  # 高 CPU
        memory_weight=0.4,
        io_weight=0.3,
        llm_weight=0.1,
        duration_estimate=15
    ),
    "file_write": TaskWeight(
        task_type="file_write",
        cpu_weight=0.1,
        memory_weight=0.1,
        io_weight=0.5,  # 磁碟 I/O
        llm_weight=0.0,
        duration_estimate=2
    ),
    "git_operation": TaskWeight(
        task_type="git_operation",
        cpu_weight=0.1,
        memory_weight=0.2,
        io_weight=0.7,
        llm_weight=0.0,
        duration_estimate=3
    ),
}
```

### 2. 系統負載監控
```python
# engine/skills/load_monitor.py

import psutil
from datetime import datetime

class SystemLoadMonitor:
    """系統負載監控器"""
    
    def __init__(self, load_threshold: float = 0.8):
        self.load_threshold = load_threshold
        self.history = []
    
    def get_current_load(self) -> dict:
        """取得當前系統負載"""
        return {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_io_percent": self._get_disk_io_percent(),
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_disk_io_percent(self) -> float:
        """取得磁碟 I/O 使用率"""
        disk_io = psutil.disk_io_counters()
        # 簡化：根據讀寫量估算
        total_io = disk_io.read_bytes + disk_io.write_bytes
        # 需要基準線或差分計算
        return min(100, total_io / (1024 * 1024 * 100))  # MB 換算
    
    def is_overloaded(self) -> bool:
        """檢查系統是否過載"""
        load = self.get_current_load()
        return (
            load["cpu_percent"] > self.load_threshold * 100 or
            load["memory_percent"] > self.load_threshold * 100
        )
    
    def record_history(self, load: dict):
        """記錄負載歷史"""
        self.history.append(load)
        # 保留最近 100 筆
        if len(self.history) > 100:
            self.history.pop(0)
    
    def get_average_load(self, window: int = 10) -> dict:
        """取得平均負載"""
        if not self.history:
            return {"cpu_percent": 50, "memory_percent": 50}
        
        recent = self.history[-window:]
        return {
            "cpu_percent": sum(h["cpu_percent"] for h in recent) / len(recent),
            "memory_percent": sum(h["memory_percent"] for h in recent) / len(recent)
        }
```

### 3. 動態並行度管理
```python
# engine/skills/dynamic_parallelism.py

from typing import List
from engine.skills.task_weight import DEFAULT_WEIGHTS, TaskWeight
from engine.skills.load_monitor import SystemLoadMonitor

class DynamicParallelism:
    """動態並行度管理"""
    
    def __init__(self, max_parallel: int = 4, load_threshold: float = 0.8):
        self.max_parallel = max_parallel
        self.load_monitor = SystemLoadMonitor(load_threshold)
    
    def calculate_parallelism(self, pending_tasks: List[dict]) -> int:
        """計算當前可執行的並行度"""
        
        # 1. 取得系統負載
        current_load = self.load_monitor.get_current_load()
        self.load_monitor.record_history(current_load)
        
        # 2. 如果系統過載，降低並行度
        if self.load_monitor.is_overloaded():
            return max(1, self.max_parallel // 2)
        
        # 3. 計算任務總權重
        total_weight = 0
        for task in pending_tasks:
            task_type = self._classify_task(task)
            weight = DEFAULT_WEIGHTS.get(task_type, TaskWeight(
                task_type="unknown",
                cpu_weight=0.5,
                memory_weight=0.5,
                io_weight=0.5,
                llm_weight=0.5,
                duration_estimate=10
            ))
            total_weight += weight.total_weight
        
        # 4. 根據總權重決定並行度
        # 輕量任務 → 高並行度
        # 重量任務 → 低並行度
        if total_weight <= 2.0:
            parallelism = min(self.max_parallel, len(pending_tasks))
        elif total_weight <= 4.0:
            parallelism = min(2, len(pending_tasks))
        else:
            parallelism = 1  # 重量任務逐一執行
        
        # 5. 根據平均負載微調
        avg_load = self.load_monitor.get_average_load()
        if avg_load["cpu_percent"] > 70:
            parallelism = max(1, parallelism - 1)
        
        return parallelism
    
    def _classify_task(self, task: dict) -> str:
        """分類任務類型"""
        desc = task.get("description", "").lower()
        
        if any(kw in desc for kw in ["search", "爬取", "browse"]):
            return "web_search"
        if any(kw in desc for kw in ["generate", "create", "implement", "實作"]):
            return "code_generation"
        if any(kw in desc for kw in ["test", "pytest", "測試"]):
            return "test_execution"
        if any(kw in desc for kw in ["write", "save", "儲存"]):
            return "file_write"
        if any(kw in desc for kw in ["git", "commit", "push"]):
            return "git_operation"
        
        return "code_generation"  # 預設
    
    def get_execution_plan(self, pending_tasks: List[dict]) -> dict:
        """取得執行計畫"""
        parallelism = self.calculate_parallelism(pending_tasks)
        
        # 排序任務（輕量優先）
        sorted_tasks = sorted(
            pending_tasks,
            key=lambda t: DEFAULT_WEIGHTS.get(
                self._classify_task(t),
                TaskWeight(task_type="unknown", cpu_weight=0.5, memory_weight=0.5, io_weight=0.5, llm_weight=0.5, duration_estimate=10)
            ).total_weight
        )
        
        # 分批執行
        batches = []
        for i in range(0, len(sorted_tasks), parallelism):
            batch = sorted_tasks[i:i+parallelism]
            batches.append(batch)
        
        return {
            "parallelism": parallelism,
            "total_tasks": len(pending_tasks),
            "batches": batches,
            "batch_count": len(batches),
            "estimated_duration": sum(
                DEFAULT_WEIGHTS.get(
                    self._classify_task(t),
                    TaskWeight(task_type="unknown", cpu_weight=0.5, memory_weight=0.5, io_weight=0.5, llm_weight=0.5, duration_estimate=10)
                ).duration_estimate
                for t in pending_tasks
            )
        }
```

### 4. 整合至 TaskExecutor
```python
# engine/skills/task_executor.py

from engine.skills.dynamic_parallelism import DynamicParallelism

async def create_task_executor():
    """建立任務執行器"""
    parallelism_mgr = DynamicParallelism(max_parallel=4)
    
    async def executor(state: dict):
        task_plan = state.get("task_plan")
        if not task_plan:
            return {"sender": "task_executor", "messages": [...]}
        
        # 取得執行計畫
        pending = [t for t in task_plan.tasks if t.task_id not in state.get("completed_task_ids", [])]
        plan = parallelism_mgr.get_execution_plan(pending)
        
        # 執行批次
        results = []
        for batch in plan["batches"]:
            batch_results = await asyncio.gather(*[
                execute_single_task(t) for t in batch
            ])
            results.extend(batch_results)
        
        return {
            "sender": "task_executor",
            "task_results": {r["task_id"]: r for r in results},
            "completed_task_ids": [r["task_id"] for r in results],
        }
    
    return executor
```

## 備註
- 系統負載監控使用 psutil
- 權重表可透過配置檔調整
- 未來可整合 Ray 或 Celery 做分散式執行

## 風險
- 負載監控可能增加開銷
- 某些環境（如 Docker）可能無法正確取得負載
