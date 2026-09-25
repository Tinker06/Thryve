// src/lib/aiClient.ts
// Frontend wrapper for Person 1's Netlify Function at /.netlify/functions/ai
// This file NEVER touches the Gemini API key directly.

const AI_ENDPOINT = "/.netlify/functions/ai-stub";

export interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---- Shared low-level caller ----
async function callAi<T>(action: string, payload: unknown): Promise<AiResponse<T>> {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) {
      return { success: false, error: "AI temporarily unavailable." };
    }

    const json = (await res.json()) as AiResponse<T>;
    return json;
  } catch (err) {
    console.error(`[aiClient] ${action} failed:`, err);
    return { success: false, error: "AI temporarily unavailable." };
  }
}

// ---- Types for each feature ----

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
  status: "PENDING" | "DONE" | "AT_RISK" | "LATE";
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
  knowledgeGaps: { topic: string; evidence: string; recommendation: string }[];
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

// ---- Public functions (one per AI responsibility) ----

export async function generateRoles(
  projectId: string,
  projectDescription: string,
  members: ProjectMemberInput[]
): Promise<AiResponse<RoleAssignment[]>> {
  return callAi<RoleAssignment[]>("generateRoles", {
    projectId,
    projectDescription,
    members,
  });
}

export async function generateSprint(
  projectId: string
): Promise<AiResponse<SprintPlan>> {
  return callAi<SprintPlan>("generateSprint", { projectId });
}

export async function regenerateSprint(
  projectId: string,
  leaderFeedback: string
): Promise<AiResponse<SprintPlan>> {
  return callAi<SprintPlan>("generateSprint", { projectId, leaderFeedback, regenerate: true });
}

export async function askAI(
  payload: AskAiPayload
): Promise<AiResponse<AskAiResult>> {
  return callAi<AskAiResult>("askAI", payload);
}

export async function analyzeProject(
  projectId: string
): Promise<AiResponse<ProjectAnalysis>> {
  return callAi<ProjectAnalysis>("analyzeProject", { projectId });
}

export async function generateCollaborationRecommendations(
  projectId: string
): Promise<AiResponse<CollaborationRecommendation[]>> {
  return callAi<CollaborationRecommendation[]>(
    "generateCollaborationRecommendations",
    { projectId }
  );
}

export async function generatePlaceholder(
  projectId: string,
  taskId: string
): Promise<AiResponse<PlaceholderResult>> {
  return callAi<PlaceholderResult>("generatePlaceholder", { projectId, taskId });
}

export async function suggestSprintChange(
  projectId: string,
  userId: string
): Promise<AiResponse<SprintChangeSuggestion>> {
  return callAi<SprintChangeSuggestion>("suggestSprintChange", {
    projectId,
    userId,
  });
}