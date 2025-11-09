# 🚀 eBook SaaS Platform - Setup Guide

This guide will walk you through setting up the eBook Creator MVP from scratch.

## ✅ What's Been Implemented

### PHASE 1: Project Setup ✅
- ✅ All configuration files created (Next.js, TypeScript, Tailwind, Jest, ESLint, Prettier)
- ✅ package.json with all required dependencies
- ✅ shadcn/ui base components (Button, Card, Input, Label, Dialog, Dropdown)
- ✅ Root layout with Toaster
- ✅ Landing page with hero and features

### PHASE 2: Database & Auth ✅
- ✅ 4 Supabase SQL migrations ready to run
- ✅ Supabase client utilities (browser, server, middleware)
- ✅ Complete Auth feature:
  - Types and Zod schemas for validation
  - Server Actions (signup, login, logout)
  - Client hooks (useAuth, useSession)
  - Login and Signup forms
  - Auth pages with layouts
- ✅ Middleware for route protection

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Supabase account (free tier is fine)
- Git (optional, for version control)

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install all the dependencies listed in package.json (~50+ packages).

**Expected time:** 2-3 minutes

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Name:** ebook-creator (or any name you prefer)
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free

4. Wait for the project to be created (~2 minutes)

### Step 3: Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 4: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 5: Run Database Migrations

You need to run the SQL migrations to create the database tables.

1. Go to your Supabase project
2. Click on **SQL Editor** (left sidebar)
3. Create a **New Query**
4. Copy and paste each migration file one by one:

**Migration 001:** `supabase/migrations/001_create_profiles_table.sql`

```sql
-- Copy entire file contents
```

Click **Run** ▶️

**Migration 002:** `supabase/migrations/002_create_projects_table.sql`

```sql
-- Copy entire file contents
```

Click **Run** ▶️

**Migration 003:** `supabase/migrations/003_enable_rls.sql`

```sql
-- Copy entire file contents
```

Click **Run** ▶️

**Migration 004:** `supabase/migrations/004_create_storage_buckets.sql`

```sql
-- Copy entire file contents
```

Click **Run** ▶️

**Verify migrations ran successfully:**
- Go to **Table Editor** → You should see `profiles` and `projects` tables
- Go to **Storage** → You should see `project-thumbnails` and `user-uploads` buckets

### Step 6: Start Development Server

```bash
npm run dev
```

The app should start on `http://localhost:3000`

**You should see:**
- Landing page with "Create Professional eBooks" hero
- Login and Sign Up buttons in the header

### Step 7: Test Authentication

1. Click **"Get Started"** or **"Sign Up"**
2. Fill in the signup form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
3. Click **"Create Account"**

**Expected behavior:**
- Success toast appears
- You are redirected to `/dashboard`
- Dashboard page shows (will be empty for now, implemented in PHASE 3)

4. Click Logout (if there's a logout button)
5. Click **"Login"** and use the same credentials

**Expected behavior:**
- Success toast appears
- You are redirected to `/dashboard`

## 🧪 Verify Everything Works

### Check 1: Auth Flow

- [ ] Landing page loads without errors
- [ ] Can navigate to /signup page
- [ ] Can create a new user
- [ ] Redirect to /dashboard after signup
- [ ] Middleware protects /dashboard (try accessing when logged out)
- [ ] Can logout
- [ ] Can login with same credentials

### Check 2: Database

Go to Supabase **Table Editor** → **profiles**:
- You should see your test user's profile row

### Check 3: Console Errors

Open browser console (F12):
- [ ] No red errors
- [ ] No TypeScript errors

## 🐛 Troubleshooting

### Error: "Hydration failed"

This is usually a React 19 compatibility issue. Try:

```bash
rm -rf .next
npm run dev
```

### Error: "Invalid API key"

Check that your `.env.local` has the correct Supabase credentials with no extra spaces.

### Error: "Failed to create user"

Check that:
1. All 4 migrations ran successfully
2. RLS policies are enabled
3. The `on_auth_user_created` trigger exists

### Port 3000 already in use

Kill the process using port 3000:

```bash
# Windows
npx kill-port 3000

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or just use a different port:

```bash
npm run dev -- -p 3001
```

## ✅ Next Steps

Once authentication is working, the next phases are:

### PHASE 3: Projects Feature (Next to implement)
- Projects CRUD operations
- Dashboard with project cards
- Create/Edit/Delete projects
- Project thumbnails

### PHASE 4: Editor Feature (Core MVP)
- Drag & drop editor
- Text, Heading, Image, Divider, Spacer blocks
- Properties panel
- Auto-save
- Preview mode

### PHASE 5: PDF Export
- Puppeteer integration
- PDF generation API
- Download functionality

### PHASE 6: Polish
- Error boundaries
- Loading states
- Mobile responsive
- Toast notifications

## 📞 Need Help?

If you encounter issues:

1. Check the console for errors
2. Verify all migrations ran successfully
3. Check `.env.local` configuration
4. Try clearing Next.js cache: `rm -rf .next`

---

**Setup Status:** PHASE 1 & 2 Complete ✅

Ready to continue with PHASE 3! 🚀
