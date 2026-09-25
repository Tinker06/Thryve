/**
 * reportCalculations.ts
 * ---------------------------------------------------------------------------
 * Pure, deterministic logic for the Reports feature. No AI, no guesswork:
 * every number here is derived from timestamps and durations that already
 * exist on a task row. This file has no side effects and no dependency on
 * Supabase, so it can be unit-tested on its own.
 */

export type TaskStatus = 'done' | 'late' | 'pending' | 'risk';

export interface RawTask {
  id: string;
  name: string;
  member_id: string;
  member_name: string;
  sprint_id: string;
  /** Planned effort in minutes. */
  estimated_minutes: number;
  /** Actual time spent in minutes, null until the task is completed. */
  actual_minutes: number | null;
  /** ISO timestamp the task is 
