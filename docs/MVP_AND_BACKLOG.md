# Zehn AI — MVP Scope & Development Backlog

**Product:** Zehn AI — AI-Powered EdTech Platform
**Version:** MVP v1.0
**Last updated:** April 2026

This file is the **story-level** tracker. Check off stories as you complete them.

- **Sprint schedule & epic order:** see [PROJECT_AND_SPRINT_PLAN.md](./PROJECT_AND_SPRINT_PLAN.md)
- **Canonical acceptance criteria:** `ZehnAI_MVP_UserStories.docx` (local)
- **Technical reference:** `ZehnAI_Technical_Architecture.docx` (local)

---

## 1. MVP Scope

| Area | In scope |
|------|-----------|
| **Portals** | Student, Instructor, ZehnAI super-user |
| **Out of scope** | Admin portal UI (schema reserved) |
| **Auth** | Email/password, Google SSO, Facebook SSO |
| **AI** | Course-contextual chatbot, AI-assisted grading, AI study-plan draft |
| **Notifications** | Email only (in-app is fast-follow) |
| **Assignments** | Free-text and MCQ (file uploads are fast-follow) |

---

## 2. Technical Architecture (Summary)

- **Frontend:** Next.js 14 (App Router) + TypeScript, shadcn/ui + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (primary) + Redis (sessions/cache)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 (email, Google OAuth, Facebook OAuth)
- **File storage:** AWS S3 or Cloudflare R2
- **AI/LLM:** OpenAI GPT-4o or Anthropic Claude via AIService abstraction
- **Email:** Resend
- **Hosting:** Vercel (frontend + API) + Railway or Render (DB)

**Route namespacing:**
- `/app/student/*` → role: student, status: approved
- `/app/instructor/*` → role: instructor
- `/app/zehnai/*` → role: zehnai_admin
- `/app/admin/*` → reserved (out of scope)

**Multi-tenancy:** Institute-scoped; `institute_id` always derived from session, never from client.

---

## 3. Epics Overview

Priority key: **P0** = MVP blocker | **P1** = MVP nice-to-have, can slip | **P2** = fast-follow

| Epic | Title | Priority | Sprint | Depends on |
|------|-------|----------|--------|------------|
| **E1** | Auth & Registration | P0 | S1, S10 | — |
| **E2** | Student Dashboard & Course Access | P0 | S3, S7 | E1, E6 |
| **E3** | Assignments (Student) | P0 | S5, S6 | E7, E8 |
| **E4** | Study Plans (Student) | P0 | S8 | E9 |
| **E5** | Progress Tracking | P0 | S3, S5 | E3 |
| **E6** | Instructor — Student Management | P0 | S2, S9 | E1 |
| **E7** | Instructor — Course & Content | P0 | S4 | E1 |
| **E8** | Instructor — Assignments & AI Grading | P0 | S5, S6 | E7 |
| **E9** | Instructor — Study Plans | P0 | S8 | E6, E3 |
| **E10** | ZehnAI Super-User | P1 | S9 | E6, E7 |
| **E11** | Marketing & Landing | P1 | S0+ | — |

---

## 4. Backlog — Epics & Stories

Stories are listed with acceptance-criteria summaries. Check off `[ ]` when done.

---

### E1: Auth & Registration

**Goal:** Any user can register and log in via email/password or SSO. Students are gated behind an approval flow. Role and status are enforced across the app.

**Priority:** P0 — blocks all portals
**Depends on:** —
**Sprint:** S1 (core gates) + S10 (SSO hardening + rate limiting)
**Definition of Done:** Students cannot reach `/app/student/*` unless approved; instructors can log in and reach `/app/instructor/*`; approval/rejection emails are sent via Resend.

| Story | Priority | Status |
|-------|----------|--------|
| US-S01 | P0 | [ ] |
| US-S02 | P0 | [ ] |
| US-S03 | P0 | [ ] |
| US-I01 | P0 | [ ] |

- [ ] **US-S01** `P0` — Student registers with email/password, Google, or Facebook. Profile fields collected. Account created as `PENDING_APPROVAL`. Duplicate email rejected with clear error. Instructor-role self-select not available to students.
- [ ] **US-S02** `P0` — Student receives email on approval (login link, approving instructor name) and on rejection (reason). Emails sent via Resend.
- [ ] **US-S03** `P0` — Student logs in via email/password or SSO. 5 failed attempts → 15-minute lock. Approved → dashboard. Pending/rejected → status screen. Session lasts 7 days.
- [ ] **US-I01** `P0` — Instructor registers and logs in (same auth methods). Role assigned at registration; no approval queue. Lands on distinct instructor dashboard.

---

### E2: Student Dashboard & Course Access

**Goal:** An approved student lands on a dashboard showing assigned courses and can launch a course-contextual AI chatbot.

**Priority:** P0
**Depends on:** E1 (auth), E6 (student approval), E7 (course content for chatbot)
**Sprint:** S3 (dashboard shell) + S7 (chatbot depth)
**Definition of Done:** Dashboard loads assigned courses in < 3s. Chatbot responds with course-grounded answers and labels responses when no context is found.

