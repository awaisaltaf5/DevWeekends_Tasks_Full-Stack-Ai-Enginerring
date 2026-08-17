# E-commerce Backend API

## Project Description
A RESTful **Node.js** + **Express** backend API for an e-commerce platform. It exposes
authentication, product management, a per-user shopping cart, and order placement, with
all data persisted in **MongoDB Atlas** via **Mongoose**.

Built incrementally with a strong focus on security and error handling:
- Passwords are hashed with **bcryptjs**; JWTs authenticate every protected request.
- Roles (`user` / `admin`) are sourced from the database — never trusted from the
  client token or request body.
- Order totals are **calculated on the server** from live product prices; a client-supplied
  `totalAmount` is ignored.
- Invalid IDs, missing resources, duplicate keys, and malformed bodies are normalized into
  consistent JSON error responses.

## Features
- JWT authentication: register, login, get current user (`/me`)
- Password hashing (bcryptjs, 10 rounds); password is never returned in responses
- `protect` middleware (JWT verification + DB user lookup) and `admin` guard (403)
- Public product browsing; admin-only product CRUD (create / update / delete)
- Per-user shopping cart: add (auto-merges duplicate products), update quantity,
  remove item, clear cart — with active-status + sufficient-stock checks against the live product
- Orders placed from the cart; stock is reduced and the cart is cleared
- Order status lifecycle: `pending → processing → shipped → delivered / cancelled`
- Users can only read their **own** orders (`/orders/:id` enforces ownership)
- Admin-only order-status updates
- Centralized error handler + 404 handler; `asyncHandler` wrapper for async routes
- Invalid `ObjectId` params return `400` instead of crashing
- Health-check endpoint: `GET /api/health`
- Mongoose 9 idioms — no `new: true` / deprecation warnings (`returnDocument: 'after'`)

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Web framework | Express 5 |
| Database | MongoDB Atlas (NoSQL) |
| ODM | Mongoose 9 |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Passwords | bcryptjs |
| Env / CORS | dotenv, cors |
| Dev | nodemon |

## MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account / cluster.
2. In **Database Access**, create a database user (username + password).
3. In **Network Access**, add your IP address (or `0.0.0.0/0` for local testing).
4. Click **Connect → Drivers**, choose **Node.js**, and copy the connection string.
5. Replace `<password>` with the DB user password and `<dbname>` with your database name.
6. Save it as `MONGODB_URI` in your `.env` (see `.env.example`).

## Environment Variables
Create a `.env` file (copy from `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0...` |
| `JWT_SECRET` | Secret used to sign JWTs | `your_jwt_secret` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |

Secrets are read from the environment only — **no credentials are hardcoded** in source.
The `.env` file is git-ignored.

## Installation
```bash
git clone <repo>
cd <folder>
npm install
cp .env.example .env   # then edit with your values
```

## Running Locally
```bash
npm run dev    # nodemon — auto-restarts on changes
# or
npm start      # node src/server.js
```
The console prints `Server is running on port <PORT>` and `MongoDB Connected: <host>`.

## MVC Architecture
```
src/
├── app.js              # Express app: middleware, routes, 404 + error handler
├── server.js           # Bootstraps: connectDB() then app.listen()
├── config/db.js        # MongoDB Atlas connection (MONGODB_URI)
├── controllers/        # Request handlers (asyncHandler + AppError)
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
├── middleware/
│   ├── auth.js         # protect (JWT verify + DB user load)
│   ├── admin.js        # admin guard (403 on non-admin)
│   └── error.js        # errorHandler, notFound, asyncHandler
├── models/             # Mongoose schemas/models (User, Product, Cart, Order)
├── routes/             # Route definitions (public vs protected/admin)
│   ├── authRoutes.js, productRoutes.js, cartRoutes.js, orderRoutes.js
└── utils/              # AppError, generateToken
```

## API Endpoints

Base URL: `http://localhost:<PORT>/api`

### Authentication
| Method | Route | Access | Body |
|--------|-------|--------|------|
| POST | `/api/auth/register` | Public | `{ name, email, password }` |
| POST | `/api/auth/login` | Public | `{ email, password }` |
| GET | `/api/auth/me` | Private | — |

- Registration **does not accept a `role` field**; it defaults to `user` (privilege-escalation safety).
- Responses return `{ success, message, data: { _id, name, email, role, token } }`. Passwords are never returned.

### Products
| Method | Route | Access | Body |
|--------|-------|--------|------|
| GET | `/api/products` | Public | — |
| GET | `/api/products/:id` | Public | — |
| POST | `/api/products` | Private + Admin | `{ name, description, price, stock?, image?, category?, isActive? }` |
| PUT | `/api/products/:id` | Private + Admin | (any updatable field) |
| DELETE | `/api/products/:id` | Private + Admin | — |

- Invalid `:id` → `400 Invalid product ID format`. Missing → `404 Product not found`.

### Cart (all routes require `protect`)
| Method | Route | Body | Notes |
|--------|-------|------|-------|
| GET | `/api/cart` | — | Returns `{ user, items: [] }` if no cart exists yet |
| POST | `/api/cart` | `{ productId, quantity? }` (default 1) | Creates cart if absent; merges quantity if product already present |
| PUT | `/api/cart/:productId` | `{ quantity }` | Update quantity of an existing item |
| DELETE | `/api/cart/:productId` | — | Remove a product from the cart |
| DELETE | `/api/cart` | — | Clear the entire cart |

Behavior:
- Add/update verifies the product exists, is `active`, and has sufficient `stock` (live check).
- Each cart item stores a `price` snapshot (price at add-time).
- `quantity` must be a number ≥ `1`.

### Orders
| Method | Route | Access | Body |
|--------|-------|--------|------|
| POST | `/api/orders` | Private | (none — order is built from the cart) |
| GET | `/api/orders` | Private | — (returns only the caller's orders) |
| GET | `/api/orders/:id` | Private | — (owner only → `403` otherwise) |
| PUT | `/api/orders/:id/status` | Private + Admin | `{ status }` |

`status` values: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.

**Creating an order** (`POST /api/orders`) — server-side flow:
1. Authenticated user (via `protect`).
2. Read the user's cart from Atlas.
3. Reject if the cart is empty (`400 Your cart is empty`).
4. For each item: verify the referenced product still exists and is active.
5. Verify sufficient stock for every item.
6. **Calculate `totalAmount` on the server** from live product prices — a client-supplied `totalAmount` is ignored.
7. Create the order (`status: 'pending'`).
8. Decrement each product's stock atomically (`findOneAndUpdate` guarded by `stock: { $gte: qty }` + `$inc`).
9. Clear the cart.
10. Return the populated order.

> Client-supplied `totalAmount` is intentionally ignored — totals are recomputed from MongoDB at checkout.

## Authentication (using the API)
Login/register return a `token`. Send it on protected requests:

```
Authorization: Bearer <token>
```

Example:
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"customer@example.com","password":"userpass123"}' | jq -r .data.token)

curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/cart
```

## Creating an Admin User
Registration never creates admins. Create one with a one-off script (run once):

```bash
node -e "require('dotenv').config(); \
require('./src/config/db')().then(async()=>{ \
const U=require('./src/models/User'); \
await U.create({name:'Admin',email:'admin@example.com',password:'adminpass123',role:'admin'}); \
console.log('admin created'); process.exit(0);});"
```

## Setup
This project persists data in **MongoDB Atlas** only (no local database required). The
steps below are a condensed version of the detailed sections above.

1. Prerequisites: [Node.js](https://nodejs.org/) (LTS) and an [npm](https://www.npmjs.com/) registry.
2. Get a MongoDB Atlas connection string (see [MongoDB Atlas Setup](#mongodb-atlas-setup))
   and a strong `JWT_SECRET`.
3. Create `.env` from the template and fill in the values:
   ```bash
   cp .env.example .env            # then edit with your real values
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create an admin user (registration always yields a regular user — see
   [Creating an Admin User](#creating-an-admin-user)):
   ```bash
   node -e "require('dotenv').config(); require('./src/config/db')().then(async()=>{ \
   const U=require('./src/models/User'); \
   await U.create({name:'Admin',email:'admin@example.com',password:'adminpass123',role:'admin'}); \
   console.log('admin created'); process.exit(0);});"
   ```
6. Start the server:
   ```bash
   npm run dev    # nodemon — auto-restarts on changes
   # or
   npm start      # node src/server.js
   ```
7. Verify: `curl http://localhost:5000/api/health` → `200 { "success": true, ... }`

---

### Quick-start (all-in-one)
```bash
cp .env.example .env && npm install
# edit .env → set MONGODB_URI, JWT_SECRET, PORT
npm run dev
```

## Project Structure
```
E-commerce Backend/
├── .env                 # local environment (git-ignored) — see .env.example
├── .env.example         # template with placeholder values
├── .gitignore
├── package.json         # scripts: dev (nodemon), start (node)
├── README.md
└── src/
    ├── server.js        # entry point: loads env, connects DB, starts Express
    ├── app.js           # Express app — middleware, routes, 404 + error handler
    ├── config/
    │   └── db.js        # connectDB() — mongoose.connect(MONGODB_URI)
    ├── routes/
    │   ├── index.js     # mounts all routers under /api
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── cartRoutes.js
    │   └── orderRoutes.js
    ├── controllers/     # route handlers (auth, product, cart, order)
    ├── middleware/
    │   ├── auth.js      # protect — verifies JWT, loads user from DB
    │   ├── admin.js     # restrictTo('admin') — 403 otherwise
    │   └── error.js     # notFound + errorHandler (normalized JSON errors)
    ├── models/          # User, Product, Cart, Order
    └── utils/
        ├── AppError.js  # operational error class
        └── generateToken.js
```

## API Routes Reference
All routes are mounted under `/api`. The `auth` column lists the requirement: none, `user`, or `admin`.
Status codes: `200/201` success, `400` bad request/validation, `401` unauthenticated, `403`
forbidden, `404` not found, `500` server error.

### Public
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/health` | none | Health check |
| POST   | `/auth/register` | none | Register a new **user** (role is forced to `user`) |
| POST   | `/auth/login` | none | Authenticate → returns `data.token` |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/products` | none | List products (paginated) |
| GET    | `/products/:id` | none | Get a single product by id |
| POST   | `/products` | admin | Create a product |
| PUT    | `/products/:id` | admin | Update a product by id |
| DELETE | `/products/:id` | admin | Delete a product by id |

### Cart
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/cart` | user | Get the current user's cart |
| POST   | `/cart` | user | Add an item (`{ productId, quantity }`); merges if already present |
| PUT    | `/cart/:productId` | user | Update item quantity (`{ quantity }`) |
| DELETE | `/cart/:productId` | user | Remove a single product from the cart |
| DELETE | `/cart` | user | Clear the entire cart |

### Orders
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST   | `/orders` | user | Create an order from the cart (total computed server-side) |
| GET    | `/orders` | user | List the current user's orders |
| GET    | `/orders/:id` | user | Get an order — **owner only** (403 otherwise) |
| PUT    | `/orders/:id/status` | admin | Update order status (`{ status }`) |

### Status values for orders
`pending` → `processing` → `shipped` → `delivered` / `cancelled`

### Error response shape
```jsonc
{ "success": false, "message": "Not authorized, no token" }   // e.g. 401
{ "success": false, "message": "Not authorized as admin" }    // 403
{ "success": false, "message": "Product not found" }           // 404
{ "success": false, "message": "Invalid product id", "errors": [...] } // 400 (dev only: +stack)
```

## Testing Instructions
> The API was validated end-to-end against an in-memory MongoDB (cached `mongod`) so
> real Atlas credentials are never touched during tests. All checks below passed
> (**43** total this phase: 38 in the cart+orders harness + 5 in the final smoke test;
> auth was validated in the previous phase).

### 1. Start the server
```bash
npm run dev
```

### 2. Health check
```bash
curl http://localhost:5000/api/health
# 200 { "success": true, "message": "E-commerce API is running" }
```

### 3. Authentication
```bash
# Register (role defaults to 'user')
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Customer","email":"customer@example.com","password":"userpass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"customer@example.com","password":"userpass123"}'
# -> grab data.token

# Get current user
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/me
```

### 4. Product CRUD (admin)
```bash
# Create (admin only)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Laptop","description":"Pro laptop","price":999.99,"category":"electronics","stock":5}'

# List (public)
curl http://localhost:5000/api/products
```

### 5. Cart
```bash
curl -X POST http://localhost:5000/api/cart -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"productId":"<PRODUCT_ID>","quantity":2}'
curl http://localhost:5000/api/cart -H "Authorization: Bearer $TOKEN"
curl -X DELETE http://localhost:5000/api/cart -H "Authorization: Bearer $TOKEN"
```

### 6. Create an order
```bash
curl -X POST http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN"
curl http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN"
```

### 7. Protected / admin authorization checks
```bash
curl http://localhost:5000/api/cart                                                                   # -> 401 (no token)
curl -X POST http://localhost:5000/api/products -H "Authorization: Bearer $TOKEN"                     # -> 403 (not admin)
curl -X PUT http://localhost:5000/api/orders/$ID/status -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"status":"shipped"}'                                        # -> 403 (user); 200 (admin)
```

## Security & Error Handling Review
- ✅ No credentials hardcoded — secrets come from `.env` (git-ignored); `.env.example` documents them.
- ✅ Passwords hashed with **bcryptjs** (`src/models/User.js`); excluded via `select: false` **and** a `toJSON`/`toObject` transform.
- ✅ `role` is **never** accepted from clients on registration (defaults to `user`); admins are created via a seeder.
- ✅ `protect` re-fetches the user from the DB on every request — the role is never trusted from the JWT.
- ✅ Order `totalAmount` is computed on the server from live product prices; a client-supplied total is ignored.
- ✅ `GET /orders/:id` returns `403` for non-owners → users cannot read other users' orders.
- ✅ Invalid `ObjectId` parameters return `400` (validated in every controller).
- ✅ Unknown routes return `404` (`notFound`); all errors go through the centralized `errorHandler`
  (Mongoose `ValidationError`/`11000`/`CastError`, JWT errors, malformed JSON), with stack traces only in development.

## Verification Summary (end-to-end, in-memory MongoDB)
- Health endpoint → `200`, MongoDB connects.
- Auth: register/login/me, duplicate-email (400), invalid credentials (401).
- Products: public list/get; admin 403 for non-admin & 401 unauthenticated; full CRUD; 404 on missing.
- Cart: empty get, add/merge, quantity update, insufficient-stock (400), invalid product id (400), bad quantity (400), nonexistent product (404), remove, re-remove (404), clear.
- Orders: empty-cart (400), create with server-calculated total + stock reduction + cart clear, owner get, cross-user/admin get (403 ×2), invalid id (400), nonexistent (404), user status-update (403), admin status-update (200), invalid status (400), missing status (400), client `totalAmount` ignored, order-time insufficient stock (400).

## Remaining Limitations / Notes
- **Order placement is not wrapped in a MongoDB transaction.** Stock is decremented per-product with an atomic `findOneAndUpdate` guarded by `stock: { $gte: qty }` + `$inc`, which prevents oversell for each item individually. Under very high concurrency, full multi-item atomicity would require a **session transaction** (Atlas replica sets support this). Acceptable for a weekend project; harden with transactions for production.
- **Admin order access:** per the spec, `GET /orders/:id` is owner-only — an admin accessing another user's order gets `403`. Admins can still update any order's status via `PUT /api/orders/:id/status`. (Add an admin override in `getOrderById` if admins should view all orders.)
- Products use hard-delete (no archive/soft-delete).
- Cart items store a price snapshot at add-time; the order uses the **live** price at checkout.


