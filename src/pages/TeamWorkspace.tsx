import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";
import { approveMember } from "../lib/functionsClient";
import { useCurrentUser } from "../lib/useCurrentUser";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";

export default function TeamWorkspace() {
  const { profile } = useCurrentUser();
  const { toastMessage, showToast } = useToast();
  const [pendingMembers, setPendingMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("team_id", profile!.team_id)
        .eq("status", "pending_approval");
      if (!cancelled) {
        if (!error && data) setPendingMembers(data as Profile[]);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [profile]);

  async function resolveMember(memberUserId: string, decision: "approve" | "reject") {
    if (!profile) return;
    try {
      await approveMember({
        teamId: profile.team_id,
        approverUserId: profile.id,
        targetUserId: memberUserId,
      });
      setPendingMembers((prev) => prev.filter((m) => m.id !== memberUserId));
      showToast(decision === "approve" ? "User approved ✓" : "User request rejected");
    } catch (err: any) {
      showToast(err?.message ?? "Could not process approval.");
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">TEAM CONTROL PANEL</div>
          <h2>CHOOSE YOUR MOVE.</h2>
        </div>
      </div>

      {pendingMembers.length > 0 && (
        <div className="notice green">✓ Team lead inbox: <b>{pendingMembers.length} new member(s) waiting</b></div>
      )}

      <div className="choice-grid">
        <Link to="/projects" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="choice">
            <span className="tag">PROJECTS</span>
            <h3>Create / choose project</h3>
            <p>Choose an existing project or create a new one with name, description and member count.</p>
          </div>
        </Link>
        <Link to="/user-signup" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="choice">
            <span className="tag teal">ADD USER</span>
            <h3>New user signup</h3>
            <p>Collect email + personalisation. A random temporary password is emailed.</p>
          </div>
        </Link>
        <Link to="/member-login" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="choice">
            <span className="tag pink">PROJECT LOGIN</span>
            <h3>Enter a project</h3>
            <p>Members log in separately once a project has been selected.</p>
          </div>
        </Link>
      </div>

      <div className="panel" style={{ marginTop: 20, padding: 20 }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 30, margin: "0 0 14px" }}>LEAD APPROVAL QUEUE</h3>

        {loading && <p>Loading pending requests…</p>}
        {!loading && pendingMembers.length === 0 && <p>No new members pending.</p>}

        {pendingMembers.map((member) => (
          <div key={member.id} style={{ border: "2px solid var(--ink)", padding: 12, background: "#d6e5ff", marginTop: 10 }}>
            <b>NEW USER: {member.full_name}</b>
            <br />
            <small>{member.email}{member.personal_description ? ` — ${member.personal_description}` : ""}</small>
            <br />
            <button className="btn" onClick={() => resolveMember(member.id, "approve")}>APPROVE</button>{" "}
            <button className="btn paper" onClick={() => resolveMember(member.id, "reject")}>REJECT</button>
          </div>
        ))}

        <div className="notice blue" style={{ marginTop: 14 }}>
          Delete-user and document-share approvals aren't wired to real data
          yet — the backend doesn't currently expose a way to list them as a
          resolvable queue (see integration notes). Ask Person 1 about adding
          a status/metadata field so these can be listed here the same way
          new-member requests are.
        </div>
      </div>

      <Toast message={toastMessage} />
    </section>
  );
}