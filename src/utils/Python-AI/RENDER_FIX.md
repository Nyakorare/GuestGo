# Render Deployment Fix

## Issue
Render is trying to run `gunicorn your_application.wsgi` (Django default) instead of our Flask app.

## Solution: Check Render Dashboard Settings

### 1. Verify Root Directory
In Render Dashboard → Your Service → Settings:
- **Root Directory** must be: `src/utils/Python-AI`
- This tells Render where your Python files are

### 2. Verify Build & Start Commands
In Render Dashboard → Your Service → Settings:

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

### 3. Alternative: Use the Start Script
If the above doesn't work, use the start script:

**Start Command:**
```
bash start.sh
```

### 4. Verify Environment Variables
Make sure these are set:
- `FRONTEND_URL` = `https://guest-go.vercel.app`
- `FLASK_DEBUG` = `false`
- `PORT` = (auto-set, don't change)

## Quick Fix Steps

1. Go to Render Dashboard
2. Click on your service
3. Go to **Settings**
4. Scroll to **Build & Deploy**
5. Set **Root Directory**: `src/utils/Python-AI`
6. Set **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
7. Click **Save Changes**
8. **Manual Deploy** → **Deploy latest commit**

## Verify

After deployment, check:
- https://guestgo-ai.onrender.com/status
- Should return JSON with `status: "running"`

