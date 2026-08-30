# Docly Admin Portal - Quick Reference

## 🚀 Quick Start (5 minutes)

### Backend Setup
```bash
cd Docly/backend
npm install
# Edit .env - add:
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=admin123
# ADMIN_NAME=System Administrator
# ADMIN_EMAIL=admin@docly.com
npm run dev
```

### Admin Portal Setup
```bash
cd Docly-Admin-Portal
npm install
npm run dev
# Portal runs at http://localhost:3001
```

### Login Credentials (Local)
- **Username:** admin
- **Password:** admin123

---

## 📁 Key Files

### Frontend Core
| Path | Purpose |
|------|---------|
| `src/App.tsx` | Main app routing |
| `src/context/AuthContext.tsx` | Authentication state |
| `src/services/adminAPI.ts` | Backend API client |
| `src/pages/LoginPage.tsx` | Login interface |
| `src/pages/DashboardPage.tsx` | Statistics dashboard |
| `src/pages/DoctorListPage.tsx` | Doctor list |
| `src/pages/DoctorDetailPage.tsx` | Doctor profile & verification |

### Backend Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/admin-login` | POST | Admin login |
| `/api/admin/statistics` | GET | Dashboard stats |
| `/api/admin/doctors` | GET | List doctors |
| `/api/admin/doctors/:id` | GET | Doctor detail |
| `/api/admin/doctors/:id/verify` | PUT | Update verification |

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123

# Backend (add to existing)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@docly.com
```

---

## 📊 Features

### Admin Dashboard
- Total doctors count
- Pending doctor approvals
- Approved/Rejected doctors
- Patient statistics
- Appointment metrics

### Doctor Management
- View all doctors
- Search by name/email
- Filter by status/specialty/location
- View doctor profiles
- Approve doctor profiles
- Reject with reason
- Request changes

### Doctor Verification
- **Pending:** Review and approve/reject
- **Approved:** Doctor can see patients
- **Rejected:** Doctor cannot accept bookings
- **Request Changes:** Doctor can update and resubmit

---

## 🔐 Authentication

### Login Flow
1. Enter admin username/password
2. POST to `/api/auth/admin-login`
3. Receive JWT token
4. Token stored in localStorage
5. Included in all API requests

### Token Management
- Stored as `adminToken` in localStorage
- Sent as `Authorization: Bearer <token>`
- Auto-redirected to login if 401 response

---

## 📝 Common Tasks

### Run Locally
```bash
# Terminal 1: Backend
cd Docly/backend
npm run dev

# Terminal 2: Admin Portal
cd Docly-Admin-Portal
npm run dev

# Terminal 3: Public Frontend (optional)
cd Docly/frontend
npm run dev
```

### Build for Production
```bash
cd Docly-Admin-Portal
npm run build
# Output in dist/
```

### Type Check
```bash
npm run typecheck
```

### Deploy to Vercel
1. Create new Vercel project
2. Connect Admin Portal repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variables
6. Deploy

---

## 🐛 Troubleshooting

### Login Fails
- ✓ Backend running on port 5000?
- ✓ `VITE_API_URL` correct?
- ✓ Admin credentials in backend `.env`?

### CORS Errors
- ✓ Backend CORS allows localhost:3001?
- ✓ For dev, Vite proxy should work automatically

### Port Already in Use
- Change in `vite.config.ts`: `port: 3002`
- Or: `lsof -i :3001` and `kill <PID>`

### Build Fails
- `npm install` again
- `npm run typecheck` for type errors
- Check Node version (18+)

---

## 📊 Database Requirements

Add to `DoctorProfile` schema:
```typescript
verificationMessage?: string;
verificationUpdatedAt?: Date;
```

See `DATABASE_MIGRATION.md` for details.

---

## 📚 Documentation

| Document | Contents |
|----------|----------|
| `README.md` | Overview and features |
| `SETUP_GUIDE.md` | Detailed setup & deployment |
| `DATABASE_MIGRATION.md` | Schema updates |
| `IMPLEMENTATION_SUMMARY.md` | Complete summary |

---

## 🎯 Architecture Summary

```
Admin Portal (React)
       ↓
  API Client (Axios)
       ↓
Backend Endpoints
       ↓
MongoDB Database
```

---

## 🚢 Deployment URLs

### Development
- Admin Portal: `http://localhost:3001`
- Backend: `http://localhost:5000`
- Public Frontend: `http://localhost:3000`

### Production
- Admin Portal: `https://docly-admin-portal.vercel.app`
- Public Frontend: `https://docly.vercel.app`
- Backend: `https://api.docly.vercel.app` (or your URL)

---

## ✅ Pre-Launch Checklist

- [ ] Backend routes added and tested
- [ ] Admin Portal builds without errors
- [ ] Login works with correct credentials
- [ ] Dashboard loads and shows stats
- [ ] Doctor list displays
- [ ] Doctor verification works
- [ ] Public site still functions
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Environment variables set correctly

---

## 🔐 Security Quick Tips

1. Never commit `.env` with real credentials
2. Use strong admin password (production)
3. Admin credentials in environment variables (production)
4. CORS restricted to known origins
5. All routes protected except `/login`
6. JWT token validation on backend
7. No secrets in frontend code

---

## 📞 Quick Links

- Admin Login: `http://localhost:3001/login`
- Dashboard: `http://localhost:3001/dashboard`
- Doctors: `http://localhost:3001/doctors`
- Backend Health: `http://localhost:5000/api/health`

---

## 🎓 Learning Path

1. **Start:** Read `README.md`
2. **Setup:** Follow `SETUP_GUIDE.md`
3. **Deploy:** Check deployment section
4. **Troubleshoot:** Use this quick reference
5. **Advanced:** Review source code and `IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** 2026-08-29
**Version:** 1.0.0

For detailed information, see the full documentation in the project files.
