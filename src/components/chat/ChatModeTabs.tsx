// src/components/chat/ChatModeTabs.tsx

export type ChatMode = "team_ai" | "ask_ai" | "team_only";

interface ChatModeTabsProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

const TABS: { value: ChatMode; label: string }[] = [
  { value: "team_ai", label: "TEAM + AI" },
  { value: "ask_ai", label: "ASK AI" },
  { value: "team_only", label: "TEAM ONLY" },
];

export default function ChatModeTabs({ mode, onChange }: ChatModeTabsProps) {
  return (
    <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #333", paddingBottom: "8px" }}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            background: mode === tab.value ? "#4f46e5" : "#1f1f1f",
            color: mode === tab.value ? "#fff" : "#aaa",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}