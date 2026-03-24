# Supabase Setup Instructions

## Step 1: Run SQL to Create Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/afmsegsxgvsqwdctasyl
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the content from `supabase-setup.sql`
5. Click "Run" to execute

This will create:
- `images` table (stores image metadata)
- `rankings` table (stores leaderboard scores)
- Necessary indexes and RLS policies

## Step 2: Configure Storage Bucket

The bucket `HackSense2025` is already created. Now make it public:

1. Go to "Storage" in the left sidebar
2. Click on the `HackSense2025` bucket
3. Click "Policies" tab
4. Create a new policy for SELECT:
   - Name: "Public read access"
   - Policy: `true` (allows all reads)
5. Create a new policy for INSERT:
   - Name: "Public upload access"
   - Policy: `true` (allows all uploads)
6. Create a new policy for DELETE:
   - Name: "Public delete access"
   - Policy: `true` (allows all deletes)

**Or use this SQL for storage policies:**

```sql
-- Make bucket public for reading
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'HackSense2025');

-- Allow public uploads
CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'HackSense2025');

-- Allow public deletes
CREATE POLICY "Public delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'HackSense2025');
```

## Step 3: Add Environment Variables to Vercel

1. Go to https://vercel.com/raphaelbgrs-projects/hack-sense-2025/settings/environment-variables
2. Add these two variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://afmsegsxgvsqwdctasyl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXNlZ3N4Z3ZzcXdkY3Rhc3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzE0NDcsImV4cCI6MjA3NDg0NzQ0N30.kBSJi74iiKWZIhDOa1nMTYyKqNJOzykMu9dE8GXNVY0`
3. Make sure they're available for all environments (Production, Preview, Development)
4. Redeploy the app

## Done!

Your app will now use Supabase for:
- ✅ Image storage (up to 1 GB free)
- ✅ Image metadata database
- ✅ Rankings/leaderboard storage
- ✅ No more filesystem issues on Vercel
