---
status: done
depends_on: []
priority: medium
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-06
summary: "實作 T004: Dockerfile + docker-compose + GitHub Actions CI"
commit: 9396fc2
---
# T004: 新增 Dockerfile + docker-compose.yml + GitHub Actions CI

## 背景
專案缺少容器化與 CI/CD（SPEC-07, DEC-04）。`cloud-arch-clone.md` 講 Docker 多階段建構，但實際缺少 Dockerfile。

## 需求
1. 新增 `Dockerfile`：
   - 多階段建構、非 root 執行、健康檢查
   - 基於 `python:3.12-slim` 或 `python:3.14-slim`
2. 新增 `docker-compose.yml`：
   - 包含 app、redis（可選）、postgres（可選）服務
3. 新增 `.github/workflows/ci.yml`：
   - `ruff check`、`pyright`、`pytest`
   - 多架構映像建構 (`linux/amd64,arm64`)
   - CD 推送至 `ghcr.io`

## 驗收標準
- [x] `docker build .` 成功（clean build，無警告；HEALTHCHECK 實測 healthy）
- [x] `docker-compose up` 服務啟動正常（app 正常執行並 exit 0；`--profile full` 起 redis/postgres 皆 healthy）
- [x] GitHub Actions CI 綠燈（本機重現：workflow YAML 解析 OK、ruff 分層檢查通過、pyright 0 errors、pytest 5 passed）

## 附註
- 順帶修正真實 bug：pyproject 缺 `pyyaml` 依賴（`auto_develop.py` `import yaml` 在乾淨環境必炸）→ dependencies/prod/dev 三處補上
- CI 的 ruff 比照 T012 閘門分層：只檢查變更檔案（無變更清單時退路 `--select E9,F821`），避免被全專案既有 90 個舊債卡死
- app 服務預設執行 `./twin status`（一次性、exit 0），`restart: no` 避免短命容器重啟循環；跑自動排程器需另掛載專案目錄（compose 有註解）
- 新增 `.dockerignore`（縮小 build context、防止 .env/.venv 進入映像）

## 參考
- v3 討論 DEC-04 / SPEC-07 / DeepSeek 第 1 輪建議 4, 第 2 輪建議 2.5