---
id: T061
github_issue: ""
title: 更新文件 (README/AGENTS) 對齊實際架構
project: gold-analysis
type: docs
priority: low
status: pending
depends_on: [T057]
assignee: "pi"
created: 2026-08-28
updated: 2026-08-28
---

# T061 - 更新文件 (README/AGENTS) 對齊實際架構

## 目標
頂層 `README.md` 嚴重過時：聲稱 Python 3.9+、僅有基礎端點，完全未提及 agents / ML / trading。同時 `docs/AGENTS.md` 引用 `backend/app/config/agents.yaml` 與 `from backend.app.config import load_config`，需核實是否存在。JWT 認證中介層已存在但未文件化。

## 驗收標準
- [ ] README 更新為反映實際技術棧、多代理管線、ML 訓練/監控、交易介面卡、認證
- [ ] 核實 `docs/AGENTS.md` 引用的路徑/符號存在；不存在的修正或移除
- [ ] 文件化認證方式（JWT middleware、rate limit）
- [ ] 記錄規範來源 `backend/app`（與 T057 一致）
- [ ] 更新啟動/測試指令為 `uv`（與 T060 一致）

## 備註
- 依賴 T057（先確立架構再寫文件，避免又寫錯）。
- 注意 README 標示的 Python 版本（3.9+）與實際依賴（pydantic-settings、SQLAlchemy 2.x）是否相容。
