// src/components/common/AiErrorNotice.tsx
interface Props {
  message?: string;
}

export default function AiErrorNotice({ message }: Props) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--red, #b00020)",
        marginBottom: 8,
      }}
    >
      {message ?? "AI temporarily unavailable — showing available data instead."}
    </p>
  );
}