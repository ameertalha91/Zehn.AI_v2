# Add Environment Variables to Vercel - Quick Steps

## What You Need to Add

You currently have:
- ✅ `REACT_APP_API_URL` (already set)

You need to add:
- ⚠️ `DATABASE_URL` (PostgreSQL connection string)
- ⚠️ `NEXTAUTH_URL` (Your Vercel app URL)

## Step-by-Step Instructions

### Step 1: Get Your Vercel App URL (for NEXTAUTH_URL)

1. In Vercel Dashboard, click on your **project name** (top left, or go back to project)
2. Look at the **"Domains"** section
3. You'll see something like: `your-project.vercel.app`
4. **Copy this URL** - you'll need it for NEXTAUTH_URL

**OR** check your deployment URL:
- Go to "Deployments" tab
- Click on the latest deployment
- Copy the URL from the address bar (e.g., `https://your-project-abc123.vercel.app`)

### Step 2: Create a Database (for DATABASE_URL)

**Easiest Option: Vercel Postgres**

1. In your Vercel project, click the **"Storage"** tab (in the top navigation)
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose **"Hobby"** plan (free)
5. Click **"Create Database"**
6. **Vercel will automatically add `DATABASE_URL`** to your environment variables! ✅

**Alternative: If you already have a database**

If you have a PostgreSQL database elsewhere (Digital Ocean, Supabase, etc.):
- Get the connection string from your database provider
- It looks like: `postgresql://user:password@host:port/database?sslmode=require`

### Step 3: Add NEXTAUTH_URL Manually

1. Go back to **Settings → Environment Variables**
2. Click **"Add Environment Variable"** button
3. Fill in:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://your-project.vercel.app` (use your actual URL from Step 1)
   - **Environment**: Select all three (Production, Preview, Development)
4. Click **"Save"**

### Step 4: Verify Variables Are Added

You should now see three variables:
- ✅ `REACT_APP_API_URL`
- ✅ `DATABASE_URL` (if you used Vercel Postgres, it's auto-added)
- ✅ `NEXTAUTH_URL`

### Step 5: Redeploy

After adding variables:
1. Go to **"Deployments"** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. This ensures the new environment variables are used

## Quick Checklist

- [ ] Found your Vercel app URL (for NEXTAUTH_URL)
- [ ] Created Vercel Postgres database (auto-adds DATABASE_URL)
- [ ] OR manually added DATABASE_URL with your connection string
- [ ] Added NEXTAUTH_URL environment variable
- [ ] Redeployed your project

## After Adding Variables

1. **Pull variables locally** (optional, for local development):
   ```bash
   vercel env pull .env.local
   ```

2. **Run database migration**:
   ```bash
   npm run migrate:interactive
   ```

## Troubleshooting

**"I can't find my Vercel URL"**
- Check the "Domains" section in your project
- Or look at any deployment URL
- Format: `https://something.vercel.app`

**"I don't want to use Vercel Postgres"**
- Use Digital Ocean Managed Database ($15/month)
- Or Supabase (free tier available)
- Get the connection string and add it manually as `DATABASE_URL`

**"Variables not working after adding"**
- Make sure you redeployed after adding variables
- Check that variables are set for the correct environment (Production/Preview/Development)
