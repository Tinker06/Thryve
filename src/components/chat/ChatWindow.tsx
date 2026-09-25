// src/components/chat/ChatWindow.tsx
import { useEffect, useRef, useState } from "react";
import ChatModeTabs from "./ChatModeTabs";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  type ChatMessageRow,
  type ChatMode,
} from "../../lib/chatClient";
import { askAI } from "../../lib/aiClient";

interface Props {
  projectId: string;
  currentUserId: string;
  currentUserName: string;
}

export default function ChatWindow({ projectId, currentUserId, currentUserName }: Props) {
  const [mode, setMode] = useState<ChatMode>("team_ai");
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const initial = await fetchMessages(projectId);
      setMessages(initial);
      unsubscribe = subscribeToMessages(projectId, (row) => {
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      });
    })();

    return () => unsubscribe?.();
  }, [projectId]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(text: string) {
    await sendMessage({
      project_id: projectId,
      sender_id: currentUserId,
      sender_name: currentUserName,
      mode,
      content: text,
    });

    if (mode === "ask_ai") {
      setAiThinking(true);
      const res = await askAI({ projectId, userId: currentUserId, message: text });
      setAiThinking(false);

      const replyText =
        res.success && res.data && "reply" in res.data
          ? (res.data as { reply: string }).reply
          : res.success
          ? `Stub response: ${JSON.stringify(res.data)}`
          : res.error || "AI temporarily unavailable.";

      await sendMessage({
        project_id: projectId,
        sender_id: "ai",
        sender_name: "Thryve AI",
        mode,
        content: replyText,
        is_ai: true,
      });
    }
  }

  const visibleMessages =
    mode === "team_only"
      ? messages.filter((m) => !m.is_ai)
      : messages;

  return (
    <div className="form-card">
      <ChatModeTabs mode={mode} onChange={setMode} />

      <div
        ref={boxRef}
        style={{
          height: 360,
          overflowY: "auto",
          border: "2px solid var(--ink)",
          padding: 10,
          background: "#fffdf2",
        }}
      >
        {visibleMessages.length === 0 && (
          <p style={{ opacity: 0.6, fontWeight: 700 }}>No messages yet. Say hello.</p>
        )}
        {visibleMessages.map((m) => (
          <ChatMessage key={m.id} message={m} currentUserId={currentUserId} />
        ))}
        {aiThinking && (
          <div style={{ fontWeight: 900, opacity: 0.7 }}>✦ Thryve AI is thinking...</div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={aiThinking} />
    </div>
  );
}