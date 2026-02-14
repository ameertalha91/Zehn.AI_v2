# Create .env.local Manually

Since Vercel CLI installation had permission issues, let's create the `.env.local` file manually.

## Step 1: Get DATABASE_URL from Vercel

1. **Go to Vercel Dashboard** → Your Project
2. **Go to Settings → Environment Variables**
3. **Find `DATABASE_URL`** in the list
4. **Click the eye icon** 👁️ to reveal the value
5. **Copy the entire connection string**

It will look something like:
```
postgresql://user:password@host:port/database?sslmode=require
```

## Step 2: Create .env.local File

In your Terminal, run:

```bash
cd /Users/ameertalha/Documents/Zehn.AI_v1

# Create the file (this will open in a text editor)
nano .env.local
```

Then paste this template and fill in your values:

```
# Database Configuration
DATABASE_URL=postgresql://your-connection-string-here

# External API URL
REACT_APP_API_URL=138.197.9.156:3001

# OpenAI API Key (get from Vercel dashboard)
OPENAI_API_KEY=your-openai-key-here

# Application URL
NEXTAUTH_URL=https://your-project.vercel.app

# Node Environment
NODE_ENV=development
```

**To save in nano:**
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

## Step 3: Get Other Values from Vercel

Go back to Vercel Dashboard → Settings → Environment Variables and copy:
- `OPENAI_API_KEY` (click eye icon to reveal)
- `NEXTAUTH_URL` (should be your Vercel URL)

Then update your `.env.local` file with the actual values.

## Alternative: Skip Local Setup Entirely

Since all variables are already in Vercel, you can:
1. **Skip creating .env.local**
2. **Just update Vercel to use Zehn.AI_v1 repository**
3. **Vercel will use the variables automatically during deployment**

This is actually easier! The database migration will run during the Vercel build process.
