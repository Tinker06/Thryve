import { getAdminClient, jsonResponse, randomTempPassword } from './_supabaseAdmin.js';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { teamEmail, teamCode } = JSON.parse(event.body || '{}');

    if (!teamEmail || !teamCode) {
      return jsonResponse(400, {
        error: 'Team email and team code are required',
      });
    }

    const admin = getAdminClient();

    const { data: team, error: teamError } = await admin
      .from('teams')
      .select('id, team_code, team_email, team_lead_user_id')
      .eq('team_code', teamCode.trim())
      .eq('team_email', teamEmail.trim())
      .single();

    if (teamError || !team) {
      return jsonResponse(401, {
        error: 'Invalid team email or team code',
      });
    }

    if (!team.team_lead_user_id) {
      return jsonResponse(400, {
        error: 'Team lead is not configured',
      });
    }

    const { data: leadProfile, error: profileError } = await admin
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', team.team_lead_user_id)
      .single();

    if (profileError || !leadProfile) {
      return jsonResponse(401, {
        error: 'Team lead profile not found',
      });
    }

    if (
      leadProfile.role !== 'team_lead' ||
      leadProfile.status !== 'active'
    ) {
      return jsonResponse(403, {
        error: 'Team lead account is not active',
      });
    }

    return jsonResponse(200, {
      success: true,
      teamId: team.id,
      teamLeadEmail: leadProfile.email,
    });
  } catch (err: any) {
    console.error('[team-login]', err);

    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}