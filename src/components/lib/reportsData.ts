/**
 * reportsData.ts
 * ---------------------------------------------------------------------------
 * Supabase queries for the Reports feature.
 *
 * SCHEMA ASSUMPTION — READ THIS FIRST:
 * I don't have access to Person 1's actual backend branch/migrations, so the
 * table and column names below (`tasks`, `members`, `sprints`) are a
 * reasonable guess based on the prototype's data shape, not a confirmed
 * schema. Before wiring this up, diff this against the real schema and
 * adjust the `.from(...)` / `.select(...)` calls — the RawTask shape
 * returned by these functions is what actually matters to the rest of the
 * Reports code, so as long as you map into that shape, everything else
 * (reportCalculations.ts, the components) works unchanged.
 *
 * Assumed `tasks` columns:
 *   id, name, project_id, sprint_id, member_id,
 *   estimated_minutes, actual_minutes, deadline (timestamptz), completed_at (timestamptz | null)
 * Assumed `members` columns:
 *   id, name, project_id
 * Assumed `sprints` columns:
 *   id, project_id, label ('SPRINT 01' | 'THIS WEEK' | 'PROJECT TO DATE'), starts_at, ends_at
 */

import { supabase } from './supabaseClient'; // adjust this import to wherever Person 1/2 export the Supabase client
import type { RawTask } from './reportCalculations';

interface TaskRow {
  id: string;
  name: string;
  estimated_minutes: number;
  actual_minutes: number | null;
  deadline: string;
  completed_at: string | null;
  member_id: string;
  members: { id: string; name: string } | null;
}

/**
 * Fetches every task for a project + period, ready to feed into
 * withStatus() / summarize() from reportCalculations.ts.
 *
 * `period` matches the report toolbar's dropdown values:
 * 'SPRINT 01' | 'THIS WEEK' | 'PROJECT TO DATE'. For 'SPRINT 01' we filter
 * by sprint_id; for the other two we filter by a date range instead. Adjust
 * this once the real sprint/period model is confirmed.
 */
export async function fetchReportTasks(
  projectId: string,
  period: string,
  sprintId?: string
): Promise<RawTask[]> {
  let query = supabase
    .from('tasks')
    .select(
      `
      id,
      name,
      estimated_minutes,
      actual_minutes,
      deadline,
      completed_at,
      member_id,
      members ( id, name )
    `
    )
    .eq('project_id', projectId);

  if (period === 'SPRINT 01' && sprintId) {
    query = query.eq('sprint_id', sprintId);
  } else if (period === 'THIS WEEK') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte('deadline', weekAgo.toISOString());
  }
  // 'PROJECT TO DATE' -> no extra filter, everything on the project.

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as TaskRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    member_id: row.members?.id ?? row.member_id,
    member_name: row.members?.name ?? 'Unassigned',
    sprint_id: sprintId ?? '',
    estimated_minutes: row.estimated_minutes,
    actual_minutes: row.actual_minutes,
    deadline: row.deadline,
    completed_at: row.completed_at,
  }));
}

/** Resolves the active sprint id for a project, used when period === 'SPRINT 01'. */
export async function fetchActiveSprintId(projectId: string): Promise<string | undefined> {
  const { data, error } = await supabase
    .from('sprints')
    .select('id')
    .eq('project_id', projectId)
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id;
}
