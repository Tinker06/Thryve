import { supabase } from './supabase';

const AI_ENDPOINT = '/.netlify/functions/ai';

export interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function callAi<T>(
  action: string,
  payload: unknown
): Promise<AiResponse<T>> {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) {
      return {
        success: false,
        error: 'AI temporarily unavailable.',
      };
    }

    return (await res.json()) as AiResponse<T>;
  } catch (err) {
    console.error(`[aiClient] ${action} failed:`, err);
    return {
      success: false,
      error: 'AI temporarily unavailable.',
    };
  }
}

export interface ProjectMemberInput {
  name: string;
  personalDescription: string;
  skills: string[];
  learningStyle: string;
}

export interface RoleAssignment {
  member: string;
  recommendedRole: string;
  reason: string;
  suggestedResponsibilities: string[];
  firstTasks: string[];
}

export interface SprintTask {
  member: string;
  title: string;
  description: string;
  estimatedTime: string;
  deadline: string;
  status: 'PENDING' | 'DONE' | 'AT_RISK' | 'LATE';
}

export interface SprintPlan {
  sprintName: string;
  goal: string;
  timeline: string;
  tasks: SprintTask[];
}

export interface AskAiPayload {
  projectId: string;
  userId: string;
  message: string;
}

export interface AskAiResult {
  reply: string;
}

export interface ProjectAnalysis {
  summary: string;
  knowledgeGaps: {
    topic: string;
    evidence: string;
    recommendation: string;
  }[];
  risks: string[];
}

export interface CollaborationRecommendation {
  activity: string;
  participants: string[];
  duration: string;
  reason: string;
  expectedBenefit: string;
  relatedTask: string;
}

export interface PlaceholderResult {
  language: string;
  filename: string;
  code: string;
  explanation: string;
  todoMarkers: string[];
  sourceContext: string[];
}

export interface SprintChangeSuggestion {
  reason: string;
  suggestedChange: string;
  details: string;
}

interface DbProfile {
  id: string;
  full_name: string;
  personal_description: string | null;
  skills: string[] | null;
  learning_style: string | null;
  role: string;
  status: string;
}

interface DbProjectMember {
  user_id: string;
  ai_role: string | null;
  ai_role_reason: string | null;
  ai_role_accepted: boolean;
}

interface DbTask {
  id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: string;
  blocked_reason: string | null;
  start_time: string | null;
  deadline: string | null;
  estimated_minutes: number | null;
  completed_at: string | null;
}

interface DbDocument {
  id: string;
  owner_user_id: string | null;
  file_name: string;
  file_type: string | null;
  visibility: string;
  extracted_text: string | null;
  created_at: string;
}

interface DbChat {
  id: string;
  sender_id: string | null;
  mode: string;
  sender_type: string;
  content: string;
  created_at: string;
}

interface DbSprint {
  id: string;
  sprint_name: string | null;
  goal: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
}

interface ProjectContext {
  project: {
    id: string;
    name: string;
    description: string | null;
    team_id: string;
    status: string;
  };
  members: Array<{
    user_id: string;
    name: string;
    personal_description: string;
    skills: string[];
    learning_style: string;
    ai_role: string | null;
    ai_role_reason: string | null;
    ai_role_accepted: boolean;
  }>;
  tasks: DbTask[];
  documents: DbDocument[];
  chats: DbChat[];
  sprint: DbSprint | null;
}

