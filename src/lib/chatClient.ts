// src/lib/chatClient.ts
import { supabase } from "./supabaseClient";

export type ChatMode = "team_ai" | "ask_ai" | "team_only";

export interface ChatMessageRow {
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  mode: ChatMode;
  content: string;
  is_ai: boolean;
  created_at: string;
}

export async function fetchMessages(projectId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from("project_messages")
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
  const { error } = await supabase.from("project_messages").insert({
    project_id: row.project_id,
    sender_id: row.sender_id,
    sender_name: row.sender_name,
    mode: row.mode,
    content: row.content,
    is_ai: row.is_ai ?? false,
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
    .channel(`project_messages:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "project_messages",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => onInsert(payload.new as ChatMessageRow)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}