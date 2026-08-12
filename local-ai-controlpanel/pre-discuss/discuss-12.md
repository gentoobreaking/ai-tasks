以我看完整串文件（14 份討論 + 4 版 spec）的立場，我的總評是：**這是目前為止我看過最「科學化」的 Coding Agent 計畫之一——核心假設清楚、有可證偽的 benchmark 設計、版本演進也很克制（尤其 v0.3 把 Cloud 拔掉這個決策非常關鍵）。但最大的風險不是架構，而是「規格已經 4 版了，code 一行都還沒有」。**

## 做得對的地方

1. **假設正確且可測量**：「先限制模型，再測系統」——不去強化模型，而是驗證 system-level intelligence。這個 framing 讓整個專案的價值不依賴模型進步。
2. **v0.3 拔掉 Cloud 是關鍵決策**：不拔 Cloud 的話，實驗永遠無法分辨成果來自 Control Plane 還是 Cloud 比較強。而且你設了 rigid gate（CP Gain ≥ +15pp 才開 v0.4），這份自制力很少見。
3. **A–G / H–K 的拆組設計**：可以算每個 component 的 marginal gain，未來做 policy 調參時有數據依據。
4. **架構邊界清楚**：LLM ≠ Policy、Evidence Gate、Artifact Lock、Rule 1–7。這些比「加一個 system prompt」可靠得多。

## 我的主要建議

**1. 現在立刻停止寫 spec，開始寫 Phase 1 code。**
這是最大的風險：spec 越多版、越多「已決定事項」，實際開工時遇到的 reality check 就越多（Pi 的實際行為、9B 的實際品質、Research 的實際延遲）。規格內容已經足夠支撐 Phase 1–2 開工。建議 1–2 天內做出第一個端到端 slice：`Task → Policy(researchRequired) → Research → Evidence → Pi+9B → Patch → pytest`。

**2. Research Engine 第一版先用「本地文件/靜態 corpus」，不要先接 web search。**
Web search 是整條 pipeline 最不可靠、最慢、最容易在 M2 上翻車的元件（rate limit、延遲、HTML parsing）。先用 repository + 本地 docs + git history 證明 Evidence Gate 的價值，再開 web——這樣離線也能開發，也更容易 debug。

**3. spec 缺一個重要欄位：Evidence Bundle 的 token/context 預算。**
7B/9B 的 context window 有限（16GB 記憶體下的 KV cache 也很吃緊）。目前 spec 沒有定義「evidence 超過多少 token 要摘要/截斷/過濾」，實作時會爆 context。建議在 Evidence Builder 加 `max_tokens` budget + 按 relevance 截斷的政策。

**4. 定義「hallucination rate」的評判人與 rubric。**
`invalid_claims / total_claims` 誰來判定？如果又是 LLM 判定，就有循環驗證的 bias。建議：**task 本身用 binary 結果（pytest 過/不過）當 ground truth**，hallucination 由「verification output 裡的 error 是否指向不存在的 API/欄位」來自動歸類，盡量不要人評。

**5. 補上 fallback 政策。**
如果 research 失敗（網路不通、官方文件 404、2 個 source 都拿不到）時 Evidence Gate 該怎麼走？現在只有 PASS / RESEARCH_AGAIN / BLOCK，但 BLOCK 之後是 ask_user 還是降級放行？建議加「評估失敗時的降級路徑」，否則離線時整條 pipeline 會卡死。

**6. 第一個 benchmark 的 50 tasks 幾乎都是「你自己出題」——這有自證 bias 的風險。**
建議至少拿 10~15 個現成標準題（例如 SWE-bench 簡化子集、或你實際 repo 裡的 bug fix）當 external validation，證明你的題目不是你會做的題目。

**7. 驗證環境的 sandbox 要第一天就做。**
`shell: sandbox: true` 聽起來簡單，但 shell tool 的 sandbox 實作起來是 hell。建議 test/build 全部放 Docker（spec 已寫了 docker 目錄），從 Phase 1 就養成習慣，不要先住 host 再「之後搬」。

**整體結論**：方向我非常支持，這比「再做一個 coding agent」有價值得多。目前計畫唯一的弱點是 execution——規格的決策品質很高，現在缺的是讓數據開始推翻或支持這些決策。等你 Phase 1 跑出第一批 A vs G 的數據，整個專案的下一步才會真正清楚。
