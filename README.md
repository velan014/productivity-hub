# 🚀 Personal Productivity App

A clean, modern, and scalable full-stack Personal Productivity App built with **React, TypeScript, Tailwind CSS, Express, and MySQL**.

Phase 1 provides the foundational architecture including JWT authentication, responsive layout with mobile bottom navigation, dynamic live dashboard, comprehensive task management, user profile customization, settings, and light/dark theme support.

---

## 🌟 Features in Phase 1

* **🔐 Authentication System**:
  * User Registration & Login with bcrypt password hashing
  * JWT session tokens with automatic expiry handling and protected routes
  * Current user profile endpoint (`/api/auth/me`)

* **📱 Responsive & Mobile-First Design**:
  * Desktop collapsible sidebar navigation with active items and "Coming Soon" future modules
  * Mobile fixed bottom navigation bar with comfortable $\ge 44\text{px}$ touch targets
  * Floating central quick task creation button on mobile
  * Fully responsive modals that transform into mobile bottom sheets
  * Tested and optimized for viewports: `390px`, `393px`, `412px`, `430px` (zero horizontal scroll)

* **📊 Live Dynamic Dashboard**:
  * Personalized greeting using authenticated user's name
  * **Today's Progress Card** with real-time calculated completion percentage
  * **🔥 Top Priority Task** banner highlighting the most critical pending task
  * **Today's Tasks List** with instant checkbox completion
  * **Upcoming Tasks** grouped by schedule
  * **Quick Actions** with active task creation and disabled future module placeholders

* **✅ Task Management**:
  * Multi-criteria filtering: Tabs (`All`, `Today`, `Upcoming`, `Overdue`, `Completed`), Priority (`High`, `Medium`, `Low`), Category, and Status
  * Instant real-time search by task title, description, and category
  * Multi-field sorting (Due Date, Priority, Created Date, Title) with Asc/Desc toggle
  * Add / Edit Task Modal with title, description, priority, category, due date, due time, and estimated duration
  * Confirmation dialog before task deletion
  * Interactive task completion with immediate database persistence and toast feedback

* **👤 User Profile & Settings**:
  * View member creation date and account email
  * Edit full name and select from preset avatars or custom image URLs
  * Appearance settings: **Light**, **Dark**, and **System Default** modes with persistent storage

* **🛡️ Security & Reliability**:
  * Parameterized SQL queries preventing SQL injection
  * Strict user data isolation (users can never access or modify tasks belonging to other accounts)
  * Skeletons for smooth loading states and informative empty states

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router 6 |
| **Backend** | Node.js, Express.js, TypeScript, mysql2, bcryptjs, jsonwebtoken, Zod |
| **Database** | MySQL 8.0+ |
| **Styling** | Tailwind CSS with `darkMode: 'class'`, Inter typography |

---

## 📂 Project Structure

```text
Productivity app/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & MySQL connection pool
│   │   ├── controllers/     # Express route handlers with Zod validation
│   │   ├── middleware/      # JWT auth, error handling, validation
│   │   ├── models/          # Parameterized database queries
│   │   ├── routes/          # REST route definitions
│   │   ├── scripts/         # Automated DB init & seed script
│   │   ├── services/        # Business logic layer
│   │   ├── types/           # Backend TypeScript interfaces
│   │   ├── utils/           # JWT & response helpers
│   │   └── server.ts        # Express app entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI & Task components
│   │   ├── context/         # Auth, Theme, and Toast context providers
│   │   ├── layouts/         # Desktop Sidebar, Header, MobileNav, Layout
│   │   ├── pages/           # Dashboard, Tasks, Profile, Settings, Auth
│   │   ├── services/        # Reusable API services layer
│   │   ├── types/           # Frontend TypeScript interfaces
│   │   ├── utils/           # Date & className helpers
│   │   ├── App.tsx          # Router configuration
│   │   ├── index.css        # Tailwind & custom scrollbars
│   │   └── main.tsx         # React root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── database/
│   ├── schema.sql           # MySQL database & table definitions
│   └── seed.sql             # Demo user & sample tasks
│
├── .env.example
└── README.md
```

---

## ⚙️ Prerequisites

* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)
* **MySQL Server** (v8.0+ or XAMPP / MariaDB)

---

## 🗄️ MySQL Database Setup

1. Make sure your MySQL server is running.
2. Configure your database credentials in `backend/.env` (copy from `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=productivity_app
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

3. Initialize the database and populate sample seed data automatically:

```bash
cd backend
npm run init-db
```

*Alternatively, you can manually import `database/schema.sql` followed by `database/seed.sql` using MySQL CLI or Workbench.*

---

## 🏃 Running the Application

### 1. Start the Backend API Server

```bash
cd backend
npm install
npm run dev
```

The backend REST API will run on **`http://localhost:5000`**.

### 2. Start the Frontend Application

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will open on **`http://localhost:5173`**.

---

## 🔑 Demo Test Credentials

To quickly test the application, use the pre-configured demo account:

* **Email**: `velan@example.com`
* **Password**: `password123`

*(You can also register a new account from the `/register` page).*

---

## 🔌 API Endpoints Reference

### Authentication
* `POST /api/auth/register` — Register a new account
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET  /api/auth/me` — Get current authenticated user *(Protected)*

### Tasks
* `GET    /api/tasks` — List user tasks with optional filtering & sorting *(Protected)*
* `GET    /api/tasks/categories` — Get distinct category names *(Protected)*
* `GET    /api/tasks/:id` — Get specific task by ID *(Protected)*
* `POST   /api/tasks` — Create a new task *(Protected)*
* `PUT    /api/tasks/:id` — Update existing task *(Protected)*
* `PATCH  /api/tasks/:id/complete` — Toggle task completion status *(Protected)*
* `DELETE /api/tasks/:id` — Delete task *(Protected)*

### Dashboard
* `GET /api/dashboard` — Calculate live statistics, today's tasks, top priority task, and upcoming tasks *(Protected)*

### User Profile
* `GET /api/users/profile` — Get profile information *(Protected)*
* `PUT /api/users/profile` — Update display name and avatar *(Protected)*

---

## 🔮 Roadmap for Phase 2

The following modules will be integrated on top of the Phase 1 foundation:
1. **Goals Module**: Quarterly & yearly target tracking with milestone progress
2. **Habits Tracker**: Daily streak counters and habit frequency heatmaps
3. **Calendar Integration**: Monthly/weekly timeline view and schedule planning
4. **Pomodoro / Focus Timer**: Ambient soundscapes and focus interval logs
5. **Notes & Wiki**: Markdown notes with folder organization
6. **Projects Hub**: Multi-task project tracking with status boards
7. **Analytics & Reports**: Productivity score, category breakdown charts, and trends
8. **AI Assistant**: Smart task breakdown and daily schedule optimizer
