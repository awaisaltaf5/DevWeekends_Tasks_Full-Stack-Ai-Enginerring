# Docly Admin Portal

A completely separate System Administrator portal for the Docly healthcare platform. This is a dedicated frontend application for system administrators to manage doctor verification, view system statistics, and handle administrative tasks.

## Features

- **Admin Authentication**: Secure login with admin credentials (separate from patient/doctor authentication)
- **Dashboard**: System statistics including doctor counts, appointment metrics, and more
- **Doctor Management**: View, search, and filter all doctors by specialty, location, and verification status
- **Doctor Verification Workflow**: 
  - Approve doctors
  - Reject doctors with feedback
  - Request changes from doctors
- **Doctor Profiles**: View complete doctor information including qualifications, clinic details, and uploaded documents
- **Secure Access**: All admin routes are protected; unauthenticated users cannot access the portal

## Architecture

The Admin Portal communicates with the existing Docly backend API:

```
Docly Admin Portal (This App)
        ↓
Docly Backend API
        ↓
MongoDB Atlas
        ↓
Cloudinary (for document uploads)
```

The Admin Portal uses the **same backend** and **same database** as the public Docly website, ensuring data consistency.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (Login, Dashboard, Doctor List, etc.)
├── context/            # React Context for authentication
├── services/           # API communication with backend
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docly backend running locally or accessible via API

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123
VITE_ADMIN_JWT_SECRET=your_secret_here
```

### Development

Start the development server:
```bash
npm run dev
```

The Admin Portal will run on `http://localhost:3001` (separate from the public frontend on port 3000).

### Build for Production

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

## API Endpoints Used

The Admin Portal communicates with the backend via these endpoints:

- **Authentication**: `POST /api/auth/admin-login` - Admin login
- **Doctor List**: `GET /api/admin/doctors` - Get all doctors with filters
- **Doctor Profile**: `GET /api/admin/doctors/:id` - Get single doctor details
- **Doctor Verification**: `PUT /api/admin/doctors/:id/verify` - Approve/Reject/Request Changes
- **Statistics**: `GET /api/admin/statistics` - Dashboard statistics

## Environment Variables

### Frontend-safe Variables (prefixed with `VITE_`)

- `VITE_API_URL`: Backend API base URL
- `VITE_ADMIN_USERNAME`: Admin username for local login
- `VITE_ADMIN_PASSWORD`: Admin password for local login (never commit to production)
- `VITE_ADMIN_JWT_SECRET`: Secret used to generate/verify admin JWT tokens

**Important**: Never expose sensitive secrets in frontend code. Backend keeps actual secrets secure.

## Authentication

The Admin Portal uses JWT-based authentication:

1. Admin enters credentials on the login page
2. Credentials are validated against the backend
3. Backend returns a JWT token
4. Token is stored in localStorage
5. All subsequent requests include the token in the Authorization header
6. Backend validates the token and checks admin role

## Security Considerations

1. **No Public Signup**: There is no admin signup form. Admin accounts are created via backend scripts.
2. **Separate Credentials**: Admin authentication is completely separate from patient/doctor authentication.
3. **Protected Routes**: Every admin route requires valid authentication.
4. **Backend Validation**: All authorization is enforced server-side, not on the frontend.
5. **Secure Token Storage**: JWT tokens are stored in localStorage (production apps may use more secure methods).
6. **CORS**: Backend CORS is configured to allow requests only from authorized frontend origins.

## Testing Checklist

### Admin Authentication
- [ ] Admin login with valid credentials
- [ ] Admin login with invalid credentials
- [ ] Admin logout
- [ ] Protected admin routes redirect to login
- [ ] Unauthorized users cannot access admin endpoints

### Doctor Management
- [ ] View list of all doctors
- [ ] View pending doctors only
- [ ] Search doctors by name/email
- [ ] Filter doctors by specialty
- [ ] Filter doctors by location
- [ ] Filter doctors by verification status
- [ ] Open individual doctor profile
- [ ] View doctor qualifications
- [ ] View uploaded documents

### Doctor Verification
- [ ] Approve a pending doctor
- [ ] Reject a doctor with reason
- [ ] Request changes from doctor
- [ ] Doctor receives admin message on their dashboard
- [ ] Doctor can update profile and resubmit
- [ ] Updated doctor status changes to pending

### Integration with Existing Docly
- [ ] Patient login still works
- [ ] Doctor login still works
- [ ] Doctor search on public site still works
- [ ] Only verified doctors appear in patient search
- [ ] Appointment booking still works
- [ ] Existing dashboards still function
- [ ] Cloudinary uploads work

### Deployment
- [ ] Admin Portal builds without errors
- [ ] Production build works locally
- [ ] Can deploy to Vercel as separate project
- [ ] Admin Portal has separate URL from public site
- [ ] Backend CORS allows Admin Portal URL
- [ ] No secrets exposed in production bundle

## Deployment

### Vercel Deployment

The Admin Portal is deployed as a **completely separate Vercel project** from the public Docly frontend.

1. Create a new Vercel project
2. Connect this repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set environment variables in Vercel project settings
5. Deploy

### Example Deployment URLs

- **Public Docly Frontend**: `https://docly.vercel.app`
- **Docly Admin Portal**: `https://docly-admin-portal.vercel.app`
- **Docly Backend API**: `https://docly-backend.vercel.app`

## Troubleshooting

### CORS Errors

If you see CORS errors when trying to access the backend:

1. Verify `VITE_API_URL` is correct
2. Check backend CORS configuration includes your Admin Portal URL
3. For local development, the vite proxy should handle this automatically

### Login Issues

1. Verify backend is running on the correct port
2. Check admin credentials in `.env` match backend configuration
3. Verify network request in browser DevTools

### Port Already in Use

If port 3001 is already in use, modify `vite.config.ts`:
```typescript
server: {
  port: 3002, // Change to different port
  strictPort: true,
}
```

## Contributing

When contributing to the Admin Portal:

1. Keep the UI minimalistic and professional
2. Maintain TypeScript types for all components
3. Use Tailwind CSS for styling
4. Use Lucide React icons
5. Add proper error handling and loading states
6. Do not break existing Docly functionality

## License

Same as Docly main project.
