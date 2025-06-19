# 🚀 Quick Start: Deploy to verifyflow.com

## **Option 1: Vercel (Recommended - 5 minutes)**

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Complete account setup

### Step 2: Deploy Your App
1. In Vercel dashboard, click "New Project"
2. Import your GitHub repository
3. Set these environment variables:
   ```
   VITE_SUPABASE_URL = https://spjkuuxxzlgljjtihwot.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwamt1dXh4emxnbGpqdGlod290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQ4MzEsImV4cCI6MjA1ODg1MDgzMX0.wLgy-0mZ0TdsfYBNRMEEJnxEm88gfOvzAGTSBcSGJKw
   ```
4. Click "Deploy"

### Step 3: Connect Your Domain
1. Go to Project Settings → Domains
2. Add `verifyflow.com` and `www.verifyflow.com`
3. Update your DNS settings (see below)

## **Option 2: Netlify (Alternative)**

### Step 1: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Step 2: Connect Domain
1. Go to Site Settings → Domain Management
2. Add custom domain: `verifyflow.com`
3. Update DNS settings

## **DNS Configuration**

### For Vercel:
Add these records to your domain provider:

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

## **Real-Time Updates Setup**

### Automatic Deployment (GitHub Actions)
1. Push your code to GitHub:
   ```bash
   git push origin main
   ```

2. Set up GitHub Secrets:
   - Go to your repo → Settings → Secrets
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

3. Every push will auto-deploy! 🎉

### Manual Deployment
```bash
# Quick deployment script
./scripts/quick-deploy.sh

# Or build and deploy manually
npm run build
# Then upload dist/ folder to your server
```

## **Development Workflow**

### Local Development
```bash
npm run dev
# App runs at http://localhost:8080
```

### Production Updates
```bash
# Make changes locally
# Test with: npm run dev

# Deploy to production
git add .
git commit -m "Update feature"
git push origin main
# Automatic deployment happens! 🚀
```

## **Troubleshooting**

### Build Issues
```bash
npm install
npm run build
```

### Domain Issues
- Wait 24-48 hours for DNS propagation
- Check SSL certificate status
- Verify DNS records are correct

### Environment Variables
- Ensure they start with `VITE_`
- Check deployment platform settings
- Restart deployment after adding variables

## **Success! 🎉**

Your app will be live at:
- **Production:** https://verifyflow.com
- **Development:** http://localhost:8080

### Real-Time Features:
- ✅ Code changes → Auto-deploy
- ✅ Database changes → Real-time updates
- ✅ User interactions → Live dashboard

## **Next Steps**

1. **Test your deployment** - Visit verifyflow.com
2. **Set up monitoring** - Check Vercel/Netlify analytics
3. **Configure backups** - Set up database backups
4. **Add custom features** - Extend functionality as needed

## **Support**

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs 