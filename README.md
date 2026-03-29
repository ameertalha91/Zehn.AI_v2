
# Zehn.AI – CSS MVP (B2C + B2B2C)

Aligned to the product brief (features & flows) — quick demo for academy owners.

## Product, MVP & sprint planning

Planning docs live in **[`docs/`](./docs/)** and show on GitHub with the repo:

- **[`docs/PROJECT_AND_SPRINT_PLAN.md`](./docs/PROJECT_AND_SPRINT_PLAN.md)** — MVP definition, epic roadmap, detailed sprints (S0–S10), sprint log  
- **[`docs/MVP_AND_BACKLOG.md`](./docs/MVP_AND_BACKLOG.md)** — User stories and checkboxes  
- **[`docs/README.md`](./docs/README.md)** — Index of `docs/`

## 🚀 Migration from edprep-platform

**Migrating to this codebase?** See:
- **Quick Start**: [`QUICK_MIGRATION_STEPS.md`](./QUICK_MIGRATION_STEPS.md)
- **Full Guide**: [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)
- **Local Setup**: [`LOCAL_DEVELOPMENT_SETUP.md`](./LOCAL_DEVELOPMENT_SETUP.md)

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (for production) or SQLite (for local dev)
- OpenAI API key

### Run Locally
```bash
npm install

# Set up environment variables (create .env.local)
# See LOCAL_DEVELOPMENT_SETUP.md for details

npm run db:push
npm run db:seed  # if you have seed data
npm run dev
# http://localhost:3000  (use Demo Login)
```

**Note**: The schema is configured for PostgreSQL. For local SQLite setup, see [`LOCAL_DEVELOPMENT_SETUP.md`](./LOCAL_DEVELOPMENT_SETUP.md).

## Production Deployment

This codebase is configured for deployment on:
- **Vercel** (frontend/API)
- **Digital Ocean** (if you have additional services)

See [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) for detailed deployment instructions.

## Demo Script
- **Center Admin**: create a class → see list update.
- **Tutor**: (a) upload lecture (stub), (b) click *Generate Quiz* → quiz appears.
- **Student**: view 6‑week *Study Plan*; (later: take quiz, upload mock).

> Replace stubs with services for: AI RAG answers, video edit/transcript, OCR, auto‑grading, and messaging.



