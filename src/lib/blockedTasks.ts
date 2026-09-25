// src/lib/blockedTasks.ts
import { supabase } from "./supabaseClient";

export interface BlockedTaskInput {
  taskId: string;
  reason: string;
}

/**
 * Marks a task BLOCKED with a reason + timestamp, and creates a
 * notification for every OTHER member on the project so the team
 * is alerted immediately (per Phase 10 spec: "notify team").
 */
export async function markTaskBlocked(
  input: BlockedTaskInput
): Promise<{ success: boolean; error?: string }> {
  const { taskId, reason } = input;

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: "A reason is required to mark a task blocked." };
  }

  try {
    // 1. Fetch the task to get project_id and assignee for context
    const { data: task, error: taskFetchErr } = await supabase
      .from("tasks")
      .select("id, project_id, assignee_id, title")
      .eq("id", taskId)
      .single();

    if (taskFetchErr || !task) {
      return { success: false, error: taskFetchErr?.message ?? "Task not found." };
    }

    // 2. Update the task
    const { error: updateErr } = await supabase
      .from("tasks")
      .update({
        status: "BLOCKED",
        blocked_reason: reason.trim(),
        blocked_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // 3. Notify every OTHER member on the project
    const { data: members, error: membersErr } = await supabase
      .from("project_members")
      .select("id, name")
      .eq("project_id", task.project_id);

    if (membersErr) {
      // Task is already blocked at this point — don't fail the whole
      // operation just because notifications couldn't be sent.
      console.error("blockedTasks: failed to fetch members for notification", membersErr);
      return { success: true };
    }

    const recipients = (members ?? []).filter((m) => m.id !== task.assignee_id);

    if (recipients.length > 0) {
      const notifRows = recipients.map((m) => ({
        project_id: task.project_id,
        recipient_id: m.id,
        type: "task_blocked",
        title: `Task blocked: ${task.title}`,
        message: reason.trim(),
        related_task_id: task.id,
      }));

      const { error: notifErr } = await supabase.from("notifications").insert(notifRows);
      if (notifErr) {
        console.error("blockedTasks: failed to insert notifications", notifErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Unexpected error marking task blocked." };
  }
}