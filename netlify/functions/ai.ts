// netlify/functions/ai.ts
// Real Gemini-powered backend for all THRYVE AI features.
// Never expose GEMINI_API_KEY or SUPABASE_SERVICE_ROLE_KEY to the frontend —
// they only live here, as Netlify environment variables.

import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- low-level Gemini caller ----------
async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }

  const json: any = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text ?? "")
      .join("") ?? "";

  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text;
}

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

function respond(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ---------- shared context loader ----------
async function getProjectContext(projectId: string) {
  const [projectRes, membersRes, tasksRes, chatRes, docsRes] = await Promise.all([
    supabase.from("projects").select("name, description").eq("id", projectId).single(),
    supabase
      .from("project_members")
      .select("id, name, personal_description, skills, learning_style, ai_role")
      .eq("project_id", projectId),
    supabase
      .from("tasks")
      .select("id, assignee_id, title, status, deadline, completed_at, blocked_reason")
      .eq("project_id", projectId),
    supabase
      .from("chat_messages")
      .select("sender_id, mode, content, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("documents")
      .select("id, title, approved")
      .eq("project_id", projectId)
      .eq("approved", true),
  ]);

  return {
    project: projectRes.data ?? { name: "Unknown project", description: "" },
    members: membersRes.data ?? [],
    tasks: tasksRes.data ?? [],
    chat: (chatRes.data ?? []).reverse(), // oldest first for readability
    documents: docsRes.data ?? [],
  };
}

// ==================================================
// ACTION HANDLERS
// ==================================================

async function handleGenerateRoles(payload: any) {
  const { projectDescription, members } = payload;

  const prompt = `You are an assistant that assigns roles to a hackathon team.
Project description: ${projectDescription}

Team members (JSON): ${JSON.stringify(members)}

For EACH member, decide a recommended role, a short reason based on their skills/description,
2-4 suggested responsibilities, and 1-3 first tasks to start with.

Respond with ONLY a JSON array, no markdown, no preamble, matching exactly this shape:
[
  {
    "member": "string (their name)",
    "recommendedRole": "string",
    "reason": "string",
    "suggestedResponsibilities": ["string"],
    "firstTasks": ["string"]
  }
]`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

async function handleGenerateSprint(payload: any) {
  const { projectId, leaderFeedback, regenerate } = payload;
  const ctx = await getProjectContext(projectId);

  const prompt = `You are an assistant generating a sprint plan for a hackathon team.

Project: ${ctx.project.name} — ${ctx.project.description}

Team members (JSON): ${JSON.stringify(ctx.members)}

Existing tasks (JSON): ${JSON.stringify(ctx.tasks)}

${regenerate ? `The team lead REJECTED the previous sprint with this feedback: "${leaderFeedback}". Generate a revised sprint addressing that feedback.` : "Generate a fresh sprint plan."}

Respond with ONLY JSON, no markdown, matching exactly this shape:
{
  "sprintName": "string",
  "goal": "string",
  "timeline": "string (e.g. '24 hours' or a date range)",
  "tasks": [
    {
      "member": "string (member name)",
      "title": "string",
      "description": "string",
      "estimatedTime": "string (e.g. '2 hours')",
      "deadline": "string (ISO date or relative, e.g. 'in 6 hours')",
      "status": "PENDING"
    }
  ]
}`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

async function handleAskAI(payload: any) {
  const { projectId, userId, message } = payload;
  const ctx = await getProjectContext(projectId);

  const prompt = `You are THRYVE's project assistant, answering a team member's question
using ONLY the authorized project context below. Be concise, specific, and reference
real project details when relevant. If the context doesn't contain the answer, say so honestly.

Project: ${ctx.project.name} — ${ctx.project.description}

Team members: ${JSON.stringify(ctx.members.map((m: any) => ({ name: m.name, role: m.ai_role })))}

Current tasks: ${JSON.stringify(ctx.tasks)}

Approved documents (titles only): ${JSON.stringify(ctx.documents.map((d: any) => d.title))}

Recent project chat (last ${ctx.chat.length} messages): ${JSON.stringify(
    ctx.chat.map((c: any) => ({ mode: c.mode, content: c.content }))
  )}

The user asking is member ID ${userId}. Their question:
"${message}"

Respond with ONLY JSON, no markdown:
{ "reply": "string — your answer" }`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

async function handleAnalyzeProject(payload: any) {
  const { projectId } = payload;
  const ctx = await getProjectContext(projectId);

  const totalTasks = ctx.tasks.length;
  const completedTasks = ctx.tasks.filter((t: any) => t.status === "DONE").length;

  const prompt = `You are analyzing a hackathon team's project health using ONLY the data below.
Do not invent facts. Base every claim on observable data given.

Project: ${ctx.project.name} — ${ctx.project.description}
Members: ${JSON.stringify(ctx.members.map((m: any) => m.name))}
Tasks (${totalTasks} total, ${completedTasks} done): ${JSON.stringify(ctx.tasks)}
Recent chat: ${JSON.stringify(ctx.chat.map((c: any) => ({ mode: c.mode, content: c.content })))}
Approved documents shared: ${ctx.documents.length}

Respond with ONLY JSON, no markdown, matching exactly this shape:
{
  "summary": "string — 2-4 sentence written summary of team progress and collaboration health",
  "risks": ["string — specific observed risks, or empty array if none"],
  "knowledgeGaps": [
    { "topic": "string", "evidence": "string — what observable activity shows this", "recommendation": "string" }
  ]
}`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

async function handleCollabRecs(payload: any) {
  const { projectId } = payload;
  const ctx = await getProjectContext(projectId);

  const prompt = `Based ONLY on this project's real activity, recommend 1-3 collaboration
activities (like peer teaching sessions) that would help the team.

Members: ${JSON.stringify(ctx.members.map((m: any) => m.name))}
Tasks: ${JSON.stringify(ctx.tasks)}
Recent chat: ${JSON.stringify(ctx.chat.map((c: any) => ({ sender_id: c.sender_id, mode: c.mode, content: c.content })))}

Respond with ONLY JSON array, no markdown, matching exactly:
[
  {
    "activity": "string",
    "participants": ["string — member names"],
    "duration": "string (e.g. '15 minutes')",
    "reason": "string — based on observed activity",
    "expectedBenefit": "string",
    "relatedTask": "string"
  }
]`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

async function handlePlaceholder(payload: any) {
  const { projectId, taskId } = payload;
  const ctx = await getProjectContext(projectId);
  const task = ctx.tasks.find((t: any) => t.id === taskId);

  const prompt = `Generate a code SCAFFOLD (not finished production code) for this task,
using the project context for language/framework hints. Include TODO markers for
anything left incomplete.

Project: ${ctx.project.name} — ${ctx.project.description}
Task: ${JSON.stringify(task)}
Recent chat for context: ${JSON.stringify(ctx.chat.slice(-15).map((c: any) => c.content))}

Respond with ONLY JSON, no markdown, matching exactly:
{
  "language": "string",
  "filename": "string",
  "code": "string — the scaffold code, with // TODO comments where incomplete",
  "explanation": "string",
  "todoMarkers": ["string — list of TODOs in the code"],
  "sourceContext": ["string — which context this was based on"]
}`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

async function handleSuggestSprintChange(payload: any) {
  const { projectId, userId } = payload;
  const ctx = await getProjectContext(projectId);
  const userMessages = ctx.chat.filter((c: any) => c.sender_id === userId);

  const prompt = `A team member may need a sprint adjustment. Base this ONLY on observable
activity below — do not guess at feelings or intent.

Member's recent messages: ${JSON.stringify(userMessages.map((m: any) => m.content))}
Member's tasks: ${JSON.stringify(ctx.tasks.filter((t: any) => t.assignee_id === userId))}

Respond with ONLY JSON, no markdown:
{
  "reason": "string — what observable pattern triggered this",
  "suggestedChange": "string — short actionable change",
  "details": "string — 1-2 sentence elaboration"
}`;

  const raw = await callGemini(prompt);
  const data = parseJson(raw);
  return respond(200, { success: true, data });
}

// ==================================================
// ROUTER
// ==================================================

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { action, payload } = body;

    switch (action) {
      case "generateRoles":
        return await handleGenerateRoles(payload);
      case "generateSprint":
        return await handleGenerateSprint(payload);
      case "askAI":
        return await handleAskAI(payload);
      case "analyzeProject":
        return await handleAnalyzeProject(payload);
      case "generateCollaborationRecommendations":
        return await handleCollabRecs(payload);
      case "generatePlaceholder":
        return await handlePlaceholder(payload);
      case "suggestSprintChange":
        return await handleSuggestSprintChange(payload);
      default:
        return respond(400, { success: false, error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error("[ai.ts] error:", err?.message ?? err);
    return respond(200, { success: false, error: "AI temporarily unavailable." });
  }
};