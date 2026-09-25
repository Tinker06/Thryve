import { getAdminClient, jsonResponse } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const {
      teamId,
      requestedByUserId,
      targetUserName,
      targetUserEmail,
    } = JSON.parse(event.body || '{}');

    if (!teamId || !requestedByUserId || !targetUserName || !targetUserEmail) {
      return jsonResponse(400, { error: 'Missing fields' });
    }

    const admin = getAdminClient();

    const { data: target } = await admin
      .from('profiles')
      .select('id, team_id, full_name, email')
      .eq('email', targetUserEmail)
      .eq('team_id', teamId)
      .single();

    if (!target || target.full_name !== targetUserName) {
      return jsonResponse(400, {
        error: 'Name/email do not match an existing member',
      });
    }

    const { data: team } = await admin
      .from('teams')
      .select('team_lead_user_id')
      .eq('id', teamId)
      .single();

    await admin.from('notifications').insert({
      team_id: teamId,
      recipient_user_id: team?.team_lead_user_id,
      type: 'DELETE_USER_REQUEST',
      title: 'Member deletion requested',
      message: `${targetUserName} (${targetUserEmail}) was requested for removal.`,
    });

    await admin.from('activity_logs').insert({
      team_id: teamId,
      actor_id: requestedByUserId,
      action: 'delete_user_requested',
      metadata: { targetUserId: target.id },
    });

    return jsonResponse(200, {
      success: true,
      targetUserId: target.id,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
