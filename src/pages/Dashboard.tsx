import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import WelcomePanel from "../components/dashboard/WelcomePanel";
import SprintUpdatePanel from "../components/dashboard/SprintUpdatePanel";
import SprintDeadlinePanel from "../components/dashboard/SprintDeadlinePanel";
import DocumentsPanel from "../components/dashboard/DocumentsPanel";
import RequestWorkPanel from "../components/dashboard/RequestWorkPanel";
import AiPlaceholderPanel from "../components/dashboard/AiPlaceholderPanel";
import AiPlaceholderModal from "../components/dashboard/AiPlaceholderModal";
import ChatWidget from "../components/chat/ChatWidget";
import AiRecommendationPanel from "../components/dashboard/AiRecommendationPanel";
import TeamGlancePanel from "../components/dashboard/TeamGlancePanel";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import { useToast } from "../components/ui/useToast";
import Toast from "../components/ui/Toast";
import { useCurrentUser } from "../lib/useCurrentUser";
import type { DashboardTask, DeadlineChecklistItem } from "../lib/uiTypes";

// TODO: replace once there's a real "current project" concept
// (a project-select screen result, a route param, or a projects table query)
const CURRENT_PROJECT_ID = "REPLACE_WITH_REAL_PROJECT_ID";

const demoTasks: DashboardTask[] = [
  { id: "t1", title: "Build auth API", timeRange: "09:00–11:00 • completed", status: "DONE" },
  { id: "t2", title: "Connect dashboard", timeRange: "11:30–13:00 • in progress", status: "IN_PROGRESS" },
  { id: "t3", title: "Review AI insights", timeRange: "14:00–15:00 • blocked by API question", status: "BLOCKED" },
];

const demoChecklist: DeadlineChecklistItem[] = [
  { id: "c1", title: "Auth API", meta: "Priya • deadline 11:00 • completed 10:42", done: true, late: false },
  { id: "c2", title: "Dashboard shell", meta: "Arun • deadline 13:00 • completed 12:35", done: true, late: false },
  { id: "c3", title: "Knowledge metrics", meta: "Meena • deadline 15:00 • still in progress", done: false, late: false },
  { id: "c4", title: "Deployment checklist", meta: "Vishal • deadline 16:00 • completed 16:24", done: true, late: true },
];

export default function Dashboard() {
  const { profile, loading: profileLoading } = useCurrentUser();
  const [tasks] = useState<DashboardTask[]>(demoTasks);
  const [checklist] = useState<DeadlineChecklistItem[]>(demoChecklist);
  const [placeholderModalOpen, setPlaceholderModalOpen] = useState(false);
  const { toastMessage, showToast } = useToast();

  const blockedTaskId = tasks.find((t) => t.status === "BLOCKED")?.id ?? null;
  const displayName = profile?.full_name ?? (profileLoading ? "…" : "Guest");
  const displayRole = profile?.role === "team_lead" ? "TEAM LEAD" : "MEMBER";

  return (
    <div className="dashboard">
      <Sidebar memberName={displayName} memberRole={displayRole} projectName="StudySync" />

      <div className="dash-main">
        <WelcomePanel
          memberFirstName={profile?.full_name?.split(" ")[0] ?? "there"}
          teamProgress={72}
          myProgress={84}
          openTasks={3}
        />

        <SprintUpdatePanel
          tasks={tasks}
          onUpdateStatus={() => showToast("Work update saved ✓")}
          onRequestHelp={() => showToast("Team notified: you requested help ✓")}
        />

        <SprintDeadlinePanel items={checklist} completedCount={8} totalCount={12} />

        <DocumentsPanel onNotify={showToast} />

        <RequestWorkPanel onNotify={showToast} />

        <AiPlaceholderPanel
          disabled={!blockedTaskId}
          onOpenModal={() => setPlaceholderModalOpen(true)}
        />

        <ChatWidget
          userId={profile?.id ?? null}
          projectId={CURRENT_PROJECT_ID}
          myDisplayName={profile?.full_name ?? "You"}
        />
      </div>

      <aside className="dash-rail">
        <AiRecommendationPanel onPropose={() => showToast("Activity proposed to team ✓")} />
        <TeamGlancePanel />
        <AlertsPanel userId={profile?.id ?? null} />
      </aside>

      <AiPlaceholderModal
        open={placeholderModalOpen}
        projectId={CURRENT_PROJECT_ID}
        taskId={blockedTaskId}
        onClose={() => setPlaceholderModalOpen(false)}
        onApprove={() => showToast("Placeholder approved and added to your workspace ✓")}
      />

      <Toast message={toastMessage} />
    </div>
  );
}