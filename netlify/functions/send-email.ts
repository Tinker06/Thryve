import { jsonResponse } from './_supabaseAdmin';

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL as string;
const SENDER_NAME = 'THRYVE';

const templates: Record<
  string,
  (data: any) => { subject: string; html: string }
> = {
  NEW_USER_REQUEST: (d) => ({
    subject: `New member request: ${d.memberName}`,
    html: `<p>${d.memberName} (${d.memberEmail}) requested to join your team and needs approval.</p>`,
  }),

  DELETE_USER_REQUEST: (d) => ({
    subject: `Removal requested: ${d.targetUserName}`,
    html: `<p>${d.targetUserName} (${d.targetUserEmail}) was requested for removal. Please approve or reject.</p>`,
  }),

  DOCUMENT_SHARE_REQUEST: (d) => ({
    subject: `Document access requested: ${d.fileName}`,
    html: `<p>${d.requesterName} requested access to ${d.fileName}.</p>`,
  }),

  WORK_REQUEST: (d) => ({
    subject: `Work request from ${d.requesterName}`,
    html: `<p>${d.requesterName} requested completed work on task "${d.taskTitle}".</p>`,
  }),

  BLOCKED_USER: (d) => ({
    subject: `${d.memberName} is blocked`,
    html: `<p>${d.memberName} marked task "${d.taskTitle}" as blocked: ${d.reason}</p>`,
  }),

  TEMPORARY_PASSWORD: (d) => ({
    subject: `Welcome to THRYVE — your temporary password`,
    html: `
      <p>Hi ${d.fullName},</p>
      <p>Your team code is <b>${d.teamCode}</b>.</p>
      <p>Your temporary password is: <b>${d.tempPassword}</b></p>
      <p>Please log in and change it.</p>
    `,
  }),
};

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { type, to, data } = JSON.parse(event.body || '{}');

    if (!type || !to || !data) {
      return jsonResponse(400, { error: 'Missing fields' });
    }

    const template = templates[type];

    if (!template) {
      return jsonResponse(400, {
        error: 'Unknown email type',
      });
    }

    const { subject, html } = template(data);

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY as string,
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();

      return jsonResponse(200, {
        success: false,
        error: `Email unavailable: ${errText}`,
      });
    }

    return jsonResponse(200, {
      success: true,
    });
  } catch (err: any) {
    return jsonResponse(200, {
      success: false,
      error: err.message || 'Email unavailable',
    });
  }
}
