import { useEffect, useState } from 'react';
import ReportFilters from '../components/reports/ReportFilters';
import TeamReport from '../components/reports/TeamReport';
import MemberReport from '../components/reports/MemberReport';
import { fetchActiveSprintId, fetchReportTasks } from '../lib/reportsData';
import { buildMemberRows, withStatus, type ReportTaskView } from '../lib/reportCalculations';
import '../styles/reports-print.css';

interface ReportsProps {
  projectId: string;
}

export default function Reports({ projectId }: ReportsProps) {
  const [tasks, setTasks] = useState<ReportTaskView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportType, setReportType] = useState<'team' | 'member'>('team');
  const [period, setPeriod] = useState('SPRINT 01');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const sprintId = period === 'SPRINT 01' ? await fetchActiveSprintId(projectId) : undefined;
        const raw = await fetchReportTasks(projectId, period, sprintId);
        if (!cancelled) setTasks(withStatus(raw));
      } catch (err) {
        if (!cancelled) {
          // Empty-report / no-tasks case is handled gracefully by the child
          // components (they render a "no tasks yet" notice), so this only
          // fires for genuine fetch failures.
          setError(err instanceof Error ? err.message : 'Could not load report data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, period, refreshKey]);

  const memberRows = buildMemberRows(tasks);
  const memberTasks = selectedMemberId ? tasks.filter((t) => t.member_id === selectedMemberId) : [];

  function handleSelectMember(memberId: string, memberName: string) {
    setSelectedMemberId(memberId);
    setSelectedMemberName(memberName);
    setReportType('member');
  }

  function handleReportTypeChange(type: 'team' | 'member') {
    setReportType(type);
    if (type === 'team') setSelectedMemberId(null);
  }

  function handlePrint() {
    const previousTitle = document.title;
    document.title = reportType === 'team' ? 'THRYVE — Team Report' : `THRYVE — ${selectedMemberName} Report`;
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 500);
  }

  return (
    <section id="reports" className="screen active report-page">
      <div className="report-hero">
        <div className="eyebrow">TEAM INTELLIGENCE / REPORT GENERATOR</div>
        <h2 className="report-title">{reportType === 'team' ? 'TEAM REPORT' : `${selectedMemberName || 'MEMBER'} REPORT`}</h2>
        <p className="report-subtitle">
          Turn sprint activity into a clean team or member report — work done, timed checklist, task/risk count,
          efficiency, estimated time and actual completed time.
        </p>
        <ReportFilters
          reportType={reportType}
          period={period}
          onReportTypeChange={handleReportTypeChange}
          onPeriodChange={setPeriod}
          onGenerate={() => {
            /* Data is already kept in sync with `period` via the effect above;
               this button re-runs the same fetch to give an explicit
               "regenerate" affordance if the user wants a manual refresh. */
            setRefreshKey((key) => key + 1);
          }}
          onPrint={handlePrint}
        />
      </div>

      <div className="report-tabs" id="reportTabs">
        <button className={reportType === 'team' ? 'active' : ''} onClick={() => handleReportTypeChange('team')}>
          TEAM
        </button>
        {memberRows.map((row) => (
          <button
            key={row.member_id}
            className={selectedMemberId === row.member_id ? 'active' : ''}
            data-member={row.member_name}
            onClick={() => handleSelectMember(row.member_id, row.member_name)}
          >
            {row.member_name.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div className="notice blue">Loading report…</div>}
      {error && <div className="notice red">{error}</div>}

      {!loading && !error && reportType === 'team' && (
        <TeamReport tasks={tasks} memberRows={memberRows} onSelectMember={handleSelectMember} />
      )}

      {!loading && !error && reportType === 'member' && selectedMemberId && (
        <MemberReport
          memberName={selectedMemberName}
          tasks={memberTasks}
          onBackToTeam={() => handleReportTypeChange('team')}
        />
      )}

      {!loading && !error && reportType === 'member' && !selectedMemberId && (
        <div className="notice blue">Pick a member tab above to see their report.</div>
      )}
    </section>
  );
}
