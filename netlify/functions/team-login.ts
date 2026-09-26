import { getAdminClient, jsonResponse } from './_supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed',
    });
  }

  try {
    const {
      teamEmail,
      teamCode,
      password,
    } = JSON.parse(event.body || '{}');

    if (!teamEmail || !teamCode || !password) {
      return jsonResponse(400, {
        error: 'Team email, team code and password are required',
      });
    }

    const admin = getAdminClient();

    // 1. Find the team using team email + team code
    const { data: team, error: teamError } = await admin
      .from('teams')
      .select(
        'id, team_code, team_email, team_lead_user_id'
      )
      .eq('team_email', teamEmail.trim())
      .eq('team_code', teamCode.trim())
      .maybeSingle();

    if (teamError) {
      console.error('Team lookup error:', teamError);

      return jsonResponse(500, {
        error: 'Could not verify team',
      });
    }

    if (!team) {
      return jsonResponse(401, {
        error: 'Invalid team email or team code',
      });
    }

    // 2. Make sure a team lead exists
    if (!team.team_lead_user_id) {
      return jsonResponse(401, {
        error: 'Team lead not found',
      });
    }

    // 3. Get team lead profile
    const {
      data: leadProfile,
      error: profileError,
    } = await admin
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', team.team_lead_user_id)
      .eq('team_id', team.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup error:', profileError);

      return jsonResponse(500, {
        error: 'Could not verify team lead',
      });
    }

    if (!leadProfile) {
      return jsonResponse(401, {
        error: 'Team lead profile not found',
      });
    }

    // 4. Check team lead account
    if (leadProfile.role !== 'team_lead') {
      return jsonResponse(403, {
        error: 'This account is not a team lead',
      });
    }

    if (leadProfile.status !== 'active') {
      return jsonResponse(403, {
        error: 'Team lead account is not active',
      });
    }

    // 5. Verify password using Supabase Auth
    const anon = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: sessionData,
      error: signInError,
    } = await anon.auth.signInWithPassword({
      email: leadProfile.email,
      password,
    });

    if (signInError || !sessionData.session) {
      console.error(
        'Supabase password error:',
        signInError?.message
      );

      return jsonResponse(401, {
        error: 'Invalid password',
      });
    }

    // 6. Login successful
    return jsonResponse(200, {
      success: true,
      teamId: team.id,
      teamCode: team.team_code,
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    });

  } catch (err: any) {
    console.error('Team login error:', err);

    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
