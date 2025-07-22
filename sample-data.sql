-- Sample Data for Testing
-- Run this AFTER you've created your first user account through the UI

-- Note: Replace 'your-supabase-user-id' with the actual UUID from your auth.users table
-- You can find this in Authentication > Users in your Supabase dashboard

-- Insert sample user (this will be created automatically when you register)
-- INSERT INTO users (username, email, supabase_user_id) 
-- VALUES ('demo_user', 'demo@example.com', 'your-supabase-user-id');

-- Sample social accounts (uncomment and modify after creating your user)
/*
INSERT INTO social_accounts (user_id, platform, account_id, username, is_active) VALUES
(1, 'instagram', 'demo_instagram', '@demo_instagram', true),
(1, 'twitter', 'demo_twitter', '@demo_twitter', true),
(1, 'tiktok', 'demo_tiktok', '@demo_tiktok', true);

-- Sample platform metrics
INSERT INTO platform_metrics (account_id, platform, followers, following, engagement_rate, impressions, reach) VALUES
(1, 'instagram', 5420, 1200, 3.2, 45000, 38000),
(1, 'instagram', 5450, 1205, 3.4, 47000, 39500),
(2, 'twitter', 2100, 800, 2.8, 25000, 22000),
(2, 'twitter', 2120, 805, 2.9, 26000, 23000),
(3, 'tiktok', 8900, 500, 5.1, 120000, 95000),
(3, 'tiktok', 8950, 502, 5.3, 125000, 98000);

-- Sample posts
INSERT INTO posts (account_id, platform, post_id, content, likes, comments, shares, views, engagement_rate) VALUES
(1, 'instagram', 'ig_001', 'Check out our latest product launch! 🚀', 245, 18, 12, 3400, 8.1),
(1, 'instagram', 'ig_002', 'Behind the scenes content ��', 189, 23, 8, 2800, 7.9),
(2, 'twitter', 'tw_001', 'Excited to share our quarterly results!', 89, 12, 15, 1200, 9.7),
(2, 'twitter', 'tw_002', 'Thanks for all the support! 💙', 156, 8, 22, 1800, 10.3),
(3, 'tiktok', 'tt_001', 'Viral dance trend! 💃', 1200, 89, 156, 15000, 9.6),
(3, 'tiktok', 'tt_002', 'Educational content about our industry', 890, 67, 123, 12000, 9.0);

-- Sample reports
INSERT INTO reports (user_id, report_type, title, data) VALUES
(1, 'weekly', 'Weekly Performance Report', '{"total_followers": 16470, "engagement_rate": 3.8, "top_platform": "tiktok"}'),
(1, 'monthly', 'Monthly Growth Analysis', '{"follower_growth": 245, "engagement_trend": "increasing", "best_performing_post": "tt_001"}');
*/
