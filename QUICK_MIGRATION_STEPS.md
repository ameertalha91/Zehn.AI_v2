# Quick Migration Steps

## TL;DR - Fast Migration Checklist

### 1. Vercel Configuration (5 minutes)

1. **Go to Vercel Dashboard** → Your Project → Settings → Git
2. **Disconnect** current repository (edprep-platform)
3. **Connect** new repository: `Zehn.AI_v1`
4. **Verify Build Settings**:
   - Framework: Next.js
   - Build Command: `prisma generate && npm run build`
   - Output Directory: `.next`
5. **Set Environment Variables** (Settings → Environment Variables):
   ```
   DATABASE_URL=your-existing-postgresql-url
   OPENAI_API_KEY=your-existing-key
   NEXTAUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
6. **Deploy** - Vercel will automatically deploy from the new repo

### 2. Database Migration (10 minutes)

**Option A: If you want to keep existing data**
```bash
# 1. Backup your existing database first
pg_dump -h your-host -U your-user -d your-database > backup.sql

# 2. Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@host:port/database"

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema (creates new tables, doesn't delete existing)
npx prisma db push

# 5. Run migrations if needed
npx prisma migrate deploy
```

**Option B: Fresh start (if you don't need old data)**
```bash
# 1. Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# 2. Generate and push
npx prisma generate
npx prisma db push
```

### 3. Digital Ocean Droplet (if applicable)

If you have services running on Digital Ocean:

```bash
# SSH into your droplet
ssh user@your-droplet-ip

# Navigate to app directory
cd /path/to/your/app

# Update to new repository
git remote set-url origin https://github.com/your-username/Zehn.AI_v1.git
git pull origin main

# Install dependencies
npm install

# Set environment variables (create .env file)
nano .env
# Add: DATABASE_URL, OPENAI_API_KEY, NEXTAUTH_URL, NODE_ENV

# Run migrations
npx prisma generate
npx prisma migrate deploy

# Restart your service
pm2 restart your-app
# OR
sudo systemctl restart your-app
```

### 4. Verify Deployment

1. Check Vercel deployment logs for errors
2. Test your production URL
3. Verify database connection
4. Test key features:
   - Login/Register
   - Course creation
   - Video upload
   - Quiz generation

## Important Notes

⚠️ **Before migrating:**
- Backup your database
- Note down all environment variables
- Test locally first if possible

⚠️ **Schema Change:**
- The Prisma schema now uses PostgreSQL (not SQLite)
- Make sure your `DATABASE_URL` points to a PostgreSQL database
- For local development, you can still use SQLite by temporarily changing the schema

⚠️ **If you need SQLite for local dev:**
- You can create a `schema.prisma.local` file
- Or use a script to switch between SQLite and PostgreSQL
- See MIGRATION_GUIDE.md for more details

## Rollback (if needed)

1. **Vercel**: Go to Deployments → Previous deployment → Promote to Production
2. **Database**: Restore from backup: `psql -h host -U user -d database < backup.sql`
3. **Digital Ocean**: `git checkout previous-commit` and restart service

## Need Help?

See `MIGRATION_GUIDE.md` for detailed step-by-step instructions.
