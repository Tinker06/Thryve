async function callFunction(
  functionName: string,
  body: unknown
) {
  const response = await fetch(
    `/.netlify/functions/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function teamSignup(data: {
  teamName: string;
  teamEmail: string;
  teamLeadName: string;
  teamLeadEmail: string;
  password: string;
}) {
  return callFunction('team-signup', data);
}

export async function teamLogin(data: {
  teamEmail: string;
  teamCode: string;
  password: string;
}) {
  return callFunction('team-login', data);
}

export async function addMember(data: {
  teamId: string;
  requestedByUserId: string;
  email: string;
  fullName: string;
  personalDescription?: string;
  skills?: string[];
  learningStyle?: string;
}) {
  return callFunction('add-member', data);
}

export async function approveMember(data: {
  teamId: string;
  approverUserId: string;
  targetUserId: string;
}) {
  return callFunction('approve-member', data);
}

export async function requestDeleteUser(data: {
  teamId: string;
  requestedByUserId: string;
  targetUserName: string;
  targetUserEmail: string;
}) {
  return callFunction('request-delete-user', data);
}

export async function approveDeleteUser(data: {
  teamId: string;
  approverUserId: string;
  targetUserId: string;
}) {
  return callFunction('approve-delete-user', data);
}

export async function getFileUrl(data: {
  documentId: string;
  userId: string;
}) {
  return callFunction('get-file-url', data);
}

export async function sendEmail(data: {
  type: string;
  to: string;
  data: unknown;
}) {
  return callFunction('send-email', data);
}

export async function callAI(data: {
  action: string;
  payload: unknown;
}) {
  return callFunction('ai', data);
}
