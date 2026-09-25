import { getAdminClient, jsonResponse, generateTeamCode } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const {
      teamName,
      teamEmail,
      teamLeadName,
      teamLeadEmail,
      password,
    } = JSON.parse(event.body || '{}');

    if (
      !teamName ||
      !teamEmail ||
      !teamLeadName ||
      !teamLeadEmail ||
      !password
    ) {
      return jsonResponse(400, { error: 'Missing required fields' });
    }

    const admin = getAdminClient();

    // 1. Create authentication user
    const { data: authUser, error: authError } =
      await admin.auth.admin.createUser({
        email: teamLeadEmail,
        password,
        email_confirm: true,
      });

    if (authError || !authUser.user) {
      return jsonResponse(400, {
        error: authError?.message || 'Could not create user',
      });
    }

    const teamCode = generateTeamCode();

    // 2. Create team
    const { data: team, error: teamError } = await admin
      .from('teams')
      .insert({
        team_code: teamCode,
        team_name: teamName,
        team_email: teamEmail,
      })
      .select()
      .single();

    if (teamError) {
      await admin.auth.admin.deleteUser(authUser.user.id);

      return jsonResponse(400, {
        error: teamError.message,
      });
    }

    // 3. Create profile
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        team_id: team.id,
        full_name: teamLeadName,
        email: teamLeadEmail,
        role: 'team_lead',
        status: 'active',
      });

    if (profileError) {
      return jsonResponse(400, {
        error: profileError.message,
      });
    }

    // 4. Set team lead
    await admin
      .from('teams')
      .update({
        team_lead_user_id: authUser.user.id,
      })
      .eq('id', team.id);

    // 5. Add lead to team members
    await admin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: authUser.user.id,
        status: 'active',
      });

    return jsonResponse(200, {
      success: true,
      teamId: team.id,
      teamCode,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
