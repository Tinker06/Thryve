// src/pages/Chat.tsx
import ChatWindow from "../components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <main className="main">
      <div className="section-head">
        <div>
          <h2>TEAM CHAT</h2>
          <p>TEAM + AI shares with everyone. ASK AI is private and contextual. TEAM ONLY hides AI replies.</p>
        </div>
      </div>
      <ChatWindow projectId="demo-project-id" currentUserId="demo-user-1" currentUserName="You" />
    </main>
  );
}