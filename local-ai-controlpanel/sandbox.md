將 shuru (MicroVM 方案) 與傳統 AI Agent 社群常使用的 OpenCode Sandbox 方案 (Linux 的 bwrap + macOS 的 sandbox-exec profile) 進行對比，兩者在架構底層、安全隔離級別、效能以及資源消耗上存在非常顯著的差異。
簡單來說：shuru 是虛擬化隔離（虛擬機），而 bwrap/sandbox-exec 是作業系統級隔離（沙盒/容器）。 [1, 2] 
以下為兩者的詳細對比及效能分析：
## 核心架構對比

| 比較維度 | SuperHQ shuru | OpenCode Sandbox 作法 |
|---|---|---|
| 隔離技術 | 輕量化虛擬機 (MicroVM) | 核心級命名空間 / 策略沙盒 (Kernel-level Namespace / MAC) |
| 底層技術 | 本地輕量化虛擬化引擎 | Linux: bwrap (Bubblewrap) macOS: sandbox-exec (SB Profile) |
| 作業系統核心 | 獨立核心（VM 內有自己的獨立 Guest Kernel） | 共享宿主機核心（與本機共用同一個作業系統核心） |
| 安全隔離級別 | 極高。即使 Agent 觸發了核心漏洞（Kernel Exploit），也只能危害虛擬機內部。 | 中高。仰賴宿主機的限制。若 Agent 找到核心提權漏洞，有機會逃逸。 |
| 功能特性 | 支援完整的 快照狀態保存與恢復 (Checkpoint/Restore)。 | 無原生的狀態快照功能，僅能透過目錄掛載同步。 |

------------------------------
## 效能及資源消耗比較## 1. 啟動速度與延遲 (Startup Latency)

* bwrap + sandbox-exec 👑 勝出：由於它們只是利用作業系統現有的系統呼叫（System Calls）來建立進程隔離（Process Isolation），啟動時間幾乎是零延遲（通常在 10 毫秒以內），與直接在本機執行進程的速度相同。
* shuru：雖然 MicroVM 經過了極致最佳化，但它仍然需要載入一個微型核心並初始化虛擬硬體。啟動時間大約在 100 - 500 毫秒 之間。對於高頻率反覆啟動、關閉的暫時性任務，shuru 會帶來微小的感官延遲。

## 2. CPU 與記憶體消耗 (Resource Consumption)

* bwrap + sandbox-exec 👑 勝出：
* 記憶體：接近 0 MB 的額外開銷。Agent 程式用多少，沙盒就佔多少。
   * CPU：無額外虛擬化損耗。指令是直接在宿主機 CPU 上原生執行，執行運算密集型任務（如本地編譯、複雜腳本）時效能為 100%。
* shuru：
* 記憶體：每個運行的沙盒都需要固定的基本記憶體開銷（通常每個 VM 預設分配 1GB~2GB，底層虛擬化本身佔用數十 MB 的管理記憶體）。如果同時開 5 個 Agent 任務，記憶體開銷會成倍增加。
   * CPU：存在極輕微的虛擬化損耗（VT-x / AMD-V 硬體加速後損耗小於 3~5%），但在大量的 I/O 操作或網路中介時，CPU 的上下文切換（Context Switch）開銷會高於原生沙盒。 [3] 

## 3. 磁碟與檔案系統 I/O 效能 (Storage & I/O)

* bwrap + sandbox-exec 👑 勝出：採用 Bind Mount（目錄掛載）方式將專案目錄對應進去。Agent 對檔案的讀寫就是對宿主機檔案系統的直接讀寫，效能達 100%。 [4] 
* shuru：虛擬機通常需要維護一個虛擬磁碟映像檔（如 qcow2 或 raw 格式）。雖然 shuru 支援目錄掛載，但跨越「宿主機 ↔ 虛擬機」邊界的檔案共享檔案系統（如 9p 或 virtio-fs）在面對小檔案密集讀寫（例如 npm install 建立數萬個節點）時，效能會明顯下降，CPU 消耗也會隨之飆高。 [5] 

------------------------------
## 總結與選型建議

* 何時該用 OpenCode 的 bwrap / sandbox-exec 作法？
如果您追求極致的效能、低延遲、極低的記憶體佔用，且您對 Agent 的安全性信任度較高（例如只是幫忙寫寫網頁、處理文字），傳統的作業系統級沙盒是最佳選擇。它可以在 8GB 記憶體的 Mac 或 Linux 上輕鬆跑起多個 Agent 而不卡頓。 [4, 6] 
* 何時該用 SuperHQ shuru？
如果您需要絕對的安全防護（例如 Agent 需要執行來自網路、未知第三方的程式碼，或需要安裝可能包含惡意後門的套件），或者您需要進階的 AI 工作流功能（例如：Agent 執行到一半，你希望將當前的環境「存檔/快照 Checkpoint」，以便下次一鍵還原到一模一樣的狀態），此時犧牲一點效能和記憶體換取 shuru 的 MicroVM 架構是非常值得的。 [1, 5] 

如果您想進一步評估，可以告訴我：

* 您主要是在 macOS 還是 Linux 環境運行？
* 您的 AI Agent 通常需要執行哪些任務類型（例如：單純文字編輯、跑 Python 數據分析，還是安裝大量 npm 第三方套件）？
我可以為您評估 I/O 損耗對您實際工作流的影響。


[1] [https://github.com](https://github.com/superhq-ai/shuru)
[2] [https://github.com](https://github.com/anthropic-experimental/sandbox-runtime)
[3] [https://docs.docker.com](https://docs.docker.com/reference/cli/sbx/create/opencode/)
[4] [https://github.com](https://github.com/didvc/opencode-bwrap)
[5] https://shuru.run
[6] [https://blog.gslin.org](https://blog.gslin.org/archives/2026/03/07/12921/macos-%E4%B8%8A%E7%94%A8-sandbox-exec-%E9%9A%94%E9%9B%A2/)

-----
=> bwrap + sandbox-exec 和 SuperHQ shuru 可以在 Phase 2 作成 sandbox可以切換的模式麼？
