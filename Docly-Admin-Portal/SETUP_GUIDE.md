# Docly Admin Portal - Setup & Deployment Guide

## Overview

The Docly Admin Portal is a completely separate System Administrator interface for managing doctor verification, viewing system statistics, and handling administrative tasks. It's a fully independent React TypeScript frontend application that communicates with the existing Docly backend API.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Docly Ecosystem                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Docly Public Frontend     Docly Admin Portal                │
│  (Port 3000)               (Port 3001)                       │
│  (Patients + Doctors)      (Administrators Only)             │
│       ↓                            ↓                         │
│       └────────────┬───────────────┘                         │
│                    ↓                                         │
│          Docly Backend API                                   │
│          (Port 5000)                                         │
│                    ↓                                         │
│          MongoDB Atlas (Shared Database)                     │
│          + Cloudinary (Image/Document Storage)               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Admin Portal is a **completely separate frontend application**
- Both frontends share the **same backend API**
- Data is stored in the **same MongoDB database**
- Admin authentication is **independent** from patient/doctor authentication
- Each frontend has its own **Vercel deployment**

## Project Structure

```
Docly-Admin-Portal/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Layout.tsx       # Main layout with sidebar
│   │   └── ProtectedRoute.tsx # Authentication guard
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx    # Admin login
│   │   ├── DashboardPage.tsx # System statistics
│   │   ├── DoctorListPage.tsx # Doctor management
│   │   └── DoctorDetailPage.tsx # Doctor profile & verification
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── services/
│   │   └── adminAPI.ts      # API communication
│   ├── hooks/
│   │   ├── useAsync.ts      # Async operations
│   │   └── useForm.ts       # Form state management
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App TypeScript configuration
├── package.json             # Dependencies
├── .env.example             # Environment variable template
├── .env                     # Local environment variables
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## Backend Setup

### Backend Changes Required

New endpoints were added to the existing Docly backend to support the Admin Portal. These are in addition to the existing admin endpoints.

#### New Controller: `adminPortalController.ts`

Located at: `backend/src/controllers/adminPortalController.ts`

**Functions:**
- `adminLogin()` - Admin-specific authentication
- `getAdminStatistics()` - Dashboard statistics
- `getAdminDoctors()` - List doctors with filters
- `getAdminDoctorById()` - Get single doctor profile
- `updateDoctorVerification()` - Approve/Reject/Request Changes

#### New Routes: `adminPortalRoutes.ts`

Located at: `backend/src/routes/adminPortalRoutes.ts`

All admin routes are protected with the `protect` middleware and require valid JWT authentication.

**Endpoints:**
```
GET    /api/admin/statistics              - Dashboard statistics
GET    /api/admin/doctors                 - List doctors with filters
GET    /api/admin/doctors/:id             - Get single doctor
PUT    /api/admin/doctors/:id/verify      - Update verification status
POST   /api/auth/admin-login              - Admin login
```

#### Updated Files

- `backend/src/controllers/authController.ts` - Added `adminLogin` function
- `backend/src/routes/authRoutes.ts` - Added admin-login route
- `backend/src/routes/index.ts` - Registered adminPortalRoutes

#### DoctorProfile Model Extension

The existing `DoctorProfile` model needs the following fields (may need migration):

```typescript
verificationMessage?: string;      // Admin feedback message
verificationUpdatedAt?: Date;      // When verification was last updated
```

If these fields don't exist, add them to the schema:

```typescript
verificationMessage: {
  type: String,
  default: '',
},
verificationUpdatedAt: {
  type: Date,
  default: null,
},
```

## Frontend Setup

### Local Development

1. **Install dependencies:**
   ```bash
   cd Docly-Admin-Portal
   npm install
   ```

2. **Create `.env` file from `.env.example`:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_ADMIN_USERNAME=admin
   VITE_ADMIN_PASSWORD=admin123
   VITE_ADMIN_JWT_SECRET=admin_jwt_secret_dev
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The Admin Portal will run on `http://localhost:3001`

5. **Ensure backend is also running:**
   ```bash
   cd ../backend
   npm run dev
   ```
   
   Backend runs on `http://localhost:5000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready for Vercel deployment.

### Type Check

```bash
npm run typecheck
```

## Authentication Flow

### Admin Login

```
Admin Portal Login Page
        ↓
User enters username & password
        ↓
POST /api/auth/admin-login
        ↓
Backend validates credentials against environment variables:
- ADMIN_USERNAME
- ADMIN_PASSWORD
        ↓
Backend returns JWT token and admin user object
        ↓
Token stored in localStorage
        ↓
User redirected to Dashboard
        ↓
