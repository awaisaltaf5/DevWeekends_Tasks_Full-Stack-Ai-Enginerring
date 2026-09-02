# Vendora 🛍️

**Vendora** is a complete, production-quality **multi-vendor e-commerce platform** built on the MERN stack. Buyers discover products from independent sellers, sellers run their own storefronts with full product/order management, and admins oversee the entire marketplace — all with secure payments, real-time chat and a responsive, professional UI.

## Features

### 🛒 Buyer
- Browse, search and filter products & events; product details with reviews & ratings
- Cart, wishlist, coupons, saved addresses and responsive checkout
- **Stripe** card payments (server-computed amounts, verified PaymentIntents) **and** Cash on Delivery
- Order history with live status tracking; refund requests
- Real-time messaging with sellers (Socket.IO)
- Email/password **and Google OAuth** login

### 🏪 Seller
- Shop creation with activation email; seller dashboard (KPIs, charts, recent orders)
- Full product & event CRUD with **Cloudinary** image hosting
- Order management and status updates (Processing → Shipped → Delivered)
- Earnings tracking and withdrawal requests (reviewed by admin)
- Shop settings, inbox with real-time chat

### 🛡️ Admin
- Platform dashboard: statistics, earnings and recent activity feed
- Manage users, sellers (suspend/activate), products, events and orders
- Review/approve seller withdrawal requests
- Content moderation: delete inappropriate products/events (with image cleanup)
- Strict admin-only API authorization

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (CRA), Redux Toolkit, Tailwind CSS, Material-UI (DataGrid), Socket.IO client |
| Backend | Node.js, Express |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT (httpOnly cookies) + Google OAuth |
| Payments | Stripe (PaymentIntents + webhooks) + Cash on Delivery |
| Images | Cloudinary |
| Email | Brevo SMTP |
| Real-time | Socket.IO |

## Architecture

```
vendora/
├── backend/          # Express API (port 8000) — REST under /api/v2
│   ├── controller/   # user, shop, product, event, order, payment, admin, withdraw, message, conversation, coupon
│   ├── model/        # Mongoose schemas (User, Shop, Product, Event, Order, ...)
│   ├── middleware/   # JWT auth + role guards (isAuthenticated, isSeller, isAdmin)
│   ├── config/       # .env (never committed) + cloudinary config
│   └── utils/        # sendMail (Brevo), email templates, token helpers
├── socket/           # Socket.IO server (port 4000) — real-time chat presence
├── frontend/         # React SPA (port 3000)
│   ├── components/   # Layout, Shop (seller), Admin, Products, Checkout, ...
│   ├── redux/        # slices + async thunks (axios, withCredentials)
│   └── pages/        # route views
└── README.md
```

## Environment Variables

All three apps read `.env` files. **Copy each `.env.example` to `.env` and fill in your own values.** Never commit real secrets; never expose backend secrets to the frontend.

### `backend/config/.env`
| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | API port (default 8000) |
| `NODE_ENV` | `development` / `production` (controls cookie security) |
| `JWT_SECRET`, `JWT_EXPIRES` | JWT signing for user & seller sessions |
| `ACTIVATION_SECRET` | Signs account/shop activation tokens |
| `CLIENT_URL` | Frontend origin — used for CORS and email links |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Brevo SMTP credentials |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary image hosting (server-side only) |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY` | Stripe payments (secret key server-side only) |
| `GOOGLE_CLIENT_ID` | Google OAuth (server-side token verification) |

### `frontend/.env` (public values only)
| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_SOCKET_URL` | Socket.IO server URL |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth client ID (public) |

### `socket/.env`
| Variable | Purpose |
|---|---|
| `PORT` | Socket server port (default 4000) |
| `CLIENT_URL` | Allowed CORS origin |

## Getting Started

### 1. Prerequisites
- Node.js ≥ 18 and npm
- A MongoDB Atlas cluster
- Accounts/keys: Cloudinary, Brevo, Stripe, Google Cloud (OAuth)

