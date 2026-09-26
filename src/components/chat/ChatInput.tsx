// src/components/chat/ChatInput.tsx
import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        disabled={disabled}
        style={{ boxShadow: "none" }}
      />
      <button className="btn pink" onClick={handleSend} disabled={disabled}>
        SEND
      </button>
    </div>
  );
}