| Story | Priority | Status |
|-------|----------|--------|
| US-S04 | P0 | [ ] |
| US-S05 | P0 | [ ] |

- [ ] **US-S04** `P0` — Dashboard shows only courses assigned to the logged-in student. Each card displays: course name, instructor, progress %, last activity. Load < 3s.
- [ ] **US-S05** `P0` — Chatbot launcher on dashboard. Chatbot is aware of enrolled courses. Responses grounded in course content via RAG. Supports follow-up questions; session history stored in browser (or Redis). Labels responses when no relevant course context exists.

---

### E3: Assignments (Student)

**Goal:** Students can view, submit, and receive graded feedback on assignments.

**Priority:** P0
**Depends on:** E7 (courses must exist), E8 (instructor must publish assignments)
**Sprint:** S5 (view + submit) + S6 (grades + feedback)
**Definition of Done:** Student can submit free-text and MCQ; cannot edit after submit; sees grade and feedback only after instructor publishes.

| Story | Priority | Status |
|-------|----------|--------|
| US-S06 | P0 | [ ] |
| US-S07 | P0 | [ ] |

- [ ] **US-S06** `P0` — Student views assignments per course (title, due date, status). Opens full prompt. Submits free-text or MCQ response. No edits after submit. Email notification when assignment is posted. Submission timestamp recorded.
- [ ] **US-S07** `P0` — Student views grade and feedback on graded assignments. AI-assisted feedback is labeled as such. Grades are visible only after instructor publishes. Email sent when grade is published.

---

### E4: Study Plans (Student)

**Goal:** Students can view study plans published by their instructor, including weekly milestones, resources, and focus areas.

**Priority:** P0
**Depends on:** E9 (instructor must publish a plan)
**Sprint:** S8
**Definition of Done:** Study plan visible on course page and dashboard. Read-only. Email sent on publish/update. Last-updated date displayed.

| Story | Priority | Status |
|-------|----------|--------|
| US-S08 | P0 | [ ] |

- [ ] **US-S08** `P0` — Student views study plan from course page and dashboard. Plan includes weekly milestones, resources, focus areas, and last-updated date. Email sent on publish or update. Read-only for students.

---

### E5: Progress Tracking

**Goal:** Students can see their progress across courses as a completion percentage, updated after each submission.

**Priority:** P0
**Depends on:** E3 (assignments must be submittable)
**Sprint:** S3 (shell — progress % on dashboard cards) + S5 (full page after assignments exist)
**Definition of Done:** Progress % per course is visible and updates automatically after a submission or grading event.

| Story | Priority | Status |
|-------|----------|--------|
| US-S09 | P0 | [ ] |

- [ ] **US-S09** `P0` — Progress page shows completion % per course. Assignment submissions are included in the calculation. Updates automatically after submission or grading.

---

### E6: Instructor — Student Management

**Goal:** Instructors can approve or reject pending students and view the full profile and progress of approved students.

**Priority:** P0
**Depends on:** E1 (students must be able to register)
**Sprint:** S2 (approve/reject + email) + S9 (full roster + progress drill-down)
**Definition of Done:** Instructor can approve/reject with reason; student email sent. Approved student list is sortable and shows per-course progress.

| Story | Priority | Status |
|-------|----------|--------|
| US-I02 | P0 | [ ] |
| US-I03 | P1 | [ ] |

- [ ] **US-I02** `P0` — Instructor sees list of pending students. Can approve or reject each with a reason (max 300 chars). Student receives email on approve or reject. Approved students gain course access.
- [ ] **US-I03** `P1` — Instructor sees list of approved students. Each profile shows: name, email, enrollment date, courses. Per-course progress: %, assignments submitted, assignments graded, last activity. List is sortable.

---

### E7: Instructor — Course & Content Management

**Goal:** Instructors can create and organise courses with modules and materials (PDF, DOCX, video links, text), then publish to enrolled students.

**Priority:** P0 — required for chatbot context and assignments
**Depends on:** E1 (instructor must be authenticated)
**Sprint:** S4
**Definition of Done:** Instructor can create a course, add modules, upload/link materials, and publish. Published content is visible to enrolled students in their course view.

| Story | Priority | Status |
|-------|----------|--------|
| US-I04 | P0 | [ ] |

- [ ] **US-I04** `P0` — Instructor creates a course (title, description, institute). Uploads materials: PDF, DOCX, video link, or text. Organises into modules/weeks. Can edit or remove materials. Published content is visible to enrolled students.

---

### E8: Instructor — Assignments & AI Grading

**Goal:** Instructors can create free-text and MCQ assignments, view all submissions, and use AI to generate a suggested score and feedback draft before publishing.

**Priority:** P0
**Depends on:** E7 (courses must exist)
**Sprint:** S5 (create + submission list) + S6 (AI grade + publish workflow)
**Definition of Done:** Free-text AI grading returns a suggested score and draft feedback; instructor must review before publishing. MCQ auto-graded on submit. Students see grade only after explicit publish.

