#!/usr/bin/env python3
"""
Multi-AI Collaborative Discussion Script
用於規格書建立流程的多模型輪詢討論

Usage:
  python multi_ai_discuss.py --project tw-quant-signal --version v1.2 --rounds 3
  python multi_ai_discuss.py --project tw-quant-mcp --version v2.1 --only gemini,deepseek
  python multi_ai_discuss.py --project digital-twin --version v1.0 --manual grok
"""

import os
import sys
import json
import argparse
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

# 載入環境變數
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


@dataclass
class ModelConfig:
    name: str
    role: str
    api_env: str  # 環境變數名稱
    api_base: Optional[str] = None
    model_id: str = ""
    enabled: bool = True
    manual: bool = False  # True = 需人工操作


MODELS = [
    ModelConfig(
        name="claude",
        role="架構設計師",
        api_env="ANTHROPIC_API_KEY",
        api_base="https://api.anthropic.com",
        model_id="claude-3-5-sonnet-20241022",
    ),
    ModelConfig(
        name="gemini",
        role="細節工程師",
        api_env="GEMINI_API_KEY",
        api_base="https://generativelanguage.googleapis.com",
        model_id="gemini-1.5-pro",
    ),
    ModelConfig(
        name="deepseek",
        role="實作導向",
        api_env="DEEPSEEK_API_KEY",
        api_base="https://api.deepseek.com",
        model_id="deepseek-chat",
    ),
    ModelConfig(
        name="grok",
        role="批判性思考者",
        api_env="XAI_API_KEY",
        api_base="https://api.x.ai",
        model_id="grok-2",
        enabled=False,  # 預設關閉，需申請 API
        manual=True,
    ),
]


