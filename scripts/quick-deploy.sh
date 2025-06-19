#!/bin/bash

echo "🚀 VerifyFlow Quick Deployment"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

echo "🌐 Choose your deployment method:"
echo "1. Vercel (Recommended - Free, Easy)"
echo "2. Netlify (Free, Good)"
echo "3. GitHub Pages (Free, Basic)"
echo "4. Manual upload to web server"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        echo "Please follow these steps:"
        echo "1. Go to https://vercel.com and sign up/login"
        echo "2. Click 'New Project'"
        echo "3. Import your GitHub repository"
        echo "4. Set environment variables:"
        echo "   - VITE_SUPABASE_URL: https://spjkuuxxzlgljjtihwot.supabase.co"
        echo "   - VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwamt1dXh4emxnbGpqdGlod290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQ4MzEsImV4cCI6MjA1ODg1MDgzMX0.wLgy-0mZ0TdsfYBNRMEEJnxEm88gfOvzAGTSBcSGJKw"
        echo "5. Deploy!"
        echo ""
        echo "After deployment, connect your domain verifyflow.com in Vercel settings."
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=dist
        else
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
            netlify deploy --prod --dir=dist
        fi
        ;;
    3)
        echo "🚀 Deploying to GitHub Pages..."
        echo "Please follow these steps:"
        echo "1. Push your code to GitHub"
        echo "2. Go to repository Settings → Pages"
        echo "3. Set source to 'GitHub Actions'"
        echo "4. The GitHub Actions workflow will deploy automatically"
        ;;
    4)
        echo "📁 Manual deployment"
        echo "Your built files are in the 'dist' folder."
        echo "Upload these files to your web server."
        echo ""
        echo "For verifyflow.com, you'll need to:"
        echo "1. Upload dist/* to your web server"
        echo "2. Configure your web server to serve index.html for all routes"
        echo "3. Set up SSL certificate"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment instructions completed!"
echo "Check DEPLOYMENT.md for detailed instructions." 