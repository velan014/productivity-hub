# VIVA & TECHNICAL INTERVIEW PREPARATION GUIDE
## Personal Productivity App (Productivity Hub)

---

### 1. Project Elevator Pitch (60-Second Summary)

> *"Productivity Hub is an integrated, full-stack personal productivity and study management platform engineered with React 18, TypeScript, Node.js Express, and MySQL. It consolidates daily task execution, academic study tracking, habit formation, deep work Pomodoro timers, and strategic goal planning into a single responsive interface. 
> 
> Key technical highlights include an offline-resilient Progressive Web App (PWA) powered by custom Service Worker caching, a deterministic backend gamification engine awarding mathematically bounded XP across 12 milestones, an AI productivity coach with human-in-the-loop task breakdown and offline heuristic fallbacks, and a sanitized JSON export/import subsystem. The application enforces strict multi-tenant data isolation at the database level and has achieved a 100% pass rate across 45 automated test suites."*

---

### 2. Core Architecture & Design Questions

#### Q1: What architectural pattern does the application follow?
**Answer**: It follows a **Three-Tier Client-Server Architecture**:
1. **Client Tier**: React 18 Single-Page Application (SPA) bundled with Vite, utilizing React Context for global state and Service Workers for offline caching.
2. **Application Tier**: Node.js and Express RESTful API following the **Controller-Service-Model (CSM)** design pattern with dedicated JWT authentication and Zod validation middleware.
3. **Database Tier**: MySQL 8.0 relational database with connection pooling and normalized tables.

#### Q2: Why did you choose React + Vite instead of Next.js or a traditional Multi-Page Application (MPA)?
**Answer**: 
- **Vite & React 18**: Provides instantaneous development server startup and lightning-fast Hot Module Replacement (HMR) via native ES modules.
- **Client-Side SPA**: Allows instantaneous tab switches between tasks, habits, calendar, and notes without full-page server round-trips, creating a native app feel.
- **PWA Synergy**: An SPA client bundle pairs naturally with Service Worker caching to load the entire application shell offline.

---

### 3. Database & Relational Modeling Questions

#### Q3: Why did you use MySQL instead of MongoDB or NoSQL?
**Answer**: 
Productivity data is inherently **highly structured and relational**. A task can belong to a project; a study session belongs to a subject; a focus session links to a task; and daily reflections are constrained to one per calendar day. MySQL provides:
1. **Relational Integrity**: Foreign key constraints with `ON DELETE CASCADE` ensure orphaned records are cleaned automatically.
2. **ACID Transactions**: Guarantees reliability during multi-table batch imports and XP recalculations.
3. **Normalized Efficiency**: Minimizes data redundancy and enforces unique constraints (`uk_habit_log_date`, `uk_user_achievement`).

#### Q4: Why use UUID v4 for primary keys instead of auto-incrementing integers?
**Answer**:
1. **Security / ID Enumeration Prevention**: Auto-incrementing IDs (e.g., `/api/tasks/1`, `/api/tasks/2`) make it easy for attackers to guess resource IDs or estimate user volume. UUIDs (`c4a8...`) are globally unique and unguessable.
2. **Data Portability & Merge Import**: Allows client-side ID generation and safe merge-importing of backup files across different database instances without primary key collision.

#### Q5: How do you enforce multi-tenant user isolation at the database level?
**Answer**:
Every protected database query enforces a parameterized `WHERE user_id = ?` condition where `user_id` is extracted directly from the verified cryptographic JWT token (`req.user.id`). If User B attempts to access `/api/tasks/<UserA_TaskId>`, the query finds 0 matching rows and returns `404 Not Found`.

---

### 4. Backend & Security Questions

#### Q6: How does authentication and session management work?
**Answer**:
1. **Registration**: The user submits email and password. The backend salts and hashes the password using **bcrypt** (cost factor 10) and stores the hash in MySQL.
2. **Login**: The backend compares the submitted password against the stored bcrypt hash using `bcrypt.compare()`.
3. **Token Issuance**: Upon successful authentication, the server signs a JSON Web Token (JWT) with HMAC-SHA256 containing `{ id: user.id, email: user.email }` and an expiration of 7 days.
4. **Token Verification**: The `authenticate` middleware inspects the `Authorization: Bearer <token>` header, verifies the signature using `JWT_SECRET`, and attaches `req.user` to the request pipeline.

#### Q7: How do you prevent SQL Injection?
**Answer**:
We utilize **parameterized queries with prepared statements** via `mysql2/promise`. Input values are passed as separate parameter arrays (`query('SELECT * FROM tasks WHERE user_id = ? AND id = ?', [userId, taskId])`). The SQL driver handles proper escaping at the protocol level, preventing malicious SQL injection payloads.

