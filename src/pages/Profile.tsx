import { useState, useEffect } from "react";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";
import { supabase } from "../lib/supabase";
import { useCurrentUser } from "../lib/useCurrentUser";

export default function Profile() {
  const { profile } = useCurrentUser();
  const { toastMessage, showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name);
    setEmail(profile.email);
    setDescription(profile.personal_description ?? "");
    setSkills((profile.skills ?? []).join(", "));
  }, [profile]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function saveProfile() {
    // TODO: call Person 1's updateProfile({ name, email, description, skills })
    showToast("Profile updated ✓");
  }

    async function changePassword() {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
      return;
    }
    showToast("Password changed ✓");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">MY ACCOUNT / PERSONALISATION</div>
          <h2>PROFILE.</h2>
        </div>
        <span className="pill">PRIYA / TEAM LEAD</span>
      </div>

      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="panel">
          <h3>ABOUT ME</h3>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Personal description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <label>Skills</label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} />
          <button className="btn" onClick={saveProfile}>SAVE PROFILE</button>
        </div>

        <div className="panel">
          <h3>SECURITY</h3>
          <p className="small">New users receive a random password by email. After first login they can replace it here.</p>
          <label>Current password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <label>New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
          <label>Confirm password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
          {passwordError && <div className="notice red">{passwordError}</div>}
          <button className="btn pink" onClick={changePassword}>CHANGE PASSWORD</button>
          <div className="notice blue">
            Demo only: a real build should use hashed passwords, email
            verification and session-based authentication.
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </section>
  );
}