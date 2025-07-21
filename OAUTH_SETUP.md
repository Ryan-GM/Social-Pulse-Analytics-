# OAuth Setup Guide for Social Pulse Analytics

This guide will walk you through setting up OAuth credentials for all supported social media platforms to enable account connections in Social Pulse Analytics.

## Prerequisites

1. Copy `.env.example` to `.env` and fill in your OAuth credentials
2. Ensure your application is accessible via HTTPS in production
3. Have developer accounts for each platform you want to support

## Platform Setup Instructions

### 1. Instagram Basic Display API

1. **Create a Facebook Developer Account**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app and select "Consumer" as the app type

2. **Configure Instagram Basic Display**
   - In your app dashboard, add "Instagram Basic Display" product
   - Go to Instagram Basic Display > Basic Display
   - Add your OAuth Redirect URI: `https://your-domain.com/api/oauth/instagram/callback`

3. **Get Credentials**
   - Instagram App ID → `INSTAGRAM_CLIENT_ID`
   - Instagram App Secret → `INSTAGRAM_CLIENT_SECRET`

4. **Required Scopes**
   - `user_profile` - Access to user's profile info
   - `user_media` - Access to user's media

### 2. Twitter API v2

1. **Create a Twitter Developer Account**
   - Apply at [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new project and app

2. **Configure OAuth 2.0**
   - In your app settings, enable OAuth 2.0
   - Set callback URL: `https://your-domain.com/api/oauth/twitter/callback`
   - Enable "Request email from users"

3. **Get Credentials**
   - Client ID → `TWITTER_CLIENT_ID`
   - Client Secret → `TWITTER_CLIENT_SECRET`

4. **Required Scopes**
   - `tweet.read` - Read tweets
   - `users.read` - Read user profiles
   - `offline.access` - Refresh tokens

### 3. Facebook Graph API

1. **Use the same Facebook Developer app** from Instagram setup

2. **Configure Facebook Login**
   - Add "Facebook Login" product to your app
   - In Facebook Login settings, add redirect URI: `https://your-domain.com/api/oauth/facebook/callback`

3. **Get Credentials**
   - App ID → `FACEBOOK_CLIENT_ID`
   - App Secret → `FACEBOOK_CLIENT_SECRET`

4. **Required Permissions**
   - `pages_read_engagement` - Read page engagement metrics
   - `pages_read_user_content` - Read page content

### 4. TikTok for Developers

1. **Create TikTok Developer Account**
   - Register at [TikTok for Developers](https://developers.tiktok.com/)
   - Create a new app

2. **Configure OAuth**
   - Add redirect URI: `https://your-domain.com/api/oauth/tiktok/callback`
   - Request necessary scopes

3. **Get Credentials**
   - Client Key → `TIKTOK_CLIENT_ID`
   - Client Secret → `TIKTOK_CLIENT_SECRET`

4. **Required Scopes**
   - `user.info.basic` - Basic user information
   - `video.list` - Access to user's videos

### 5. YouTube Data API (Google)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable YouTube Data API**
   - In APIs & Services, enable "YouTube Data API v3"

3. **Configure OAuth 2.0**
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-domain.com/api/oauth/youtube/callback`

4. **Get Credentials**
   - Client ID → `YOUTUBE_CLIENT_ID`
   - Client Secret → `YOUTUBE_CLIENT_SECRET`

5. **Required Scopes**
   - `https://www.googleapis.com/auth/youtube.readonly` - Read-only access to YouTube

## Environment Configuration

Create a `.env` file with your credentials:

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Base URL (use HTTPS in production)
BASE_URL=https://your-domain.com

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# TikTok OAuth
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# YouTube OAuth
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret

# Session Secret
SESSION_SECRET=your_random_session_secret_here
```

## Testing OAuth Connections

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Navigate to Settings**
   - Go to `http://localhost:5000/settings`
   - Click on "Connect New Account"

3. **Test each platform**
   - Click on a platform to start OAuth flow
   - Complete authorization on the platform
   - Verify successful connection in the dashboard

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" errors**
   - Ensure redirect URIs in platform settings match exactly
   - Use HTTPS in production
   - Check for trailing slashes

2. **"Missing client credentials" errors**
   - Verify environment variables are set correctly
   - Restart the application after changing .env

3. **"Token exchange failed" errors**
   - Check client secret is correct
   - Verify platform-specific requirements (scopes, etc.)
   - Check application is approved/published if required

4. **"Token expired" errors**
   - Use the refresh token functionality
   - Reconnect accounts if refresh fails

### Platform-Specific Notes

- **Instagram**: Requires Facebook app review for production use
- **Twitter**: Has rate limits on API calls
- **Facebook**: May require business verification for certain permissions
- **TikTok**: Has strict approval process for production apps
- **YouTube**: Requires OAuth consent screen configuration

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different credentials for development/production
   - Rotate secrets regularly

2. **Token Storage**
   - Tokens are encrypted in the database
   - Implement proper access controls
   - Monitor for suspicious activity

3. **HTTPS**
   - Always use HTTPS in production
   - Ensure SSL certificates are valid
   - Use secure headers

## Rate Limits and Quotas

Each platform has different rate limits:

- **Instagram**: 200 requests per hour per user
- **Twitter**: 300 requests per 15-minute window
- **Facebook**: Varies by endpoint, typically 200/hour
- **TikTok**: 1000 requests per day
- **YouTube**: 10,000 quota units per day

Monitor your usage and implement appropriate caching and retry logic.

## Support

If you encounter issues:

1. Check the application logs for detailed error messages
2. Verify your OAuth app configurations on each platform
3. Test with a minimal example to isolate issues
4. Check platform-specific documentation for updates

## Next Steps

After setting up OAuth:

1. Test all platform connections
2. Configure automatic token refresh
3. Set up monitoring for failed connections
4. Implement data sync scheduling
5. Add analytics and reporting features