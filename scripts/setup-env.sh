#!/bin/bash

# Setup Environment Variables Script
# This helps you set up your .env.local file

set -e

echo "🔧 Setting up environment variables..."
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists"
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "Keeping existing .env.local"
        exit 0
    fi
fi

# Start creating .env.local
cat > .env.local << 'EOF'
# Environment Variables for Zehn.AI_v1
# IMPORTANT: This file is git-ignored. Never commit this file.

# External API URL (Digital Ocean Droplet)
REACT_APP_API_URL=138.197.9.156:3001

# Database Configuration (PostgreSQL)
# Get this from Vercel Dashboard → Settings → Environment Variables
DATABASE_URL=

# OpenAI API Key
# Get this from Vercel Dashboard → Settings → Environment Variables
OPENAI_API_KEY=

# Application URL
# For production: https://your-app.vercel.app
# For local: http://localhost:3000
NEXTAUTH_URL=

# Node Environment
NODE_ENV=development
EOF

echo "✅ Created .env.local with REACT_APP_API_URL"
echo ""
echo "📥 Next: Get missing variables from Vercel"
echo ""
read -p "Do you want to pull environment variables from Vercel now? (yes/no): " pull

if [ "$pull" == "yes" ]; then
    if command -v vercel &> /dev/null; then
        echo ""
        echo "Pulling environment variables from Vercel..."
        vercel env pull .env.local
        echo ""
        echo "✅ Environment variables pulled from Vercel!"
    else
        echo ""
        echo "❌ Vercel CLI not found. Install it first:"
        echo "   npm install -g vercel"
        echo ""
        echo "Then run: vercel env pull .env.local"
    fi
else
    echo ""
    echo "📝 To get missing variables, run:"
    echo "   vercel env pull .env.local"
    echo ""
    echo "Or manually add them to .env.local"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Current .env.local contains:"
echo "  ✅ REACT_APP_API_URL=138.197.9.156:3001"
echo "  ⚠️  DATABASE_URL (needs to be added)"
echo "  ⚠️  OPENAI_API_KEY (needs to be added)"
echo "  ⚠️  NEXTAUTH_URL (needs to be added)"
echo ""
echo "See ENV_VARIABLES_CHECKLIST.md for details"
