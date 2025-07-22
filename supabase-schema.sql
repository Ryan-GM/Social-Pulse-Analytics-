-- Social Media Analytics Dashboard - Database Schema
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

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
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at 
    BEFORE UPDATE ON social_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = supabase_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = supabase_user_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = supabase_user_id);

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

-- Platform metrics policies
CREATE POLICY "Users can view own platform metrics" ON platform_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_accounts sa
            JOIN users u ON u.id = sa.user_id
            WHERE sa.id = platform_metrics.account_id 
            AND u.supabase_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own platform metrics" ON platform_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM social_accounts sa
            JOIN users u ON u.id = sa.user_id
            WHERE sa.id = platform_metrics.account_id 
            AND u.supabase_user_id = auth.uid()::text
        )
    );

-- Posts policies
CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_accounts sa
            JOIN users u ON u.id = sa.user_id
            WHERE sa.id = posts.account_id 
            AND u.supabase_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own posts" ON posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM social_accounts sa
            JOIN users u ON u.id = sa.user_id
            WHERE sa.id = posts.account_id 
            AND u.supabase_user_id = auth.uid()::text
        )
    );

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = reports.user_id 
            AND users.supabase_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = reports.user_id 
            AND users.supabase_user_id = auth.uid()::text
        )
    );
