# 🚀 Quick Database Setup

## Step 1: Run the Schema in Supabase

1. Go to your Supabase dashboard: https://jfiyzbyjfjvnzwmkaamo.supabase.co
2. Navigate to **Database** → **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **"Run"** to execute the schema

## Step 2: Get Your Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jfiyzbyjfjvnzwmkaamo.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Update the `SUPABASE_DATABASE_URL` in your `.env` file

## Step 3: Test the Connection

Run this command to test everything is working:

```bash
npm run test:supabase
```

You should see:
```
✅ Database connection successful
✅ Auth connection successful
🎉 Supabase is properly configured!
```

## Step 4: Start the Application

```bash
npm run dev
```

Then visit: http://localhost:5173

You should see the authentication page where you can create your first account!

## 🔐 Authentication Setup (Optional)

If you want to customize authentication:

1. Go to **Authentication** → **Settings** in Supabase
2. Set **Site URL** to: `http://localhost:5173`
3. Add **Redirect URLs**: `http://localhost:5173`
4. Configure email templates if desired

## 🎯 What's Next?

Once your database is set up:
- Create your first user account through the UI
- Connect your social media accounts
- Start tracking your analytics!

The system now has:
- ✅ User authentication with Supabase Auth
- ✅ Secure database with Row Level Security
- ✅ All your existing features (dashboard, reports, etc.)
- ✅ Protected API routes
- ✅ Real-time capabilities (ready to use)
