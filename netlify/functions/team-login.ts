import { getAdminClient, jsonResponse } from './_supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { teamEmail, teamCode, password } = JSON.parse(event.body || '{}');

    if (!teamEmail || !teamCode || !password) {
      return jsonResponse(400, { error: 'Missing fields' });
    }

    const admin = getAdminClient();

    // 1. Verify team email + team code
    const { data: team, error: teamError } = await admin
      .from('teams')
      .select('id, team_code, team_email, team_lead_user_id')
      .eq('team_code', teamCode)
      .eq('team_email', teamEmail)
      .single();

    if (teamError || !team) {
      return jsonResponse(401, {
        error: 'Invalid team credentials',
      });
    }

    // 2. Get team lead profile
    const { data: leadProfile, error: profileError } = await admin
      .from('profiles')
      .select('email')
      .eq('id', team.team_lead_user_id)
      .single();

    if (profileError || !leadProfile) {
      return jsonResponse(401, {
        error: 'Invalid team credentials',
      });
    }

    // 3. Verify password using Supabase Auth
    const anon = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { data: sessionData, error: signInError } =
      await anon.auth.signInWithPassword({
        email: leadProfile.email,
        password,
      });

    if (signInError || !sessionData.session) {
      return jsonResponse(401, {
        error: 'Invalid password',
      });
    }

    return jsonResponse(200, {
      success: true,
      teamId: team.id,
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
