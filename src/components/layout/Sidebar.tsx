import { Link, useLocation } from "react-router-dom";

const sidebarLinks = [
  { to: "/dashboard", label: "▣ Overview" },
  { to: "/sprint", label: "◫ My Sprint" },
  { to: "/sprint-checklist", label: "☑ Sprint Checklist" },
  { to: "/documents", label: "▤ Documents" },
  { to: "/requests", label: "↗ Requests" },
  { to: "/analysis", label: "▣ Analysis" },
  { to: "/reports", label: "▤ Reports" },
  { to: "/insights", label: "✦ AI Insights" },
  { to: "/profile", label: "◎ Profile" },
  { to: "/projects", label: "← Projects" },
];

interface SidebarProps {
  memberName: string;
  memberRole: string;
  projectName: string;
}

export default function Sidebar({ memberName, memberRole, projectName }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="side">
      <div className="profile">
        <div className="avatar">{memberName.charAt(0)}</div>
        <div>
          <b>{memberName}</b>
          <small style={{ display: "block" }}>{memberRole}</small>
        </div>
      </div>
      <h3>{projectName}</h3>
      {sidebarLinks.map((link) => (
        <Link key={link.to} to={link.to} style={{ textDecoration: "none", color: "inherit" }}>
          <button className={location.pathname === link.to ? "active" : ""}>
            {link.label}
          </button>
        </Link>
      ))}
    </aside>
  );
}