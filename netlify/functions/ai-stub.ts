// netlify/functions/ai-stub.ts
// TEMPORARY — only exists so you can test aiClient.ts before Person 1's real ai.ts is ready.
// Delete this file once the real netlify/functions/ai.ts exists.
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      success: true,
      data: {
        stub: true,
        receivedAction: body.action,
        receivedPayload: body.payload,
      },
    }),
  };
};
