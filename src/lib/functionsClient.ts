// Typed wrapper around Person 1's Netlify Functions.
// Frontend calls these through /.netlify/functions/*

async function callFunction<T>(
  functionName: string,
  body: unknown
): Promise<T> {
  const response = await fetch(
    `/.netlify/functions/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `${functionName} returned a non-JSON response (HTTP ${response.status})`
    );
  }

  if (!response.ok || data?.error) {
    throw new Error(
      data?.error || `${functionName} failed (HTTP ${response.status})`
    );
  }

  return data as T;
}

// ---------------- TEAM SIGNUP ----------------

export interface TeamSignupPayload {
  teamName: string;
  teamEmail: string;
  teamLeadName: string;
  teamLeadEmail: string;
  password: string;
}

export interface TeamSignupResult {
  success: true;
  teamId: string;
  teamCode: string;
}

export function teamSignup(payload: TeamSignupPayload) {
  return callFunction<TeamSignupResult>("team-signup", payload);
}

// ---------------- TEAM LOGIN ----------------

export interface TeamLoginPayload {
  teamEmail: string;
  teamCode: string;
  password: string;
}

export interface TeamLoginResult {
  success: true;
  teamId: string;
  accessToken: string;
  refreshToken: string;
}

export function teamLogin(payload: TeamLoginPayload) {
  return callFunction<TeamLoginResult>("team-login", payload);
}

// ---------------- ADD MEMBER ----------------

export interface AddMemberPayload {
  teamId: string;
  requestedByUserId: string;
  email: string;
  fullName: string;
  personalDescription?: string;
  skills?: string[];
  learningStyle?: string;
}

export interface AddMemberResult {
  success: true;
  userId: string;
}

export function addMember(payload: AddMemberPayload) {
  return callFunction<AddMemberResult>("add-member", payload);
}

// ---------------- APPROVE MEMBER ----------------

export interface ApproveMemberPayload {
  teamId: string;
  approverUserId: string;
  targetUserId: string;
}

export interface ApproveMemberResult {
  success: true;
  status: "active" | "deactivated";
}

export function approveMember(payload: ApproveMemberPayload) {
  return callFunction<ApproveMemberResult>("approve-member", payload);
}

// ---------------- REQUEST DELETE USER ----------------

export interface RequestDeleteUserPayload {
  teamId: string;
  requestedByUserId: string;
  targetUserName: string;
  targetUserEmail: string;
}

export interface RequestDeleteUserResult {
  success: true;
  targetUserId: string;
}

export function requestDeleteUser(payload: RequestDeleteUserPayload) {
  return callFunction<RequestDeleteUserResult>(
    "request-delete-user",
    payload
  );
}

// ---------------- APPROVE DELETE USER ----------------

export interface ApproveDeleteUserPayload {
  teamId: string;
  approverUserId: string;
  targetUserId: string;
}

export interface ApproveDeleteUserResult {
  success: true;
}

export function approveDeleteUser(
  payload: ApproveDeleteUserPayload
) {
  return callFunction<ApproveDeleteUserResult>(
    "approve-delete-user",
    payload
  );
}

// ---------------- GET FILE URL ----------------

export interface GetFileUrlPayload {
  documentId: string;
  userId: string;
}

export interface GetFileUrlResult {
  success: true;
  url: string;
}

export function getFileUrl(payload: GetFileUrlPayload) {
  return callFunction<GetFileUrlResult>(
    "get-file-url",
    payload
  );
}

// ---------------- SEND EMAIL ----------------

export interface SendEmailPayload {
  type: string;
  to: string;
  data: unknown;
}

export function sendEmail(payload: SendEmailPayload) {
  return callFunction("send-email", payload);
}

// ---------------- AI FUNCTION ----------------

export interface CallAiPayload {
  action: string;
  payload: unknown;
}

export function callAI(payload: CallAiPayload) {
  return callFunction("ai", payload);
}