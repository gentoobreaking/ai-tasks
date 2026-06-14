---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/822
title: 策略设定 UI 新增法人因子
type: feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-06-02
updated: 2026-06-04
howto: |
  1. 修改前端策略设定页面，新增法人因子权重调整滑块
  2. 更新 API GET/PUT /api/v1/strategy/config 支援 institutional 权重
  3. 更新后端 config 处理逻辑
  4. 前端显示六因子雷达图（新增法人动向维度）
---

# T113 - 策略设定 UI 新增法人因子

## 目标
在前端策略设定页面新增法人动向因子（第五因子）的权重调整功能，并更新后端 API 支援六因子配置。

## 验收标准
- [x] 前端修改（React）：
  - 在策略设定页面新增「法人动向」权重调整滑块（默认 0.25）
  - 更新因子权重显示：momentum=0.20, value=0.15, quality=0.15, growth=0.10, guru=0.15, institutional=0.25
  - 更新雷达图组件：新增第五个维度「法人动向」
  - 显示权重总和检查（应 = 1.0）
- [x] 后端 API 更新：
  - `GET /api/v1/strategy/config` 回传包含 `institutional` 权重
  - 更新 `DEFAULT_5FACTOR_WEIGHTS` 默认配置（API 使用 6 因子权重）
- [x] 表单验证：
  - 权重范围：0.0 ~ 1.0（前端滑块 range + step 控制）
  - 权重总和必须等于 1.0（autoRebalance 逻辑确保总和 = 100）
- [x] 单元测试：
  - 前端组件测试：11 项（颜色常数、FactorMiniBar 渲染、autoRebalance 权重计算）
  - 后端 API 测试：1 项（GET /api/v1/strategies/config 回传 institutional=0.25 与参数定义）
- [ ] E2E 测试：完整策略设定流程（需 Cypress/Playwright 等 E2E 框架，未实作）

## 备注
- 参考 Streamlit.md §2.6 六因子整合后的建议配比
- 需先完成 T126（法人动向因子实作）才能实作此任务
- 前端路径：`/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Strategy.jsx`
- 后端路径：`/Users/claw/Projects/tw-quant-selector/src/tw_quant_selector/api/app.py`