### 2. Environment setup
```bash
cp backend/config/.env.example backend/config/.env
cp frontend/.env.example frontend/.env
cp socket/.env.example socket/.env
# then edit each .env with your credentials
```

### 3. Install & run
```bash
# Terminal 1 — backend
cd backend && npm install && npm start

# Terminal 2 — socket server
cd socket && npm install && npm start

# Terminal 3 — frontend
cd frontend && npm install && npm start
```

Open http://localhost:3000. API runs at http://localhost:8000, socket at ws://localhost:4000.

## Service Setup Guides

### MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Add a database user and allow your IP under Network Access.
3. Copy the connection string into `MONGODB_URI` (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/vendora`).

### Cloudinary (images)
1. Create a free account at [cloudinary.com](https://cloudinary.com) → Dashboard.
2. Copy **Cloud name / API key / API secret** into the `CLOUDINARY_*` variables.
3. Uploads happen **only through the backend**; MongoDB stores the returned URLs. Deleting products/events/messages also deletes their Cloudinary assets.

### Brevo SMTP (email)
1. Create an account at [brevo.com](https://brevo.com) → SMTP & API → SMTP.
2. Copy the host (`smtp-relay.brevo.com`), port (`587`), user and key into `SMTP_*`.
3. Set `EMAIL_FROM` to a verified sender address. Used for activation, order confirmation and admin notification emails.

### Stripe (payments)
1. Get keys from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) → `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`.
2. Add a webhook endpoint (Dashboard → Developers → Webhooks) pointing to `https://<your-domain>/api/v2/payment/webhook` subscribed to `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` → copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Amounts are always recomputed server-side from MongoDB prices; orders are marked paid only after Stripe verification (confirmed PaymentIntent or verified webhook).

### Google OAuth
1. In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials, create an **OAuth Client ID** (Web application).
2. Add your frontend origin to Authorized JavaScript origins.
3. Put the client ID in `GOOGLE_CLIENT_ID` (backend) and `REACT_APP_GOOGLE_CLIENT_ID` (frontend). The ID token is verified server-side — no client secret is needed for this flow.

## Testing

Run the automated backend test suites (each prints a PASS/FAIL summary):

```bash
cd backend
node testStripe.js       # payment flow, auth gates, order lifecycle (14 checks)
node testAdmin.js        # admin authorization, role restrictions (20 checks)
node testCloudinary.js   # uploads, display, deletion, email, Google route
```

The frontend production build is verified with `npm run build` in `frontend/`.

## Deployment

- **Frontend (Vercel):** import the repo, set Root Directory to `frontend`, build command `npm run build`, output `build`. Add the `REACT_APP_*` vars in Project Settings → Environment Variables.
- **Backend (Render/Railway/Vercel):** start command `node server.js` with Root Directory `backend`. Add all backend variables **including `NODE_ENV=production` and `CLIENT_URL`** set to the deployed frontend URL.
- **Socket server:** deploy as a second service (`socket/`, start `node index.js`), then point `REACT_APP_SOCKET_URL` at it.
- **Stripe webhook:** update the webhook endpoint URL to the deployed backend and keep `STRIPE_WEBHOOK_SECRET` in sync.
- **Cookies:** with `NODE_ENV=production` the auth cookies are sent `secure` + `sameSite:none`, so the frontend must be served over HTTPS and `CLIENT_URL` must match exactly.

## Security Notes

- All secrets live in environment files that are **git-ignored**; only `.env.example` templates are committed.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_API_SECRET` and SMTP credentials are **backend-only** — the frontend only ever receives the publishable Stripe key and the public Google client ID.
- Payments are never trusted from the client: prices are recomputed server-side, PaymentIntents are re-verified before order creation, and webhooks are signature-checked.
- Admin APIs sit behind JWT authentication **and** a role guard; buyers/sellers receive `401/403` regardless of frontend routes.
- Passwords are bcrypt-hashed; sessions use httpOnly JWT cookies with environment-aware `sameSite`/`secure` flags.
- Uploads are validated (image types, size limits) and streamed to Cloudinary — nothing is written to the server disk.

## License

MIT
