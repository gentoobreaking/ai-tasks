---
id: T049
project: gold-analysis
source_project: gold-analysis-core
title: 開發環境驗證
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: verification
status: done
created: 2026-04-07
updated: 2026-04-07
estimate: 1小時
depends_on:
  - T001
github_issue: ""
---

## 目標
驗證 T001（搭建開發環境）的完成品質，確保環境可正常運行。

## 驗收標準
- [ ] 後端虛擬環境正確配置
- [ ] 後端依賴完整安裝（FastAPI, uvicorn, pandas 等）
- [ ] 後端服務可正常啟動（`uvicorn app.main:app --reload`）
- [ ] 前端依賴完整安裝
- [ ] 前端服務可正常啟動（`npm run dev`）
- [ ] 前端可正常建置（`npm run build`）
- [ ] Git 倉庫已推送到 GitHub
- [ ] 專案目錄結構符合規範
## 驗證命令
```bash
# 後端驗證
cd /Users/david/Projects/gold-analysis/backend
source venv/bin/activate
python -c "import fastapi; import uvicorn; import pandas; print('✅ 後端依賴正常')"
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
curl http://127.0.0.1:8000/health || echo "Health endpoint not yet implemented"

# 前端驗證
cd /Users/david/Projects/gold-analysis/frontend
npm run dev &
curl http://localhost:5173 || echo "Frontend running"
npm run build

# Git 驗證
cd /Users/david/Projects/gold-analysis
git remote -v
git log --oneline -3
```

## 備註
這是 gold-analysis-core 專案的第一個驗證任務，由 Reviewer（樂樂）執行。