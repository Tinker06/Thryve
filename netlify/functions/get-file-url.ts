import { getAdminClient, jsonResponse } from './_supabaseAdmin';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Method not allowed',
    });
  }

  try {
    const { documentId, userId } = JSON.parse(event.body || '{}');

    if (!documentId || !userId) {
      return jsonResponse(400, {
        error: 'Missing fields',
      });
    }

    const admin = getAdminClient();

    const { data: doc, error: docError } = await admin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return jsonResponse(404, {
        error: 'Not found',
      });
    }

    const isOwner = doc.owner_user_id === userId;
    let isAuthorized = isOwner;

    if (!isOwner && doc.visibility === 'SHARED') {
      const { data: member } = await admin
        .from('project_members')
        .select('id')
        .eq('project_id', doc.project_id)
        .eq('user_id', userId)
        .maybeSingle();

      isAuthorized = !!member;
    }

    if (!isAuthorized) {
      return jsonResponse(403, {
        error: 'Not authorized to access this file',
      });
    }

    const { data: signed, error } = await admin.storage
      .from('project-files')
      .createSignedUrl(doc.storage_path, 60 * 10);

    if (error) {
      return jsonResponse(500, {
        error: error.message,
      });
    }

    return jsonResponse(200, {
      success: true,
      url: signed.signedUrl,
    });
  } catch (err: any) {
    return jsonResponse(500, {
      error: err.message || 'Server error',
    });
  }
}
