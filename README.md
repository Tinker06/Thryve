THRYVE — Reports (Person 4 deliverables)

This covers the code deliverables for Reports/Member Report/PDF export, plus
exact instructions for the integration, QA and deployment steps that need to
run against your real repo, Supabase project, and Netlify account (I don't
have access to any of those, so I can give you the exact commands/clicks but
can't run them for you — see What I could and couldn't do at the bottom).

Files delivered

src/pages/Reports.tsx
src/components/reports/TeamReport.tsx
src/components/reports/MemberReport.tsx
src/components/reports/ReportKpis.tsx
src/components/reports/ReportChecklist.tsx
src/components/reports/ReportEfficiency.tsx
src/components/reports/ReportMemberTable.tsx
src/components/reports/ReportFilters.tsx
src/lib/reportCalculations.ts   <- status logic + efficiency formula
src/lib/reportsData.ts          <- Supabase queries (schema assumed, see file)
src/styles/reports-print.css
netlify.toml

Visual design is reproduced 1:1 from your prototype's Reports screen
(.report-hero, .report-tabs, .report-kpis, .report-check,
.report-efficiency, .report-table, etc.) — same class names, same
structure, now driven by real data instead of the hardcoded reportData
object.

Before this compiles in your app, point the import { supabase } from
'./supabaseClient' line in reportsData.ts at wherever Person 1/2 actually
export the Supabase client, and confirm the tasks/members/sprints
column names against the real schema — the assumptions are documented at the
top of that file.

Efficiency formula (documented, not hardcoded)

efficiency = round(100 * (
    0.40 * completionScore +
    0.35 * deadlineAdherenceScore +
    0.25 * timeAccuracyScore
))

completionScore = doneCount / totalTasks

deadlineAdherenceScore = onTimeCount / completedCount (0 if nothing
completed yet — a fresh sprint doesn't start at an inflated score)

timeAccuracyScore = average of min(estimated/actual, actual/estimated)
over completed tasks — symmetric, penalizes both under- and over-estimates
(0 if nothing completed yet)

The three weights sum to 1, so no separate normalization step is needed
beyond the * 100 and rounding. Weights live in one place
(src/lib/reportCalculations.ts) if you want to tune them.

Deadline analysis (no AI, straight timestamp comparison)

completed_at != null && completed_at <= deadline  -> DONE (before deadline)
completed_at != null && completed_at >  deadline  -> LATE
completed_at == null && now > deadline            -> RISK (overdue)
completed_at == null && now <= deadline           -> PENDING (estimate stays visible)

Git integration

Assuming a standard branch-per-person setup and main as the integration
branch:

git checkout main
git pull origin main

# Bring in each person's branch one at a time so conflicts are easy to isolate
git merge origin/person-1-backend
git merge origin/person-2-frontend
git merge origin/person-3-ai

# Add this Reports work
git add src/pages/Reports.tsx src/components/reports src/lib/reportCalculations.ts src/lib/reportsData.ts src/styles/reports-print.css netlify.toml
git commit -m "feat: reports integration qa and production deployment"
git push origin main

If any merge reports a conflict, resolve it in the affected file(s) before
continuing to the next merge — don't merge all three branches blind and
resolve at the end, since that makes it hard to tell whose change caused
what. Never force-push over teammates' branches.

Netlify deployment — exact clicks

Go to https://app.netlify.com and log in.

Click Add new site → Import an existing project.

Choose GitHub, authorize if prompted, and select your repo.

Build command: npm run build

Publish directory: dist

Under Environment variables, add the frontend-safe ones below.

Click Deploy site.

Once live, open the generated Netlify URL and confirm the Reports page
loads real data — this is your final demo URL, not localhost.

netlify.toml (already created above) mirrors this build/publish config and
adds an SPA redirect so client-side routes don't 404 on refresh, plus a
netlify/functions directory declaration if/when Person 3's AI branch adds
serverless functions.

Environment variables

Frontend-safe (fine to expose to the browser bundle):

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Server-only (Netlify Functions environment, never prefix with VITE_):

SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
BREVO_API_KEY

QA — manual test pass

Run this end-to-end once deployed to the Netlify URL (not localhost):

Home → Team signup → Team login → Team workspace

Create project → Add member → Team lead approval

Member login → Dashboard

AI role assignment → Sprint generation → Sprint approval → Sprint checklist

Update task → Upload document → Request document → Approve document

Chat → AI chat → AI insight → Block task → Team notification

Placeholder generation → Analysis

Team report → Member report (each of the 4 members) → Print/Save PDF

Error cases to check:

Wrong login, missing required field, duplicate email

Unauthorized document access, member accessing another project

AI unavailable, email unavailable

Empty report (no tasks), a pending task, a late task — confirm the report
shows the "no tasks yet" / pending / late states gracefully rather than
crashing (the components here already handle empty task lists)

Demo seed data — StudySync

Team: StudySync, project: StudySync AI, 4 members: Priya, Arun,
Meena, Vishal. Seed enough tasks per member to show at least one done, one
late, and one pending/risk task, so all four report states are visible
in the demo. Insert this through whatever seeding approach Person 1's
backend branch already uses (a SQL seed script or a Supabase table editor
pass) rather than a one-off script here, since the actual tasks table
schema needs to be confirmed first (see the note in reportsData.ts). Keep
demo rows tagged to a dedicated StudySync project id so they never mix
with real user data.

Final checklist (fill in once deployed)

Live URL:

GitHub URL:

Supabase project URL:

Environment variables configured: [ ]

Features working:

Known limitations:

Demo credentials:

5-minute presentation flow:

Home → team login (10s)

Dashboard walkthrough (60s)

Sprint checklist + marking a task done live (60s)

AI chat / insight moment (45s)

Team Report → click into a member → Print/Save PDF (60s)

Close on the live Netlify URL, not localhost

What I could and couldn't do here

Built: the Reports/Member Report React components matching your
prototype's design, the documented efficiency formula, the no-AI deadline
logic, the Supabase query layer (schema assumed and flagged), print CSS, and
exact copy-pasteable commands/config for git, Netlify and env vars.

Couldn't do from here (no access to your repo, Supabase project, or
Netlify account): actually merging your teammates' branches, running the
27-step QA pass against a live deployment, seeding real demo data into your
Supabase project, or clicking through the Netlify deploy myself. Those need
to be run by whoever has those credentials — the steps above are exact, so
it should be copy/paste from here.
