# 🚀 Deployment Security Guide

## 🔒 **Environment Variables Security Strategy**

### **Safe for Production (Can be in Vercel):**
These variables are **public by design** and safe to expose:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

**Why they're safe:**
- `VITE_SUPABASE_URL` - Public Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public API key (designed to be client-side)
- `VITE_RECAPTCHA_SITE_KEY` - Public reCAPTCHA key (designed to be client-side)

### **Development Only (NEVER in Vercel):**
These variables are **private** and should only be in GitHub Secrets:

```bash
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_ADMIN_PASSWORD=YourStrongPassword123!
VITE_ADMIN_NAME=Admin User
```

**Why they're private:**
- Admin login credentials
- Only work in development mode
- Completely disabled in production

---

## 🛡️ **Security Architecture**

### **Development Mode:**
```
✅ Admin login enabled (if credentials provided)
✅ Uses GitHub Secrets for admin credentials
✅ Full debugging and testing capabilities
```

### **Production Mode:**
```
❌ Admin login completely disabled
❌ No admin credentials accessible
✅ Only real Supabase users can log in
✅ Secure and production-ready
```

---

## 📋 **Deployment Options**

### **Option 1: Vercel (Recommended)**

#### **Step 1: Add Safe Variables to Vercel**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these **safe** variables:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

#### **Step 2: Keep Admin Variables in GitHub Only**
- **DO NOT** add admin variables to Vercel
- Keep them only in GitHub Secrets
- They will only work in development builds

#### **Step 3: Deploy**
```bash
git push origin main
```

### **Option 2: GitHub Actions + Vercel**

#### **Step 1: GitHub Actions Workflow**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_RECAPTCHA_SITE_KEY: ${{ secrets.VITE_RECAPTCHA_SITE_KEY }}
          VITE_ADMIN_EMAIL: ${{ secrets.VITE_ADMIN_EMAIL }}
          VITE_ADMIN_PASSWORD: ${{ secrets.VITE_ADMIN_PASSWORD }}
          VITE_ADMIN_NAME: ${{ secrets.VITE_ADMIN_NAME }}
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### **Step 2: All Variables in GitHub Secrets**
Keep ALL variables in GitHub Secrets (safer approach):

```bash
# Production variables
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RECAPTCHA_SITE_KEY

# Development variables (only work in dev)
VITE_ADMIN_EMAIL
VITE_ADMIN_PASSWORD
VITE_ADMIN_NAME

# Vercel deployment
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

---

## 🔧 **Testing Your Setup**

### **Local Development:**
```bash
# Create .env.local file
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_ADMIN_PASSWORD=YourStrongPassword123!
VITE_ADMIN_NAME=Admin User

# Run development server
npm run dev
```

### **Production Build Test:**
```bash
# Build without admin variables
npm run build

# Check that admin login is disabled
# Admin credentials should not work
```

---

## 🚨 **Security Checklist**

### **Before Deployment:**
- [ ] Admin variables are **NOT** in Vercel
- [ ] Admin variables are in GitHub Secrets
- [ ] Production variables are in Vercel (or GitHub Actions)
- [ ] reCAPTCHA is configured for production domain
- [ ] Supabase is configured for production

### **After Deployment:**
- [ ] Test that admin login **doesn't work** in production
- [ ] Test that regular user login works
- [ ] Verify reCAPTCHA is working
- [ ] Check that no sensitive data is exposed

---

## 🎯 **Recommended Approach**

### **For Maximum Security:**

1. **Use GitHub Actions for deployment**
2. **Keep ALL variables in GitHub Secrets**
3. **Never put admin variables in Vercel**
4. **Use environment-specific builds**

### **Benefits:**
- ✅ Complete control over environment variables
- ✅ No sensitive data in Vercel dashboard
- ✅ Admin login only works in development
- ✅ Production is completely secure

---

## 🔍 **Troubleshooting**

### **Admin Login Not Working:**
- Check that admin variables are set in GitHub Secrets
- Verify you're running in development mode
- Check browser console for environment configuration logs

### **Production Build Issues:**
- Ensure all required variables are available during build
- Check that admin variables are not required for production
- Verify environment validation is working

### **reCAPTCHA Issues:**
- Add your production domain to reCAPTCHA admin console
- Verify the site key is correct
- Check CSP headers allow reCAPTCHA

---

## 📞 **Support**

If you encounter issues:
1. Check the browser console for environment logs
2. Verify all required variables are set
3. Test in both development and production modes
4. Review the security configuration

---

*This setup ensures maximum security while maintaining development flexibility.* 