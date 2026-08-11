# MERN-TaskFlow

A production-quality full-stack task management application built with the MERN stack (MongoDB Atlas, Express, React, and Node.js).

## Project Overview

MERN-TaskFlow is a complete task management application that demonstrates a clean, full-stack JavaScript architecture. Users can create, read, update, delete, and toggle tasks, with all data persisted in a real MongoDB Atlas cloud database. The frontend (React + Vite) communicates with the backend (Express REST API) through Axios, and the UI updates instantly without page reloads. The app also includes scaffolding for future authentication and multiple task views (List, Kanban, Calendar).

## Problem Solved

Task management is a common need for individuals and small teams, but many existing tools are either too heavy or vendor-locked. MERN-TaskFlow provides:

- A **free, self-hosted** solution (MongoDB Atlas free tier + any machine running Node.js).
- A **clear separation of concerns** (React UI ↔ Express API ↔ MongoDB) that is easy to understand, extend, and maintain.
- A **real database** integration rather than mocked/local storage, so tasks persist across sessions.
- A **clean API** with validation, consistent JSON responses, and proper HTTP status codes.
- **No external/third-party API dependencies** — everything is built in-house.

## Features

- **Create Task** — Add a task with a required title and optional description.
- **Read Tasks** — Load and display all tasks from MongoDB Atlas.
- **Update Task** — Edit a task's title, description, and completed status inline.
- **Delete Task** — Remove a task with a confirmation modal.
- **Toggle Completed** — Mark a task complete/incomplete with a single click.
- **Polished UI** — Responsive, accessible, modern design with loading/empty/error states.
- **Toast Notifications** — Visual success/error feedback for every operation.
- **Validation** — Client- and server-side validation with clear messages.
- **Security** — Credentials stored in `.env`, never committed, never exposed to the frontend.
- **Multi-view scaffolding** — Navigation tabs for List, Kanban, and Calendar views (Kanban and Calendar are stubbed for future implementation).

## Technology Stack

**Backend:** Node.js, Express.js (REST API), MongoDB Atlas, Mongoose (ODM), dotenv, cors, express-validator, nodemon, bcryptjs, jsonwebtoken.

**Frontend:** React 18, Vite, Axios, react-router-dom, react-icons, JavaScript (JSX).

## Architecture

```
React (Frontend)
   │
   ▼  (Axios HTTP calls)
Express REST API (Backend)
   │
   ▼  (Mongoose ODM)
MongoDB Atlas (Database)
```

- **React** renders the UI and manages component state.
- **Axios** sends HTTP requests with base URL `http://localhost:5000/api`.
- **Express** exposes REST endpoints, runs validation, and handles routing.
- **Mongoose** models the `Task` and `User` schemas and talks to MongoDB Atlas.
- **MongoDB Atlas** persists all task and user documents in the cloud.

## Folder Structure

```
MERN-TaskFlow/
├── backend/
│   ├── config/db.js            # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── taskController.js   # CRUD business logic
│   │   └── authController.js   # Auth endpoints (stubbed)
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   ├── errorHandler.js     # Centralized error handling
│   │   └── validation.js       # express-validator rules
│   ├── models/
│   │   ├── Task.js             # Mongoose Task schema
│   │   └── User.js             # Mongoose User schema
│   ├── routes/
│   │   ├── tasks.js            # /api/tasks routes
│   │   └── auth.js             # /api/auth routes
│   ├── .env                    # Environment variables
│   ├── .gitignore
│   └── server.js               # Express server entry
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Modal.jsx       # Reusable confirm modal
    │   │   ├── TaskForm.jsx    # Add/edit form
    │   │   ├── TaskItem.jsx    # Single task card
    │   │   ├── TaskList.jsx    # Task list + state
    │   │   └── Toast.jsx       # Notification toasts
    │   ├── pages/              # Future route pages
    │   ├── services/
    │   │   ├── api.js          # Axios instance with auth interceptors
    │   │   └── taskApi.js      # Axios task API layer
    │   ├── App.css             # Global styles
    │   ├── App.jsx             # Root component with view tabs
    │   ├── index.css
    │   ├── main.jsx            # React entry
    │   └── vite-env.d.ts
    ├── index.html
    ├── package.json
    └── vite.config.js          # Vite + proxy config
└── README.md
```

## MongoDB Atlas Setup

1. Create a free account at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new **cluster** (the free `M0` tier is sufficient).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development only).
5. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
6. Paste it into `backend/.env` as `MONGODB_URI`.
7. Collections are created automatically on first write.

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

> **IMPORTANT:** Never commit `.env` (it is in `.gitignore`). The MongoDB URI and credentials are never exposed to the browser.

### Frontend (`frontend/.env` — optional)

```env
VITE_API_URL=http://localhost:5000/api
```

If unset, the frontend defaults to `http://localhost:5000/api`. In development, Vite's proxy forwards `/api` to `http://localhost:5000`.

## Backend Setup

```bash
cd backend
npm install
# Create .env from .env.example and fill in your MongoDB connection string
npm run dev        # development (nodemon)
# or
npm start          # production
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev        # development server on :3000
npm run build      # production build
```

