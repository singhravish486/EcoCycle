# 🚀 Eco Cycle - Vercel Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Your environment variables ready

---

## 🔑 Environment Variables Needed

You'll need these API keys for Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Where to find them:**
- **Supabase**: Project Settings → API
- **Google Maps**: Google Cloud Console → Credentials
- **Gemini**: Google AI Studio → API Keys

---

## 📦 Step 1: Push to GitHub

```bash
# Navigate to project
cd c:\Users\Ravish Singh\ECOF\eco\eco-cycle

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Eco Cycle app"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/eco-cycle.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click:** "Add New" → "Project"
4. **Import** your `eco-cycle` repository
5. **Configure:**
   - Framework Preset: **Next.js** ✅ (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add each variable from the list above
   - Make sure to add them for **Production**, **Preview**, and **Development**
7. **Click:** "Deploy"

### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? eco-cycle
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

---

## ✅ Step 3: Verify Deployment

After deployment, Vercel will give you a URL like:
```
https://eco-cycle.vercel.app
```

### **Test Checklist:**

- [ ] Website loads
- [ ] Can create account
- [ ] Can login
- [ ] Map displays
- [ ] Camera works (QR scanner)
- [ ] Geolocation works
- [ ] Chatbot works
- [ ] Can earn R coins
- [ ] Can redeem rewards

---

## 🔄 Auto-Deploy on Push

After initial setup, every push to `main` branch automatically deploys:

```bash
# Make changes
git add .
git commit -m "Updated feature"
git push

# Vercel automatically deploys! 🎉
```

---

## 🐛 Troubleshooting

### **Build fails:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Make sure all dependencies are in `package.json`

### **Camera doesn't work:**
- Verify you're using HTTPS URL (Vercel provides this automatically)
- Check browser permissions
- Try different browser

### **Map doesn't load:**
- Verify Google Maps API key is correct
- Check if Maps JavaScript API is enabled in Google Cloud
- Verify API key restrictions allow your Vercel domain

### **Database errors:**
- Verify Supabase URL and key are correct
- Check if RLS policies are set up
- Verify tables exist in Supabase

---

## 📱 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

---

## 🎯 Post-Deployment

### **Update Google Maps API Key:**
Add your Vercel domain to allowed referrers:
```
https://eco-cycle.vercel.app/*
https://your-custom-domain.com/*
```

### **Update Supabase Settings:**
Add your Vercel URL to allowed redirect URLs in Supabase:
```
https://eco-cycle.vercel.app/**
```

---

## 📊 Monitor Your App

- **Analytics:** Vercel Dashboard → Analytics
- **Logs:** Vercel Dashboard → Deployments → View Logs
- **Performance:** Vercel Dashboard → Speed Insights

---

## 🎉 Success!

Your Eco Cycle app is now live with:
- ✅ HTTPS enabled
- ✅ Camera working
- ✅ Geolocation working
- ✅ Auto-deploy on push
- ✅ Global CDN
- ✅ Automatic SSL

**Share your app:** `https://eco-cycle.vercel.app`

---

## 💡 Pro Tips

1. **Use Preview Deployments:** Every PR gets its own URL
2. **Environment Variables:** Use different values for production/preview
3. **Analytics:** Enable Vercel Analytics for insights
4. **Monitoring:** Set up Vercel Monitoring for uptime alerts
5. **Caching:** Vercel automatically caches static assets

---

**Need help?** Check Vercel docs: https://vercel.com/docs
