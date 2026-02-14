#!/bin/bash

# Vercel Setup and Deployment Script
# This script helps set up Vercel CLI and deploy your project

set -e

echo "🚀 Vercel Setup and Deployment Script"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is already installed"
fi

echo ""
echo "🔐 Step 1: Login to Vercel"
echo "   (This will open a browser for authentication)"
vercel login

echo ""
echo "📥 Step 2: Pulling environment variables from Vercel..."
echo "   This will create a .env.local file with your production variables"
vercel env pull .env.local

echo ""
echo "✅ Environment variables pulled to .env.local"
echo ""
echo "📤 Step 3: Linking to your Vercel project..."
echo "   Select your existing project when prompted"
vercel link

echo ""
read -p "Deploy to production now? (yes/no): " deploy
if [ "$deploy" == "yes" ]; then
    echo ""
    echo "🚀 Deploying to production..."
    vercel --prod
    echo ""
    echo "✅ Deployment complete!"
else
    echo ""
    echo "To deploy later, run: vercel --prod"
fi

echo ""
echo "📝 Next steps:"
echo "1. Update your Vercel project to use Zehn.AI_v1 repository (via dashboard)"
echo "2. Run database migration: ./scripts/migrate-production.sh"
echo "3. Test your deployment"
