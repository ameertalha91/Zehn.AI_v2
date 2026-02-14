# Installing Node.js on macOS

You need Node.js to run the migration. Here's how to install it:

## Option 1: Install via Homebrew (Recommended - Easiest)

### Step 1: Install Homebrew (if you don't have it)

Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. This may take a few minutes.

### Step 2: Install Node.js

After Homebrew is installed, run:
```bash
brew install node
```

### Step 3: Verify Installation

```bash
node --version
npm --version
```

You should see version numbers for both.

## Option 2: Download Node.js Installer (Easier if you don't want Homebrew)

1. **Go to**: https://nodejs.org/
2. **Download** the LTS (Long Term Support) version for macOS
3. **Open the downloaded .pkg file**
4. **Follow the installation wizard**
5. **Restart Terminal** after installation

### Verify Installation

Open a new Terminal window and run:
```bash
node --version
npm --version
```

You should see version numbers.

## Option 3: Use nvm (Node Version Manager) - Advanced

If you want to manage multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart Terminal, then:
nvm install --lts
nvm use --lts
```

## After Installing Node.js

Once Node.js is installed, you can proceed with the migration:

```bash
# Navigate to your project
cd /Users/ameertalha/Documents/Zehn.AI_v1

# Install project dependencies
npm install

# Run migration
npm run migrate:interactive
```

## Quick Check

To see if Node.js is already installed (maybe in a different location):
```bash
which node
which npm
```

If these return paths, Node.js might be installed but not in your PATH.
