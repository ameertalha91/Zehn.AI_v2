#!/bin/bash

# Script to set DATABASE_URL in .env.local
# Run: ./scripts/set-database-url.sh
# Then paste your URL when prompted (you can paste with Cmd+V in Terminal)

echo "🔧 Set DATABASE_URL for Zehn.AI_v1"
echo ""
echo "Paste your DATABASE_URL from Vercel (click eye icon to reveal, then copy)."
echo "It should look like: postgresql://user:password@host:port/database?sslmode=require"
echo ""

# If URL starts with postgres:// we fix it to postgresql://
read -p "Paste your DATABASE_URL here and press Enter: " db_url

# Fix postgres:// to postgresql:// if needed
if [[ "$db_url" == postgres://* ]]; then
  db_url="postgresql://${db_url#postgres://}"
  echo "✅ Fixed protocol to postgresql://"
fi

if [ -z "$db_url" ]; then
  echo "❌ No URL entered. Exiting."
  exit 1
fi

# Ensure it starts with postgresql://
if [[ "$db_url" != postgresql://* ]]; then
  echo "⚠️  URL should start with postgresql:// - adding it."
  db_url="postgresql://${db_url}"
fi

# Create or update .env.local (run from project root)
cd "$(dirname "$0")/.." || exit 1
ENV_FILE=".env.local"
TMP_FILE="${ENV_FILE}.tmp"

rm -f "$TMP_FILE"
if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^DATABASE_URL= ]] && continue
    echo "$line" >> "$TMP_FILE"
  done < "$ENV_FILE"
  mv "$TMP_FILE" "$ENV_FILE"
fi

echo "DATABASE_URL=$db_url" >> "$ENV_FILE"

echo ""
echo "✅ DATABASE_URL has been written to .env.local"
echo ""
echo "Next step: run  npm run migrate:interactive"
