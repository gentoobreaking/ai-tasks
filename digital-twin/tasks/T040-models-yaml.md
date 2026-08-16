---
github_issue: null
title: MODELS 模型清單改由 YAML 配置（.opencode/models.yaml）
type: feature
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-17'
spec_version: v3
---
# T040 - MODELS 模型清單 YAML 配置

## 目標
`config.py` 的 `MODELS`（nemotron/gemini/deepseek/grok 的角色、model_id、api_env、provider）目前寫死在程式。
仿照 T039 `.opencode/impl_providers.yaml` 模式，讓模型清單可由 YAML 配置（新增/停用模型不需改程式碼）。

## 驗收標準
- [x] 新增 `.opencode/models.yaml`：與程式碼內建清單等價的 4 個模型（nemotron/gemini/deepseek/grok，
      grok 維持 enabled=false + manual=true 語意），欄位含 name/role/api_env/model_id/api_base/provider/enabled/manual
- [x] `config.py`：YAML 存在時 `MODELS` 以 YAML 覆蓋（單一來源）；不存在/解析失敗退回內建清單（平滑升級）
- [x] 欄位容缺：name/role/api_env/model_id 必填，缺一即視為該筆無效；缺省欄位用內建預設
      （enabled=true、manual=false、provider=openai、api_base=""）
- [x] `./twin status` 與 `multi_ai_discuss.py --list-models` 無需改動即可反映 YAML 內容
- [x] 新增 `tests/test_models_yaml.py` 離線測試（建構函式直測，不動全域 import）：
      內建 fallback／YAML 覆蓋+disabled+缺欄位容缺／壞 YAML fallback
- [x] 全量 pytest 維持 128 passed + 1 skipped（+新增）；ruff check/format 全過
- [x] README §2 或 config 相關段落補「模型清單可經 .opencode/models.yaml 配置」

## 備註
- 可參考 T039 的 load_impl_providers 模式（yaml→list dict→ModelConfig；bad→fallback）
- YAML 採用「整份取代」而非 merge：檔案存在即為唯一事實來源（文件內註明）
- 不得改動其他模組的引用（MODELS/get_model/MODEL_NAMES 名稱不變）
---

## 驗證結果（2026-08-09）
- `.opencode/models.yaml` 4 模型與內建等價（grok 維持 enabled=false+manual=true）
- `./twin status` 與 `--list-models` 輸出不變（YAML 已生效）
- `tests/test_models_yaml.py` 6 passed：fallback／覆蓋+disabled+缺省／缺必填跳過／壞 YAML／空清單／repo YAML 等價
- 全量 pytest：134 passed + 1 skipped（128 → 134）；ruff check/format 全過
- 程式碼 commit：`3f5e4b8`