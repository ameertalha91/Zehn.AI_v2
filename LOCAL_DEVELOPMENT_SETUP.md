# Local Development Setup

## Important: Database Configuration

The production schema uses PostgreSQL. For local development, you have two options:

### Option 1: Use PostgreSQL Locally (Recommended)

1. Set up a local PostgreSQL database or use a cloud instance
2. Create a `.env.local` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/zehn_dev"
   OPENAI_API_KEY="your-key"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```
3. Run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Option 2: Use SQLite for Local Development

If you prefer SQLite for local development:

1. **Temporarily modify `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Create `.env.local`:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   OPENAI_API_KEY="your-key"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

3. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Before deploying to production**, change back to PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### Option 3: Use Environment-Specific Schema Files (Advanced)

You can maintain separate schema files and use a script to switch between them.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (create .env.local)
cp .env.example .env.local
# Edit .env.local with your values

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

## Environment Variables Template

Create a `.env.local` file with:

```
DATABASE_URL="postgresql://user:password@localhost:5432/database"
# OR for SQLite:
# DATABASE_URL="file:./prisma/dev.db"

OPENAI_API_KEY="your-openai-api-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Note**: `.env.local` is git-ignored and won't be committed to the repository.
