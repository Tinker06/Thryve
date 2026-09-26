import { useRef, useState } from "react";
import { askAI } from "../../lib/aiClient";
import type { ChatMessageData, ChatMode } from "../../lib/uiTypes";

interface ChatWidgetProps {
  userId: string | null;
  projectId: string;
  myDisplayName: string;
}

const initialMessages: ChatMessageData[] = [
  { id: "m1", author: "Thryve", body: "I noticed Meena and Arun are discussing the same API topic. I can suggest a peer-learning activity.", kind: "ai" },
  { id: "m2", author: "Arun", body: "I can explain the frontend → API contract.", kind: "team" },
];

export default function ChatWidget({ userId, projectId, myDisplayName }: ChatWidgetProps) {
  const [mode, setMode] = useState<ChatMode>("all");
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }

  async function sendMessage() {
    if (!draft.trim() || aiThinking) return;
    const messageText = draft;
    const mine: ChatMessageData = { id: crypto.randomUUID(), author: myDisplayName, body: messageText, kind: "me" };
    setMessages((prev) => [...prev, mine]);
    setDraft("");
    scrollToBottom();

    if (mode === "team") {
      // TODO: send to Person 1's chat_messages table via Supabase Realtime.
      // Plain CRUD — goes straight to Supabase, never through aiClient.
      return;
    }

    if (!userId) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), author: "Thryve", body: "Log in to ask AI.", kind: "ai" },
      ]);
      return;
    }

    setAiThinking(true);
    try {
      const result = await askAI({ projectId, userId, message: messageText });

      const replyBody = result.success && result.data
        ? result.data.reply
        : result.error ?? "AI temporarily unavailable.";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), author: "Thryve", body: replyBody, kind: "ai" },
      ]);
    } finally {
      setAiThinking(false);
      scrollToBottom();
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
        {aiThinking && <div className="msg ai">✦ <b>Thryve:</b> thinking…</div>}
      </div>

      <div className="chatinput">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Message your team or ask AI..."
          disabled={aiThinking}
        />
        <button className="btn" onClick={sendMessage} disabled={aiThinking}>SEND</button>
      </div>

      <div className="notice blue">
        Chat signals can be used by AI to prepare a <b>detailed sprint suggestion</b>.
        It will only change the sprint after the user approves the notification.
      </div>
    </div>
  );
}