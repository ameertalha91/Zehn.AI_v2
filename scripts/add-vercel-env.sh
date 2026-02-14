#!/bin/bash

# Script to help add environment variables to Vercel
# This guides you through adding DATABASE_URL and NEXTAUTH_URL

set -e

echo "🔧 Vercel Environment Variables Setup"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

echo ""
echo "This script will help you add DATABASE_URL and NEXTAUTH_URL to Vercel"
echo ""

# Check if logged in
echo "🔐 Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel..."
    vercel login
else
    echo "✅ Already logged in to Vercel"
    vercel whoami
fi

echo ""
echo "📋 Step 1: DATABASE_URL"
echo "----------------------"
echo ""
echo "You need a PostgreSQL database. Options:"
echo "1. Vercel Postgres (easiest - free tier available)"
echo "2. Digital Ocean Managed Database"
echo "3. Supabase (free tier available)"
echo "4. I already have a database connection string"
echo ""
read -p "Do you have a DATABASE_URL connection string? (yes/no): " has_db

if [ "$has_db" == "yes" ]; then
    echo ""
    read -p "Enter your DATABASE_URL: " db_url
    echo ""
    echo "Adding DATABASE_URL to Vercel..."
    echo "$db_url" | vercel env add DATABASE_URL production
    echo "$db_url" | vercel env add DATABASE_URL preview
    echo "$db_url" | vercel env add DATABASE_URL development
    echo "✅ DATABASE_URL added!"
else
    echo ""
    echo "📝 You need to create a database first. Options:"
    echo ""
    echo "Option 1: Vercel Postgres (Recommended)"
    echo "  1. Go to Vercel Dashboard → Your Project → Storage"
    echo "  2. Click 'Create Database' → Select 'Postgres'"
    echo "  3. Vercel will automatically add DATABASE_URL"
    echo ""
    echo "Option 2: Digital Ocean"
    echo "  1. Go to Digital Ocean → Create → Databases"
    echo "  2. Select PostgreSQL"
    echo "  3. Copy connection string from Connection Details"
    echo ""
    echo "Option 3: Supabase"
    echo "  1. Go to https://supabase.com"
    echo "  2. Create free project"
    echo "  3. Get connection string from Settings → Database"
    echo ""
    echo "After creating a database, run this script again with your connection string."
    exit 0
fi

echo ""
echo "📋 Step 2: NEXTAUTH_URL"
echo "----------------------"
echo ""

# Try to get project URL automatically
if [ -f ".vercel/project.json" ]; then
    project_url=$(cat .vercel/project.json | grep -o '"url":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ ! -z "$project_url" ]; then
        echo "Detected project URL: https://$project_url"
        read -p "Use this URL for NEXTAUTH_URL? (yes/no): " use_detected
        if [ "$use_detected" == "yes" ]; then
            nextauth_url="https://$project_url"
        else
            read -p "Enter your NEXTAUTH_URL (e.g., https://your-app.vercel.app): " nextauth_url
        fi
    else
        read -p "Enter your NEXTAUTH_URL (e.g., https://your-app.vercel.app): " nextauth_url
    fi
else
    read -p "Enter your NEXTAUTH_URL (e.g., https://your-app.vercel.app): " nextauth_url
fi

echo ""
echo "Adding NEXTAUTH_URL to Vercel..."
echo "$nextauth_url" | vercel env add NEXTAUTH_URL production
echo "$nextauth_url" | vercel env add NEXTAUTH_URL preview
echo "$nextauth_url" | vercel env add NEXTAUTH_URL development
echo "✅ NEXTAUTH_URL added!"

echo ""
echo "📥 Pulling environment variables to .env.local..."
vercel env pull .env.local

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Environment variables added to Vercel:"
echo "  ✅ DATABASE_URL"
echo "  ✅ NEXTAUTH_URL"
echo ""
echo "Next steps:"
echo "1. Run: npm run migrate:interactive"
echo "2. Or deploy your project in Vercel dashboard"
