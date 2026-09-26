// src/components/chat/ChatMessage.tsx
import type { ChatMessageRow } from "../../lib/chatClient";

interface Props {
  message: ChatMessageRow;
  currentUserId: string;
}

export default function ChatMessage({ message, currentUserId }: Props) {
  const isMe = message.sender_id === currentUserId && !message.is_ai;
  const background = message.is_ai ? "#72cfc0" : isMe ? "#f7a7d6" : "#f7dd58";

  return (
    <div
      style={{
        padding: "8px 10px",
        border: "2px solid var(--ink)",
        margin: "8px 0",
        maxWidth: "88%",
        fontSize: 13,
        fontWeight: 700,
        background,
        marginLeft: isMe ? "auto" : 0,
      }}
    >
      <b>{message.is_ai ? "✦ Thryve AI" : message.sender_name}:</b> {message.content}
    </div>
  );
}