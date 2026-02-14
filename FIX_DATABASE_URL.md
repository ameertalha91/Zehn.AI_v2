# Fix: "The URL must start with the protocol postgresql://"

## Where to add your Database URL

Put it in a file named **`.env.local`** in your project root:

```
/Users/ameertalha/Documents/Zehn.AI_v1/.env.local
```

## Step 1: Get your connection string from Vercel

1. Open **Vercel Dashboard** → your project → **Settings** → **Environment Variables**.
2. Find **`DATABASE_URL`** (or **`POSTGRES_PRISMA_URL`** from Neon).
3. Click the **eye icon** 👁️ to reveal the value.
4. **Copy the full string.**

## Step 2: Make sure it starts with `postgresql://`

Prisma requires the **`postgresql://`** protocol.

- **Correct:** `postgresql://user:password@host:port/database?sslmode=require`
- **Wrong:** `postgres://...` (missing `ql`)
- **Wrong:** no protocol (e.g. just `host:port`)

If your URL starts with **`postgres://`**, change it to **`postgresql://`** (add `ql` after `postgres`).

## Step 3: Edit `.env.local`

**Option A: Using Terminal**

```bash
cd /Users/ameertalha/Documents/Zehn.AI_v1
nano .env.local
```

Add or edit this line (paste your real URL, no quotes):

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

Save: `Ctrl + O`, `Enter`, then `Ctrl + X`.

**Option B: Using a text editor**

1. Open **Finder** → go to `Documents` → `Zehn.AI_v1`.
2. Press **Cmd + Shift + .** to show hidden files.
3. Open **`.env.local`** in TextEdit or VS Code.
4. Set:
   ```
   DATABASE_URL=postgresql://your-actual-connection-string-here
   ```
5. Save the file.

## Step 4: Run migration again

```bash
cd /Users/ameertalha/Documents/Zehn.AI_v1
npm run migrate:interactive
```

## Example `.env.local`

```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
REACT_APP_API_URL=138.197.9.156:3001
OPENAI_API_KEY=sk-your-key
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=development
```

**Important:** No spaces around `=`, and no quotes around the URL unless the password has special characters.
