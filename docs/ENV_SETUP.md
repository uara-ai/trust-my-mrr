# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"

# Stripe API Key (Restricted key with read permissions)
# Create at: https://dashboard.stripe.com/apikeys/create
STRIPE_SECRET_KEY="rk_live_..."

# X/Twitter API Bearer Token
# Get from: https://developer.twitter.com/en/portal/dashboard
X_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## How to Get Each Key

### 1. Database URLs (PostgreSQL)

**Option A: Vercel Postgres**

1. Go to your Vercel project
2. Storage → Create Database → Postgres
3. Copy `DATABASE_URL` and `DIRECT_URL`

**Option B: Supabase**

1. Create project at supabase.com
2. Project Settings → Database
3. Connection string → URI (for DATABASE_URL)
4. Direct connection → URI (for DIRECT_URL)

**Option C: Railway**

1. Create project at railway.app
2. Add PostgreSQL database
3. Variables tab → Copy connection strings

### 2. Stripe API Key

1. Go to https://dashboard.stripe.com/apikeys/create
2. Name: `TrustMyMRR`
3. Select **Restricted Key**
4. Add these permissions:
   - ✅ Charges: Read
   - ✅ Subscriptions: Read
   - ✅ Accounts: Read
   - ✅ Files: Read
5. Click "Create key"
6. Copy the `rk_live_...` key

**Quick Link with Pre-selected Permissions:**

```
https://dashboard.stripe.com/apikeys/create?name=TrustMyMRR&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_subscription_read&permissions%5B%5D=rak_bucket_connect_read&permissions%5B%5D=rak_file_read
```

### 3. X/Twitter Bearer Token

#### Step 1: Create X Developer Account

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in with your X/Twitter account
3. Complete the developer application (5 minutes)

#### Step 2: Create Project & App

1. Dashboard → Create Project
2. Name: `TrustMyMRR`
3. Use Case: Select appropriate option
4. Create App

#### Step 3: Get Bearer Token

1. Go to your app settings
2. Keys and tokens tab
3. Bearer Token → Generate
4. Copy the `AAAAAAAAAAAAAAAAAAAAAxxxxx...` token
5. **Save it** (you can't see it again!)

#### Access Level Required

- **Essential** (Free Tier) - 500k requests/month ✅
- No credit card required
- Enough for this application

## Verification

After setting up your `.env.local` file, verify everything works:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Start development server
npm run dev
# or
bun dev

# 4. Visit http://localhost:3000
```

## Security Notes

⚠️ **NEVER commit your `.env.local` file to git!**

The `.gitignore` file should include:

```gitignore
.env*.local
.env
```

✅ **For production (Vercel/Netlify):**

- Add environment variables in project settings
- Never paste them in code or public repos

## Testing X API Integration

Test if your X Bearer Token works:

```bash
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  "https://api.twitter.com/2/users/by/username/elonmusk?user.fields=profile_image_url,name"
```

Expected response:

```json
{
  "data": {
    "id": "...",
    "name": "Elon Musk",
    "username": "elonmusk",
    "profile_image_url": "https://pbs.twimg.com/..."
  }
}
```

## Common Issues

### "X_BEARER_TOKEN is not set"

- Make sure `.env.local` exists in project root
- Restart your dev server after adding variables

### Database connection errors

- Check `DATABASE_URL` format is correct
- Verify database is accessible
- Try using `DIRECT_URL` if connection pooling fails

### Stripe API errors

- Verify you're using a **restricted** key (starts with `rk_`)
- Check all required permissions are granted
- Test key hasn't expired

### X API rate limits

- Essential tier: 500k requests/month
- Database storage reduces API calls
- Monitor usage in X Developer Portal

## Production Deployment

### Vercel

1. Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Select environments: Production, Preview, Development
4. Redeploy

### Netlify

1. Site Settings → Build & Deploy → Environment
2. Add each variable
3. Trigger new deploy

### Railway/Render

1. Project → Variables
2. Add all environment variables
3. Redeploy

---

**All set!** 🎉 Your environment is now configured for full functionality.
