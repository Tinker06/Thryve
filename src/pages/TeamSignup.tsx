import { useNavigate } from "react-router-dom";

export default function TeamSignup() {
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate("/team-workspace");
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="eyebrow">TEAM SIGNUP / 00A</div>
        <h2>CREATE THE TEAM.</h2>

        <label>Team name</label>
        <input placeholder="StudySync" />

        <label>Team email</label>
        <input placeholder="team@example.com" />

        <label>Team lead name</label>
        <input placeholder="Priya" />

        <label>Team lead email</label>
        <input placeholder="priya@example.com" />

        <label>Password</label>
        <input type="password" placeholder="Create a password" />

        <button className="btn" type="submit">
          CONTINUE →
        </button>
      </form>
    </div>
  );
}