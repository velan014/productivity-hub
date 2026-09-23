# PRODUCTION DEPLOYMENT GUIDE
## Personal Productivity App (Productivity Hub)

---

### 1. Deployment Architecture

The **Productivity Hub** is architected as a modern, decoupled three-tier cloud application designed for high availability, low latency, and zero-maintenance scaling.

```mermaid
graph TB
    subgraph Users ["End Users"]
        Browser["Desktop & Mobile Browsers (HTTPS / PWA)"]
    end

    subgraph EdgeTier ["Tier 1: Global Edge CDN / Static Hosting"]
        direction TB
        Vercel["Frontend Static Host (Vercel / Netlify / Render Static)"]
        SPA["React 18 SPA (Vite Production Bundle)"]
        PWAAssets["PWA Manifest & Service Worker (sw.js)"]
        Vercel --> SPA
        Vercel --> PWAAssets
    end

    subgraph ComputeTier ["Tier 2: Backend Container / Web Service"]
        direction TB
        RailwayApp["Backend API Service (Railway / Render Web Service)"]
        ExpressApp["Node.js + Express REST API (Port Assigned by Cloud)"]
        JWTMw["JWT Authentication & Validation Layer"]
        AIEngine["AI Service (Google Gemini / OpenAI Client)"]
        RailwayApp --> ExpressApp
        ExpressApp --> JWTMw
        ExpressApp --> AIEngine
    end

    subgraph DataTier ["Tier 3: Managed Cloud Database"]
        MySQLCloud[("Cloud MySQL 8.0+ (Railway MySQL / Aiven / AWS RDS)")]
    end

    Browser -->|HTTPS Request for HTML/JS/Assets| Vercel
    Browser -->|REST API Calls with JWT Bearer Token| RailwayApp
    ExpressApp -->|Connection Pool (TCP / SSL)| MySQLCloud
    AIEngine -->|HTTPS Outbound API Calls| GeminiAPI["Google Generative AI / OpenAI API"]
```

#### Architecture Breakdown:
- **Frontend Tier**: React 18 SPA compiled with Vite into optimized static assets (`.html`, `.js`, `.css`, `.svg`, `.webmanifest`). Served globally via static edge CDN with automatic HTTPS and SPA routing fallback.
- **Backend API Tier**: Node.js + Express REST API compiled with TypeScript. Runs in an isolated Linux container with automatic health monitoring, dynamic port assignment, and TLS termination.
- **Database Tier**: Managed MySQL 8.0+ relational database with automated backups, connection pooling, and UTF-8 multibyte (`utf8mb4`) encoding.

---

### 2. GitHub & Repository Preparation

Before pushing the codebase to GitHub or triggering automated cloud CI/CD pipelines, configure git ignore rules to ensure sensitive credentials and ephemeral files are never committed.

#### 2.1 Essential Root `.gitignore`
Create a `.gitignore` file in the workspace root:

```gitignore
# Dependencies
node_modules/
*/node_modules/

# Production Build Outputs
dist/
*/dist/
build/
*/build/

# Environment Variables & Secrets (CRITICAL)
.env
.env.local
.env.*.local
*.env
backend/.env
frontend/.env

# Logs and runtime data
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE and OS files
.vscode/
.idea/
.DS_Store
Thumbs.db

# System Generated / Artifacts
.system_generated/
```

