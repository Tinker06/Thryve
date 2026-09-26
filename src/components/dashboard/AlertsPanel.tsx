import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead } from "../../lib/api";
import type { Notification } from "../../lib/types";

interface AlertsPanelProps {
  userId: string | null;
}

const noticeClassByType: Record<Notification["type"], string> = {
  NEW_USER_REQUEST: "blue",
  DELETE_USER_REQUEST: "red",
  DOCUMENT_SHARE_REQUEST: "blue",
  WORK_REQUEST: "blue",
  BLOCKED_USER: "pink",
  LATE_TASK: "pink",
  AI_SPRINT_READY: "green",
  AI_SPRINT_CHANGE: "green",
  COLLABORATION_RECOMMENDATION: "green",
};

export default function AlertsPanel({ userId }: AlertsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const rows = await getNotifications(userId!);
        if (!cancelled) setNotifications((rows as Notification[]).filter((n) => !n.read));
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  async function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await markNotificationRead(id);
    } catch {
      // silently ignore for now — worst case it reappears on next load
    }
  }

  return (
    <div className="panel">
      <h3>ALERTS</h3>

      {!userId && <p className="small">Log in to see alerts.</p>}
      {loading && userId && <p className="small">Loading alerts…</p>}
      {loadError && <div className="notice red">Alerts unavailable right now.</div>}
      {!loading && !loadError && userId && notifications.length === 0 && (
        <p className="small">No new alerts.</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notice ${noticeClassByType[n.type]}`}
          style={{ cursor: "pointer" }}
          onClick={() => dismiss(n.id)}
          title="Click to mark as read"
        >
          <b>{n.title}</b>
          <br />
          {n.message}
        </div>
      ))}
    </div>
  );
}