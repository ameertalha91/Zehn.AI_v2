# Migration Guide: edprep-platform → Zehn.AI_v1

This guide will help you migrate your existing Vercel and Digital Ocean deployment from the `edprep-platform` repository to the `Zehn.AI_v1` repository.

## Prerequisites

- Access to your Vercel dashboard
- Access to your Digital Ocean droplet
- Database credentials from your existing deployment
- Environment variables from your existing deployment

## Step 1: Prisma Schema Configuration

The schema has been updated to use PostgreSQL for production (required for Vercel/Digital Ocean deployments). The schema now uses `DATABASE_URL` from environment variables.

**Important**: 
- Production requires PostgreSQL (SQLite won't work on Vercel)
- For local development, see `LOCAL_DEVELOPMENT_SETUP.md` for options
- The schema file is configured for PostgreSQL - if you need SQLite locally, you'll need to temporarily modify it

## Step 2: Environment Variables

### 2.1 Collect Environment Variables from edprep-platform

From your existing Vercel project, collect these environment variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- Any other custom environment variables

### 2.2 Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (the one currently using edprep-platform)
3. Go to **Settings** → **Environment Variables**
4. Add/update the following variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   OPENAI_API_KEY=your-openai-key
   NEXTAUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

## Step 3: Update Vercel Project to Use New Repository

### 3.1 Option A: Change Git Repository in Vercel (Recommended)

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Git**
3. Click **Disconnect** from the current repository
4. Click **Connect Git Repository**
5. Select the `Zehn.AI_v1` repository
6. Configure:
   - **Root Directory**: Leave as `/` (or set if your app is in a subdirectory)
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (or `prisma generate && npm run build` if needed)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3.2 Option B: Manual Deployment

If you prefer to keep the old repo connected:
1. Build the project locally: `npm run build`
2. Deploy manually via Vercel CLI: `vercel --prod`

## Step 4: Database Migration

### 4.1 Backup Existing Database

Before migrating, backup your existing database:
```bash
# On Digital Ocean droplet or via your database provider
pg_dump -h your-host -U your-user -d your-database > backup.sql
```

### 4.2 Run Prisma Migrations

1. Set your `DATABASE_URL` environment variable
2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
3. Push the schema to production:
   ```bash
   npx prisma db push
   ```
   OR run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### 4.3 Verify Database Schema

Check that all tables are created correctly:
```bash
npx prisma studio
```

## Step 5: Digital Ocean Droplet Configuration

### 5.1 Update Code on Droplet

If you have any services running on your Digital Ocean droplet:

1. SSH into your droplet:
   ```bash
   ssh user@your-droplet-ip
   ```

2. Navigate to your application directory:
   ```bash
   cd /path/to/your/app
   ```

3. Pull the new codebase:
   ```bash
   git clone https://github.com/your-username/Zehn.AI_v1.git
   # OR if updating existing directory:
   git remote set-url origin https://github.com/your-username/Zehn.AI_v1.git
   git pull origin main
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set environment variables (create `.env` file):
   ```bash
   DATABASE_URL=your-production-database-url
   OPENAI_API_KEY=your-openai-key
   NEXTAUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

6. Run database migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

7. Restart your application service:
   ```bash
   # If using PM2:
   pm2 restart your-app-name
   
   # If using systemd:
   sudo systemctl restart your-app-name
   
   # If using Docker:
   docker-compose restart
   ```

## Step 6: Build Configuration

### 6.1 Update package.json Scripts (if needed)

Ensure your `package.json` has the correct build scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### 6.2 Vercel Build Settings

In Vercel, ensure these build settings:
- **Build Command**: `npm run build` (or `prisma generate && npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Step 7: Testing the Migration

### 7.1 Test Locally First

1. Set up local environment variables matching production
2. Run: `npm run dev`
3. Test all major features:
   - User authentication
   - Course management
   - Video processing
   - Quiz generation
   - Assignment submission

### 7.2 Test Production Deployment

1. Deploy to a preview environment first
2. Test all critical paths
3. Monitor for errors in Vercel logs
4. Once verified, deploy to production

## Step 8: Post-Migration Checklist

- [ ] All environment variables are set correctly
- [ ] Database schema is migrated successfully
- [ ] All API endpoints are working
- [ ] Authentication is working
- [ ] File uploads are working (if applicable)
- [ ] OpenAI API integration is working
- [ ] No errors in Vercel logs
- [ ] Digital Ocean services are running correctly
- [ ] Domain/DNS settings are correct (if using custom domain)

## Step 9: Rollback Plan (if needed)

If something goes wrong:

1. **Vercel**: 
   - Go to Deployments → Select previous deployment → Promote to Production

2. **Database**:
   - Restore from backup: `psql -h host -U user -d database < backup.sql`

3. **Digital Ocean**:
   - Revert to previous code version via git
   - Restart services

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check database firewall rules
   - Ensure database is accessible from Vercel/Digital Ocean

2. **Prisma Client Not Generated**
   - Add `prisma generate` to build command
   - Or add `"postinstall": "prisma generate"` to package.json

3. **Build Failures**
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

4. **Environment Variables Not Loading**
   - Restart Vercel deployment after adding env vars
   - Verify variable names match exactly (case-sensitive)

## Support

If you encounter issues during migration:
1. Check Vercel deployment logs
2. Check Digital Ocean application logs
3. Verify database connectivity
4. Review environment variable configuration
