# Docly

> **Care, connected.** A full-stack doctor discovery, appointment booking, and telemedicine platform built to make healthcare access feel less fragmented.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](frontend/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white)](backend/package.json)
[![Express](https://img.shields.io/badge/API-Express_5-111827?logo=express&logoColor=white)](backend/package.json)
[![MongoDB](https://img.shields.io/badge/Data-MongoDB_Atlas-47a248?logo=mongodb&logoColor=white)](backend/package.json)

## Why Docly?

Finding the right doctor, confirming availability, sharing medical context, and joining a remote consultation often means moving between disconnected tools. Docly brings that journey into one role-aware workspace:

**Discover a doctor -> book a time -> receive updates -> meet securely -> continue care.**

Patients get a clear path to care. Doctors get a focused practice workspace. Admins get the operational visibility needed to keep the platform trustworthy.

## What It Solves

- **Scattered discovery:** Search doctors by specialty, location, fee, rating, and experience from one place.
- **Booking friction:** Validate availability and protect appointments from double booking before confirmation.
- **Disconnected consultations:** Generate appointment-specific video rooms with Jitsi and let authorized attendees join from the appointment flow.
- **Missing context:** Keep permission-aware medical records, prescriptions, doctor notes, and notifications connected to the care journey.
- **Operational blind spots:** Give administrators tools for doctor verification, user access, platform metrics, appointments, and specialty management.

## Product Highlights

### For patients

- Browse and filter verified doctor profiles.
- Book, review, and cancel appointments.
- Join in-person or video consultations.
- Upload medical records and view prescriptions shared with them.
- Receive in-app and email updates about important appointment events.

### For doctors

- Build a professional profile with specialties, fees, experience, and availability.
- Manage upcoming appointments and update their status.
- Review patient context, add notes, and issue prescriptions.
- Access a dashboard designed around the daily practice workflow.

### For administrators

- Review and approve doctor applications.
- Monitor platform metrics and appointment activity.
- Manage users, specialties, and operational access from protected routes.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript, React Router 7, Axios, Tailwind CSS 4, Lucide React |
| Backend | Node.js, Express 5, TypeScript, Mongoose, REST API |
| Data and security | MongoDB Atlas, JWT, bcryptjs, role-based authorization, request validation |
| Integrations | Jitsi as a Service, Brevo SMTP/Nodemailer, Resend fallback, Cloudinary, Nominatim, optional Unsplash |
| Developer experience | root npm orchestration scripts, `tsx`, strict TypeScript builds, smoke and auth-flow scripts |

## Architecture

```text
Docly/
├── frontend/src/
│   ├── components/       reusable UI, auth, layout, doctor, dashboard and record components
│   ├── pages/             patient, doctor, video and admin screens
│   ├── services/          typed Axios API clients
│   ├── context/           authentication state
│   └── types/             frontend DTOs and domain types
├── backend/src/
│   ├── controllers/       feature-specific request handlers
│   ├── middleware/        auth, roles, uploads and error handling
│   ├── models/            users, doctors, appointments, records and notifications
│   ├── routes/             REST routers mounted under /api
│   ├── services/           availability, email, video, notifications and domain logic
│   └── scripts/            seed, admin seed, smoke and auth verification
└── README.md
```

The backend keeps authentication, authorization, validation, controllers, and domain services separate. This makes sensitive workflows such as appointment access, medical records, and admin operations easier to reason about and extend.

## Quick Start

### Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB Atlas database

### 1. Configure the API

```powershell
cd backend
npm install
copy .env.example .env
npm run seed
npm run seed:admin
npm run dev
```

### 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

The default development URLs are:

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

Admin registration is disabled by design. Use `npm run seed:admin` with the `ADMIN_*` variables to create an administrator.

## Configuration

Never commit `.env` files or real credentials. The complete templates are available at [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example).

The backend configuration covers:

- MongoDB and JWT authentication
- Frontend origin and API port
- Seeded admin credentials
- Jitsi application credentials
- Brevo SMTP or Resend email delivery
- Optional Cloudinary uploads and Unsplash imagery

Brevo SMTP is preferred when configured. Email failures are logged without interrupting appointment requests.

## API Surface

Protected requests use `Authorization: Bearer <JWT>`.

| Area | Representative endpoints | Access |
| --- | --- | --- |
| Health and auth | `/api/health`, `/api/auth/register`, `/api/auth/login`, `/api/auth/me` | Public/authenticated |
| Doctor discovery | `/api/doctors`, `/api/doctors/:id`, `/api/specialties`, `/api/location/search` | Public |
| Appointments | `/api/appointments`, `/api/appointments/me`, `/api/appointments/:id/cancel` | Patient/doctor |
| Video consultations | `/api/video/:appointmentId` | Attending patient/doctor |
| Doctor workspace | `/api/doctor/*` | Doctor |
| Medical care | `/api/medical-records/*`, `/api/prescriptions/*` | Permission-aware |
| Notifications | `/api/notifications`, `/api/notifications/read` | Authenticated |
| Administration | `/api/admin/*` | Admin |

Every admin route applies both JWT authentication and the `admin` role guard.

## Verification

Run the full local checks from the repository root:

```powershell
npm run typecheck
npm run build
```

For backend workflow checks:

```powershell
cd backend
npm run smoke
npm run test:auth
```

The auth integration test requires a working MongoDB connection. The verification scripts cover registration, login, role guards, discovery filters, appointment protection, cancellation, records, doctor availability, admin approval, and specialty management.

## Roadmap

- Add production screenshots and a hosted demo link.
- Expand automated integration coverage for medical-record permissions and appointment edge cases.
- Add richer appointment reminders and calendar integrations.
- Improve observability with structured audit events for sensitive administrative actions.

## Deployment Notes

Build the backend as a  Node service and the frontend as a static Vite application. Provision MongoDB Atlas, configure production secrets, set `CLIENT_ORIGIN` and `CLIENT_URL` to the deployed frontend, and provide production Jitsi credentials plus a verified email sender. Monitor `/api/health` after deployment .

## License

This project is currently distributed without a public license. Add a license before publishing it for external reuse.
