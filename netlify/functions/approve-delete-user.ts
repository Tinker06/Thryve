import { getAdminClient, jsonResponse } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const {
      teamId,
      approverUserId,
      targetUserId,
    } = JSON.parse(event.body || '{}');

    if (!teamId || !approverUserId || !targetUserId) {
      return jsonResponse(400, { error: 'Missing fields' });
    }

    const admin = getAdminClient();

    const { data: approver } = await admin
      .from('profiles')
      .select('role, team_id')
      .eq('id', approverUserId)
      .single();

    if (
      !approver ||
      approver.team_id !== teamId ||
      approver.role !== 'team_lead'
    ) {
      return jsonResponse(403, {
        error: 'Only team lead can approve deletion',
      });
    }

    await admin
      .from('profiles')
      .update({ status: 'deactivated' })
      .eq('id', targetUserId);

    await admin
      .from('team_members')
      .update({ status: 'deactivated' })
      .eq('team_id', teamId)
      .eq('user_id', targetUserId);

    await admin
      .from('project_members')
      .delete()
      .eq('user_id', targetUserId);

    await admin.from('activity_logs').insert({
      team_id: teamId,
      actor_id: approverUserId,
      action: 'member_deactivated',
      metadata: { targetUserId },
    });

    return jsonResponse(200, {
      success: true,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
