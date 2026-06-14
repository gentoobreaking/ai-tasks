---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/838
title: PostgreSQL 环境建置（Docker 版本）
type: feature
priority: high
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號
created: 2026-06-02
updated: 2026-06-02
howto: |
  1. 使用 postgresql:16-alpine 镜像（非 18-alpine）
  2. 创建 docker-compose.yml（含 POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB 环境变量）
  3. 启动容器，测试连接（psql 或 Python）
  4. 确认数据库 / 用户 / 权限正确
---

# T101 - PostgreSQL 环境建置（Docker 版本）

## 目标
使用 Docker 在本地部署 PostgreSQL 16，创建专案所需的数据库与用户。

## 实际作法

### 1. docker-compose.yml 配置

**文件位置**：`/Users/claw/Projects/tw-quant-selector/docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: tw_quant_postgres
    environment:
      POSTGRES_USER: tw-quant
      POSTGRES_PASSWORD: tw-quant-PassWd
      POSTGRES_DB: tw_quant
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**关键差异**（与原任务描述不同）：
- 镜像：`postgres:16-alpine`（原描述用 `18-alpine`，实际 16 更稳定）
- 用户：`tw-quant`（原描述用 `postgres` / `quant_user`）
- 密码：`tw-quant-PassWd`（原描述用 `your_password`）
- 数据库：`tw_quant`（原描述用 `tw_quant_selector`）

### 2. 启动容器

```bash
cd /Users/claw/Projects/tw-quant-selector
docker-compose up -d
docker ps  # 确认 tw_quant_postgres 运行中
```

### 3. 测试连接

**方法一：psql**
```bash
docker exec -it tw_quant_postgres psql -U tw-quant -d tw_quant -c "SELECT version();"
```

**方法二：Python**
```python
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://tw-quant:tw-quant-PassWd@localhost:5432/tw_quant"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("SELECT version()"))
    print(result.fetchone())
```

### 4. 安装 Python 依赖

```bash
cd /Users/claw/Projects/tw-quant-selector
.venv/bin/pip install sqlalchemy psycopg2-binary
```

## 验收结果

- [x] `docker-compose.yml` 创建完成（PostgreSQL 16-alpine）
- [x] 容器启动成功（`docker ps` 确认）
- [x] 数据库连接测试通过（psql + Python 两种方式）
- [x] Python 依赖安装完成（`sqlalchemy` + `psycopg2-binary`）
- [x] `.env` 文件更新（实际用环境变量，不依赖 `.env`）

## 备注

- **实际数据库名**：`tw_quant`（非原描述的 `tw_quant_selector`）
- **实际用户名**：`tw-quant`（非 `quant_user`）
- **端口**：`5432`（默认，无需修改）
- **数据持久化**：Docker volume `postgres_data`（重启不丢数据）
- **下一步**：T102（Schema 迁移规划与实作）
