對，我反而**非常同意你這個方向**。

如果我們的目標是驗證：

> **「Agent Control Plane + Research + Policy + Verification，是否真的能讓本地 7B/9B 做到原本做不到的 Coding？」**

那麼 **Cloud Mode 在 benchmark 階段應該拔掉。**

否則很容易得到一個假象：

```text
Local 9B
   ↓
失敗
   ↓
Cloud
   ↓
成功
```

最後你根本不知道成功是因為：

* Control Plane 做得好
* Research 做得好
* Policy 做得好
* Reflection 做得好

還是單純：

> **Cloud LLM 太強。**

---

# 我會把它拆成兩個模式

## ① Research / Architecture Validation Mode

**完全禁止 Cloud。**

```text
                    User
                      │
                      ▼
               Control Plane
                      │
               Research Engine
                      │
                Evidence Gate
                      │
                      ▼
                Worker Router
                      │
                      ▼
                  Pi Worker
                      │
                      ▼
                   Local 9B
                      │
                      ▼
                Verification
                      │
              ┌───────┴───────┐
              ▼               ▼
            PASS             FAIL
              │               │
              ▼               ▼
            DONE          Reflection
                              │
                       ┌──────┴──────┐
                       ▼             ▼
                    Research       Retry
                       │             │
                       └──────┬──────┘
                              ▼
                         Local 9B
                              │
                         FAIL AGAIN
                              │
                              ▼
                           FAILED
```

**沒有 Cloud。**

這樣才是真正的壓力測試。

---

# ② Production Mode

驗證完第一階段後，才打開：

```text
Cloud Escalation
```

變成：

```text
Local 9B
   ↓
Research
   ↓
Coding
   ↓
Verification
   ↓
FAIL
   ↓
Reflection
   ↓
Retry
   ↓
FAIL
   ↓
Cloud
```

所以 Cloud 是：

> **Production fallback**

而不是：

> **Architecture validation component**

---

# 更重要的是：要做 A/B Test

這其實會讓你的專案變得非常有意思。

我們可以建立四組：

| Experiment | Model  | Research | Control Plane |
| ---------- | ------ | -------- | ------------- |
| A          | 9B     | ❌        | ❌             |
| B          | 9B     | ✅        | ❌             |
| C          | 9B     | ❌        | ✅             |
| **D**      | **9B** | **✅**    | **✅**         |

然後比較：

```text
                 Coding Success Rate
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Model         Research      Control
       baseline       gain          gain
```

真正重要的是：

> **D 相對 A 到底提升多少？**

---

# 更進一步，可以拆成 6 組

我甚至會建議 benchmark 做：

```text
A = 9B
B = 9B + Research
C = 9B + Policy
D = 9B + Verification
E = 9B + Research + Verification
F = 9B + Research + Policy + Verification
```

最後才是：

```text
G = 9B + Full Control Plane
```

這樣你可以知道每個 component 的 marginal gain。

例如假設結果：

```text
A  42%
B  61%
C  48%
D  57%
E  72%
F  81%
G  87%
```

那你就可以非常清楚知道：

> Research 是主要增益來源。

或者可能得到：

```text
A  42%
B  55%
C  70%
D  58%
E  73%
F  86%
G  90%
```

那代表：

> **Policy / Control 才是關鍵。**

這才是你這個架構真正值得研究的地方。

---

# 而且有一個更重要的實驗

你前面一直在問：

> **7B/9B + Research 是否可以取代一部分大模型？**

這就可以直接測。

建立：

```text
Baseline

Claude / GPT
     ↓
Coding
```

對比：

```text
Experimental

9B
 ↓
Research
 ↓
Evidence
 ↓
Policy
 ↓
Coding
 ↓
Verification
 ↓
Reflection
```

最後比較：

| Metric               | Cloud LLM | 9B + ACP |
| -------------------- | --------: | -------: |
| Task success         |         ? |        ? |
| First-pass success   |         ? |        ? |
| Retry count          |         ? |        ? |
| Hallucinated API     |         ? |        ? |
| Tests passing        |         ? |        ? |
| Unauthorized changes |         ? |        ? |
| Token usage          |         ? |        ? |
| Latency              |         ? |        ? |
| Cloud dependency     |      100% |       0% |

這才是非常有價值的實驗。

---

# 甚至我會把 Cloud Worker 從 v0.2 拿掉

如果是**開發順序**，我會修改上一版規格。

原本：

```text
Phase 1
Pi

Phase 2
Research

Phase 3
MCP

Phase 4
Cloud escalation
```

我現在會改成：

```text
Phase 1
Pi + Local Model

Phase 2
Policy + Artifact + Verification

Phase 3
Research + Evidence Gate

Phase 4
Reflection + Retry

Phase 5
Benchmark

──────────────
Architecture Validation
──────────────

Phase 6
ACP

Phase 7
MCP

Phase 8
Multi Worker

Phase 9
Cloud Escalation
```

也就是：

> **先證明「這個架構本身有效」，再增加 Cloud。**

---

# 這會產生一個很漂亮的架構

第一階段：

```text
┌─────────────────────────────────────┐
│         Agent Control Plane         │
│                                     │
│  Policy                             │
│  Research                           │
│  Evidence                           │
│  Artifact                           │
│  Verification                       │
│  Reflection                         │
│                                     │
└─────────────────┬───────────────────┘
                  │
                  ▼
             Pi + 9B
                  │
                  ▼
             Verification
                  │
             ┌────┴────┐
             ▼         ▼
           PASS       FAIL
             │         │
             ▼         ▼
           DONE      Retry
```

**這個就是你的真正研究對象。**

Cloud 根本不在圖裡。

---

# 然後第二階段才變成

```text
                    Control Plane
                         │
                         ▼
                  Local 9B / Pi
                         │
                    Verification
                         │
                       FAIL
                         │
                    Reflection
                         │
                    ┌────┴────┐
                    ▼         ▼
                 Retry     Research
                    │         │
                    └────┬────┘
                         ▼
                    Local 9B
                         │
                       FAIL
                         │
                         ▼
                 ┌──────────────┐
                 │ Cloud Worker │
                 └──────────────┘
```

這時 Cloud 才是**可插拔的 escalation provider**。

---

## 所以你的想法其實比我上一版更合理

我上一版把：

> **「怎麼做成 production system」**

跟：

> **「怎麼驗證這個 architecture 到底有沒有價值」**

混在一起了。

你現在指出的這個問題非常關鍵。

### 正確的研發順序應該是：

**先把 Cloud 拔掉 → 用 7B/9B 壓力測試 Control Plane → 做嚴格 A/B benchmark → 證明 Research / Policy / Verification / Reflection 的增益 → 最後才接 Cloud。**

而且這樣還有一個額外好處：

**如果最後發現 9B + Control Plane 已經能處理 70～80% 的 coding task，那 Cloud 的角色就真的只剩下「少數高難度任務的 escalation」，而不是整個系統的核心。**

這其實才是你最初提出這個架構時，最值得驗證的假設。

