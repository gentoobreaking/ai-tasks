---
github_issue: N/A
title: sentinel-gen——LLM 協作產生/審查/驗證定義檔的 CLI（Go）
type: feat
priority: medium
status: done
depends_on:
- T031-sentinel-ui-human-readable-columns
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26

---

# T036 - sentinel-gen：AI 協作產生/審查/驗證定義檔

## 背景
definitions-guide §9 已提供「生成／審查」雙 prompt，但流程靠人手動貼。
本任務把它固化為 Go CLI——與 sentinel 同倉同語言，直接重用
capacity.LoadDefs / spec.Load / catalog.Loader 三個既有解析器當驗證器。

## 目標
新 binary `cmd/sentinel-gen`，三個子命令：

```
sentinel-gen generate -kind capacity -desc "…" [-out f.yaml]
    → 呼叫 OpenAI 相容 LLM，內嵌 schema 契約 prompt，輸出候選 YAML
sentinel-gen review -file x.yaml [-prom http://…] 
    → 三層審查：
      ① 靜態 schema 驗證（重用 LoadDefs/spec.Load/catalog.Loader）
      ② live 驗證（-prom 時）：每條 expr 打 Prometheus，確認回傳
         instant vector 而非 scalar（攔截 time() 類陷阱）、序列存在
      ③ LLM 審查（已設定端點時）：第二意見，輸出 PASS/NEEDS FIX 列表
sentinel-gen verify -file x.yaml -prom http://…
    → 套用前最終關卡：靜態層必須先 PASS，再對每條 expr 打「真實」
      Prometheus——確認回傳 resultType=vector（非 scalar）、樣本數 > 0；
      capacity 另檢查 ceiling/value 查詢都成功。全部通過輸出
      READY TO APPLY（exit 0），任何一項失敗列出問題並 exit 1。
      讓「產生的 rules 確實可以直接套用」成為可機器判定的結論。
sentinel-gen fix -file x.yaml
    → review 發現問題 → 連同問題列表回餵 LLM 修一版（最多 N 輪）
```

## 環境變數
| 變數 | 用途 |
|---|---|
| `GEN_LLM_URL` | OpenAI 相容 base_url（如 http://127.0.0.1:11434/v1）；未設定時 generate/LLM 審查停用，review 仍可跑靜態+live |
| `GEN_LLM_KEY` / `GEN_LLM_MODEL` | API key / model 名 |

## 實作要點
1. LLM client 最小實作（chat/completions），不引 SDK
2. 契約 prompt 內嵌於程式（精簡版 definitions-guide），
   生成輸出以 ```yaml 圍欄抽取
3. review 的三層各自獨立回報；任何一層 FAIL → exit 1（可接 CI gate，
   銜接 T019 freeze/enforce 的未來整合點）
4. waste 家族驗證走 temp dir + catalog.Loader（重用隔離/分類邏輯）

## 驗收標準
- [x] generate：fake LLM server 下能產出檔案並正確抽取 yaml 圍欄內容
- [x] review 靜態層：缺 id、objective 超界、thresholds 非法組合三種壞檔逐一被攔截且訊息指名原因（capacity/slo/waste 三家族各有測試）
- [x] review live 層：httptest 假 Prometheus 回 scalar 形狀 → 攔截報錯；vector → 通過
- [x] fix 迴圈：fake LLM 第一輪輸出壞檔、第二輪輸出好檔 → 最終 review PASS、exit 0
- [x] GEN_LLM_URL 未設定時 generate 明確報錯提示；review 靜態/live 層照常運作
- [x] verify：假 Prometheus 分別回 scalar／空 vector／正常 vector 三種形狀，
      斷言僅第三種通過且輸出 READY TO APPLY
- [x] Makefile build 加入 sentinel-gen

## 備註
- 不做 daemon 化、不做互動式問答——單發 CLI，接 CI 或人工皆宜
- 修復迴圈上限 3 輪（對齊 ai-oncall core T009 的 repair 迴圈哲學）
