# Zehn AI — MVP Scope & Development Backlog

**Product:** Zehn AI — AI-Powered EdTech Platform  
**Version:** MVP v1.0  
**Last updated:** February 2026  

This folder holds product and technical reference for the repo.

- **Sprint schedule & MVP project view:** see [**PROJECT_AND_SPRINT_PLAN.md**](./PROJECT_AND_SPRINT_PLAN.md) (epic order, Sprint 0–10, sprint log).
- **Story checklist:** this file (`MVP_AND_BACKLOG.md`) — check off stories as you complete them.

---

## 1. MVP Scope

| Area | In scope |
|------|----------|
| **Portals** | Student portal, Instructor portal, ZehnAI super-user |
| **Out of scope** | Admin portal UI (schema reserved for future build) |
| **Auth** | Email/password, Google SSO, Facebook SSO |
| **AI** | Course-contextualized chatbot, AI-assisted grading, AI study plan drafting |
| **Notifications** | Email only (in-app notifications are fast-follow) |
| **Assignment types** | Free-text and MCQ (file uploads are fast-follow) |

---

## 2. Technical Architecture (Summary)

- **Frontend:** Next.js 14 (App Router) + TypeScript, shadcn/ui + Tailwind CSS  
- **Backend:** Node.js + Express or Next.js API Routes  
- **Database:** PostgreSQL (primary) + Redis (sessions/cache)  
- **ORM:** Prisma  
- **Auth:** NextAuth.js v5 (email, Google OAuth, Facebook OAuth)  
- **File storage:** AWS S3 or Cloudflare R2  
- **AI/LLM:** OpenAI GPT-4o or Anthropic Claude via AIService abstraction  
- **Email:** Resend  
- **Hosting:** Vercel (frontend) + Railway or Render (backend/DB)  

**Route namespacing:**  
`/app/student/*` → student, approved | `/app/instructor/*` → instructor | `/app/zehnai/*` → zehnai_admin | `/app/admin/*` → reserved  

**Data:** Institute-scoped multi-tenancy; `institute_id` never from client — derived from session.  

Full detail: see `ZehnAI_Technical_Architecture.docx` (in your `zehnai docs` folder) and `ZehnAI_MVP_UserStories.docx` for acceptance criteria.

---

## 3. Backlog — Epics & Stories

Stories are listed with acceptance-criteria summaries. Check off when done.

---

### E1: Auth & Registration

- [ ] **US-S01** — Student can register with email/password, Google, or Facebook; profile fields collected; account created as `PENDING_APPROVAL`; duplicate email rejected.  
- [ ] **US-S02** — Student receives email when approved (with login link, approving instructor name); rejection email with reason when rejected.  
- [ ] **US-S03** — Student can log in (email/password or SSO); 5 failed attempts → 15 min lock; approved → dashboard, pending/rejected → status screen; session 7 days.  
- [ ] **US-I01** — Instructor can register and log in (same auth methods); role assigned at registration; no approval needed; distinct instructor dashboard.  

---

### E2: Student Dashboard & Course Access

- [ ] **US-S04** — Dashboard shows only assigned courses; each card: course name, instructor, progress %, last activity; load &lt; 3s.  
- [ ] **US-S05** — Chatbot launcher on dashboard; chatbot aware of enrolled courses; responses grounded in course content; follow-ups and session history in browser; labels when no relevant context.  

---

### E3: Assignments (Student)

- [ ] **US-S06** — View assignments per course (title, due date, status); open full prompt; submit free-text or MCQ; no edit after submit; email when assignment posted; timestamp recorded.  
- [ ] **US-S07** — View grades and feedback on graded assignments; AI-assisted feedback labeled; grades visible only after publish; email when grade published.  

---

### E4: Study Plans (Student)

- [ ] **US-S08** — View study plan from course page and dashboard; weekly milestones, resources, focus areas; last-updated date; email on publish/update; read-only.  

---

### E5: Progress Tracking

- [ ] **US-S09** — Progress page: completion % per course; assignment completion in calculation; updates after submission/grading.  

---

### E6: Instructor — Student Management

- [ ] **US-I02** — List pending students; approve/reject with reason (max 300 chars); student email on approve/reject; approved students get course access.  
- [ ] **US-I03** — List approved students; student profile (name, email, enrollment date, courses); per-course progress (%, submitted, graded, last activity); sortable.  

---

### E7: Instructor — Course & Content Management

- [ ] **US-I04** — Create course (title, description, institute); upload materials (PDF, DOCX, video link, text); organize into modules/weeks; edit/remove materials; content visible to enrolled students when published.  

---

### E8: Instructor — Assignments & AI Grading

- [ ] **US-I05** — Create assignment: free-text or MCQ; title, instructions, due date, points; MCQ options and correct answers; publish or draft; students emailed when published.  
- [ ] **US-I06** — List submissions per assignment (student, time, grading status); open full response; filter by graded/ungraded/all.  
- [ ] **US-I07** — AI-grade button on ungraded free-text; AI returns suggested score + draft feedback; instructor can accept/edit/override; AI-assisted label to student; MCQ auto-graded; grades published explicitly only; no AI grade without rubric/answer.  

---

### E9: Instructor — Study Plans

- [ ] **US-I08** — Create study plan for any approved student; AI draft from courses + progress; draft has milestones, focus areas, resources; instructor edits then publishes; student sees only when published; email on publish/update; AI draft labeled in instructor view.  

---

### E10: ZehnAI Super-User

- [ ] **US-Z01** — zehnai_admin sees pending students across all institutes; approve/reject same as instructor; actions logged as zehnai_admin.  
- [ ] **US-Z02** — Dashboard: platform-wide totals (students, instructors, courses, pending); drill into institute/instructor/student; read-only on all content, submissions, grades, study plans.  
- [ ] **US-Z03** — Can perform any instructor action for any institute (courses, assignments, study plans, grading); actions logged as zehnai_admin.  

---

### E11: Marketing & Landing (pre-MVP product polish)

Inspired by clear value-prop layouts (e.g. [Wild Zebra](https://wildzebra.com/) structure: hero, feature pillars, “how it works,” social proof–style framing). Messaging shifted from CSS-only to **intelligent prep for post-graduates targeting competitive exams**.

- [x] **E11.1** — New hero + primary messaging (“Intelligent prep for post-grad students preparing for competitive exams”).  
- [x] **E11.2** — Restructure landing: feature pillars, “prep that adapts” section, process/value section, stats, CTAs (pathways, Ilmi thotbot, register).  
- [ ] **E11.3** — Optional: testimonials, FAQ, or illustration assets when you have real copy.  

---

## 4. Out of Scope (Fast-Follow)

| Feature | Notes |
|--------|--------|
| Admin Portal UI | Role/permissions in schema; UI in next phase. |
| In-App Notifications | Email only at MVP. |
| File Upload Assignments | Free-text and MCQ only at MVP. |
| Fully Automated Study Plans | AI draft + instructor review at MVP. |
| General Research Chatbot | Course-contextualized only at MVP. |
| Mobile App | Web-responsive only at MVP. |
| Analytics Dashboard | Basic progress at MVP. |
| Third-Party LMS | Standalone at MVP. |

---

## 5. Sprint Log (optional)

Use this section to record which stories were completed in which sprint.

| Sprint | Stories | Notes |
|--------|---------|-------|
| — | — | — |