#### Q8: How does request validation work?
**Answer**:
We use **Zod** schema validation middleware. Every POST/PUT route defines an explicit schema with automatic trimming (`z.string().trim().min(1)`). If a payload fails schema constraints, the middleware intercepts the request before it reaches the controller and returns `400 Bad Request` with structured field-level error messages.

---

### 5. Progressive Web App (PWA) & Offline Questions

#### Q9: How does the Service Worker cache the application shell?
**Answer**:
1. **`install` event**: Pre-caches core entry resources (`/`, `/index.html`, `/manifest.webmanifest`, `/icon.svg`).
2. **`fetch` event**: Implements a **Network-First with Stale-Cache Fallback** strategy for static JS, CSS, and image assets.
3. **Navigation requests (`mode: 'navigate'`)**: If a network fetch fails while the user is offline, the Service Worker intercepts the request and serves the cached `/index.html` shell.

#### Q10: Why are `/api/*` endpoints explicitly excluded from Service Worker caching?
**Answer**:
**Security and Data Integrity**: Authenticated API responses contain private user data and JWT-scoped records. Caching API responses in unencrypted browser Cache Storage could expose stale or sensitive information across user logins. The Service Worker strictly bypasses `/api/*` requests, letting network calls fail gracefully when offline.

#### Q11: How does the frontend handle offline state without logging the user out?
**Answer**:
`AuthContext` inspects the error status code during initial session verification. It only logs out when the server explicitly returns `401 Unauthorized`. On network failures (`statusCode: 0`), it preserves the authenticated user profile in `localStorage`, allowing the offline React shell to render protected views.

---

### 6. AI & Gamification Questions

#### Q12: How does the AI Assistant work and what happens if no API key is provided?
**Answer**:
1. **Context Integration**: When a user asks for advice or task breakdown, the backend aggregates active tasks and study statistics to generate contextual guidance.
2. **Human-in-the-Loop Confirmation**: Suggested tasks are displayed in an **AI Action Confirmation Modal**, allowing the user to select, edit, and confirm tasks before anything is written to the database.
3. **Heuristic Fallback Engine**: If `AI_API_KEY` is not present, the system automatically falls back to an offline rule-based heuristic advisor that provides structured task breakdown roadmaps without throwing runtime errors.

#### Q13: Explain the deterministic XP calculation engine.
**Answer**:
XP is not arbitrarily assigned on the client side; it is derived from verified database activity:
- Task Completion: **+10 XP**
- Daily Habit Check-in: **+15 XP**
- Focus Session: **+1 XP per minute**
- Study Session: **+1 XP per minute**
- Evening Daily Review: **+20 XP**
- Morning Plan: **+15 XP**

**Level Formula**: $\text{Level} = \lfloor \frac{\text{XP}}{150} \rfloor + 1$.  
**Milestone Uniqueness**: Milestone awards are governed by the database constraint `UNIQUE KEY (user_id, achievement_id)`, preventing duplicate XP or badge exploits.

---

### 7. Backup & Data Portability Questions

#### Q14: How does the JSON Backup Export and Merge Import work?
**Answer**:
1. **Export**: Queries all 10 activity tables for the authenticated user and constructs a structured JSON archive. It strictly omits `password_hash`, salts, and session tokens.
2. **Merge Import**: Parses and validates the backup JSON against schema rules. It maps and inserts tasks, goals, habits, notes, and study sessions into the authenticated user's account without deleting or dropping existing records.

---

### 8. Live Demonstration Script (Step-by-Step for Evaluators)

1. **Step 1 — Login & Dashboard Metrics**:
   - Open `http://localhost:5173`. Log in with `velan@example.com` / `password123`.
   - Show the dynamic greeting, Level/XP banner, 7-day productivity charts, and morning priorities widget.

2. **Step 2 — Task Lifecycle & Instant Gamification**:
   - Navigate to `/app/tasks`. Create a task with high priority and due date.
   - Click the checkmark to mark it completed &rarr; Observe the **+10 XP** toast and immediate Level progress update.

3. **Step 3 — AI Goal Breakdown with Action Confirmation**:
   - Go to `/app/ai-assistant`. Click the suggested prompt *"Break down my project into sub-tasks"*.
   - Demonstrate the structured suggestions and click **Add Selected Tasks** to batch-insert them into the database.

4. **Step 4 — PWA Offline Resilience**:
   - Open Chrome DevTools (`F12`) &rarr; **Network** tab &rarr; select **Offline**.
   - Refresh the browser page (`F5`).
   - Demonstrate that the application shell loads immediately from the Service Worker cache and the amber banner appears: *"You are currently offline. Local cache is active; server actions will resume once reconnected."*
   - Uncheck **Offline** &rarr; Observe the banner auto-clearing.

5. **Step 5 — Sanitized Backup Export**:
   - Go to `/app/settings` &rarr; **Backup & Data** tab.
   - Click **Export Backup JSON** &rarr; Open the downloaded JSON file to demonstrate clean data formatting with zero exposed password hashes or secrets.
