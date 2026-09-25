import { getAdminClient, jsonResponse, randomTempPassword } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const {
      teamId,
      requestedByUserId,
      email,
      fullName,
      personalDescription,
      skills,
      learningStyle,
    } = JSON.parse(event.body || '{}');

    if (!teamId || !email || !fullName) {
      return jsonResponse(400, { error: 'Missing fields' });
    }

    const admin = getAdminClient();

    const { data: requester } = await admin
      .from('profiles')
      .select('role, team_id, full_name, email')
      .eq('id', requestedByUserId)
      .single();

    if (
      !requester ||
      requester.team_id !== teamId ||
      requester.role !== 'team_lead'
    ) {
      return jsonResponse(403, {
        error: 'Only the team lead can add members',
      });
    }

    const tempPassword = randomTempPassword();

    const { data: authUser, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError || !authUser.user) {
      return jsonResponse(400, {
        error: authError?.message || 'Could not create user',
      });
    }

    await admin.from('profiles').insert({
      id: authUser.user.id,
      team_id: teamId,
      full_name: fullName,
      email,
      personal_description: personalDescription || null,
      skills: skills || [],
      learning_style: learningStyle || null,
      role: 'member',
      status: 'pending_approval',
    });

    await admin.from('team_members').insert({
      team_id: teamId,
      user_id: authUser.user.id,
      status: 'pending_approval',
      added_by: requestedByUserId,
    });

    await admin.from('notifications').insert({
      team_id: teamId,
      recipient_user_id: requestedByUserId,
      type: 'NEW_USER_REQUEST',
      title: 'New member pending approval',
      message: `${fullName} (${email}) was added and is awaiting approval.`,
    });

    return jsonResponse(200, {
      success: true,
      userId: authUser.user.id,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
