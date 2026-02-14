# Creating Missing Environment Variables

You need to create `DATABASE_URL` and `NEXTAUTH_URL` in Vercel. Here's how:

## 1. DATABASE_URL - PostgreSQL Database

You need a PostgreSQL database. Here are your options:

### Option A: Use Digital Ocean Managed Database (Recommended)

Since you already have a Digital Ocean droplet, you can create a managed PostgreSQL database:

1. **Go to Digital Ocean Dashboard**: https://cloud.digitalocean.com
2. **Click "Create" → "Databases"**
3. **Select PostgreSQL** (choose version 14 or 15)
4. **Choose a datacenter** (same region as your droplet if possible)
5. **Select a plan** (Basic $15/month is fine to start)
6. **Create database**
7. **After creation, go to "Connection Details"**
8. **Copy the connection string** - it will look like:
   ```
   postgresql://doadmin:password@db-host:25060/defaultdb?sslmode=require
   ```

**Important**: Make sure to:
- Add your Vercel IP addresses to "Trusted Sources" in the database settings
- Or allow all IPs temporarily (less secure but easier for setup)

### Option B: Use Vercel Postgres (Easiest)

1. **Go to Vercel Dashboard** → Your Project
2. **Go to "Storage" tab**
3. **Click "Create Database"**
4. **Select "Postgres"**
5. **Choose a plan** (Hobby is free)
6. **Create database**
7. **Vercel will automatically add `DATABASE_URL`** to your environment variables!

### Option C: Use Supabase (Free Tier Available)

1. **Go to**: https://supabase.com
2. **Sign up** (free tier available)
3. **Create a new project**
4. **Go to Settings → Database**
5. **Copy the connection string** from "Connection string" section
6. **Format**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option D: Use Your Existing Database (If You Have One)

If your old `edprep-platform` project had a database:
1. Check your old Vercel project's environment variables
2. Or check your Digital Ocean droplet for database connection info
3. Reuse that database connection string

## 2. NEXTAUTH_URL - Your Application URL

This should be your Vercel deployment URL. Here's how to find/set it:

### Step 1: Find Your Vercel URL

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Look at the "Domains" section** - you'll see something like:
   - `your-project.vercel.app`
   - Or your custom domain if you have one

### Step 2: Add NEXTAUTH_URL to Vercel

1. **In Vercel Dashboard** → Your Project
2. **Go to "Settings" → "Environment Variables"**
3. **Click "Add New"**
4. **Add**:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://your-project.vercel.app` (use your actual URL)
   - **Environment**: Select "Production", "Preview", and "Development" (or just Production)
5. **Click "Save"**

**Note**: Even though your app doesn't use NextAuth, this variable is used for internal API calls, so it needs to be your production URL.

## 3. Adding Variables to Vercel - Step by Step

### Via Vercel Dashboard:

1. **Go to**: https://vercel.com/dashboard
2. **Select your project** (the one currently using edprep-platform)
3. **Click "Settings"** (gear icon)
4. **Click "Environment Variables"** in the left sidebar
5. **Click "Add New"** button
6. **For each variable**:

   **DATABASE_URL:**
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@host:port/database?sslmode=require`
   - Environment: Select all (Production, Preview, Development)
   - Click "Save"

   **NEXTAUTH_URL:**
   - Key: `NEXTAUTH_URL`
   - Value: `https://your-project.vercel.app` (your actual Vercel URL)
   - Environment: Select all
   - Click "Save"

7. **After adding variables, redeploy** your project:
   - Go to "Deployments" tab
   - Click the three dots on latest deployment
   - Click "Redeploy"

### Via Vercel CLI:

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login
vercel login

# Link to your project
vercel link

# Add DATABASE_URL
vercel env add DATABASE_URL production
# Paste your connection string when prompted

# Add NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Enter: https://your-project.vercel.app
```

## 4. Quick Setup Checklist

- [ ] Create PostgreSQL database (Digital Ocean, Vercel, or Supabase)
- [ ] Get database connection string
- [ ] Find your Vercel project URL
- [ ] Add `DATABASE_URL` to Vercel environment variables
- [ ] Add `NEXTAUTH_URL` to Vercel environment variables
- [ ] Redeploy your project in Vercel

## 5. Testing Your Setup

After adding variables:

1. **Pull them locally**:
   ```bash
   vercel env pull .env.local
   ```

2. **Verify they're set**:
   ```bash
   cat .env.local
   ```

3. **Test database connection**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 6. Cost Considerations

- **Vercel Postgres**: Free tier available (Hobby plan)
- **Digital Ocean Managed DB**: Starts at $15/month
- **Supabase**: Free tier available (500MB database)
- **Vercel Hosting**: Free tier available

## 7. Recommended Setup

For easiest setup:
1. **Use Vercel Postgres** (automatically adds DATABASE_URL)
2. **Set NEXTAUTH_URL** to your Vercel URL
3. **Done!** No external services needed

## Need Help?

- **Database connection issues**: Check firewall rules, SSL mode
- **Can't find Vercel URL**: Check "Domains" section in project settings
- **Variables not working**: Make sure to redeploy after adding variables