async function loadProjectContext(projectId: string): Promise<ProjectContext> {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, description, team_id, status')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    throw projectError || new Error('Project not found');
  }

  const { data: memberRows, error: memberError } = await supabase
    .from('project_members')
    .select(
      'user_id, ai_role, ai_role_reason, ai_role_accepted'
    )
    .eq('project_id', projectId);

  if (memberError) throw memberError;

  const userIds = (memberRows ?? []).map(
    (member) => member.user_id
  );

  let profiles: DbProfile[] = [];

  if (userIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select(
        'id, full_name, personal_description, skills, learning_style, role, status'
      )
      .in('id', userIds);

    if (profileError) throw profileError;

    profiles = (profileRows ?? []) as DbProfile[];
  }

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile])
  );

  const members = (memberRows ?? []).map(
    (member: DbProjectMember) => {
      const profile = profileMap.get(member.user_id);

      return {
        user_id: member.user_id,
        name: profile?.full_name ?? 'Unknown member',
        personal_description:
          profile?.personal_description ?? '',
        skills: profile?.skills ?? [],
        learning_style:
          profile?.learning_style ?? '',
        ai_role: member.ai_role,
        ai_role_reason: member.ai_role_reason,
        ai_role_accepted: member.ai_role_accepted,
      };
    }
  );

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select(
      'id, assigned_to, title, description, status, blocked_reason, start_time, deadline, estimated_minutes, completed_at'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (taskError) throw taskError;

  const { data: documents, error: documentError } = await supabase
    .from('documents')
    .select(
      'id, owner_user_id, file_name, file_type, visibility, extracted_text, created_at'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (documentError) throw documentError;

  const { data: chats, error: chatError } = await supabase
    .from('chat_messages')
    .select(
      'id, sender_id, mode, sender_type, content, created_at'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (chatError) throw chatError;

  const { data: sprints, error: sprintError } = await supabase
    .from('sprints')
    .select(
      'id, sprint_name, goal, status, created_by, created_at'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (sprintError) throw sprintError;

  return {
    project,
    members,
    tasks: (tasks ?? []) as DbTask[],
    documents: (documents ?? []) as DbDocument[],
    chats: (chats ?? []) as DbChat[],
    sprint: ((sprints ?? [])[0] as DbSprint | undefined) ?? null,
  };
}

function formatDate(value: string | null): string {
  if (!value) return 'TBD';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function mapRoleResponse(
  data: unknown,
  fallbackMembers: ProjectMemberInput[]
): RoleAssignment[] {
  const raw =
    data &&
    typeof data === 'object' &&
    'members' in data &&
    Array.isArray((data as { members?: unknown }).members)
      ? (data as { members: unknown[] }).members
      : Array.isArray(data)
        ? data
        : [];

  return raw.map((row, index) => {
    const item = row as {
      user_id?: string;
      role?: string;
      reason?: string;
      tasks?: string[];
    };

    const fallback =
      fallbackMembers[index]?.name || 'Team member';

    const tasks = Array.isArray(item.tasks)
      ? item.tasks
      : [];

    return {
      member: item.user_id?.startsWith('input-')
        ? fallback
        : item.user_id || fallback,
      recommendedRole:
        item.role || 'Project Contributor',
      reason:
        item.reason ||
        'AI-generated role recommendation.',
      suggestedResponsibilities: tasks,
      firstTasks: tasks.slice(0, 3),
    };
  });
}

function mapSprintResponse(
  data: unknown,
  context: ProjectContext
): SprintPlan | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw = data as {
    sprint_name?: string;
    goal?: string;
    tasks?: Array<{
      user_id?: string;
      title?: string;
      description?: string;
      start_time?: string;
      deadline?: string;
      estimated_minutes?: number;
    }>;
  };

  if (!raw.sprint_name || !Array.isArray(raw.tasks)) {
    return null;
  }

  const memberMap = new Map(
    context.members.map((member) => [
      member.user_id,
      member.name,
    ])
  );

  const tasks: SprintTask[] = raw.tasks.map((task) => ({
    member:
      memberMap.get(task.user_id || '') ||
      task.user_id ||
      'Unassigned',
    title: task.title || 'Untitled task',
    description: task.description || '',
    estimatedTime:
      typeof task.estimated_minutes === 'number'
        ? `${task.estimated_minutes} min`
        : 'TBD',
    deadline: formatDate(task.deadline ?? null),
    status: 'PENDING',
  }));

  const dates = raw.tasks
    .flatMap((task) => [
      task.start_time,
      task.deadline,
    ])
    .filter(Boolean) as string[];

  let timeline = 'AI-generated sprint';

  if (dates.length > 0) {
    const sorted = dates
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value))
      .sort((a, b) => a - b);

    if (sorted.length > 0) {
      timeline = `${new Date(sorted[0]).toLocaleString()} → ${new Date(
        sorted[sorted.length - 1]
      ).toLocaleString()}`;
    }
  }

  return {
    sprintName: raw.sprint_name,
    goal: raw.goal || '',
    timeline,
    tasks,
  };
}

export async function generateRoles(
  projectId: string,
  projectDescription: string,
  members: ProjectMemberInput[]
): Promise<AiResponse<RoleAssignment[]>> {
  try {
    const res = await callAi<unknown>('generateRoles', {
      project: {
        id: projectId,
        description: projectDescription,
      },
      members: members.map((member, index) => ({
        user_id: `input-${index + 1}`,
        name: member.name,
        personal_description:
          member.personalDescription,
        skills: member.skills,
        learning_style: member.learningStyle,
      })),
    });

    if (!res.success) {
      return res as AiResponse<RoleAssignment[]>;
    }

    return {
      success: true,
      data: mapRoleResponse(res.data, members),
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function generateSprint(
  projectId: string
): Promise<AiResponse<SprintPlan>> {
  try {
    const context = await loadProjectContext(projectId);

    const res = await callAi<unknown>('generateSprint', {
      project: context.project,
      members: context.members,
      tasks: context.tasks,
    });

    if (!res.success) {
      return res as AiResponse<SprintPlan>;
    }

    const sprint = mapSprintResponse(res.data, context);

    if (!sprint) {
      return {
        success: false,
        error: 'AI returned an invalid sprint plan.',
      };
    }

    return {
      success: true,
      data: sprint,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function regenerateSprint(
  projectId: string,
  leaderFeedback: string
): Promise<AiResponse<SprintPlan>> {
  try {
    const context = await loadProjectContext(projectId);

    const res = await callAi<unknown>('generateSprint', {
      project: {
        ...context.project,
        regenerate: true,
        regeneration_feedback: leaderFeedback,
      },
      members: context.members,
      tasks: context.tasks,
    });

    if (!res.success) {
      return res as AiResponse<SprintPlan>;
    }

    const sprint = mapSprintResponse(res.data, context);

    if (!sprint) {
      return {
        success: false,
        error: 'AI returned an invalid regenerated sprint.',
      };
    }

    return {
      success: true,
      data: sprint,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function askAI(
  payload: AskAiPayload
): Promise<AiResponse<AskAiResult>> {
  try {
    const context = await loadProjectContext(
      payload.projectId
    );

    const res = await callAi<{
      answer?: string;
    }>('askAI', {
      project: context.project,
      tasks: context.tasks,
      documents: context.documents,
      chats: context.chats,
      sprint: context.sprint,
      currentUser: {
        user_id: payload.userId,
        question: payload.message,
      },
    });

    if (!res.success) {
      return res as AiResponse<AskAiResult>;
    }

    return {
      success: true,
      data: {
        reply:
          res.data?.answer ||
          'AI did not return an answer.',
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function analyzeProject(
  projectId: string
): Promise<AiResponse<ProjectAnalysis>> {
  try {
    const context = await loadProjectContext(projectId);

    const res = await callAi<{
      collective_summary?: string;
      knowledge_gaps?: Array<{
        topic?: string;
        evidence?: string;
        recommendation?: string;
      }>;
    }>('analyzeProject', {
      project: context.project,
      members: context.members,
      tasks: context.tasks,
      chats: context.chats,
      documents: context.documents,
    });

    if (!res.success) {
      return res as AiResponse<ProjectAnalysis>;
    }

    const riskTasks = context.tasks
      .filter(
        (task) =>
          task.status === 'blocked' ||
          task.status === 'late'
      )
      .map(
        (task) =>
          `${task.title}: ${
            task.blocked_reason || task.status
          }`
      );

    return {
      success: true,
      data: {
        summary:
          res.data?.collective_summary ||
          'No collective summary returned.',
        knowledgeGaps:
          (res.data?.knowledge_gaps ?? []).map(
            (gap) => ({
              topic: gap.topic || 'Unknown topic',
              evidence: gap.evidence || '',
              recommendation:
                gap.recommendation || '',
            })
          ),
        risks: riskTasks,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function generateCollaborationRecommendations(
  projectId: string
): Promise<AiResponse<CollaborationRecommendation[]>> {
  try {
    const context = await loadProjectContext(projectId);

    const res = await callAi<{
      recommendations?: Array<{
        activity?: string;
        participants?: string[];
        duration_minutes?: number;
        reason?: string;
        expected_benefit?: string;
        related_task_id?: string;
      }>;
    }>('generateCollaborationRecommendations', {
      project: context.project,
      members: context.members,
      tasks: context.tasks,
      chats: context.chats,
      documents: context.documents,
    });

    if (!res.success) {
      return res as AiResponse<
        CollaborationRecommendation[]
      >;
    }

    return {
      success: true,
      data: (res.data?.recommendations ?? []).map(
        (recommendation) => ({
          activity:
            recommendation.activity || '',
          participants:
            recommendation.participants || [],
          duration:
            typeof recommendation.duration_minutes ===
            'number'
              ? `${recommendation.duration_minutes} min`
              : '15 min',
          reason: recommendation.reason || '',
          expectedBenefit:
            recommendation.expected_benefit || '',
          relatedTask:
            recommendation.related_task_id || '',
        })
      ),
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function generatePlaceholder(
  projectId: string,
  taskId: string
): Promise<AiResponse<PlaceholderResult>> {
  try {
    const context = await loadProjectContext(projectId);

    const task =
      context.tasks.find(
        (item) => item.id === taskId
      ) || null;

    if (!task) {
      return {
        success: false,
        error: 'Task not found.',
      };
    }

    const res = await callAi<{
      language?: string;
      filename?: string;
      code?: string;
      explanation?: string;
      todo_markers?: string[];
      source_context?: string[];
    }>('generatePlaceholder', {
      task,
      documents: context.documents,
      chats: context.chats,
    });

    if (!res.success) {
      return res as AiResponse<PlaceholderResult>;
    }

    return {
      success: true,
      data: {
        language: res.data?.language || '',
        filename: res.data?.filename || 'placeholder.txt',
        code: res.data?.code || '',
        explanation: res.data?.explanation || '',
        todoMarkers:
          res.data?.todo_markers || [],
        sourceContext:
          res.data?.source_context || [],
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}

export async function suggestSprintChange(
  projectId: string,
  userId: string
): Promise<AiResponse<SprintChangeSuggestion>> {
  try {
    const context = await loadProjectContext(projectId);

    const blocked = context.tasks.filter(
      (task) => task.status === 'blocked'
    );

    const res = await callAi<{
      reason?: string;
      suggested_change?: string;
      from_user_id?: string;
      to_user_id?: string;
      duration_minutes?: number;
    }>('suggestSprintChange', {
      chats: context.chats,
      tasks: context.tasks,
      blocked,
      current_user_id: userId,
    });

    if (!res.success) {
      return res as AiResponse<SprintChangeSuggestion>;
    }

    return {
      success: true,
      data: {
        reason: res.data?.reason || '',
        suggestedChange:
          res.data?.suggested_change || '',
        details: [
          res.data?.from_user_id
            ? `From: ${res.data.from_user_id}`
            : '',
          res.data?.to_user_id
            ? `To: ${res.data.to_user_id}`
            : '',
          typeof res.data?.duration_minutes === 'number'
            ? `Duration: ${res.data.duration_minutes} min`
            : '',
        ]
          .filter(Boolean)
          .join(' • '),
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'AI temporarily unavailable.',
    };
  }
}