class AIClient:
    def __init__(self, config: ModelConfig):
        self.config = config
        self.api_key = os.getenv(config.api_env)
        self.history: List[Dict] = []

    async def call(self, messages: List[Dict], temperature: float = 0.3) -> str:
        if self.config.manual:
            return await self._manual_call(messages)

        if not self.api_key:
            raise ValueError(f"缺少 API Key: {self.config.api_env}")

        if self.config.name == "claude":
            return await self._call_anthropic(messages, temperature)
        elif self.config.name == "gemini":
            return await self._call_gemini(messages, temperature)
        elif self.config.name == "deepseek":
            return await self._call_openai_compatible(messages, temperature)
        elif self.config.name == "grok":
            return await self._call_openai_compatible(messages, temperature)
        else:
            raise ValueError(f"不支援的模型: {self.config.name}")

    async def _call_anthropic(self, messages: List[Dict], temperature: float) -> str:
        import httpx
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        # 轉換格式
        system = ""
        user_messages = []
        for m in messages:
            if m["role"] == "system":
                system = m["content"]
            else:
                user_messages.append(m)
        
        payload = {
            "model": self.config.model_id,
            "max_tokens": 8192,
            "temperature": temperature,
            "system": system,
            "messages": user_messages,
        }
        
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(f"{self.config.api_base}/v1/messages", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]

    async def _call_gemini(self, messages: List[Dict], temperature: float) -> str:
        import httpx
        # 轉換為 Gemini 格式
        contents = []
        system_instruction = ""
        for m in messages:
            if m["role"] == "system":
                system_instruction = m["content"]
            elif m["role"] == "user":
                contents.append({"role": "user", "parts": [{"text": m["content"]}]})
            elif m["role"] == "assistant":
                contents.append({"role": "model", "parts": [{"text": m["content"]}]})
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 8192,
            },
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        
        url = f"{self.config.api_base}/v1beta/models/{self.config.model_id}:generateContent?key={self.api_key}"
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def _call_openai_compatible(self, messages: List[Dict], temperature: float) -> str:
        import httpx
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.config.model_id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 8192,
        }
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(f"{self.config.api_base}/v1/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _manual_call(self, messages: List[Dict]) -> str:
        """人工模式：顯示提示詞，等待使用者貼上回覆"""
        print(f"\n{'='*60}")
        print(f"📋 人工模式：{self.config.name.upper()} ({self.config.role})")
        print(f"{'='*60}")
        print(f"請在瀏覽器開啟對應網站，貼上以下提示詞：")
        print(f"{'-'*60}")
        
        # 只顯示最後一條 user 訊息作為提示詞
        for m in reversed(messages):
            if m["role"] == "user":
                print(m["content"][:2000] + ("..." if len(m["content"]) > 2000 else ""))
                break
        
        print(f"{'-'*60}")
        print("請複製 AI 回覆，貼在這裡（輸入 END 結束）：")
        
        lines = []
        while True:
            try:
                line = input()
                if line.strip() == "END":
                    break
                lines.append(line)
            except EOFError:
                break
        
        return "\n".join(lines)


class DiscussionOrchestrator:
    def __init__(self, project: str, version: str, rounds: int = 3, only: Optional[List[str]] = None):
        self.project = project
        self.version = version
        self.rounds = rounds
        self.only = only
        
        # 路徑設定
        self.base_dir = Path.home() / "tasks" / project / "specs" / "ai-consultations" / f"v{version}"
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        # 初始化模型
        self.clients = {}
        for m in MODELS:
            if not m.enabled:
                continue
            if self.only and m.name not in self.only:
                continue
            self.clients[m.name] = AIClient(m)
        
        # 載入提示詞模板
        self.template_path = self.base_dir / "template-ai-consultation.md"
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        if self.template_path.exists():
            return self.template_path.read_text(encoding="utf-8")
        # 預設提示詞
        return f"""# {self.project} 規格書 v{self.version} 諮詢

你是一位資深工程師，請針對專案需求提供專業建議。
請輸出結構化 Markdown，包含架構建議、具體規格內容、風險與待決事項。"""

    def _build_messages(self, round_num: int, model_name: str, previous_outputs: Dict[str, str]) -> List[Dict]:
        messages = [
            {"role": "system", "content": self.system_prompt},
        ]
        
        if round_num == 0:
            # 第一輪：只給原始提示詞
            messages.append({"role": "user", "content": f"【第 1 輪】請依你的角色（{MODELS[[m.name for m in MODELS].index(model_name)].role}）給出初步建議。"})
        else:
            # 後續輪：包含前一輪所有模型的輸出
            context = f"【第 {round_num + 1} 輪】以下是上一輪各模型的輸出，請評論、補充或反駁：\n\n"
            for name, output in previous_outputs.items():
                role = MODELS[[m.name for m in MODELS].index(name)].role
                context += f"## {name.upper()} ({role})\n{output}\n\n"
            context += f"請以你的角色（{MODELS[[m.name for m in MODELS].index(model_name)].role}）回應，重點關注：\n"
            context += "1. 同意/不同意的觀點及理由\n"
            context += "2. 遺漏的風險或盲點\n"
            context += "3. 具體可落地的補充建議\n"
            messages.append({"role": "user", "content": context})
        
        return messages

    async def run(self) -> Dict[str, str]:
        """執行多輪討論，回傳最終各模型輸出"""
        print(f"🚀 開始多 AI 討論：{self.project} v{self.version}")
        print(f"   參與模型：{', '.join(self.clients.keys())}")
        print(f"   輪數：{self.rounds}")
        print(f"   輸出目錄：{self.base_dir}")
        
        all_outputs = {}  # {model_name: {round: output}}
        
        for round_num in range(self.rounds):
            print(f"\n{'='*60}")
            print(f"📍 第 {round_num + 1} 輪")
            print(f"{'='*60}")
            
            round_outputs = {}
            
            for name, client in self.clients.items():
                print(f"  🤖 諮詢 {name.upper()} ({client.config.role})...")
                
                # 建立訊息（包含前一輪輸出）
                prev = {n: all_outputs[n].get(round_num - 1, "") for n in self.clients.keys()} if round_num > 0 else {}
                messages = self._build_messages(round_num, name, prev)
                
                try:
                    output = await client.call(messages)
                    round_outputs[name] = output
                    
                    # 即時存檔
                    out_file = self.base_dir / f"{round_num + 1:02d}-{name}.md"
                    out_file.write_text(output, encoding="utf-8")
                    print(f"     ✅ 已存檔：{out_file.name} ({len(output)} 字元)")
                    
                except Exception as e:
                    print(f"     ❌ 失敗：{e}")
                    round_outputs[name] = f"# ERROR\n{str(e)}"
            
            all_outputs[round_num] = round_outputs
        
        # 產生總結
        await self._generate_summary(all_outputs)
        return all_outputs

    async def _generate_summary(self, all_outputs: Dict):
        """生成合併審查用的總結檔案"""
        # 最後一輪輸出
        last_round = self.rounds - 1
        summary = f"# 多 AI 討論總結 - {self.project} v{self.version}\n\n"
        summary += f"生成時間：{datetime.now().isoformat()}\n"
        summary += f"輪數：{self.rounds}\n\n"
        
        for name, client in self.clients.items():
            summary += f"## {name.upper()} ({client.config.role})\n\n"
            for r in range(self.rounds):
                output = all_outputs.get(r, {}).get(name, "")
                summary += f"### 第 {r + 1} 輪\n{output}\n\n"
            summary += "---\n\n"
        
        # 存總結
        summary_file = self.base_dir / "discussion-summary.md"
        summary_file.write_text(summary, encoding="utf-8")
        print(f"\n📄 總結已存檔：{summary_file}")
        
        # 生成給 /spec-merge 用的合併決策模板
        merge_template = self._generate_merge_template(all_outputs)
        merge_file = self.base_dir / "merge-decision-template.md"
        merge_file.write_text(merge_template, encoding="utf-8")
        print(f"📄 合併決策模板：{merge_file}")

    def _generate_merge_template(self, all_outputs: Dict) -> str:
        last = self.rounds - 1
        tmpl = f"# 合併決策記錄 - {self.project} v{self.version}\n\n"
        tmpl += f"> 由多 AI 討論總結自動生成，請人工填寫決策\n\n"
        tmpl += f"## 參與模型與輪數\n\n"
        for name, client in self.clients.items():
            tmpl += f"- **{name.upper()}** ({client.config.role})：{self.rounds} 輪\n"
        tmpl += f"\n## 逐輪關鍵觀點對照\n\n"
        
        # 簡單提取每輪前 500 字做對照
        for r in range(self.rounds):
            tmpl += f"### 第 {r + 1} 輪\n\n"
            for name in self.clients.keys():
                output = all_outputs.get(r, {}).get(name, "")
                preview = output[:500] + ("..." if len(output) > 500 else "")
                tmpl += f"#### {name.upper()}\n{preview}\n\n"
        
        tmpl += f"\n## 核心架構決策（請填寫）\n\n"
        tmpl += "| 決策項目 | 採用來源 | 決策理由 | 替代方案 |\n"
        tmpl += "|----------|----------|----------|----------|\n"
        tmpl += "| 整體架構 |          |          |          |\n"
        tmpl += "| 模組邊界 |          |          |          |\n"
        tmpl += "| API 設計 |          |          |          |\n"
        tmpl += "| 資料模型 |          |          |          |\n"
        
        tmpl += f"\n## 風險項目處理\n\n"
        tmpl += "| 風險 | 來源模型 | 最終版處理 |\n"
        tmpl += "|------|----------|------------|\n"
        
        return tmpl


async def main():
    parser = argparse.ArgumentParser(description="多 AI 協作討論")
    parser.add_argument("--project", help="專案名稱")
    parser.add_argument("--version", help="版本號（如 v1.2）")
    parser.add_argument("--rounds", type=int, default=3, help="討論輪數")
    parser.add_argument("--only", help="只啟用特定模型，逗號分隔（如 claude,gemini）")
    parser.add_argument("--list-models", action="store_true", help="列出可用模型與 API Key 狀態")
    
    args = parser.parse_args()
    
    if args.list_models:
        print("可用模型：")
        for m in MODELS:
            key = os.getenv(m.api_env)
            status = "✅" if key else ("⚠️ 手動" if m.manual else "❌ 無 Key")
            print(f"  {m.name:12} | {m.role:12} | {m.model_id:25} | {status}")
        return
    
    if not args.project or not args.version:
        parser.error("--project 和 --version 為必要參數（除非用 --list-models）")
    
    only = args.only.split(",") if args.only else None
    
    orchestrator = DiscussionOrchestrator(
        project=args.project,
        version=args.version,
        rounds=args.rounds,
        only=only,
    )
    
    if not orchestrator.clients:
        print("❌ 沒有可用的模型（請檢查 API Key 或用 --only 指定）")
        sys.exit(1)
    
    await orchestrator.run()
    print(f"\n✅ 完成！結果在：{orchestrator.base_dir}")


if __name__ == "__main__":
    asyncio.run(main())