#### 2.2 Git Initialization and Push Steps
```bash
# Initialize git repository
git init
git branch -M main

# Verify no .env or node_modules are tracked
git status

# Stage all project files
git add .

# Create initial commit
git commit -m "feat: complete production-ready Productivity Hub application"

# Add remote and push
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

### 3. Database Deployment

You can provision a managed MySQL database using **Railway**, **Render**, **Aiven**, or **AWS RDS**. Below is the recommended setup using Railway:

#### 3.1 Provisioning MySQL on Railway
1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** → Select **Provision MySQL**.
3. Once provisioned, click on the **MySQL** card and navigate to the **Variables** / **Connect** tab.
4. Record the following connection parameters:
   - `DB_HOST`: Hostname (e.g., `mysql.railway.internal` for private or `junction.proxy.rlwy.net` for public)
   - `DB_PORT`: Port number (e.g., `3306` or custom proxy port like `42183`)
   - `DB_NAME`: Database name (e.g., `railway` or `productivity_app`)
   - `DB_USER`: User (e.g., `root`)
   - `DB_PASSWORD`: Generated strong password
   - Or standard connection string: `MYSQL_URL`

---

### 4. Database Initialization

Execute the schema migration against the newly provisioned cloud database.

#### 4.1 Schema Deployment via MySQL CLI or GUI
You can execute `database/schema.sql` directly using any MySQL client (e.g., MySQL Workbench, TablePlus, DBeaver, or the Railway Database Query console):

```bash
# Via Command Line (replace with your cloud credentials)
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> < database/schema.sql
```

> [!IMPORTANT]
> When executing on cloud databases where a default database name is already selected (such as `railway`), ensure that you do not drop the database. `database/schema.sql` uses `CREATE TABLE IF NOT EXISTS` for all 14 tables, ensuring zero downtime and idempotent creation.

#### 4.2 Tables Initialized in Production
| Table Name | Purpose | Key Constraints |
| :--- | :--- | :--- |
| `users` | User credentials, profiles, auth data | `PRIMARY KEY (id)`, `UNIQUE KEY (email)` |
| `tasks` | Daily tasks, status, priorities, categories | `FK -> users(id) ON DELETE CASCADE` |
| `goals` | Long-term goals, targets, progress | `FK -> users(id) ON DELETE CASCADE` |
| `habits` | Habit definitions, frequency, color | `FK -> users(id) ON DELETE CASCADE` |
| `habit_logs` | Daily habit completion logs | `FK -> habits(id)`, `UNIQUE(habit_id, log_date)` |
| `focus_sessions`| Pomodoro / Deep Work tracking | `FK -> users(id)`, `FK -> tasks(id) ON DELETE SET NULL` |
| `notes` | Pinned & categorized rich text notes | `FK -> users(id) ON DELETE CASCADE` |
| `projects` | Multi-task high-level projects | `FK -> users(id) ON DELETE CASCADE` |
| `subjects` | Academic subjects & study targets | `FK -> users(id) ON DELETE CASCADE` |
| `study_sessions`| Subject-linked study records | `FK -> subjects(id) ON DELETE CASCADE` |
| `daily_reviews` | Evening reflection, learning, mood | `FK -> users(id)`, `UNIQUE(user_id, review_date)` |
| `morning_plans` | Daily Top 3 priorities & intentions | `FK -> users(id)`, `UNIQUE(user_id, plan_date)` |
| `user_gamification`| Total XP, Level, streaks, counters | `PRIMARY KEY (user_id)`, `FK -> users(id)` |
| `achievements` | Badges and milestone definitions | `PRIMARY KEY (id)`, `UNIQUE KEY (code)` |
| `user_achievements`| User earned badges timestamp | `FK -> users(id)`, `FK -> achievements(id)` |
| `notification_preferences`| In-app notification settings | `PRIMARY KEY (user_id)`, `FK -> users(id)` |

---

### 5. Backend Deployment (Node.js + Express)

Deploy the backend to a modern cloud container platform such as **Railway** or **Render**.

#### 5.1 Railway Backend Deployment Steps
1. In your Railway project, click **New** → **GitHub Repo** → select your repository.
2. In the service **Settings**:
   - **Root Directory**: Set to `/backend`.
   - **Build Command**: `npm run build` (runs TypeScript compiler `tsc`).
   - **Start Command**: `npm start` (runs `node dist/server.js`).
   - **Healthcheck Path**: `/api/health`
3. In the **Variables** tab, set all required backend environment variables (see Section 7).
4. In the **Settings** → **Networking** section, click **Generate Domain** (e.g., `https://productivity-backend.up.railway.app`).

#### 5.2 Render Backend Deployment Steps (Alternative)
1. In Render Dashboard, click **New Web Service** → Connect your GitHub repo.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables in Render's **Environment** tab.

---

### 6. Frontend Deployment (React + Vite SPA)

Deploy the frontend to a static edge platform such as **Vercel**, **Netlify**, or **Render Static Site**.

#### 6.1 Vercel Frontend Deployment Steps
1. Log in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or `tsc && vite build`)
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://productivity-backend.up.railway.app/api` (the URL of your deployed backend + `/api`).
5. Deploy.

#### 6.2 SPA Routing Rewrite Configuration
Single Page Applications (SPAs) require routing rewrite rules so that direct navigation or refreshing a deep route (e.g., `/app/dashboard`, `/app/tasks`, `/app/daily-review`) serves `/index.html` instead of returning a 404 error.

