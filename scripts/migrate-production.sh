#!/bin/bash

# Production Database Migration Script
# This script helps migrate your database schema to production

set -e  # Exit on error

echo "🚀 Starting Production Database Migration..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo ""
    echo "Or create a .env file with DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Confirm before proceeding
read -p "⚠️  This will modify your production database. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "📊 Step 2: Pushing schema to database..."
echo "   This will create/update tables without deleting data..."
npx prisma db push --accept-data-loss

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify the schema: npx prisma studio"
echo "2. Test your application"
echo "3. Check Vercel deployment logs"
