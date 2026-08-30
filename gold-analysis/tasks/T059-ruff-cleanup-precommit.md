---
id: T059
github_issue: ""
title: ruff 清理 + pre-commit + CI lint 閘門
project: gold-analysis
type: refactor
priority: medium
status: done
depends_on: [T058]
assignee: "pi"
created: 2026-08-28
updated: 2026-08-30
---

# T059 - ruff 清理 + pre-commit + CI lint 閘門

## 目標
`ruff check app` 目前有 **1384** 個錯誤（1019 可自動修復），主要為 PEP585/PEP604 噪音：UP006 ×432（`List`→`list`）、UP045 ×329（`Optional`→`|`）、F401 ×117（未用 import）、B008 ×71（FastAPI 預設引數反模式）、DTZ003 ×62（tz-naive `datetime.utcnow`）、BLE001、F841、RUF012。需清理並建立閘門防止回潮。

## 驗收標準
- [ ] 執行 `ruff check --fix` 修復可自動修復項（含 UP006/UP045/F401）
- [ ] 手動處理 B008（改為 `Depends(...)` 模式）、DTZ003（改 `datetime.now(timezone.utc)`）、BLE001、F841、RUF012
- [ ] 剩餘錯誤數降至 0（或建立明確的 `# noqa` 白名單並註解理由）
- [ ] 加入 `pre-commit` hooks（ruff, ruff-format, 必要時 mypy）
- [ ] CI 加入 lint 閘門，錯誤即 fail
- [ ] 補 `.ruff.toml`/`pyproject` 設定，固定規則集

## 備註
- 依賴 T058（先清掉 F821 真實 bug 再整批 autofix，避免遮蔽問題）。
- 注意 B008 多為 FastAPI `Depends` 慣用法誤報，可用 `ruff` 的 `lint.flake8-bugbear` 設定或 `# noqa: B008` 正確處理，勿誤改語意。
