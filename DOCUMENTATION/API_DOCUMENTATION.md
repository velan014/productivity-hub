# REST API SPECIFICATION & DOCUMENTATION
## Personal Productivity App (Productivity Hub)

---

### 1. General API Information

- **Base URL**: `http://localhost:5000/api`
- **Protocol**: HTTP/1.1 REST over JSON
- **Standard Authentication**: Bearer Token in HTTP Authorization Header:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  ```
- **Standard Response Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional status message"
  }
  ```
- **Standard Error Envelope**:
  ```json
  {
    "success": false,
    "message": "Human-readable error description",
    "errors": [ ... ]
  }
  ```

---

### 2. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
- **Purpose**: Register a new user account.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "uuid-v4", "name": "Alex Johnson", "email": "alex@example.com" },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```
- **Errors**: `400 Bad Request` (Validation error, email already exists, passwords mismatch).

---

#### `POST /api/auth/login`
- **Purpose**: Authenticate user credentials and receive JWT.
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "uuid-v4", "name": "Alex Johnson", "email": "alex@example.com" },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid email or password).

---

#### `GET /api/auth/me`
- **Purpose**: Retrieve authenticated user's current session profile.
- **Auth**: Required (JWT)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "uuid-v4", "name": "Alex Johnson", "email": "alex@example.com", "avatar": null }
    }
  }
  ```

---

### 3. Task Management Endpoints (`/api/tasks`)

#### `GET /api/tasks`
- **Purpose**: List user tasks with optional filtering and sorting.
- **Auth**: Required (JWT)
- **Query Parameters**:
  - `tab`: `all` | `today` | `upcoming` | `completed`
  - `priority`: `low` | `medium` | `high`
  - `status`: `todo` | `in_progress` | `completed`
  - `category`: String
  - `project_id`: UUID
  - `search`: String
  - `sortBy`: `due_date` | `priority` | `created_at` | `title`
  - `sortOrder`: `ASC` | `DESC`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "task-uuid",
          "title": "Complete Database Assignment",
          "priority": "high",
          "status": "todo",
          "category": "Academics",
          "due_date": "2026-09-25",
          "due_time": "18:00:00",
          "estimated_minutes": 90
        }
      ]
    }
  }
  ```

---

#### `POST /api/tasks`
- **Purpose**: Create a new task.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "title": "Build Distributed Consensus Engine",
    "description": "Raft protocol implementation",
    "priority": "high",
    "category": "Projects",
    "due_date": "2026-09-30",
    "due_time": "17:00:00",
    "estimated_minutes": 120,
    "project_id": "optional-project-uuid"
  }
  ```
- **Response `201 Created`**: Returns created task object.

---

#### `PATCH /api/tasks/:id/complete`
- **Purpose**: Toggle task completion status and trigger gamification XP (+10 XP).
- **Auth**: Required (JWT)
- **Response `200 OK`**: Returns updated task object.

---

### 4. Goal Management Endpoints (`/api/goals`)

#### `GET /api/goals`
- **Purpose**: List user's active and completed long-term goals.
- **Auth**: Required (JWT)
- **Response `200 OK`**: Returns array of goal records.

#### `POST /api/goals`
- **Purpose**: Create a new goal.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "title": "Master Distributed Systems",
    "description": "Read 5 core academic papers and implement prototype",
    "category": "Learning",
    "priority": "high",
    "target_date": "2026-12-31"
  }
  ```

#### `PUT /api/goals/:id`
- **Purpose**: Update goal details or progress percentage.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  { "progress": 80 }
  ```

---

### 5. Habit Tracking Endpoints (`/api/habits`)

#### `GET /api/habits`
- **Purpose**: Fetch all active habits with current streak and today's completion status.
- **Auth**: Required (JWT)

#### `POST /api/habits`
- **Purpose**: Create a new habit routine.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "name": "Read Academic Literature",
    "description": "30 mins daily paper reading",
    "frequency": "daily",
    "target_count": 1,
    "category": "Learning",
    "color": "indigo",
    "icon": "BookOpen"
  }
  ```

#### `POST /api/habits/:id/log`
- **Purpose**: Log or toggle daily habit check-in (+15 XP).
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "log_date": "2026-09-22",
    "completed": true
  }
  ```

---

### 6. Focus & Pomodoro Endpoints (`/api/focus`)

#### `POST /api/focus`
- **Purpose**: Record completed focus interval (+1 XP per minute).
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "mode": "focus",
    "planned_minutes": 25,
    "actual_minutes": 25,
    "completed": true,
    "started_at": "2026-09-22T10:00:00.000Z",
    "ended_at": "2026-09-22T10:25:00.000Z",
    "task_id": "optional-task-uuid"
  }
  ```

---

### 7. Notes Endpoints (`/api/notes`)

#### `GET /api/notes`
- **Purpose**: List notes, search by keyword, or filter by category.
- **Auth**: Required (JWT)
- **Query Parameters**: `category`, `search`

#### `POST /api/notes`
- **Purpose**: Create a new note.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "title": "B-Tree vs LSM-Tree Indexing",
    "content": "# Indexing Mechanisms\n- B-Trees optimize random reads...",
    "category": "Databases",
    "is_pinned": true
  }
  ```

---

### 8. Project Management Endpoints (`/api/projects`)

#### `GET /api/projects`
- **Purpose**: List user projects with calculated progress percentage and task counts.
- **Auth**: Required (JWT)

