import { getAdminClient, jsonResponse } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const {
      teamId,
      requestedByUserId,
      name,
      description,
    } = JSON.parse(event.body || '{}');

    if (!teamId || !requestedByUserId || !name?.trim()) {
      return jsonResponse(400, { error: 'Missing required fields' });
    }

    const admin = getAdminClient();

    const { data: requester, error: requesterError } = await admin
      .from('profiles')
      .select('id, team_id, role, status')
      .eq('id', requestedByUserId)
      .single();

    if (
      requesterError ||
      !requester ||
      requester.team_id !== teamId ||
      requester.role !== 'team_lead' ||
      requester.status !== 'active'
    ) {
      return jsonResponse(403, {
        error: 'Only an active team lead can create projects',
      });
    }

    const { data: project, error: projectError } = await admin
      .from('projects')
      .insert({
        team_id: teamId,
        name: name.trim(),
        description: description?.trim() || null,
        created_by: requestedByUserId,
        status: 'active',
      })
      .select()
      .single();

    if (projectError || !project) {
      return jsonResponse(400, {
        error: projectError?.message || 'Could not create project',
      });
    }

    const { data: members, error: membersError } = await admin
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('status', 'active');

    if (membersError) {
      return jsonResponse(500, {
        error: membersError.message,
      });
    }

    const projectMemberRows = (members ?? []).map((member) => ({
      project_id: project.id,
      team_id: teamId,
      user_id: member.user_id,
    }));

    if (projectMemberRows.length > 0) {
      const { error: membershipError } = await admin
        .from('project_members')
        .insert(projectMemberRows);

      if (membershipError) {
        await admin.from('projects').delete().eq('id', project.id);

        return jsonResponse(400, {
          error: membershipError.message,
        });
      }
    }

    return jsonResponse(200, {
      success: true,
      project,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}