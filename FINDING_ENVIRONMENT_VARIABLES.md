# Where to Find Your Environment Variables

## ⚠️ Important: Environment Variables Are NOT in GitHub

Environment variables are **never stored in GitHub repositories** for security reasons. They're stored in your deployment platforms.

## Where to Find Them

### 1. Vercel Dashboard (Primary Location)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (the one currently using `edprep-platform`)
3. **Navigate to**: Settings → Environment Variables
4. **You'll see all your environment variables there**, including:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `NEXTAUTH_URL`
   - `NODE_ENV`
   - Any other custom variables

**To copy them:**
- Click on each variable to view its value
- Copy the values to a secure location (password manager, notes app, etc.)
- You'll need these when setting up the new repository

### 2. Digital Ocean Droplet (If Applicable)

If you have services running on Digital Ocean:

1. **SSH into your droplet**:
   ```bash
   ssh user@your-droplet-ip
   ```

2. **Navigate to your app directory**:
   ```bash
   cd /path/to/your/app
   ```

3. **Check for environment files**:
   ```bash
   # Look for .env file
   cat .env
   
   # Or check systemd service files
   sudo systemctl cat your-app-name
   
   # Or check PM2 ecosystem file
   cat ecosystem.config.js
   
   # Or check Docker environment
   docker-compose config
   ```

### 3. Old Repository (edprep-platform) - Only if You Have Local Access

If you have the old repository cloned locally:

1. **Check for `.env.example` or `.env.local`** (these might have variable names, but not values):
   ```bash
   cd /path/to/edprep-platform
   cat .env.example
   ```

2. **Check deployment configuration files**:
   ```bash
   # Check for vercel.json or similar
   cat vercel.json
   
   # Check for any deployment scripts
   ls -la scripts/
   ```

**Note**: Actual values won't be in the repo, only variable names.

## Step-by-Step: Getting Variables from Vercel

### Method 1: View in Dashboard (Easiest)

1. Login to https://vercel.com
2. Click on your project
3. Go to **Settings** (gear icon in top right)
4. Click **Environment Variables** in the left sidebar
5. You'll see a table with:
   - Variable name
   - Value (partially hidden for security)
   - Environment (Production, Preview, Development)
6. Click the **eye icon** or **three dots** → **View** to see the full value
7. Copy each value

### Method 2: Using Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

This will create a `.env.local` file with all your environment variables.

## What You Need to Copy

Make sure you have these values:

1. **DATABASE_URL**
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - This is your PostgreSQL connection string

2. **OPENAI_API_KEY**
   - Format: `sk-...` (starts with `sk-`)
   - Your OpenAI API key

3. **NEXTAUTH_URL**
   - Format: `https://your-app.vercel.app` or your custom domain
   - Your production URL

4. **NODE_ENV**
   - Usually just: `production`
   - Set this in Vercel

5. **Any other custom variables** your app uses

## Setting Them in the New Repository

Once you have the values:

### In Vercel:
1. Go to your project (after connecting Zehn.AI_v1 repo)
2. Settings → Environment Variables
3. Click **Add New**
4. Add each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: (paste the value)
   - **Environment**: Select Production, Preview, Development (or all)
5. Repeat for each variable

### In Digital Ocean:
1. SSH into your droplet
2. Navigate to app directory
3. Create/update `.env` file:
   ```bash
   nano .env
   ```
4. Add all variables:
   ```
   DATABASE_URL=your-value
   OPENAI_API_KEY=your-value
   NEXTAUTH_URL=your-value
   NODE_ENV=production
   ```
5. Save and restart your service

## Security Best Practices

⚠️ **Never commit environment variables to GitHub!**

- ✅ Store them in Vercel/Digital Ocean
- ✅ Use `.env.local` for local development (already in `.gitignore`)
- ✅ Never push `.env` files to GitHub
- ✅ Use `.env.example` to document variable names (without values)

## Troubleshooting

**"I can't see the values in Vercel"**
- Make sure you're logged in as the project owner/admin
- Check if you have the right permissions

**"I don't have access to the old Vercel project"**
- Contact the project owner to get access
- Or check if you have the values stored elsewhere (password manager, notes, etc.)

**"I can't find DATABASE_URL"**
- It might be named differently (e.g., `POSTGRES_URL`, `DB_URL`)
- Check your old codebase for how it references the database
- Check Digital Ocean if you're using their managed database

**"I need to create new values"**
- `DATABASE_URL`: Get from your database provider (Digital Ocean, AWS RDS, etc.)
- `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
- `NEXTAUTH_URL`: Your Vercel deployment URL
