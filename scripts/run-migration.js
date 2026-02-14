#!/usr/bin/env node

/**
 * Interactive Migration Helper
 * Guides you through the migration process step by step
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Zehn.AI Migration Helper\n');
  console.log('This script will guide you through migrating from edprep-platform to Zehn.AI_v1\n');

  // Step 1: Check prerequisites
  console.log('📋 Step 1: Checking prerequisites...\n');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch (e) {
    console.log('❌ Node.js not found. Please install Node.js first.');
    process.exit(1);
  }

  // Check if .env.local exists
  const hasEnvLocal = fs.existsSync('.env.local');
  if (hasEnvLocal) {
    console.log('✅ .env.local file exists');
  } else {
    console.log('⚠️  .env.local file not found');
    const createEnv = await question('\nDo you want to pull environment variables from Vercel? (yes/no): ');
    if (createEnv.toLowerCase() === 'yes') {
      try {
        execSync('vercel env pull .env.local', { stdio: 'inherit' });
        console.log('✅ Environment variables pulled from Vercel');
      } catch (e) {
        console.log('❌ Failed to pull from Vercel. Make sure you have Vercel CLI installed and are logged in.');
        console.log('   Install: npm install -g vercel');
        console.log('   Login: vercel login');
      }
    }
  }

  // Check DATABASE_URL
  require('dotenv').config({ path: '.env.local' });
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is set');
  } else {
    console.log('❌ DATABASE_URL not found in .env.local');
    console.log('   Please add your PostgreSQL connection string to .env.local');
    process.exit(1);
  }

  console.log('\n📦 Step 2: Installing dependencies...\n');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed');
  } catch (e) {
    console.log('\n❌ Failed to install dependencies');
    process.exit(1);
  }

  console.log('\n🔧 Step 3: Generating Prisma Client...\n');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('\n✅ Prisma Client generated');
  } catch (e) {
    console.log('\n❌ Failed to generate Prisma Client');
    process.exit(1);
  }

  console.log('\n📊 Step 4: Database Migration\n');
  console.log('⚠️  This will modify your production database!');
  const confirm = await question('Do you want to proceed with database migration? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('\nMigration cancelled. You can run it later with: npx prisma db push');
    rl.close();
    return;
  }

  console.log('\n🔄 Pushing schema to database...\n');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('\n✅ Database schema updated successfully!');
  } catch (e) {
    console.log('\n❌ Database migration failed');
    console.log('   Check your DATABASE_URL and database connection');
    process.exit(1);
  }

  console.log('\n✅ Migration Complete!\n');
  console.log('Next steps:');
  console.log('1. Update Vercel project to use Zehn.AI_v1 repository');
  console.log('2. Verify deployment in Vercel dashboard');
  console.log('3. Test your application');
  console.log('\nTo verify database schema, run: npx prisma studio');

  rl.close();
}

main().catch(console.error);
