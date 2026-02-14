#!/bin/bash

# Helper script to create .env.local file
# Run this after getting your DATABASE_URL from Vercel

echo "🔧 Setting up .env.local file..."
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

echo "Please provide the following values from your Vercel dashboard:"
echo ""

# Get DATABASE_URL
read -p "Enter DATABASE_URL (from Vercel → Settings → Env Vars → click eye icon): " db_url

# Get OPENAI_API_KEY
read -p "Enter OPENAI_API_KEY (from Vercel → Settings → Env Vars): " openai_key

# Get NEXTAUTH_URL
read -p "Enter NEXTAUTH_URL (from Vercel → Settings → Env Vars, or your Vercel URL): " nextauth_url

# Create .env.local file
cat > .env.local << EOF
# Environment Variables for Zehn.AI_v1
DATABASE_URL=$db_url
REACT_APP_API_URL=138.197.9.156:3001
OPENAI_API_KEY=$openai_key
NEXTAUTH_URL=$nextauth_url
NODE_ENV=development
EOF

echo ""
echo "✅ .env.local file created!"
echo ""
echo "Next step: Run 'npm run migrate:interactive'"
