import {
  getAdminClient,
  jsonResponse,
  randomTempPassword,
} from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed',
    });
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
      teamCode,
    } = JSON.parse(event.body || '{}');

    if (
      !teamId ||
      !requestedByUserId ||
      !email ||
      !fullName
    ) {
      return jsonResponse(400, {
        error: 'Missing fields',
      });
    }

    const admin = getAdminClient();

    // 1. Verify requester is team lead
    const { data: requester, error: requesterError } =
      await admin
        .from('profiles')
        .select('role, team_id, full_name, email')
        .eq('id', requestedByUserId)
        .maybeSingle();

    if (requesterError) {
      return jsonResponse(500, {
        error: requesterError.message,
      });
    }

    if (
      !requester ||
      requester.team_id !== teamId ||
      requester.role !== 'team_lead'
    ) {
      return jsonResponse(403, {
        error: 'Only the team lead can add members',
      });
    }

    // 2. Get team information
    const { data: team } = await admin
      .from('teams')
      .select('team_code, team_name')
      .eq('id', teamId)
      .maybeSingle();

    if (!team) {
      return jsonResponse(404, {
        error: 'Team not found',
      });
    }

    // 3. Generate temporary password
    const tempPassword = randomTempPassword();

    // 4. Create Supabase Auth user
    const {
      data: authUser,
      error: authError,
    } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError || !authUser.user) {
      return jsonResponse(400, {
        error:
          authError?.message ||
          'Could not create user',
      });
    }

    // 5. Create profile
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        team_id: teamId,
        full_name: fullName,
        email,
        personal_description:
          personalDescription || null,
        skills: skills || [],
        learning_style:
          learningStyle || null,
        role: 'member',
        status: 'pending_approval',
      });

    if (profileError) {
      await admin.auth.admin.deleteUser(
        authUser.user.id
      );

      return jsonResponse(400, {
        error: profileError.message,
      });
    }

    // 6. Add to team_members
    const { error: memberError } = await admin
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: authUser.user.id,
        status: 'pending_approval',
        added_by: requestedByUserId,
      });

    if (memberError) {
      return jsonResponse(400, {
        error: memberError.message,
      });
    }

    // 7. Notify team lead
    await admin.from('notifications').insert({
      team_id: teamId,
      recipient_user_id: requestedByUserId,
      type: 'NEW_USER_REQUEST',
      title: 'New member pending approval',
      message: `${fullName} (${email}) was added and is awaiting approval.`,
    });

    // 8. Send temporary password email
    try {
      const emailResponse = await fetch(
        `${process.env.URL || ''}/.netlify/functions/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'TEMPORARY_PASSWORD',
            to: email,
            data: {
              fullName,
              teamCode: team.team_code,
              tempPassword,
            },
          }),
        }
      );

      const emailResult =
        await emailResponse.json();

      return jsonResponse(200, {
        success: true,
        userId: authUser.user.id,
        emailSent: emailResult.success === true,
      });
    } catch (emailError) {
      console.error(
        'Email sending failed:',
        emailError
      );

      return jsonResponse(200, {
        success: true,
        userId: authUser.user.id,
        emailSent: false,
      });
    }
  } catch (err: any) {
    console.error('Add member error:', err);

    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
