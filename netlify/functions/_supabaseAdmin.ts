import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
  const url = process.env.SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function randomTempPassword(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).toUpperCase().slice(2, 6) +
    '!9'
  );
}

export function generateTeamCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `THRYVE-${digits}`;
}