#### `POST /api/projects`
- **Purpose**: Create a project deliverable.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "name": "Autonomous Robotics Prototype",
    "description": "SLAM navigation and path planning",
    "priority": "high",
    "due_date": "2026-11-30",
    "color": "indigo"
  }
  ```

---

### 9. Academic Study Endpoints (`/api/subjects` & `/api/study`)

#### `GET /api/subjects`
- **Purpose**: List academic courses/subjects with target study hours.
- **Auth**: Required (JWT)

#### `POST /api/subjects`
- **Purpose**: Create a subject.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "name": "Advanced Computer Networks",
    "code": "CS702",
    "color": "blue",
    "target_hours": 45
  }
  ```

#### `POST /api/study/sessions`
- **Purpose**: Record completed study sprint (+1 XP per minute).
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "subject_id": "subject-uuid",
    "title": "BGP Routing & OSPF Protocol Analysis",
    "date": "2026-09-22",
    "start_time": "14:00:00",
    "end_time": "16:00:00",
    "duration_minutes": 120,
    "notes": "Completed practice routing configuration."
  }
  ```

---

### 10. Analytics Endpoints (`/api/analytics`)

#### `GET /api/analytics`
- **Purpose**: Retrieve aggregated productivity metrics.
- **Auth**: Required (JWT)
- **Query Parameters**: `days` (default `7`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "totalTasks": 24,
      "completedTasks": 18,
      "taskCompletionRate": "75%",
      "activeHabits": 4,
      "weeklyStudyHours": "14.5 hrs",
      "activeProjects": 3,
      "daysOfProductivityChart": [ ... ]
    }
  }
  ```

---

### 11. Daily Planning & Review Endpoints (`/api/morning-plan` & `/api/daily-review`)

#### `POST /api/morning-plan`
- **Purpose**: Save start-of-day intentions and Top 3 Priorities (+15 XP).
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "plan_date": "2026-09-22",
    "priority_1": "Implement LiDAR filter",
    "priority_2": "Study Networks chapter 4",
    "priority_3": "Review 2 pull requests",
    "intention": "Sustained focus on core project milestone.",
    "planned_study_minutes": 120,
    "planned_focus_minutes": 50
  }
  ```

#### `POST /api/daily-review`
- **Purpose**: Submit end-of-day reflection and rating (+20 XP).
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "review_date": "2026-09-22",
    "what_went_well": "Completed SLAM algorithm implementation.",
    "challenges": "Debugging matrix transformations.",
    "learned": "Eigen library quaternion representations.",
    "improvements": "Structure unit tests earlier in the sprint.",
    "mood": "great",
    "rating": 5
  }
  ```

---

### 12. AI Assistant Endpoints (`/api/ai`)

#### `GET /api/ai/status`
- **Purpose**: Check if AI service is configured or operating in heuristic fallback mode.
- **Auth**: Required (JWT)

#### `POST /api/ai/chat`
- **Purpose**: Conversational productivity advice contextualized with user stats.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "message": "How should I structure my remaining study sessions this week?",
    "history": []
  }
  ```

#### `POST /api/ai/task-breakdown`
- **Purpose**: Deconstruct a high-level goal into structured sub-tasks.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "topic": "Build WebSocket Real-Time Notification Server",
    "project_id": "optional-project-uuid"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "explanation": "Here is a 4-step execution roadmap:",
      "suggestions": [
        { "title": "Setup Socket.IO Server", "priority": "high", "estimated_minutes": 45, "category": "Backend" },
        { "title": "Implement JWT Auth Handshake", "priority": "high", "estimated_minutes": 60, "category": "Security" }
      ]
    }
  }
  ```

---

### 13. Gamification Endpoints (`/api/gamification`)

#### `GET /api/gamification`
- **Purpose**: Fetch XP total, current level, progress percentage, and active streak.
- **Auth**: Required (JWT)

#### `GET /api/gamification/achievements`
- **Purpose**: Fetch catalog of 12 achievements indicating user unlock status and timestamp.
- **Auth**: Required (JWT)

---

### 14. Notifications Endpoints (`/api/notifications`)

#### `GET /api/notifications/preferences`
- **Purpose**: Fetch user notification toggles.
- **Auth**: Required (JWT)

#### `PUT /api/notifications/preferences`
- **Purpose**: Update notification toggles.
- **Auth**: Required (JWT)
- **Request Body**:
  ```json
  {
    "enabled": true,
    "morning_plan_enabled": true,
    "focus_enabled": false
  }
  ```

---

### 15. Backup & Portability Endpoints (`/api/backup`)

#### `GET /api/backup/export`
- **Purpose**: Download sanitized JSON archive of all user data (passwords and tokens stripped).
- **Auth**: Required (JWT)
- **Response Headers**: `Content-Disposition: attachment; filename="productivity-hub-backup-YYYY-MM-DD.json"`

#### `POST /api/backup/import`
- **Purpose**: Safe non-destructive merge import of backup JSON.
- **Auth**: Required (JWT)
- **Request Body**: JSON backup archive payload.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Data imported successfully",
      "importedCounts": { "tasks": 12, "goals": 2, "habits": 3, "notes": 5, "projects": 2, "subjects": 3 }
    }
  }
  ```

---

### 16. Health Endpoint (`/api/health`)

#### `GET /api/health`
- **Purpose**: Server health check and uptime ping.
- **Auth**: Public
- **Response `200 OK`**:
  ```json
  { "status": "ok", "timestamp": "2026-09-22T17:35:00.000Z" }
  ```
