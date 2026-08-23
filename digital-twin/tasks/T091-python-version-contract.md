---
github_issue: N/A
title: Python 版本契約統一（requires-python 升 3.11 或降級 asyncio.timeout）
type: fix
priority: high
status: done
depends_on:
- T090
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T091 - Python 版本契約統一

## 目標
目前版本宣告互相矛盾，實際執行環境（venv 3.12 / Dockerfile python:3.12-slim /
CI setup-python 3.12）皆為 3.12，但程式碼使用了 3.11+ API：

| 位置 | 主張 | 實況 |
|---|---|---|
| pyproject.toml:9 | requires-python >= 3.10 | asyncio.timeout() 是 3.11+ |
| README badge | Python 3.10+ | 同上 |
| ruff target-version = py310 | 以 3.10 為目標 lint | 3.10 直譯器 import providers 即 AttributeError |

決策（二擇一，建議方案 A）：
- 方案 A（建議）：承認現實，requires-python = ">=3.11"、README badge 改 3.11+、
  ruff target-version = py311、pyright pythonVersion = 3.11。四處同步改，
  asyncio.timeout() 保留（比 wait_for 簡潔，timeout 語意較精準）
- 方案 B：維持 3.10 支援，providers.py:479,686 改回 asyncio.wait_for(coro, timeout)
  （注意 wait_for 逾時拋 asyncio.TimeoutError，Python 3.11+ 起才是 TimeoutError
  別名；走此案時 except 子句需同步確認）

無論何者：全庫 grep 確認沒有其他 3.11+ 專屬 API 違反所選契約
（tomllib、ExceptionGroup、except*、itertools.batched 等），並在 README 註明最低支援版本。

## 驗收標準
- [ ] pyproject / README / ruff / pyright 四處版本主張一致
- [ ] 方案 A：providers.py 的 reportAttributeAccessIssue(asyncio.timeout) 消失；
      方案 B：改用 wait_for 且逾時路徑有測試涵蓋
- [ ] grep 確認無其他 3.11+ API 違反所選契約
- [ ] CI 綠燈

## 備註
- depends_on T090：T090 修 providers.py 型別錯誤時會碰同一批行，避免衝突
- Dockerfile / CI 已是 3.12 不受影響；本任務只動「宣告」與（方案 B 時）兩行呼叫
