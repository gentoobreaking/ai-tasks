---
github_issue: N/A
title: pyproject extras 去重 — prod 移除重複的 dependencies 複本
type: chore
priority: low
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T098 - pyproject.toml extras 去重

## 目標
[project.optional-dependencies] 的 prod extras（pyproject.toml:29-47）把
dependencies 全部 17 條原樣複製一遍 —— 但 dependencies 本身就是必裝，
prod = ["digital-twin"] 即可（REVIEW_REPORT M5 提過，當時只做了 dev/telegram
互相引用，prod 這層漏掉）。

改為：
```toml
[project.optional-dependencies]
prod = ["digital-twin"]
telegram = ["digital-twin[prod]"]
dev = ["digital-twin[prod]", "pytest>=8.0.0", "pytest-asyncio>=0.23.0", "ruff>=0.5.0", "pyright>=1.1.370"]
```

同步檢查：
1. Dockerfile builder 的 `pip install ".[prod]"` 行為不變（安裝本體 + 無額外）
2. uv.lock re-lock 後提交（extras 變動會影響 lock 的 resolution-markers）
3. CI 安裝步驟 `pip install ".[dev]"` 不變

## 驗收標準
- [ ] prod extras 不再逐條複製 dependencies；pip install ".[prod]" 於乾淨 venv 可用
- [ ] Docker build 成功且 runtime import 核心模組正常
      （docker build + python -c "import scheduler, providers"）
- [ ] uv.lock 已更新並提交，uv lock --check 通過
- [ ] CI 綠燈

## 備註
- 與 T090 的 uv.lock 提交有先後關係：T090 先修鎖檔同步，本任務再動 extras
  （或合併在同一 PR 分兩個 commit）
- 若未來 prod 需要真正「生產才要」的套件（如 gunicorn），加在 prod extras 即可，
  目前它只是歷史包袱
