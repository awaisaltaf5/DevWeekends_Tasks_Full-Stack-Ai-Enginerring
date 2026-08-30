# Docly

Docly is a full-stack doctor booking and telemedicine platform. Patients discover doctors and book in-person or video consultations, doctors manage their practice, and administrators operate the platform from a protected dashboard.

## Features

- Doctor discovery with search, location, specialty, fee, rating, experience, and pagination filters
- Appointment booking with availability validation and MongoDB double-booking protection
- Video consultations with appointment-specific Jitsi rooms and server-generated tokens
- Patient medical record uploads and permission-aware access
- Doctor dashboard for profile, availability, appointments, patients, and notes
- Admin dashboard for metrics, doctor verification, user access, appointments, and specialty CRUD
- MongoDB in-app notifications for appointment and account events
- Brevo SMTP email notifications with reusable booking, cancellation, status, and approval templates
- Responsive healthcare UI with loading, empty, error, confirmation, focus, and reduced-motion states

## User Roles

| Role | Capabilities |
| --- | --- |
| Patient | Discover doctors, book/cancel appointments, join consultations, manage records and prescriptions |
| Doctor | Maintain profile and availability, manage appointments, update statuses, write notes and prescriptions |
| Admin | View platform metrics, approve/reject doctors, manage users, appointments, and specialties |

Admin registration is disabled. Create an admin with `npm run seed:admin` and the `ADMIN_*` variables.

## Technology Stack

- Frontend: React 19, Vite, TypeScript, React Router, Axios, Tailwind CSS, Lucide React
- Backend: Node.js, Express 5, TypeScript, Mongoose, MongoDB Atlas, JWT, bcryptjs
- Integrations: Jitsi as a Service, Brevo SMTP/Nodemailer, Cloudinary, Nominatim, optional Unsplash
- Tooling: npm, tsx, strict TypeScript builds

## Architecture

```text
Docly/
├── frontend/src/
│   ├── components/       reusable layout, auth, dashboard, doctor, record and UI components
│   ├── pages/            route-level patient, doctor, video and admin screens
│   ├── services/         typed Axios API clients
│   ├── context/          authentication state
│   └── types/            shared frontend DTOs
├── backend/src/
│   ├── config/           environment and database configuration
│   ├── controllers/      request handlers, including adminController
│   ├── middleware/       JWT protection, role authorization, uploads and errors
│   ├── models/           users, doctors, specialties, appointments, records, prescriptions, notifications
│   ├── routes/           feature routers mounted under /api
│   ├── services/         availability, email, Jitsi, notifications and domain services
│   └── scripts/          seed, admin seed, smoke and auth verification
└── README.md
```

## Installation

Prerequisites: Node.js 20+, npm, and a MongoDB Atlas database.

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run seed:admin
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The default development URLs are `http://localhost:5000` for the API and `http://localhost:3000` for the frontend.

## Environment Variables

Never commit `.env` files or real credentials.

```env
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

ADMIN_NAME=<admin name>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin password>

JITSI_APP_ID=<JaaS application ID>
JITSI_APP_SECRET=<JaaS application secret>
JITSI_DOMAIN=8x8.vc

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<Brevo SMTP login>
SMTP_PASS=<Brevo SMTP key>
EMAIL_FROM=Docly <verified sender>

CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
UNSPLASH_ACCESS_KEY=<optional>
```

Brevo SMTP is preferred when configured. Resend remains supported as an optional fallback through `RESEND_API_KEY`. Email failures are logged and never interrupt appointment requests.

## API Overview

All protected requests use `Authorization: Bearer <JWT>`.

| Area | Endpoints | Access |
| --- | --- | --- |
| Health/auth | `/api/health`, `/api/auth/register`, `/api/auth/login`, `/api/auth/me` | Public/authenticated |
| Discovery | `/api/doctors`, `/api/doctors/:id`, `/api/specialties`, `/api/location/search` | Public |
| Appointments | `/api/appointments`, `/api/appointments/me`, `/api/appointments/:id/cancel`, `/api/appointments/:id/status` | Patient/doctor |
| Video | `/api/video/:appointmentId` | Attending patient/doctor |
| Doctor workspace | `/api/doctor/*` | Doctor |
| Medical | `/api/medical-records/*`, `/api/prescriptions/*` | Permission-aware |
| Notifications | `/api/notifications`, `/api/notifications/read` | Authenticated |
| Admin dashboard | `/api/admin/dashboard` | Admin |
| Admin doctors/users | `/api/admin/doctors/*`, `/api/admin/users/*` | Admin |
| Admin operations | `/api/admin/appointments/*`, `/api/admin/specialties/*` | Admin |

Every `/api/admin` route applies both JWT authentication and `authorize('admin')`.

## Testing and Verification

```bash
cd backend
npm run typecheck
npm run build
npm run smoke
npm run test:auth

cd ../frontend
npm run typecheck
npm run build
```

The auth integration test requires a working MongoDB connection. Manual acceptance coverage includes registration, login/logout, role guards, doctor discovery filters and pagination, booking/double-booking protection, status changes, cancellation, records, doctor availability/dashboard, admin approval, user management, and specialty CRUD.

## Screenshots

Add production screenshots here:

- `docs/screenshots/patient-discovery.png`
- `docs/screenshots/doctor-dashboard.png`
- `docs/screenshots/admin-dashboard.png`
- `docs/screenshots/video-consultation.png`

## Deployment

Deployment is environment-specific. Build both applications with the commands above, provision MongoDB Atlas, configure production secrets in the hosting provider, set `CLIENT_ORIGIN` and `CLIENT_URL` to the deployed frontend, and configure a verified Brevo sender plus Jitsi production credentials. Deploy the backend as a Node service and the frontend as a static Vite application. Add health monitoring for `/api/health`.
