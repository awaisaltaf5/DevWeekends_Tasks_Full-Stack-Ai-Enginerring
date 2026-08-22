# StayNest Backend API

A RESTful **Node.js** + **Express 5** backend API for a hotel booking system,
persisted in **MongoDB Atlas** via **Mongoose**, with **JWT** authentication.

> **Note on the MongoDB Atlas connection:** this weekend project scaffold reuses
> the author's existing Atlas cluster for a live connection test. The local
> `.env` (git-ignored) points at that cluster using a dedicated `staynest`
> database. There are **no hardcoded credentials in source** — the connection
> string is read from `process.env.MONGODB_URI`. See the
> [MongoDB Atlas Setup](#mongodb-atlas-setup) section to use your own cluster.

## Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Runtime     | Node.js                                      |
| Web framework | Express 5                                  |
| Database    | MongoDB Atlas (NoSQL)                        |
| ODM         | Mongoose 9                                   |
| Auth        | JSON Web Tokens (`jsonwebtoken`)             |
| Passwords   | bcryptjs                                     |
| Env / CORS  | dotenv, cors                                 |
| Cookies     | cookie-parser                                |
| Dev         | nodemon                                      |

## Project Structure

```
backend/
├── src/
│   ├── config/        # db.js (MongoDB Atlas connection)
│   ├── controllers/   # route controllers (added incrementally)
│   ├── middleware/    # error.js (errorHandler, notFound, asyncHandler)
│   ├── models/        # Mongoose models (added incrementally)
│   ├── routes/        # route files (added incrementally)
│   ├── utils/         # AppError.js, generateToken.js
│   ├── app.js
│   └── server.js
├── .env               # local secrets — git-ignored, NEVER commit
├── .env.example       # template with placeholders only
├── .gitignore
├── package.json
└── README.md
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an
   account / cluster.
2. In **Database Access**, create a database user (username + password).
3. In **Network Access**, add your IP address (or `0.0.0.0/0` for local testing).
4. Click **Connect → Drivers**, choose **Node.js**, and copy the connection string.
5. Replace `<password>` with the DB user password and append your database name
   (e.g. `/staynest`).
6. Save it as `MONGODB_URI` in your `.env` (see `.env.example`).

Secrets are read from the environment only — no credentials are hardcoded in
source. The `.env` file is git-ignored.

## Environment Variables

Create a `.env` file (copy from `.env.example`). `.env.example` contains
**placeholders only** — never real credentials:

| Variable       | Description                          | Example                                  |
|----------------|--------------------------------------|------------------------------------------|
| `PORT`         | Server port                        | `5000`                                   |
| `MONGODB_URI`  | MongoDB Atlas connection string    | `mongodb+srv://user:pass@cluster0...`    |
| `JWT_SECRET`   | Secret used to sign JWTs           | `your_jwt_secret`                        |
| `JWT_EXPIRES_IN` | Token expiry                     | `7d`                                     |
| `NODE_ENV`     | `development` / `production`       | `development`                            |

## Installation

```bash
git clone <repo>
cd StayNest/backend
npm install
cp .env.example .env   # then edit with your values
```

## Running Locally

```bash
npm run dev    # nodemon — auto-restarts on changes
# or
npm start      # node src/server.js
```

The console prints:

```
Server is running on port 5000
Health check: http://localhost:5000/api/health
MongoDB Connected: <atlas-host>
```

## API

### `GET /api/health`

```json
{
  "success": true,
  "message": "StayNest API is running"
}
```

## Authentication

All auth responses include a signed JWT (`token`) and a password-less `user`.

### `POST /api/auth/register`

| Body    | Type   | Validation                       |
|---------|--------|------------------------------------|
| `name`  | string | required, ≥ 2 chars                |
| `email` | string | required, valid email, unique      |
| `password` | string | required, ≥ 6 chars             |

Returns `201` with `{ success, message, token, user }` on success, `400` on
validation/duplicate-email failure.

### `POST /api/auth/login`

| Body      | Type   |
|-----------|--------|
| `email`   | string |
| `password`| string |

Returns `200` with `{ success, message, token, user }`. Invalid credentials
return `401` with a generic `"Invalid credentials"` message (does not reveal
whether the email exists).

### `POST /api/auth/logout`

Returns `200` `{ success, message }`. Stateless — the client discards the token.

### `GET /api/auth/me` 🔒

Returns the authenticated user. Requires a valid `Authorization: Bearer <token>`.

### `GET /api/admin/users` 🔒 (admin)

Returns every user. Requires a valid token **and** the `admin` role
(`403` otherwise, `401` without a token).

### Errors

Duplicate email → `400 "A user already exists with that email"`.
Wrong password / no user → `401 "Invalid credentials"`.
Missing/invalid token → `401`. Non-admin to admin route → `403`.

## Security & Error Handling

- No credentials hardcoded — secrets come from `.env` (git-ignored).
- Centralized error handler + 404 handler; `asyncHandler` wrapper for async routes.
- `AppError` for expected, client-facing errors.
- Malformed JSON bodies, `CastError`s, duplicate keys, and JWT errors return
  consistent `success: false` JSON responses.
- Stack traces are only exposed when `NODE_ENV=development`.
