// src/lib/chatClient.ts
import { supabase } from "./supabaseClient";

export type ChatMode = "team_ai" | "ask_ai" | "team_only";

export interface ChatMessageRow {
  id: string;
  project_id: string;
  sender_id: string | null;
  sender_name: string;
  mode: ChatMode;
  content: string;
  is_ai: boolean;
  created_at: string;
}

export async function fetchMessages(projectId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[chatClient] fetchMessages failed:", error);
    return [];
  }
  return data as ChatMessageRow[];
}

export async function sendMessage(row: {
  project_id: string;
  sender_id: string;
  sender_name: string;
  mode: ChatMode;
  content: string;
  is_ai?: boolean;
}): Promise<void> {
  const isAi = row.is_ai ?? false;

  const { error } = await supabase.from("chat_messages").insert({
    project_id: row.project_id,
    // "ai" is not a real project_members.id, so store null for AI rows
    // instead of violating the foreign key — sender_name/is_ai still
    // identify it as the AI in the UI.
    sender_id: isAi ? null : row.sender_id,
    sender_name: row.sender_name,
    mode: row.mode,
    content: row.content,
    is_ai: isAi,
  });

  if (error) {
    console.error("[chatClient] sendMessage failed:", error);
    throw error;
  }
}

export function subscribeToMessages(
  projectId: string,
  onInsert: (row: ChatMessageRow) => void
) {
  const channel = supabase
    .channel(`chat_messages:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => onInsert(payload.new as ChatMessageRow)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}