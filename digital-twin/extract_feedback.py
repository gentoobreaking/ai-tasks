#!/usr/bin/env python3
"""
Extract OpenCode session conversations for feedback mining.
Usage: python extract_sessions.py [--days 7] [--session-id SES_ID] [--output feedback_raw.md]
       python extract_sessions.py --only-corrections --days 7
"""

import sqlite3
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path.home() / ".local/share/opencode/opencode.db"

def extract_sessions(days: int = 7, session_id: str | None = None) -> list[dict]:
    cutoff = int((datetime.now() - timedelta(days=days)).timestamp() * 1000)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    if session_id:
        sessions = conn.execute(
            "SELECT * FROM session WHERE id = ?", (session_id,)
        ).fetchall()
    else:
        sessions = conn.execute(
            "SELECT * FROM session WHERE time_created > ? ORDER BY time_created DESC", (cutoff,)
        ).fetchall()
    
    result = []
    for s in sessions:
        # Get messages with parts joined
        rows = conn.execute("""
            SELECT m.data as msg_data, p.data as part_data, p.time_created as part_time
            FROM message m
            LEFT JOIN part p ON p.message_id = m.id
            WHERE m.session_id = ?
            ORDER BY m.time_created, p.time_created
        """, (s["id"],)).fetchall()
        
        conversation = []
        for r in rows:
            if not r["part_data"]:
                continue
            try:
                msg_data = json.loads(r["msg_data"])
                part_data = json.loads(r["part_data"])
            except:
                continue
            
            role = msg_data.get("role", "unknown")  # 'user' or 'assistant'
            if part_data.get("type") == "text" and "text" in part_data:
                conversation.append({
                    "role": role,
                    "text": part_data["text"],
                    "time": r["part_time"]
                })
            elif part_data.get("type") == "tool":
                conversation.append({
                    "role": "action",
                    "tool": part_data.get("tool"),
                    "time": r["part_time"]
                })
            elif part_data.get("type") == "reasoning":
                conversation.append({
                    "role": "reasoning",
                    "text": part_data.get("text", "")[:200],
                    "time": r["part_time"]
                })
        
        result.append({
            "id": s["id"],
            "title": s["title"],
            "directory": s["directory"],
            "agent": s["agent"],
            "time": datetime.fromtimestamp(s["time_created"] / 1000).isoformat(),
            "conversation": conversation
        })
    return result


def format_for_review(sessions: list[dict]) -> str:
    lines = ["# OpenCode Session Export for Feedback Mining\n"]
    for s in sessions:
        lines.append(f"## Session: {s['title']} (`{s['id']}`)")
        lines.append(f"- **Directory**: {s['directory']}")
        lines.append(f"- **Agent**: {s['agent'] or 'default'}")
        lines.append(f"- **Time**: {s['time']}")
        lines.append("")
        for msg in s["conversation"]:
            if msg["role"] == "user":
                lines.append(f"> **User**: {msg['text'][:500]}{'...' if len(msg['text']) > 500 else ''}")
            elif msg["role"] == "assistant":
                lines.append(f"**Assistant**: {msg['text'][:300]}{'...' if len(msg['text']) > 300 else ''}")
            elif msg["role"] == "action":
                lines.append(f"*[Action: {msg['tool']}]*")
            elif msg["role"] == "reasoning":
                lines.append(f"*[Reasoning]: {msg['text']}*")
        lines.append("\n---\n")
    return "\n".join(lines)


def find_correction_points(sessions: list[dict]) -> list[dict]:
    """
    Find user messages that are likely corrections:
    - Right after an assistant message
    - Contains correction keywords OR user provides corrected content
    - Not just follow-up questions
    """
    correction_keywords = [
        "錯", "不對", "改成", "修正", "調整", "重寫", "換成", "不要用", "應該是",
        "修改", "更改", "改為", "修復", "fix", "change", "wrong", "incorrect"
    ]
    question_patterns = ["怎麼", "如何", "什麼", "為什麼", "?", "？", "建議", "想法"]
    # Patterns that are my standard workflow prompts, not corrections
    workflow_patterns = [
        "參照 ~/tasks/", "開始實作", "程式碼產生的專案路徑", "開發相關文件的路徑",
        "並進行驗收", "更新任務書", "驗收完成後", "將 任務完成摘要"
    ]
    
    corrections = []
    for s in sessions:
        conv = s["conversation"]
        for i in range(1, len(conv)):
            if conv[i]["role"] == "user" and conv[i-1]["role"] == "assistant":
                text = conv[i]["text"]
                # Skip pure questions
                if any(q in text for q in question_patterns) and len(text) < 100:
                    continue
                # Skip standard workflow prompts
                if any(w in text for w in workflow_patterns):
                    continue
                # Must have correction keyword OR be substantial corrected content
                has_keyword = any(kw in text for kw in correction_keywords)
                is_substantial = len(text) > 100
                if has_keyword or is_substantial:
                    corrections.append({
                        "session_id": s["id"],
                        "session_title": s["title"],
                        "assistant_before": conv[i-1]["text"][:400],
                        "user_correction": text,
                        "time": datetime.fromtimestamp(conv[i]["time"] / 1000).isoformat()
                    })
    return corrections


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=7, help="Look back N days")
    parser.add_argument("--session-id", help="Specific session ID")
    parser.add_argument("--output", default="feedback_raw.md", help="Output file")
    parser.add_argument("--only-corrections", action="store_true", help="Only show potential corrections")
    parser.add_argument("--min-length", type=int, default=10, help="Min correction length")
    parser.add_argument("--max-length", type=int, default=300, help="Max correction length")
    args = parser.parse_args()

    sessions = extract_sessions(args.days, args.session_id)
    
    if args.only_corrections:
        corrections = find_correction_points(sessions)
        # Filter by length
        corrections = [c for c in corrections if args.min_length <= len(c["user_correction"]) <= args.max_length]
        
        out = ["# Potential Correction Points (Feedback Candidates)\n"]
        for c in corrections:
            out.append(f"## Session: {c['session_title']} (`{c['session_id'][:12]}...`)")
            out.append(f"**Time**: {c['time']}")
            out.append(f"**Assistant said**: {c['assistant_before']}")
            out.append(f"**You corrected**: {c['user_correction']}")
            out.append("\n---\n")
        content = "\n".join(out)
        print(f"Found {len(corrections)} potential correction points")
    else:
        content = format_for_review(sessions)
        print(f"Exported {len(sessions)} sessions")
    
    Path(args.output).write_text(content, encoding="utf-8")
    print(f"Written to {args.output}")


if __name__ == "__main__":
    main()