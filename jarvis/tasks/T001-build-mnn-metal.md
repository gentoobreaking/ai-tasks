---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/735
title: T001-建置MNN編譯環境（Metal 加速）
type: Feature
priority: high
status: done
assignee: 碼農1號 / 寶寶（代收尾）
created: 2026-05-13 
updated: 2026-05-13
---

# T001 - 建置 MNN 編譯環境（Metal 加速）

## Description

在 MacBook Air M2 (16GB RAM) 上編譯 Alibaba MNN 引擎，啟用 Metal（GPU）加速，
為後續 MNN-LLM 離線大腦模型執行奠定基礎。

## Acceptance Criteria

- [x] cmake + ninja 安裝成功
- [x] `libMNN.a` 編譯完成（7.2MB，含 Metal backend）
- [x] MNNConvert 工具編譯完成
- [x] `pip3 install MNN` ✅ MNN 3.5.0 安裝成功
- [x] `import MNN` ✅ 無錯誤
- [x] `from MNN.llm import create` ✅ API 可用
- [x] brain_engine.py 已實作（MNN.llm.create 封裝）
- [x] test_brain.py 已實作（5 項測試）
- [x] howto/build-mnn-metal.md 完整記錄

## Notes

- MNN 主倉庫：`alibaba/MNN`（非 tencent/MNN）
- pip 安裝（方法 A）比原始碼編譯（方法 B）更快速，選用 pip
- 模型存放路徑：`~/Projects/JARVIS-on-mac/models/`
- T002 接力：下載 MNN 量化模型（Qwen1.5-0.5B-Chat-MNN）
