# Innova-TaskFlow

Innova-TaskFlow is a full-stack task management application. A React and Vite frontend communicates with an Express REST API backed by MongoDB and Mongoose. Users can create, view, edit, complete, and delete tasks through a responsive interface.

## Features

- Create, read, update, delete, and complete tasks
- MongoDB Atlas persistence through Mongoose
- Server-side and client-side task validation
- Consistent JSON API responses and centralized error handling
- Loading, empty, error, retry, toast, and confirmation-modal states
- JWT middleware and User model scaffolded for authentication
- List, Kanban, and Calendar navigation placeholders
- Vercel-compatible Express serverless entrypoint

Authentication endpoints are currently scaffolds that return a `coming soon` response. Task endpoints remain public, matching the original application's behavior; user-specific task authorization is not yet implemented.

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Axios, React Icons

**Backend:** Node.js, TypeScript, Express, MongoDB Atlas, Mongoose, dotenv, cors, express-validator, bcryptjs, jsonwebtoken

## TypeScript Migration

The project was migrated in place without changing the existing CRUD flow or UI.

### Frontend

- React components use `.tsx` and services use `.ts`.
- `frontend/tsconfig.json` enables strict checking, JSX support, and unused-symbol checks.
- Component props, task state, form data, toast state, and DOM events are explicitly typed.
- Axios calls use typed response envelopes and narrow Axios errors with `axios.isAxiosError`.

### Backend

- Express routes, controllers, middleware, models, and serverless handlers use `.ts`.
- `backend/tsconfig.json` emits CommonJS-compatible JavaScript into `dist/`.
- Express request parameters, request bodies, response envelopes, middleware callbacks, and errors are typed.
- Mongoose schemas are connected to `Task` and `User` interfaces.

### Interfaces and Types

Core types are defined in [frontend/src/types.ts](frontend/src/types.ts) and [backend/types.ts](backend/types.ts). They cover `Task`, `User`, task create/update data, authentication payloads, API errors, toast state, and authenticated requests.

### Generic Type

`ApiResponse<T>` is a reusable generic response envelope. The frontend uses it for task, delete, and single-task responses; the backend uses it for typed controller responses. `TasksResponse` extends it with the task count.

### Enum

`TaskStatus` represents the two display states, `Open` and `Completed`, and is used by the frontend task item. The persisted API model intentionally keeps the existing boolean `completed` field for compatibility.

### Type Narrowing

Request body values are treated as `unknown` and narrowed before string or boolean operations. Caught errors are also `unknown`; the backend uses an error type guard for Mongoose validation errors, while the frontend checks Axios error payloads before reading response messages. JWT payloads are narrowed from the `string | JwtPayload` result of `jwt.verify`.

## Project Structure

```text
Innova-TaskFlow/
├── backend/
│   ├── api/index.ts
│   ├── config/db.ts
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.ts
│   ├── types.ts
│   ├── tsconfig.json
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vercel.json
└── README.md
```

## Installation

Install dependencies independently for each package:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Optionally create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files or real credentials.

## Commands

Run the backend from `backend/`:

```bash
npm run dev       # TypeScript watch mode
npm run build     # Emit compiled backend to dist/
npm start         # Run the compiled backend
```

Run the frontend from `frontend/`:

```bash
npm run dev       # Start Vite on port 3000
npm run typecheck # Strict TypeScript check
npm run build     # Typecheck and create the production bundle
npm run preview   # Preview the production bundle
```

## API

The API base URL is `http://localhost:5000/api` by default.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Server and database status |
| GET | `/tasks` | List tasks |
| GET | `/tasks/:id` | Read one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| POST | `/auth/register` | Authentication scaffold |
| POST | `/auth/login` | Authentication scaffold |
| GET | `/auth/me` | Authentication scaffold |

## Verification

There is currently no automated test script or test suite in either package. The available verification commands are:

```bash
cd backend
npm run build

cd ../frontend
npm run typecheck
npm run build
```

The frontend Axios client attaches a stored JWT token and handles `401` responses, although the current authentication endpoints and task authorization are intentionally incomplete.
