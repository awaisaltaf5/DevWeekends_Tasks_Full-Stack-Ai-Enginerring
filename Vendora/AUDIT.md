# Vendora — Project Audit

> Audit date: 2026-09-01 · Baseline: existing Multi-Vendor MERN e-commerce project, unmodified except where noted.

## 1. Current Architecture

Three Node applications:

| App | Location | Port | Notes |
|---|---|---|---|
| Backend API | `backend/` | 8000 | Express, Mongoose, JWT cookie auth, Stripe, Multer local uploads, Nodemailer |
| Frontend | `frontend/` | 3000 | CRA (React 18), Redux Toolkit + redux-thunk, Tailwind, Material-UI v4, react-router v6, socket.io-client |
| Socket server | `socket/` | 4000 | Separate process; in-memory user/message tracking for chat |

**Backend layout:** `controller/` (user, shop, product, event, order, payment, message, conversation, withdraw, coupounCode) — each file is an Express router mounted at `/api/v2/*` in `server.js`. `model/` mirrors controllers. `middleware/` (auth, catchAsyncErrors, error handler). `utils/` (ErrorHandler, sendMail, jwtToken). `db/Database.js` for Mongo connection. `config/.env` loaded via dotenv.

**Frontend layout:** `src/components/` (Layout, Product, Shop, User, Route, Admin, Events, Wishlist, Cart, Checkout, Popup…), `src/pages/`, `src/redux/` (slices + thunks via axios), `src/routes/` (protected route components), `src/static/data.js` (seed data), `src/server.js` (hardcoded `http://localhost:8000/api/v2`).

## 2. What Already Works (verified running)

- ✅ **Dependencies install & all 3 apps boot** — backend (8000), frontend (3000), socket (4000); frontend compiles (9 warnings only).
- ✅ **MongoDB Atlas connection** works (`backend/db/Database.js`, confirmed via log + live API).
- ✅ **Core REST API** mounted and responding: `GET /api/v2/product/get-all-products` → 200.
- ✅ **JWT cookie-based auth** for both user (`token`) and seller (`seller_token`) cookies; `isAuthenticated`, `isSeller`, `isAdmin(role)` middleware present.
- ✅ **User flow**: register (with email activation link), activate, login, load user, update info/address/password, admin list/delete users.
- ✅ **Seller/shop flow**: shop creation, seller auth, seller products/events/coupons CRUD, withdraw requests.
- ✅ **Product & event CRUD** with image upload (Multer → local `uploads/`, served statically).
- ✅ **Order lifecycle** (basic): multi-shop order splitting on `create-order`, user/seller/admin order listing, seller status updates, stock decrement on dispatch, 10% service charge + seller balance update on delivery, refund request (user) → refund accept (seller) with stock restore.
- ✅ **Payments**: Stripe PaymentIntent creation (`/api/v2/payment/process`, currency `inr`) + publishable key endpoint; frontend has `@stripe/react-stripe-js` integration; COD supported. (PayPal deps also present.)
- ✅ **Chat**: conversations/messages persisted via backend; real-time delivery via separate socket server (addUser/sendMessage/messageSeen/last-message events).
- ✅ **Reviews & wishlist**: product review endpoint and user wishlist management.
- ✅ **Dashboards**: Shop dashboard (products, orders, events, coupons, messages, withdraw, settings) and Admin dashboard pages exist in frontend.
- ✅ **Responsive UI foundation**: Tailwind + existing component library.

## 3. Issues Found (to fix in later phases)

### Critical / Blocking
1. **No `.env` committed or template** — `backend/config/.env` was missing entirely (created during this audit with dev placeholders). `frontend/src/server.js` hardcodes `localhost:8000`; socket endpoint hardcoded to `http://localhost:4000/` in `DashboardMessages.jsx` & `UserInbox.jsx`.
2. **Empty SMTP (Brevo) + Stripe + Cloudinary credentials** — account activation email will fail at runtime until Brevo creds are added; Stripe/Cloudinary configured but empty.
3. **Admin role can't be assigned** — `role` defaults to `"user"` with no admin-creation/seeding path; nothing creates the first Admin.
4. **Order endpoints unauthenticated** — `get-all-orders`, `get-seller-all-orders`, `create-order`, `order-refund` accept any caller; user identity comes from request body (spoofable). IDs are trusted params rather than `req.user`.
5. **Seller balance bug** (`order.js:updateSellerInfo`) — `seller.availableBalance = amount` **overwrites** the balance instead of incrementing; also uses `req.seller.id` (undefined on a Shop doc).

