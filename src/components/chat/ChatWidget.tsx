import { useRef, useState } from "react";
import type { ChatMessageData, ChatMode } from "../../lib/types";

const initialMessages: ChatMessageData[] = [
  { id: "m1", author: "Thryve", body: "I noticed Meena and Arun are discussing the same API topic. I can suggest a peer-learning activity.", kind: "ai" },
  { id: "m2", author: "Arun", body: "I can explain the frontend → API contract.", kind: "team" },
  { id: "m3", author: "Priya", body: "Yes, schedule 15 minutes before the next sprint.", kind: "me" },
];

export default function ChatWidget() {
  const [mode, setMode] = useState<ChatMode>("all");
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }

  async function sendMessage() {
    if (!draft.trim()) return;
    const mine: ChatMessageData = { id: crypto.randomUUID(), author: "Priya", body: draft, kind: "me" };
    setMessages((prev) => [...prev, mine]);
    setDraft("");
    scrollToBottom();

    // TODO: replace with Person 3's askAI() when mode === "ai", or
    // Person 1's Supabase Realtime send when mode === "team"/"all"
    if (mode !== "team") {
      setTimeout(() => {
        const aiReply: ChatMessageData = {
          id: crypto.randomUUID(),
          author: "Thryve",
          body: "I'll analyze this against authorized project chat, tasks and shared documents. I can draft a collaboration suggestion without changing your sprint automatically.",
          kind: "ai",
        };
        setMessages((prev) => [...prev, aiReply]);
        scrollToBottom();
      }, 450);
    }
  }

  return (
    <div className="panel chatbox">
      <h3>TEAM + AI CHAT</h3>
      <div className="tabs">
        <button className={mode === "all" ? "active" : ""} onClick={() => setMode("all")}>TEAM + AI</button>
        <button className={mode === "ai" ? "active" : ""} onClick={() => setMode("ai")}>ASK AI</button>
        <button className={mode === "team" ? "active" : ""} onClick={() => setMode("team")}>TEAM ONLY</button>
      </div>

      <div className="messages" ref={listRef}>
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.kind}`}>
            {m.kind === "ai" && "✦ "}<b>{m.author}:</b> {m.body}
          </div>
        ))}
      </div>

      <div className="chatinput">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Message your team or ask AI..."
        />
        <button className="btn" onClick={sendMessage}>SEND</button>
      </div>

      <div className="notice blue">
        Chat signals can be used by AI to prepare a <b>detailed sprint suggestion</b>.
        It will only change the sprint after the user approves the notification.
      </div>
    </div>
  );
}