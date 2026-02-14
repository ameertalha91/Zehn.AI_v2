# 🚀 Running the Migration - Step by Step

I've created automated scripts to help you migrate. Here's how to run them:

## Option 1: Interactive Migration (Recommended - Easiest)

This will guide you through everything step by step:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Run the interactive migration script
npm run migrate:interactive
```

This script will:
- ✅ Check prerequisites
- ✅ Help you pull environment variables from Vercel
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Run database migration
- ✅ Guide you through each step

## Option 2: Manual Step-by-Step

### Step 1: Get Environment Variables from Vercel

**Option A: Using Vercel CLI (Easiest)**
```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login

# Pull environment variables (creates .env.local)
vercel env pull .env.local
```

**Option B: Manual Copy from Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Copy each value and create `.env.local` file:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   OPENAI_API_KEY=your-key
   NEXTAUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Run Database Migration

```bash
# Make sure DATABASE_URL is set in .env.local
npm run migrate:production
```

Or manually:
```bash
npx prisma db push --accept-data-loss
```

### Step 5: Update Vercel Project

**This step requires Vercel Dashboard access:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Git**
4. Click **Disconnect** from `edprep-platform`
5. Click **Connect Git Repository**
6. Select `Zehn.AI_v1` repository
7. Vercel will automatically deploy

**OR use Vercel CLI:**
```bash
npm run vercel:setup
```

## Option 3: Using Individual Scripts

### Pull Vercel Environment Variables
```bash
npm run vercel:setup
```

### Run Database Migration
```bash
npm run migrate:production
```

## What Each Script Does

### `npm run migrate:interactive`
- Interactive guide through the entire migration
- Checks prerequisites
- Helps pull env vars from Vercel
- Runs database migration
- **Best for first-time migration**

### `npm run migrate:production`
- Runs database schema migration
- Requires `DATABASE_URL` in `.env.local`
- **Use this after setting up environment variables**

### `npm run vercel:setup`
- Installs/updates Vercel CLI
- Logs you into Vercel
- Pulls environment variables
- Links to your project
- **Use this to get your env vars from Vercel**

## Troubleshooting

### "DATABASE_URL not found"
- Make sure you've created `.env.local` file
- Run `vercel env pull .env.local` to get it from Vercel
- Or manually create `.env.local` with your database URL

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Permission denied" on scripts
```bash
chmod +x scripts/*.sh
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### Database connection errors
- Verify your `DATABASE_URL` is correct
- Check if database allows connections from your IP
- Ensure database is running

## After Migration

1. ✅ Verify database schema: `npx prisma studio`
2. ✅ Test your application locally: `npm run dev`
3. ✅ Check Vercel deployment logs
4. ✅ Test production deployment

## Need Help?

- Check `MIGRATION_GUIDE.md` for detailed instructions
- Check `FINDING_ENVIRONMENT_VARIABLES.md` for env var help
- Review Vercel deployment logs for errors