- **For Vercel**: Ensure a `vercel.json` exists in `frontend/` (or root):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- **For Netlify**: Add a `_redirects` file in `frontend/public/_redirects`:
```text
/*    /index.html   200
```

---

### 7. Environment Variables Reference

Configure environment variables in their respective platform dashboards.

#### 7.1 Backend Environment Variables (Railway / Render)
| Variable Name | Required | Example Production Value | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production mode optimizations and secure error handling |
| `PORT` | Auto | `5000` | Port provided automatically by cloud platform |
| `DB_HOST` | **Yes** | `junction.proxy.rlwy.net` | Hostname of the cloud MySQL instance |
| `DB_PORT` | **Yes** | `3306` | Port of the cloud MySQL instance |
| `DB_NAME` | **Yes** | `productivity_app` | MySQL Database Name |
| `DB_USER` | **Yes** | `root` | Database username |
| `DB_PASSWORD` | **Yes** | *(Secret)* | Strong database password |
| `JWT_SECRET` | **Yes** | *(Secret 64-char hex)* | Cryptographic signature key for authentication tokens |
| `JWT_EXPIRES_IN`| No | `7d` | JWT session lifetime (defaults to 7 days) |
| `FRONTEND_URL` | **Yes** | `https://productivity-hub.vercel.app` | Exact production frontend URL for CORS access |
| `AI_API_KEY` | Optional| `AIzaSy...` or `sk-...` | Google Gemini or OpenAI API Key for AI features |
| `AI_MODEL` | Optional| `gemini-1.5-flash` | LLM model name (`gemini-1.5-flash` or `gpt-4o-mini`) |

#### 7.2 Frontend Environment Variables (Vercel / Netlify)
| Variable Name | Required | Example Production Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `https://productivity-backend.up.railway.app/api` | Base URL of deployed backend REST API |

> [!TIP]
> Generate a strong, cryptographically random JWT secret using your terminal:
> ```bash
> openssl rand -hex 32
> ```

---

### 8. CORS Configuration

Cross-Origin Resource Sharing (CORS) allows your Vercel-hosted frontend to communicate with your Railway-hosted backend securely.

#### 8.1 How CORS Operates in Productivity Hub
1. The browser sends a preflight `OPTIONS` request or `GET`/`POST`/`PUT`/`DELETE` request with an `Origin` header (e.g., `Origin: https://productivity-hub.vercel.app`).
2. The backend Express CORS middleware compares the incoming `Origin` against the `FRONTEND_URL` environment variable.
3. If matching (or in development mode), it responds with:
   - `Access-Control-Allow-Origin: https://productivity-hub.vercel.app`
   - `Access-Control-Allow-Credentials: true`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`

#### 8.2 Troubleshooting CORS Issues
- **Symptom**: `Blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`.
- **Fix**: Check that `FRONTEND_URL` in your backend environment variables exactly matches the frontend domain (including `https://` and without a trailing slash, e.g. `https://productivity-hub.vercel.app`).

---

### 9. AI Configuration & Fallback Verification

The AI subsystem supports Google Gemini and OpenAI with 100% graceful fallback.

#### 9.1 Supported Providers
- **Google Gemini (Default)**: Provide `AI_API_KEY` with your Google AI Studio key. Model defaults to `gemini-1.5-flash`.
- **OpenAI**: Provide `OPENAI_API_KEY`. Model defaults to `gpt-4o-mini`.

#### 9.2 Fallback Behavior When AI Key is Missing
- The backend checks `AiService.isConfigured()`.
- If no key is set:
  - The server boots cleanly without errors.
  - Chat endpoint (`POST /api/ai/chat`) returns: *"AI Assistant is not configured yet. To enable intelligent suggestions and planning, set AI_API_KEY in your backend .env file."*
  - Task breakdown endpoint (`POST /api/ai/breakdown`) returns: *"AI Assistant is not configured yet. Please configure AI_API_KEY to generate automated task breakdowns."*
  - Morning plan and daily review endpoints gracefully return structured default plans.

---

### 10. Progressive Web App (PWA) Verification

The application is fully PWA-ready and configured for production HTTPS hosting.

#### 10.1 PWA Checklist:
1. **Manifest File** (`/manifest.webmanifest`):
   - Scope: `/`
   - Start URL: `/`
   - Display: `standalone`
   - Theme Color: `#6366f1` (Indigo)
   - Background Color: `#0f172a` (Slate 900)
   - Icons: Scalable vector icon (`/icon.svg`) with `any maskable` purpose.
