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
  /** ISO timestamp the task is due. */
  deadline: string;
  /** ISO timestamp the task was completed, or null if still open. */
  completed_at: string | null;
}

export interface ReportTaskView extends RawTask {
  status: TaskStatus;
}

/**
 * DEADLINE ANALYSIS
 * -----------------
 * completed_at <= deadline  -> 'done'    (before deadline)
 * completed_at >  deadline  -> 'late'
 * completed_at == null && now >  deadline -> 'risk'    (overdue, unfinished)
 * completed_at == null && now <= deadline -> 'pending' (estimated time stays visible)
 *
 * This is exactly the logic requested: no AI, no interpretation, a straight
 * timestamp comparison.
 */
export function computeTaskStatus(
  task: Pick<RawTask, 'deadline' | 'completed_at'>,
  now: Date = new Date()
): TaskStatus {
  const deadline = new Date(task.deadline).getTime();

  if (task.completed_at) {
    const completedAt = new Date(task.completed_at).getTime();
    return completedAt <= deadline ? 'done' : 'late';
  }

  return now.getTime() > deadline ? 'risk' : 'pending';
}

export function withStatus(tasks: RawTask[], now: Date = new Date()): ReportTaskView[] {
  return tasks.map((t) => ({ ...t, status: computeTaskStatus(t, now) }));
}

export interface ReportSummary {
  workDoneLabel: string; // e.g. "18 / 25"
  checklistLabel: string; // e.g. "8 / 12" (see note in README-REPORTS.md)
  taskCount: number;
  riskCount: number;
  efficiencyPercent: number;
  estimatedHoursLabel: string; // e.g. "18h"
  actualHoursLabel: string; // e.g. "19.5h"
}

/**
 * EFFICIENCY FORMULA (chosen and documented, not hardcoded)
 * -----------------------------------------------------------------------
 * efficiency = round(100 * (
 *     0.40 * completionScore +
 *     0.35 * deadlineAdherenceScore +
 *     0.25 * timeAccuracyScore
 * ))
 *
 * completionScore        = doneCount / totalTasks
 *   -> how much of the assigned work actually got finished.
 *
 * deadlineAdherenceScore = onTimeCount / completedCount
 *   (onTimeCount = tasks with status 'done'; completedCount = 'done' + 'late')
 *   -> of the work that WAS finished, how much of it was on time.
 *   -> if nothing has been completed yet, this is 0 (not 1) so a fresh
 *      sprint doesn't start at an inflated efficiency score.
 *
 * timeAccuracyScore = average, over completed tasks, of
 *   min(estimated/actual, actual/estimated)
 *   -> a symmetric ratio in (0,1]: 1.0 means estimate matched actual time
 *      exactly, and it penalizes both under- and over-estimating.
 *   -> if nothing has been completed yet, this is 0 for the same reason
 *      as above.
 *
 * The three weights (0.40 / 0.35 / 0.25) sum to 1, so the result is already
 * normalized to 0-100 after multiplying by 100 and rounding.
 *
 * Adjust the weights here (and in REPORTS.md) if the team wants to weigh
 * these differently — they are intentionally isolated in one place.
 */
const WEIGHT_COMPLETION = 0.4;
const WEIGHT_DEADLINE_ADHERENCE = 0.35;
const WEIGHT_TIME_ACCURACY = 0.25;

export function summarize(tasks: ReportTaskView[]): ReportSummary {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const late = tasks.filter((t) => t.status === 'late').length;
  const risk = tasks.filter((t) => t.status === 'risk').length;
  const completed = done + late;

  const completionScore = total > 0 ? done / total : 0;
  const deadlineAdherenceScore = completed > 0 ? done / completed : 0;

  const completedWithTime = tasks.filter(
    (t) => (t.status === 'done' || t.status === 'late') && t.actual_minutes && t.actual_minutes > 0
  );
  const timeAccuracyScore =
    completedWithTime.length > 0
      ? completedWithTime.reduce((sum, t) => {
          const ratio = Math.min(
            t.estimated_minutes / t.actual_minutes!,
            t.actual_minutes! / t.estimated_minutes
          );
          return sum + ratio;
        }, 0) / completedWithTime.length
      : 0;

  const efficiencyPercent = Math.round(
    100 *
      (WEIGHT_COMPLETION * completionScore +
        WEIGHT_DEADLINE_ADHERENCE * deadlineAdherenceScore +
        WEIGHT_TIME_ACCURACY * timeAccuracyScore)
  );

  const estimatedMinutes = tasks.reduce((s, t) => s + (t.estimated_minutes || 0), 0);
  const actualMinutes = tasks.reduce((s, t) => s + (t.actual_minutes || 0), 0);

  return {
    workDoneLabel: `${done} / ${total}`,
    // NOTE: the prototype shows a separate "CHECKLIST" number (e.g. 8/12)
    // distinct from "WORK DONE" (18/25) — that implies each task can have
    // multiple checklist sub-items. This codebase doesn't have a
    // checklist_items table yet, so this defaults to the task-level done/total
    // count. Wire this to a real sub-item count if/when Person 1 adds that
    // table; until then it intentionally mirrors workDoneLabel rather than
    // faking a different number.
    checklistLabel: `${done} / ${total}`,
    taskCount: total,
    riskCount: risk,
    efficiencyPercent,
    estimatedHoursLabel: formatHours(estimatedMinutes),
    actualHoursLabel: formatHours(actualMinutes),
  };
}

function formatHours(minutes: number): string {
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}h`;
}

export function formatMinutesShort(minutes: number | null): string {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h && m) return `${h}H ${m}M`;
  if (h) return `${h}H`;
  return `${m}M`;
}

export interface MemberRow {
  member_id: string;
  member_name: string;
  workDoneLabel: string;
  taskCount: number;
  riskCount: number;
  efficiencyPercent: number;
  estimatedLabel: string;
  actualLabel: string;
}

/** Groups tasks by member and runs summarize() on each group. */
export function buildMemberRows(tasks: ReportTaskView[]): MemberRow[] {
  const byMember = new Map<string, ReportTaskView[]>();
  for (const t of tasks) {
    const list = byMember.get(t.member_id) ?? [];
    list.push(t);
    byMember.set(t.member_id, list);
  }

  return Array.from(byMember.entries()).map(([memberId, memberTasks]) => {
    const s = summarize(memberTasks);
    return {
      member_id: memberId,
      member_name: memberTasks[0]?.member_name ?? 'Unknown',
      workDoneLabel: s.workDoneLabel,
      taskCount: s.taskCount,
      riskCount: s.riskCount,
      efficiencyPercent: s.efficiencyPercent,
      estimatedLabel: s.estimatedHoursLabel,
      actualLabel: s.actualHoursLabel,
    };
  });
}
