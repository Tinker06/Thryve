import { jsonResponse } from './_supabaseAdmin';

const GEMINI_MODEL = 'gemini-3.1-flash-lite';

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(prompt: string): Promise<any> {
  const res = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status}`);
  }

  const json = await res.json();

  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty Gemini response');
  }

  return JSON.parse(text);
}

function buildPrompt(action: string, payload: any): string {
  switch (action) {
    case 'generateRoles':
      return `You are assigning project roles for a student team.
Project: ${JSON.stringify(payload.project)}
Members (name, personal_description, skills, learning_style): ${JSON.stringify(payload.members)}
Return ONLY JSON: {"members":[{"user_id":"...","role":"...","reason":"...","tasks":[]}]}`;

    case 'generateSprint':
      return `Generate sprint 01 for this project.
Project: ${JSON.stringify(payload.project)}
Members: ${JSON.stringify(payload.members)}
Tasks context: ${JSON.stringify(payload.tasks)}
Return ONLY JSON: {"sprint_name":"...","goal":"...","tasks":[{"user_id":"...","title":"...","description":"...","start_time":"...","deadline":"...","estimated_minutes":60,"dependencies":[]}]}`;

    case 'askAI':
      return `You are THRYVE's assistant. Answer using ONLY this authorized context.
Project: ${JSON.stringify(payload.project)}
Current task: ${JSON.stringify(payload.tasks)}
Approved documents: ${JSON.stringify(payload.documents)}
Recent chat: ${JSON.stringify(payload.chats)}
Sprint: ${JSON.stringify(payload.sprint)}
User question: "${payload.currentUser?.question || payload.question}"
Return ONLY JSON: {"answer":"..."}`;

    case 'analyzeProject':
      return `Analyze this project's collaboration using ONLY observable activity (no psychological claims).
Project: ${JSON.stringify(payload.project)}
Members: ${JSON.stringify(payload.members)}
Tasks: ${JSON.stringify(payload.tasks)}
Chats: ${JSON.stringify(payload.chats)}
Documents: ${JSON.stringify(payload.documents)}
Return ONLY JSON: {"knowledge_exchange":[],"knowledge_gaps":[],"collaboration_recommendations":[],"collective_summary":""}`;

    case 'generateCollaborationRecommendations':
      return `Based on this activity, recommend collaboration actions.
Context: ${JSON.stringify(payload)}
Return ONLY JSON: {"recommendations":[{"activity":"...","participants":[],"duration_minutes":15,"reason":"...","expected_benefit":"...","related_task_id":"..."}]}`;

    case 'generatePlaceholder':
      return `Generate a scaffold/placeholder code file (clearly NOT production-complete) for this task.
Task: ${JSON.stringify(payload.task)}
Authorized docs: ${JSON.stringify(payload.documents)}
Chat context: ${JSON.stringify(payload.chats)}
Return ONLY JSON: {"language":"...","filename":"...","code":"...","explanation":"...","todo_markers":[],"source_context":"..."}`;

    case 'suggestSprintChange':
      return `Analyze recent activity and suggest ONE sprint change.
Recent chat: ${JSON.stringify(payload.chats)}
Current task: ${JSON.stringify(payload.tasks)}
Blocked state: ${JSON.stringify(payload.blocked)}
Return ONLY JSON: {"reason":"...","suggested_change":"...","from_user_id":"...","to_user_id":"...","duration_minutes":15}`;

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed',
    });
  }

  try {
    const { action, payload } = JSON.parse(event.body || '{}');

    if (!action) {
      return jsonResponse(200, {
        success: false,
        error: 'Missing action',
      });
    }

    const prompt = buildPrompt(action, payload || {});

    const data = await callGemini(prompt);

    return jsonResponse(200, {
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('AI function error:', err);

    return jsonResponse(200, {
      success: false,
      error: 'AI temporarily unavailable.',
    });
  }
}
