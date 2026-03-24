# Vercel Storage Setup Required

## Problem
Vercel serverless functions have a **read-only filesystem**. You cannot write to `data/images.json` or `data/rankings.json` in production.

## Solution Options

### Option 1: Vercel Blob Storage (Recommended for images)
1. Go to https://vercel.com/raphaelbgrs-projects/hack-sense-2025/stores
2. Click "Create Database" → "Blob"
3. Connect it to your project
4. Copy the `BLOB_READ_WRITE_TOKEN` to environment variables
5. Update code to use `@vercel/blob` for image uploads

### Option 2: Vercel KV (Recommended for JSON data)
1. Go to https://vercel.com/raphaelbgrs-projects/hack-sense-2025/stores
2. Click "Create Database" → "KV" (Redis)
3. Connect it to your project
4. Use it to store images.json and rankings.json data

### Option 3: External Database (Supabase, PlanetScale, etc.)
Use a free tier database to store image metadata and rankings.

### Option 4: GitHub as Storage (Quick Hack)
Use GitHub API to commit changes to data files (not recommended for production).

## Current Status
- Admin uploads will timeout (504) because filesystem is read-only
- Need to implement one of the above solutions
- Local dev (npm run dev) works fine because it has filesystem access
