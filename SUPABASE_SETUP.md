# Supabase Integration Setup Guide

This guide will help you migrate from the current Neon Database setup to a full Supabase integration with authentication, database, and real-time features.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your existing project code

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "social-media-analytics")
5. Enter a database password (save this securely!)
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to Settings > API
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon key** (public key for client-side use)
   - **Service role key** (secret key for server-side use - keep secure!)

3. Go to Settings > Database
4. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres`

## Step 3: Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# Client-side Supabase Configuration (for Vite)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Client URL for password reset redirects
CLIENT_URL=http://localhost:5173

# Your existing OAuth and other configurations...
```

## Step 4: Run Database Migration

1. Open the Supabase SQL Editor (Database > SQL Editor)
2. Run the migration script from `migrations/0001_add_supabase_user_id.sql`:

```sql
-- Add supabase_user_id column to users table
ALTER TABLE users 
ADD COLUMN supabase_user_id TEXT UNIQUE;

-- Remove password column since Supabase handles authentication
ALTER TABLE users 
DROP COLUMN IF EXISTS password;

-- Create index on supabase_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON users(supabase_user_id);

-- Create triggers for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at 
    BEFORE UPDATE ON social_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

3. Alternatively, you can use Drizzle to push the schema:
```bash
npm run db:push
```

## Step 5: Set Up Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173` and your production URL
   - Enable email confirmations if desired
   - Configure email templates if needed

3. Optionally enable social providers (Google, GitHub, etc.) in Authentication > Providers

## Step 6: Install Dependencies

The necessary dependencies have already been installed:
- `@supabase/supabase-js`
- `@supabase/ssr`
- `postgres` (for Drizzle)

## Step 7: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:5173`
3. You should see the authentication page
4. Try creating a new account
5. Check your Supabase dashboard to see the new user in Authentication > Users

## Step 8: Configure Real-time (Optional)

If you want real-time features:

1. Go to Database > Replication in Supabase
2. Enable replication for the tables you want to sync in real-time
3. Use the Supabase client to subscribe to changes:

```typescript
// Example: Listen to changes in social_accounts table
supabase
  .channel('social_accounts_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'social_accounts' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

## Step 9: Production Deployment

1. Update your environment variables with production Supabase credentials
2. Update the Site URL and Redirect URLs in Supabase Authentication settings
3. Consider setting up Row Level Security (RLS) policies for enhanced security

## Row Level Security (RLS) Setup

Add these policies in the Supabase SQL Editor for better security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = supabase_user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = supabase_user_id);

-- Social accounts policies
CREATE POLICY "Users can view own social accounts" ON social_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = social_accounts.user_id 
      AND users.supabase_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own social accounts" ON social_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = social_accounts.user_id 
      AND users.supabase_user_id = auth.uid()::text
    )
  );

-- Similar policies for other tables...
```

## Features Now Available

✅ **Authentication**
- Email/password sign up and sign in
- Password reset via email
- Session management
- Protected routes

✅ **Database**
- PostgreSQL with Drizzle ORM
- Automatic migrations
- Connection pooling

✅ **Real-time** (optional)
- Live updates
- Presence features
- Broadcast messaging

✅ **Storage** (ready to use)
- File uploads
- Image optimization
- CDN delivery

## API Changes

All API endpoints now require authentication. Include the Bearer token in requests:

```typescript
const response = await fetch('/api/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
  },
});
```

The `apiClient` helper in `client/src/lib/supabase.ts` automatically handles this.

## Troubleshooting

1. **"Missing Supabase environment variables"**: Make sure your `.env` file has the correct variables
2. **"Authentication failed"**: Check that your Supabase anon key is correct
3. **Database connection issues**: Verify your database URL and password
4. **CORS issues**: Make sure your site URL is configured in Supabase settings

## Next Steps

- Set up email templates in Supabase
- Configure social authentication providers
- Implement real-time features
- Set up proper RLS policies
- Add file upload capabilities using Supabase Storage
