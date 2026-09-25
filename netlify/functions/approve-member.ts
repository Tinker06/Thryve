import { getAdminClient, jsonResponse } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const {
      teamId,
      approverUserId,
      memberUserId,
      decision,
    } = JSON.parse(event.body || '{}');

    if (!teamId || !approverUserId || !memberUserId || !decision) {
      return jsonResponse(400, { error: 'Missing fields' });
    }

    if (decision !== 'approve' && decision !== 'reject') {
      return jsonResponse(400, { error: 'Invalid decision' });
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
        error: 'Only team lead can approve members',
      });
    }

    const newStatus =
      decision === 'approve' ? 'active' : 'deactivated';

    await admin
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', memberUserId);

    await admin
      .from('team_members')
      .update({ status: newStatus })
      .eq('team_id', teamId)
      .eq('user_id', memberUserId);

    await admin.from('activity_logs').insert({
      team_id: teamId,
      actor_id: approverUserId,
      action: `member_${decision}d`,
      metadata: { memberUserId },
    });

    return jsonResponse(200, {
      success: true,
      status: newStatus,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