## Run Commands

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# app runs on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint     | Description          | Success |
|--------|--------------|----------------------|---------|
| GET    | `/health`    | Health check         | 200     |
| POST   | `/tasks`     | Create a task        | 201     |
| GET    | `/tasks`     | Get all tasks        | 200     |
| GET    | `/tasks/:id` | Get a single task    | 200     |
| PUT    | `/tasks/:id` | Update a task        | 200     |
| DELETE | `/tasks/:id` | Delete a task        | 200     |
| POST   | `/auth/register` | Register user    | 201     |
| POST   | `/auth/login`    | Login user        | 200     |
| GET    | `/auth/me`       | Get current user  | 200     |
| *      | any route    | Unknown route        | 404     |

> **Note:** The `/api/auth/*` endpoints are stubbed and return "coming soon" messages. The auth middleware, models, and routes are wired in but not yet fully implemented.

### Task Object

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": "2026-08-11T10:00:00.000Z",
  "updatedAt": "2026-08-11T10:00:00.000Z"
}
```

## CRUD Explanation

**Create (POST /api/tasks)** — Sends `{ title, description?, completed? }`; the server validates the title (required, ≤ 100 chars), inserts the document into MongoDB Atlas, and returns `201` with the saved task. The React UI prepends the new task to the list without a reload.

**Read (GET /api/tasks & GET /api/tasks/:id)** — `GET /tasks` returns all tasks sorted newest-first. `GET /tasks/:id` returns one task by its 24-char ObjectId, or `404` if missing. On app load, React calls `GET /tasks` and renders the real data from MongoDB.

**Update (PUT /api/tasks/:id)** — Accepts a partial body (`title`, `description`, and/or `completed`). Mongoose updates the document with `runValidators: true` and returns the latest version. React updates the UI immediately via state.

**Delete (DELETE /api/tasks/:id)** — Deletes the document from MongoDB Atlas by ObjectId and returns `200`. React removes the task instantly. A confirmation modal prevents accidental deletion.

## Axios Integration

The API service layer lives in two files:

**`frontend/src/services/api.js`** — A base Axios instance with request/response interceptors that automatically attach a JWT token from `localStorage` and redirect to `/login` on `401` errors:

```js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });
```

**`frontend/src/services/taskApi.js`** — A task-specific Axios instance built on the base URL:

```js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const taskApi = axios.create({ baseURL: `${API_URL}/tasks` });
```

Exported functions: `getTasks()`, `getTask(id)`, `createTask(data)`, `updateTask(id, data)`, `deleteTask(id)`.

`TaskList.jsx` calls these and updates React state after each successful call, so the UI reflects database changes **without a browser refresh**.

## Error Handling

**Server-side (backend):** The centralized `errorHandler` middleware formats Mongoose `ValidationError`, `CastError` (bad ObjectId), duplicate-key, and generic errors. Express-validator rejects invalid bodies with `400` and clear messages. Common codes: `400` (validation/bad request), `404` (not found/unknown route), `500` (server/database failure).

**Client-side (frontend):** Every Axios call is wrapped in `try/catch`. Load failures (e.g., backend unavailable) show an inline banner with a **Retry** button. Forms show field-level validation errors. Toasts surface success/error feedback for every create/update/delete/toggle. Buttons are disabled while requests are in flight.

## Testing

Verified against the live MongoDB Atlas database:

- **CREATE** → task saved to MongoDB, UI updates (no reload).
- **READ** → tasks loaded from MongoDB on app start.
- **UPDATE** → changes persisted to MongoDB, UI updates immediately.
- **DELETE** → task removed from MongoDB, removed from UI.
- **Toggle complete** → `completed` flips and persists.
- **Failure cases:** empty title (400), invalid task ID (400), nonexistent task (404), title too long (400), invalid JSON (400/500), backend unavailable (client error banner + retry).
- **CORS** → `Access-Control-Allow-Origin` header present.
- **Frontend build** → succeeds (Vite production build).
- **Backend startup** → starts cleanly and connects to MongoDB Atlas.

## Known Limitations

- **Auth endpoints are stubbed** — the `/api/auth/*` routes exist but return "coming soon"; JWT middleware and User model are in place but not functional.
- **No user association** — tasks are global, not scoped per user.
- **No pagination/search/filter** — all tasks are returned at once.
- **Kanban and Calendar views are disabled** — navigation tabs are present but the views are not yet implemented.
- **Single-node deployment** — no containerization/CI/CD yet.
- **No automated test suite** — verification was performed manually.
- **CORS is wide-open** (`Access-Control-Allow-Origin: *`) — fine for development; restrict in production.

## Future Improvements

- Implement JWT authentication and scope tasks to users.
- Build Kanban and Calendar view pages.
- Add filters (by status), sorting, and pagination.
- Add due dates, priorities, and tags/categories.
- Add search across title/description.
- Add a test suite (Vitest + Supertest).
- Containerize with Docker + docker-compose.
- Restrict CORS origins and add rate limiting.

## Acceptance Criteria Checklist

- [x] **✓ React → Express API using Axios** (frontend calls backend via `taskApi.js`)
- [x] **✓ Create** (POST persists to MongoDB, UI updates)
- [x] **✓ Read** (GET loads real MongoDB data on start)
- [x] **✓ Update** (PUT persists changes, UI updates instantly)
- [x] **✓ Delete** (DELETE removes from MongoDB, UI updates)
- [x] **✓ MongoDB persistence** (verified against live Atlas database)
- [x] **✓ UI updates without refresh** (React state after each call)
- [x] **✓ Client error handling** (validation, retry, toasts)
- [x] **✓ Server error handling** (centralized middleware, status codes)
- [x] **✓ Responsive UI** (mobile, tablet, and desktop breakpoints)