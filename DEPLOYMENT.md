#  Deployment Guide: Frontend on Vercel & Backend on Render

This guide walks you through deploying **Mystry Message** to production using **Render** for the FastAPI backend and **Vercel** for the React SPA frontend.

---

##  Prerequisites Checklist

Before deploying, ensure you have:
1. A [GitHub](https://github.com/) repository with this codebase pushed.
2. A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for cloud MongoDB).
3. A free [Upstash Redis](https://upstash.com/) or Render Redis account (for cloud Redis).
4. A free [Clerk](https://clerk.com/) account (for authentication).
5. A free [Render](https://render.com/) account.
6. A free [Vercel](https://vercel.com/) account.

---

##  Step 1: Cloud Databases & Services Setup

### 1. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a **Free Shared Cluster (M0)**.
2. Under **Database Access**, create a user (e.g., `mystry_user`) with a strong password.
3. Under **Network Access**, click **Add IP Address** → choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
4. Click **Connect** → **Drivers** → Copy your connection URI:
   ```
   mongodb+srv://mystry_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Upstash Redis (Rate Limiting)
1. Go to [Upstash](https://upstash.com/) and create a free **Serverless Redis Database**.
2. Under **Connect Details**, copy the **`REDIS_URL`** (format: `rediss://default:password@xxx.upstash.io:6379`).

### 3. Clerk Authentication
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
2. Under **API Keys**, copy:
   - **Publishable Key**: `pk_test_...` or `pk_live_...`
   - **Secret Key**: `sk_test_...` or `sk_live_...`
3. Under **JWT Templates** / **API Keys** → **Show PEM public key**:
   - Copy the public key (starts with `-----BEGIN PUBLIC KEY-----` and ends with `-----END PUBLIC KEY-----`).

---

##  Step 2: Deploy Backend to Render

### Option A: Using Render Blueprint (Fastest)
1. In your Render dashboard, click **New +** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect the included `render.yaml`.
4. Fill in the environment variables when prompted and click **Apply**.

### Option B: Manual Web Service Setup
1. In your Render dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `mystry-backend`
   - **Region**: Nearest to your users (e.g., `Singapore`, `Oregon`, `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Expand **Advanced** → Click **Add Environment Variable**:

| Key | Value | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.12.8` | Recommended Python version |
| `ENVIRONMENT` | `production` | Production mode |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `MONGODB_DATABASE` | `mystry_message` | Database name |
| `REDIS_URL` | `rediss://...` | Upstash Redis URL |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk Secret Key |
| `CLERK_JWT_PUBLIC_KEY` | `"-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"` | Clerk Public Key PEM |
| `CORS_ORIGINS` | `https://*.vercel.app,http://localhost:3000` | Will update with your exact Vercel domain |
| `CLERK_AUTHORIZED_PARTIES` | `https://*.vercel.app` | Allowed auth origin |

5. Click **Deploy Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://mystry-backend.onrender.com`).
7. Test the healthcheck in your browser:
   `https://mystry-backend.onrender.com/api/v1/health` → Should return `{"success": true, ...}`.

---

##  Step 3: Deploy Frontend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`
4. Expand **Environment Variables** and add:

| Key | Value | Example |
|---|---|---|
| `VITE_API_BASE_URL` | `https://<your-render-app>.onrender.com/api/v1` | `https://mystry-backend.onrender.com/api/v1` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Your Clerk Publishable Key |

5. Click **Deploy**.
6. Vercel will build and deploy the app in ~30 seconds and assign a domain (e.g., `https://mystry-message.vercel.app`).
*(Note: `frontend/vercel.json` is already configured with SPA rewrites so direct navigation and refreshes will work seamlessly without 404 errors).*

---

##  Step 4: Final Link & Whitelist

Once Vercel gives you your production URL (e.g., `https://mystry-message.vercel.app`):

1. **Update Backend CORS on Render**:
   - In your Render Web Service dashboard → **Environment**:
   - Update `CORS_ORIGINS` to:
     ```
     https://mystry-message.vercel.app,http://localhost:3000
     ```
   - Update `CLERK_AUTHORIZED_PARTIES` to:
     ```
     https://mystry-message.vercel.app
     ```
   - Render will automatically restart the service with the new origins.

2. **Update Clerk Dashboard Allowed Origins**:
   - In [Clerk Dashboard](https://dashboard.clerk.com/) → **Configure** → **Paths / Domains**:
   - Add your Vercel domain (`https://mystry-message.vercel.app`) to your allowed domains and redirect URLs.

---

## ⏰ Step 5: Keep Render Server Warm (Prevent Cold Starts)

Render free instances spin down after **15 minutes** of inactivity, taking up to 50 seconds to wake up on the next request.

To eliminate cold starts, we've included an automated GitHub Action cron job at [`.github/workflows/keep_warm.yml`](.github/workflows/keep_warm.yml):

### Setup GitHub Actions Pinger:
1. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**:
   - **Name**: `RENDER_BACKEND_URL`
   - **Value**: `https://your-backend.onrender.com` (e.g. `https://mystry-backend.onrender.com`)
3. The included workflow runs on a schedule (`*/14 * * * *`) to automatically ping `/api/v1/health` and keep the instance warm.
   - *Note*: If you prefer a 12-hour schedule instead, simply edit the cron expression in [`.github/workflows/keep_warm.yml`](.github/workflows/keep_warm.yml) to `0 */12 * * *`.

### Alternative: Free External Cron (e.g., cron-job.org)
If you prefer not using GitHub Actions:
1. Sign up at [cron-job.org](https://cron-job.org/) (100% free).
2. Create a new cron job:
   - **URL**: `https://your-backend.onrender.com/api/v1/health`
   - **Schedule**: Every 14 minutes (or every 12 hours)
   - **Method**: GET

---

##  Verification Checklist

- [ ] Visit `https://your-frontend.vercel.app/`
- [ ] Sign in with Clerk
- [ ] Edit your Profile handle and avatar
- [ ] Copy your public profile link and open it in an Incognito window
- [ ] Send an anonymous question using prompt shuffle
- [ ] Check your Inbox on the owner account: open the conversation and reply
- [ ] Click **Share Q&A** → download a Story PNG card!
- [ ] Verify keep-alive ping runs in GitHub Actions or cron-job.org
