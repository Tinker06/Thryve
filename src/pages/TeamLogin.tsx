import { Link } from "react-router-dom";
export default function TeamLogin() {
  return (
    <div className="form-shell">
      <div className="form-card">
        <div className="eyebrow">TEAM WORKSPACE / 00</div>
        <h2>WELCOME, TEAM.</h2>
        <p>
          <b>Team login is the top-level gate. Projects and members live inside this workspace.</b>
        </p>
        <label>Team email</label>
        <input type="email" placeholder="team@example.com" />
        <label>Team ID</label>
        <input placeholder="STUDY-01" />
        <label>Password</label>
        <input type="password" placeholder="••••••••" />
        <br />
        <br />
       <Link to="/team-workspace">
  <button className="btn">LOGIN TO TEAM →</button>
</Link>
        <Link to="/team-signup"><button className="btn pink" type="button">NEW TEAM SIGNUP +</button></Link>
      </div>
    </div>
  );
}