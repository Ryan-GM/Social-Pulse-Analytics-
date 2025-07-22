# 🚀 QUICK SETUP - Manual Database Creation

Since there are network connectivity issues with direct database connections from this environment, here's the manual setup process:

## Step 1: Create Database Schema

1. **Go to your Supabase Dashboard**: https://jfiyzbyjfjvnzwmkaamo.supabase.co
2. **Navigate to**: Database → SQL Editor
3. **Click**: "New Query"
4. **Copy and paste this SQL** (run it all at once):

```sql
-- Social Media Analytics Dashboard - Database Schema

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    supabase_user_id TEXT UNIQUE,
    report_frequency TEXT DEFAULT 'weekly',
    report_format TEXT DEFAULT 'pdf',
    report_email TEXT,
    auto_sync_interval INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform TEXT NOT NULL,
    account_id TEXT NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create platform_metrics table
CREATE TABLE IF NOT EXISTS platform_metrics (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES social_accounts(id),
    platform TEXT NOT NULL,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES social_accounts(id),
    platform TEXT NOT NULL,
    post_id TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0,
    posted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    data JSONB,
    date_range JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_account_id ON platform_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_account_id ON posts(account_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at 
    BEFORE UPDATE ON social_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

5. **Click "Run"** to execute

## Step 2: Set Up Authentication (Optional but Recommended)

1. **Go to**: Authentication → Settings
2. **Set Site URL**: `http://localhost:5173`
3. **Add Redirect URL**: `http://localhost:5173`

## Step 3: Test Your Setup

```bash
# Test the connection (should now work!)
npm run test:supabase

# Start the application
npm run dev
```

## Step 4: Create Your First Account

1. **Visit**: http://localhost:5173
2. **Click**: "Sign Up" tab
3. **Create your account** with:
   - Username
   - Email
   - Password

## ✅ What You'll Have

After completing these steps:
- 🔐 Full authentication system
- 📊 Protected dashboard with your social media analytics
- 🔒 Secure, user-specific data
- 📱 Beautiful, responsive UI

## 🎯 Ready to Go!

Your Social Media Analytics Dashboard with Supabase is ready! The system now has:
- ✅ User authentication
- ✅ Secure database
- ✅ Protected API routes
- ✅ All your existing features

**Next**: Connect your social media accounts and start tracking your analytics!
