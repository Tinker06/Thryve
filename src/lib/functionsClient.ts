// Thin, typed wrapper around Person 1's netlify/functions/*.ts endpoints.
// Each function there returns { error: string } on failure, or its own
// success shape (no shared envelope like aiClient.ts's { success, data }),
// so we normalize by throwing on any failure and letting callers try/catch.

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`${name} returned a non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok || json?.error) {
    throw new Error(json?.error || `${name} failed (HTTP ${res.status})`);
  }

  return json as T;
}

// ---- team-signup ----
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

// ---- team-login ----
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

// ---- add-member ----
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

// ---- approve-member ----
export interface ApproveMemberPayload {
  teamId: string;
  approverUserId: string;
  memberUserId: string;
  decision: "approve" | "reject";
}
export interface ApproveMemberResult {
  success: true;
  status: "active" | "deactivated";
}
export function approveMember(payload: ApproveMemberPayload) {
  return callFunction<ApproveMemberResult>("approve-member", payload);
}

// ---- approve-delete-user ----
export interface ApproveDeleteUserPayload {
  teamId: string;
  approverUserId: string;
  targetUserId: string;
}
export interface ApproveDeleteUserResult {
  success: true;
}
export function approveDeleteUser(payload: ApproveDeleteUserPayload) {
  return callFunction<ApproveDeleteUserResult>("approve-delete-user", payload);
}

// ---- request-delete-user ----
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
  return callFunction<RequestDeleteUserResult>("request-delete-user", payload);
}

// ---- get-file-url ----
export interface GetFileUrlPayload {
  documentId: string;
  userId: string;
}
export interface GetFileUrlResult {
  success: true;
  url: string;
}
export function getFileUrl(payload: GetFileUrlPayload) {
  return callFunction<GetFileUrlResult>("get-file-url", payload);
}