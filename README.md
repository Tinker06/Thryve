# THRYVE — AI-Based Collaborative Learning Intelligence

> An AI-powered collaborative learning platform that helps student teams coordinate work, understand participation, identify knowledge gaps, manage tasks, share documents, and generate intelligent team and member reports.

---

##  Project Overview

**THRYVE** is an AI-based collaborative learning intelligence platform designed for student project teams.

Students working in groups often face problems such as:

- Unequal participation
- Fragmented discussions
- Scattered project documents
- Difficulty tracking individual contributions
- Poor visibility into what team members are working on
- Missed deadlines
- Blocked tasks
- Knowledge gaps between team members
- Difficulty combining individual contributions into a clear team report

THRYVE addresses these problems by analyzing **only authorized team data**, including:

- Group discussions
- Shared project documents
- Tasks and sprint activity
- Team member contributions
- Project activity
- AI-generated insights

The platform converts this information into actionable collaboration intelligence while keeping the team's project data organized in one workspace.

---

#  Problem Statement

Student teams frequently collaborate using multiple disconnected tools such as:

- Chat applications
- Cloud storage
- Spreadsheets
- Task management tools
- Separate documents
- Manual reports

This creates several problems:

1. Team members may not know what others are working on.
2. Individual contributions are difficult to measure.
3. Important project information becomes scattered.
4. Deadlines can be missed without early visibility.
5. Knowledge gaps may remain unnoticed.
6. Team leaders have difficulty understanding project progress.
7. Preparing project reports manually takes time.
8. Unequal participation can be difficult to identify objectively.

THRYVE provides a centralized workspace that combines collaboration, project activity, AI analysis, and reporting.

---

#  Proposed Solution

THRYVE creates a shared project environment where team members can:

- Create and manage projects
- Join team workspaces
- Assign roles
- Manage sprints
- Create and update tasks
- Track task deadlines
- Share project documents
- Request and approve documents
- Communicate through team chat
- Use AI-powered assistance
- Identify knowledge gaps
- Detect blocked tasks
- Generate collaboration insights
- Generate team reports
- Generate individual member reports
- Print or save reports as PDF

The platform is designed to transform raw collaboration activity into structured project intelligence.

---

#  Core Features

## 1. Team Workspace

Each project has a dedicated collaborative workspace.

Team members can access:

- Project information
- Team members
- Tasks
- Sprints
- Documents
- Discussions
- AI insights
- Reports

---

## 2. Authentication

The application supports team-based authentication and project access.

Users can:

- Sign up
- Log in
- Access authorized projects
- Work within their assigned team
- Prevent unauthorized access to other projects

---

## 3. Project Management

Teams can create and manage projects.

Project information can include:

- Project name
- Project description
- Team members
- Project tasks
- Sprints
- Documents
- Discussions
- Reports

---

#  Team Collaboration

THRYVE is designed around team-based collaboration.

The project workspace can include members such as:

- Priya
- Arun
- Meena
- Vishal

Each member can have individual tasks and project responsibilities.

The platform tracks authorized activity to provide a structured view of team participation.

---

# 🤖 AI-Powered Intelligence

THRYVE uses AI to analyze authorized project information and provide useful collaboration insights.

AI capabilities include:

### AI Role Assignment

The platform can analyze available project context and help assign suitable responsibilities to team members.

### AI Sprint Generation

AI can assist in generating sprint tasks based on the project requirements.

### Knowledge Gap Detection

The system can identify areas where team members may need additional knowledge or support.

### AI Chat

Team members can interact with an AI assistant for project-related support.

### AI Insights

The system can convert project activity into useful collaboration insights.

### Placeholder / Generated Content

The platform can generate project-supporting content where required by the workflow.

---

#  Sprint Management

THRYVE supports sprint-based project organization.

A sprint can contain:

- Sprint name
- Sprint period
- Tasks
- Assigned members
- Deadlines
- Estimated completion time
- Actual completion time
- Completion status

Sprint workflows include:

1. Sprint generation
2. Sprint review
3. Sprint approval
4. Checklist creation
5. Task assignment
6. Task updates
7. Sprint progress tracking

---

#  Task Management

Tasks are central to the collaboration intelligence system.

Each task can contain:

- Task name
- Assigned member
- Estimated time
- Actual completion time
- Deadline
- Completion timestamp
- Sprint
- Status

Task status can be represented as:

- `DONE`
- `LATE`
- `PENDING`
- `RISK`

---

# ⏱️ Deadline Logic

THRYVE uses the recorded completion timestamp and deadline to determine task timing.

The logic is deterministic and does not rely on AI guessing.

### BEFORE DEADLINE

If:

```text
completed_at <= deadline
