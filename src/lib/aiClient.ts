// src/lib/aiClient.ts
// Frontend wrapper for Person 1's Netlify Function at /.netlify/functions/ai
// This file NEVER touches the Gemini API key directly.

const AI_ENDPOINT = "/.netlify/functions/ai-stub";

// ==================================================

export interface AiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---- Shared low-level caller (Phase 14: timeout + guaranteed no-throw) ----
const AI_TIMEOUT_MS = 20000; // 20s — Gemini + Netlify cold start can be slow

async function callAi<T>(action: string, payload: unknown): Promise<AiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[aiClient] ${action} returned HTTP ${res.status}`);
      return { success: false, error: "AI temporarily unavailable." };
    }

    const json = (await res.json()) as AiResponse<T>;

    if (typeof json?.success !== "boolean") {
      console.error(`[aiClient] ${action} returned malformed response`, json);
      return { success: false, error: "AI temporarily unavailable." };
    }

    return json;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err?.name === "AbortError") {
      console.error(`[aiClient] ${action} timed out after ${AI_TIMEOUT_MS}ms`);
      return { success: false, error: "AI request timed out." };
    }

    console.error(`[aiClient] ${action} failed:`, err?.message ?? err);
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