2. **Service Worker** (`/sw.js`):
   - Cache shell version: `productivity-hub-shell-v3`.
   - Pre-caches core app shell (`/`, `/index.html`, `/manifest.webmanifest`, `/icon.svg`).
   - Dynamic cache for CSS, JS chunks, and Google Fonts.
   - **Private API Exclusion**: All `/api/*` endpoints strictly bypass caching to guarantee real-time data integrity and user privacy.
   - Offline Navigation Fallback: Intercepts network failure and serves cached `/index.html`.
3. **HTTPS Requirement**: Modern browsers only activate Service Workers over secure HTTPS connections, which Vercel/Netlify/Render provide automatically.

---

### 11. Post-Deployment Production Verification

Execute this step-by-step smoke test checklist immediately following deployment:

- [ ] **1. Health Check**: Visit `https://<backend-domain>/api/health` → Should return `{"status":"ok","timestamp":"..."}` with HTTP 200.
- [ ] **2. Frontend Initial Load**: Open `https://<frontend-domain>` → App shell renders smoothly without console errors.
- [ ] **3. User Registration**: Create a new account at `/register` → Expect automatic redirect to `/app/dashboard` and JWT storage.
- [ ] **4. Task Management**: Create, edit, and mark a task as completed at `/app/tasks`.
- [ ] **5. Gamification Check**: Verify that completing a task increments XP and updates the streak banner.
- [ ] **6. Focus Timer**: Start and complete a 1-minute Pomodoro session at `/app/focus`.
- [ ] **7. Academic & Project Modules**: Create a Subject and Project, verify relational links.
- [ ] **8. AI Assistant Test**: Open the AI Assistant modal; test prompt generation or verify fallback message.
- [ ] **9. Data Backup**: Navigate to Settings → Backup & Export → Download JSON data backup.
- [ ] **10. SPA Direct Route Refresh**: Navigate to `/app/daily-review` and hit browser refresh (F5) → Verify page reloads cleanly without 404 error.
- [ ] **11. PWA Installability**: Check browser address bar for "Install Productivity Hub" icon.

---

### 12. Common Deployment Errors & Solutions

| Error | Root Cause | Resolution |
| :--- | :--- | :--- |
| `CORS Error: No 'Access-Control-Allow-Origin'` | Backend `FRONTEND_URL` does not match frontend origin. | Set `FRONTEND_URL=https://<your-frontend-domain>` in backend environment variables. |
| `404 Not Found on Page Refresh` | Static host routing missing SPA rewrite rule. | Add `vercel.json` (Vercel) or `_redirects` (Netlify) to redirect all paths to `/index.html`. |
| `Failed to connect to MySQL database: ECONNREFUSED` | `DB_HOST` or `DB_PORT` incorrect or database offline. | Verify MySQL instance is running and copy exact host/port from cloud database panel. |
| `ER_ACCESS_DENIED_ERROR` | Incorrect `DB_USER` or `DB_PASSWORD`. | Reset password in cloud database panel and update backend environment variables. |
| `NetworkError when attempting to fetch resource` | Frontend `VITE_API_URL` missing or pointing to localhost. | Set `VITE_API_URL=https://<backend-domain>/api` in frontend build settings and trigger redeploy. |
| `JsonWebTokenError: invalid signature` | `JWT_SECRET` changed while tokens are active. | Log out and log back in to obtain a freshly signed token. |

---

### 13. Rollback & Disaster Recovery Procedures

#### 13.1 Instant Application Rollback
- **Frontend (Vercel / Netlify)**: Navigate to **Deployments** tab → Find previous stable deployment → Click **Promote to Production** (instant 0-second rollback).
- **Backend (Railway / Render)**: Navigate to **Deployments** tab → Click **Rollback** to previous working commit.

#### 13.2 Database Backup & Recovery
1. **Automated Cloud Snapshots**: Railway and AWS RDS create automatic daily snapshots with Point-in-Time Recovery.
2. **Manual MySQL Dump**:
   ```bash
   # Create snapshot
   mysqldump -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> > backup_$(date +%F).sql

   # Restore snapshot
   mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> < backup_2026-09-23.sql
   ```
3. **Application JSON Backup**: Users can export their full dataset via Settings → Export Data at any time for local JSON restoration.
