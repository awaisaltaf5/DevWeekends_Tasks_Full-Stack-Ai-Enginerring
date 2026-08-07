# Express MongoDB API

A REST API built with Express, MongoDB, Mongoose and JWT.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-restart
- **Jest** - Testing framework
- **supertest** - HTTP testing
- **mongodb-memory-server** - In-memory MongoDB for tests

## Project Structure

```
express-mongodb-api/
│
├── src/
│   ├── config/       # Configuration files (DB connection, etc.)
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware (auth, error handling)
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   ├── tests/        # Jest test suite + in-memory DB helpers
│   ├── app.js        # Express app setup
│   └── server.js     # Server entry point
│
├── .env              # Environment variables (not committed)
├── .env.example      # Example environment variables
├── .gitignore
├── jest.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

5. Start the production server:

```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |

## API Endpoints

### Health Check

```
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "API is running"
}
```

## Authentication

All authentication endpoints are mounted under `/api/auth` and are publicly accessible.

### Register

Create a new user account.

**Endpoint:**

```
POST /api/auth/register
```

**Headers:**

```
Content-Type: application/json
```

**Request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**cURL example:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'
```

**Success response (`201 Created`):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation error response (`400 Bad Request`):**

Returned when required fields are missing, the password is shorter than 6
characters, the email format is invalid, or the email is already registered.

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

### Login

Authenticate an existing user and receive a JWT.

**Endpoint:**

```
POST /api/auth/login
```

**Headers:**

```
Content-Type: application/json
```

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**cURL example:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error response (`401 Unauthorized`):**

Returned when the email is not registered or the password does not match.

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

> **Note:** The JWT returned on login/register can be used to authenticate
> subsequent requests. Send it in the `Authorization` header as
> `Bearer <token>`.

## Tasks

All task endpoints are mounted under `/api/tasks` and require authentication.
Send the JWT obtained from login/register in the `Authorization` header as
`Bearer <token>`.

### List my tasks

```
GET /api/tasks
Authorization: Bearer <JWT>
```

```bash
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
      "title": "My first task",
      "description": "Write tests",
      "completed": false,
      "user": "64f1b2c3d4e5f6a7b8c9d0e2",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

> **Note:** Only tasks that belong to the authenticated user are returned.
> Requests without a valid token receive `401 Unauthorized`.

### Create a task

```
POST /api/tasks
Authorization: Bearer <JWT>
```

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"title":"My first task","description":"Write tests"}'
```

**Success response (`201 Created`):**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "title": "My first task",
    "description": "Write tests",
    "completed": false,
    "user": "64f1b2c3d4e5f6a7b8c9d0e2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> **Note:** The `user` field is set automatically from the authenticated user.
> Do not supply it in the request body.

### Get a task by ID

```
GET /api/tasks/:id
Authorization: Bearer <JWT>
```

```bash
curl http://localhost:5000/api/tasks/64f1b2c3d4e5f6a7b8c9d0e1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "title": "My first task",
    "description": "Write tests",
    "completed": false,
    "user": "64f1b2c3d4e5f6a7b8c9d0e2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Task belongs to another user |
| `404 Not Found` | Task does not exist or does not belong to the user |

### Update a task

```
PUT /api/tasks/:id
Authorization: Bearer <JWT>
```

```bash
curl -X PUT http://localhost:5000/api/tasks/64f1b2c3d4e5f6a7b8c9d0e1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"title":"Updated title","completed":true}'
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "title": "Updated title",
    "description": "Write tests",
    "completed": true,
    "user": "64f1b2c3d4e5f6a7b8c9d0e2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid task ID or empty title |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Task belongs to another user |
| `404 Not Found` | Task does not exist or does not belong to the user |

### Delete a task

```
DELETE /api/tasks/:id
Authorization: Bearer <JWT>
```

```bash
curl -X DELETE http://localhost:5000/api/tasks/64f1b2c3d4e5f6a7b8c9d0e1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid task ID |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Task belongs to another user |
| `404 Not Found` | Task does not exist or does not belong to the user |

## Categories

All category endpoints require a valid JWT.

### Create a category