### Security
6. `bcrypt` **and** `bcryptjs` both installed (redundant; keep one). `js-cookie` also in backend deps (unused).
7. No rate limiting, no helmet/security headers, no input validation layer; CORS origin hardcoded to `localhost:3000`.
8. Registration stores the user's **plaintext password inside the JWT activation token** (5m expiry, but bad practice).
9. Product review endpoint doesn't verify purchase; Multer accepts any file type/size and renames to `.png`.
10. Order/refund/user-info routes skip ownership checks (see #4).

### Functional gaps vs. target requirements
11. **No Google OAuth** login flow.
12. **Payments not end-to-end** — no Stripe webhook, order payment status isn't reconciled with Stripe; currency hardcoded `inr`.
13. **Admin dashboard incomplete** — no seller approval/suspension, product moderation, or platform metrics endpoints beyond list/delete.
14. **Order totals naive** — `totalPrice` trusted from client; coupons/discounts not recomputed server-side; no per-seller subtotal.
15. **Socket server is throwaway** — messages tracked in memory, no auth on socket connection, no Redis adapter (not scalable), duplicate of backend message persistence.
16. **Refund flow doesn't reverse seller balance** or payment (no Stripe refund API call).
17. **No testing whatsoever** — zero unit/integration/e2e tests across all three apps.

### Code quality / housekeeping
18. Frontend: `redux` + `redux-thunk` + `@reduxjs/toolkit` + legacy `redux-toolkit` package (v1.1.2 — should be removed); Material-UI v4 (deprecated) used only for DataGrid; `@paypal/react-paypal-js` present but PayPal is not in the target stack.
19. `default: Date.now()` (invoked) instead of `Date.now` in several models — timestamps frozen at module load; better: `timestamps: true`.
20. Webpack warnings: duplicate `category` keys in `src/static/data.js` (3×), deprecated dev-server middleware hooks, caniuse-lite outdated, babel private-property-in-object warning.
21. README is the original project's — not branded as Vendora, still documents PayPal/Nodemailer/Multer/Heroku.
22. `multer` upload dir `uploads/` was missing (created during audit); no Cloudinary integration despite target stack.
23. Mixed error handling (try/catch + `catchAsyncErrors` double-wrapped); dotenv config loaded twice in `server.js`; `body-parser` redundant alongside `express.json()`.

## 4. Environment Created During This Audit

- `backend/config/.env` — DB_URL (Atlas, provided), dev JWT/activation secrets, placeholders for Brevo SMTP / Stripe / Cloudinary / Google OAuth.
- `backend/uploads/` directory (required by Multer).
- All three `node_modules` installed (frontend with `--legacy-peer-deps` due to MUI v4 peer conflicts).

## 5. Recommended Phase Order (for reference)

1. Branding + env/config hygiene (Vendora rename, `.env.example`, centralize URLs)
2. Auth hardening (Google OAuth, admin seeding, remove plaintext-password tokens, validation)
3. Security pass (helmet, rate limit, ownership checks on orders, upload validation)
4. Cloudinary migration (drop Multer/local uploads)
5. Brevo SMTP activation emails
6. Stripe end-to-end (webhooks, currency, refunds)
7. Order lifecycle hardening (server-side totals, seller balance increment bug)
8. Socket consolidation + scalability
9. Dashboards completion (seller + admin)
10. Testing + README + deployment readiness

## 6. Verification Performed

- `npm install` in all three apps: OK
- Backend `GET /test` → 200 "Hello World!"; `GET /api/v2/product/get-all-products` → 200 `{"success":true,"products":[]}`
- Atlas connection confirmed in server log
- Socket server → "server is running on port 4000"
- Frontend → HTTP 200 on `http://localhost:3000`, webpack compiled (warnings only)

