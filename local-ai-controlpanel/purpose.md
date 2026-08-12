觀察到的現象:
人類工程師遇到不確定的 API / library / framework 行為，通常會先查文件；LLM 卻常
常直接開始寫。

目前多數 Coding Agent 的 decision policy 並沒有把「外部知識驗證」設成寫程式前的
強制步驟。

目的：

條件：
1. Coding Agent 在開始修改程式碼之前，先強制做外部知識驗證；驗證完成後才允許進入 implementation
2. 像 Pi 一樣，把 Coding Agent 當成可嵌入、可擴充的 execution runtime，然後由外
部 Control Plane 接管 policy/research
3. 真正有價值的是把 **「知識取得、驗證、記憶、工具操作、流程控制」從 LLM 裡抽離
出來
。**
4. 目標是驗證：

「Agent Control Plane + Research + Policy + Verification，是否真的能讓本地 7B/9B 做到原本做不到的 Coding？」
