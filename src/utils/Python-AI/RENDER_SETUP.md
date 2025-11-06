# Render Deployment Setup

## ✅ Your Deployment URLs

- **Python AI Service**: https://guestgo-ai.onrender.com/
- **Frontend**: https://guest-go.vercel.app/

## 🔧 Required Vercel Environment Variable

Add this to your Vercel project settings:

**Variable Name**: `VITE_PYTHON_API_URL`  
**Value**: `https://guestgo-ai.onrender.com`

### How to Add:

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - Key: `VITE_PYTHON_API_URL`
   - Value: `https://guestgo-ai.onrender.com`
   - Environment: Production, Preview, Development (select all)
4. **Redeploy** your Vercel app

## ✅ Render Environment Variables

Make sure these are set in Render dashboard:

- `FRONTEND_URL` = `https://guest-go.vercel.app`
- `FLASK_DEBUG` = `false`
- `PORT` = (auto-set by Render)

## 🧪 Test Connection

1. Test Python service: https://guestgo-ai.onrender.com/status
2. Test from frontend: Open browser console on https://guest-go.vercel.app
3. Check for API connection logs

## 📝 Files Used by Render

- `Procfile` - Start command
- `requirements.txt` - Dependencies
- `runtime.txt` - Python version
- `app.py` - Main application
- `render.yaml` - Optional config (can also set in dashboard)

