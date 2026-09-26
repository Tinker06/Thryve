interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        border: "3px solid var(--ink)",
        background: "var(--yellow)",
        boxShadow: "var(--shadow-sm)",
        padding: 15,
        fontWeight: 1000,
        maxWidth: 420,
        zIndex: 80,
      }}
    >
      {message}
    </div>
  );
}