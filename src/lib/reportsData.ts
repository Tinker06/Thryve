import { supabase } from './supabase';
import type { RawTask } from './reportCalculations';

interface TaskRow {
  id: string;
  title: string;
  estimated_minutes: number | null;
  start_time: string | null;
  deadline: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  profiles: {
    id: string;
    full_name: string;
  } | null;
}

export async function fetchReportTasks(
  projectId: string,
  period: string,
  sprintId?: string
): Promise<RawTask[]> {
  let query = supabase
    .from('tasks')
    .select(`
      id,
      title,
      estimated_minutes,
      start_time,
      deadline,
      completed_at,
      assigned_to,
      profiles:assigned_to (
        id,
        full_name
      )
    `)
    .eq('project_id', projectId);

  if (period === 'SPRINT 01' && sprintId) {
    query = query.eq('sprint_id', sprintId);
  } else if (period === 'THIS WEEK') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    query = query.gte('created_at', weekAgo.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as TaskRow[]).map((row) => {
    let actualMinutes: number | null = null;

    if (row.start_time && row.completed_at) {
      const start = new Date(row.start_time).getTime();
      const completed = new Date(row.completed_at).getTime();

      actualMinutes = Math.max(
        0,
        Math.round((completed - start) / 60000)
      );
    }

    return {
      id: row.id,
      name: row.title,
      member_id: row.assigned_to ?? '',
      member_name: row.profiles?.full_name ?? 'Unassigned',
      sprint_id: sprintId ?? '',
      estimated_minutes: row.estimated_minutes ?? 0,
      actual_minutes: actualMinutes,
      deadline: row.deadline ?? '',
      completed_at: row.completed_at,
    };
  });
}

export async function fetchActiveSprintId(
  projectId: string
): Promise<string | undefined> {
  const { data, error } = await supabase
    .from('sprints')
    .select('id, sprint_name, status')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id;
}