| Story | Priority | Status |
|-------|----------|--------|
| US-I05 | P0 | [ ] |
| US-I06 | P0 | [ ] |
| US-I07 | P0 | [ ] |

- [ ] **US-I05** `P0` — Instructor creates an assignment: free-text or MCQ. Fields: title, instructions, due date, points. MCQ: options and correct answers defined. Saves as draft or publishes. Students emailed when published.
- [ ] **US-I06** `P0` — Instructor views submission list per assignment (student name, submission time, grading status). Can open full response. Filterable by graded / ungraded / all.
- [ ] **US-I07** `P0` — AI-grade button on ungraded free-text submissions. AI returns suggested score + draft feedback. Instructor can accept, edit, or override before publishing. Published feedback to student carries an "AI-assisted" label. MCQ is auto-graded on submission. No AI grade triggered without a rubric or answer key. Grades are published explicitly by instructor only.

---

### E9: Instructor — Study Plans

**Goal:** Instructors can create a personalised study plan for any approved student using an AI draft as a starting point, then edit and publish it.

**Priority:** P0
**Depends on:** E6 (approved students exist), E3 (submission/progress data for AI context)
**Sprint:** S8
**Definition of Done:** Instructor generates an AI draft, edits it, and publishes. Student sees plan only after publish. AI-draft label shown in instructor view.

| Story | Priority | Status |
|-------|----------|--------|
| US-I08 | P0 | [ ] |

- [ ] **US-I08** `P0` — Instructor creates a study plan for any approved student. AI generates a draft from course content and student progress (milestones, focus areas, resources). Instructor edits and publishes. Student sees plan only when published. Student emailed on publish/update. AI-draft label shown to instructor.

---

### E10: ZehnAI Super-User

**Goal:** The `zehnai_admin` role can operate across all institutes — approving students, viewing all content, and performing any instructor action — with all actions audit-logged.

**Priority:** P1 — important for early operations, not a user-facing blocker
**Depends on:** E6 (student management), E7 (courses/content exist)
**Sprint:** S9
**Definition of Done:** zehnai_admin can approve/reject students across all institutes, view the platform-wide dashboard, and perform instructor actions. All actions logged with `zehnai_admin` actor.

| Story | Priority | Status |
|-------|----------|--------|
| US-Z01 | P1 | [ ] |
| US-Z02 | P1 | [ ] |
| US-Z03 | P1 | [ ] |

- [ ] **US-Z01** `P1` — zehnai_admin sees pending students across all institutes. Can approve or reject (same flow as instructor). Actions logged as zehnai_admin.
- [ ] **US-Z02** `P1` — Platform dashboard: totals for students, instructors, courses, pending approvals. Drill-down into institute → instructor → student. Read-only access to all content, submissions, grades, and study plans.
- [ ] **US-Z03** `P1` — zehnai_admin can perform any instructor action for any institute (courses, assignments, study plans, grading). All actions audit-logged as zehnai_admin.

---

### E11: Marketing & Landing

**Goal:** Public-facing landing page communicates the product value clearly to post-graduate students targeting competitive exams.

**Priority:** P1 — parallel track; no dependency on any other epic
**Depends on:** —
**Sprint:** S0 (partial complete), S10 (polish + E11.3)
**Definition of Done:** Hero, feature pillars, process section, and CTAs live in production. Messaging clearly targets post-grad / competitive-exam audience.

| Story | Priority | Status |
|-------|----------|--------|
| E11.1 | P0 | [x] |
| E11.2 | P0 | [x] |
| E11.3 | P2 | [ ] |

- [x] **E11.1** `P0` — New hero + primary messaging: "Intelligent prep for post-grad students preparing for competitive exams."
- [x] **E11.2** `P0` — Restructured landing: feature pillars, "prep that adapts" section, process/value section, stats, CTAs (pathways, Ilmi thotbot, register).
- [ ] **E11.3** `P2` — Testimonials, FAQ section, or illustration assets. Requires real copy / social proof before building.

---

## 5. Out of Scope — Fast-Follow

| Feature | Notes |
|---------|-------|
| Admin Portal UI | Role in schema; UI in next phase |
| In-App Notifications | Email only at MVP |
| File Upload Assignments | Free-text and MCQ only at MVP |
| Fully Automated Study Plans | AI draft + instructor publish at MVP |
| General Research Chatbot | Course-contextual only at MVP |
| Mobile App | Web-responsive only at MVP |
| Advanced Analytics | Basic progress % at MVP |
| Third-Party LMS Integration | Standalone at MVP |

---

## 6. Sprint Log

Record completed stories per sprint here.

| Sprint | Focus | Completed Stories | Notes |
|--------|-------|-------------------|-------|
| S0 | Foundations, E11 partial | E11.1, E11.2 | Public demo, deploy, landing |
| S1 | E1 core | | |
| S2 | E1 + E6 | | |
| S3 | E2 + E5 | | |
| S4 | E7 | | |
| S5 | E3 + E8 | | |
| S6 | E3 + E8 grades | | |
| S7 | E2 chatbot | | |
| S8 | E4 + E9 | | |
| S9 | E6 + E10 | | |
| S10 | Auth polish, E11.3 | | |
