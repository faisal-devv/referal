# Server Deployment Fix Guide

## What Was Wrong

Your deployment was failing because:
1. You deployed only the `server` folder as root
2. The original `vercel.json` tried to use `index.js` which has Socket.IO (not supported in serverless)
3. The individual serverless functions in `/api/` were incomplete

## What I Fixed

1. **Created `/server/api/index.js`** - A serverless-compatible Express app wrapper
2. **Updated `/server/vercel.json`** - Now routes all requests through the single serverless function
3. This approach allows all your existing routes to work without rewriting them

## How to Redeploy (Server Only)

Since you've already deployed the server folder separately:

### Option 1: Via Vercel Dashboard

1. Go to your Vercel project
2. Go to **Settings** → **Git**
3. Under **Root Directory**, ensure it's set to `server`
4. Click **Save**
5. Go to **Deployments**
6. Click **Redeploy** (with "Use existing Build Cache" UNCHECKED)

### Option 2: Push to GitHub

Simply commit and push the changes:

```bash
git add server/vercel.json server/api/index.js
git commit -m "Fix Vercel serverless deployment"
git push origin main
```

Vercel will auto-deploy.

## Environment Variables Required

Make sure these are set in Vercel:

1. **MONGODB_URI** - Your MongoDB Atlas connection string
2. **JWT_SECRET** - Secret key for JWT tokens
3. **CLIENT_URL** - Your frontend URL (or `*` for testing)
4. **NODE_ENV** - Set to `production`

### How to Set Environment Variables

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable
4. Select: Production, Preview, Development
5. **IMPORTANT**: Redeploy after adding variables

## Testing After Deployment

1. **Health Check**:
   ```
   https://your-backend-url.vercel.app/api/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

2. **Test Auth**:
   ```bash
   curl -X POST https://your-backend-url.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123"}'
   ```

## Important Notes

### ⚠️ Socket.IO Won't Work
Your real-time chat feature uses Socket.IO which **doesn't work on Vercel serverless**.

**Solutions:**
- **Option A**: Deploy chat features to Railway/Render/Heroku
- **Option B**: Use polling instead of WebSockets
- **Option C**: Use Pusher/Ably for real-time features

### What Routes Are Supported

All your existing routes now work:
- `/api/auth/*` - Login, register, me
- `/api/leads/*` - All lead operations
- `/api/wallet/*` - Wallet and withdrawals
- `/api/chat/*` - Chat (but real-time won't work)
- `/api/users/*` - User management
- `/api/admin/*` - Admin operations

## Troubleshooting

### Still Getting 500 Error?

1. **Check Vercel Logs**:
   - Go to Deployments → (latest) → Functions
   - Click on `/api/index` to see logs
   - Look for error messages

2. **Common Issues**:
   - Missing environment variables (especially `MONGODB_URI`)
   - MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
   - Wrong MongoDB connection string

### Module Not Found Error?

Make sure all dependencies are in `server/package.json`:
```bash
cd server
npm install
```

Then commit and push `package-lock.json`.

### Database Connection Timeout?

1. Check MongoDB Atlas:
   - Network Access → Add IP: `0.0.0.0/0`
   - Database Access → Ensure user has read/write permissions
2. Verify `MONGODB_URI` is correct in Vercel environment variables

## Next Steps

1. ✅ Commit the changes
2. ✅ Push to GitHub (or redeploy in Vercel dashboard)
3. ✅ Add environment variables in Vercel
4. ✅ Test the `/api/health` endpoint
5. ✅ Update your client's `REACT_APP_API_URL` to point to this backend URL
6. ⚠️ Plan for Socket.IO replacement (for real-time chat)
