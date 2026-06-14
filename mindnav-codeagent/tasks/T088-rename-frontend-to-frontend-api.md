---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/597
title: Rename frontend/ → frontend_api/
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T088 - Rename frontend/ → frontend_api/

## 目標
將容易混淆的 `frontend/`（實際是 FastAPI 後端）改名為 `frontend_api/`，並更新所有相關引用。

## 驗收標準
- [x] 目錄 `frontend/` 改名為 `frontend_api/`
- [x] `docker/Dockerfile.slim` 的 COPY 路徑更新
- [x] `docker/Dockerfile.alpine` 的 COPY 路徑更新
- [x] `docker-compose.yml` 的 service name、command、requirements 引用更新
- [x] `scripts/start_dev.sh` 的 cd 路徑更新
- [x] `scripts/start_frontend.sh` 的 service name 更新
- [x] `scripts/build.sh` 的 SERVICES 陣列 + case 更新
- [x] `scripts/start_all.sh` 的 echo 文字更新
- [x] 本機 `cd frontend_api && python3 -m uvicorn app:app` 可正常啟動
- [x] `README.md` / `README_v1.md` 路徑更新

## 備註
- Python import 路徑 from `frontend.app:app` → `frontend_api.app:app`
- Dockerfile 內 COPY 目的地使用 `./frontend_api/`
