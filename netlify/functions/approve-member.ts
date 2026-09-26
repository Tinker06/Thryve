import { getAdminClient, jsonResponse } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed',
    });
  }

  try {
    const {
      teamId,
      approverUserId,
      targetUserId,
    } = JSON.parse(event.body || '{}');

    if (!teamId || !approverUserId || !targetUserId) {
      return jsonResponse(400, {
        error: 'Missing fields',
      });
    }

    const admin = getAdminClient();

    // 1. Verify approver is the team lead
    const { data: approver, error: approverError } =
      await admin
        .from('profiles')
        .select('role, team_id, status')
        .eq('id', approverUserId)
        .maybeSingle();

    if (approverError) {
      return jsonResponse(500, {
        error: approverError.message,
      });
    }

    if (
      !approver ||
      approver.team_id !== teamId ||
      approver.role !== 'team_lead' ||
      approver.status !== 'active'
    ) {
      return jsonResponse(403, {
        error: 'Only an active team lead can approve members',
      });
    }

    // 2. Verify target member belongs to this team
    const { data: member, error: memberError } =
      await admin
        .from('profiles')
        .select('id, team_id, status, full_name, email')
        .eq('id', targetUserId)
        .eq('team_id', teamId)
        .maybeSingle();

    if (memberError) {
      return jsonResponse(500, {
        error: memberError.message,
      });
    }

    if (!member) {
      return jsonResponse(404, {
        error: 'Member not found',
      });
    }

    if (member.status !== 'pending_approval') {
      return jsonResponse(400, {
        error: 'Member is not pending approval',
      });
    }

    // 3. Activate profile
    const { error: profileUpdateError } =
      await admin
        .from('profiles')
        .update({
          status: 'active',
        })
        .eq('id', targetUserId)
        .eq('team_id', teamId);

    if (profileUpdateError) {
      return jsonResponse(500, {
        error: profileUpdateError.message,
      });
    }

    // 4. Activate team membership
    const { error: membershipUpdateError } =
      await admin
        .from('team_members')
        .update({
          status: 'active',
        })
        .eq('team_id', teamId)
        .eq('user_id', targetUserId);

    if (membershipUpdateError) {
      return jsonResponse(500, {
        error: membershipUpdateError.message,
      });
    }

    // 5. Record activity
    await admin.from('activity_logs').insert({
      team_id: teamId,
      actor_id: approverUserId,
      action: 'member_approved',
      metadata: {
        targetUserId,
        memberName: member.full_name,
        memberEmail: member.email,
      },
    });

    // 6. Notify the member
    await admin.from('notifications').insert({
      team_id: teamId,
      recipient_user_id: targetUserId,
      type: 'NEW_USER_REQUEST',
      title: 'Membership approved',
      message:
        'Your THRYVE team membership has been approved.',
    });

    return jsonResponse(200, {
      success: true,
      userId: targetUserId,
    });
  } catch (err: any) {
    console.error('Approve member error:', err);

    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
