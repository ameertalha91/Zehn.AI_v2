# Zehn.AI — Project plan, MVP definition & sprint roadmap

**Repository:** [ameertalha91/Zehn.AI_v1](https://github.com/ameertalha91/Zehn.AI_v1)  
**Last updated:** March 2026  

This file is the **project-level** view: MVP definition, epic order, and a **detailed sprint plan**. It lives in Git so it appears on GitHub with the repo.

| Document | Purpose |
|----------|---------|
| **`PROJECT_AND_SPRINT_PLAN.md`** (this file) | MVP summary, epic roadmap, sprint-by-sprint plan, sprint log |
| **`MVP_AND_BACKLOG.md`** | Full user stories (US-S01 … US-Z03), acceptance-criteria summaries, checkboxes |
| **`ZehnAI_MVP_UserStories.docx`** (local) | Canonical acceptance criteria detail |
| **`ZehnAI_Technical_Architecture.docx`** (local) | Stack, APIs, data model target state |

---

## 1. MVP definition (product)

**Product:** Zehn.AI — intelligent prep platform for post-graduates targeting competitive exams (and cohort-based programs).

**MVP outcome:** A student can register (with approval where required), see assigned courses, use a **course-contextual** AI assistant, complete **free-text and MCQ** assignments, see published grades and study plans, and track progress. An instructor can approve students, manage courses and materials, create assignments, optionally use **AI-assisted grading**, and publish study plans (with AI draft support). A **zehnai_admin** can operate across institutes for early access.

**In scope**

| Area | MVP |
|------|-----|
| Portals | Student, Instructor, ZehnAI super-user |
| Auth | Email/password + Google + Facebook SSO (per product spec) |
| Student lifecycle | Pending → approved/rejected; email notifications |
| Learning | Assigned/enrolled courses, pathways content, dashboard |
| AI | Course-contextual chatbot; AI-assisted grading; AI study-plan **draft** (instructor publishes) |
| Assignments | Free-text + MCQ; instructor publishes grades |
| Notifications | **Email only** at MVP |
| Admin portal UI | **Out of scope** — role reserved in schema |

**Explicitly out of MVP (fast-follow)**  
Admin UI, in-app notification center, file-upload assignment submissions, fully automated study plans, general (non-course) research chatbot, native mobile apps, advanced analytics, LMS integrations.

**Definition of Done (MVP release)**  
All **P0** stories in `MVP_AND_BACKLOG.md` for E1–E10 are implemented, tested on staging, and documented in the sprint log. P1/P2 can slip to fast-follow with product sign-off.

---

## 2. Epic roadmap (dependency order)

Epics are ordered so each layer unlocks the next. **E11** (marketing) can run in parallel anytime.

| Order | Epic | ID | Depends on | Notes |
|------:|------|-----|------------|--------|
| 0 | Foundations & deploy | — | — | Repo, Vercel, DB, public demo pages (done) |
| 1 | Auth & registration | **E1** | — | Schema + NextAuth-style gates block most of MVP |
| 2 | Instructor student management | **E6** | E1 | Approve/reject enables real student onboarding |
| 3 | Student dashboard & courses | **E2** | E1, E6 (partial) | Assigned courses, progress on cards |
| 4 | Course & content (instructor) | **E7** | E1 | Modules/materials for contextual AI |
| 5 | Assignments (create + submit) | **E3**, **E8** | E7 | Student submit + instructor grade |
| 6 | Progress tracking | **E5** | E3 | Cross-course progress |
| 7 | Study plans | **E4**, **E9** | E2, E3 | Student view + instructor AI draft |
| 8 | AI depth | **E2 US-S05**, **E8 US-I07**, **E9 US-I08** | E4–E7 | Contextual chat, AI grade, AI study draft |
| 9 | ZehnAI super-user | **E10** | E6, E7 | Platform-wide ops |
| — | Marketing / landing | **E11** | — | Parallel; partial complete |

---

## 3. Sprint plan (detailed)

**Assumptions**

- **Sprint length:** 2 weeks (adjust in the sprint log if you use 1 or 3 weeks).
- **Capacity:** Set your own story points or “must-have” list per sprint; this plan groups **epics/stories**, not hours.
- **Ceremonies:** Sprint planning (pick stories from `MVP_AND_BACKLOG.md`), mid-sprint check, demo, retro — optional but recommended.

---

### Sprint 0 — Foundations *(completed)*

| Item | Status |
|------|--------|
| Next.js app on Vercel; PostgreSQL + Prisma | Done |
| Public `/learning-pathways`, `/cognitive-assistant` + supporting APIs | Done |
| Build fixes (Tailwind, types in `dependencies`) | Done |
| Landing refresh (E11.1–E11.2); post-grad / competitive-exam positioning | Done |

**Exit criteria:** Production deploy succeeds; visitors can browse pathways and open Ilmi thotbot (API quota permitting).

---

### Sprint 1 — Identity & gates (**E1** core)

**Goal:** Align data model and auth with MVP: user **status**, no self-elevate to instructor; foundation for SSO.

| Deliverable | Stories / work |
|-------------|----------------|
| Prisma: `UserStatus` (or equivalent), optional `zehnai_admin` role path | Schema migration |
| Student register → `PENDING_APPROVAL`; instructor register → active | US-S01 (partial), US-I01 |
| Login: block non-approved students; status screen | US-S03 (partial) |
| Remove or gate self-select instructor on student registration | US-S01 AC |
| Middleware/session: enforce status + role on protected routes | Tech |

**Stretch:** Google OAuth spike (one provider end-to-end).

---

### Sprint 2 — Approvals & email (**E1** + **E6**)

**Goal:** Instructors (and later zehnai_admin) can approve/reject; transactional email for outcomes.

| Deliverable | Stories |
|-------------|---------|
| Instructor pending list + approve/reject + reason | US-I02 |
| Resend (or chosen provider) wired; approval/rejection emails | US-S02, US-S05 (email parts) |
| Duplicate email / validation hardening | US-S01 AC |

**Stretch:** Assignment-published email hook (prepare for E8).

---

### Sprint 3 — Student experience shell (**E2** + **E5** partial)

**Goal:** Dashboard reflects **assigned** courses, progress %, last activity; basic progress view.

| Deliverable | Stories |
|-------------|---------|
| Course cards: instructor name, progress, last activity | US-S04 |
| Progress page or section: % per course, assignment rollup | US-S09 (MVP slice) |
| Align enrollment model with “assigned by institute/instructor” vs catalog-only | Product + tech |

---

### Sprint 4 — Instructor courses & materials (**E7**)

**Goal:** Create course, modules, materials (PDF, docx, video URL, text); publish to enrolled students.

| Deliverable | Stories |
|-------------|---------|
| CRUD course + module + material; storage/signed URLs per architecture doc | US-I04 |
| Student sees published content in course view | Tied to E2 |

---

### Sprint 5 — Assignments v1 (**E3** + **E8**)

**Goal:** Free-text + MCQ assignments; submit; instructor list submissions and grade MCQ automatically.

| Deliverable | Stories |
|-------------|---------|
| Assignment types free_text + MCQ; draft/publish | US-I05, US-S06 (partial) |
| Submission lock after submit; timestamps | US-S06 |
| Submission list + filters | US-I06 |
| MCQ auto-grade | US-I07 (partial) |

---

### Sprint 6 — Grades, feedback & AI grading (**E3** + **E8**)

**Goal:** Published grades, feedback labels; AI suggest for free-text; instructor must publish.

| Deliverable | Stories |
|-------------|---------|
| Grade publish workflow; student sees score + feedback | US-S07, US-I07 |
| `ai_assisted` flag and student-facing label | US-I07 |
| Email when grade published | US-S07 |

---

### Sprint 7 — Course-contextual chatbot (**E2** US-S05)

**Goal:** Ilmi thotbot (or in-app chat) uses enrolled course context + RAG/embeddings per architecture.

| Deliverable | Stories |
|-------------|---------|
| Context injection from course materials; “no context” labeling | US-S05 |
| Session memory (browser or Redis per spec) | US-S05 |

**Note:** May split across two sprints if RAG pipeline is heavy.

---

### Sprint 8 — Study plans (**E4** + **E9**)

**Goal:** Instructor AI draft + edit + publish; student read-only view + notifications.

| Deliverable | Stories |
|-------------|---------|
| Study plan model + student UI | US-S08 |
| Instructor create/update + AI draft | US-I08 |

---

### Sprint 9 — Instructor visibility & zehnai_admin (**E6** + **E10**)

**Goal:** Student roster, progress drill-down; super-user cross-institute approvals and impersonation-style actions.

| Deliverable | Stories |
|-------------|---------|
| Approved student list, profile, sortable progress | US-I03 |
| zehnai_admin: pending all institutes, audit log | US-Z01 |
| Platform dashboard + read-all | US-Z02, US-Z03 |

---

### Sprint 10 — SSO hardening, security, polish

**Goal:** Facebook SSO if required; login rate limit; 7-day session; E11.3 (testimonials/FAQ) if desired.

| Deliverable | Stories |
|-------------|---------|
| Google + Facebook OAuth | US-S01, US-I01 |
| 5-attempt lock, 7-day session | US-S03 |
| E11.3 optional | E11.3 |

---

## 4. Priority tags (optional)

Use in `MVP_AND_BACKLOG.md` or issues:

| Tag | Meaning |
|-----|---------|
| **P0** | Blocks MVP release |
| **P1** | MVP nice-to-have; can slip |
| **P2** | Fast-follow |

---

## 5. Sprint log (update each sprint)

Record actual dates and outcomes here when you finish a sprint.

| Sprint | Dates | Epics / focus | Completed stories | Notes |
|--------|-------|---------------|-------------------|-------|
| S0 | — | Foundations, E11 partial | Public demo, deploy, landing | |
| S1 | | E1 | | |
| S2 | | E1, E6 | | |
| S3 | | E2, E5 | | |
| S4 | | E7 | | |
| S5 | | E3, E8 | | |
| S6 | | E3, E8 | | |
| S7 | | E2 (chatbot) | | |
| S8 | | E4, E9 | | |
| S9 | | E6, E10 | | |
| S10 | | Auth polish, E11 | | |

---

## 6. Where this lives (Git / GitHub)

- **Path in repo:** `docs/PROJECT_AND_SPRINT_PLAN.md`
- **On GitHub:** Browse to **docs** in the repo; open this file (renders as Markdown).
- **Workflow:** Edit here → `git add docs/` → `git commit` → `git push` — same as code.

To make **`docs/` easy to find** from the repo root, add a one-line pointer in the root `README.md` if your project has one (optional).

---

## 7. Changelog

| Date | Change |
|------|--------|
| Mar 2026 | Initial project + sprint plan added |