All subsequent requests include token in Authorization header
```

### Protected Routes

Every admin route except `/login` requires valid authentication:

1. User must have valid JWT token in `localStorage`
2. Token is included in `Authorization: Bearer <token>` header
3. Backend validates token on every request
4. If token is invalid/expired, user is redirected to login

## Environment Variables

### Frontend (.env)

```env
# Base URL for the Docly backend API
VITE_API_URL=http://localhost:5000/api

# Admin credentials (for local development only)
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123

# Admin JWT Secret
VITE_ADMIN_JWT_SECRET=admin_jwt_secret_dev

# For production:
# VITE_API_URL=https://your-docly-backend.vercel.app/api
```

### Backend (.env)

Update the backend `.env` with admin credentials:

```env
# Admin credentials for Admin Portal
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password_here
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@docly.com
ADMIN_JWT_SECRET=your_jwt_secret_here

# Keep all existing variables...
```

**⚠️ IMPORTANT: Never commit real credentials to git. Use `.env` locally and set via environment variables in production.**

## CORS Configuration

The existing backend CORS configuration needs to allow the Admin Portal URL.

Update `backend/src/app.ts` or wherever CORS is configured:

```typescript
const allowedOrigins = [
  'http://localhost:3000',    // Public frontend (dev)
  'http://localhost:3001',    // Admin portal (dev)
  'https://docly.vercel.app', // Public frontend (prod)
  'https://docly-admin-portal.vercel.app', // Admin portal (prod)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
```

## Deployment

### Vercel Deployment Steps

#### 1. Deploy Public Frontend (existing Docly)

1. Create/connect Docly public frontend repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set environment variables
4. Deploy

#### 2. Deploy Admin Portal

1. Navigate to Admin Portal folder
2. Create new Vercel project (separate from public frontend)
3. Connect to repository or upload files
4. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `Docly-Admin-Portal`
5. Set environment variables:
   ```
   VITE_API_URL=https://your-docly-backend.vercel.app/api
   ```
6. Deploy

#### 3. Update Backend CORS

After deployment, update backend `.env`:

```env
CLIENT_ORIGIN=https://docly.vercel.app,https://docly-admin-portal.vercel.app
```

#### 4. Verify SPA Routing

Ensure Vercel handles SPA routing for both frontends. Create/update `vercel.json` in each frontend root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Testing Checklist

### Admin Authentication
- [ ] Admin can login with correct credentials
- [ ] Admin cannot login with incorrect credentials
- [ ] Invalid credentials show error message
- [ ] Admin is redirected to dashboard after successful login
- [ ] Admin can logout
- [ ] Unauthenticated users cannot access protected routes
- [ ] Unauthenticated users are redirected to login

### Dashboard
- [ ] Dashboard loads and displays statistics
- [ ] Doctor counts are accurate (Total, Pending, Approved, Rejected)
- [ ] Patient count is accurate
- [ ] Appointment statistics are displayed
- [ ] Quick action links work

### Doctor Management
- [ ] Doctor list loads and displays all doctors
- [ ] Search functionality works by name/email
- [ ] Filter by verification status works
- [ ] Filter by specialty works
- [ ] Filter by location works
- [ ] Clicking doctor opens detail page
- [ ] Doctor information displays correctly

### Doctor Verification
- [ ] Pending doctors appear in list and detail view
- [ ] Admin can approve a pending doctor
- [ ] Admin can reject a doctor and provide reason
- [ ] Admin can request changes from doctor
- [ ] Doctor status updates immediately after action
- [ ] Approved doctors appear as "Approved" (verified)
- [ ] Rejected doctors appear as "Rejected"
- [ ] Doctor receives admin message

### Doctor Feedback
- [ ] Rejected doctors see admin reason on their dashboard
- [ ] Doctor can re-submit profile after "request changes"
- [ ] Profile submission changes status back to "Pending"
- [ ] Admin can review updated profile

### Integration with Public Site
- [ ] Patient login still works
- [ ] Doctor login still works
- [ ] Google authentication still works
- [ ] Only approved doctors appear in patient search
- [ ] Appointment booking still works
- [ ] Existing dashboards still function
- [ ] Jitsi video consultations still work
- [ ] Cloudinary uploads still work

### Performance & UX
- [ ] Pages load within acceptable time
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Empty states are displayed when no data
- [ ] Mobile responsive layout works
- [ ] Sidebar navigation works on mobile
- [ ] All icons display correctly
- [ ] Colors and styling are professional

### Production Deployment
- [ ] Admin Portal builds without errors
- [ ] Production build runs locally without errors
- [ ] Vercel deployment is successful
- [ ] Admin Portal is accessible at production URL
- [ ] Login works in production
- [ ] API calls work with production backend URL
- [ ] No console errors in browser
- [ ] Credentials are not exposed in bundle
- [ ] CORS errors do not occur
- [ ] Page refresh on any route works (SPA routing configured)

### Security
- [ ] Admin credentials are not hardcoded
- [ ] JWT token is properly validated
- [ ] Unauthorized users cannot access admin endpoints
- [ ] Admin endpoints return 401 for missing/invalid tokens
- [ ] API calls include authorization header
- [ ] Sensitive data is not logged
- [ ] Passwords are never shown in frontend code

## Common Issues & Solutions

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Verify `VITE_API_URL` is correct
2. Check backend CORS configuration allows your frontend URL
3. For local dev, Vite proxy should handle this automatically
4. Clear browser cache and restart dev server

### Login Always Fails

**Check:**
1. Backend is running on correct port
2. `VITE_API_URL` matches backend URL
3. Admin credentials in `.env` match backend `.env`
4. Network tab in DevTools shows request and response
5. Backend error logs for more details

### Port Already in Use

**Solution:**
Change port in `vite.config.ts`:
```typescript
server: {
  port: 3002,  // Change to available port
  strictPort: true,
}
```

### Types Not Recognized

**Solution:**
```bash
npm run typecheck
```

If still failing, ensure `tsconfig.json` and `tsconfig.app.json` are correct.

### API Calls Return 401

**Causes:**
1. Token expired or invalid
2. Backend JWT secret doesn't match
3. User role is not admin

**Solutions:**
1. Clear localStorage and re-login
2. Verify JWT_SECRET in backend `.env`
3. Check backend validation logic

## File Summary

### New Files Created

**Frontend (Docly-Admin-Portal):**
```
src/
  App.tsx
  main.tsx
  index.css
  components/
    Layout.tsx
    ProtectedRoute.tsx
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    DoctorListPage.tsx
    DoctorDetailPage.tsx
  context/
    AuthContext.tsx
  services/
    adminAPI.ts
  hooks/
    useAsync.ts
    useForm.ts
    index.ts
  types/
    index.ts

Root:
  .env
  .env.example
  .gitignore
  index.html
  package.json
  tsconfig.json
  tsconfig.app.json
  vite.config.ts
  README.md
  SETUP_GUIDE.md (this file)
```

**Backend:**
```
src/
  controllers/
    adminPortalController.ts (new)
  routes/
    adminPortalRoutes.ts (new)
  
Modified:
  controllers/authController.ts (added adminLogin)
  routes/authRoutes.ts (added admin-login route)
  routes/index.ts (registered adminPortalRoutes)
```

### Modified Files

**Backend Files:**
- `src/controllers/authController.ts` - Added `adminLogin` export
- `src/routes/authRoutes.ts` - Added admin-login endpoint
- `src/routes/index.ts` - Imported and registered adminPortalRoutes

**Potentially Needed:**
- Backend `.env` - Add admin credentials
- `src/models/DoctorProfile.ts` - May need to add verificationMessage and verificationUpdatedAt fields
- Backend CORS configuration - Add Admin Portal URL to allowed origins

## Next Steps

1. **Update Backend:**
   - Review and test new admin endpoints
   - Add admin credentials to `.env`
   - Update CORS if needed
   - Test backend changes

2. **Local Testing:**
   - Run both frontend and backend locally
   - Test complete admin workflow
   - Verify data consistency

3. **Deploy:**
   - Deploy backend first
   - Deploy Admin Portal to separate Vercel project
   - Update backend CORS with production URLs
   - Update frontend environment variables

4. **Monitoring:**
   - Monitor logs for errors
   - Set up error tracking (Sentry, etc.)
   - Monitor admin actions for security audit trail (optional)

## Support & Maintenance

### Admin Portal Features

The Admin Portal provides:
- Secure admin authentication
- System statistics dashboard
- Doctor management and verification
- Search and filtering capabilities
- Feedback mechanism for doctors
- Professional, minimalistic UI
- Mobile-responsive design
- Separate deployment from public site

### Future Enhancements

Potential features for future versions:
- Admin activity audit logs
- Batch doctor verification
- Doctor document management
- Patient dispute resolution
- System health monitoring
- Admin user management
- Role-based admin access
- Export/reporting capabilities

## Questions?

Refer to:
1. Main `README.md` for Admin Portal documentation
2. Backend `README.md` for backend information
3. Docly frontend `README.md` for public site documentation

---

**Last Updated:** 2026-08-29
**Version:** 1.0.0
