# Vercel Deployment Guide

This guide will help you deploy your referral application (monorepo with client and server) to Vercel.

## Prerequisites

- GitHub repository connected to Vercel
- MongoDB Atlas account (for production database)
- Vercel account

## Project Structure

```
refferal/
├── client/          # React frontend
├── server/          # Express backend (serverless functions)
└── vercel.json      # Vercel configuration
```

## Step 1: Configure Environment Variables in Vercel

You need to set up the following environment variables in your Vercel project settings:

### Navigate to: Project Settings → Environment Variables

Add these variables:

#### Server Variables (Required)

1. **MONGODB_URI**
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/referral-hub`
   - Used in: Production, Preview, Development

2. **JWT_SECRET**
   - Value: A strong random string (generate one)
   - Example: Use `openssl rand -base64 32` to generate
   - Used in: Production, Preview, Development

3. **CLIENT_URL**
   - Value: Your Vercel deployment URL
   - For Production: `https://your-app.vercel.app`
   - For Preview: `https://your-app-*.vercel.app` (or leave as wildcard)
   - Used in: Production, Preview

4. **NODE_ENV**
   - Value: `production`
   - Used in: Production only

#### Client Variables (Required)

1. **REACT_APP_API_URL**
   - Value: `/api` (relative path, works with Vercel routing)
   - Alternative: `https://your-app.vercel.app/api`
   - Used in: Production, Preview, Development

## Step 2: Update Client Package.json

Your client needs a build script for Vercel. Add this to `client/package.json`:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "vercel-build": "react-scripts build"
}
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to your Vercel dashboard
2. Select your connected GitHub repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install` (or leave default)

4. Add all environment variables (from Step 1)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time) or Yes (subsequent)
# - What's your project's name? referral-app
# - In which directory is your code located? ./

# For production deployment
vercel --prod
```

## Step 4: Post-Deployment Verification

After deployment, verify:

1. **Health Check**: Visit `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Frontend**: Visit `https://your-app.vercel.app`
   - Should load your React application

3. **API Endpoints**: Test authentication
   - `POST https://your-app.vercel.app/api/auth/register`
   - `POST https://your-app.vercel.app/api/auth/login`

## Important Notes

### Socket.IO Limitations
⚠️ **Warning**: Vercel serverless functions have limitations with WebSockets/Socket.IO:
- Socket.IO will NOT work on Vercel serverless functions
- Real-time chat features will need to be:
  - Moved to a separate WebSocket server (Railway, Render, or Heroku)
  - Or replaced with polling/REST endpoints
  - Or use Vercel Edge Functions (beta)

### CORS Configuration
The `CLIENT_URL` environment variable is used for CORS. Make sure to update it after deployment.

### Database
Make sure your MongoDB Atlas cluster:
- Allows connections from anywhere (0.0.0.0/0) for Vercel
- Or add Vercel's IP ranges to the whitelist

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### API Endpoints Return 404
- Check `vercel.json` routes configuration
- Ensure API files are in `server/api/` directory
- Check Vercel function logs

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for the correct environment (Production/Preview)

### Database Connection Fails
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

## Update CLIENT_URL After First Deployment

After your first deployment, update the `CLIENT_URL` environment variable:

1. Copy your Vercel deployment URL
2. Go to Project Settings → Environment Variables
3. Update `CLIENT_URL` to your actual URL
4. Redeploy the project

## Monitoring

- View logs: Vercel Dashboard → Your Project → Deployments → (select deployment) → Functions
- Monitor performance: Vercel Dashboard → Analytics
- Set up alerts: Vercel Dashboard → Settings → Notifications
