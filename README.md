# ⚡ TaskFlow — Team Task Manager

A web app where users can create projects, assign tasks, and track progress with role-based access (Admin/Member).

## 📁 Full Project Structure

```
taskflow/
│
├── backend/                        # Node.js + Express API
│   ├── controllers/
│   │   ├── authController.js       # signup, login, getMe
│   │   ├── projectController.js    # CRUD + addMember, removeMember
│   │   ├── taskController.js       # CRUD + role-based access
│   │   └── userController.js       # getUsers, getUser, updateProfile
│   ├── middleware/
│   │   └── auth.js                 # protect, adminOnly, projectOwnerOrAdmin
│   ├── models/
│   │   ├── User.js                 # name, email, password, role, avatar, color
│   │   ├── Project.js              # name, desc, color, owner, members[]
│   │   └── Task.js                 # title, desc, project, assignee, status, priority, due
│   ├── routes/
│   │   ├── auth.js                 # POST /api/auth/signup|login, GET /api/auth/me
│   │   ├── projects.js             # CRUD + /members
│   │   ├── tasks.js                # CRUD
│   │   └── users.js                # GET /api/users
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                     # Demo data seed script
│   └── server.js                   # Entry point
│
└── frontend/                       # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx           # Sidebar + animated orbs
    │   │   └── UI.jsx               # Avatar, Button, Card, Modal, Badge, Toast, etc.
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state, login/signup/logout
    │   ├── pages/
    │   │   ├── AuthPage.jsx         # Login + Signup with animations
    │   │   ├── Dashboard.jsx        # Stats, active tasks, project progress
    │   │   ├── Projects.jsx         # Project cards, list/kanban views
    │   │   ├── Tasks.jsx            # All tasks with filters + detail modal
    │   │   ├── Members.jsx          # Team members, workload chart
    │   │   └── Analytics.jsx        # Donut charts, bar charts, weekly data
    │   ├── utils/
    │   │   └── api.js               # Axios instance with JWT interceptor
    │   ├── App.jsx                  # Router + protected routes
    │   ├── index.css                # Global styles, glass, badges
    │   └── main.jsx                 # ReactDOM entry
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/yourname/taskflow.git
cd taskflow

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/taskflow
JWT_SECRET=supersecretkey_change_this
FRONTEND_URL=http://localhost:5173
```

```bash
# frontend/.env
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
```

### 3. Seed demo data (optional)

```bash
cd backend
node seed.js
```

Demo credentials after seeding:
| Email | Password | Role |
|---|---|---|
| alex@taskflow.io | demo123 | Admin |
| sam@taskflow.io | demo123 | Member |
| priya@taskflow.io | demo123 | Member |
| jordan@taskflow.io | demo123 | Member |

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: http://localhost:5173

---

## 🌐 Deployment

### Backend → Railway

1. Push backend to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select your repo → set root directory to `/backend`
4. Add environment variables:
   ```
   MONGO_URI=your_atlas_uri
   JWT_SECRET=your_secret
   FRONTEND_URL=https://your-vercel-app.vercel.app
   PORT=5000
   ```
5. Deploy — Railway auto-detects Node.js

### Database → MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Database Access → Add user with password
4. Network Access → Allow 0.0.0.0/0
5. Connect → Drivers → copy connection string
6. Replace `<password>` in connection string

### Frontend → Vercel

1. Push frontend to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Set root directory to `/frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api
   ```
5. Deploy

---

## 📡 REST API Reference

### Auth
```
POST   /api/auth/signup     { name, email, password }
POST   /api/auth/login      { email, password }
GET    /api/auth/me         (requires token)
```

### Projects
```
GET    /api/projects              Get all user's projects
GET    /api/projects/:id          Get single project
POST   /api/projects              { name, description, color }
PUT    /api/projects/:id          { name, description, color }
DELETE /api/projects/:id          (owner only)
POST   /api/projects/:id/members  { email }
DELETE /api/projects/:id/members/:userId
```

### Tasks
```
GET    /api/tasks                 Get all tasks (query: ?project=id&status=done)
GET    /api/tasks/:id             Get single task
POST   /api/tasks                 { title, description, project, assignee, status, priority, due }
PUT    /api/tasks/:id             Update task (members can only update status)
DELETE /api/tasks/:id             (admin/owner only)
```

### Users
```
GET    /api/users                 Get all users
GET    /api/users/:id             Get user by ID
PUT    /api/users/me              Update own profile { name, color }
```

All endpoints except auth require `Authorization: Bearer <token>` header.

---

## 🧪 Sample API Requests

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@taskflow.io","password":"demo123"}'

# Create project (use token from login)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"A great project"}'

# Get all tasks
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","project":"PROJECT_ID","due":"2025-06-01","priority":"high"}'
```

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + custom glass CSS |
| Animation | Framer Motion |
| HTTP client | Axios |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |

---

## 🛠 Common Errors & Fixes

| Error | Fix |
|---|---|
| `CORS error` | Set `FRONTEND_URL` in backend `.env` |
| `401 Unauthorized` | Check JWT_SECRET matches, re-login |
| `MongoDB connection failed` | Whitelist IP in Atlas Network Access |
| `Cannot find module` | Run `npm install` in both folders |
| `Vite build fails` | Ensure `VITE_API_URL` is set in Vercel env vars |
| `Railway deploy fails` | Set root directory to `/backend` in Railway settings |

---

## 🔐 Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create project | ✅ | ❌ |
| Delete project | ✅ (owner) | ❌ |
| Add members | ✅ (owner) | ❌ |
| Create tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (assigned) |
| View all tasks | ✅ | ✅ (project member) |
