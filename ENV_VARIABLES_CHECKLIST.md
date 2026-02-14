# Environment Variables Checklist

## ✅ What You've Provided

- `REACT_APP_API_URL=138.197.9.156:3001` ✅ (Added to .env.local)

## ⚠️ What You Still Need

You need to get these from your Vercel project:

### 1. DATABASE_URL (Required)
- **What it is**: PostgreSQL connection string
- **Where to find**: Vercel Dashboard → Your Project → Settings → Environment Variables
- **Format**: `postgresql://user:password@host:port/database?sslmode=require`
- **Why needed**: Your app uses Prisma to connect to the database

### 2. OPENAI_API_KEY (Required)
- **What it is**: Your OpenAI API key for AI features
- **Where to find**: Vercel Dashboard → Environment Variables
- **Format**: `sk-...` (starts with `sk-`)
- **Why needed**: Used for quiz generation, AI chat, and other AI features

### 3. NEXTAUTH_URL (Required)
- **What it is**: Your application's public URL
- **Where to find**: Vercel Dashboard → Environment Variables
- **Format**: `https://your-app.vercel.app` or your custom domain
- **Why needed**: Used for authentication and API calls

### 4. NODE_ENV (Optional but recommended)
- **What it is**: Environment type
- **Value**: `production` for production, `development` for local
- **Why needed**: Helps Next.js optimize for production

## 🚀 Quick Steps to Get Missing Variables

### Option 1: Using Vercel CLI (Easiest)

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login
vercel login

# Pull all environment variables (this will update .env.local)
vercel env pull .env.local
```

This will automatically add all missing variables to your `.env.local` file!

### Option 2: Manual Copy from Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (the one using edprep-platform)
3. Go to **Settings** → **Environment Variables**
4. For each variable above:
   - Click to view the value
   - Copy it
   - Add it to `.env.local` file

## 📝 Current .env.local Status

I've created a `.env.local` file with your `REACT_APP_API_URL`. 

**To complete setup, run:**
```bash
vercel env pull .env.local
```

This will add all the missing variables automatically!

## ✅ Verification

After adding all variables, verify they're set:

```bash
# Check if variables are loaded
node -e "require('dotenv').config({path:'.env.local'}); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'); console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'); console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing');"
```

## 🔧 What I've Updated

1. ✅ Created `.env.local` with your `REACT_APP_API_URL`
2. ✅ Updated `app/api/pakistan-studies/route.ts` to use the API URL from environment
3. ✅ Created `.env.local.example` as a template

## Next Steps

1. **Get missing variables**: Run `vercel env pull .env.local`
2. **Or manually add them** to `.env.local`
3. **Run migration**: `npm run migrate:interactive`