```
POST /api/categories
Authorization: Bearer <JWT>
```

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"name":"Work","description":"Work-related tasks"}'
```

**Success response (`201 Created`):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Work",
    "description": "Work-related tasks",
    "user": "64f1b2c3d4e5f6a7b8c9d0e2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Name is missing |
| `401 Unauthorized` | Missing or invalid JWT |

### Get all categories

```
GET /api/categories
Authorization: Bearer <JWT>
```

```bash
curl http://localhost:5000/api/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
      "name": "Work",
      "description": "Work-related tasks",
      "user": "64f1b2c3d4e5f6a7b8c9d0e2",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `401 Unauthorized` | Missing or invalid JWT |

### Get a single category

```
GET /api/categories/:id
Authorization: Bearer <JWT>
```

```bash
curl http://localhost:5000/api/categories/64f1b2c3d4e5f6a7b8c9d0e1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Work",
    "description": "Work-related tasks",
    "user": "64f1b2c3d4e5f6a7b8c9d0e2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid category ID |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Category belongs to another user |
| `404 Not Found` | Category does not exist or does not belong to the user |

### Update a category

```
PUT /api/categories/:id
Authorization: Bearer <JWT>
```

```bash
curl -X PUT http://localhost:5000/api/categories/64f1b2c3d4e5f6a7b8c9d0e1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"name":"Personal","description":"Personal tasks"}'
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "64f1b2c3d4e5f6a7b8c9d0e1",
    "name": "Personal",
    "description": "Personal tasks",
    "user": "64f1b2c3d4e5f6a7b8c9d0e2",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid category ID or empty name |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Category belongs to another user |
| `404 Not Found` | Category does not exist or does not belong to the user |

### Delete a category

```
DELETE /api/categories/:id
Authorization: Bearer <JWT>
```

```bash
curl -X DELETE http://localhost:5000/api/categories/64f1b2c3d4e5f6a7b8c9d0e1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response (`200 OK`):**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Invalid category ID |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Category belongs to another user |
| `404 Not Found` | Category does not exist or does not belong to the user |

## Error Responses

All errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

In development mode, the response also includes a `stack` field.

| Status | Condition | Example message |
|--------|-----------|-----------------|
| `400 Bad Request` | Invalid JSON body | `Invalid JSON body` |
| `400 Bad Request` | Validation failure | `Title is required` |
| `400 Bad Request` | Invalid MongoDB ObjectId | `Invalid resource ID format` |
| `400 Bad Request` | Duplicate email | `Email already exists` |
| `401 Unauthorized` | Missing token | `Not authorized, no token` |
| `401 Unauthorized` | Invalid JWT | `Invalid token` |
| `401 Unauthorized` | Expired JWT | `Token expired` |
| `401 Unauthorized` | Invalid credentials | `Invalid email or password` |
| `403 Forbidden` | Task belongs to another user | `Not authorized to access this task` |
| `404 Not Found` | Unknown route | `Route not found` |
| `404 Not Found` | Task does not exist | `Task not found` |
| `500 Internal Server Error` | Unexpected server error | `Server error` |

### Example: duplicate registration

```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Example: missing token

```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### Example: invalid task ID

```json
{
  "success": false,
  "message": "Invalid resource ID format"
}
```

## Testing

The project ships with a Jest test suite that uses `mongodb-memory-server` to
run a fully isolated in-memory MongoDB instance — no external database is
required.

> **Note:** The `mongod` binary is downloaded automatically on the first run
> and cached under `node_modules/.cache/mongodb-memory-server/`. A fresh
> install may take a few minutes; subsequent runs reuse the cached binary.

Run the tests:

```bash
npm test
```

Run the tests with live output:

```bash
npx jest --watch
```

### Test setup

The test infrastructure lives in `src/tests/`:

- `dbHandler.js` — connects to / stops an isolated in-memory MongoDB (via `mongodb-memory-server`) and wipes the database between tests.
- `setup.js` — Jest setup file wired through `setupFilesAfterEnv` in `jest.config.js`, exposing shared lifecycle hooks (`beforeAll` / `beforeEach` / `afterAll`).
- `auth.test.js` — the auth test suite (uses `supertest` against the Express app).

The auth tests cover:

- **Register** — success, missing name, missing email, missing password,
  short password, invalid email format, and duplicate email.
- **Login** — success, missing email, missing password, unregistered email,
  and wrong password.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with nodemon (auto-restart) |
| `npm start` | Start server with node |
| `npm test` | Run the Jest test suite |

## License

ISC
