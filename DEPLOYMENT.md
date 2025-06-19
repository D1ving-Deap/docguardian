# 🚀 VerifyFlow Deployment Guide

This guide will help you deploy your DocGuardian application to `verifyflow.com` with real-time updates.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- Domain: `verifyflow.com` (you already have this)
- Vercel account (free tier available)

## 🎯 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Step 1: Set up Vercel
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

#### Step 2: Deploy to Vercel
```bash
# Navigate to your project directory
cd /Users/jack0518/Desktop/Verify\ Flow/docguardian

# Deploy using the script
./scripts/deploy.sh

# Or deploy manually
vercel --prod
```

#### Step 3: Connect Custom Domain
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Domains
4. Add `verifyflow.com` and `www.verifyflow.com`
5. Update your DNS settings (see DNS Configuration below)

### Option 2: Netlify

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Deploy
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

#### Step 1: Update package.json
```json
{
  "homepage": "https://verifyflow.com",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### Step 2: Deploy
```bash
npm install --save-dev gh-pages
npm run deploy
```

## 🔧 DNS Configuration

### For Vercel:
Add these DNS records to your domain provider:

```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For Netlify:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

## 🔄 Real-Time Updates Setup

### GitHub Actions (Automatic Deployment)

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. **Set up GitHub Secrets:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN` (from Vercel dashboard)
     - `VERCEL_ORG_ID` (from Vercel dashboard)
     - `VERCEL_PROJECT_ID` (from Vercel dashboard)
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Automatic deployment:**
   - Every push to `main` branch will trigger deployment
   - Pull requests will create preview deployments

### Manual Deployment

```bash
# Quick deployment
./scripts/deploy.sh

# Or step by step
npm run build
vercel --prod
```

## 🌐 Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=https://spjkuuxxzlgljjtihwot.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwamt1dXh4emxnbGpqdGlod290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQ4MzEsImV4cCI6MjA1ODg1MDgzMX0.wLgy-0mZ0TdsfYBNRMEEJnxEm88gfOvzAGTSBcSGJKw
```

## 📱 Development Workflow

### Local Development
```bash
npm run dev
# App runs at http://localhost:8080
```

### Production Deployment
```bash
# Automatic (via GitHub Actions)
git push origin main

# Manual
./scripts/deploy.sh
```

## 🔍 Troubleshooting

### Common Issues:

1. **Build fails:**
   ```bash
   npm install
   npm run build
   ```

2. **Domain not working:**
   - Check DNS settings
   - Wait 24-48 hours for DNS propagation
   - Verify SSL certificate

3. **Environment variables not working:**
   - Check Vercel/Netlify environment variables
   - Ensure variables start with `VITE_`

### Performance Optimization:

1. **Enable caching:**
   - Static assets are automatically cached
   - API responses cached for 1 hour

2. **CDN:**
   - Vercel/Netlify provide global CDN
   - Images served from edge locations

## 🎉 Success!

Once deployed, your app will be available at:
- **Production:** https://verifyflow.com
- **Development:** http://localhost:8080

### Real-Time Updates:
- ✅ Code changes → GitHub → Automatic deployment
- ✅ Database changes → Supabase → Real-time updates
- ✅ User interactions → Real-time dashboard updates

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables
3. Check deployment logs in Vercel/Netlify dashboard
4. Ensure Supabase is properly configured 