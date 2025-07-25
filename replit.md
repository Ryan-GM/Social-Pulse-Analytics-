# Social Media Analytics Dashboard

## Overview

This is a full-stack social media analytics dashboard built with React, Express, and TypeScript. The application provides comprehensive analytics for Instagram, Twitter/X, TikTok, and Facebook, allowing users to track followers, engagement rates, impressions, and post performance across multiple platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Pattern**: RESTful API with JSON responses

### Development Setup
- **Build Tool**: Vite for frontend bundling and development server
- **Backend Build**: esbuild for server-side bundling
- **Development**: Hot reloading with Vite middleware integration

## Key Components

### Database Schema
- **Users**: Basic user authentication and profile management
- **Social Accounts**: Platform-specific account connections (Instagram, Twitter, TikTok, Facebook)
- **Platform Metrics**: Time-series data for followers, engagement, impressions, and reach
- **Posts**: Individual post performance tracking with engagement metrics
- **Reports**: Generated analytics reports with custom date ranges

### API Endpoints
- `/api/dashboard/overview` - Aggregated metrics across all platforms
- `/api/dashboard/follower-growth` - Time-series follower data
- `/api/dashboard/platform-distribution` - Platform-wise breakdown
- `/api/dashboard/top-posts` - Best performing posts
- `/api/reports/generate` - Custom report generation
- `/api/reports/:id/export` - Export reports in PDF, CSV, or JSON format
- `/api/social-accounts` - Manage social media account connections
- `/api/oauth/:platform` - OAuth authorization for social media platforms
- `/api/oauth/:platform/callback` - OAuth callback handling with proper error management
- `/api/social-accounts/:id/refresh-token` - Manual token refresh for expired accounts
- `/api/user/settings` - User settings and preferences management

### UI Components
- **Dashboard Overview**: Real-time metrics cards with trend indicators
- **Follower Growth Chart**: Line chart showing growth over time
- **Platform Breakdown**: Pie chart for platform distribution
- **Top Performing Posts**: List view with engagement metrics
- **Recent Activity**: Timeline of system events and milestones

## Data Flow

1. **Data Collection**: Social media APIs feed data into the platform metrics and posts tables
2. **Data Processing**: Backend aggregates and calculates derived metrics (engagement rates, growth trends)
3. **API Layer**: Express routes serve processed data to the frontend
4. **Frontend Rendering**: React components consume API data via TanStack Query
5. **Real-time Updates**: Queries refetch data periodically for live dashboard updates

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Built-in connection management

### Social Media APIs
- Instagram Basic Display API
- Twitter API v2
- TikTok for Developers API
- Facebook Graph API

### UI & Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Chart and graph visualization

### Report Generation
- **PDF Export**: Text-based PDF reports with comprehensive analytics
- **CSV Export**: Structured data export for spreadsheet analysis
- **JSON Export**: Raw data export for custom processing

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code for Node.js runtime
- Database: Drizzle migrations handle schema updates

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment-specific configuration
- `BASE_URL`: Application base URL for OAuth callbacks
- `INSTAGRAM_CLIENT_ID` & `INSTAGRAM_CLIENT_SECRET`: Instagram Basic Display API credentials
- `TWITTER_CLIENT_ID` & `TWITTER_CLIENT_SECRET`: Twitter API v2 OAuth credentials
- `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET`: Facebook Graph API credentials
- `TIKTOK_CLIENT_ID` & `TIKTOK_CLIENT_SECRET`: TikTok for Developers API credentials
- `YOUTUBE_CLIENT_ID` & `YOUTUBE_CLIENT_SECRET`: Google/YouTube Data API credentials
- `SESSION_SECRET`: Random string for session encryption

### OAuth Integration

The application includes a complete OAuth implementation for connecting social media accounts:

#### ✅ Fixed OAuth Issues
- **Real Token Exchange**: Replaced demo implementation with actual OAuth token exchange
- **Proper Error Handling**: Clear error messages and feedback for failed connections
- **Token Validation**: Validates tokens before API calls and handles expired tokens
- **Automatic Token Refresh**: Attempts to refresh expired tokens using refresh tokens
- **Secure Token Storage**: Tokens are securely stored with expiration tracking

#### Supported Platforms
- **Instagram**: Basic Display API with user profile and media access
- **Twitter/X**: API v2 with tweet reading and user profile access
- **Facebook**: Graph API with page engagement and content access
- **TikTok**: For Developers API with user info and video list access
- **YouTube**: Data API v3 with read-only channel access

#### Setup Instructions
1. Copy `.env.example` to `.env`
2. Follow the detailed setup guide in `OAUTH_SETUP.md`
3. Configure OAuth apps for each platform you want to support
4. Add your client credentials to the `.env` file

#### OAuth Flow
1. User clicks "Connect Account" for a platform
2. Redirects to platform's OAuth authorization page
3. User grants permissions and returns to callback URL
4. Application exchanges authorization code for access tokens
5. Retrieves user info and stores account with tokens
6. Provides success/error feedback to user

### Hosting Considerations
- Frontend: Static file serving through Express
- Backend: Single Node.js process serving both API and static files
- Database: Serverless PostgreSQL (Neon) for scalability
- Session storage: PostgreSQL-backed sessions for persistence

The application uses a monorepo structure with shared TypeScript types and database schema, enabling full-stack type safety and code reuse between frontend and backend components.